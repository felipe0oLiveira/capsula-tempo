require('dotenv').config();
const express = require('express');
const supabase = require('@supabase/supabase-js');
const sgMail = require('@sendgrid/mail');

const app = express();
app.use(cors());
app.use(express.json());

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

app.listen(process.env.PORT || 5000, () => 
  console.log('Server running'));