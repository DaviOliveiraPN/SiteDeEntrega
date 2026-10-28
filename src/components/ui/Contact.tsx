import type { Business } from '../../types';

function whatsappLink(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}`;
}

function instagramLink(handle: string): string {
  return `https://instagram.com/${handle.replace(/^@/, '')}`;
}

/** Business contact links, used on the home, expired screen and closing footer. */
export function Contact({ contact, className = '' }: { contact: Business['contact']; className?: string }) {
  const links = [
    contact.whatsapp && { label: 'WhatsApp', href: whatsappLink(contact.whatsapp) },
    contact.email && { label: contact.email, href: `mailto:${contact.email}` },
    contact.instagram && { label: contact.instagram, href: instagramLink(contact.instagram) },
  ].filter((l): l is { label: string; href: string } => Boolean(l));

  return (
    <ul className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-cream/70 ${className}`}>
      {links.map((link) => (
        <li key={link.href}>
          <a href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-cream hover:underline">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
