import React from 'react';
import { Card as BaseCard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const EnhancedCard = ({ 
  children, 
  className = '', 
  glassEffect = true,
  ...props 
}) => {
  return (
    <BaseCard 
      className={`
        overflow-hidden
        ${glassEffect ? 'glass-card' : 'bg-card'}
        border border-white/10
        shadow-xl
        hover:shadow-2xl
        transition-all
        duration-300
        ${className}
      `}
      {...props}
    >
      <CardContent className="p-6">
        {children}
      </CardContent>
    </BaseCard>
  );
};

export default EnhancedCard;