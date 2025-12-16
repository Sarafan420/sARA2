import React from 'react';

const Tag = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  onRemove,
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-md transition-colors';
  
  const variants = {
    default: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    primary: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
    success: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    warning: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200',
    blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    pink: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
    green: 'bg-green-100 text-green-700 hover:bg-green-200',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50'
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1.5 inline-flex items-center justify-center rounded-full hover:bg-current hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-1"
          aria-label="Удалить тег"
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Tag;

