'use client';

import { useState, useEffect, useCallback } from 'react';

export default function ImageGallery({ images, placeTitle }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [imageLoading, setImageLoading] = useState({});

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  const goToNext = useCallback(() => {
    if (selectedIndex !== null && selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  }, [selectedIndex, images.length]);

  const goToPrevious = useCallback(() => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  }, [selectedIndex]);

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null) return;
      
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'Escape') {
        closeLightbox();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, goToNext, goToPrevious, closeLightbox]);

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
    <>
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          📸 Images ({images.length})
        </h2>
        
        <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
          {images.map((image, index) => {
            const imageUrl = image.image_url || image.url || image.imageUrl || image.src;
            
            return (
              <div 
                key={index} 
                className="relative aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => !imageErrors[index] && setSelectedIndex(index)}
              >
                {!imageErrors[index] ? (
                  <>
                    {imageLoading[index] !== false && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <img
                      src={imageUrl}
                      alt={`${placeTitle} - Image ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onLoad={() => handleImageLoad(index)}
                      onError={() => handleImageError(index, image)}
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🖼️</div>
                      <div className="text-xs">Image not available</div>
                    </div>
                  </div>
                )}
              
                {/* Overlay on hover */}
                {!imageErrors[index] && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-white text-2xl transition-opacity">
                      🔍
                    </span>
                  </div>
                )}

                {/* Author info */}
                {(image.author_name || image.authorName) && !imageErrors[index] && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2">
                    📷 {image.author_name || image.authorName}
                  </div>
                )}

                {/* Category badge */}
                {image.category && !imageErrors[index] && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-purple-600/90 text-white text-xs rounded">
                    {image.category}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Previous Button */}
          {selectedIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-2xl transition-colors z-10"
            >
              ←
            </button>
          )}

          {/* Next Button */}
          {selectedIndex < images.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-2xl transition-colors z-10"
            >
              →
            </button>
          )}

          <div className="relative max-w-7xl max-h-screen">
            {/* Close button and counter */}
            <div className="absolute -top-12 left-0 right-0 flex justify-between items-center text-white">
              <span className="text-sm">{selectedIndex + 1} / {images.length}</span>
              <button
                onClick={closeLightbox}
                className="text-xl hover:text-zinc-300 px-4 py-2"
              >
                ✕ Close
              </button>
            </div>

            {/* Image */}
            <img
              src={selectedImage.image_url || selectedImage.url || selectedImage.imageUrl || selectedImage.src}
              alt={placeTitle}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Image info */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4 rounded-b-lg">
              <div className="flex justify-between items-start">
                <div>
                  {(selectedImage.author_name || selectedImage.authorName) && (
                    <p className="font-semibold mb-1">
                      📷 {selectedImage.author_name || selectedImage.authorName}
                    </p>
                  )}
                  {selectedImage.category && (
                    <p className="text-sm text-zinc-300">
                      Category: {selectedImage.category}
                    </p>
                  )}
                  {selectedImage.uploaded_at && (
                    <p className="text-sm text-zinc-400">
                      Uploaded: {new Date(selectedImage.uploaded_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {selectedImage.author_url && (
                  <a
                    href={selectedImage.author_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Profile →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
