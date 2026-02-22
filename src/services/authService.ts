/**
 * Servicios de autenticación: recuperación y restablecimiento de contraseña vía API Laravel (envío de correo).
 */

import { apiClient } from '../utils/api/client';

export interface ForgotPasswordResponse {
  message: string;
  status: string;
  token?: string;
  email?: string;
}

export interface ResetPasswordResponse {
  message: string;
  status: string;
}

export interface RequestAccessResponse {
  message: string;
  status: string;
}

/**
 * Solicitar recuperación de contraseña. El backend envía un correo con enlace para restablecer.
 */
export async function forgotPasswordEmail(email: string): Promise<ForgotPasswordResponse> {
  const response = await apiClient.postPublic<ForgotPasswordResponse>('/auth/forgot-password', {
    email: email.trim(),
  });
  return response as ForgotPasswordResponse;
}

/**
 * Restablecer contraseña con el token recibido por correo.
 */
export async function resetPasswordWithToken(
  email: string,
  token: string,
  password: string,
  password_confirmation: string
): Promise<ResetPasswordResponse> {
  const response = await apiClient.postPublic<ResetPasswordResponse>('/auth/reset-password', {
    email: email.trim(),
    token,
    password,
    password_confirmation,
  });
  return response as ResetPasswordResponse;
}

/**
 * Solicitar acceso al sistema (registro). El backend envía correo al admin y confirmación al usuario.
 */
export async function requestAccess(data: {
  name: string;
  lastName?: string;
  email: string;
  message?: string;
}): Promise<RequestAccessResponse> {
  const response = await apiClient.postPublic<RequestAccessResponse>('/auth/request-access', {
    name: [data.name, data.lastName].filter(Boolean).join(' ').trim() || data.name,
    email: data.email.trim(),
    message: data.message?.trim() || undefined,
  });
  return response as RequestAccessResponse;
}
