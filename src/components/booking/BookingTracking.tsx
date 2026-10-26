import { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  CheckCircle,
  ShieldCheck,
  MessageCircle,
  Share2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import {
  fetchPublicTracking,
  requestTrackingOtp,
  type PublicTrackingData,
} from '../../utils/api/publicBooking';

interface BookingTrackingProps {
  bookingCode?: string;
}

function readCodeFromUrl(): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('code')?.trim() || '';
}

function readPhoneFromUrl(): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('phone')?.trim() || '';
}

export function BookingTracking({ bookingCode }: BookingTrackingProps) {
  const initialCode = (bookingCode || readCodeFromUrl() || '').toUpperCase();
  const [codeInput, setCodeInput] = useState(initialCode);
  const [phoneInput, setPhoneInput] = useState(readPhoneFromUrl());
  const [otpInput, setOtpInput] = useState('');
  const [activeCode, setActiveCode] = useState(initialCode);
  const [activePhone, setActivePhone] = useState(readPhoneFromUrl());
  const [activeOtp, setActiveOtp] = useState('');
  const [data, setData] = useState<PublicTrackingData | null>(null);
  const [loading, setLoading] = useState(Boolean(initialCode));
  const [otpSending, setOtpSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (code: string, phone?: string, otp?: string) => {
    const normalized = code.trim().toUpperCase();
    const phoneDigits = (phone ?? phoneInput).trim();
    const otpDigits = (otp ?? otpInput).trim();
    if (!normalized) {
      setError('Ingresa un código de seguimiento (ej. SPT-XXXXXX)');
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const tracking = await fetchPublicTracking(normalized, {
        phone: phoneDigits || undefined,
        otp: otpDigits || undefined,
      });
      setData(tracking);
      setActiveCode(normalized);
      setActivePhone(phoneDigits);
      setActiveOtp(otpDigits);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', 'public-tracking');
        url.searchParams.set('code', normalized);
        if (phoneDigits) url.searchParams.set('phone', phoneDigits);
        else url.searchParams.delete('phone');
        window.history.replaceState({}, '', url.toString());
      }
    } catch (e: any) {
      setData(null);
      setError(e?.message || 'No encontramos esa reserva');
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    const normalized = codeInput.trim().toUpperCase();
    if (!normalized) {
      toast.error('Ingresa el código de seguimiento primero');
      return;
    }
    setOtpSending(true);
    try {
      const res = await requestTrackingOtp(normalized);
      toast.success(
        res.hint
          ? `Código enviado (${res.hint})`
          : 'Si la reserva existe, enviamos un código de verificación'
      );
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo enviar el OTP');
    } finally {
      setOtpSending(false);
    }
  };

  useEffect(() => {
    if (activeCode) {
      void load(activeCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeCode) return;
    const timer = setInterval(() => {
      void load(activeCode, activePhone, activeOtp);
    }, 30000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCode, activePhone, activeOtp]);

  const statusInfo = useMemo(() => {
    const status = data?.status || 'confirmed';
    switch (status) {
      case 'on-the-way':
        return {
          gradient: 'from-blue-600 to-indigo-600',
          text: 'En camino',
          sub: 'Tu unidad se dirige al domicilio',
          icon: Navigation,
        };
      case 'arrived':
        return {
          gradient: 'from-emerald-500 to-teal-600',
          text: 'Ha llegado',
          sub: 'Estacionado en tu dirección',
          icon: MapPin,
        };
      case 'in-service':
        return {
          gradient: 'from-purple-600 to-pink-600',
          text: 'En servicio',
          sub: 'Atención en progreso',
          icon: Clock,
        };
      case 'completed':
        return {
          gradient: 'from-slate-800 to-black',
          text: 'Finalizado',
          sub: 'Servicio completado',
          icon: CheckCircle,
        };
      case 'cancelled':
        return {
          gradient: 'from-red-600 to-rose-700',
          text: 'Cancelado',
          sub: 'Esta reserva fue cancelada',
          icon: AlertCircle,
        };
      default:
        return {
          gradient: 'from-gray-500 to-slate-600',
          text: data?.status_label || 'Confirmado',
          sub: 'Procesando tu cita',
          icon: Clock,
        };
    }
  }, [data]);

  const StatusIcon = statusInfo.icon;

  return (
    <div className="flex min-h-[70vh] flex-col overflow-hidden bg-slate-50 font-sans text-slate-900">
      <div className={`bg-gradient-to-r ${statusInfo.gradient} px-4 py-6 text-white sm:px-6`}>
        <div className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/15 p-3">
              <StatusIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">{statusInfo.text}</h1>
              <p className="text-sm text-white/85">{statusInfo.sub}</p>
            </div>
          </div>
          <Badge className="w-fit border-white/30 bg-white/15 text-white hover:bg-white/20">
            {activeCode || 'Sin código'}
          </Badge>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl space-y-4 p-4 sm:p-6">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Código de seguimiento
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="w-full rounded-md border px-3 py-2 text-sm uppercase outline-none ring-cyan-500 focus:ring-2"
              placeholder="SPT-XXXXXX"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void load(codeInput, phoneInput, otpInput);
              }}
            />
            <input
              className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-cyan-500 focus:ring-2 sm:max-w-[10rem]"
              placeholder="Tel. (últ. 4)"
              inputMode="tel"
              autoComplete="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void load(codeInput, phoneInput, otpInput);
              }}
            />
            <input
              className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-cyan-500 focus:ring-2 sm:max-w-[8rem]"
              placeholder="OTP"
              inputMode="numeric"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void load(codeInput, phoneInput, otpInput);
              }}
            />
            <Button onClick={() => void load(codeInput, phoneInput, otpInput)} disabled={loading}>
              {loading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SearchIcon className="mr-2 h-4 w-4" />
              )}
              Buscar
            </Button>
            <Button
              variant="outline"
              disabled={!codeInput || otpSending}
              onClick={() => void sendOtp()}
            >
              {otpSending ? 'Enviando…' : 'Enviar OTP'}
            </Button>
            <Button
              variant="outline"
              disabled={!activeCode || loading}
              onClick={() => void load(activeCode, activePhone, activeOtp)}
              aria-label="Actualizar"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Teléfono (últ. 4) u OTP por correo desbloquean la dirección completa.
          </p>
          {error && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}
          {data && data.verified === false && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-amber-700">
              <ShieldCheck className="h-4 w-4" />
              Vista limitada. Ingresa el teléfono de la reserva para ver la dirección.
            </p>
          )}
        </div>

        {loading && !data && (
          <div className="rounded-xl border bg-white p-8 text-center text-slate-500">
            Cargando seguimiento...
          </div>
        )}

        {data && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">Servicio</p>
                  <h2 className="text-lg font-semibold">{data.service?.name || 'Servicio'}</h2>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="text-lg font-bold tabular-nums">
                    S/ {Number(data.service?.price || 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-slate-500">Mascota</p>
                  <p className="font-medium">
                    {data.pet?.name || '—'}
                    {data.pet?.breed ? ` · ${data.pet.breed}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Agenda</p>
                  <p className="font-medium">
                    {data.schedule?.date || '—'} {data.schedule?.time || ''}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-slate-500">Dirección</p>
                  <p className="font-medium">
                    {data.schedule?.address || '—'}
                    {data.schedule?.district ? `, ${data.schedule.district}` : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-600" />
                <h3 className="font-semibold">Unidad / Conductor</h3>
              </div>
              {data.driver ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {(data.driver.name || 'U').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{data.driver.name}</p>
                      <p className="text-sm text-slate-500">{data.driver.vehicle || 'Vehículo asignado'}</p>
                    </div>
                  </div>
                  {data.driver.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.open(`tel:${data.driver?.phone}`, '_self');
                      }}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Llamar
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Aún no hay unidad asignada. Te avisaremos cuando se asigne.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  const shareText = `Seguimiento ${data.code}: ${statusInfo.text}`;
                  try {
                    if (navigator.share) {
                      await navigator.share({ title: 'Seguimiento PetFlow', text: shareText, url: window.location.href });
                    } else {
                      await navigator.clipboard.writeText(window.location.href);
                      toast.success('Enlace copiado');
                    }
                  } catch {
                    toast.message('No se pudo compartir');
                  }
                }}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.message('Chat disponible pronto en tu portal')}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Contactar soporte
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export default BookingTracking;
