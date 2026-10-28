import type { PageContent } from '../../types';

/** A fictitious delivery. Plain-text codes exist only in the mock; the real API stores an HMAC. */
export interface MockPage {
  code: string;
  content: PageContent;
}
