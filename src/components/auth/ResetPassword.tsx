/**
 * Restablecer contraseña con el token recibido por correo (enlace del backend).
 * Se muestra cuando la URL contiene ?token=...&email=... (p. ej. /reset-password?token=...&email=...).
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { resetPasswordWithToken } from '../../services/authService';

function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Debe incluir al menos una minúscula' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Debe incluir al menos una mayúscula' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Debe incluir al menos un número' };
  }
  return { valid: true };
}

interface ResetPasswordProps {
  email: string;
  token: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function ResetPassword({ email, token, onSuccess, onBack }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const firstErrorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (error && firstErrorRef.current) {
      firstErrorRef.current.focus({ preventScroll: false });
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const pwdValidation = validatePassword(password);
    if (!pwdValidation.valid) {
      setError(pwdValidation.message ?? 'Contraseña no válida');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithToken(email, token, password, confirmPassword);
      setSuccess(true);
      toast.success('Contraseña actualizada', {
        description: 'Ya puedes iniciar sesión con tu nueva contraseña',
      });
      setTimeout(() => onSuccess(), 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al restablecer la contraseña';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0B0E14]">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Contraseña actualizada</h1>
          <p className="text-slate-600 dark:text-slate-400">Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0B0E14]">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onBack} className="text-slate-600 dark:text-slate-400">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver al login
          </Button>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-lg">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Nueva contraseña</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Ingresa tu nueva contraseña para <span className="font-medium text-slate-700 dark:text-slate-300">{email}</span>
          </p>

          {error && (
            <Alert
              ref={firstErrorRef}
              variant="destructive"
              className="mb-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
              role="alert"
              tabIndex={-1}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-password">Nueva contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Mín. 8 caracteres, mayúscula, minúscula y número"
                  autoComplete="new-password"
                  required
                  aria-invalid={!!error}
                  aria-describedby={error ? 'reset-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-confirm">Confirmar contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="reset-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Repetir contraseña"
                  autoComplete="new-password"
                  required
                  aria-invalid={!!error}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <li>• Mínimo 8 caracteres</li>
              <li>• Al menos una mayúscula y una minúscula</li>
              <li>• Al menos un número</li>
            </ul>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Actualizando...' : 'Restablecer contraseña'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
