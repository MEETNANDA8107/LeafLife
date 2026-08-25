import React from 'react';

const LoadingState = ({ count = 3, type = 'card' }) => {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((_, idx) => (
          <div key={idx} className="bg-surface-container-lowest rounded-xl p-6 border border-surface-container animate-pulse flex flex-col gap-4">
            <div className="h-10 w-10 bg-surface-container rounded-full"></div>
            <div className="h-6 bg-surface-container rounded w-3/4"></div>
            <div className="h-4 bg-surface-container rounded w-1/2"></div>
            <div className="h-20 bg-surface-container rounded-lg w-full mt-2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="flex flex-col gap-4">
        {items.map((_, idx) => (
          <div key={idx} className="bg-surface-container-lowest rounded-xl p-4 border border-surface-container animate-pulse flex items-center gap-4">
            <div className="h-12 w-12 bg-surface-container rounded-lg"></div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-5 bg-surface-container rounded w-1/3"></div>
              <div className="h-4 bg-surface-container rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-pulse flex flex-col gap-3">
      {items.map((_, idx) => (
        <div key={idx} className="h-4 bg-surface-container rounded w-full"></div>
      ))}
    </div>
  );
};

export default LoadingState;
