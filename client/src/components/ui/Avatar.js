import React from 'react';

const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  fallback,
  className = '',
  online = false,
  colorScheme = 'auto',
  ...props 
}) => {
  const sizes = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
    '2xl': 'h-20 w-20'
  };
  
  const statusSizes = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2', 
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-3.5 w-3.5',
    '2xl': 'h-4 w-4'
  };

  const fontWeightSizes = {
    xs: 'font-semibold',
    sm: 'font-semibold',
    md: 'font-bold',
    lg: 'font-bold',
    xl: 'font-bold',
    '2xl': 'font-bold'
  };

  const fontSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
    '2xl': 'text-xl'
  };

  // Predefined gradient color schemes
  const gradientSchemes = {
    'blue': 'bg-gradient-to-br from-blue-500 to-blue-700',
    'purple': 'bg-gradient-to-br from-purple-500 to-purple-700',
    'green': 'bg-gradient-to-br from-green-500 to-green-700',
    'orange': 'bg-gradient-to-br from-orange-500 to-orange-700',
    'pink': 'bg-gradient-to-br from-pink-500 to-pink-700',
    'teal': 'bg-gradient-to-br from-teal-500 to-teal-700',
    'red': 'bg-gradient-to-br from-red-500 to-red-700',
    'indigo': 'bg-gradient-to-br from-indigo-500 to-indigo-700',
    'gray': 'bg-gradient-to-br from-gray-500 to-gray-700'
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Auto-generate color scheme based on initials for consistent colors
  const getColorScheme = (initials, colorScheme) => {
    if (colorScheme !== 'auto') {
      return gradientSchemes[colorScheme] || gradientSchemes['blue'];
    }
    
    // Generate consistent color based on initials hash
    const charCodeSum = initials.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const schemes = Object.keys(gradientSchemes);
    return gradientSchemes[schemes[charCodeSum % schemes.length]];
  };

  return (
    <div className={`relative inline-block ${className}`} {...props}>
      {/* Убрали поддержку изображений - показываем только инициалы */}
      
      <div 
        className={`
          ${sizes[size]} 
          ${fontSizes[size]} 
          rounded-full 
          ${getColorScheme(getInitials(fallback || alt), colorScheme)}
          flex 
          items-center 
          justify-center 
          text-white 
          ${fontWeightSizes[size]} 
          font-sans 
          ring-2 
          ring-white 
          shadow-sm 
        `}
      >
        {getInitials(fallback || alt)}
      </div>
      
      {online && (
        <span 
          className={`absolute bottom-0 right-0 ${statusSizes[size]} bg-emerald-400 border-2 border-white rounded-full`}
        />
      )}
    </div>
  );
};

export default Avatar;
