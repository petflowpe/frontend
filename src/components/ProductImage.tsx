import { useState, useEffect } from 'react';
import { Package, Image as ImageIcon } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';

interface ProductImageProps {
  path?: string;
  alt: string;
  className?: string;
}

export function ProductImage({ path, alt, className }: ProductImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { getSignedUrl } = useInventory();

  useEffect(() => {
    let isMounted = true;

    const fetchUrl = async () => {
      if (!path) {
        setImageUrl(null);
        return;
      }
      
      // Si ya es una URL completa (http/https), usarla directamente (retrocompatibilidad)
      if (path.startsWith('http')) {
        setImageUrl(path);
        return;
      }

      setLoading(true);
      const url = await getSignedUrl(path);
      if (isMounted) {
        setImageUrl(url);
        setLoading(false);
      }
    };

    fetchUrl();

    return () => {
      isMounted = false;
    };
  }, [path]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse ${className}`}>
        <ImageIcon className="w-1/3 h-1/3 text-gray-300" />
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
        <Package className="w-1/3 h-1/3 text-gray-300" />
      </div>
    );
  }

  return (
    <img 
      src={imageUrl} 
      alt={alt} 
      className={`object-cover ${className}`}
      onError={() => setImageUrl(null)} 
    />
  );
}
