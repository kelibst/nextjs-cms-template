"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import type { GalleryAlbum } from "@/lib/data";
import { getMediaUrl } from "@/lib/media-url";

interface GalleryClientProps {
  albums: GalleryAlbum[];
}

export function GalleryClient({ albums }: GalleryClientProps) {
  const [lightboxAlbum, setLightboxAlbum] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  function openLightbox(albumIndex: number, imageIndex: number) {
    setLightboxAlbum(albumIndex);
    setLightboxIndex(imageIndex);
  }

  function closeLightbox() {
    setLightboxAlbum(null);
  }

  const currentAlbum = lightboxAlbum !== null ? albums[lightboxAlbum] : null;

  return (
    <div className="space-y-16">
      {albums.map((album, albumIdx) => (
        <section key={album.albumSlug}>
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {album.albumTitle}
              </h2>
              {album.eventDate && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {new Date(album.eventDate).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "long",
                  })}
                </p>
              )}
            </div>
            <span className="shrink-0 text-sm text-muted-foreground">
              {album.images.length} photos
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {album.images.map((img, imgIdx) => {
              const src = getMediaUrl(img.url || `/images/${img.localPath}`);
              return (
                <button
                  key={imgIdx}
                  onClick={() => openLightbox(albumIdx, imgIdx)}
                  className="group relative aspect-4/3 overflow-hidden rounded-xl bg-primary-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Image
                    src={src}
                    alt={img.caption ?? `Photo ${imgIdx + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                    <svg
                      className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {/* Lightbox */}
      {currentAlbum && (
        <Lightbox
          open={lightboxAlbum !== null}
          close={closeLightbox}
          index={lightboxIndex}
          slides={currentAlbum.images.map((img) => ({
            src: getMediaUrl(img.url || img.localPath),
            title: img.caption ?? undefined,
            description: currentAlbum.albumTitle,
          }))}
          plugins={[Captions]}
          on={{
            view: ({ index }) => setLightboxIndex(index),
          }}
        />
      )}
    </div>
  );
}
