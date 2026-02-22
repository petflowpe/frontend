import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';

interface LoginRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export function LoginRegisterModal({ isOpen, onClose, onLoginSuccess }: LoginRegisterModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'login') {
      // Simular login
      if (formData.email && formData.password) {
        const user = {
          id: 'CLI-' + Date.now(),
          name: formData.email.split('@')[0],
          email: formData.email,
          phone: formData.phone || '+51 999 999 999',
          registeredAt: new Date().toISOString()
        };
        
        toast.success('¡Bienvenido de nuevo!');
        onLoginSuccess(user);
        onClose();
      } else {
        toast.error('Por favor completa todos los campos');
      }
    } else {
      // Simular registro
      if (formData.email && formData.password && formData.name && formData.phone) {
        const user = {
          id: 'CLI-' + Date.now(),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          registeredAt: new Date().toISOString()
        };
        
        toast.success('¡Cuenta creada exitosamente!');
        onLoginSuccess(user);
        onClose();
      } else {
        toast.error('Por favor completa todos los campos obligatorios');
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-6">
          <Button
            variant={mode === 'login' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setMode('login')}
          >
            Iniciar Sesión
          </Button>
          <Button
            variant={mode === 'register' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setMode('register')}
          >
            Registrarse
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Label htmlFor="name">Nombre Completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="name"
                    placeholder="Juan Pérez"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="pl-10"
                    required={mode === 'register'}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <Label htmlFor="email">Correo Electrónico *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Label htmlFor="phone">Teléfono *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+51 999 999 999"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="pl-10"
                    required={mode === 'register'}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Label htmlFor="address">Dirección (Opcional)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="address"
                    placeholder="Av. Ejemplo 123, Lima"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <Label htmlFor="password">Contraseña *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </Button>
        </form>

        <div className="text-center text-sm text-slate-600 mt-4">
          {mode === 'login' ? (
            <p>
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-blue-600 hover:underline font-medium"
              >
                Regístrate aquí
              </button>
            </p>
          ) : (
            <p>
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-blue-600 hover:underline font-medium"
              >
                Inicia sesión
              </button>
            </p>
          )}
        </div>

        <div className="border-t border-slate-200 pt-4 mt-4">
          <p className="text-xs text-slate-500 text-center">
            Al continuar, aceptas nuestros{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Términos y Condiciones
            </a>{' '}
            y{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Política de Privacidad
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
