import React from 'react';
import { cn } from '@/lib/utils';
import { CardProps } from '@/types';

const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  subtitle,
  footer,
  padding = 'md',
  ...props
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 shadow-sm',
        className
      )}
      {...props}
    >
      {(title || subtitle) && (
        <div className={cn(paddingClasses[padding], 'border-b border-gray-200')}>
          {title && (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      )}
      
      <div className={cn(paddingClasses[padding])}>
        {children}
      </div>
      
      {footer && (
        <div className={cn(paddingClasses[padding], 'border-t border-gray-200 bg-gray-50 rounded-b-lg')}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;