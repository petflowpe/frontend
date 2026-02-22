import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Lock, Check, AlertCircle, ChevronRight, Smartphone, Building, Wallet } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

interface PaymentPageProps {
  bookingData: any;
  onPaymentComplete: (paymentData: any) => void;
  onBack: () => void;
}

type PaymentMethod = 'card' | 'yape' | 'plin' | 'cash';

export function PaymentPage({ bookingData, onPaymentComplete, onBack }: PaymentPageProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  const totalAmount = bookingData.service?.prices[bookingData.pet?.size] || 0;
  const depositAmount = Math.round(totalAmount * 0.3); // 30% adelanto
  const remainingAmount = totalAmount - depositAmount;

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onPaymentComplete({
      method: selectedMethod,
      amount: depositAmount,
      timestamp: new Date().toISOString(),
      transactionId: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    });
  };

  const paymentMethods = [
    {
      id: 'card' as PaymentMethod,
      name: 'Tarjeta de Crédito/Débito',
      icon: CreditCard,
      description: 'Visa, Mastercard, American Express',
      badge: 'Recomendado',
    },
    {
      id: 'yape' as PaymentMethod,
      name: 'Yape',
      icon: Smartphone,
      description: 'Pago instantáneo con tu app',
      badge: null,
    },
    {
      id: 'plin' as PaymentMethod,
      name: 'Plin',
      icon: Smartphone,
      description: 'Transferencia instantánea',
      badge: null,
    },
    {
      id: 'cash' as PaymentMethod,
      name: 'Pago Contraentrega',
      icon: Wallet,
      description: 'Paga al finalizar el servicio',
      badge: 'Sin adelanto',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Método de Pago</h1>
          <p className="text-slate-600">Asegura tu cita con un adelanto del 30%</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Payment Methods & Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Payment Method Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <h2 className="font-bold text-lg mb-4">Selecciona Método de Pago</h2>
                
                <div className="space-y-3">
                  {paymentMethods.map((method, index) => (
                    <motion.div
                      key={method.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <Card
                        onClick={() => setSelectedMethod(method.id)}
                        className={`p-4 cursor-pointer transition-all ${
                          selectedMethod === method.id
                            ? 'border-2 border-blue-600 bg-blue-50'
                            : 'hover:border-blue-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            selectedMethod === method.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            <method.icon className="w-6 h-6" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{method.name}</span>
                              {method.badge && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  {method.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">{method.description}</p>
                          </div>
                          
                          {selectedMethod === method.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                            >
                              <Check className="w-6 h-6 text-blue-600" />
                            </motion.div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Payment Form */}
            <AnimatePresence mode="wait">
              {selectedMethod === 'card' && (
                <motion.div
                  key="card-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Lock className="w-5 h-5 text-green-600" />
                      <h3 className="font-bold">Pago Seguro con Tarjeta</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Número de Tarjeta</Label>
                        <div className="relative">
                          <Input
                            placeholder="1234 5678 9012 3456"
                            value={cardData.number}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\s/g, '');
                              const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                              setCardData({ ...cardData, number: formatted });
                            }}
                            maxLength={19}
                            className="mt-1 pl-12"
                          />
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        </div>
                      </div>

                      <div>
                        <Label>Nombre en la Tarjeta</Label>
                        <Input
                          placeholder="JUAN PEREZ"
                          value={cardData.name}
                          onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Fecha de Expiración</Label>
                          <Input
                            placeholder="MM/YY"
                            value={cardData.expiry}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length >= 2) {
                                value = value.slice(0, 2) + '/' + value.slice(2, 4);
                              }
                              setCardData({ ...cardData, expiry: value });
                            }}
                            maxLength={5}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label>CVV</Label>
                          <Input
                            type="password"
                            placeholder="123"
                            value={cardData.cvv}
                            onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                            maxLength={4}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {(selectedMethod === 'yape' || selectedMethod === 'plin') && (
                <motion.div
                  key="qr-payment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-6 text-center">
                    <h3 className="font-bold mb-4">Escanea el QR para Pagar</h3>
                    
                    <div className="w-48 h-48 bg-slate-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <div className="text-6xl">📱</div>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-2">
                      Escanea con tu app {selectedMethod === 'yape' ? 'Yape' : 'Plin'}
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      S/{depositAmount}
                    </p>
                  </Card>
                </motion.div>
              )}

              {selectedMethod === 'cash' && (
                <motion.div
                  key="cash-payment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-6 bg-green-50 border-green-200">
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold mb-2">Pago Contraentrega</h3>
                        <p className="text-sm text-slate-700 mb-3">
                          Pagarás el monto total al finalizar el servicio. No se requiere adelanto.
                        </p>
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Monto a pagar:</span>
                            <span className="text-xl font-bold text-green-600">S/{totalAmount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Security Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-4 bg-slate-50 border-slate-200">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Lock className="w-5 h-5 text-green-600" />
                  <div>
                    <span className="font-semibold text-slate-900">Pago 100% Seguro</span>
                    <span> • Encriptación SSL • Protección de datos</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            
            {/* Order Summary */}
            <Card className="p-6 sticky top-4">
              <h3 className="font-bold text-lg mb-4">Resumen del Pedido</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 pb-4 border-b">
                  <div className="text-3xl">{bookingData.service?.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{bookingData.service?.name}</div>
                    <div className="text-sm text-slate-600">
                      {bookingData.pet?.name} • {bookingData.pet?.breed}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Servicio</span>
                    <span className="font-semibold">S/{totalAmount}</span>
                  </div>
                  {selectedMethod !== 'cash' && (
                    <>
                      <div className="flex justify-between text-blue-600">
                        <span>Adelanto (30%)</span>
                        <span className="font-semibold">-S/{depositAmount}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Por pagar después</span>
                        <span>S/{remainingAmount}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">
                      {selectedMethod === 'cash' ? 'Total' : 'A Pagar Ahora'}
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      S/{selectedMethod === 'cash' ? 0 : depositAmount}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={handlePayment}
                disabled={isProcessing || (selectedMethod === 'card' && !cardData.number)}
              >
                {isProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    {selectedMethod === 'cash' ? 'Confirmar Reserva' : `Pagar S/${depositAmount}`}
                  </>
                )}
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <div className="text-center text-xs text-slate-500 space-y-1">
              <div>🔒 Conexión segura SSL</div>
              <div>💳 Aceptamos todas las tarjetas</div>
              <div>✓ Reembolso si cancelas con 24h</div>
            </div>
          </motion.div>
        </div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <Button variant="ghost" onClick={onBack}>
            ← Volver al Resumen
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
