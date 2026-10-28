import { downloadZip } from 'client-zip';

export interface ZipEntry {
  url: string;
  name: string;
}

/**
 * Builds a ZIP in the browser. client-zip pulls files lazily from the async generator, so only
 * one file is fetched at a time; `onProgress` fires each time a file has been fully written.
 */
export async function buildZip(
  entries: ZipEntry[],
  onProgress: (done: number, total: number) => void,
  signal?: AbortSignal,
): Promise<Blob> {
  let done = 0;
  onProgress(0, entries.length);

  async function* files() {
    for (const entry of entries) {
      signal?.throwIfAborted();
      const response = await fetch(entry.url, { signal });
      if (!response.ok || !response.body) throw new Error(`Falha ao baixar ${entry.name} (HTTP ${response.status})`);
      const counted = response.body.pipeThrough(
        new TransformStream<Uint8Array, Uint8Array>({
          flush: () => onProgress(++done, entries.length),
        }),
      );
      yield { name: entry.name, input: counted, lastModified: new Date() };
    }
  }

  return downloadZip(files()).blob();
}
