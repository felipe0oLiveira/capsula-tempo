import React from 'react';
import MessageCard from './MessageCard';

interface Message {
  id: string;
  message: string;
  scheduledFor: string;
  status?: 'pending' | 'sent';
}

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  onEditMessage: (message: Message) => void;
  onDeleteMessage: (message: Message) => void;
  showDeleteButton?: boolean;
}

export default function MessageList({ 
  messages, 
  loading, 
  onEditMessage, 
  onDeleteMessage,
  showDeleteButton = false
}: MessageListProps) {
  if (loading) {
    return (
      <div className="message-list-loading">
        <div className="loading-spinner">⏳</div>
        <p>Carregando mensagens...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="message-list-empty" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 180,
        background: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        boxShadow: '0 2px 12px 0 rgba(124,58,237,0.07)',
        margin: '1rem 0',
        padding: '2rem 1rem'
      }}>
        <div className="empty-icon" style={{
          fontSize: 48,
          marginBottom: 12,
          color: '#7c3aed',
          background: 'rgba(124,58,237,0.08)',
          borderRadius: '50%',
          width: 64,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto'
        }}>
          <span role="img" aria-label="empty">📭</span>
        </div>
        <div style={{
          textAlign: 'center',
          color: '#444',
          fontWeight: 500,
          fontSize: 18,
          marginBottom: 4
        }}>
          Nenhuma mensagem agendada ainda.
        </div>
        <div style={{
          textAlign: 'center',
          color: '#483D8B', // Roxo de destaque
          fontSize: 16,
          fontWeight: 600,
          marginTop: 4,
          textShadow: '0 1px 6px rgba(237, 58, 198, 0.1)'
        }}>
          Crie sua primeira mensagem para o futuro!
        </div>
      </div>
    );
  }

  // Ordenar mensagens por data de agendamento (mais recentes primeiro)
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime()
  );

  return (
    <div className="message-list">
      {sortedMessages.map((message) => (
        <MessageCard
          key={message.id}
          message={message.message}
          scheduledFor={message.scheduledFor}
          status={message.status}
          onEdit={() => onEditMessage(message)}
          onDelete={() => onDeleteMessage(message)}
          canEdit={message.status !== 'sent'}
          canDelete={showDeleteButton}
        />
      ))}
    </div>
  );
} 