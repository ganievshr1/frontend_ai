import React from 'react';

interface EmptyStateProps {
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message = 'Начните новый диалог' }) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">💬</div>
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;