'use client';

import * as React from 'react';

import { SmartImage as Image } from '@/components/shared/smart-image';
import { cn } from '@/lib/utils';

export type GalleryImage = { id: string; url: string; alt: string; blurDataUrl?: string | null };

export function ProductGallery({
  images,
  title,
  surfaceClass,
}: {
  images: GalleryImage[];
  title: string;
  surfaceClass?: string;
}) {
  const [active, setActive] = React.useState(0);
  const current = images[active];

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'relative aspect-[4/5] overflow-hidden rounded-3xl shadow-soft',
          surfaceClass ?? 'bg-muted',
        )}
      >
        {images.map((img, i) => (
          <Image
            key={img.id}
            src={img.url}
            alt={img.alt}
            fill
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 50vw"
            placeholder={img.blurDataUrl ? 'blur' : 'empty'}
            blurDataURL={img.blurDataUrl ?? undefined}
            aria-hidden={i !== active}
            className={cn(
              'object-cover transition-opacity duration-300',
              i === active ? 'opacity-100' : 'opacity-0',
            )}
          />
        ))}
        {!current ? (
          <p className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            Foto folgt
          </p>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div role="group" aria-label={`Bilder von ${title}`} className="grid grid-cols-4 gap-3">
          {images.slice(0, 4).map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Bild ${i + 1} von ${Math.min(images.length, 4)} anzeigen`}
              aria-pressed={i === active}
              className={cn(
                'relative aspect-square overflow-hidden rounded-2xl border-2 transition-[border-color,transform] duration-200 motion-safe:hover:-translate-y-0.5',
                surfaceClass ?? 'bg-muted',
                i === active ? 'border-primary' : 'border-transparent hover:border-input',
              )}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="(max-width: 1024px) 25vw, 12vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
