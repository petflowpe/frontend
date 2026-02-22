# 📦 Integración Compras → Kardex → Inventario

## 🎯 Resumen Ejecutivo

El módulo de **Compras** está completamente integrado con el **Kardex** para garantizar trazabilidad total del inventario. Cuando se recibe una compra, los productos se registran automáticamente en el inventario y el Kardex.

---

## 🔄 Flujo Completo de Compras

### 1. **Crear Orden de Compra** (Estado: Pendiente)

```
Usuario → Nueva Compra → Selecciona Proveedor → Agrega Productos → Guarda
```

**Lo que sucede:**
- ✅ Se crea la orden con estado "Pendiente"
- ✅ Se guarda el detalle de productos y cantidades
- ✅ Se registra el proveedor y cuenta bancaria
- ❌ NO se actualiza el inventario todavía
- ❌ NO se registra en el Kardex todavía

**Estado:** `kardexRegistered: false`

---

### 2. **Cambiar a En Tránsito** (Opcional)

```
Usuario → Selecciona Orden → Cambiar Estado → En Tránsito
```

**Lo que sucede:**
- ✅ Estado cambia a "En Tránsito"
- ❌ NO se actualiza el inventario todavía
- ❌ NO se registra en el Kardex todavía

**Estado:** `kardexRegistered: false`

---

### 3. **Marcar como Entregado** 🎯 (PUNTO CRÍTICO)

```
Usuario → Selecciona Orden → Marcar como Entregado
```

**Lo que sucede:**
1. 🔔 **Se abre diálogo de registro de factura**
2. Usuario ingresa:
   - Número de factura
   - Fecha de factura
   - Sistema calcula IGV automáticamente

---

### 4. **Registrar Factura** ✨ (INTEGRACIÓN AUTOMÁTICA)

```
Usuario → Ingresa datos de factura → Guardar
```

**Lo que sucede AUTOMÁTICAMENTE:**

#### A. Actualización de Orden
```javascript
{
  status: 'delivered',
  invoice: {
    number: 'F001-0001234',
    date: '2024-01-15',
    amount: 1000.00,
    tax: 180.00,      // 18% IGV
    total: 1180.00
  },
  kardexRegistered: true  // ✅ MARCADO COMO REGISTRADO
}
```

#### B. Registro en Kardex (AUTOMÁTICO)
Para cada producto de la orden:

```javascript
KardexService.registerPurchaseEntry({
  id: 'KDX-2024-001-abc123',
  date: '2024-01-15',
  time: '14:30',
  type: 'entrada',           // ← ENTRADA AL INVENTARIO
  quantity: 10,              // Cantidad comprada
  unitCost: 45.99,           // Costo unitario
  totalCost: 459.90,         // Costo total
  reference: 'F001-0001234', // ← Referencia a la factura
  module: 'compra',          // ← Identifica origen
  details: 'Compra de Royal Canin Adult 15kg - Proveedor: Distribuidora Pet SA',
  user: 'Sistema',
  supplierId: 1,
  supplierName: 'Distribuidora Pet SA'
});
```

#### C. Actualización de Inventario (AUTOMÁTICO)
```javascript
KardexService.updateProductStock(items, 'add');

// Para cada producto:
// - Stock Actual: 5 unidades
// - Compra: +10 unidades
// - Nuevo Stock: 15 unidades ✅
```

#### D. Notificación al Usuario
```
✅ Orden completada
Factura registrada y productos agregados al inventario
```

---

## 📊 Estructura de Datos

### Orden de Compra
```typescript
interface Purchase {
  id: string;              // PUR-2024-001
  date: string;            // Fecha de creación
  supplierId: number;      // ID del proveedor
  supplier: string;        // Nombre del proveedor
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled';
  total: number;           // Total de la compra
  items: PurchaseItem[];   // Productos
  deliveryDate: string;    // Fecha de entrega
  invoice: Invoice | null; // Factura (null hasta entregar)
  notes: string;           // Notas adicionales
  kardexRegistered: boolean; // ✅ BANDERA DE INTEGRACIÓN
}
```

### Item de Compra
```typescript
interface PurchaseItem {
  product: string;    // Nombre del producto
  quantity: number;   // Cantidad
  unitPrice: number;  // Precio unitario
  total: number;      // Total del producto
}
```

### Factura
```typescript
interface Invoice {
  number: string;     // Número de factura
  date: string;       // Fecha de emisión
  amount: number;     // Subtotal
  tax: number;        // IGV 18%
  total: number;      // Total con impuestos
}
```

### Entrada de Kardex
```typescript
interface KardexEntry {
  id: string;
  date: string;
  time: string;
  type: 'entrada' | 'salida' | 'ajuste';
  quantity: number;
  unitCost: number;
  totalCost: number;
  reference: string;      // Número de factura
  module: 'compra' | 'venta' | 'servicio' | 'ajuste' | 'inicial' | 'devolucion';
  details: string;
  user: string;
  supplierId?: number;    // ID del proveedor (solo compras)
  supplierName?: string;  // Nombre del proveedor (solo compras)
}
```

---

## 🔍 Trazabilidad Completa

### En el Kardex puedes ver:

1. **Fecha y hora exacta** de la entrada
2. **Origen:** Módulo de Compras
3. **Referencia:** Número de factura
4. **Proveedor:** Nombre y datos
5. **Cantidad:** Unidades recibidas
6. **Costo:** Unitario y total
7. **Balance:** Stock resultante
8. **Valor:** Valorización del stock

### Ejemplo en Kardex:

```
┌─────────────┬──────────┬──────────┬──────────┬──────────┬──────────┬─────────────────────┐
│ Fecha/Hora  │   Tipo   │ Cantidad │  Costo   │  Total   │ Balance  │ Referencia          │
├─────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼─────────────────────┤
│ 15/01 14:30 │ ENTRADA  │    10    │  45.99   │  459.90  │    15    │ F001-0001234        │
│             │ Compra   │          │          │          │          │ Dist. Pet SA        │
└─────────────┴──────────┴──────────┴──────────┴──────────┴──────────┴─────────────────────┘
```

---

## 💡 Ventajas de esta Integración

### 1. **Automatización Total**
- ✅ Un solo clic registra todo
- ✅ No hay pasos manuales adicionales
- ✅ Elimina errores humanos

### 2. **Trazabilidad**
- ✅ Cada producto tiene su historial
- ✅ Se sabe de qué proveedor vino
- ✅ Referencia a factura original

### 3. **Control de Costos**
- ✅ Registra costo real de compra
- ✅ Permite calcular margen de ganancia
- ✅ Valorización del inventario

### 4. **Auditoría**
- ✅ Registro de fecha/hora
- ✅ Usuario responsable
- ✅ Detalles completos

### 5. **Indicadores**
- ✅ Badge "En Kardex" en cada orden
- ✅ Contador en dashboard
- ✅ Alertas visuales

---

## 🎨 Indicadores Visuales

### En la Orden:
```
┌─────────────────────────────────────┐
│ PUR-2024-001                        │
│ [Entregado] [Facturado] [En Kardex]│ ← BADGES
│                                     │
│ Distribuidora Pet SA                │
│ 10 productos - 1,250.00 S/          │
└─────────────────────────────────────┘
```

### En el Dashboard:
```
┌──────────────┐
│ En Kardex    │
│      3       │ ← De 3 órdenes entregadas
└──────────────┘
```

### Alert de Integración:
```
┌────────────────────────────────────────────────┐
│ 📦 Integración con Kardex                      │
│                                                │
│ Al marcar una orden como "Entregado" y        │
│ registrar la factura, los productos se        │
│ agregan automáticamente al inventario y se    │
│ registran en el Kardex con trazabilidad       │
│ completa.                                      │
└────────────────────────────────────────────────┘
```

---

## 🚀 Estados de Integración

### Estado 1: Pendiente
```
kardexRegistered: false
- No está en inventario
- No está en Kardex
- Puede editarse libremente
```

### Estado 2: En Tránsito
```
kardexRegistered: false
- No está en inventario
- No está en Kardex
- Puede editarse
```

### Estado 3: Entregado + Facturado
```
kardexRegistered: true
- ✅ Está en inventario
- ✅ Está en Kardex
- ✅ Trazabilidad completa
- ❌ No puede editarse
```

---

## 📋 Checklist de Integración

### Al crear orden:
- ✅ Seleccionar proveedor
- ✅ Agregar productos al carrito
- ✅ Definir fecha de entrega
- ✅ Guardar orden

### Al recibir orden:
- ✅ Marcar como "Entregado"
- ✅ Registrar número de factura
- ✅ Confirmar fecha de factura
- ✅ Sistema registra en Kardex automáticamente
- ✅ Sistema actualiza inventario automáticamente

### Verificación:
- ✅ Badge "En Kardex" aparece
- ✅ Stock actualizado en productos
- ✅ Entrada visible en Kardex
- ✅ Contador actualizado en dashboard

---

## 🔧 Servicio de Integración

El sistema usa `KardexService` para la integración:

```javascript
const KardexService = {
  // Registra entrada de compra en Kardex
  registerPurchaseEntry: (purchase) => {
    // Crea entradas de Kardex para cada producto
    // Vincula con factura y proveedor
    // Notifica al usuario
  },

  // Actualiza stock de productos
  updateProductStock: (items, operation) => {
    // 'add' = sumar al stock (compras)
    // 'subtract' = restar del stock (ventas)
  }
};
```

---

## 🎯 Próximos Pasos

Para completar la integración en producción:

1. **Backend:**
   - Crear tabla `kardex_entries`
   - Trigger automático al actualizar orden
   - Validar unicidad de factura

2. **Validaciones:**
   - Verificar stock suficiente (ventas)
   - Prevenir duplicados de factura
   - Bloquear edición de órdenes entregadas

3. **Reportes:**
   - Reporte de entradas por proveedor
   - Valorización de inventario
   - Análisis de costos

---

## ✅ Conclusión

La integración **Compras → Kardex → Inventario** está diseñada para:

- ✅ Ser completamente automática
- ✅ Garantizar trazabilidad total
- ✅ Eliminar errores manuales
- ✅ Facilitar auditorías
- ✅ Proporcionar visibilidad completa

**El usuario solo necesita marcar la orden como entregada y registrar la factura. Todo lo demás es automático.** 🎉
