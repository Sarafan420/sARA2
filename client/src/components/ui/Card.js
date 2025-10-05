import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  padding = 'md',
  shadow = 'sm',
  onClick,
  ...props 
}) => {
  const baseStyles = 'bg-white rounded-xl border border-gray-100 transition-all duration-200';
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };
  
  const hoverStyles = hover ? 'hover:shadow-lg hover:border-gray-200 cursor-pointer' : '';
  
  const motionProps = hover ? {
    whileHover: { y: -2 },
    whileTap: { y: 0 }
  } : {};

  const Component = hover || onClick ? motion.div : 'div';

  return (
    <Component
      onClick={onClick}
      className={`${baseStyles} ${paddings[padding]} ${shadows[shadow]} ${hoverStyles} ${className}`}
      {...(hover ? motionProps : {})}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
