import { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, Smartphone, Wallet, Check, Lock, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import type { PortalSettings } from '../../utils/api/publicBooking';
import { calculatePortalAdvance } from '../../utils/api/publicBooking';

export type PortalPaymentMethod = 'card' | 'yape' | 'plin' | 'cash';

export interface PortalPaymentResult {
  method: PortalPaymentMethod;
  amount: number;
  reference: string;
  advancePaid: boolean;
}

interface PortalPaymentStepProps {
  totalPrice: number;
  portalSettings: PortalSettings;
  loading?: boolean;
  onPay: (result: PortalPaymentResult) => void;
  onBack: () => void;
}

export function PortalPaymentStep({
  totalPrice,
  portalSettings,
  loading = false,
  onPay,
  onBack,
}: PortalPaymentStepProps) {
  const [selectedMethod, setSelectedMethod] = useState<PortalPaymentMethod>('yape');
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');

  const advanceAmount = calculatePortalAdvance(totalPrice, portalSettings);
  const remaining = Math.max(0, totalPrice - advanceAmount);
  const advanceLabel =
    portalSettings.advance_type === 'fixed'
      ? `S/ ${portalSettings.advance_value}`
      : `${portalSettings.advance_value}%`;

  const methods: Array<{
    id: PortalPaymentMethod;
    name: string;
    icon: typeof CreditCard;
    description: string;
    badge?: string;
    paysAdvance: boolean;
  }> = [
    {
      id: 'yape',
      name: 'Yape',
      icon: Smartphone,
      description: 'Pago simulado — confirma tu cita al instante',
      badge: 'Recomendado',
      paysAdvance: true,
    },
    {
      id: 'plin',
      name: 'Plin',
      icon: Smartphone,
      description: 'Transferencia simulada',
      paysAdvance: true,
    },
    {
      id: 'card',
      name: 'Tarjeta',
      icon: CreditCard,
      description: 'Visa, Mastercard (simulado)',
      paysAdvance: true,
    },
    {
      id: 'cash',
      name: 'Sin adelanto',
      icon: Wallet,
      description: 'Reserva pendiente — el staff validará tu cita',
      badge: 'Validación manual',
      paysAdvance: false,
    },
  ];

  const handleSubmit = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));

    const paysAdvance = selectedMethod !== 'cash' && advanceAmount > 0;
    const reference = paysAdvance
      ? `SIM-${Date.now().toString(36).toUpperCase()}`
      : '';

    onPay({
      method: selectedMethod,
      amount: paysAdvance ? advanceAmount : 0,
      reference,
      advancePaid: paysAdvance,
    });
    setProcessing(false);
  };

  const busy = loading || processing;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total del servicio</span>
          <span className="font-medium">S/ {totalPrice.toFixed(2)}</span>
        </div>
        {portalSettings.require_advance && advanceAmount > 0 && (
          <>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-muted-foreground">Adelanto ({advanceLabel})</span>
              <span className="font-semibold text-primary">S/ {advanceAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Saldo al finalizar servicio</span>
              <span>S/ {remaining.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      {portalSettings.payment_mode === 'simulated' && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>
            Modo demostración: el pago es <strong>simulado</strong>. En producción se conectará la pasarela real.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {methods.map((method) => (
          <Card
            key={method.id}
            onClick={() => !busy && setSelectedMethod(method.id)}
            className={`p-4 cursor-pointer transition-all ${
              selectedMethod === method.id
                ? 'border-2 border-primary bg-primary/5'
                : 'hover:border-primary/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedMethod === method.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                <method.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{method.name}</span>
                  {method.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {method.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </div>
              {selectedMethod === method.id && <Check className="w-5 h-5 text-primary shrink-0" />}
            </div>
          </Card>
        ))}
      </div>

      {selectedMethod === 'card' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lock className="w-4 h-4 text-green-600" />
              Datos de tarjeta (simulado)
            </div>
            <div>
              <Label>Número de tarjeta</Label>
              <Input
                placeholder="4111 1111 1111 1111"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="mt-1"
              />
            </div>
          </Card>
        </motion.div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} disabled={busy} className="flex-1">
          Atrás
        </Button>
        <Button onClick={handleSubmit} disabled={busy} className="flex-1">
          {busy
            ? 'Procesando...'
            : selectedMethod === 'cash'
              ? 'Reservar sin adelanto'
              : `Pagar S/ ${advanceAmount.toFixed(2)} y reservar`}
        </Button>
      </div>
    </div>
  );
}
