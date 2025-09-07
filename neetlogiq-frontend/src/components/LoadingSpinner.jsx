import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary',
  text = 'Loading more colleges...',
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-blue-500',
    secondary: 'border-gray-500',
    green: 'border-green-500'
  };

  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]} 
          border-2 border-t-transparent 
          rounded-full 
          animate-spin
        `}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
