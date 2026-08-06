import { useState, useMemo, useEffect } from 'react';
import { Scissors, Plus, Edit2, Trash2, Clock, DollarSign, Settings, Tag, MapPin, Coins, Ruler, AlertCircle, Info, PawPrint, Loader2 } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useAreas } from '../hooks/useAreas';
import { useAuth } from '../context/AuthContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';

// Generar código de servicio automático
const generateServiceCode = (name: string, area: string, existingCodes: string[]) => {
  const areaPrefix = area.substring(0, 2).toUpperCase();
  const namePrefix = name.substring(0, 3).toUpperCase().replace(/\s/g, '');
  const baseCode = `${areaPrefix}-${namePrefix}`;
  
  let counter = 1;
  let code = `${baseCode}-${String(counter).padStart(3, '0')}`;
  
  while (existingCodes.includes(code)) {
    counter++;
    code = `${baseCode}-${String(counter).padStart(3, '0')}`;
  }
  
  return code;
};

// Tamaños disponibles
const petSizes = [
  { id: 'toy', name: 'Toy/Mini', description: 'Hasta 5kg', icon: '🐕‍🦺', color: 'pink' },
  { id: 'small', name: 'Pequeño', description: '5-10kg', icon: '🐕', color: 'blue' },
  { id: 'medium', name: 'Mediano', description: '10-25kg', icon: '🐕', color: 'green' },
  { id: 'large', name: 'Grande', description: '25-40kg', icon: '🐕', color: 'orange' },
  { id: 'xlarge', name: 'Extra Grande', description: '40kg+', icon: '🐕', color: 'red' }
];

// Razas con excepciones comunes
const specialBreeds = [
  'Poodle', 'Poodle Toy', 'Poodle Mediano', 'Poodle Gigante',
  'Shih Tzu', 'Yorkshire Terrier', 'Schnauzer', 'Schnauzer Gigante',
  'Afghan Hound', 'Old English Sheepdog', 'Komondor',
  'Bichon Frise', 'Maltés', 'Lhasa Apso',
  'Husky Siberiano', 'Samoyedo', 'Golden Retriever',
  'Pastor Alemán', 'Collie', 'Border Collie'
];

export function Services() {
  const { user } = useAuth();
  const companyId = Number(user?.companyId) || 1;
  const [showNewService, setShowNewService] = useState(false);
  const [showCategoryConfig, setShowCategoryConfig] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [activeServiceTab, setActiveServiceTab] = useState('basic');
  const [saving, setSaving] = useState(false);

  const emptyForm = () => ({
    name: '',
    description: '',
    categoryId: '' as string,
    areaId: '' as string,
    pricingBySize: true,
    pricing: {
      toy: { price: 30, cost: 10, duration: 25 },
      small: { price: 35, cost: 12, duration: 30 },
      medium: { price: 45, cost: 15, duration: 45 },
      large: { price: 65, cost: 22, duration: 75 },
      xlarge: { price: 95, cost: 35, duration: 120 },
    } as Record<string, { price: number; cost: number; duration: number }>,
    requiredProducts: [] as Array<{ product_id: number; quantity: number }>,
  });

  const [form, setForm] = useState(emptyForm);
  const [insumoProductId, setInsumoProductId] = useState('');
  const [insumoQty, setInsumoQty] = useState('1');

  const { categories, loading: categoriesLoading, reload: reloadCategories } = useCategories(companyId);
  const { areas, loading: areasLoading, reload: reloadAreas } = useAreas(companyId);
  const {
    products: catalogProducts,
    services: servicesFromApi,
    loading: servicesLoading,
    createProduct,
    fetchProducts,
    deleteProduct,
  } = useProducts();

  useEffect(() => {
    if (!showNewService) {
      setForm(emptyForm());
      return;
    }
    if (editingService) {
      setForm({
        name: editingService.name || '',
        description: editingService.description || '',
        categoryId: String(
          categories.find((c) => c.name === editingService.category)?.id || ''
        ),
        areaId: String(areas.find((a) => a.name === editingService.area)?.id || ''),
        pricingBySize: editingService.pricingBySize !== false,
        pricing: editingService.pricing || emptyForm().pricing,
        requiredProducts: editingService.requiredProducts || [],
      });
    } else {
      setForm(emptyForm());
    }
  }, [showNewService, editingService, categories, areas]);

  const addInsumo = () => {
    const pid = Number(insumoProductId);
    const qty = Number(insumoQty) || 1;
    if (!pid || qty <= 0) {
      toast.error('Seleccione un producto y una cantidad válida');
      return;
    }
    setForm((f) => {
      const existing = f.requiredProducts.find((r) => r.product_id === pid);
      if (existing) {
        return {
          ...f,
          requiredProducts: f.requiredProducts.map((r) =>
            r.product_id === pid ? { ...r, quantity: r.quantity + qty } : r
          ),
        };
      }
      return { ...f, requiredProducts: [...f.requiredProducts, { product_id: pid, quantity: qty }] };
    });
    setInsumoProductId('');
    setInsumoQty('1');
  };

  const handleSaveService = async () => {
    if (!form.name.trim()) {
      toast.error('El nombre del servicio es obligatorio');
      return;
    }
    const medium = form.pricing.medium || { price: 0, cost: 0, duration: 45 };
    setSaving(true);
    try {
      const payload = {
        type: 'service' as const,
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.categoryId || undefined,
        area: areas.find((a) => String(a.id) === form.areaId)?.name || '',
        price: Number(medium.price) || 0,
        cost: Number(medium.cost) || 0,
        duration: Number(medium.duration) || 45,
        pricingBySize: form.pricingBySize,
        pricing: form.pricing,
        requiredProducts: form.requiredProducts,
        active: true,
      };

      if (editingService?.id) {
        await apiClient.put(`/products/${editingService.id}`, {
          name: payload.name,
          description: payload.description,
          category_id: form.categoryId ? Number(form.categoryId) : null,
          unit_price: payload.price,
          cost_price: payload.cost,
          item_type: 'SERVICIO',
          metadata: {
            pricing: payload.pricing,
            pricingBySize: payload.pricingBySize,
            duration: payload.duration,
            area: payload.area,
            required_products: payload.requiredProducts,
          },
        });
        toast.success('Servicio actualizado');
        await fetchProducts();
      } else {
        await createProduct(payload);
        await fetchProducts();
      }

      setShowNewService(false);
      setEditingService(null);
      setForm(emptyForm());
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo guardar el servicio');
    } finally {
      setSaving(false);
    }
  };

  const categoriesForUI = useMemo(() => categories.map(c => ({
    id: c.id,
    name: c.name,
    color: c.color || 'blue',
    enabled: c.enabled,
    description: c.description || '',
  })), [categories]);

  const areasForUI = useMemo(() => areas.map(a => ({
    id: a.id,
    name: a.name,
    enabled: a.enabled,
  })), [areas]);

  const services = useMemo(() => servicesFromApi.map(s => ({
    id: s.id,
    code: s.code,
    name: s.name,
    description: s.description || '',
    category: s.category,
    area: s.area || '',
    active: s.active !== false,
    includes: s.includes || [],
    requiredProducts: s.requiredProducts || [],
    pricingBySize: s.pricingBySize ?? true,
    pricing: s.pricing || {
      toy: { price: s.price, cost: s.cost, duration: 30 },
      small: { price: s.price, cost: s.cost, duration: 30 },
      medium: { price: s.price, cost: s.cost, duration: 45 },
      large: { price: s.price, cost: s.cost, duration: 60 },
      xlarge: { price: s.price, cost: s.cost, duration: 90 },
    },
    breedExceptions: s.breedExceptions || [],
  })), [servicesFromApi]);

  // Calcular precio para un tamaño y raza específicos
  const calculatePrice = (service: any, size: string, breed?: string) => {
    if (!service.pricing || !service.pricing[size]) {
      return { price: 0, duration: 0, note: '' };
    }

    let basePrice = service.pricing[size].price;
    let baseDuration = service.pricing[size].duration;
    let note = '';

    // Aplicar excepciones por raza
    if (breed && service.breedExceptions?.length > 0) {
      const exception = service.breedExceptions.find((e: any) => 
        breed.toLowerCase().includes(e.breed.toLowerCase())
      );

      if (exception) {
        if (exception.type === 'multiplier') {
          basePrice = Math.round(basePrice * exception.value);
          note = `+${((exception.value - 1) * 100).toFixed(0)}% (${exception.note})`;
        } else if (exception.type === 'fixed') {
          basePrice = exception.value;
          note = `Precio fijo (${exception.note})`;
        } else if (exception.type === 'extraTime') {
          baseDuration += exception.value;
          note = `+${exception.value} min (${exception.note})`;
        }
      }
    }

    return { price: basePrice, duration: baseDuration, note };
  };

  const ServiceCard = ({ service }: { service: any }) => (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-lg">{service.name}</h3>
            <Badge variant="outline">{service.code}</Badge>
            {service.pricingBySize && (
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                <Ruler className="h-3 w-3 mr-1" />
                Por Tamaño
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
          
          {/* Pricing grid */}
          {service.pricingBySize && (
            <div className="grid grid-cols-5 gap-2 mb-3">
              {petSizes.map((size) => {
                const pricing = service.pricing[size.id];
                if (!pricing) return null;
                
                return (
                  <div 
                    key={size.id} 
                    className="p-2 border rounded-lg text-center bg-muted/30"
                  >
                    <p className="text-xs text-muted-foreground mb-1">{size.icon} {size.name}</p>
                    <p className="font-bold text-sm">{pricing.price} S/</p>
                    <p className="text-xs text-muted-foreground">{pricing.duration}min</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Breed exceptions */}
          {service.breedExceptions?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-orange-600 mb-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Excepciones por raza:
              </p>
              <div className="flex flex-wrap gap-1">
                {service.breedExceptions.map((exception: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs bg-orange-50 dark:bg-orange-950/30">
                    {exception.breed}: {
                      exception.type === 'multiplier' 
                        ? `+${((exception.value - 1) * 100).toFixed(0)}%` 
                        : exception.type === 'fixed' 
                        ? `${exception.value} S/` 
                        : `+${exception.value}min`
                    }
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 ml-4">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              setEditingService(service);
              setShowNewService(true);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="text-red-600"
            onClick={async () => {
              try {
                await deleteProduct(service.id);
                fetchProducts();
              } catch (_e) {}
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{service.category}</Badge>
        <Badge variant="outline">{service.area}</Badge>
        {(service.requiredProducts?.length ?? 0) > 0 && (
          <Badge variant="outline" className="border-emerald-300 text-emerald-700">
            {service.requiredProducts.length} insumo(s)
          </Badge>
        )}
        {service.active ? (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Activo</Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Inactivo</Badge>
        )}
      </div>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📋 Catálogo de Servicios
          </h1>
          <p className="text-muted-foreground text-lg">
            Gestión de servicios con precios diferenciados por tamaño y raza
          </p>
        </div>
        <Dialog open={showNewService} onOpenChange={(open) => {
          setShowNewService(open);
          if (!open) setEditingService(null);
        }}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Servicio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
              </DialogTitle>
              <DialogDescription>
                Configure los precios por tamaño y excepciones por raza
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeServiceTab} onValueChange={setActiveServiceTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Datos básicos</TabsTrigger>
                <TabsTrigger value="pricing">Precios</TabsTrigger>
                <TabsTrigger value="insumos">Insumos</TabsTrigger>
                <TabsTrigger value="exceptions">Excepciones</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre del Servicio *</Label>
                    <Input
                      placeholder="Ej: Baño Completo"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Código (generado automáticamente)</Label>
                    <Input placeholder="GR-BAÑ-001" disabled value={editingService?.code || ''} />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      placeholder="Describe el servicio..."
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Select
                      value={form.categoryId || undefined}
                      onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesForUI.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Área</Label>
                    <Select
                      value={form.areaId || undefined}
                      onValueChange={(v) => setForm((f) => ({ ...f, areaId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {areasForUI.map((area) => (
                          <SelectItem key={area.id} value={String(area.id)}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Ruler className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-semibold">Precio diferenciado por tamaño</p>
                            <p className="text-xs text-muted-foreground">
                              Activar para configurar precios distintos según el tamaño de la mascota
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={form.pricingBySize}
                          onCheckedChange={(v) => setForm((f) => ({ ...f, pricingBySize: v }))}
                        />
                      </div>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4 mt-4">
                <Card className="p-4 bg-purple-50 dark:bg-purple-950/30 border-2 border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="h-5 w-5 text-purple-600" />
                    <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                      Configure el precio, costo y duración para cada tamaño de mascota
                    </p>
                  </div>
                </Card>

                <div className="space-y-4">
                  {petSizes.map((size) => (
                    <Card key={size.id} className="p-4 border-2">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">{size.icon}</div>
                        <div>
                          <h4 className="font-bold">{size.name}</h4>
                          <p className="text-xs text-muted-foreground">{size.description}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Precio (S/)</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={form.pricing[size.id]?.price ?? ''}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                pricing: {
                                  ...f.pricing,
                                  [size.id]: {
                                    ...f.pricing[size.id],
                                    price: Number(e.target.value) || 0,
                                  },
                                },
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Duración (min)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={form.pricing[size.id]?.duration ?? ''}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                pricing: {
                                  ...f.pricing,
                                  [size.id]: {
                                    ...f.pricing[size.id],
                                    duration: Number(e.target.value) || 0,
                                  },
                                },
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Costo (S/)</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={form.pricing[size.id]?.cost ?? ''}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                pricing: {
                                  ...f.pricing,
                                  [size.id]: {
                                    ...f.pricing[size.id],
                                    cost: Number(e.target.value) || 0,
                                  },
                                },
                              }))
                            }
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="insumos" className="space-y-4 mt-4">
                <Card className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm text-emerald-800 dark:text-emerald-200">
                    Al emitir boleta o factura de una cita con este servicio se descontará
                    automáticamente el stock de estos productos (kardex OUT).
                  </p>
                </Card>

                <Card className="p-4 border-2 space-y-3">
                  <h4 className="font-semibold">Agregar insumo</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-2">
                      <Label>Producto</Label>
                      <Select value={insumoProductId || undefined} onValueChange={setInsumoProductId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar producto..." />
                        </SelectTrigger>
                        <SelectContent>
                          {catalogProducts.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name} (stock: {p.stock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        min={0.1}
                        step={0.1}
                        value={insumoQty}
                        onChange={(e) => setInsumoQty(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="button" className="w-full" variant="secondary" onClick={addInsumo}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar insumo
                  </Button>
                </Card>

                <div className="space-y-2">
                  <Label>Insumos configurados ({form.requiredProducts.length})</Label>
                  {form.requiredProducts.length === 0 ? (
                    <Card className="p-4">
                      <p className="text-sm text-muted-foreground text-center">
                        Sin insumos. El servicio no descontará inventario al facturar.
                      </p>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {form.requiredProducts.map((r) => {
                        const p = catalogProducts.find((x) => x.id === r.product_id);
                        return (
                          <Card key={r.product_id} className="p-3 flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium">{p?.name || `Producto #${r.product_id}`}</p>
                              <p className="text-xs text-muted-foreground">
                                Cantidad: {r.quantity} {p?.unit || ''}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              onClick={() =>
                                setForm((f) => ({
                                  ...f,
                                  requiredProducts: f.requiredProducts.filter(
                                    (x) => x.product_id !== r.product_id
                                  ),
                                }))
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="exceptions" className="space-y-4 mt-4">
                <Card className="p-4 bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                      Razas especiales que requieren ajustes de precio o tiempo
                    </p>
                  </div>
                </Card>

                <Card className="p-4 border-2">
                  <h4 className="font-semibold mb-4">Agregar Excepción por Raza</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Raza</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {specialBreeds.map((breed) => (
                            <SelectItem key={breed} value={breed}>
                              {breed}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Ajuste</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiplier">Multiplicador (%)</SelectItem>
                          <SelectItem value="fixed">Precio Fijo (S/)</SelectItem>
                          <SelectItem value="extraTime">Tiempo Extra (min)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Valor</Label>
                      <Input type="number" placeholder="1.3" step="0.1" />
                    </div>
                  </div>
                  <div className="space-y-2 mt-3">
                    <Label>Nota/Razón</Label>
                    <Input placeholder="Ej: Pelo rizado requiere más trabajo" />
                  </div>
                  <Button className="w-full mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Excepción
                  </Button>
                </Card>

                <div className="space-y-2">
                  <Label>Excepciones Configuradas</Label>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground text-center">
                      No hay excepciones configuradas
                    </p>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowNewService(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSaveService} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Guardar Servicio
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <PawPrint className="h-8 w-8 text-blue-600 mt-1" />
          <div>
            <h3 className="font-bold text-lg mb-2">Sistema de Precios Inteligente</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Los servicios ahora se adaptan automáticamente al tamaño y raza de la mascota:
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• <strong>Precios por tamaño:</strong> Desde Toy (hasta 5kg) hasta Extra Grande (40kg+)</li>
              <li>• <strong>Excepciones por raza:</strong> Razas especiales (Poodle, Shih Tzu, etc.) con ajustes automáticos</li>
              <li>• <strong>Duración ajustada:</strong> Tiempo estimado según complejidad del trabajo</li>
              <li>• <strong>Selección automática:</strong> Al crear una cita, el precio se calcula automáticamente</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Services List */}
      <div className="space-y-4">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
