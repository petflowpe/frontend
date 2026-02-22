# 🗂️ Estructura del Menú SmartPet con SUNAT

## 📱 Vista General del Sidebar

```
╔═══════════════════════════════════════╗
║  🐾 SmartPet                          ║
║  Grooming Móvil                       ║
╠═══════════════════════════════════════╣
║                                       ║
║  PRINCIPAL                            ║
║  ├─ 🏠 Dashboard                      ║
║  ├─ 📅 Citas                          ║
║  ├─ ✓ Confirmaciones                  ║
║  ├─ 👥 Clientes                       ║
║  ├─ ❤️ Fidelización                   ║
║  └─ ⭐ Reviews                        ║
║                                       ║
║  🌐 PORTAL CLIENTE                    ║
║  └─ 🌍 Portal Público    [🆕 COMPLETO]║
║                                       ║
║  📊 ANÁLISIS Y SEGMENTACIÓN           ║
║  ├─ 📈 Análisis Geográfico [✨ NUEVO] ║
║  ├─ 🎚️ Segmentación      [✨ NUEVO] ║
║  └─ 🎯 Análisis Patrones  [✨ NUEVO] ║
║                                       ║
║  OPERACIONES                          ║
║  ├─ ✂️ Servicios                      ║
║  ├─ 📦 Productos                      ║
║  ├─ 🛒 Compras                        ║
║  ├─ 🛡️ Cuidado Médico                ║
║  ├─ 🚗 Vehículos                      ║
║  ├─ 📍 Rutas                          ║
║  └─ 📊 Kardex                         ║
║                                       ║
║  FINANZAS                             ║
║  ├─ 📄 Facturación                    ║
║  ├─ 💳 Pagos                          ║
║  ├─ 🧮 Cierre de Caja                 ║
║  └─ 📚 Contabilidad                   ║
║                                       ║
║  🇵🇪 SUNAT PERÚ ⭐ NUEVO ⭐          ║
║  ├─ 🏢 Config SUNAT      [🇵🇪 NUEVO] ║
║  ├─ 🧾 Facturación Elect. [🇵🇪 NUEVO]║
║  ├─ 📖 Libros Electrón.   [🇵🇪 NUEVO]║
║  └─ 📊 Reportes SUNAT     [🇵🇪 NUEVO]║
║                                       ║
║  REPORTES                             ║
║  ├─ 📄 Informes                       ║
║  ├─ 📊 Reportes                       ║
║  └─ 🧠 Analytics IA                   ║
║                                       ║
║  ADMINISTRACIÓN                       ║
║  ├─ 💾 Exportar Datos    [💾 Backup] ║
║  ├─ 🔑 Recuperar Password [🔑 Test]  ║
║  ├─ ⚙️ Configuración                 ║
║  └─ 👥 Usuarios                       ║
║                                       ║
╚═══════════════════════════════════════╝
```

---

## 🇵🇪 Sección SUNAT en Detalle

### 1. Config SUNAT 🏢
```
┌─────────────────────────────────────────┐
│ CONFIGURACIÓN SUNAT                     │
├─────────────────────────────────────────┤
│                                         │
│ Tabs:                                   │
│ ┌────┬──────────┬─────┬────────┐       │
│ │ 🏢 │ 🔐       │ 🛡️  │ 📝     │       │
│ │Empre│Certifica-│ OSE │ Series │       │
│ │sa  │do       │     │        │       │
│ └────┴──────────┴─────┴────────┘       │
│                                         │
│ • RUC y Razón Social                    │
│ • Dirección Fiscal y Ubigeo             │
│ • Certificado Digital (.pfx)            │
│ • Proveedor OSE (Nubefact, etc.)        │
│ • Series autorizadas                    │
│                                         │
│ [💾 Guardar Configuración]              │
└─────────────────────────────────────────┘
```

### 2. Facturación Electrónica 🧾
```
┌─────────────────────────────────────────┐
│ FACTURACIÓN ELECTRÓNICA                 │
├─────────────────────────────────────────┤
│                                         │
│ [➕ Nuevo Comprobante]                  │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ Tipo: [01 Factura ▼]              │   │
│ ├───────────────────────────────────┤   │
│ │ 👤 DATOS DEL CLIENTE              │   │
│ │ • RUC/DNI                         │   │
│ │ • Razón Social                    │   │
│ │ • Dirección, Email                │   │
│ ├───────────────────────────────────┤   │
│ │ 📦 ITEMS                          │   │
│ │ ┌─────┬────────┬─────┬──────┐    │   │
│ │ │Códi-│Descrip-│Cant.│Valor │    │   │
│ │ │go   │ción    │     │Unit. │    │   │
│ │ └─────┴────────┴─────┴──────┘    │   │
│ │                                   │   │
│ │ [➕ Agregar Item]                 │   │
│ ├───────────────────────────────────┤   │
│ │ 💰 TOTALES                        │   │
│ │ Base Imponible: S/ 100.00         │   │
│ │ IGV (18%):      S/ 18.00          │   │
│ │ TOTAL:          S/ 118.00         │   │
│ └───────────────────────────────────┘   │
│                                         │
│ [🚀 Emitir y Enviar]                    │
│                                         │
│ ─────────────────────────────────────   │
│                                         │
│ 📋 COMPROBANTES EMITIDOS                │
│ ┌─────┬────┬──────┬────────┬───────┐   │
│ │Fecha│Tipo│Serie │Cliente │Total  │   │
│ ├─────┼────┼──────┼────────┼───────┤   │
│ │01/12│FAC │F001-1│Cliente │S/ 118 │   │
│ │02/12│BOL │B001-1│Persona │S/ 59  │   │
│ └─────┴────┴──────┴────────┴───────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### 3. Libros Electrónicos 📖
```
┌─────────────────────────────────────────┐
│ LIBROS ELECTRÓNICOS                     │
├─────────────────────────────────────────┤
│                                         │
│ Período: [2024-12 ▼]                    │
│                                         │
│ Tabs:                                   │
│ ┌─────────┬────────┬───────┬───────┐   │
│ │📈Ventas │📉Compra│📄Diario│📚Mayor│   │
│ └─────────┴────────┴───────┴───────┘   │
│                                         │
│ ══════════════════════════════════════  │
│                                         │
│ 📈 REGISTRO DE VENTAS                   │
│                                         │
│ [📥 Excel] [📄 PLE]                     │
│                                         │
│ ┌────┬───┬──────┬────────┬──────┐      │
│ │Fech│Tip│Serie │Cliente │Total │      │
│ ├────┼───┼──────┼────────┼──────┤      │
│ │01/1│FAC│F001-1│Empresa │S/ 118│      │
│ │02/1│BOL│B001-1│Cliente │S/ 59 │      │
│ │03/1│FAC│F001-2│Empresa │S/ 236│      │
│ └────┴───┴──────┴────────┴──────┘      │
│                                         │
│ 💰 TOTALES DEL PERÍODO                  │
│ Base Imponible: S/ 350.00               │
│ IGV:            S/ 63.00                │
│ Total Ventas:   S/ 413.00               │
│                                         │
└─────────────────────────────────────────┘
```

### 4. Reportes SUNAT 📊
```
┌─────────────────────────────────────────┐
│ REPORTES SUNAT                          │
├─────────────────────────────────────────┤
│                                         │
│ 📄 PDT 621 - IGV RENTA MENSUAL          │
│                                         │
│ Período: [2024-12 ▼]                    │
│                                         │
│ [🧮 Calcular IGV]  [📥 Generar PDT 621] │
│                                         │
│ ─────────────────────────────────────   │
│                                         │
│ 📈 VENTAS DEL PERÍODO                   │
│ ┌─────────────────────────────────┐     │
│ │ Base Imponible:    S/ 1,000.00  │     │
│ │ IGV Ventas:        S/   180.00  │     │
│ │ Total Ventas:      S/ 1,180.00  │     │
│ │ Comprobantes: 15                │     │
│ └─────────────────────────────────┘     │
│                                         │
│ 📉 COMPRAS DEL PERÍODO                  │
│ ┌─────────────────────────────────┐     │
│ │ Base Imponible:    S/   500.00  │     │
│ │ IGV Compras:       S/    90.00  │     │
│ └─────────────────────────────────┘     │
│                                         │
│ 💰 RESUMEN                              │
│ ┌─────────────────────────────────┐     │
│ │ IGV Ventas:        S/   180.00  │     │
│ │ IGV Compras:      -S/    90.00  │     │
│ │ ═════════════════════════════   │     │
│ │ IGV POR PAGAR:     S/    90.00  │     │
│ └─────────────────────────────────┘     │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎨 Códigos de Color

```
🔴 Config SUNAT        → Rojo (#DC2626)
🟢 Facturación         → Verde (#16A34A)
🔵 Libros Electrónicos → Azul (#2563EB)
🟣 Reportes SUNAT      → Púrpura (#9333EA)
```

---

## 🔄 Flujo de Navegación

```
┌──────────────┐
│   LOGIN      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  DASHBOARD   │◄─────────┐
└──────┬───────┘          │
       │                  │
       │ Haz clic en      │
       │ sidebar          │
       ▼                  │
┌──────────────────────┐  │
│ 🇵🇪 SUNAT PERÚ       │  │
├──────────────────────┤  │
│ 1. Config SUNAT      │  │
│ 2. Facturación       │  │
│ 3. Libros            │  │
│ 4. Reportes          │  │
└──────┬───────────────┘  │
       │                  │
       │ Selecciona       │
       │ opción           │
       ▼                  │
┌──────────────────────┐  │
│  COMPONENTE SUNAT    │  │
│                      │  │
│  [Trabaja aquí]      │  │
│                      │  │
│  [Volver al menú]────┼──┘
└──────────────────────┘
```

---

## 📱 Vista Mobile (Sidebar Colapsado)

```
╔═══╗
║ 🐾║
╠═══╣
║ 🏠║ Dashboard
║ 📅║ Citas
║ ✓ ║ Confirm.
║ 👥║ Clientes
║ ❤️║ Fideliz.
║ ⭐║ Reviews
║   ║
║🌍 ║ Portal
║   ║
║📈 ║ Análisis
║🎚️ ║ Segment.
║🎯 ║ Patrones
║   ║
║✂️ ║ Servicios
║📦 ║ Productos
║🛒 ║ Compras
║🛡️ ║ Médico
║🚗 ║ Vehículos
║📍 ║ Rutas
║📊 ║ Kardex
║   ║
║📄 ║ Facturac.
║💳 ║ Pagos
║🧮 ║ Caja
║📚 ║ Contab.
║   ║
║🇵🇪║ SUNAT
║🏢 ║ Config
║🧾 ║ Fact.Elec
║📖 ║ Libros
║📊 ║ Reportes
║   ║
║📄 ║ Informes
║📊 ║ Reportes
║🧠 ║ Analytics
║   ║
║💾 ║ Export
║🔑 ║ Password
║⚙️ ║ Config
║👥 ║ Usuarios
╚═══╝
```

---

## 🎯 Atajos de Teclado Sugeridos

| Atajo | Acción |
|-------|--------|
| `Ctrl+K` | Búsqueda global |
| `Ctrl+N` | Nuevo comprobante |
| `Ctrl+S` | Guardar |
| `Esc` | Cerrar modal |

---

## 📊 Jerarquía de Componentes

```
App.tsx
├── Sidebar.tsx
│   ├── Sección Principal
│   ├── Sección Portal
│   ├── Sección Análisis
│   ├── Sección Operaciones
│   ├── Sección Finanzas
│   ├── 🇵🇪 Sección SUNAT ⭐ NUEVO
│   │   ├── SUNATConfig.tsx
│   │   ├── ElectronicInvoicing.tsx
│   │   ├── ElectronicBooks.tsx
│   │   └── SUNATReports.tsx
│   ├── Sección Reportes
│   └── Sección Admin
│
└── Header.tsx
```

---

## ✨ Estados Visuales

### Badge "🇵🇪 NUEVO"
```
┌────────────────────────────┐
│ 🏢 Config SUNAT  [🇵🇪 NUEVO]│
└────────────────────────────┘
```

### Item Activo
```
┌────────────────────────────┐
│▌🏢 Config SUNAT     ⚫     │ ← Seleccionado
└────────────────────────────┘
```

### Item Hover
```
┌────────────────────────────┐
│ 🏢 Config SUNAT            │ ← Mouse encima
└────────────────────────────┘
  ↑ Fondo más claro
```

---

## 🎨 Temas

### Modo Claro
```
Fondo: Blanco (#FFFFFF)
Texto: Gris Oscuro (#1F2937)
Activo: Azul (#3B82F6)
Highlight SUNAT: Rojo (#DC2626)
```

### Modo Oscuro
```
Fondo: Gris Oscuro (#1F2937)
Texto: Blanco (#FFFFFF)
Activo: Azul Claro (#60A5FA)
Highlight SUNAT: Rojo Claro (#EF4444)
```

---

## 📐 Dimensiones

```
Sidebar Normal:   264px (w-64)
Sidebar Colapsado: 80px (w-20)
Altura:           100vh (h-screen)
Padding:          24px (p-6)
```

---

## ✅ Checklist Visual

- [x] Logo SmartPet visible
- [x] Secciones claramente separadas
- [x] Sección SUNAT destacada
- [x] Badges informativos
- [x] Iconos descriptivos
- [x] Colores coherentes
- [x] Hover states
- [x] Active states
- [x] Responsive design
- [x] Sidebar colapsable

---

**Sistema SUNAT integrado visualmente en SmartPet** ✅

Ver documentación completa en:
- `/GUIA_INTEGRACION_SUNAT.md`
- `/INICIO_RAPIDO_SUNAT.md`
