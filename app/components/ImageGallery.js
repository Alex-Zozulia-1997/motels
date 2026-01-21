'use client';

import { useState, useEffect, useCallback } from 'react';

export default function ImageGallery({ images, placeTitle }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const [imageLoading, setImageLoading] = useState({});

  const selectedImage = images[selectedIndex] || null;

  const goToNext = useCallback(() => {
    if (selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  }, [selectedIndex, images.length]);

  const goToPrevious = useCallback(() => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  }, [selectedIndex]);

  // No lightbox needed

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  if (images.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          📸 Images
        </h2>
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
          <div className="text-4xl mb-2">🖼️</div>
          <p>No images available</p>
        </div>
      </div>
    );
  }

  const handleImageError = (index, image) => {
    // Only log if image object has useful info
    if (image && (image.image_url || image.url || image.imageUrl || image.src)) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Image failed to load:', image);
      }
    }
    setImageErrors(prev => ({ ...prev, [index]: true }));
    setImageLoading(prev => ({ ...prev, [index]: false }));
  };

  const handleImageLoad = (index) => {
    setImageLoading(prev => ({ ...prev, [index]: false }));
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 h-full">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
        📸 Images ({images.length})
      </h2>
      <div className="gallery flex flex-col items-center h-full">
        <div className="relative w-full aspect-[16/9] flex items-center justify-center mb-2 max-w-full max-h-[400px]">
          <button
            className="gallery-arrow prev absolute left-0 top-1/2 -translate-y-1/2 px-4 py-2 text-3xl bg-white/80 hover:bg-white/90 rounded-full z-10"
            onClick={goToPrevious}
            disabled={selectedIndex === 0}
          >
            ‹
          </button>
          <img
            src={selectedImage?.image_url || selectedImage?.url || selectedImage?.imageUrl || selectedImage?.src}
            alt={`${placeTitle} - ${selectedIndex + 1}`}
            className="gallery-image active w-full h-full max-w-full max-h-[500px] object-contain rounded-lg shadow"
            loading="lazy"
            onError={() => handleImageError(selectedIndex, selectedImage)}
            onLoad={() => handleImageLoad(selectedIndex)}
          />
          {/* Overlay info at bottom */}
          <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white px-4 py-2 flex flex-col items-center z-20 rounded-b-lg">
            <div className="flex flex-wrap justify-center items-center text-xs mb-1 gap-2">
              {(selectedImage?.author_name || selectedImage?.authorName) && (
                <span>📷 {selectedImage.author_name || selectedImage.authorName}</span>
              )}
              {selectedImage?.category && (
                <span>Category: {selectedImage.category}</span>
              )}
              {selectedImage?.uploaded_at && (
                <span>Uploaded: {new Date(selectedImage.uploaded_at).toLocaleDateString()}</span>
              )}
            </div>
            <div className="gallery-counter text-sm mb-1">
              {selectedIndex + 1} / {images.length}
            </div>
            <div className="gallery-controls flex gap-2 mb-1">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  className={`gallery-dot w-3 h-3 rounded-full ${selectedIndex === idx ? 'bg-purple-400' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                  onClick={() => setSelectedIndex(idx)}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          </div>
          <button
            className="gallery-arrow next absolute right-0 top-1/2 -translate-y-1/2 px-4 py-2 text-3xl bg-white/80 hover:bg-white/90 rounded-full z-10"
            onClick={goToNext}
            disabled={selectedIndex === images.length - 1}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
