# 📋 Resumen de Campos - Análisis Geográfico SmartPet

## 🎯 Vista Rápida

Tienes **3 archivos CSV** que puedes abrir en Excel:

1. ✅ **template_clientes.csv** - 21 clientes de ejemplo
2. ✅ **template_historial_citas.csv** - 66 citas de ejemplo (Oct-Dic 2024)
3. ✅ **template_flota_vehiculos.csv** - 3 vehículos de ejemplo

---

## 📊 Archivo 1: CLIENTES (18 columnas)

### Obligatorios (6 campos)
| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `id_cliente` | Código único | C001 |
| `nombre_cliente` | Nombre del cliente | Juan Pérez |
| `direccion_completa` | Dirección completa | Av. Larco 1234 Miraflores |
| `distrito` | Distrito de Lima | Miraflores |
| `numero_mascotas` | Total de mascotas | 5 |
| `mascotas_activas` | Mascotas vivas | 4 |

### Opcionales pero útiles (12 campos)
| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `latitud` | ⚠️ **AUTOMÁTICO** - Deja en blanco | -12.1195 |
| `longitud` | ⚠️ **AUTOMÁTICO** - Deja en blanco | -77.0282 |
| `mascotas_fallecidas` | Mascotas fallecidas | 1 |
| `categoria_actual` | oro/bronce/plata | oro |
| `telefono` | Teléfono de contacto | 987654321 |
| `email` | Email | juan@email.com |
| `fecha_primera_cita` | Primera vez | 2024-01-15 |
| `fecha_ultima_cita` | Última cita | 2024-12-15 |
| `horario_preferido` | mañana/tarde/noche | tarde |
| `dia_preferido` | lunes-domingo | sábado |
| `referencia_llegada` | Cómo llegó | Google |
| `observaciones` | Notas especiales | Cliente VIP |

> 💡 **IMPORTANTE**: Las coordenadas (latitud/longitud) ahora se calculan **automáticamente** usando Google Geocoding API. Solo necesitas proporcionar la dirección completa y el distrito.

---

## 📅 Archivo 2: HISTORIAL CITAS (16 columnas)

### Obligatorios (8 campos)
| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `id_cita` | Código único de cita | CITA001 |
| `id_cliente` | Debe existir en clientes | C001 |
| `fecha_cita` | YYYY-MM-DD | 2024-12-15 |
| `hora_cita` | HH:MM | 14:30 |
| `tipo_servicio` | peluquería/veterinaria/baño | peluquería |
| `duracion_minutos` | Duración en minutos | 60 |
| `estado_cita` | completada/cancelada/no_show | completada |
| `monto_facturado` | Sin símbolo S/ | 180.00 |

### Opcionales (8 campos)
| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `vehiculo_asignado` | Vehículo que atendió | Vehículo 1 |
| `empleado_asignado` | Quién atendió | María López |
| `calificacion_servicio` | 1-5 estrellas | 5 |
| `comentarios_cliente` | Feedback | Excelente servicio |
| `distrito_servicio` | Distrito donde se hizo | Miraflores |
| `direccion_servicio` | Dirección del servicio | Av. Larco 1234 |
| `latitud` | Coordenada del servicio | -12.1195 |
| `longitud` | Coordenada del servicio | -77.0282 |

---

## 🚗 Archivo 3: FLOTA VEHÍCULOS (12 columnas)

### Obligatorios (7 campos)
| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `id_vehiculo` | Código único | VEH001 |
| `nombre_vehiculo` | Nombre del vehículo | Vehículo 1 |
| `tipo_vehiculo` | Van móvil/Van compacta | Van móvil |
| `capacidad_citas_dia` | Cuántas citas/día | 8 |
| `zona_operacion_actual` | Zona donde opera | Zona Centro |
| `distrito_base` | Base de operación | Miraflores |
| `estado_actual` | activo/mantenimiento | activo |

### Opcionales (5 campos)
| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `año_adquisicion` | Año de compra | 2023 |
| `placa` | Placa del vehículo | ABC-123 |
| `marca_modelo` | Marca y modelo | Toyota Hiace |
| `equipamiento` | Equipamiento | Mesa peluquería, tanque |
| `observaciones` | Notas | Vehículo principal |

---

## 🎨 Valores Permitidos

### Distritos más comunes:
```
✅ Miraflores
✅ San Isidro
✅ Surco (Santiago de Surco)
✅ Barranco
✅ Jesús María
✅ San Borja
✅ La Molina
✅ Lince
✅ Magdalena
✅ San Miguel
```

### Categorías de Cliente:
```
oro    → 4 o más mascotas
bronce → 2-3 mascotas
plata  → 1 mascota
```

### Tipos de Servicio:
```
peluquería    → Corte, estilizado
veterinaria   → Consultas, vacunas
baño          → Baño y secado
desparasitación → Tratamiento parásitos
vacunación    → Vacunas
consulta      → Consulta general
urgencia      → Emergencias
```

### Estado de Citas:
```
completada → Servicio completado exitosamente
cancelada  → Cancelada por el cliente
no_show    → Cliente no se presentó
en_progreso → Cita en curso (para análisis de rutas)
```

### Horarios Preferidos:
```
mañana → 08:00 - 12:00
tarde  → 12:00 - 18:00
noche  → 18:00 - 22:00
```

---

## 📏 Datos Mínimos para Análisis

Para que el análisis funcione necesitas **mínimo**:

| Requisito | Cantidad Mínima | Recomendado |
|-----------|-----------------|-------------|
| Clientes únicos | 10 | 20+ |
| Citas totales | 30 | 100+ |
| Período de datos | 1 mes | 3 meses |
| Vehículos | 1 | 2+ |
| Distritos diferentes | 2 | 3+ |

---

## 🔍 Qué Analizará el Sistema

### 1. Patrones Geográficos
- Concentración de clientes por distrito
- Distancias promedio entre clientes
- Identificar clusters naturales
- Calcular centroides óptimos

### 2. Patrones Temporales
- Días con más demanda
- Horarios pico
- Duración promedio de servicios
- Frecuencia de clientes

### 3. Patrones de Negocio
- Servicios más solicitados
- Ingresos por zona
- Clientes más rentables
- ROI por distrito

### 4. Optimización de Flota
- Capacidad utilizada vs disponible
- Clientes por vehículo
- Rutas más eficientes
- Redistribución recomendada

---

## 📦 Estructura Final

Tu archivo Excel debería tener 3 hojas:

```
📄 Archivo: SmartPet_Datos_Analisis.xlsx
   📊 Hoja 1: Clientes (21 filas de ejemplo)
   📅 Hoja 2: Historial_Citas (66 filas de ejemplo)
   🚗 Hoja 3: Flota_Vehiculos (3 filas de ejemplo)
```

O 3 archivos CSV separados:
```
📁 Carpeta: SmartPet_Datos/
   📄 template_clientes.csv
   📄 template_historial_citas.csv
   📄 template_flota_vehiculos.csv
```

---

## ✅ Validación Automática

El sistema validará automáticamente:

- ✓ Campos obligatorios completos
- ✓ Formatos de fecha correctos (YYYY-MM-DD)
- ✓ IDs de clientes existen en ambos archivos
- ✓ Montos son números válidos
- ✓ Coordenadas dentro de Lima (-11 a -13 lat, -76 a -78 lng)
- ✓ Fechas dentro del rango esperado
- ✓ Estados y categorías son valores válidos

---

## 🚀 Cómo Empezar

### Método Simple (5 minutos):

1. **Descarga los 3 archivos CSV**
2. **Ábrelos en Excel** (Archivo > Abrir)
3. **Borra las filas 2+ de datos de ejemplo**
4. **Copia y pega tus datos** manteniendo las columnas
5. **Guarda como Excel** (.xlsx) o mantén CSV
6. **Sube a SmartPet** o envíamelos

### Método Completo (15 minutos):

1. **Exporta tus datos** del sistema actual
2. **Mapea las columnas** a la plantilla
3. **Completa campos faltantes**
4. **Verifica coordenadas** (o déjalas en blanco)
5. **Revisa calidad de datos**
6. **Guarda y sube**

---

## 💡 Tips Importantes

### ✅ DO (Hacer):
- Usa los nombres exactos de columnas
- Mantén formatos consistentes
- Incluye todas las citas (incluso canceladas)
- Anota observaciones importantes
- Verifica direcciones completas

### ❌ DON'T (No hacer):
- Cambiar nombres de columnas
- Usar símbolos en montos (S/, $)
- Fechas en formato incorrecto
- Dejar campos obligatorios vacíos
- IDs duplicados

---

## 🎁 Bonus: Datos de Ejemplo Incluidos

Los archivos ya incluyen **datos realistas de ejemplo** que puedes usar para:
- ✅ Entender el formato esperado
- ✅ Probar el sistema antes de usar tus datos
- ✅ Ver ejemplos de cada tipo de campo
- ✅ Validar que el análisis funciona

Los datos de ejemplo representan:
- **21 clientes** distribuidos en 5 distritos
- **66 citas** en 3 meses (Oct-Dic 2024)
- **3 vehículos** con diferentes capacidades
- **Mix realista** de categorías (Oro: 24%, Bronce: 57%, Plata: 19%)
- **Ingresos totales**: ~S/ 16,000 en 3 meses

---

## 📞 ¿Dudas?

Si tienes preguntas sobre:
- **Formato de datos** → Revisa los ejemplos en los CSV
- **Campos faltantes** → Completa los obligatorios, opcionales se pueden omitir
- **Coordenadas** → Si no las tienes, déjalas en 0 o blanco
- **Errores al importar** → Verifica nombres exactos de columnas

**¡Estoy aquí para ayudarte!** 🚀

---

## 📊 Resultado Final

Una vez que subas los datos, obtendrás:

```
╔══════════════════════════════════════╗
║  ANÁLISIS GEOGRÁFICO SMARTPET       ║
╠══════════════════════════════════════╣
║                                      ║
║  📍 3 Zonas Óptimas Identificadas   ║
║  🚗 Distribución de 3 Vehículos     ║
║  📈 Patrones de Demanda Analizados  ║
║  💰 Ingresos por Zona Calculados    ║
║  🗺️ Visualización en Google Maps   ║
║  ✅ Recomendaciones Específicas     ║
║                                      ║
╚══════════════════════════════════════╝
```

**¡Sube tus datos y optimiza tu negocio!** 🎉