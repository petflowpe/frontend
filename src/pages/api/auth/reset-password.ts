/**
 * API Route: Restablecer contraseña
 * POST /api/auth/reset-password
 * 
 * Actualiza la contraseña del usuario
 */

import type { NextApiRequest, NextApiResponse } from 'next';

// Helper para hashear contraseña (en producción usar bcrypt)
const hashPassword = async (password: string): Promise<string> => {
  // 🎭 MOCK: Simple hash (NO usar en producción)
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // Mock: Solo invertir string para desarrollo
    return `mock_hash_${password.split('').reverse().join('')}`;
  }
  
  // 🔧 PRODUCCIÓN: Usar bcrypt
  /*
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
  */
  
  throw new Error('Bcrypt no configurado');
};

// Validar fortaleza de contraseña
const isStrongPassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Debe incluir al menos una mayúscula' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Debe incluir al menos una minúscula' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Debe incluir al menos un número' };
  }
  
  return { valid: true };
};

// 💾 MOCK: Actualizar contraseña en localStorage
const updatePasswordMock = async (email: string, hashedPassword: string): Promise<void> => {
  if (typeof window === 'undefined') {
    console.log(`🎭 MOCK: Contraseña actualizada para ${email}`);
    console.log(`Hash: ${hashedPassword}`);
    return;
  }
  
  const users = JSON.parse(localStorage.getItem('smartpet_users') || '{}');
  
  if (!users[email]) {
    users[email] = { email };
  }
  
  users[email].password = hashedPassword;
  users[email].updatedAt = new Date().toISOString();
  
  localStorage.setItem('smartpet_users', JSON.stringify(users));
  
  console.log(`✅ Contraseña actualizada para ${email}`);
};

// 🗄️ PRODUCCIÓN: Actualizar en backend Laravel
const updatePasswordProduction = async (email: string, hashedPassword: string): Promise<void> => {
  // TODO: Implementar endpoint en backend Laravel
  // const { apiClient } = await import('../../../utils/api/client');
  // await apiClient.post('/auth/reset-password', { email, password: hashedPassword });
  
  throw new Error('Backend Laravel no configurado para reset de contraseña');
};

// 💾 MOCK: Invalidar todos los códigos del email
const invalidateCodesMock = (email: string): void => {
  if (typeof window === 'undefined') return;
  
  const resetCodes = JSON.parse(localStorage.getItem('smartpet_reset_codes') || '{}');
  
  if (resetCodes[email]) {
    delete resetCodes[email];
    localStorage.setItem('smartpet_reset_codes', JSON.stringify(resetCodes));
  }
};

// 🗄️ PRODUCCIÓN: Invalidar códigos en backend Laravel
const invalidateCodesProduction = async (email: string): Promise<void> => {
  // TODO: Implementar endpoint en backend Laravel
  // const { apiClient } = await import('../../../utils/api/client');
  // await apiClient.post('/auth/invalidate-reset-codes', { email });
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
    const { email, password, confirmPassword, token } = req.body;

    // Validar datos
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ 
        error: 'Datos incompletos',
        message: 'Todos los campos son requeridos'
      });
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        error: 'Las contraseñas no coinciden',
        message: 'Por favor verifica que las contraseñas sean iguales'
      });
    }

    // Validar fortaleza de contraseña
    const passwordValidation = isStrongPassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        error: 'Contraseña débil',
        message: passwordValidation.message
      });
    }

    // TODO: Verificar token (en producción)
    // const isValidToken = await verifyToken(token, email);
    // if (!isValidToken) return res.status(401).json({ error: 'Token inválido' });

    // Hashear contraseña
    const hashedPassword = await hashPassword(password);

    // 🎭 MODO DESARROLLO
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // Mock: Actualizar contraseña
      await updatePasswordMock(email, hashedPassword);
      
      // Mock: Invalidar códigos
      invalidateCodesMock(email);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ CONTRASEÑA RESTABLECIDA (MOCK)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Email: ${email}`);
      console.log(`Nueva contraseña: ${password}`);
      console.log(`Hash: ${hashedPassword}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      return res.status(200).json({ 
        success: true,
        message: 'Contraseña actualizada exitosamente (MOCK)',
        _devInfo: {
          email,
          newPassword: password,
          hash: hashedPassword
        }
      });
    }

    // 🔧 MODO PRODUCCIÓN
    // Actualizar contraseña en Supabase
    await updatePasswordProduction(email, hashedPassword);
    
    // Invalidar códigos
    await invalidateCodesProduction(email);

    return res.status(200).json({ 
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error: any) {
    console.error('Error en reset-password:', error);
    
    return res.status(500).json({ 
      error: 'Error al restablecer contraseña',
      message: error.message || 'Intenta nuevamente'
    });
  }
}
