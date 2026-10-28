import type { ComponentProps } from 'react';

export function Eyebrow({ className = '', ...props }: ComponentProps<'p'>) {
  return <p className={`eyebrow text-accent ${className}`} {...props} />;
}
