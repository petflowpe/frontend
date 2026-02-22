/**
 * Recuperación de contraseña: el usuario ingresa su email y el backend envía un correo
 * con un enlace para restablecer la contraseña (token en URL). Al hacer clic, se abre
 * la pantalla ResetPassword con token y email en la URL.
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { forgotPasswordEmail } from '../../services/authService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export const PasswordRecovery = ({ onBack }: { onBack?: () => void }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const errorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus({ preventScroll: false });
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Ingresa tu correo electrónico');
      return;
    }
    if (!validateEmail(email)) {
      setError('El correo no tiene un formato válido');
      return;
    }

    setLoading(true);
    try {
      await forgotPasswordEmail(email.trim());
      setSent(true);
      toast.success('Correo enviado', {
        description: 'Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al enviar el correo. Intenta de nuevo.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0B0E14]">
        <div className="w-full max-w-md space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-lg text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Revisa tu correo</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              Si existe una cuenta con <strong className="text-slate-700 dark:text-slate-300">{email}</strong>, recibirás un enlace para restablecer tu contraseña. Revisa también la carpeta de spam.
            </p>
            {onBack && (
              <Button type="button" variant="outline" className="w-full" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio de sesión
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0B0E14]">
      <div className="w-full max-w-md space-y-6">
        {onBack && (
          <Button type="button" variant="ghost" size="sm" onClick={onBack} className="text-slate-600 dark:text-slate-400">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver al login
          </Button>
        )}

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-lg">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Recuperar contraseña</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          {error && (
            <Alert
              ref={errorRef}
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
              <Label htmlFor="recovery-email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="recovery-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  required
                  aria-invalid={!!error}
                  aria-describedby={error ? 'recovery-error' : undefined}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar enlace por correo'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordRecovery;
