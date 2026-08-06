import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { useAuth } from '../context/AuthContext';

export interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  area?: string;
  type: 'product' | 'service';
  price: number;
  stock: number;
  cost: number;
  pricing?: any;
  breedExceptions?: any[];
  pricingBySize?: boolean;
  duration?: number;
  active?: boolean;
  includes?: string[];
  description?: string;
}

// Convertir formato backend a frontend
const fromBackendFormat = (backendProduct: any): Product => {
  const metadata = backendProduct.metadata && typeof backendProduct.metadata === 'object' ? backendProduct.metadata : {};
  return {
    id: backendProduct.id,
    code: backendProduct.code || backendProduct.sku || '',
    name: backendProduct.name || '',
    category: backendProduct.category?.name || backendProduct.category_id?.toString() || '',
    area: backendProduct.area?.name || metadata.area || '',
    type: backendProduct.item_type === 'SERVICIO' ? 'service' : 'product',
    price: parseFloat(backendProduct.sale_price ?? backendProduct.unit_price) || 0,
    stock: backendProduct.stock?.quantity ?? backendProduct.stock ?? 0,
    cost: parseFloat(backendProduct.cost_price) || 0,
    active: backendProduct.active !== false,
    description: backendProduct.description || '',
    pricing: metadata.pricing ?? backendProduct.pricing,
    pricingBySize: metadata.pricingBySize ?? backendProduct.pricingBySize,
    breedExceptions: metadata.breedExceptions ?? backendProduct.breedExceptions ?? [],
    includes: metadata.includes ?? backendProduct.includes ?? [],
    duration: metadata.duration ?? backendProduct.duration,
  };
};

// Fallback data (Hardcoded for demo purposes/initialization)
const DEFAULT_SERVICES: Product[] = [
  { 
    id: 1, 
    code: 'BA-BAÑ-001', 
    name: 'Baño Completo', 
    category: 'Higiene', 
    type: 'service',
    price: 30,
    stock: 999,
    cost: 10,
    pricingBySize: true,
    pricing: {
      toy: { price: 30, cost: 10, duration: 25 },
      small: { price: 35, cost: 12, duration: 30 },
      medium: { price: 45, cost: 15, duration: 45 },
      large: { price: 65, cost: 22, duration: 75 },
      xlarge: { price: 95, cost: 35, duration: 120 }
    },
    breedExceptions: [
      { breed: 'Poodle', type: 'multiplier', value: 1.3, note: 'Pelo rizado requiere más trabajo' },
      { breed: 'Shih Tzu', type: 'multiplier', value: 1.2, note: 'Pelo largo con nudos frecuentes' },
      { breed: 'Yorkshire', type: 'fixed', value: 55, note: 'Precio fijo por delicadeza' },
      { breed: 'Husky', type: 'extraTime', value: 20, note: 'Doble capa de pelo' }
    ],
    includes: ['Champú premium', 'Acondicionador', 'Secado', 'Cepillado', 'Perfume']
  },
  { 
    id: 2, 
    code: 'CO-PEL-001', 
    name: 'Corte de Pelo', 
    category: 'Estética', 
    type: 'service',
    price: 35,
    stock: 999,
    cost: 12,
    pricingBySize: true,
    pricing: {
      toy: { price: 35, cost: 12, duration: 30 },
      small: { price: 40, cost: 15, duration: 40 },
      medium: { price: 50, cost: 18, duration: 60 },
      large: { price: 75, cost: 28, duration: 90 },
      xlarge: { price: 110, cost: 40, duration: 150 }
    },
    breedExceptions: [
      { breed: 'Poodle', type: 'multiplier', value: 1.5, note: 'Corte específico de raza' },
      { breed: 'Schnauzer', type: 'multiplier', value: 1.4, note: 'Corte técnico especializado' }
    ]
  },
  { 
    id: 3, 
    code: 'BA-COR-001', 
    name: 'Baño + Corte Completo', 
    category: 'Completo', 
    type: 'service',
    price: 55,
    stock: 999,
    cost: 20,
    pricingBySize: true,
    pricing: {
      toy: { price: 55, cost: 20, duration: 50 },
      small: { price: 65, cost: 25, duration: 65 },
      medium: { price: 85, cost: 32, duration: 95 },
      large: { price: 120, cost: 48, duration: 150 },
      xlarge: { price: 180, cost: 70, duration: 240 }
    },
    breedExceptions: [
      { breed: 'Poodle', type: 'multiplier', value: 1.4, note: 'Servicio completo especializado' },
      { breed: 'Shih Tzu', type: 'multiplier', value: 1.25, note: 'Requiere más tiempo' }
    ]
  },
  { 
    id: 4, 
    code: 'HI-UÑA-001', 
    name: 'Corte de Uñas', 
    category: 'Higiene', 
    type: 'service',
    price: 15,
    stock: 999,
    cost: 3,
    pricingBySize: false,
    pricing: {
      toy: { price: 15, cost: 3, duration: 15 },
      small: { price: 15, cost: 3, duration: 15 },
      medium: { price: 20, cost: 4, duration: 20 },
      large: { price: 25, cost: 5, duration: 25 },
      xlarge: { price: 30, cost: 6, duration: 30 }
    }
  },
  { 
    id: 5, 
    code: 'HI-OID-001', 
    name: 'Limpieza de Oídos', 
    category: 'Higiene', 
    type: 'service',
    price: 12,
    stock: 999,
    cost: 4,
    pricingBySize: false,
    pricing: {
      toy: { price: 12, cost: 4, duration: 12 },
      small: { price: 12, cost: 4, duration: 12 },
      medium: { price: 15, cost: 5, duration: 15 },
      large: { price: 18, cost: 6, duration: 18 },
      xlarge: { price: 20, cost: 7, duration: 20 }
    }
  },
  { 
    id: 6, 
    code: 'BA-MED-001', 
    name: 'Baño Medicinal', 
    category: 'Tratamiento', 
    type: 'service',
    price: 40,
    stock: 999,
    cost: 15,
    pricingBySize: true,
    pricing: {
      toy: { price: 40, cost: 15, duration: 35 },
      small: { price: 45, cost: 18, duration: 40 },
      medium: { price: 55, cost: 22, duration: 50 },
      large: { price: 75, cost: 30, duration: 75 },
      xlarge: { price: 110, cost: 45, duration: 120 }
    }
  },
  { 
    id: 7, 
    code: 'ES-ANT-001', 
    name: 'Tratamiento Antipulgas', 
    category: 'Salud', 
    type: 'service',
    price: 25,
    stock: 999,
    cost: 10,
    pricingBySize: true,
    pricing: {
      toy: { price: 25, cost: 10, duration: 30 },
      small: { price: 30, cost: 12, duration: 35 },
      medium: { price: 40, cost: 16, duration: 45 },
      large: { price: 55, cost: 22, duration: 65 },
      xlarge: { price: 75, cost: 30, duration: 90 }
    }
  },
  { 
    id: 8, 
    code: 'ES-DES-001', 
    name: 'Desparasitación', 
    category: 'Salud', 
    type: 'service',
    price: 28,
    stock: 999,
    cost: 12,
    pricingBySize: true,
    pricing: {
      toy: { price: 28, cost: 12, duration: 20 },
      small: { price: 30, cost: 13, duration: 20 },
      medium: { price: 35, cost: 15, duration: 20 },
      large: { price: 45, cost: 20, duration: 25 },
      xlarge: { price: 55, cost: 25, duration: 30 }
    }
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  { id: 101, code: 'AL-ROY-001', name: 'Royal Canin Adult 15kg', category: 'Alimento', type: 'product', price: 180.00, stock: 25, cost: 120.00 },
  { id: 102, code: 'CU-SHA-001', name: 'Shampoo Medicinal 500ml', category: 'Cuidado', type: 'product', price: 35.00, stock: 40, cost: 18.00 },
  { id: 103, code: 'AC-COL-001', name: 'Collar Antipulgas', category: 'Accesorios', type: 'product', price: 25.00, stock: 50, cost: 12.00 },
  { id: 104, code: 'SU-VIT-001', name: 'Vitaminas Omega-3', category: 'Suplementos', type: 'product', price: 45.00, stock: 30, cost: 25.00 },
  { id: 105, code: 'ME-ANT-001', name: 'Antipulgas Pipeta', category: 'Medicamentos', type: 'product', price: 28.00, stock: 60, cost: 15.00 }
];

export const useProducts = () => {
  const { user } = useAuth();
  const companyId = user?.companyId ?? 1;
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<{ data: any[]; meta?: any } | any[]>('/products', {
        company_id: companyId,
        only_active: false,
        per_page: 500,
      });
      
      const productsArray = Array.isArray(response) ? response : (response.data || []);
      const mappedProducts = productsArray.map(fromBackendFormat);
      
      // Separar productos y servicios
      const loadedProducts = mappedProducts.filter(item => item.type === 'product');
      const loadedServices = mappedProducts.filter(item => item.type === 'service');
      
      setProducts(loadedProducts);
      setServices(loadedServices);
    } catch (err: any) {
      console.error('Error in fetchProducts:', err);
      toast.error(err.message || 'Error cargando productos');
      setProducts([]);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Convertir formato frontend a backend
  const toBackendFormat = (product: Partial<Product>): any => {
    const categoryId =
      product.category && /^\d+$/.test(String(product.category))
        ? parseInt(String(product.category), 10)
        : null;

    return {
      company_id: companyId,
      name: product.name || '',
      code: product.code || undefined,
      item_type: product.type === 'service' ? 'SERVICIO' : 'PRODUCTO',
      unit_price: product.price || 0,
      sale_price: product.price || 0,
      cost_price: product.cost || 0,
      stock: product.type === 'service' ? 0 : (product.stock ?? 0),
      active: product.active !== false,
      description: product.description || '',
      category_id: categoryId,
      metadata: {
        pricing: product.pricing,
        pricingBySize: product.pricingBySize,
        breedExceptions: product.breedExceptions,
        includes: product.includes,
        duration: product.duration,
        area: product.area,
      },
    };
  };

  const createProduct = async (productData: Partial<Product> | Product, isInitial = false) => {
    try {
      const backendData = toBackendFormat(productData);
      const response = await apiClient.post<{ data: any }>('/products', backendData);
      
      const backendProduct = response.data || response;
      const savedProduct = fromBackendFormat(backendProduct);

      if (!isInitial) {
        if (savedProduct.type === 'product') {
          setProducts(prev => {
            const exists = prev.find(p => p.id === savedProduct.id);
            return exists ? prev.map(p => p.id === savedProduct.id ? savedProduct : p) : [...prev, savedProduct];
          });
        } else {
          setServices(prev => {
            const exists = prev.find(s => s.id === savedProduct.id);
            return exists ? prev.map(s => s.id === savedProduct.id ? savedProduct : s) : [...prev, savedProduct];
          });
        }
        toast.success(`${savedProduct.type === 'service' ? 'Servicio' : 'Producto'} guardado`);
      }
      return savedProduct;
    } catch (err: any) {
      console.error('Error creating product:', err);
      if (!isInitial) toast.error(err.message || 'Error al guardar item');
      throw err;
    }
  };

  const updateProductStock = async (
    id: number,
    quantityToDeduct: number,
    options?: { areaId?: number; notes?: string }
  ) => {
    try {
      await apiClient.post(`/products/${id}/adjust-stock`, {
        quantity: Math.abs(quantityToDeduct),
        type: 'OUT',
        area_id: options?.areaId,
        notes: options?.notes ?? 'Salida de inventario',
      });
      
      // Actualizar estado local
      const product = [...products, ...services].find(p => p.id === id);
      if (product) {
        const newStock = Math.max(0, product.stock - Math.abs(quantityToDeduct));
        
        if (product.type === 'product') {
          setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
        } else {
          setServices(prev => prev.map(s => s.id === id ? { ...s, stock: newStock } : s));
        }
      }
      
      return product ? Math.max(0, product.stock - Math.abs(quantityToDeduct)) : 0;
    } catch (e: any) {
      console.error('Error updating stock:', e);
      toast.error(e.message || 'Error al actualizar stock');
      throw e;
    }
  };

  // Carga lazy: solo cargar cuando se accede al hook, no automáticamente
  // Esto evita múltiples llamadas al backend al cargar la página
  const deleteProduct = async (id: number) => {
    try {
      await apiClient.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      setServices(prev => prev.filter(s => s.id !== id));
      toast.success('Eliminado correctamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
      throw err;
    }
  };

  // Cargar productos/servicios al montar (y al cambiar companyId)
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    services,
    loading,
    fetchProducts,
    createProduct,
    updateProductStock,
    deleteProduct,
  };
};
