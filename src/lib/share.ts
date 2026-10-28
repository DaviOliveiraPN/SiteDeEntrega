export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed';

/** Web Share API on phones; copies the link elsewhere. */
export async function shareLink(data: { title: string; text: string; url: string }): Promise<ShareOutcome> {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
      // Fall through to copying (e.g. share not allowed in this context).
    }
  }
  try {
    await navigator.clipboard.writeText(data.url);
    return 'copied';
  } catch {
    return 'failed';
  }
}
