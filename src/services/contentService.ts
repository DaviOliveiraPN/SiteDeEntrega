import type { AccessResult, Business, PageContent } from '../types';

export interface ContentService {
  validateCode(code: string): Promise<AccessResult>;
  /** Rejects with a ContentError when the token is not valid for this slug or the page expired. */
  getPageContent(slug: string, token: string): Promise<PageContent>;
  getBusiness(): Promise<Business>;
}

export type ContentErrorCode = 'unauthorized' | 'expired' | 'not_found';

/** Error the real API will map from 401 / 410 / 404. */
export class ContentError extends Error {
  readonly code: ContentErrorCode;

  constructor(code: ContentErrorCode) {
    super(code);
    this.name = 'ContentError';
    this.code = code;
  }
}
