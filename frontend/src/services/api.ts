const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://capsula-tempo-dvdz.onrender.com';

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao fazer login');
  }

  return response.json();
}

export async function register(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao registrar');
  }

  return response.json();
}

// Buscar mensagens agendadas do usuário autenticado
export async function getMessages() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/messages`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao buscar mensagens');
  }
  const data = await response.json();
  // Converter os campos do backend para o formato esperado pelo frontend
  return data.map((msg: any) => ({
    id: msg.id,
    message: msg.content,
    scheduledFor: msg.delivery_date,
    status: msg.sent_at ? 'sent' : 'pending'
  }));
}

// Criar nova mensagem agendada
export async function createMessage(message: string, scheduledFor: string) {
  const token = localStorage.getItem('token');

  // DEBUG: Verificar valor do input
  console.log('=== DEBUG HORÁRIO ===');
  console.log('Valor do input:', scheduledFor);

  // Enviar exatamente o valor do input, sem conversão!
  const response = await fetch(`${API_BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content: message, delivery_date: scheduledFor }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao agendar mensagem');
  }
  return response.json();
}

// Editar mensagem existente
export async function updateMessage(id: string, message: string, scheduledFor: string) {
  const token = localStorage.getItem('token');

  // Enviar exatamente o valor do input, sem conversão!
  const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content: message, delivery_date: scheduledFor }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao atualizar mensagem');
  }
  return response.json();
}

// Deletar mensagem
export async function deleteMessage(id: string) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao deletar mensagem');
  }
  
  return response.json();
}