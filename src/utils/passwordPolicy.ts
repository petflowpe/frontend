/** Política alineada con Laravel Password::min(8)->letters()->mixedCase()->numbers() */
export function validateStaffPassword(password: string): string | null {
  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }
  if (!/[a-z]/.test(password)) {
    return 'La contraseña debe incluir al menos una letra minúscula';
  }
  if (!/[A-Z]/.test(password)) {
    return 'La contraseña debe incluir al menos una letra mayúscula';
  }
  if (!/[0-9]/.test(password)) {
    return 'La contraseña debe incluir al menos un número';
  }
  return null;
}
