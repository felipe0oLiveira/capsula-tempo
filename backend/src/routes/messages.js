const express = require('express');
const supabase = require('../lib/supabase');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Cache para mensagens e usuários
const messageCache = new Map();
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

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

// Middleware simples para autenticação JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido.' });
  const SECRET = process.env.SECRET_KEY || 'sua_chave_secreta';
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido.' });
    req.user = user;
    next();
  });
}

// Middleware de validação de data
function validateDeliveryDate(date) {
  const deliveryDate = new Date(date);
  const now = new Date();
  return deliveryDate > now;
}

/**
 * Rota para buscar mensagens do usuário autenticado
 */
router.get('/', authenticateToken, async (req, res) => {
  const startTime = Date.now();
  console.log('=== BACKEND: BUSCANDO MENSAGENS ===');
  console.log('User ID:', req.user.id || req.user.userId);
  
  // Aceita tanto 'id' quanto 'userId' como identificador do usuário
  const user_id = req.user.id || req.user.userId;
  if (!user_id) return res.status(400).json({ error: 'ID do usuário não encontrado no token.' });
  
  try {
    // Verifica cache primeiro
    const cacheKey = `messages_${user_id}`;
    let messages = getCached(cacheKey, messageCache);
    
    if (!messages) {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user_id)
        .order('delivery_date', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar mensagens:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
      }
      
      messages = data || [];
      setCached(cacheKey, messages, messageCache);
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Mensagens carregadas: ${messages.length} mensagens (${duration}ms)`);
    
    res.json(messages);
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

/**
 * Rota para criar uma nova mensagem para o futuro
 * Body: { content, delivery_date }
 */
router.post('/', authenticateToken, async (req, res) => {
  const startTime = Date.now();
  console.log('=== BACKEND: CRIANDO MENSAGEM ===');
  console.log('User ID:', req.user.id || req.user.userId);
  console.log('Content:', req.body.content);
  console.log('Delivery date recebida:', req.body.delivery_date);
  
  const user_id = req.user.id || req.user.userId;
  if (!user_id) return res.status(400).json({ error: 'ID do usuário não encontrado no token.' });
  
  const { content, delivery_date } = req.body;
  
  // Validação melhorada
  if (!content || !delivery_date) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
  }
  
  if (content.trim().length < 1) {
    return res.status(400).json({ error: 'Conteúdo da mensagem não pode estar vazio.' });
  }
  
  if (!validateDeliveryDate(delivery_date)) {
    return res.status(400).json({ error: 'Data de entrega deve ser no futuro.' });
  }

  try {
    console.log('Salvando no banco com delivery_date:', delivery_date);
    
    const { data, error } = await supabase
      .from('messages')
      .insert([{ user_id, content: content.trim(), delivery_date }])
      .select();

    if (error) {
      console.error('Erro ao salvar:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }

    // Limpa cache de mensagens
    const cacheKey = `messages_${user_id}`;
    messageCache.delete(cacheKey);

    const duration = Date.now() - startTime;
    console.log(`✅ Mensagem criada com sucesso! (${duration}ms)`);
    
    res.status(201).json({ 
      message: 'Mensagem salva com sucesso!',
      data: data[0]
    });
  } catch (error) {
    console.error('Erro ao criar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

/**
 * Rota para editar uma mensagem existente
 * Body: { content, delivery_date }
 */
router.put('/:id', authenticateToken, async (req, res) => {
  const startTime = Date.now();
  const user_id = req.user.id || req.user.userId;
  if (!user_id) return res.status(400).json({ error: 'ID do usuário não encontrado no token.' });
  
  const { id } = req.params;
  const { content, delivery_date } = req.body;
  
  // Validação melhorada
  if (!content || !delivery_date) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
  }
  
  if (content.trim().length < 1) {
    return res.status(400).json({ error: 'Conteúdo da mensagem não pode estar vazio.' });
  }
  
  if (!validateDeliveryDate(delivery_date)) {
    return res.status(400).json({ error: 'Data de entrega deve ser no futuro.' });
  }

  try {
    // Verifica se a mensagem pertence ao usuário
    const { data: existingMessage, error: checkError } = await supabase
      .from('messages')
      .select('id, sent_at')
      .eq('id', id)
      .eq('user_id', user_id)
      .single();

    if (checkError || !existingMessage) {
      return res.status(404).json({ error: 'Mensagem não encontrada.' });
    }

    // Não permite editar mensagens já enviadas
    if (existingMessage.sent_at) {
      return res.status(400).json({ error: 'Não é possível editar mensagens já enviadas.' });
    }

    const { data, error } = await supabase
      .from('messages')
      .update({ content: content.trim(), delivery_date })
      .eq('id', id)
      .eq('user_id', user_id)
      .select();

    if (error) {
      console.error('Erro ao atualizar:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }

    // Limpa cache de mensagens
    const cacheKey = `messages_${user_id}`;
    messageCache.delete(cacheKey);

    const duration = Date.now() - startTime;
    console.log(`✅ Mensagem atualizada com sucesso! (${duration}ms)`);

    res.json({ 
      message: 'Mensagem atualizada com sucesso!',
      data: data[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

/**
 * Rota para deletar uma mensagem
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  const startTime = Date.now();
  console.log('=== DELETE /messages/:id ===');
  console.log('User ID:', req.user.id || req.user.userId);
  console.log('Message ID:', req.params.id);
  
  const user_id = req.user.id || req.user.userId;
  if (!user_id) return res.status(400).json({ error: 'ID do usuário não encontrado no token.' });
  
  const { id } = req.params;
  const messageId = String(id);

  try {
    // Verificar se a mensagem existe e pertence ao usuário
    const { data: existingMessage, error: checkError } = await supabase
      .from('messages')
      .select('id, sent_at')
      .eq('id', messageId)
      .eq('user_id', user_id)
      .single();

    console.log('Verificação da mensagem:', { existingMessage, checkError });

    if (checkError || !existingMessage) {
      console.log('Mensagem não encontrada');
      return res.status(404).json({ error: 'Mensagem não encontrada ou não pertence ao usuário.' });
    }

    // Deletar a mensagem
    console.log('Tentando deletar mensagem...');
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    console.log('Resultado da deleção:', { error });

    if (error) {
      console.error('Erro ao deletar:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }

    // Limpa cache de mensagens
    const cacheKey = `messages_${user_id}`;
    messageCache.delete(cacheKey);

    const duration = Date.now() - startTime;
    console.log(`✅ Mensagem deletada com sucesso! (${duration}ms)`);
    
    res.json({ message: 'Mensagem deletada com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

/**
 * Rota para buscar estatísticas das mensagens
 */
router.get('/stats', authenticateToken, async (req, res) => {
  const startTime = Date.now();
  const user_id = req.user.id || req.user.userId;
  
  if (!user_id) return res.status(400).json({ error: 'ID do usuário não encontrado no token.' });
  
  try {
    const cacheKey = `stats_${user_id}`;
    let stats = getCached(cacheKey, messageCache);
    
    if (!stats) {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('sent_at, delivery_date')
        .eq('user_id', user_id);

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
      }

      const now = new Date();
      stats = {
        total: messages.length,
        sent: messages.filter(m => m.sent_at).length,
        pending: messages.filter(m => !m.sent_at && new Date(m.delivery_date) > now).length,
        overdue: messages.filter(m => !m.sent_at && new Date(m.delivery_date) <= now).length
      };
      
      setCached(cacheKey, stats, messageCache);
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Estatísticas carregadas (${duration}ms)`);
    
    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

module.exports = router; 