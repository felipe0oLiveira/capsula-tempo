import React from 'react';

interface MessageCardProps {
  message: string;
  scheduledFor: string;
  status?: 'pending' | 'sent';
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function MessageCard({ 
  message, 
  scheduledFor, 
  status, 
  onEdit, 
  onDelete,
  canEdit = true,
  canDelete = false
}: MessageCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Exibir exatamente como está no banco, sem conversões
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isSent = status === 'sent';

  return (
    <div className="message-card">
      <div className="message-content">
        {message}
      </div>
      
      <div className="message-meta">
        <div className="message-date">
          {formatDate(scheduledFor)}
        </div>
        
        <div className="message-actions">
          {status && (
            <div className={`message-status ${status === 'sent' ? 'status-sent' : 'status-pending'}`}>
              {status === 'sent' ? 'Enviada' : 'Pendente'}
            </div>
          )}
          <div className="action-buttons">
            {/* Botão de editar só para mensagens não enviadas */}
            {canEdit && !isSent && (
              <button 
                className="action-btn edit-btn"
                onClick={onEdit}
                title="Editar mensagem"
              >
                ✏️
              </button>
            )}
            {/* Botão de deletar controlado por canDelete */}
            {canDelete && (
              <button 
                className="action-btn delete-btn"
                onClick={onDelete}
                title="Deletar mensagem"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 