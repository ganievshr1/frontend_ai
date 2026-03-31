import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="error-message">
      <span className="error-icon">⚠️</span>
      <span className="error-text">{message}</span>
    </div>
  );
};

export default ErrorMessage;