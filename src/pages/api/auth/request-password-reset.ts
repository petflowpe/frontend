/**
 * API Route: Solicitar recuperación de contraseña
 * POST /api/auth/request-password-reset
 * 
 * Genera código de 6 dígitos y lo envía por email
 */

import type { NextApiRequest, NextApiResponse } from 'next';

// Helper para generar código de 6 dígitos
const generateResetCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper para validar email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 🎭 MOCK: Simular envío de email (en desarrollo)
const sendEmailMock = async (email: string, code: string): Promise<void> => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 MOCK EMAIL ENVIADO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Para: ${email}`);
  console.log(`Asunto: Código de recuperación SmartPet`);
  console.log(`Código: ${code}`);
  console.log(`Expira en: 10 minutos`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 500));
};

// 🔧 PRODUCCIÓN: Enviar email real con SendGrid/Mailgun
const sendEmailProduction = async (email: string, code: string): Promise<void> => {
  // TODO: Implementar cuando tengas API key
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  await sgMail.send({
    to: email,
    from: 'noreply@smartpet.com',
    subject: 'Código de recuperación SmartPet',
    html: `
      <h2>Recuperación de contraseña</h2>
      <p>Tu código de verificación es:</p>
      <h1 style="font-size: 32px; letter-spacing: 5px;">${code}</h1>
      <p>Este código expira en 10 minutos.</p>
    `
  });
  */
  
  throw new Error('Servicio de email no configurado. Configura SENDGRID_API_KEY o MAILGUN_API_KEY');
};

// 💾 Guardar código en localStorage (MOCK - en producción usar Supabase)
const saveResetCodeMock = (email: string, code: string): void => {
  const resetCodes = JSON.parse(localStorage.getItem('smartpet_reset_codes') || '{}');
  
  resetCodes[email] = {
    code,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
    used: false
  };
  
  localStorage.setItem('smartpet_reset_codes', JSON.stringify(resetCodes));
};

// 🗄️ PRODUCCIÓN: Guardar en backend Laravel
const saveResetCodeProduction = async (email: string, code: string): Promise<void> => {
  // TODO: Implementar endpoint en backend Laravel
  // const { apiClient } = await import('../../../utils/api/client');
  // await apiClient.post('/auth/request-password-reset', { email, code });
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
    const { email } = req.body;

    // Validar email
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ 
        error: 'Email inválido',
        message: 'Por favor ingresa un email válido'
      });
    }

    // TODO: Verificar que el email existe en la base de datos
    // const { apiClient } = await import('../../../utils/api/client');
    // const user = await apiClient.get(`/users?email=${email}`);
    // if (!user) return res.status(404).json({ error: 'Email no encontrado' });

    // Generar código
    const code = generateResetCode();

    // 🎭 MODO DESARROLLO: Usar mock
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // Mock: Guardar en localStorage (cliente)
      // En el cliente, haremos esto directamente
      console.log(`🎭 MODO DESARROLLO: Código generado para ${email}: ${code}`);
      
      // Mock: Enviar email simulado
      await sendEmailMock(email, code);
      
      return res.status(200).json({ 
        success: true,
        message: 'Código enviado (MOCK - revisa consola)',
        // 🎭 Solo en desarrollo: devolver código para testing
        _devCode: code
      });
    }

    // 🔧 MODO PRODUCCIÓN
    // Guardar en Supabase
    await saveResetCodeProduction(email, code);
    
    // Enviar email real
    await sendEmailProduction(email, code);

    return res.status(200).json({ 
      success: true,
      message: 'Código enviado a tu email'
    });

  } catch (error: any) {
    console.error('Error en request-password-reset:', error);
    
    return res.status(500).json({ 
      error: 'Error al procesar solicitud',
      message: error.message || 'Intenta nuevamente más tarde'
    });
  }
}
