# 🚀 Google Maps - Guía Rápida de Inicio

## ⏱️ Configuración en 5 minutos

Esta guía te permitirá tener Google Maps funcionando en SmartPet en menos de 5 minutos.

---

## Paso 1: Obtener API Key (3 minutos)

### 1.1 Ir a Google Cloud Console
👉 **[Abrir Google Cloud Console](https://console.cloud.google.com/)**

### 1.2 Crear Proyecto Nuevo
1. Clic en selector de proyecto (arriba izquierda)
2. Clic en **"NUEVO PROYECTO"**
3. Nombre: `SmartPet`
4. Clic en **"CREAR"**
5. Espera 30 segundos ⏳

### 1.3 Habilitar Facturación
1. Menú ☰ > **"Facturación"**
2. Clic en **"Vincular cuenta de facturación"**
3. Crear nueva cuenta
4. Agregar tarjeta (no se cobra, $200 gratis/mes)

### 1.4 Habilitar APIs
1. Menú ☰ > **"APIs y Servicios"** > **"Biblioteca"**
2. Buscar y **HABILITAR** estas 2 APIs obligatorias:
   - ✅ **Maps JavaScript API**
   - ✅ **Geocoding API**

### 1.5 Crear API Key
1. Menú ☰ > **"APIs y Servicios"** > **"Credenciales"**
2. Clic en **"+ CREAR CREDENCIALES"** > **"Clave de API"**
3. **COPIAR** tu API Key:
   ```
   AIzaSyC_TuClaveAquí123456789ABCDEFGHIJK
   ```
4. Clic en **"CERRAR"**

---

## Paso 2: Configurar en SmartPet (1 minuto)

### Opción A: Variable de Entorno (Recomendado)

1. Crear archivo `.env.local` en la raíz del proyecto:
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyC_TuClaveAquí123456789ABCDEFGHIJK
   ```

2. Reiniciar servidor:
   ```bash
   npm run dev
   ```

### Opción B: Configuración en la App

1. Inicia sesión como **Admin**
2. Ve a **Configuración** > **Integraciones**
3. Pega tu API Key en **"Google Maps API"**
4. Clic en **"Guardar"**

---

## Paso 3: Verificar Funcionamiento (1 minuto)

1. Ve a **Dashboard** > **Análisis Geográfico**
2. Deberías ver el mapa de Google Maps con tus clientes
3. ✅ **¡Listo!** Google Maps está funcionando

---

## 🔒 Paso 4: Seguridad (Opcional pero Recomendado)

### Restringir API Key

1. Google Cloud Console > **"Credenciales"**
2. Clic en tu API Key
3. En **"Restricciones de la aplicación"**:
   - Selecciona **"Referentes HTTP (sitios web)"**
   - Agrega:
     ```
     http://localhost:*
     https://tu-dominio.com/*
     ```
4. En **"Restricciones de API"**:
   - Selecciona **"Restringir clave"**
   - Marca: Maps JavaScript API, Geocoding API
5. Clic en **"GUARDAR"**

---

## ❓ Problemas Comunes

### El mapa no se muestra

**Solución:**
1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Verifica que la API Key esté correcta
4. Asegúrate de habilitar "Maps JavaScript API"

### Error: "This API project is not authorized"

**Solución:**
1. Ve a Google Cloud Console
2. Habilita "Maps JavaScript API" en Biblioteca
3. Espera 2-3 minutos

### Error: "RefererNotAllowedMapError"

**Solución:**
1. Ve a Credenciales > Tu API Key
2. Agrega `http://localhost:*` en Referentes HTTP
3. Guarda y espera 5 minutos

---

## 📊 ¿Qué Puedes Hacer Ahora?

Con Google Maps configurado puedes:

✅ **Ver Clientes en Mapa**
- Visualizar todos tus clientes por ubicación
- Filtrar por categoría (Oro, Bronce, Plata)
- Ver información detallada al hacer clic

✅ **Optimizar Rutas**
- Crear rutas eficientes para servicios móviles
- Calcular tiempos de viaje
- Asignar vehículos inteligentemente

✅ **Analizar Zonas**
- Identificar zonas de alta demanda
- Definir áreas de cobertura
- Planificar expansión

✅ **Geocodificar Direcciones**
- Convertir direcciones a coordenadas automáticamente
- Validar ubicaciones de clientes
- Autocompletar direcciones en formularios

---

## 📈 Monitorear Uso

Para ver cuánto estás usando:

1. Google Cloud Console > **"APIs y Servicios"** > **"Panel"**
2. Verás gráficas de uso diario
3. Con ~21 clientes, usarás menos del 1% del crédito gratis

---

## 💰 Costos

| Concepto | Valor |
|----------|-------|
| Crédito mensual gratis | $200 USD |
| Costo estimado SmartPet | $0 USD |
| Margen disponible | ~98% |

**No pagarás nada** con tu volumen actual. Puedes crecer hasta 500+ clientes sin costos.

---

## 📚 Recursos Adicionales

- 📖 [Guía Completa de Configuración](/docs/GOOGLE_MAPS_SETUP.md)
- 🗺️ [Documentación Google Maps](https://developers.google.com/maps/documentation)
- 💵 [Calculadora de Precios](https://mapsplatform.google.com/pricing/)

---

## ✅ Checklist Final

- [ ] Proyecto creado en Google Cloud
- [ ] Facturación habilitada
- [ ] Maps JavaScript API habilitada
- [ ] Geocoding API habilitada
- [ ] API Key creada
- [ ] API Key configurada en SmartPet
- [ ] Mapa visible en Análisis Geográfico
- [ ] API Key restringida (seguridad)

---

**¡Felicidades!** 🎉 Ya tienes Google Maps funcionando en SmartPet.

Ahora puedes visualizar tus clientes, optimizar rutas y ofrecer un mejor servicio a domicilio para tu clínica veterinaria móvil.
