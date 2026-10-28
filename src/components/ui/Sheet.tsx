import { useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';

/** Full-screen modal layer: portal, focus trap, Esc, scroll lock, aria-modal. */
export function Sheet({
  label,
  onClose,
  className = '',
  inert = false,
  children,
}: {
  label: string;
  onClose: () => void;
  className?: string;
  inert?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, onClose);
  useScrollLock(true);

  return createPortal(
    <div ref={ref} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} inert={inert} className={`fixed inset-0 z-50 outline-none ${className}`}>
      {children}
    </div>,
    document.body,
  );
}
