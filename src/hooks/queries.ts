import { useQuery } from '@tanstack/react-query';
import { contentService } from '../services';

export function useBusiness() {
  return useQuery({
    queryKey: ['business'],
    queryFn: () => contentService.getBusiness(),
    staleTime: Infinity,
  });
}

export function usePageContent(slug: string, token: string | null) {
  return useQuery({
    queryKey: ['page', slug, token],
    queryFn: () => contentService.getPageContent(slug, token!),
    enabled: token !== null,
    staleTime: 10 * 60_000,
    retry: false,
  });
}
