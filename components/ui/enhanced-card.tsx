import React, { ReactNode } from 'react';
import { Card as BaseCard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const EnhancedCard = ({ 
  children, 
  className = '', 
  glassEffect = true,
  ...props 
}: {
  children: ReactNode;
  className?: string;
  glassEffect?: boolean;
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
      <CardContent className="p-0">
        {children}
      </CardContent>
    </BaseCard>
  );
};

export default EnhancedCard;