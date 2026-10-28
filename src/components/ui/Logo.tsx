import type { Business } from '../../types';

export function Logo({ business, className = '' }: { business: Pick<Business, 'name' | 'logoUrl'>; className?: string }) {
  return <img src={business.logoUrl} alt={business.name} className={`h-10 w-auto ${className}`} />;
}
