import React from 'react';

const EmptyState = ({ icon = 'inbox', message = 'No items found', actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-container-lowest rounded-xl border border-surface-container border-dashed">
      <div className="w-20 h-20 bg-surface-container text-on-surface/50 rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl">{icon}</span>
      </div>
      <p className="text-headline-sm font-bold text-on-surface mb-2">{message}</p>
      <p className="text-body-md text-on-surface/60 mb-6 max-w-sm">
        There is currently no data available to display here.
      </p>
      {onAction && actionLabel && (
        <button 
          onClick={onAction}
          className="px-6 py-2.5 border-2 border-primary text-primary hover:bg-primary/5 rounded-lg font-medium transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
