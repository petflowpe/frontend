import { useMemo } from 'react';
import { Package, Image as ImageIcon } from 'lucide-react';
import { publicStorageUrl } from '../utils/api/config';

interface ProductImageProps {
  path?: string;
  alt: string;
  className?: string;
}

export function ProductImage({ path, alt, className }: ProductImageProps) {
  const imageUrl = useMemo(() => publicStorageUrl(path), [path]);

  if (!path) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
        <Package className="w-1/3 h-1/3 text-gray-300" />
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
        <ImageIcon className="w-1/3 h-1/3 text-gray-300" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`object-cover ${className}`}
      loading="lazy"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}
