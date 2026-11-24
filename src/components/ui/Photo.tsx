import { useState, type CSSProperties } from 'react';
import { photos, photoSrcSet, photoUrl, type PhotoKey } from '@/data/assets';
import { t } from '@/i18n';

interface Props {
  id: PhotoKey;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  alt?: string;
  style?: CSSProperties;
  reveal?: boolean;
  parallax?: number;
}

/**
 * Responsive photograph from the asset registry. Shows the image's dominant
 * tone while loading and degrades to a captioned tone block if it fails.
 */
export function Photo({ id, sizes = '100vw', className = '', imgClassName = '', priority, alt, style, reveal, parallax }: Props) {
  const asset = photos[id];
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  return (
    <div className={`frame ${className}`} style={{ backgroundColor: asset.tone, ...style }} data-reveal={reveal ? 'image' : undefined}>
      {state !== 'error' ? (
        <img
          src={photoUrl(asset, 1600)}
          srcSet={photoSrcSet(asset)}
          sizes={sizes}
          alt={t(alt ?? asset.alt)}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          // @ts-expect-error fetchpriority is valid HTML
          fetchpriority={priority ? 'high' : undefined}
          onLoad={() => setState('ready')}
          onError={() => setState('error')}
          data-parallax={parallax}
          className={`transition-opacity duration-700 ${state === 'ready' ? 'opacity-100' : 'opacity-0'} ${parallax ? 'scale-[1.18]' : ''} ${imgClassName}`}
          style={{ objectPosition: asset.focus }}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-end p-4">
          <span className="t-figure text-ink/50">{t(asset.alt)}</span>
        </div>
      )}
    </div>
  );
}
