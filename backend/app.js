require('dotenv').config();
const express = require('express');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
const { sendEmail } = require('./src/services/email');

const app = express();

// Configuração de CORS para produção
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL, 
        'https://capsula-tempo.vercel.app',
        'https://capsula-tempo-git-master-felipe0oliveira.vercel.app',
        'https://capsula-tempo-felipe0oliveira.vercel.app',
        'https://capsula-tempo-9pl5.vercel.app',
        'https://capsula-tempo-9p15-1p1e2d5yr.vercel.app',
        'https://capsula-tempo-ocjhqy80m-felipe-oliveiradev-projects-91d8d78.vercel.app'
      ] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middleware de segurança
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rotas de autenticação
app.use('/auth', require('./src/routes/auth'));
app.use('/messages', require('./src/routes/messages'));

// Supabase - usar a mesma instância do src/lib/supabase.js
const db = require('./src/lib/supabase');

// SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Rota removida - conflitava com a rota principal em src/routes/messages.js

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

// Rota de health check para o Render
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(process.env.PORT || 5000, () => {
  const port = process.env.PORT || 5000;
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ================= JOB DE ENVIO AUTOMÁTICO =====================
// Usar a mesma instância do Supabase do backend
const supabaseJob = require('./src/lib/supabase');

// Verificar se está usando a Service Role Key
console.log('=== VERIFICAÇÃO DA CHAVE SUPABASE ===');
console.log('SUPABASE_KEY (primeiros 20 chars):', process.env.SUPABASE_KEY?.substring(0, 20) + '...');
console.log('SUPABASE_KEY contém "service_role":', process.env.SUPABASE_KEY?.includes('service_role'));

async function processScheduledMessages() {
  console.log('=== JOB: INICIANDO PROCESSAMENTO ===');
  
  // Busca mensagens agendadas para agora ou antes, que ainda não foram enviadas (sent_at IS NULL)
  const { data: messages, error } = await supabaseJob
    .from('messages')
    .select('*')
    .lte('delivery_date', new Date().toISOString())
    .is('sent_at', null);

  if (error) {
    console.error('Erro ao buscar mensagens agendadas:', error.message);
    return;
  }

  console.log(`Encontradas ${messages?.length || 0} mensagens para processar`);

  for (const msg of messages) {
    try {
      console.log(`Processando mensagem ${msg.id} para usuário ${msg.user_id}`);
      
      // Busca o e-mail do usuário
      const { data: user, error: userError } = await supabaseJob
        .from('users')
        .select('email')
        .eq('id', msg.user_id)
        .single();
      if (userError || !user) {
        console.error('Usuário não encontrado para mensagem', msg.id);
        continue;
      }
      
      console.log(`Enviando e-mail para ${user.email}`);
      
      // Envia o e-mail
      await sendEmail({
        to: user.email,
        subject: 'Mensagem do seu eu do futuro',
        text: msg.content
      });
      
      console.log(`E-mail enviado, marcando como enviada...`);
      
      // Marca como enviada
      const { error: updateError } = await supabaseJob
        .from('messages')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', msg.id);
        
      if (updateError) {
        console.error('Erro ao marcar como enviada:', updateError);
        throw new Error(`Erro ao atualizar sent_at: ${updateError.message}`);
      }
      
      console.log('Mensagem enviada com sucesso para', user.email, 'msg id:', msg.id);
    } catch (err) {
      console.error('Erro ao enviar mensagem agendada:', err.message);
    }
  }
}

// Executa a cada minuto
setInterval(processScheduledMessages, 60 * 1000);

// Executar imediatamente para teste
console.log('Executando job imediatamente para teste...');
processScheduledMessages();