import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card } from '../ui/card';
import { toast } from 'sonner';
import { Loader2, User, Phone, Mail, MapPin } from 'lucide-react';
import { useClients } from '../../hooks/useClients';
import { useVehicles } from '../../hooks/useVehicles';

const clientSchema = z.object({
  documentType: z.enum(['DNI', 'CE', 'RUC']),
  documentNumber: z.string().min(1, "Número de documento requerido"),
  name: z.string().min(1, "Nombre requerido"),
  lastName1: z.string().optional(),
  lastName2: z.string().optional(),
  phone1: z.string().min(1, "Teléfono requerido"),
  phone2: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal('')),
  street: z.string().optional(),
  streetNumber: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface NewClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated?: (client: any) => void;
}

export function NewClientDialog({ open, onOpenChange, onClientCreated }: NewClientDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createClient, refreshClients } = useClients();
  const { vehicles } = useVehicles();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      documentType: 'DNI',
      documentNumber: '',
      name: '',
      lastName1: '',
      lastName2: '',
      phone1: '',
      phone2: '',
      email: '',
      street: '',
      streetNumber: '',
      district: '',
      province: 'Lima',
    }
  });

  const { register, handleSubmit, formState: { errors }, reset } = form;

  useEffect(() => {
    if (open) {
      reset({
        documentType: 'DNI',
        documentNumber: '',
        name: '',
        lastName1: '',
        lastName2: '',
        phone1: '',
        phone2: '',
        email: '',
        street: '',
        streetNumber: '',
        district: '',
        province: 'Lima',
      });
    }
  }, [open, reset]);

  const onSubmit = async (data: ClientFormValues) => {
    setIsSubmitting(true);
    try {
      // Construir nombre completo
      const fullName = `${data.name} ${data.lastName1 || ''} ${data.lastName2 || ''}`.trim();
      
      // Construir dirección completa
      const address = [data.street, data.streetNumber, data.district, data.province]
        .filter(Boolean)
        .join(', ');

      const clientData = {
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        fullName: fullName,
        phone: data.phone1,
        phone2: data.phone2,
        email: data.email || '',
        address: address || data.street || '',
        district: data.district || '',
        province: data.province || 'Lima',
        department: 'Lima',
        isActive: true,
      };

      const newClient = await createClient(clientData);
      
      // Refrescar lista de clientes
      await refreshClients();

      toast.success('Cliente creado exitosamente', {
        description: `${fullName} ha sido agregado al sistema`
      });

      // Llamar callback con el nuevo cliente
      if (onClientCreated) {
        onClientCreated({
          id: newClient.id,
          fullName: fullName,
          documentNumber: data.documentNumber,
          documentType: data.documentType,
          phone1: data.phone1,
          phone2: data.phone2,
          email: data.email,
          address: address,
          district: data.district,
          province: data.province,
        });
      }

      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al crear el cliente', {
        description: error.message || 'No se pudo crear el cliente. Por favor, verifica los datos e intenta nuevamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Nuevo Cliente
          </DialogTitle>
          <DialogDescription>
            Complete los datos básicos del cliente para continuar con la cita
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tipo y Número de Documento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">Tipo de Documento *</Label>
              <Select
                value={form.watch('documentType')}
                onValueChange={(value) => form.setValue('documentType', value as 'DNI' | 'CE' | 'RUC')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="CE">Carné de Extranjería</SelectItem>
                  <SelectItem value="RUC">RUC</SelectItem>
                </SelectContent>
              </Select>
              {errors.documentType && (
                <p className="text-sm text-destructive">{errors.documentType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentNumber">Número de Documento *</Label>
              <Input
                id="documentNumber"
                placeholder="12345678"
                {...register('documentNumber')}
              />
              {errors.documentNumber && (
                <p className="text-sm text-destructive">{errors.documentNumber.message}</p>
              )}
            </div>
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombres *</Label>
            <Input
              id="name"
              placeholder="Juan"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Apellidos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastName1">Primer Apellido</Label>
              <Input
                id="lastName1"
                placeholder="Pérez"
                {...register('lastName1')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName2">Segundo Apellido</Label>
              <Input
                id="lastName2"
                placeholder="García"
                {...register('lastName2')}
              />
            </div>
          </div>

          {/* Contacto */}
          <Card className="p-4 bg-muted/50">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Información de Contacto
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone1">Teléfono Principal *</Label>
                <Input
                  id="phone1"
                  placeholder="987654321"
                  {...register('phone1')}
                />
                {errors.phone1 && (
                  <p className="text-sm text-destructive">{errors.phone1.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone2">Teléfono Secundario</Label>
                <Input
                  id="phone2"
                  placeholder="987654322"
                  {...register('phone2')}
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email (Opcional)
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="cliente@ejemplo.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </Card>

          {/* Dirección */}
          <Card className="p-4 bg-muted/50">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Dirección (Opcional)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="street">Calle</Label>
                <Input
                  id="street"
                  placeholder="Av. Principal"
                  {...register('street')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="streetNumber">Número</Label>
                <Input
                  id="streetNumber"
                  placeholder="123"
                  {...register('streetNumber')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="district">Distrito</Label>
                <Input
                  id="district"
                  placeholder="Miraflores"
                  {...register('district')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Provincia</Label>
                <Input
                  id="province"
                  placeholder="Lima"
                  {...register('province')}
                />
              </div>
            </div>
          </Card>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <User className="mr-2 h-4 w-4" />
                  Crear Cliente
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
