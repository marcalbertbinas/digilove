import React from 'react'

const FallingImg = ({ images }) => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {images.map((url, i) => {
      const randomX = (i * 20) % 85; 
      const randomSize = 180 + ((i * 47) % 120); // Big, viewable sizes
      const randomDelay = i * 0.8; 
      const randomDuration = 9 + (i % 4);

      return (
        <div
          key={i}
          className="absolute animate-falling-heart shadow-2xl"
          style={{
            left: `${randomX}%`,
            width: `${randomSize}px`,
            height: `${randomSize}px`,
            animationDelay: `${randomDelay}s`,
            animationDuration: `${randomDuration}s`,
            top: '-300px',
            // This creates the smooth rounded heart shape
            WebkitMaskImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>')`,
            maskImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>')`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            WebkitMaskSize: 'contain',
            maskSize: 'contain'
          }}
        >
          <img 
            src={url} 
            alt="memory"
            className="w-full h-full object-cover"
          />
        </div>
      );
    })}
  </div>
);

export default FallingImg