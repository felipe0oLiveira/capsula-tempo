const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabase');

const router = express.Router();
const SECRET = process.env.SECRET_KEY || 'sua_chave_secreta';

// Cache para tokens e usuários
const tokenCache = new Map();
const userCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

// Função para gerenciar cache
function getCached(key, cache) {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data;
  }
  cache.delete(key);
  return null;
}

function setCached(key, data, cache) {
  cache.set(key, { data, timestamp: Date.now() });
}

// Middleware de validação
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Rota de registro de usuário
 * Endpoint: POST /auth/register
 * Body: { email: string, password: string }
 * Resposta: { message: string } ou { error: string }
 */
router.post('/register', async (req, res) => {
  const startTime = Date.now();
  const { email, password } = req.body;
  
  // Validação melhorada
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }
  
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Email inválido.' });
  }
  
  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    // Verifica se o usuário já existe (com cache)
    const cacheKey = `user_exists_${email}`;
    let existingUser = getCached(cacheKey, userCache);
    
    if (!existingUser) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();
      
      existingUser = user;
      setCached(cacheKey, user, userCache);
    }

    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já existe.' });
    }

    // Hash da senha com salt otimizado
    const password_hash = await bcrypt.hash(password, 12);

    const { error } = await supabase
      .from('users')
      .insert([{ email, password_hash }]);

    if (error) {
      console.error('Erro ao registrar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Registro bem-sucedido: ${email} (${duration}ms)`);
    
    res.status(201).json({ message: 'Usuário registrado com sucesso.' });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

/**
 * Rota de login de usuário
 * Endpoint: POST /auth/login
 * Body: { email: string, password: string }
 * Resposta: { token: string } ou { error: string }
 */
router.post('/login', async (req, res) => {
  const startTime = Date.now();
  const { email, password } = req.body;
  
  // Validação básica
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    // Verifica cache primeiro
    const cacheKey = `user_${email}`;
    let user = getCached(cacheKey, userCache);
    
    if (!user) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        return res.status(400).json({ error: 'Usuário não encontrado.' });
      }
      
      user = userData;
      setCached(cacheKey, user, userCache);
    }

    console.log('Usuário encontrado:', { id: user.id, email: user.email });

    // Verifica senha
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Senha inválida.' });
    }

    // Gera token com expiração otimizada
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        iat: Math.floor(Date.now() / 1000)
      }, 
      SECRET, 
      { expiresIn: '7d' } // Token válido por 7 dias
    );
    
    // Cache do token
    setCached(`token_${user.id}`, token, tokenCache);
    
    const duration = Date.now() - startTime;
    console.log(`✅ Login bem-sucedido: ${user.email} (${duration}ms)`);
    
    res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

/**
 * Rota de verificação de token
 * Endpoint: POST /auth/verify
 * Headers: { Authorization: Bearer <token> }
 * Resposta: { valid: boolean, user?: object } ou { error: string }
 */
router.post('/verify', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, SECRET);
    
    // Verifica cache
    const cachedToken = getCached(`token_${decoded.userId}`, tokenCache);
    if (cachedToken === token) {
      return res.json({ 
        valid: true, 
        user: { id: decoded.userId, email: decoded.email }
      });
    }

    res.json({ valid: false });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido.' });
  }
});

module.exports = router; 