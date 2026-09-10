import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getPlaceholderImage } from '../../utils/helpers';

export default function Gallery({ images = [], mosqueName = '' }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayImages = images.length > 0 ? images : [getPlaceholderImage(800, 600, mosqueName)];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  if (!displayImages.length) return null;

  return (
    <div>
      {/* Thumbnail grid */}
      <div className="grid grid-cols-4 gap-2">
        {displayImages.slice(0, 4).map((img, index) => (
          <button
            key={index}
            type="button"
            aria-label={`View photo ${index + 1} of ${mosqueName}`}
            onClick={() => { setSelectedImage(true); setCurrentIndex(index); }}
            className={`relative overflow-hidden rounded-lg cursor-pointer ${
              index === 3 && displayImages.length > 4 ? 'brightness-50' : ''
            }`}
          >
            <img
              src={img}
              alt={`${mosqueName} - Photo ${index + 1}`}
              className="w-full h-24 object-cover hover:scale-105 transition-transform"
              loading="lazy"
            />
            {index === 3 && displayImages.length > 4 && (
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                +{displayImages.length - 4}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close photo preview"
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full cursor-pointer"
          >
            <X size={24} />
          </button>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={handlePrev}
            className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full cursor-pointer"
          >
            <ChevronLeft size={24} />
          </button>
          <img
            src={displayImages[currentIndex]}
            alt={`${mosqueName} - Photo ${currentIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
          <button
            type="button"
            aria-label="Next photo"
            onClick={handleNext}
            className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full cursor-pointer"
          >
            <ChevronRight size={24} />
          </button>
          <div className="absolute bottom-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {currentIndex + 1} / {displayImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
