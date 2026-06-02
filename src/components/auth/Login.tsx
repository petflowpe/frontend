import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Mail, Lock, Eye, EyeOff, LogIn, Cloud, ArrowRight, UserPlus, Crown, Stethoscope, AlertCircle, Loader2, Sun, Moon, Zap, Activity, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { Alert, AlertDescription } from '../ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { getStoredTheme, setTheme as setAppTheme, isDarkMode, type Theme } from '../../utils/theme';
import { requestAccess } from '../../services/authService';
import { apiClient } from '../../utils/api/client';

/** Clave para guardar el correo cuando "Recordar correo" está marcado (nunca guardamos contraseña) */
const STORAGE_KEY_REMEMBER_EMAIL = 'smartpet_remember_email';

/** Mostrar credenciales de prueba solo en desarrollo o si la env lo permite */
const SHOW_DEV_CREDENTIALS = import.meta.env.DEV === true;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmailFormat(email: string): boolean {
  return EMAIL_REGEX.test((email || '').trim());
}

// --- COMPONENTE DE FONDO ANIMADO INTENSO (CANVAS) ---
const TechBackground = ({ theme }: { theme: 'light' | 'dark' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    // Configuración de alta intensidad
    const config = theme === 'dark' ? {
      bgStart: '#0B0E14',
      particleColor1: '6, 182, 212', // cyan-500 (Neon)
      particleColor2: '192, 38, 211', // fuchsia-600 (Neon)
      lineColor: '103, 232, 249', // cyan-300
      lineOpacityBase: 0.25,
      particleCountDivisor: 5000, // Más denso
      connectionDistance: 160,
      glow: true
    } : {
      bgStart: '#F8FAFC',
      particleColor1: '37, 99, 235', // blue-600 (Intenso)
      particleColor2: '147, 51, 234', // purple-600 (Intenso)
      lineColor: '99, 102, 241', // indigo-500
      lineOpacityBase: 0.15,
      particleCountDivisor: 6000,
      connectionDistance: 140,
      glow: false
    };
    
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      initParticles();
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      baseOpacity: number;
      pulseSpeed: number;
      pulseOffset: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 2.5 + 1.5; // Partículas más grandes
        // Velocidad aumentada para más dinamismo
        this.speedX = (Math.random() - 0.5) * 1.2;
        this.speedY = (Math.random() - 0.5) * 1.2;
        this.color = Math.random() > 0.5 ? config.particleColor1 : config.particleColor2;
        this.baseOpacity = Math.random() * 0.5 + 0.4;
        this.pulseSpeed = Math.random() * 0.05 + 0.02;
        this.pulseOffset = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Rebote suave
        if (this.x > canvas!.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas!.height || this.y < 0) this.speedY *= -1;
      }

      draw(time: number) {
        if (!ctx) return;
        
        // Efecto de pulsación en opacidad
        const pulse = Math.sin(time * this.pulseSpeed + this.pulseOffset);
        const opacity = this.baseOpacity + (pulse * 0.2);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${opacity})`;
        ctx.fill();

        // Efecto Glow (Resplandor) solo en modo oscuro
        if (config.glow) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${opacity * 0.3})`;
            ctx.fill();
        }
      }
    }

    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / config.particleCountDivisor);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    let time = 0;
    const animate = () => {
      if (!ctx) return;
      time++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Fondo sólido
      ctx.fillStyle = config.bgStart;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // En modo oscuro, usar mezcla aditiva para efecto neón brillante
      if (theme === 'dark') {
          ctx.globalCompositeOperation = 'lighter';
      } else {
          ctx.globalCompositeOperation = 'source-over';
      }

      particles.forEach((p, index) => {
        p.update();
        p.draw(time);

        // Conexiones
        for (let j = index + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < config.connectionDistance) {
            ctx.beginPath();
            const opacity = (1 - distance / config.connectionDistance) * config.lineOpacityBase;
            ctx.strokeStyle = `rgba(${config.lineColor}, ${opacity})`;
            ctx.lineWidth = theme === 'dark' ? 1 : 0.8; // Líneas un poco más visibles
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      });
      
      // Restaurar composición para otros elementos si los hubiera
      ctx.globalCompositeOperation = 'source-over';

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />;
};


interface LoginProps {
  onLoginSuccess: (user: any) => void;
  onForgotPassword?: () => void;
  onVisitPublic?: () => void;
}

export const Login = ({
  onLoginSuccess, 
  onForgotPassword, 
  onVisitPublic 
}: LoginProps) => {
  const auth = useAuth();
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());

  // Estados Formulario
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; name?: string; lastName?: string }>({});
  const [userCount, setUserCount] = useState<number | null>(null);
  const errorAlertRef = useRef<HTMLDivElement | null>(null);

  // Cargar correo guardado al montar (solo si el usuario marcó "Recordar correo" antes)
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(STORAGE_KEY_REMEMBER_EMAIL);
      if (savedEmail && savedEmail.trim()) {
        setEmail(savedEmail.trim());
        setRememberMe(true);
      }
    } catch {
      // Ignorar si localStorage no está disponible
    }
  }, []);

  // Contador de usuarios desde el backend (GET /system/info)
  useEffect(() => {
    let cancelled = false;
    apiClient.getPublic<{ user_count?: number }>('/system/info')
      .then((data: { user_count?: number }) => {
        if (!cancelled && typeof data?.user_count === 'number') setUserCount(data.user_count);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Enfocar el mensaje de error cuando aparece (accesibilidad)
  useEffect(() => {
    if (error && errorAlertRef.current) {
      errorAlertRef.current.focus({ preventScroll: false });
    }
  }, [error]);

  // Tema resuelto para el fondo animado (light/dark). No tocamos document; lo hace App + setAppTheme.
  const resolvedVisual = theme === 'system' ? (isDarkMode() ? 'dark' : 'light') : theme;

  const handleThemeChange = (newTheme: Theme) => {
    setAppTheme(newTheme);
    setThemeState(newTheme);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const emailTrim = email.trim();
    if (!emailTrim) {
      setFieldErrors({ email: 'El correo es obligatorio' });
      setError('Completa todos los campos');
      return;
    }
    if (!validateEmailFormat(emailTrim)) {
      setFieldErrors({ email: 'El correo no tiene un formato válido' });
      setError('Correo no válido');
      return;
    }
    if (!password) {
      setFieldErrors({ password: 'La contraseña es obligatoria' });
      setError('Completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await auth.login('DNI', '', password, emailTrim);

      if (loggedUser) {
        // Recordar correo: guardar solo email en localStorage (nunca la contraseña)
        try {
          if (rememberMe) {
            localStorage.setItem(STORAGE_KEY_REMEMBER_EMAIL, email.trim());
          } else {
            localStorage.removeItem(STORAGE_KEY_REMEMBER_EMAIL);
          }
        } catch {
          // Ignorar si localStorage no está disponible
        }

        const roleSlug = (loggedUser as { role_key?: string; role?: string }).role_key
          ?? (loggedUser as { role?: string }).role
          ?? '';
        const roleDisplay = (loggedUser as { role_display?: string }).role_display ?? 'Sin rol';
        const permissions = (loggedUser as { permissions?: string[] }).permissions ?? [];
        const user = {
          id: loggedUser.id,
          email: loggedUser.email,
          name: `${loggedUser.firstName} ${loggedUser.lastName}`.trim() || email.split('@')[0],
          role: roleSlug,
          role_key: roleSlug,
          role_display: roleDisplay,
          permissions,
          companyId: (loggedUser as { companyId?: number }).companyId,
        };

        toast.success('¡Bienvenido!', { description: `Sesión iniciada como ${user.name}` });
        onLoginSuccess(user);
      } else {
        throw new Error('Credenciales incorrectas');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const emailTrim = email.trim();
    const nameTrim = name.trim();
    if (!isLogin) {
      if (!nameTrim) {
        setFieldErrors((prev) => ({ ...prev, name: 'El nombre es obligatorio' }));
        setError('Completa nombre y correo');
        return;
      }
      if (!emailTrim) {
        setFieldErrors((prev) => ({ ...prev, email: 'El correo es obligatorio' }));
        setError('Completa nombre y correo');
        return;
      }
      if (!validateEmailFormat(emailTrim)) {
        setFieldErrors((prev) => ({ ...prev, email: 'El correo no tiene un formato válido' }));
        setError('Correo no válido');
        return;
      }
    }

    setLoading(true);
    try {
      await requestAccess({
        name: nameTrim,
        lastName: lastName.trim() || undefined,
        email: emailTrim,
      });
      toast.success('Solicitud enviada', {
        description: 'Recibirás un correo de confirmación. Un administrador te contactará cuando tu cuenta esté disponible.',
      });
      setIsLogin(true);
      setError(null);
      setFieldErrors({});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al enviar la solicitud';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /** Rellena email y contraseña con credenciales de prueba del backend (RolesAndPermissionsSeeder) */
  const quickLogin = (preset: 'admin' | 'company') => {
    setError(null);
    if (preset === 'admin') {
      setEmail('admin@sunatapi.com');
      setPassword('admin123456');
    } else {
      setEmail('company@sunatapi.com');
      setPassword('company123456');
    }
    toast.info('Credenciales cargadas. Haz clic en "Iniciar Sesión".');
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-[#0B0E14] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-500">
      
      {/* SECCIÓN IZQUIERDA: TECH ANIMATED BACKGROUND INTENSO */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-end p-12 overflow-hidden bg-slate-50 dark:bg-[#0B0E14] transition-colors duration-500">
        <TechBackground theme={resolvedVisual} />
        
        {/* Overlay sutil para legibilidad del texto flotante */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-50/80 via-transparent to-transparent dark:from-[#0B0E14]/80 dark:via-transparent dark:to-transparent pointer-events-none transition-colors duration-500" />
        
        {/* Contenido Flotante con Backdrop Blur para destacar sobre el caos de partículas */}
        <div className="relative z-20 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 backdrop-blur-[2px] rounded-xl p-4 border border-transparent dark:border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
            </div>
            <span className="text-xs font-mono text-green-600 dark:text-green-400 tracking-[0.2em] uppercase font-bold">Sistema en línea v1.0</span>
          </div>

          <h2 className="text-4xl xl:text-6xl font-black tracking-tighter mb-6 text-slate-900 dark:text-white leading-tight drop-shadow-sm">
            Bienvenido a<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600 dark:from-cyan-400 dark:to-fuchsia-500 filter drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              PetFlow
            </span>
          </h2>
          
          <p className="text-base xl:text-lg text-slate-700 dark:text-slate-300 max-w-md leading-relaxed border-l-4 border-cyan-500 pl-4 font-medium">
            Sistema Integral para servicios veterinarios y peluquería a domicilio. 
            Clientes, Operatividad y Gestión en tiempo real.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 xl:gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-cyan-300 bg-white/70 dark:bg-cyan-950/30 px-3 py-1.5 rounded-full border border-slate-200 dark:border-cyan-800/50 shadow-sm backdrop-blur-md">
              <Zap className="h-3 w-3 text-yellow-600 dark:text-yellow-400 fill-current" />
              <span>ACTIVO: 24/7</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-purple-300 bg-white/70 dark:bg-purple-950/30 px-3 py-1.5 rounded-full border border-slate-200 dark:border-purple-800/50 shadow-sm backdrop-blur-md">
              <Activity className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              <span>USUARIOS: {userCount !== null ? userCount.toLocaleString() : '…'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative bg-slate-50/90 dark:bg-[#0B0E14]/90 backdrop-blur-sm transition-colors duration-500 border-l border-slate-200/50 dark:border-slate-800/50">
        
        {/* Fondo animado también en la derecha pero más sutil (opcional, aquí he dejado que se vea el fondo base para limpieza visual del form) */}
        
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 z-50 shadow-md"
              aria-label="Cambiar tema"
            >
              {theme === 'light' && <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />}
              {theme === 'dark' && <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />}
              {theme === 'system' && <Monitor className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-2" align="end">
            <p className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tema</p>
            <div className="grid gap-0.5">
              <button type="button" onClick={() => handleThemeChange('light')} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm w-full text-left transition-colors ${theme === 'light' ? 'bg-amber-50 text-amber-800 dark:bg-slate-800 dark:text-amber-200 dark:ring-1 dark:ring-slate-600' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                <Sun className="h-4 w-4" /> Claro
              </button>
              <button type="button" onClick={() => handleThemeChange('dark')} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm w-full text-left transition-colors ${theme === 'dark' ? 'bg-indigo-50 text-indigo-800 dark:bg-slate-800 dark:text-indigo-200 dark:ring-1 dark:ring-slate-600' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                <Moon className="h-4 w-4" /> Oscuro
              </button>
              <button type="button" onClick={() => handleThemeChange('system')} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm w-full text-left transition-colors ${theme === 'system' ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:ring-1 dark:ring-slate-600' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                <Monitor className="h-4 w-4" /> Sistema
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-full max-w-md space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-500 z-10">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur-md opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse"></div>
                <div className="relative w-16 h-16 rounded-2xl bg-white dark:bg-[#1A1F2E] flex items-center justify-center ring-1 ring-slate-200 dark:ring-slate-800 shadow-xl">
                    <LogIn className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                </div>
            </div>
            
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Acceso Seguro</h1>
              <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 mt-2 text-xs sm:text-sm font-medium">
                <Cloud className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>PetFlow Cloud</span>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-6 mt-8">
            {error && (
              <Alert
                ref={errorAlertRef}
                variant="destructive"
                className="bg-red-50 border-red-200 text-red-600 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400"
                role="alert"
                tabIndex={-1}
                aria-live="assertive"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription id="login-error">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                   <div className="space-y-2">
                     <Label htmlFor="register-name" className="text-slate-700 dark:text-slate-300">Nombres</Label>
                     <Input
                       id="register-name"
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       className="bg-white/80 border-slate-200 h-10 dark:bg-[#1A1F2E]/80 dark:border-slate-800 backdrop-blur-sm"
                       placeholder="Juan"
                       aria-invalid={!!fieldErrors.name}
                       aria-describedby={fieldErrors.name ? 'login-error' : undefined}
                     />
                     {fieldErrors.name && <p className="text-xs text-red-600 dark:text-red-400" role="status">{fieldErrors.name}</p>}
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="register-lastName" className="text-slate-700 dark:text-slate-300">Apellidos</Label>
                     <Input
                       id="register-lastName"
                       value={lastName}
                       onChange={(e) => setLastName(e.target.value)}
                       className="bg-white/80 border-slate-200 h-10 dark:bg-[#1A1F2E]/80 dark:border-slate-800 backdrop-blur-sm"
                       placeholder="Pérez"
                       aria-invalid={!!fieldErrors.lastName}
                     />
                   </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm font-medium text-slate-700 dark:text-slate-200">Identificador (Email)</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" aria-hidden />
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-white/80 border-slate-200 dark:bg-[#1e293b]/50 dark:border-slate-800 transition-all focus-visible:ring-cyan-500 backdrop-blur-sm shadow-sm"
                    placeholder="usuario@sistema.com"
                    autoComplete="email"
                    aria-required="true"
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? 'login-error' : undefined}
                  />
                </div>
                {fieldErrors.email && <p className="text-xs text-red-600 dark:text-red-400" role="status">{fieldErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="login-password" className="text-sm font-medium text-slate-700 dark:text-slate-200">Clave de Acceso</Label>
                    {isLogin && onForgotPassword && (
                        <button type="button" onClick={onForgotPassword} className="text-xs font-medium text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors" aria-label="Recuperar contraseña">
                            ¿Olvidaste la clave?
                        </button>
                    )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" aria-hidden />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-white/80 border-slate-200 dark:bg-[#1e293b]/50 dark:border-slate-800 transition-all focus-visible:ring-cyan-500 backdrop-blur-sm shadow-sm"
                    placeholder="••••••••"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    aria-required="true"
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? 'login-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs text-red-600 dark:text-red-400" role="status">{fieldErrors.password}</p>}
              </div>

              {isLogin && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="border-slate-300 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                  />
                  <Label
                    htmlFor="remember-me"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                  >
                    Recordar correo (la contraseña no se guarda)
                  </Label>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/20 dark:shadow-purple-900/40 transition-all transform hover:scale-[1.01] active:scale-[0.99] border-0 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
              disabled={loading}
              aria-label={isLogin ? 'Iniciar sesión' : 'Registrar cuenta'}
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {isLogin ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                  {isLogin ? 'Iniciar Sesión' : 'Registrar Cuenta'}
                </div>
              )}
            </Button>
            
            <div className="text-center pt-2">
              <button 
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-medium inline-flex items-center group"
              >
                {isLogin ? 'Solicitar acceso / Crear cuenta' : 'Volver al inicio de sesión'}
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>

          <div className="pt-8 border-t border-slate-200 dark:border-slate-800/50 flex flex-col items-center gap-4">
            {SHOW_DEV_CREDENTIALS && (
              <>
                <p className="text-xs text-slate-500 dark:text-slate-400">Credenciales de prueba (backend Laravel):</p>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => quickLogin('admin')}
                    className="text-xs font-mono text-amber-600 bg-amber-50 px-3 py-1 rounded border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-500 dark:hover:bg-amber-900/50 transition-colors"
                  >
                    Admin (admin@sunatapi.com)
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLogin('company')}
                    className="text-xs font-mono text-cyan-600 bg-cyan-50 px-3 py-1 rounded border border-cyan-200 hover:bg-cyan-100 dark:bg-cyan-950/30 dark:border-cyan-900/50 dark:text-cyan-500 dark:hover:bg-cyan-900/50 transition-colors"
                  >
                    Empresa (company@sunatapi.com)
                  </button>
                </div>
              </>
            )}

            {onVisitPublic && (
                <button onClick={onVisitPublic} className="text-xs text-slate-400 hover:text-cyan-500 transition-colors flex items-center gap-1">
                    <Cloud className="h-3 w-3" /> smartpet.public.web
                </button>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export const useSession = () => {
  const getSession = () => {
    const localSession = localStorage.getItem('smartpet_session');
    if (localSession) { try { return JSON.parse(localSession); } catch { return null; } }
    const sessionSession = sessionStorage.getItem('smartpet_session');
    if (sessionSession) { try { return JSON.parse(sessionSession); } catch { return null; } }
    return null;
  };
  const clearSession = () => {
    localStorage.removeItem('smartpet_session');
    localStorage.removeItem('smartpet_user');
    sessionStorage.removeItem('smartpet_session');
  };
  return { getSession, clearSession };
};
