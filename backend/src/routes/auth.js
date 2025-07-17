const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabase');

const router = express.Router();
const SECRET = process.env.SECRET_KEY || 'sua_chave_secreta';

/**
 * Rota de registro de usuário
 * Endpoint: POST /auth/register
 * Body: { email: string, password: string }
 * Resposta: { message: string } ou { error: string }
 */
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

  // Verifica se o usuário já existe
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser) return res.status(400).json({ error: 'Usuário já existe.' });

  const password_hash = await bcrypt.hash(password, 10);

  const { error } = await supabase
    .from('users')
    .insert([{ email, password_hash }]);

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ message: 'Usuário registrado com sucesso.' });
});

/**
 * Rota de login de usuário
 * Endpoint: POST /auth/login
 * Body: { email: string, password: string }
 * Resposta: { token: string } ou { error: string }
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (!user) return res.status(400).json({ error: 'Usuário não encontrado.' });

  console.log('Usuário encontrado:', { id: user.id, email: user.email });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Senha inválida.' });

  const token = jwt.sign({ userId: user.id, email: user.email }, SECRET, { expiresIn: '1d' });
  console.log('Token gerado com userId:', user.id);
  res.json({ token });
});

module.exports = router; 