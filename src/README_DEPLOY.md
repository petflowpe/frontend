# 🚀 Guía de Despliegue - SmartPet Production

Esta guía detalla los pasos para desplegar tu aplicación SmartPet para pruebas de campo con tu equipo.

## 1. Requisitos Previos

Asegúrate de tener acceso a las siguientes credenciales de Supabase (las mismas que has estado usando):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Solo para funciones del servidor, no exponer en frontend)

## 2. Opciones de Despliegue

### Opción A: Vercel (Recomendado para React)

1.  Crea una cuenta en [Vercel](https://vercel.com).
2.  Importa tu repositorio de GitHub.
3.  En la configuración del proyecto, ve a **Environment Variables** y agrega:
    *   `VITE_SUPABASE_URL`: Tu URL de Supabase.
    *   `VITE_SUPABASE_ANON_KEY`: Tu Anon Key de Supabase.
    *   *(Nota: Vite requiere el prefijo `VITE_` para exponerlas al frontend)*
4.  El comando de build por defecto debería ser `npm run build` y el directorio de salida `dist`.
5.  Haz clic en **Deploy**.

### Opción B: Netlify

Similar a Vercel, conecta tu repositorio y configura las variables de entorno en "Site settings" > "Build & deploy" > "Environment".

## 3. Backend (Supabase Edge Functions)

Tu backend actual vive en `/supabase/functions/server`. Para que funcione en producción:

1.  Asegúrate de que tu proyecto de Supabase tenga las Edge Functions habilitadas.
2.  Despliega la función usando la CLI de Supabase (si tienes acceso local):
    ```bash
    supabase functions deploy server --no-verify-jwt
    ```
    *Nota: Si estás usando el entorno de Make, esto ya está gestionado automáticamente.*

## 4. Verificación Post-Despliegue

Una vez desplegado (obtendrás una URL como `smartpet-app.vercel.app`):

1.  **Login Admin:** Ingresa con tus credenciales.
2.  **Crea Usuarios:** Ve a la pestaña **Gestión de Usuarios** y crea cuentas para tus choferes con el rol `conductor`.
3.  **Configura Zonas:** Ve a **Rutas** > **Gestionar Zonas** y asegúrate de que tus zonas definitivas estén creadas.
4.  **Prueba de Chofer:**
    *   Pide a un chofer que entre a la URL desde su móvil.
    *   Debe ingresar sus credenciales.
    *   Verá automáticamente la interfaz simplificada de "App Chofer".

## 5. URLs Importantes para tu Equipo

*   **Administración:** `https://tu-dominio.com/` (Requiere Login)
*   **App Chofer:** `https://tu-dominio.com/` (Detecta rol automáticamente)
*   **Tracking Público (Clientes):** `https://tu-dominio.com/?tab=public-tracking` (No requiere Login)

---
*Generado para SmartPet - 2024*
