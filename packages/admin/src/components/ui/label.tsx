import React from 'react';
import { cn } from '../../lib/utils';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none text-gray-900',
        className
      )}
      {...props}
    />
  );
}