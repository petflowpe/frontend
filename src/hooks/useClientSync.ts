import { useEffect, useState } from 'react';
import { apiClient } from '../utils/api/client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const useClientSync = () => {
  const { user, updateUser } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedClient, setSyncedClient] = useState<any>(null);

  useEffect(() => {
    const syncUserWithClient = async () => {
      // Validar que tengamos los datos del documento
      if (!user?.documentNumber || !user?.documentType || isSyncing) return;

      setIsSyncing(true);
      try {
        // 1. Buscar si existe un cliente con este DOCUMENTO usando el backend Laravel
        const tipoDocumento = user.documentType === 'DNI' ? '1' : 
                             user.documentType === 'CE' ? '4' : '6';
        
        const response = await apiClient.post<{ data: any }>('/clients/search-by-document', {
          tipo_documento: tipoDocumento,
          numero_documento: user.documentNumber,
        });

        // 2. Si existe el cliente
        if (response.data) {
          const client = response.data;
          console.log('✅ Cliente existente encontrado por Documento:', client);
          setSyncedClient(client);

          // Si el usuario local no tiene todos los datos, actualizarlos desde el cliente encontrado
          const needsUpdate = 
            (!user.phone && client.phone) ||
            (!user.address && client.address) ||
            (!user.district && client.district) ||
            (!user.email && client.email); // Ahora también podemos recuperar el email si falta

          if (needsUpdate) {
            updateUser({
              ...user,
              phone: user.phone || client.phone,
              address: user.address || client.address,
              district: user.district || client.district,
              email: user.email || client.email,
              firstName: user.firstName || client.full_name?.split(' ')[0] || user.firstName,
              lastName: user.lastName || client.full_name?.split(' ').slice(1).join(' ') || user.lastName,
            });
            
            toast.success('Perfil sincronizado', {
              description: `Datos recuperados para el documento ${user.documentNumber}`
            });
          }
        }
      } catch (err) {
        console.error('Error en sincronización:', err);
      } finally {
        setIsSyncing(false);
      }
    };

    syncUserWithClient();
  }, [user?.documentNumber, user?.documentType]);

  return { isSyncing, syncedClient };
};
