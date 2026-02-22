/**
 * Servicio de Recuperación de Contraseña (Cliente)
 * Funciona con API routes o mock en desarrollo
 */

// Detectar si estamos en modo desarrollo
const isDevelopment = () => {
  if (typeof window === 'undefined') return true;
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
};

// 💾 Helper para localStorage (solo cliente)
const getLocalStorage = (key: string): any => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

const setLocalStorage = (key: string, value: any): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

/**
 * PASO 1: Solicitar código de recuperación
 */
export const requestPasswordReset = async (email: string): Promise<{
  success: boolean;
  message: string;
  code?: string; // Solo en desarrollo
}> => {
  try {
    const dev = isDevelopment();

    if (dev) {
      // 🎭 MODO DESARROLLO: Mock local
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Guardar código en localStorage
      const resetCodes = getLocalStorage('smartpet_reset_codes') || {};
      resetCodes[email] = {
        code,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        used: false
      };
      setLocalStorage('smartpet_reset_codes', resetCodes);

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 800));

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 CÓDIGO DE RECUPERACIÓN (MODO DEV)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Email: ${email}`);
      console.log(`Código: ${code}`);
      console.log(`Expira en: 10 minutos`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return {
        success: true,
        message: 'Código generado (revisa la consola)',
        code // Devolver código en desarrollo para testing
      };
    }

    // 🔧 MODO PRODUCCIÓN: Llamar a API
    const response = await fetch('/api/auth/request-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al solicitar código');
    }

    return {
      success: true,
      message: data.message
    };

  } catch (error: any) {
    console.error('Error en requestPasswordReset:', error);
    return {
      success: false,
      message: error.message || 'Error al procesar solicitud'
    };
  }
};

/**
 * PASO 2: Verificar código de recuperación
 */
export const verifyResetCode = async (email: string, code: string): Promise<{
  success: boolean;
  message: string;
  token?: string;
}> => {
  try {
    const dev = isDevelopment();

    if (dev) {
      // 🎭 MODO DESARROLLO: Código de prueba o verificar localStorage
      
      // Código de prueba siempre válido
      if (code === '123456') {
        console.log('✅ Código de prueba aceptado');
        return {
          success: true,
          message: 'Código verificado',
          token: `mock_token_${email}_${Date.now()}`
        };
      }

      // Verificar código guardado en localStorage
      const resetCodes = getLocalStorage('smartpet_reset_codes') || {};
      const savedCode = resetCodes[email];

      if (!savedCode) {
        return {
          success: false,
          message: 'Código no encontrado. Solicita uno nuevo'
        };
      }

      if (savedCode.used) {
        return {
          success: false,
          message: 'Este código ya fue utilizado'
        };
      }

      if (new Date() > new Date(savedCode.expiresAt)) {
        return {
          success: false,
          message: 'El código ha expirado (10 min). Solicita uno nuevo'
        };
      }

      if (savedCode.code !== code) {
        return {
          success: false,
          message: 'Código incorrecto. Verifica e intenta nuevamente'
        };
      }

      // ✅ Código válido
      savedCode.used = true;
      setLocalStorage('smartpet_reset_codes', resetCodes);

      console.log('✅ Código verificado correctamente');

      return {
        success: true,
        message: 'Código verificado',
        token: `mock_token_${email}_${Date.now()}`
      };
    }

    // 🔧 MODO PRODUCCIÓN: Llamar a API
    const response = await fetch('/api/auth/verify-reset-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Código inválido');
    }

    return {
      success: true,
      message: data.message,
      token: data.token
    };

  } catch (error: any) {
    console.error('Error en verifyResetCode:', error);
    return {
      success: false,
      message: error.message || 'Error al verificar código'
    };
  }
};

/**
 * PASO 3: Restablecer contraseña
 */
export const resetPassword = async (
  email: string,
  password: string,
  confirmPassword: string,
  token: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const dev = isDevelopment();

    // Validaciones locales
    if (password !== confirmPassword) {
      return {
        success: false,
        message: 'Las contraseñas no coinciden'
      };
    }

    if (password.length < 8) {
      return {
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres'
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        success: false,
        message: 'Debe incluir al menos una mayúscula'
      };
    }

    if (!/[a-z]/.test(password)) {
      return {
        success: false,
        message: 'Debe incluir al menos una minúscula'
      };
    }

    if (!/[0-9]/.test(password)) {
      return {
        success: false,
        message: 'Debe incluir al menos un número'
      };
    }

    if (dev) {
      // 🎭 MODO DESARROLLO: Guardar en localStorage
      const users = getLocalStorage('smartpet_users') || {};
      
      users[email] = {
        email,
        password: `mock_hash_${password}`,
        updatedAt: new Date().toISOString()
      };
      
      setLocalStorage('smartpet_users', users);

      // Limpiar códigos
      const resetCodes = getLocalStorage('smartpet_reset_codes') || {};
      delete resetCodes[email];
      setLocalStorage('smartpet_reset_codes', resetCodes);

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ CONTRASEÑA RESTABLECIDA (MODO DEV)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Email: ${email}`);
      console.log(`Nueva contraseña: ${password}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        success: true,
        message: 'Contraseña actualizada exitosamente'
      };
    }

    // 🔧 MODO PRODUCCIÓN: Llamar a API
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, confirmPassword, token })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al restablecer contraseña');
    }

    return {
      success: true,
      message: data.message
    };

  } catch (error: any) {
    console.error('Error en resetPassword:', error);
    return {
      success: false,
      message: error.message || 'Error al restablecer contraseña'
    };
  }
};

/**
 * Helper: Validar fortaleza de contraseña en tiempo real
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  requirements: Array<{ met: boolean; text: string }>;
} => {
  const requirements = [
    { met: password.length >= 8, text: 'Mínimo 8 caracteres' },
    { met: /[A-Z]/.test(password), text: 'Una mayúscula' },
    { met: /[a-z]/.test(password), text: 'Una minúscula' },
    { met: /[0-9]/.test(password), text: 'Un número' }
  ];

  return {
    isValid: requirements.every(r => r.met),
    requirements
  };
};
