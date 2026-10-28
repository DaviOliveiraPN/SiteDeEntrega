import { useState } from 'react';
import { getSession, type Session } from '../lib/session';

/** Session for one delivery page. `null` means the guest must enter the code again. */
export function useSession(slug: string): Session | null {
  const [session] = useState(() => getSession(slug));
  return session;
}
