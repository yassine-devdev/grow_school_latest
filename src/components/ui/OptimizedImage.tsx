'use client';

import React from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  alt: string;
  fallback?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  fallback = '/images/placeholder.svg',
  loading = 'lazy',
  priority = false,
  className,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = React.useState(src);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (fallback && imgSrc !== fallback) {
      setImgSrc(fallback);
    }
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      <Image
        src={imgSrc}
        alt={alt}
        loading={loading}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          hasError && 'opacity-50'
        )}
        {...props}
      />
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
          Image not available
        </div>
      )}
    </div>
  );
}

// Preset configurations for common use cases
export function AvatarImage({ src, alt, size = 40, ...props }: OptimizedImageProps & { size?: number }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full', props.className)}
      priority={false}
      {...props}
    />
  );
}

export function HeroImage({ src, alt, ...props }: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      priority={true}
      loading="eager"
      className={cn('w-full h-auto', props.className)}
      {...props}
    />
  );
}

export function ThumbnailImage({ src, alt, ...props }: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={150}
      height={150}
      className={cn('rounded-lg object-cover', props.className)}
      {...props}
    />
  );
}