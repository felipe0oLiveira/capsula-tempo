import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageList from '../components/messages/MessageList';
import MessageForm from '../components/messages/MessageForm';
import EditMessageModal from '../components/messages/EditMessageModal';
import DeleteConfirmModal from '../components/messages/DeleteConfirmModal';
import { getMessages, createMessage, updateMessage, deleteMessage } from '../services/api';
import './Dashboard.css';

interface Message {
  id: string;
  message: string;
  scheduledFor: string;
  status?: 'pending' | 'sent';
}

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<Message | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showMessages, setShowMessages] = useState(false);
  const [showSentMessages, setShowSentMessages] = useState(false);
  const navigate = useNavigate();

  async function fetchMessages() {
    setLoading(true);
    setError('');
    try {
      console.log('Buscando mensagens...');
      const data = await getMessages();
      console.log('Mensagens recebidas:', data);
      setMessages(data);
    } catch (err: any) {
      console.error('Erro ao buscar mensagens:', err);
      setError(err.message || 'Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  // Limpar mensagens de sucesso após 3 segundos
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  async function handleCreate({ message, scheduledFor }: { message: string; scheduledFor: string }) {
    setCreating(true);
    setError('');
    try {
      await createMessage(message, scheduledFor);
      await fetchMessages();
      setSuccessMessage('Mensagem agendada com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro ao agendar mensagem');
    } finally {
      setCreating(false);
    }
  }

  function handleEditMessage(message: Message) {
    setEditingMessage(message);
  }

  function handleDeleteMessage(message: Message) {
    setDeletingMessage(message);
  }

  async function handleSaveEdit({ message, scheduledFor }: { message: string; scheduledFor: string }) {
    if (!editingMessage) return;
    
    setEditing(true);
    setError('');
    try {
      await updateMessage(editingMessage.id, message, scheduledFor);
      await fetchMessages();
      setEditingMessage(null);
      setSuccessMessage('Mensagem atualizada com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar mensagem');
    } finally {
      setEditing(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingMessage) return;
    
    setDeleting(true);
    setError('');
    try {
      console.log('Deletando mensagem:', deletingMessage.id);
      await deleteMessage(deletingMessage.id);
      console.log('Mensagem deletada, atualizando lista...');
      await fetchMessages();
      console.log('Lista atualizada');
      setDeletingMessage(null);
      setSuccessMessage('Mensagem deletada com sucesso!');
    } catch (err: any) {
      console.error('Erro ao deletar:', err);
      setError(err.message || 'Erro ao deletar mensagem');
    } finally {
      setDeleting(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/');
  }

  function toggleMessages() {
    setShowMessages(!showMessages);
  }

  const pendingMessagesList = messages.filter(msg => msg.status === 'pending');
  const sentMessagesList = messages.filter(msg => msg.status === 'sent');
  const totalMessages = messages.length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div style={{ 
            position: 'absolute', 
            top: '2rem', 
            right: '2rem',
            zIndex: 10
          }}>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                padding: '0.8rem 1.5rem',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>🚪</span>
              Sair
            </button>
          </div>
          
          <h1 className="dashboard-title">Cápsula do Tempo</h1>
          <p className="dashboard-subtitle">Suas mensagens para o futuro</p>
        </div>

        {/* Mensagens de Sucesso */}
        {successMessage && (
          <div style={{ 
            color: '#4caf50', 
            marginBottom: 16, 
            padding: '1rem', 
            background: 'rgba(76,175,80,0.1)', 
            borderRadius: '12px',
            border: '1px solid rgba(76,175,80,0.3)',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            ✅ {successMessage}
          </div>
        )}

        {/* Estatísticas */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-number">{totalMessages}</div>
            <div className="stat-label">Total de Mensagens</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{pendingMessagesList.length}</div>
            <div className="stat-label">Pendentes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{sentMessagesList.length}</div>
            <div className="stat-label">Enviadas</div>
          </div>
        </div>

        {/* Grid Principal */}
        <div className="dashboard-grid">
          {/* Formulário */}
          <div className="message-form-container">
            <h2 className="form-title">Nova Mensagem</h2>
            <MessageForm onSubmit={handleCreate} loading={creating} />
            {error && (
              <div style={{ 
                color: '#ff6b6b', 
                marginTop: 16, 
                padding: '0.8rem', 
                background: 'rgba(255,107,107,0.1)', 
                borderRadius: '8px',
                border: '1px solid rgba(255,107,107,0.3)'
              }}>
                {error}
              </div>
            )}
          </div>

          {/* Lista de Mensagens Agendadas */}
          <div className="messages-container">
            <div className="messages-header">
              <h2 className="messages-title">
                Mensagens Agendadas
                <span className="message-count">({pendingMessagesList.length})</span>
              </h2>
            </div>
            <div className="messages-content">
              <MessageList 
                messages={pendingMessagesList} 
                loading={loading}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                showDeleteButton={false}
              />
            </div>
          </div>

          {/* Lista de Mensagens Enviadas */}
          <div className="messages-container">
            <div className="messages-header clickable" onClick={() => setShowSentMessages(v => !v)}>
              <h2 className="messages-title">
                <span className="toggle-icon">{showSentMessages ? '▼' : '▶'}</span>
                Mensagens Enviadas
                <span className="message-count">({sentMessagesList.length})</span>
              </h2>
            </div>
            {showSentMessages && (
              <div className="messages-content">
                <MessageList 
                  messages={sentMessagesList} 
                  loading={loading}
                  onEditMessage={handleEditMessage}
                  onDeleteMessage={handleDeleteMessage}
                  showDeleteButton={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      <EditMessageModal
        isOpen={!!editingMessage}
        onClose={() => setEditingMessage(null)}
        onSave={handleSaveEdit}
        message={editingMessage}
        loading={editing}
      />

      {/* Modal de Confirmação de Deletar */}
      <DeleteConfirmModal
        isOpen={!!deletingMessage}
        onClose={() => setDeletingMessage(null)}
        onConfirm={handleConfirmDelete}
        message={deletingMessage}
        loading={deleting}
      />
    </div>
  );
} 