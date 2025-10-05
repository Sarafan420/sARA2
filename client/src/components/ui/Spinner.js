import React from 'react';

const Spinner = ({ 
  size = 'md', 
  color = 'indigo',
  className = '',
  ...props 
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };
  
  const colors = {
    indigo: 'border-indigo-600',
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    green: 'border-green-600',
    red: 'border-red-600'
  };

  return (
    <div
      className={`
        animate-spin rounded-full border-2 border-gray-200 ${colors[color]} 
        ${sizes[size]} ${className}
      `}
      style={{ borderTopColor: 'transparent' }}
      {...props}
    />
  );
};

export default Spinner;
