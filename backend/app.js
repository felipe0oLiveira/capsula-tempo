require('dotenv').config();
const express = require('express');
const supabase = require('@supabase/supabase-js');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
const { sendEmail } = require('./src/services/email');

const app = express();
app.use(cors());
app.use(express.json());

// Rotas de autenticação
app.use('/auth', require('./src/routes/auth'));
app.use('/messages', require('./src/routes/messages'));

// Supabase
const db = supabase.createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_KEY
);

// SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Rota de exemplo
app.post('/messages', async (req, res) => {
  const { content, delivery_date, user_id } = req.body;
  const { data, error } = await db
    .from('messages')
    .insert([{ content, delivery_date, user_id }]);

  if (error) return res.status(500).json({ error });
  res.status(201).json(data);
});

// Rota de teste para envio de e-mail
app.post('/test-email', async (req, res) => {
  const { to, subject, text } = req.body;
  try {
    await sendEmail({ to, subject, text });
    res.json({ message: 'E-mail enviado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT || 5000, () => 
  console.log('Server running'));

// ================= JOB DE ENVIO AUTOMÁTICO =====================
const { createClient } = require('@supabase/supabase-js');
const dbJob = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function processScheduledMessages() {
  // Busca mensagens agendadas para agora ou antes, que ainda não foram enviadas (sent_at IS NULL)
  const { data: messages, error } = await dbJob
    .from('messages')
    .select('*')
    .lte('delivery_date', new Date().toISOString())
    .is('sent_at', null);

  if (error) {
    console.error('Erro ao buscar mensagens agendadas:', error.message);
    return;
  }

  for (const msg of messages) {
    try {
      // Busca o e-mail do usuário
      const { data: user, error: userError } = await dbJob
        .from('users')
        .select('email')
        .eq('id', msg.user_id)
        .single();
      if (userError || !user) {
        console.error('Usuário não encontrado para mensagem', msg.id);
        continue;
      }
      // Envia o e-mail
      await sendEmail({
        to: user.email,
        subject: 'Mensagem do seu eu do futuro',
        text: msg.content
      });
      // Marca como enviada
      await dbJob
        .from('messages')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', msg.id);
      console.log('Mensagem enviada para', user.email, 'msg id:', msg.id);
    } catch (err) {
      console.error('Erro ao enviar mensagem agendada:', err.message);
    }
  }
}

// Executa a cada minuto
setInterval(processScheduledMessages, 60 * 1000);