/**
 * OptimizedImage — Phase 9A
 *
 * Wrapper around next/image with:
 * - Skeleton placeholder during load
 * - fetchpriority="high" on LCP/hero images
 * - Graceful fallback on broken URLs
 * - Auto alt-text fallback
 */

'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  /** Mark as LCP/hero image — sets fetchpriority=high and disables lazy loading */
  priority?: boolean;
  /** Fallback src if the primary src fails */
  fallbackSrc?: string;
  /** Show skeleton placeholder while loading */
  skeleton?: boolean;
  /** Extra class for the wrapper div */
  containerClassName?: string;
}

export function OptimizedImage({
  src,
  alt,
  priority = false,
  fallbackSrc,
  skeleton = true,
  containerClassName,
  className,
  fill,
  width,
  height,
  ...rest
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const effectiveSrc = errored && fallbackSrc ? fallbackSrc : src;
  const effectiveAlt = alt || (typeof src === 'string' ? src.split('/').pop()?.split('.')[0] || '' : '');

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {skeleton && !loaded && (
        <div
          className={cn(
            'absolute inset-0 bg-muted animate-pulse rounded-inherit',
            fill ? 'inset-0' : undefined
          )}
          aria-hidden="true"
        />
      )}
      <Image
        src={effectiveSrc}
        alt={effectiveAlt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!errored && fallbackSrc) setErrored(true);
          setLoaded(true);
        }}
        className={cn(
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        {...rest}
      />
    </div>
  );
}

export default OptimizedImage;
