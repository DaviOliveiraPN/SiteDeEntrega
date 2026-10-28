import type { ContentService } from './contentService';
import { createMockContentService } from './mockContentService';

// The only place that picks the implementation. Later: `createApiContentService(import.meta.env.VITE_API_URL)`.
export const contentService: ContentService = createMockContentService();

export { ContentError, type ContentErrorCode, type ContentService } from './contentService';
