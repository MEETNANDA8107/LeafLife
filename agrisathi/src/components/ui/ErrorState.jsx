import React from 'react';

const ErrorState = ({ message = 'Something went wrong', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-surface-container-lowest rounded-xl border border-surface-container">
      <div className="w-16 h-16 bg-[#FFDAD6] text-[#BA1A1A] rounded-full flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-3xl">error</span>
      </div>
      <h3 className="text-headline-sm font-bold text-on-surface mb-2">Oops!</h3>
      <p className="text-body-lg text-on-surface/70 mb-6 max-w-md">
        {message}
      </p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
