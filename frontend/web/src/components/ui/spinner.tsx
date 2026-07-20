import React from 'react';

export function Spinner({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  const dotSizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Círculo exterior giratorio */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-indigo-500 animate-spin"></div>
        {/* Círculo interior giratorio en dirección opuesta */}
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 border-l-pink-500 animate-spin-reverse"></div>
        {/* Punto central pulso */}
        <div className={`absolute inset-0 flex items-center justify-center`}>
          <div className={`${dotSizes[size]} rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-ping`}></div>
          <div className={`absolute ${dotSizes[size]} rounded-full bg-gradient-to-r from-blue-500 to-indigo-500`}></div>
        </div>
      </div>
    </div>
  );
}
