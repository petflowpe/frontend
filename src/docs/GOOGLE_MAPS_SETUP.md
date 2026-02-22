# 🗺️ Guía de Configuración: Google Maps API para SmartPet

## 📋 Tabla de Contenidos
1. [¿Por qué Google Maps?](#por-qué-google-maps)
2. [Requisitos Previos](#requisitos-previos)
3. [Obtener API Key de Google Maps](#obtener-api-key-de-google-maps)
4. [Configurar en SmartPet](#configurar-en-smartpet)
5. [APIs Necesarias](#apis-necesarias)
6. [Costos y Límites](#costos-y-límites)
7. [Solución de Problemas](#solución-de-problemas)

---

## 🎯 ¿Por qué Google Maps?

Google Maps API ofrece ventajas clave para SmartPet:

✅ **Mejor Experiencia Visual**
- Mapas de alta calidad y actualizados constantemente
- Street View integrado para verificar direcciones
- Imágenes satelitales y terreno

✅ **Funcionalidades Avanzadas**
- Geocoding preciso para Perú y Lima
- Optimización de rutas con Traffic Layer
- Clustering automático de marcadores
- Drawing tools para zonas de cobertura

✅ **Integración Completa**
- Places API para autocompletar direcciones
- Directions API para rutas optimizadas
- Distance Matrix API para cálculo de tiempos

✅ **Profesionalismo**
- Reconocido mundialmente
- Confiable para clientes
- Datos actualizados de Lima y distritos

---

## 📦 Requisitos Previos

Antes de comenzar necesitas:

1. **Cuenta de Google Cloud Platform (GCP)**
   - Gmail activo
   - Tarjeta de crédito/débito para verificación (no se cobra sin aprobación)

2. **Proyecto de Google Cloud**
   - Crear un proyecto nuevo o usar uno existente

3. **Facturación Habilitada**
   - Google ofrece $200 USD de crédito mensual gratis
   - Solo pagas si excedes el límite (muy difícil para tu escala)

---

## 🔑 Obtener API Key de Google Maps

### Paso 1: Acceder a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Acepta los términos de servicio si es primera vez

### Paso 2: Crear un Nuevo Proyecto

1. Haz clic en el selector de proyecto (arriba a la izquierda)
2. Clic en **"Nuevo Proyecto"**
3. Configura tu proyecto:
   ```
   Nombre del proyecto: SmartPet Clinica Veterinaria
   Organización: (opcional, deja en blanco)
   Ubicación: Sin organización
   ```
4. Clic en **"Crear"**
5. Espera 30 segundos a que se cree el proyecto

### Paso 3: Habilitar Facturación

1. En el menú lateral, ve a **"Facturación"**
2. Clic en **"Vincular una cuenta de facturación"**
3. Selecciona una cuenta existente o crea una nueva:
   - **País**: Perú
   - **Tipo de cuenta**: Empresa
   - Completa datos fiscales (RUC si tienes)
4. Agrega método de pago (tarjeta de crédito/débito)
   - ⚠️ **No se te cobrará sin tu aprobación**
   - Google ofrece **$200 USD gratis al mes**

### Paso 4: Habilitar las APIs Necesarias

1. Ve a **"APIs y Servicios"** > **"Biblioteca"**
2. Busca y habilita cada una de estas APIs (clic en **"HABILITAR"**):

   ✅ **Maps JavaScript API** (Obligatorio)
   - Para mostrar mapas interactivos
   
   ✅ **Geocoding API** (Obligatorio)
   - Convertir direcciones a coordenadas
   
   ✅ **Places API** (Recomendado)
   - Autocompletar direcciones de clientes
   
   ✅ **Directions API** (Recomendado)
   - Optimizar rutas de servicios móviles
   
   ✅ **Distance Matrix API** (Recomendado)
   - Calcular tiempos de viaje
   
   ✅ **Maps Static API** (Opcional)
   - Generar imágenes de mapas para reportes PDF

### Paso 5: Crear API Key

1. Ve a **"APIs y Servicios"** > **"Credenciales"**
2. Clic en **"+ Crear credenciales"** > **"Clave de API"**
3. Se generará tu API Key:
   ```
   Tu API Key: AIzaSyC_TuClaveAquí123456789ABCDEFGHIJK
   ```
4. **⚠️ ¡IMPORTANTE!** Copia y guarda esta clave de forma segura

### Paso 6: Restringir la API Key (Seguridad)

🔒 **MUY IMPORTANTE para evitar uso no autorizado:**

1. En la lista de credenciales, clic en tu API Key recién creada
2. En **"Restricciones de la aplicación"**:
   - Selecciona **"Referentes HTTP (sitios web)"**
   - Agrega estos referentes:
     ```
     http://localhost:*
     https://tu-dominio.com/*
     https://*.netlify.app/*
     https://*.vercel.app/*
     ```

3. En **"Restricciones de API"**:
   - Selecciona **"Restringir clave"**
   - Marca las APIs que habilitaste:
     - ✅ Maps JavaScript API
     - ✅ Geocoding API
     - ✅ Places API
     - ✅ Directions API
     - ✅ Distance Matrix API

4. Clic en **"Guardar"**

---

## ⚙️ Configurar en SmartPet

### Opción A: Variable de Entorno (Recomendado para Producción)

1. Crea un archivo `.env.local` en la raíz del proyecto:
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyC_TuClaveAquí123456789ABCDEFGHIJK
   ```

2. En tu configuración de despliegue (Netlify/Vercel):
   - Ve a Settings > Environment Variables
   - Agrega: `VITE_GOOGLE_MAPS_API_KEY` = tu clave

3. Reinicia tu servidor de desarrollo:
   ```bash
   npm run dev
   ```

### Opción B: Configuración en la Aplicación (Desarrollo)

1. Inicia sesión como **Admin** en SmartPet
2. Ve a **"Configuración"** > **"Integraciones"**
3. Busca la sección **"Google Maps API"**
4. Pega tu API Key y guarda
5. El sistema validará automáticamente la clave

---

## 💰 Costos y Límites

### Crédito Mensual Gratis

Google ofrece **$200 USD de crédito gratis cada mes**, que equivale a:

| Servicio | Uso Mensual Gratis | Estimado SmartPet |
|----------|-------------------|-------------------|
| Maps JavaScript API | 28,000 cargas | 📊 ~500/mes |
| Geocoding API | 40,000 requests | 📊 ~200/mes |
| Directions API | 40,000 requests | 📊 ~150/mes |
| Places API | 50,000 requests | 📊 ~100/mes |

### Costo Real Estimado para SmartPet

Con tu volumen actual (21 clientes, 3 rutas):
- **Costo mensual estimado**: $0 USD
- **% del crédito usado**: ~2-3%
- **Margen de crecimiento**: Puedes llegar a 500+ clientes sin pagar

### Alertas de Facturación (Recomendado)

1. En Google Cloud Console > **"Facturación"** > **"Presupuestos y alertas"**
2. Crea un presupuesto:
   ```
   Nombre: SmartPet Alerta Maps
   Monto: $10 USD/mes
   Alerta al: 50%, 75%, 100%
   ```
3. Recibirás emails si te acercas al límite

---

## 🔍 APIs Necesarias

### 1. Maps JavaScript API (Obligatorio)
**Uso**: Mostrar mapas interactivos
**Funciones**:
- Visualizar clientes en el mapa
- Marcadores personalizados por categoría
- Zonas de cobertura
- Heat maps de demanda

### 2. Geocoding API (Obligatorio)
**Uso**: Convertir direcciones a coordenadas
**Funciones**:
- Cuando cliente ingresa "Av. Larco 1234, Miraflores"
- Convertir a: lat: -12.1195, lng: -77.0282
- Validar direcciones antes de agendar citas

### 3. Places API (Recomendado)
**Uso**: Autocompletar direcciones
**Funciones**:
- Cliente escribe "Av. Lar..." y aparece "Av. Larco, Miraflores"
- Mejor UX en formularios de reserva
- Validar que la dirección existe

### 4. Directions API (Recomendado)
**Uso**: Optimizar rutas de servicios
**Funciones**:
- Calcular ruta óptima para conductor/peluquero/veterinario
- Considerar tráfico en tiempo real
- Estimar tiempos de llegada (ETAs)

### 5. Distance Matrix API (Recomendado)
**Uso**: Calcular distancias y tiempos
**Funciones**:
- ¿Cuánto tarda de Cliente A a Cliente B?
- Optimización de rutas diarias
- Asignación inteligente de vehículos

---

## 🐛 Solución de Problemas

### Error: "This API project is not authorized to use this API"

**Solución**:
1. Ve a Google Cloud Console > APIs y Servicios > Biblioteca
2. Busca "Maps JavaScript API"
3. Verifica que esté **HABILITADA** (botón verde)
4. Espera 2-3 minutos para propagación

### Error: "API key not valid"

**Solución**:
1. Verifica que copiaste la clave completa (sin espacios)
2. Revisa restricciones de referentes HTTP
3. Asegúrate que la API Key está activa (no eliminada)

### Error: "RefererNotAllowedMapError"

**Solución**:
1. Ve a Credenciales > Tu API Key
2. En "Restricciones de la aplicación" > "Referentes HTTP"
3. Agrega: `http://localhost:*` y `https://*.tu-dominio.com/*`
4. Guarda y espera 5 minutos

### El mapa aparece en gris

**Solución**:
1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Usualmente es porque falta habilitar "Maps JavaScript API"
4. O la API Key no tiene permisos

### Error de Facturación

**Solución**:
1. Ve a Facturación en Google Cloud Console
2. Verifica que tu tarjeta esté activa
3. Revisa que el proyecto tenga facturación vinculada
4. Contacta soporte de Google si persiste

---

## 📞 Soporte

### Documentación Oficial
- [Google Maps Platform](https://developers.google.com/maps)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)
- [Code Samples](https://developers.google.com/maps/documentation/javascript/examples)

### Contacto Google Cloud
- Email: [Google Cloud Support](https://cloud.google.com/support)
- Teléfono: +1 877-355-5787 (Inglés)
- Chat: Disponible en consola de Google Cloud

### Soporte SmartPet
Si tienes problemas específicos con la integración en SmartPet:
1. Revisa esta documentación completa
2. Verifica los logs en la consola del navegador
3. Contacta al equipo de desarrollo

---

## ✅ Checklist de Configuración

Usa este checklist para verificar que todo esté listo:

- [ ] Cuenta de Google Cloud creada
- [ ] Proyecto "SmartPet" creado
- [ ] Facturación habilitada con tarjeta
- [ ] Maps JavaScript API habilitada
- [ ] Geocoding API habilitada
- [ ] Places API habilitada
- [ ] Directions API habilitada
- [ ] Distance Matrix API habilitada
- [ ] API Key creada
- [ ] API Key restringida (seguridad)
- [ ] API Key configurada en SmartPet
- [ ] Mapa visible en la aplicación
- [ ] Marcadores de clientes funcionando
- [ ] Alertas de presupuesto configuradas

---

## 🚀 Próximos Pasos

Una vez configurado Google Maps:

1. **Prueba el Mapa de Clientes**
   - Ve a Dashboard > Análisis Geográfico
   - Verifica que los 21 clientes aparezcan correctamente
   - Prueba los filtros por categoría (Oro, Bronce, Plata)

2. **Optimiza Rutas**
   - Ve a Rutas > Optimizador
   - Crea rutas inteligentes con Google Directions
   - Asigna vehículos según capacidad

3. **Geocodifica Clientes Antiguos**
   - Importa clientes existentes
   - El sistema geocodificará direcciones automáticamente
   - Valida ubicaciones manualmente si es necesario

4. **Configura Zonas de Cobertura**
   - Define polígonos de zonas (Miraflores, San Isidro, etc.)
   - Establece tarifas por zona
   - Optimiza asignación de personal

---

**¡Listo!** 🎉 Ahora tienes Google Maps completamente integrado en SmartPet.
