import type { ComponentProps } from 'react';
import { Link } from 'react-router';

type Variant = 'primary' | 'secondary';

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium tracking-wide transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60';

const variants: Record<Variant, string> = {
  primary: 'bg-cream text-ink hover:bg-paper',
  secondary: 'border border-cream/20 bg-charcoal/40 text-cream backdrop-blur-sm hover:border-cream/45 hover:bg-charcoal/60',
};

function buttonClass(variant: Variant = 'primary', extra = ''): string {
  return `${base} ${variants[variant]} ${extra}`;
}

export function Button({ variant = 'primary', className = '', ...props }: ComponentProps<'button'> & { variant?: Variant }) {
  return <button type="button" className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({ variant = 'primary', className = '', ...props }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}
