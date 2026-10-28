import { useState, type ComponentProps } from 'react';

export const FALLBACK_IMAGE = '/mock/fallback.jpg';

/** <img> that swaps to a local placeholder if the remote source fails (offline, CORS, CDN down). */
export function Img({ src, onError, ...props }: ComponentProps<'img'>) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed ? FALLBACK_IMAGE : src}
      onError={(event) => {
        if (!failed) setFailed(true);
        onError?.(event);
      }}
      {...props}
    />
  );
}
