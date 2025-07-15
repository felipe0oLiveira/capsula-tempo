const express = require('express');
const supabase = require('../lib/supabase');
const router = express.Router();

/**
 * Rota para criar uma nova mensagem para o futuro
 * Body: { user_id, content, delivery_date }
 */
router.post('/', async (req, res) => {
  const { user_id, content, delivery_date } = req.body;
  if (!user_id || !content || !delivery_date) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
  }

  const { error } = await supabase
    .from('messages')
    .insert([{ user_id, content, delivery_date }]);

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ message: 'Mensagem salva com sucesso!' });
});

module.exports = router; 