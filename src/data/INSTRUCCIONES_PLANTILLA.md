# 📊 Instrucciones: Plantilla de Datos para Análisis Geográfico SmartPet

## 🎯 Objetivo
Estos archivos CSV te permiten proporcionar los datos de tu negocio para que el sistema analice patrones geográficos y genere recomendaciones de zonificación y distribución de vehículos.

---

## 📁 Archivos Incluidos

### 1. `template_clientes.csv`
**Contiene:** Información básica de todos tus clientes

**Campos obligatorios:**
- `id_cliente` - ID único del cliente (puede ser tu código interno)
- `nombre_cliente` - Nombre del cliente (puede anonimizar: "Cliente_001")
- `direccion_completa` - Dirección completa del cliente
- `distrito` - Distrito de Lima donde vive el cliente
- `numero_mascotas` - Total de mascotas que tiene
- `mascotas_activas` - Cuántas mascotas tiene actualmente
- `categoria_actual` - oro/bronce/plata (si ya la tienes, sino déjala en blanco)

**Campos opcionales pero muy útiles:**
- `latitud` y `longitud` - ⚠️ **NUEVO**: Ya NO necesitas ingresarlas manualmente. El sistema las calcula automáticamente basándose en la dirección. Si las dejas en blanco o en "0", el sistema usará Google Geocoding API para detectarlas.
- `telefono` y `email` - Para contacto
- `horario_preferido` - mañana/tarde/noche
- `dia_preferido` - lunes, martes, etc.
- `observaciones` - Notas especiales del cliente

**Ejemplo de fila:**
```
C001,Juan Pérez,Av. Larco 1234 Miraflores,Miraflores,-12.1195,-77.0282,5,4,oro,987654321,...
```

---

### 2. `template_historial_citas.csv`
**Contiene:** Historial de citas de los últimos 3 meses (octubre-diciembre 2024)

**Campos obligatorios:**
- `id_cita` - ID único de la cita
- `id_cliente` - Debe coincidir con id_cliente de template_clientes.csv
- `fecha_cita` - Formato: YYYY-MM-DD (ejemplo: 2024-12-15)
- `hora_cita` - Formato: HH:MM (ejemplo: 14:30)
- `tipo_servicio` - peluquería/veterinaria/baño/otro
- `duracion_minutos` - Cuánto duró el servicio (30, 60, 90, etc.)
- `estado_cita` - completada/cancelada/no_show
- `monto_facturado` - Monto en soles (sin símbolo S/)

**Campos opcionales:**
- `vehiculo_asignado` - Si tienes el dato
- `empleado_asignado` - Quién atendió
- `calificacion_servicio` - 1 a 5 estrellas
- `distrito_servicio` - Normalmente es el mismo que el del cliente

**Ejemplo de fila:**
```
CITA001,C001,2024-12-15,14:30,peluquería,60,completada,180.00,Vehículo 1,...
```

---

### 3. `template_flota_vehiculos.csv`
**Contiene:** Información de tus vehículos actuales

**Campos obligatorios:**
- `id_vehiculo` - ID único del vehículo (VEH001, VEH002, etc.)
- `nombre_vehiculo` - Nombre que le das al vehículo
- `tipo_vehiculo` - Van móvil/Van compacta/Camioneta/Otro
- `capacidad_citas_dia` - Cuántas citas puede hacer por día
- `zona_operacion_actual` - Zona donde opera actualmente
- `distrito_base` - Distrito base de operación
- `estado_actual` - activo/mantenimiento/inactivo

**Campos opcionales:**
- `año_adquisicion`, `placa`, `marca_modelo`, `equipamiento`, `observaciones`

**Ejemplo de fila:**
```
VEH001,Vehículo 1,Van móvil,8,Zona Centro,Miraflores,activo,2023,...
```

---

## 🔧 Cómo Usar Estos Archivos

### Método 1: Abrir en Excel (Recomendado)

1. **Abre Excel**
2. **Archivo > Abrir** y selecciona `template_clientes.csv`
3. Excel detectará automáticamente las columnas
4. **Reemplaza los datos de ejemplo** con tus datos reales
5. **Mantén los nombres de las columnas** (primera fila)
6. **Guarda como Excel (.xlsx)** o mantén en CSV

### Método 2: Abrir en Google Sheets

1. **Ve a Google Sheets** (sheets.google.com)
2. **Archivo > Importar** y sube `template_clientes.csv`
3. **Edita los datos** con tus datos reales
4. **Descarga como Excel (.xlsx)** o CSV cuando termines

---

## ✏️ Llenar los Datos

### Paso 1: Exporta tus datos actuales

Si tienes tus datos en un sistema existente:
- Exporta la lista de clientes
- Exporta el historial de citas de octubre-diciembre 2024
- Lista tus vehículos actuales

### Paso 2: Copia y pega en la plantilla

1. **Abre template_clientes.csv** en Excel
2. **Borra las filas de ejemplo** (desde la fila 2 en adelante)
3. **Copia tus datos** y pégalos manteniendo el formato
4. **Verifica que las columnas coincidan**

### Paso 3: Revisa campos importantes

**Para clientes:**
- ✅ Verifica que `distrito` esté bien escrito (Miraflores, San Isidro, etc.)
- ✅ Si NO tienes `latitud` y `longitud`, déjalas en blanco o con "0"
- ✅ `numero_mascotas` debe ser un número (1, 2, 3, etc.)
- ✅ `categoria_actual` puede estar en blanco si no la calculaste

**Para citas:**
- ✅ `fecha_cita` debe ser YYYY-MM-DD (2024-12-15)
- ✅ `hora_cita` debe ser HH:MM (14:30)
- ✅ `id_cliente` debe existir en template_clientes.csv
- ✅ `monto_facturado` debe ser número sin símbolo (180.00)

---

## 🚫 Errores Comunes a Evitar

### ❌ NO cambies los nombres de las columnas
```
Mal:  ID_Cliente, Nombre del Cliente
Bien: id_cliente, nombre_cliente
```

### ❌ NO uses formatos de fecha incorrectos
```
Mal:  15/12/2024, 15-Dec-2024
Bien: 2024-12-15
```

### ❌ NO pongas símbolos en montos
```
Mal:  S/ 180.00, S/180, 180 soles
Bien: 180.00
```

### ❌ NO dejes espacios extra
```
Mal:  " Miraflores ", "  C001"
Bien: "Miraflores", "C001"
```

---

## 🎨 Campos Especiales

### Categoría de Cliente
Si ya tienes calculada la categoría:
- `oro` - 4 o más mascotas
- `bronce` - 2-3 mascotas  
- `plata` - 1 mascota

Si NO la tienes, déjala en blanco y el sistema la calculará.

### Coordenadas (latitud/longitud)
Si NO tienes las coordenadas:
- Déjalas en blanco o pon "0"
- El sistema usará la dirección para calcularlas automáticamente con Google Geocoding API

### Horario Preferido
Valores permitidos:
- `mañana` (8:00 - 12:00)
- `tarde` (12:00 - 18:00)
- `noche` (18:00 - 22:00)

---

## 📤 Qué Hacer Después

### Opción A: Subir a SmartPet

1. **Ve a Dashboard > Análisis de Patrones**
2. **Clic en "Importar Datos"**
3. **Sube los 3 archivos CSV** (o el archivo Excel combinado)
4. **Revisa la vista previa** de datos importados
5. **Confirma la importación**
6. **El sistema analizará automáticamente** y generará recomendaciones

### Opción B: Enviármelos para análisis

Si prefieres que yo lo analice primero:
1. **Sube los archivos** en el chat
2. Te mostraré un **preview del análisis**
3. Ajustamos si es necesario
4. Luego lo integramos en SmartPet

---

## 📊 Qué Obtendrás del Análisis

Una vez que proporciones los datos, el sistema generará:

### 1. **Clustering Geográfico**
```
📍 Zona Centro (Miraflores, Barranco)
   - 15 clientes
   - 45 citas/mes
   - Demanda: Alta
   - Vehículos recomendados: 2
```

### 2. **Análisis de Patrones**
```
📈 Día con más demanda: Sábado (35%)
⏰ Horario pico: 14:00 - 18:00
🏆 Servicio más solicitado: Peluquería (68%)
💰 Zona más rentable: San Isidro (S/ 8,500/mes)
```

### 3. **Recomendaciones**
```
✅ Optimizar Vehículo 1 para Zona Centro
✅ Contratar 1 empleado adicional para sábados
✅ Expandir cobertura a La Molina (oportunidad detectada)
⚠️ Vehículo 3 subutilizado en Surco (solo 45% capacidad)
```

### 4. **Visualizaciones en Google Maps**
- Heat map de demanda por distrito
- Clusters de clientes identificados
- Zonas sugeridas con límites
- Rutas optimizadas por vehículo

---

## 💡 Consejos

### Para mejores resultados:

✅ **Incluye al menos 2 meses de datos** (mínimo)
✅ **Cuantas más citas, mejor** el análisis de patrones
✅ **Incluye citas canceladas** (nos ayuda a identificar problemas)
✅ **Agrega observaciones** en clientes especiales
✅ **Verifica direcciones** estén completas

### Datos mínimos necesarios:

Para que el análisis funcione, necesitas al menos:
- ✅ 10+ clientes únicos
- ✅ 30+ citas registradas
- ✅ Direcciones completas (con distrito)
- ✅ 1+ vehículo registrado

---

## 🆘 ¿Necesitas Ayuda?

### Si tienes dudas sobre:

**Formato de datos**
→ Revisa los ejemplos en cada archivo CSV

**Campos faltantes**
→ Completa los obligatorios, los opcionales se pueden dejar en blanco

**Errores al importar**
→ Verifica que los nombres de columnas sean exactos

**Datos incompletos**
→ No te preocupes, el sistema puede inferir algunos datos

---

## 📋 Checklist Antes de Importar

Antes de subir tus datos, verifica:

- [ ] Abriste los archivos CSV en Excel/Google Sheets
- [ ] Reemplazaste los datos de ejemplo con tus datos reales
- [ ] Mantuviste los nombres de las columnas (primera fila)
- [ ] Formato de fechas: YYYY-MM-DD
- [ ] Montos sin símbolos (180.00)
- [ ] IDs de clientes coinciden entre archivos
- [ ] Al menos 10 clientes y 30 citas
- [ ] Guardaste los archivos (CSV o XLSX)

---

## 🎉 ¡Listo!

Una vez que tengas los datos listos:
1. Súbelos a SmartPet o envíamelos
2. El sistema los analizará en segundos
3. Obtendrás recomendaciones específicas para tu negocio
4. Podrás optimizar tus rutas y zonas

**¿Tienes dudas?** Pregúntame lo que necesites. Estoy aquí para ayudarte. 🚀