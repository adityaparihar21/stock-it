import React from 'react';

const ToastContainer = ({ toasts }) => {
  return (
    <div className="toast-container-root">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type} show`}
          style={{
            position: 'relative',
            bottom: 'auto',
            right: 'auto',
            transform: 'none',
            marginBottom: '0.5rem'
          }}
        >
          <i
            className={`fa-solid ${
              t.type === 'success'
                ? 'fa-circle-check'
                : t.type === 'error'
                ? 'fa-triangle-exclamation'
                : 'fa-circle-info'
            }`}
          ></i>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
