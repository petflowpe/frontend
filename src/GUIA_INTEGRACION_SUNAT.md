# 🇵🇪 Guía de Integración SUNAT - SmartPet

## ✅ Sistema Completo Implementado

Se ha implementado un **sistema completo de facturación electrónica** integrado con SUNAT para Perú, incluyendo:

---

## 📦 Componentes Creados

### 1️⃣ **SUNATConfig.tsx** - Configuración de Empresa
**Ruta:** `/components/SUNATConfig.tsx`

**Funcionalidades:**
- ✅ Configuración de datos de la empresa (RUC, Razón Social, Dirección Fiscal)
- ✅ Gestión de Ubigeo y datos fiscales
- ✅ Carga de Certificado Digital (.pfx / .p12)
- ✅ Configuración de proveedor OSE (SUNAT, Nubefact, Facturador.pe, Otro)
- ✅ Configuración de series de comprobantes (Facturas, Boletas, NC, ND, Guías)
- ✅ Selección de Régimen Tributario (RG, RER, MYPE, RUS)

**Tabs:**
- **Empresa:** RUC, Razón Social, Dirección, Ubigeo, Teléfono, Email
- **Certificado:** Upload de certificado digital, contraseña, vigencia
- **OSE:** Selección de proveedor, configuración de API
- **Series:** Series autorizadas para cada tipo de comprobante

---

### 2️⃣ **ElectronicInvoicing.tsx** - Emisión de Comprobantes
**Ruta:** `/components/ElectronicInvoicing.tsx`

**Funcionalidades:**
- ✅ Emisión de Facturas Electrónicas (01)
- ✅ Emisión de Boletas de Venta (03)
- ✅ Validación de datos del cliente (RUC/DNI)
- ✅ Agregar múltiples items (productos/servicios)
- ✅ Cálculo automático de IGV (18%)
- ✅ Soporte para operaciones gravadas y exoneradas
- ✅ Generación de XML UBL 2.1
- ✅ Firma digital automática
- ✅ Envío automático a SUNAT/OSE
- ✅ Generación de numeración correlativa
- ✅ Lista de comprobantes emitidos
- ✅ Visualización, descarga e impresión

**Tipos de comprobante:**
- **01:** Factura (para clientes con RUC)
- **03:** Boleta de Venta (para clientes con DNI)

---

### 3️⃣ **ElectronicBooks.tsx** - Libros Electrónicos
**Ruta:** `/components/ElectronicBooks.tsx`

**Funcionalidades:**
- ✅ Registro de Ventas e Ingresos
- ✅ Registro de Compras
- ✅ Libro Diario
- ✅ Libro Mayor
- ✅ Filtrado por período (mes/año)
- ✅ Exportación a Excel
- ✅ Exportación a formato PLE (Programa de Libros Electrónicos SUNAT)
- ✅ Cálculo automático de totales
- ✅ Visualización de operaciones gravadas, IGV y totales

**Tabs:**
- **Registro de Ventas:** Todos los comprobantes de venta emitidos
- **Registro de Compras:** Facturas de proveedores
- **Libro Diario:** Asientos contables
- **Libro Mayor:** Movimientos por cuenta

---

### 4️⃣ **SUNATReports.tsx** - Reportes y Declaraciones
**Ruta:** `/components/SUNATReports.tsx`

**Funcionalidades:**
- ✅ PDT 621 - IGV Renta Mensual
- ✅ Cálculo automático de IGV
- ✅ Determinación de IGV por pagar
- ✅ Cálculo de saldo a favor
- ✅ Resumen de ventas y compras del período
- ✅ Generación de archivo PDT para SUNAT
- ✅ Información de Impuesto a la Renta según régimen

**Reportes incluidos:**
- **Declaración Mensual:** Cálculo completo de IGV del período
- **Impuesto a la Renta:** Información según régimen tributario

**Cálculos automáticos:**
- Total de ventas gravadas
- IGV de ventas
- IGV de compras (crédito fiscal)
- Saldo: IGV ventas - IGV compras
- Determinación de pago o saldo a favor

---

### 5️⃣ **sunatService.ts** - Servicio de Integración
**Ruta:** `/services/sunatService.ts`

**Funcionalidades:**
- ✅ Generación de XML UBL 2.1 (estándar SUNAT)
- ✅ Firma digital de comprobantes
- ✅ Integración con OSE
- ✅ Envío a SUNAT directamente
- ✅ Envío a Nubefact
- ✅ Envío a OSE personalizado
- ✅ Gestión de respuestas SUNAT (CDR)
- ✅ Generación de hash
- ✅ Numeración correlativa automática
- ✅ Persistencia de comprobantes
- ✅ Generación de Notas de Crédito
- ✅ Generación de Notas de Débito

**Tipos de comprobante soportados:**
- **01:** Factura
- **03:** Boleta de Venta
- **07:** Nota de Crédito
- **08:** Nota de Débito
- **09:** Guía de Remisión

---

### 6️⃣ **accounting-peru.ts** - Plan Contable
**Ruta:** `/config/accounting-peru.ts`

**Contenido:**
- ✅ Plan Contable General Empresarial (PCGE) completo
- ✅ Cuentas contables según normativa peruana
- ✅ Mapeo de operaciones comunes
- ✅ Tipos de comprobantes SUNAT
- ✅ Tasas de IGV (18%, 0%)
- ✅ Regímenes tributarios de Perú

**Clases incluidas:**
- **Clase 1:** Activo Disponible y Exigible
- **Clase 2:** Activo Realizable
- **Clase 3:** Activo Inmovilizado
- **Clase 4:** Pasivo
- **Clase 5:** Patrimonio
- **Clase 6:** Gastos por Naturaleza
- **Clase 7:** Ingresos
- **Clase 9:** Costos de Producción

---

## 🚀 Cómo Usar el Sistema

### Paso 1: Configurar la Empresa

1. Ir al componente **SUNATConfig**
2. Completar datos en la tab **Empresa:**
   - RUC (11 dígitos)
   - Razón Social
   - Dirección Fiscal
   - Distrito, Provincia, Departamento
   - Ubigeo (6 dígitos)
   - Teléfono y Email (opcionales)

3. En la tab **Certificado:**
   - Cargar archivo .pfx o .p12
   - Ingresar contraseña del certificado
   - Configurar vigencia

4. En la tab **OSE:**
   - Seleccionar proveedor (SUNAT, Nubefact, etc.)
   - Si es OSE externo, configurar URL, usuario y contraseña

5. En la tab **Series:**
   - Configurar series autorizadas:
     - Facturas: F001
     - Boletas: B001
     - Notas de Crédito: FC01 / BC01
     - Notas de Débito: FD01 / BD01
     - Guías de Remisión: T001

6. **Guardar Configuración**

---

### Paso 2: Emitir Comprobantes

1. Ir al componente **ElectronicInvoicing**
2. Clic en **"Nuevo Comprobante"**
3. Seleccionar tipo:
   - **Factura (01)** si el cliente tiene RUC
   - **Boleta (03)** si el cliente tiene DNI

4. Completar datos del cliente:
   - Tipo de documento (RUC o DNI)
   - Número de documento
   - Razón Social / Nombre
   - Dirección (opcional)
   - Email (opcional)

5. Agregar items:
   - Código del producto/servicio
   - Descripción
   - Cantidad
   - Valor Unitario (sin IGV)
   - Tipo de IGV (Gravado o Exonerado)
   - Clic en **"Agregar"**

6. Revisar totales automáticos:
   - Base Imponible
   - IGV (18%)
   - Total a pagar

7. Clic en **"Emitir y Enviar"**
   - El sistema generará el XML
   - Firmará digitalmente
   - Enviará a SUNAT/OSE
   - Mostrará respuesta

---

### Paso 3: Consultar Libros Electrónicos

1. Ir al componente **ElectronicBooks**
2. Seleccionar período (mes/año)
3. Ver registros en tabs:
   - **Registro de Ventas:** Comprobantes emitidos
   - **Registro de Compras:** Facturas de proveedores
   - **Libro Diario:** Asientos contables
   - **Libro Mayor:** Movimientos por cuenta

4. Exportar:
   - Clic en **"Excel"** para descargar en formato Excel
   - Clic en **"PLE"** para formato SUNAT (.txt)

---

### Paso 4: Generar Declaración Mensual

1. Ir al componente **SUNATReports**
2. Tab **"Declaración Mensual"**
3. Seleccionar período (mes/año)
4. Clic en **"Calcular IGV"**
5. Revisar:
   - Total de ventas gravadas
   - IGV de ventas
   - IGV de compras (crédito fiscal)
   - Saldo: IGV por pagar o a favor

6. Clic en **"Generar PDT 621"** para descargar archivo

---

## 🔧 Integraciones OSE Soportadas

### SUNAT Directo
- Envío directo a servicios web de SUNAT
- Requiere certificado digital
- Mayor control pero más complejo

### Nubefact
- OSE certificado popular en Perú
- API REST sencilla
- Configurar en tab OSE:
  - URL: `https://api.nubefact.com/api/v1`
  - Usuario: Tu usuario de Nubefact
  - Token: Tu token de API

### Facturador.pe
- Otro OSE certificado
- Similar a Nubefact
- Configurar credenciales en tab OSE

### OSE Personalizado
- Para otros proveedores
- Configurar URL y credenciales
- El sistema se adaptará a la API

---

## 📋 Tipos de Comprobantes

| Código | Tipo | Uso |
|--------|------|-----|
| **01** | Factura | Cliente con RUC |
| **03** | Boleta de Venta | Cliente con DNI |
| **07** | Nota de Crédito | Anular o corregir comprobante |
| **08** | Nota de Débito | Aumentar monto de comprobante |
| **09** | Guía de Remisión | Traslado de mercancías |

---

## 💰 Cálculo de Impuestos

### IGV (Impuesto General a las Ventas)
- **Tasa:** 18%
- **Base:** Valor de venta sin IGV
- **Fórmula:** IGV = Base Imponible × 0.18
- **Precio de Venta:** Base + IGV

### Operaciones Exoneradas
- Tasa: 0%
- Sin IGV
- Según disposiciones SUNAT

### Impuesto a la Renta
Según régimen tributario:

| Régimen | Tasa | Pago a Cuenta |
|---------|------|---------------|
| **General** | 29.5% | 1.5% ingresos netos |
| **MYPE** | 10% hasta 15 UIT, 29.5% exceso | 1% ingresos netos |
| **RER** | 1.5% ingresos netos | Cuota mensual |
| **RUS** | Cuota fija | Sin declaración |

---

## 📊 Flujo de Facturación Electrónica

```
1. Configurar Empresa (SUNATConfig)
   ↓
2. Crear Comprobante (ElectronicInvoicing)
   ↓
3. Sistema Genera XML UBL 2.1
   ↓
4. Firma Digital con Certificado
   ↓
5. Envío a OSE/SUNAT
   ↓
6. Respuesta SUNAT (CDR)
   ↓
7. Registro en Libros Electrónicos
   ↓
8. Disponible para Declaración Mensual
```

---

## ⚠️ Requisitos

### Para Producción:
1. **RUC activo** y habilitado para facturación electrónica
2. **Certificado Digital** (.pfx) emitido por entidad autorizada (RENIEC, etc.)
3. **Cuenta en OSE** (Nubefact, Facturador.pe, u otro)
4. **Series autorizadas** por SUNAT

### Para Pruebas:
- El sistema funciona en modo mock
- No se envía realmente a SUNAT
- Puedes probar toda la funcionalidad

---

## 🔐 Seguridad

- ✅ Certificado digital encriptado
- ✅ Contraseñas no se exponen
- ✅ Comunicación HTTPS con SUNAT/OSE
- ✅ Firma digital en todos los comprobantes
- ✅ Hash de seguridad en XML

---

## 📱 Componentes para Integrar en SmartPet

Para usar estos componentes en tu sistema, agrégalos al menú principal:

```tsx
// En tu Sidebar.tsx o menú principal
import { SUNATConfig } from './components/SUNATConfig';
import { ElectronicInvoicing } from './components/ElectronicInvoicing';
import { ElectronicBooks } from './components/ElectronicBooks';
import { SUNATReports } from './components/SUNATReports';

// Opciones de menú:
{ name: 'Config SUNAT', component: SUNATConfig, icon: Settings },
{ name: 'Facturación', component: ElectronicInvoicing, icon: FileText },
{ name: 'Libros Electrónicos', component: ElectronicBooks, icon: Book },
{ name: 'Reportes SUNAT', component: SUNATReports, icon: BarChart },
```

---

## 🎯 Próximos Pasos

1. **Configurar tu empresa** en SUNATConfig
2. **Emitir comprobantes de prueba** en ElectronicInvoicing
3. **Revisar libros electrónicos** para verificar registros
4. **Generar declaración de prueba** en SUNATReports
5. **Conectar con OSE real** cuando estés listo para producción

---

## 📞 Soporte

Para dudas sobre:
- **Normativa SUNAT:** https://www.sunat.gob.pe
- **Facturación Electrónica:** https://cpe.sunat.gob.pe
- **Nubefact:** https://nubefact.com
- **Certificados Digitales:** RENIEC, entidades certificadoras

---

## ✅ Checklist de Implementación

- [x] Servicio de integración SUNAT
- [x] Configuración de empresa
- [x] Emisión de facturas electrónicas
- [x] Emisión de boletas de venta
- [x] Generación de XML UBL 2.1
- [x] Firma digital
- [x] Integración con OSE
- [x] Libros electrónicos
- [x] Registro de ventas
- [x] Registro de compras
- [x] Libro diario
- [x] Libro mayor
- [x] Reportes SUNAT
- [x] PDT 621
- [x] Cálculo automático de IGV
- [x] Plan contable peruano (PCGE)
- [x] Notas de crédito/débito
- [x] Exportación a Excel
- [x] Exportación a PLE

---

**¡Sistema SUNAT 100% Completo y Listo para Usar! 🎉**
