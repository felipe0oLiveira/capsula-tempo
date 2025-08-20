require('dotenv').config();
const express = require('express');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
const { sendEmail } = require('./src/services/email');

const app = express();

// Cache simples em memória para otimização
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Função para gerenciar cache
function getCached(key) {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data;
  }
  cache.delete(key);
  return null;
}

function setCached(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

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

// Middleware de performance - logging de tempo de resposta
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Rotas de autenticação
app.use('/auth', require('./src/routes/auth'));
app.use('/messages', require('./src/routes/messages'));

// Supabase - usar a mesma instância do src/lib/supabase.js
const db = require('./src/lib/supabase');

// SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

// Health check melhorado para o Render
app.get('/health', async (req, res) => {
  try {
    // Testa conexão com Supabase
    const { data, error } = await db.from('users').select('count').limit(1);
    
    const healthStatus = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: error ? 'ERROR' : 'OK',
      environment: process.env.NODE_ENV || 'development'
    };

    res.json(healthStatus);
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      error: error.message 
    });
  }
});

// Rota de status do sistema
app.get('/status', (req, res) => {
  res.json({
    cacheSize: cache.size,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(process.env.PORT || 5000, () => {
  const port = process.env.PORT || 5000;
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚡ Performance optimizations enabled`);
});

// ================= JOB DE ENVIO AUTOMÁTICO OTIMIZADO =====================
// Usar a mesma instância do Supabase do backend
const supabaseJob = require('./src/lib/supabase');

// Verificar se está usando a Service Role Key
console.log('=== VERIFICAÇÃO DA CHAVE SUPABASE ===');
console.log('SUPABASE_KEY (primeiros 20 chars):', process.env.SUPABASE_KEY?.substring(0, 20) + '...');
console.log('SUPABASE_KEY contém "service_role":', process.env.SUPABASE_KEY?.includes('service_role'));

// Cache para usuários para evitar queries repetidas
const userCache = new Map();

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

  // Processa mensagens em paralelo para melhor performance
  const promises = messages.map(async (msg) => {
    try {
      console.log(`Processando mensagem ${msg.id} para usuário ${msg.user_id}`);
      
      // Verifica cache primeiro
      let userEmail = userCache.get(msg.user_id);
      
      if (!userEmail) {
        // Busca o e-mail do usuário
        const { data: user, error: userError } = await supabaseJob
          .from('users')
          .select('email')
          .eq('id', msg.user_id)
          .single();
        
        if (userError || !user) {
          console.error('Usuário não encontrado para mensagem', msg.id);
          return;
        }
        
        userEmail = user.email;
        // Cache o email por 1 hora
        userCache.set(msg.user_id, userEmail);
        setTimeout(() => userCache.delete(msg.user_id), 60 * 60 * 1000);
      }
      
      console.log(`Enviando e-mail para ${userEmail}`);
      
      // Envia o e-mail de forma assíncrona
      sendEmail({
        to: userEmail,
        subject: 'Mensagem do seu eu do futuro',
        text: msg.content
      }).then(async () => {
        // Marca como enviada após envio bem-sucedido
        const { error: updateError } = await supabaseJob
          .from('messages')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', msg.id);
          
        if (updateError) {
          console.error('Erro ao marcar como enviada:', updateError);
        } else {
          console.log('Mensagem enviada com sucesso para', userEmail, 'msg id:', msg.id);
        }
      }).catch(err => {
        console.error('Erro ao enviar e-mail:', err.message);
      });
      
    } catch (err) {
      console.error('Erro ao processar mensagem agendada:', err.message);
    }
  });

  // Aguarda todas as mensagens serem processadas
  await Promise.all(promises);
}

// Executa a cada 2 minutos (otimizado)
setInterval(processScheduledMessages, 2 * 60 * 1000);

// Executar imediatamente para teste
console.log('Executando job imediatamente para teste...');
processScheduledMessages();