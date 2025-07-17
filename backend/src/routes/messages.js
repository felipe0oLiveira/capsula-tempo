const express = require('express');
const supabase = require('../lib/supabase');
const jwt = require('jsonwebtoken');
const router = express.Router();

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

/**
 * Rota para buscar mensagens do usuário autenticado
 */
router.get('/', authenticateToken, async (req, res) => {
  console.log('=== BACKEND: BUSCANDO MENSAGENS ===');
  console.log('User ID:', req.user.id || req.user.userId);
  
  // Aceita tanto 'id' quanto 'userId' como identificador do usuário
  const user_id = req.user.id || req.user.userId;
  if (!user_id) return res.status(400).json({ error: 'ID do usuário não encontrado no token.' });
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', user_id)
    .order('delivery_date', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  
  console.log('Mensagens encontradas:', data?.map(msg => ({
    id: msg.id,
    content: msg.content,
    delivery_date: msg.delivery_date
  })));
  
  res.json(data || []);
});

/**
 * Rota para criar uma nova mensagem para o futuro
 * Body: { content, delivery_date }
 */
router.post('/', authenticateToken, async (req, res) => {
  console.log('=== BACKEND: CRIANDO MENSAGEM ===');
  console.log('User ID:', req.user.id || req.user.userId);
  console.log('Content:', req.body.content);
  console.log('Delivery date recebida:', req.body.delivery_date);
  
  const user_id = req.user.id || req.user.userId;
  if (!user_id) return res.status(400).json({ error: 'ID do usuário não encontrado no token.' });
  const { content, delivery_date } = req.body;
  if (!content || !delivery_date) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
  }

  console.log('Salvando no banco com delivery_date:', delivery_date);
  
  const { error } = await supabase
    .from('messages')
    .insert([{ user_id, content, delivery_date }]);

  if (error) {
    console.error('Erro ao salvar:', error);
    return res.status(500).json({ error: error.message });
  }

  console.log('Mensagem salva com sucesso!');
  res.status(201).json({ message: 'Mensagem salva com sucesso!' });
});

/**
 * Rota para editar uma mensagem existente
 * Body: { content, delivery_date }
 */
router.put('/:id', authenticateToken, async (req, res) => {
  const user_id = req.user.id || req.user.userId;
  if (!user_id) return res.status(400).json({ error: 'ID do usuário não encontrado no token.' });
  
  const { id } = req.params;
  const { content, delivery_date } = req.body;
  
  if (!content || !delivery_date) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
  }

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

  const { error } = await supabase
    .from('messages')
    .update({ content, delivery_date })
    .eq('id', id)
    .eq('user_id', user_id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: 'Mensagem atualizada com sucesso!' });
});

/**
 * Rota para deletar uma mensagem
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  console.log('=== DELETE /messages/:id ===');
  console.log('User ID:', req.user.id || req.user.userId);
  console.log('Message ID:', req.params.id);
  
  const user_id = req.user.id || req.user.userId;
  if (!user_id) return res.status(400).json({ error: 'ID do usuário não encontrado no token.' });
  
  const { id } = req.params;
  const messageId = String(id);

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

  // Não permite deletar mensagens já enviadas
  // if (existingMessage.sent_at) {
  //   console.log('Tentativa de deletar mensagem já enviada');
  //   return res.status(400).json({ error: 'Não é possível deletar mensagens já enviadas.' });
  // }

  // Deletar a mensagem
  console.log('Tentando deletar mensagem...');
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);

  console.log('Resultado da deleção:', { error });

  if (error) {
    console.error('Erro ao deletar:', error);
    return res.status(500).json({ error: error.message });
  }

  // Verificar se a mensagem foi realmente deletada
  console.log('Verificando se a mensagem foi realmente deletada...');
  const { data: checkMessageAfterDelete, error: checkErrorAfterDelete } = await supabase
    .from('messages')
    .select('id')
    .eq('id', messageId)
    .single();

  console.log('Verificação pós-deleção:', { checkMessageAfterDelete, checkErrorAfterDelete });

  if (checkMessageAfterDelete) {
    console.log('ERRO: Mensagem ainda existe após tentativa de deleção!');
    console.log('Isso pode ser devido a políticas RLS do Supabase');
    
    // Tentar uma abordagem alternativa: soft delete
    console.log('Tentando soft delete...');
    const { error: softDeleteError } = await supabase
      .from('messages')
      .update({ 
        content: '[MENSAGEM DELETADA]',
        delivery_date: new Date('1970-01-01').toISOString() // Data muito antiga
      })
      .eq('id', messageId)
      .eq('user_id', user_id);
    
    console.log('Resultado do soft delete:', { softDeleteError });
    
    if (softDeleteError) {
      return res.status(500).json({ error: 'Falha ao deletar mensagem. Verifique as permissões do Supabase.' });
    }
    
    console.log('Soft delete realizado com sucesso');
    return res.json({ message: 'Mensagem marcada como deletada!' });
  }

  console.log('Mensagem deletada com sucesso!');
  res.json({ message: 'Mensagem deletada com sucesso!' });
});

module.exports = router; 