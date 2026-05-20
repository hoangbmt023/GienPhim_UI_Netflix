import { useState } from 'react';
import './ImageWithFallback.css';

export default function ImageWithFallback({ src, fallback, alt, className, wrapperClassName, onClick, ...props }) {
  // Track which src URL has finished loading – avoids useEffect race with onLoad
  const [loadedSrc, setLoadedSrc] = useState(null);

  const isLoaded = loadedSrc === src;

  return (
    <div className={`img-fallback-wrap ${wrapperClassName || ''} ${!isLoaded ? 'skeleton' : ''}`} onClick={onClick}>
      {src && (
        <img
          src={src}
          alt={alt}
          className={`img-fallback-inner ${className || ''} ${isLoaded ? 'loaded' : 'loading'}`}
          onLoad={() => setLoadedSrc(src)}
          onError={(e) => {
            if (fallback && e.currentTarget.src !== fallback) {
              e.currentTarget.src = fallback;
            } else {
              setLoadedSrc(src); // remove skeleton even on error
            }
          }}
          decoding="async"
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
}
