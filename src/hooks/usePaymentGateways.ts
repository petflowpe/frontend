import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';
import { getStoredCompanyId } from '../utils/appointmentMappers';

export interface MercadoPagoConfig {
  enabled: boolean;
  environment: 'sandbox' | 'production';
  public_key: string;
  has_access_token: boolean;
  has_webhook_secret: boolean;
}

export interface NiubizConfig {
  enabled: boolean;
  environment: 'sandbox' | 'production';
  merchant_id: string;
  user: string;
  has_password: boolean;
}

export interface PaymentGatewaysState {
  mercado_pago: MercadoPagoConfig;
  niubiz: NiubizConfig;
}

const defaultState: PaymentGatewaysState = {
  mercado_pago: {
    enabled: false,
    environment: 'sandbox',
    public_key: '',
    has_access_token: false,
    has_webhook_secret: false,
  },
  niubiz: {
    enabled: false,
    environment: 'sandbox',
    merchant_id: '',
    user: '',
    has_password: false,
  },
};

export function usePaymentGateways(companyId?: number | null) {
  const cid = companyId ?? getStoredCompanyId();
  const [config, setConfig] = useState<PaymentGatewaysState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  const [form, setForm] = useState({
    mercado_pago: {
      enabled: false,
      environment: 'sandbox' as const,
      public_key: '',
      access_token: '',
      webhook_secret: '',
    },
    niubiz: {
      enabled: false,
      environment: 'sandbox' as const,
      merchant_id: '',
      user: '',
      password: '',
    },
  });

  const load = useCallback(async () => {
    if (!cid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiClient.get<PaymentGatewaysState>(API.paymentGateways.get(cid));
      setConfig(data as PaymentGatewaysState);
      setForm((prev) => ({
        mercado_pago: {
          ...prev.mercado_pago,
          enabled: data.mercado_pago?.enabled ?? false,
          environment: data.mercado_pago?.environment ?? 'sandbox',
          public_key: data.mercado_pago?.public_key ?? '',
          access_token: '',
          webhook_secret: '',
        },
        niubiz: {
          ...prev.niubiz,
          enabled: data.niubiz?.enabled ?? false,
          environment: data.niubiz?.environment ?? 'sandbox',
          merchant_id: data.niubiz?.merchant_id ?? '',
          user: data.niubiz?.user ?? '',
          password: '',
        },
      }));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al cargar pasarelas');
    } finally {
      setLoading(false);
    }
  }, [cid]);

  const save = useCallback(async () => {
    if (!cid) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        mercado_pago: { ...form.mercado_pago },
        niubiz: { ...form.niubiz },
      };
      if (!form.mercado_pago.access_token) {
        delete (payload.mercado_pago as Record<string, unknown>).access_token;
      }
      if (!form.niubiz.password) {
        delete (payload.niubiz as Record<string, unknown>).password;
      }
      const updated = await apiClient.put<PaymentGatewaysState>(
        API.paymentGateways.update(cid),
        payload
      );
      setConfig(updated);
      toast.success('Pasarelas guardadas');
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }, [cid, form, load]);

  const testGateway = useCallback(
    async (gateway: 'mercado_pago' | 'niubiz') => {
      if (!cid) return;
      setTesting(gateway);
      try {
        await apiClient.post(API.paymentGateways.test(cid, gateway), {});
        toast.success('Conexión exitosa');
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Prueba fallida');
      } finally {
        setTesting(null);
      }
    },
    [cid]
  );

  useEffect(() => {
    load();
  }, [load]);

  return {
    config,
    form,
    setForm,
    loading,
    saving,
    testing,
    load,
    save,
    testGateway,
    companyId: cid,
  };
}
