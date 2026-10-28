// `<a download>` only works for same-origin URLs; cross-origin files (CDN, picsum, later R2)
// are fetched into a Blob first so the browser saves them instead of navigating.

export function saveBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  clickLink(url, name);
  // Safari needs the URL alive for a moment after the click.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function clickLink(href: string, name: string): void {
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  a.rel = 'noopener';
  document.body.append(a);
  a.click();
  a.remove();
}

function isSameOrigin(url: string): boolean {
  return new URL(url, location.href).origin === location.origin;
}

export async function downloadFile(url: string, name: string, signal?: AbortSignal): Promise<void> {
  if (isSameOrigin(url)) {
    clickLink(url, name);
    return;
  }
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    saveBlob(await response.blob(), name);
  } catch (error) {
    if (signal?.aborted) throw error;
    // Last resort: open the file; the user can save it from the viewer.
    window.open(url, '_blank', 'noopener');
  }
}

/** Fallback when a ZIP can't be built (e.g. memory limits on iPhone): one download at a time. */
export async function downloadSequentially(
  files: { url: string; name: string }[],
  onProgress?: (done: number, total: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  for (const [i, file] of files.entries()) {
    signal?.throwIfAborted();
    await downloadFile(file.url, file.name, signal);
    onProgress?.(i + 1, files.length);
    // Browsers block bursts of downloads; a short pause keeps them flowing.
    await new Promise((r) => setTimeout(r, 400));
  }
}
