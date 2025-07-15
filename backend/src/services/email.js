const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Envia um e-mail usando o SendGrid
 * @param {string} to - E-mail do destinatário
 * @param {string} subject - Assunto do e-mail
 * @param {string} text - Corpo do e-mail (texto)
 * @param {string} html - Corpo do e-mail (HTML, opcional)
 */
async function sendEmail({ to, subject, text, html }) {
  // Personalização do corpo do e-mail
  const personalizedText = `Olá!

Aqui está sua mensagem do futuro:

"${text}"

---
Com carinho,
Seu Eu do Futuro

Se esta mensagem caiu no SPAM, marque como 'Não é SPAM' para garantir que as próximas cheguem na sua caixa de entrada.
Se você não reconhece este envio, ignore este e-mail.`;

  const personalizedHtml = `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <p>Olá!</p>
      <p>Aqui está sua mensagem do futuro:</p>
      <blockquote style="border-left: 4px solid #0074D9; margin: 1em 0; padding: 0.5em 1em; background: #f9f9f9;">${text}</blockquote>
      <hr/>
      <p style="margin-top: 2em;">Com carinho,<br/><b>Seu Eu do Futuro</b></p>
      <p style="font-size: 0.9em; color: #888;">Se esta mensagem caiu no SPAM, marque como <b>Não é SPAM</b> para garantir que as próximas cheguem na sua caixa de entrada.</p>
      <p style="font-size: 0.9em; color: #888;">Se você não reconhece este envio, apenas ignore este e-mail.</p>
    </div>
  `;

  const msg = {
    to,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL, // agora vem da variável de ambiente
      name: 'Seu Eu do Futuro'
    },
    subject,
    text: personalizedText,
    html: html || personalizedHtml,
    replyTo: process.env.SENDGRID_FROM_EMAIL
  };
  await sgMail.send(msg);
}

module.exports = { sendEmail }; 