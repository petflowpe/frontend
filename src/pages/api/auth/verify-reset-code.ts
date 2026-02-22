/**
 * API Route: Verificar código de recuperación
 * POST /api/auth/verify-reset-code
 * 
 * Valida que el código sea correcto y no haya expirado
 */

import type { NextApiRequest, NextApiResponse } from 'next';

// 💾 MOCK: Obtener código de localStorage
const getResetCodeMock = (email: string): any => {
  if (typeof window === 'undefined') {
    // En servidor, retornar código de prueba
    return {
      code: '123456', // Código de prueba para desarrollo
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      used: false
    };
  }
  
  const resetCodes = JSON.parse(localStorage.getItem('smartpet_reset_codes') || '{}');
  return resetCodes[email] || null;
};

// 🗄️ PRODUCCIÓN: Obtener del backend Laravel
const getResetCodeProduction = async (email: string, code: string): Promise<any> => {
  // TODO: Implementar endpoint en backend Laravel
  // const { apiClient } = await import('../../../utils/api/client');
  // return await apiClient.post('/auth/verify-reset-code', { email, code });
  
  throw new Error('Backend Laravel no configurado para reset de contraseña');
};

// 💾 MOCK: Marcar código como usado
const markCodeAsUsedMock = (email: string): void => {
  if (typeof window === 'undefined') return;
  
  const resetCodes = JSON.parse(localStorage.getItem('smartpet_reset_codes') || '{}');
  
  if (resetCodes[email]) {
    resetCodes[email].used = true;
    localStorage.setItem('smartpet_reset_codes', JSON.stringify(resetCodes));
  }
};

// 🗄️ PRODUCCIÓN: Marcar en backend Laravel
const markCodeAsUsedProduction = async (email: string, code: string): Promise<void> => {
  // TODO: Implementar endpoint en backend Laravel
  // const { apiClient } = await import('../../../utils/api/client');
  // await apiClient.post('/auth/mark-reset-code-used', { email, code });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { email, code } = req.body;

    // Validar datos
    if (!email || !code) {
      return res.status(400).json({ 
        error: 'Datos incompletos',
        message: 'Email y código son requeridos'
      });
    }

    // Validar formato de código
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ 
        error: 'Código inválido',
        message: 'El código debe tener 6 dígitos'
      });
    }

    // 🎭 MODO DESARROLLO
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // Mock: Código de prueba siempre válido
      const testCode = '123456';
      
      if (code === testCode) {
        console.log(`✅ Código de prueba aceptado para ${email}`);
        
        return res.status(200).json({ 
          success: true,
          message: 'Código verificado (MOCK)',
          token: `mock_token_${email}_${Date.now()}`
        });
      }
      
      // Mock: Obtener código guardado
      const savedCode = getResetCodeMock(email);
      
      if (!savedCode) {
        return res.status(404).json({ 
          error: 'Código no encontrado',
          message: 'No hay código de recuperación para este email'
        });
      }

      // Verificar si está usado
      if (savedCode.used) {
        return res.status(400).json({ 
          error: 'Código ya usado',
          message: 'Este código ya fue utilizado'
        });
      }

      // Verificar si expiró
      if (new Date() > new Date(savedCode.expiresAt)) {
        return res.status(400).json({ 
          error: 'Código expirado',
          message: 'El código ha expirado. Solicita uno nuevo'
        });
      }

      // Verificar código
      if (savedCode.code !== code) {
        return res.status(400).json({ 
          error: 'Código incorrecto',
          message: 'El código no coincide'
        });
      }

      // ✅ Código válido - marcar como usado
      markCodeAsUsedMock(email);

      return res.status(200).json({ 
        success: true,
        message: 'Código verificado',
        token: `mock_token_${email}_${Date.now()}`
      });
    }

    // 🔧 MODO PRODUCCIÓN
    const savedCode = await getResetCodeProduction(email, code);
    
    if (!savedCode) {
      return res.status(404).json({ 
        error: 'Código no encontrado',
        message: 'Código inválido o no existe'
      });
    }

    // Verificar expiración
    if (new Date() > new Date(savedCode.expires_at)) {
      return res.status(400).json({ 
        error: 'Código expirado',
        message: 'El código ha expirado. Solicita uno nuevo'
      });
    }

    // Marcar como usado
    await markCodeAsUsedProduction(email, code);

    return res.status(200).json({ 
      success: true,
      message: 'Código verificado',
      token: `token_${email}_${Date.now()}` // TODO: Generar JWT real
    });

  } catch (error: any) {
    console.error('Error en verify-reset-code:', error);
    
    return res.status(500).json({ 
      error: 'Error al verificar código',
      message: error.message || 'Intenta nuevamente'
    });
  }
}
