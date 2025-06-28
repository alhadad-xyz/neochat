import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-xl'
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-10 h-10'
};

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt = 'Avatar', 
  fallback = 'A', 
  size = 'md', 
  className 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // Show image if src exists and no error
  if (src && !imageError) {
    return (
      <div className={cn(
        'relative rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700',
        sizeClasses[size],
        className
      )}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ display: imageLoading ? 'none' : 'block' }}
        />
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 animate-pulse">
            <div className="w-1/2 h-1/2 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        )}
      </div>
    );
  }

  // Show initials fallback if available
  if (fallback && fallback.trim()) {
    return (
      <div className={cn(
        'rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium',
        sizeClasses[size],
        className
      )}>
        {fallback.charAt(0).toUpperCase()}
      </div>
    );
  }

  // Show Bot icon as final fallback
  return (
    <div className={cn(
      'rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white',
      sizeClasses[size],
      className
    )}>
      <Bot className={iconSizes[size]} />
    </div>
  );
};
