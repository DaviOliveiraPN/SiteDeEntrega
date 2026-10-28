import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { useInView } from '../../hooks/useInView';

/** Fades its content up the first time it scrolls into view (disabled by reduced motion in CSS). */
export function Reveal({
  as: Tag = 'div',
  className = '',
  delayMs = 0,
  ...props
}: ComponentPropsWithoutRef<'div'> & { as?: ElementType; delayMs?: number }) {
  const [ref, inView] = useInView<HTMLElement>();
  return <Tag ref={ref} data-visible={inView} className={`reveal ${className}`} style={{ transitionDelay: `${delayMs}ms` }} {...props} />;
}
