import React, { useState, useEffect } from 'react';
import { Flipbook } from './components/Flipbook';

// Import all images from the images folder
import image1 from './images/Armitage_External Lettings Brochure_AW.jpg';
import image2 from './images/Armitage_External Lettings Brochure_AW2.jpg';
import image3 from './images/Armitage_External Lettings Brochure_AW3.jpg';
import image4 from './images/Armitage_External Lettings Brochure_AW4.jpg';
import image5 from './images/Armitage_External Lettings Brochure_AW5.jpg';
import image6 from './images/Armitage_External Lettings Brochure_AW6.jpg';
import image7 from './images/Armitage_External Lettings Brochure_AW7.jpg';
import image8 from './images/Armitage_External Lettings Brochure_AW8.jpg';
import { PageImage } from './types';

const images = [image1, image2, image3, image4, image5, image6, image7, image8];

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<PageImage[]>([]);

  useEffect(() => {
    // Preload all images
    const preloadImages = async () => {
      const imagePromises = images.map((src, index) => {
        return new Promise<PageImage>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({ src, index });
          img.onerror = reject;
          img.src = src;
        });
      });

      try {
        const loaded = await Promise.all(imagePromises);
        setLoadedImages(loaded);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading images:', error);
        setIsLoading(false);
      }
    };

    preloadImages();
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Loading pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 overflow-hidden">
      <Flipbook pages={loadedImages} />
    </div>
  );
};

export default App;
