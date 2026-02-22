# Guía de Integración del Kardex con Todos los Módulos

## Introducción

El módulo Kardex es el corazón del control de inventario y debe estar integrado con todos los módulos que afecten el stock de productos. Esta guía detalla cómo cada módulo debe interactuar con el Kardex.

---

## 1. Módulo de Compras → Kardex

### Flujo de Integración:

**Cuando se registra una compra:**
```typescript
// En /components/Purchases.tsx
const handlePurchaseComplete = async (purchase) => {
  // 1. Crear la orden de compra
  const purchaseOrder = await createPurchase(purchase);
  
  // 2. Registrar entrada en Kardex para cada producto
  for (const item of purchase.items) {
    await kardexService.registerEntry({
      productId: item.productId,
      type: 'entrada',
      module: 'compra',
      quantity: item.quantity,
      unitCost: item.unitCost,
      totalCost: item.quantity * item.unitCost,
      reference: purchaseOrder.id,
      details: `Compra a proveedor: ${purchase.supplierName}`,
      user: currentUser.name
    });
    
    // 3. Actualizar stock del producto
    await updateProductStock(item.productId, item.quantity, 'add');
  }
};
```

### Datos a Registrar:
- **Tipo**: Entrada
- **Módulo**: compra
- **Referencia**: ID de la orden de compra (ej: COMP-001)
- **Details**: "Compra a proveedor: [Nombre]"
- **Cantidad**: Unidades compradas
- **Costo Unitario**: Precio de compra
- **Usuario**: Quien registró la compra

---

## 2. Módulo de Productos (Ventas Directas) → Kardex

### Flujo de Integración:

**Cuando se vende un producto directamente:**
```typescript
// En /components/Products.tsx
const handleDirectSale = async (saleData) => {
  // 1. Verificar disponibilidad de stock
  const product = await getProduct(saleData.productId);
  if (product.currentStock < saleData.quantity) {
    toast.error('Stock insuficiente');
    return;
  }
  
  // 2. Registrar la venta
  const sale = await createSale(saleData);
  
  // 3. Registrar salida en Kardex
  await kardexService.registerEntry({
    productId: saleData.productId,
    type: 'salida',
    module: 'venta',
    quantity: saleData.quantity,
    unitCost: product.unitCost,
    totalCost: product.unitCost * saleData.quantity,
    reference: sale.invoiceNumber,
    details: `Venta directa a cliente: ${saleData.clientName}`,
    user: currentUser.name
  });
  
  // 4. Actualizar stock
  await updateProductStock(saleData.productId, saleData.quantity, 'subtract');
};
```

### Datos a Registrar:
- **Tipo**: Salida
- **Módulo**: venta
- **Referencia**: Número de factura (ej: INV-2024-001)
- **Details**: "Venta directa a cliente: [Nombre]"
- **Usuario**: Vendedor

---

## 3. Módulo de Servicios → Kardex

### Flujo de Integración:

**Cuando se utiliza un producto en un servicio:**
```typescript
// En /components/Appointments.tsx
const handleServiceComplete = async (service) => {
  // 1. Completar el servicio
  const completedService = await completeService(service);
  
  // 2. Registrar consumo de productos usados
  for (const product of service.productsUsed) {
    await kardexService.registerEntry({
      productId: product.id,
      type: 'salida',
      module: 'servicio',
      quantity: product.quantityUsed,
      unitCost: product.unitCost,
      totalCost: product.unitCost * product.quantityUsed,
      reference: service.id,
      details: `Usado en servicio: ${service.serviceName} - ${service.petName} (${service.breed})`,
      user: service.groomerName
    });
    
    await updateProductStock(product.id, product.quantityUsed, 'subtract');
  }
};
```

### Ejemplos de Productos Usados en Servicios:
- Champú en baños
- Acondicionador en tratamientos
- Productos de limpieza de oídos
- Corta uñas (consumibles)
- Toallas desechables

### Datos a Registrar:
- **Tipo**: Salida
- **Módulo**: servicio
- **Referencia**: ID del servicio (ej: SERV-125)
- **Details**: "Usado en servicio: Baño Completo - Max (Golden Retriever)"
- **Usuario**: Peluquero que realizó el servicio

---

## 4. Módulo de Cuidado Médico → Kardex

### Flujo de Integración:

**Cuando se aplica una vacuna, desparasitante o tratamiento:**
```typescript
// En /components/MedicalCare.tsx
const handleMedicalTreatment = async (treatment) => {
  // 1. Registrar el tratamiento médico
  const medicalRecord = await createMedicalRecord(treatment);
  
  // 2. Registrar salida en Kardex si es un producto consumible
  if (treatment.isConsumable) {
    await kardexService.registerEntry({
      productId: treatment.productId,
      type: 'salida',
      module: 'servicio', // También puede ser 'medical'
      quantity: treatment.doses,
      unitCost: treatment.unitCost,
      totalCost: treatment.unitCost * treatment.doses,
      reference: medicalRecord.id,
      details: `${treatment.type}: ${treatment.name} - ${treatment.petName}`,
      user: treatment.veterinarian || currentUser.name
    });
    
    await updateProductStock(treatment.productId, treatment.doses, 'subtract');
  }
};
```

### Productos del Módulo Médico:
- **Vacunas**: Antirrábica, Polivalente, etc.
- **Desparasitantes**: Internos, externos
- **Antipulgas**: Collares, pipetas, sprays
- **Medicamentos**: Antibióticos, antiinflamatorios
- **Suplementos**: Vitaminas, probióticos

### Datos a Registrar:
- **Tipo**: Salida
- **Módulo**: servicio (o crear módulo específico 'medical')
- **Referencia**: ID del registro médico (ej: MED-045)
- **Details**: "Vacuna Antirrábica - Luna (Gato Persa)"
- **Usuario**: Veterinario o aplicador

---

## 5. Módulo de Facturación → Kardex

### Flujo de Integración:

**La facturación NO genera movimientos, solo los refleja:**
```typescript
// En /components/Invoicing.tsx
const generateInvoice = async (invoiceData) => {
  // 1. Recopilar todos los items (servicios + productos)
  const items = [
    ...invoiceData.services.map(s => ({
      type: 'service',
      description: s.name,
      quantity: 1,
      price: s.price,
      // Los servicios ya registraron el consumo de productos en el Kardex
    })),
    ...invoiceData.products.map(p => ({
      type: 'product',
      description: p.name,
      quantity: p.quantity,
      price: p.price,
      // El producto ya tiene su movimiento en Kardex
      kardexReference: p.kardexEntryId
    }))
  ];
  
  // 2. Crear la factura
  const invoice = await createInvoice({
    items,
    clientId: invoiceData.clientId,
    // La factura hace referencia a los movimientos del Kardex
  });
  
  return invoice;
};
```

### Relación Kardex-Facturación:
- La factura muestra los productos vendidos
- Cada línea de producto en factura tiene una referencia al Kardex
- El Kardex permite rastrear qué factura originó cada movimiento
- NO se duplican los movimientos

---

## 6. Devoluciones → Kardex

### Flujo de Integración:

**Cuando un cliente devuelve un producto:**
```typescript
// En /components/Products.tsx o /components/Invoicing.tsx
const handleProductReturn = async (returnData) => {
  // 1. Registrar la devolución
  const returnRecord = await createReturn(returnData);
  
  // 2. Registrar entrada en Kardex
  await kardexService.registerEntry({
    productId: returnData.productId,
    type: 'entrada',
    module: 'devolucion',
    quantity: returnData.quantity,
    unitCost: returnData.unitCost,
    totalCost: returnData.unitCost * returnData.quantity,
    reference: `DEV-${returnRecord.id}`,
    details: `Devolución de cliente: ${returnData.reason}`,
    user: currentUser.name
  });
  
  // 3. Aumentar stock
  await updateProductStock(returnData.productId, returnData.quantity, 'add');
  
  // 4. Procesar reembolso si aplica
  if (returnData.refund) {
    await processRefund(returnData);
  }
};
```

### Datos a Registrar:
- **Tipo**: Entrada
- **Módulo**: devolucion
- **Referencia**: ID de devolución (ej: DEV-008)
- **Details**: "Devolución de cliente: [Motivo]"

---

## 7. Ajustes de Inventario → Kardex

### Flujo de Integración:

**Para correcciones, mermas, productos dañados:**
```typescript
// En /components/ProductKardex.tsx o /components/Products.tsx
const handleInventoryAdjustment = async (adjustmentData) => {
  // 1. Validar permiso (solo administradores)
  if (!isAdmin(currentUser)) {
    toast.error('No tienes permiso para ajustar inventario');
    return;
  }
  
  // 2. Registrar ajuste en Kardex
  await kardexService.registerEntry({
    productId: adjustmentData.productId,
    type: 'ajuste',
    module: 'ajuste',
    quantity: adjustmentData.quantity, // Puede ser positivo o negativo
    unitCost: adjustmentData.unitCost,
    totalCost: adjustmentData.unitCost * Math.abs(adjustmentData.quantity),
    reference: `AJ-${adjustmentData.id}`,
    details: adjustmentData.reason,
    user: currentUser.name
  });
  
  // 3. Actualizar stock
  const operation = adjustmentData.quantity > 0 ? 'add' : 'subtract';
  await updateProductStock(
    adjustmentData.productId, 
    Math.abs(adjustmentData.quantity), 
    operation
  );
};
```

### Motivos de Ajuste:
- Producto dañado
- Merma
- Conteo físico vs sistema
- Error de registro previo
- Vencimiento
- Robo o pérdida

### Datos a Registrar:
- **Tipo**: Ajuste
- **Módulo**: ajuste
- **Referencia**: ID de ajuste (ej: AJ-012)
- **Cantidad**: Positiva (aumento) o Negativa (disminución)
- **Details**: Motivo detallado del ajuste

---

## 8. Inventario Inicial → Kardex

### Flujo de Integración:

**Al iniciar el sistema o hacer un conteo inicial:**
```typescript
// En /components/Products.tsx o setup inicial
const initializeInventory = async (products) => {
  for (const product of products) {
    // Registrar inventario inicial
    await kardexService.registerEntry({
      productId: product.id,
      type: 'entrada',
      module: 'inicial',
      quantity: product.initialStock,
      unitCost: product.unitCost,
      totalCost: product.initialStock * product.unitCost,
      reference: 'INV-INICIAL',
      details: 'Inventario inicial del sistema',
      user: 'Sistema'
    });
    
    await updateProductStock(product.id, product.initialStock, 'set');
  }
};
```

---

## 9. Cierre de Caja → Kardex (Indirecto)

### Relación:

El Cierre de Caja NO modifica el Kardex directamente, pero:

1. **Valida Ventas**: Verifica que los ingresos coincidan con las ventas registradas
2. **Gastos en Productos**: Si se compra algo con caja chica, puede generar:
   ```typescript
   // Si se compra un producto con caja chica
   if (expense.category === 'Suministros' && expense.productId) {
     await kardexService.registerEntry({
       productId: expense.productId,
       type: 'entrada',
       module: 'compra',
       quantity: expense.quantity,
       unitCost: expense.unitCost,
       totalCost: expense.amount,
       reference: `GASTO-${expense.id}`,
       details: `Compra con caja chica: ${expense.concept}`,
       user: expense.authorizedBy
     });
   }
   ```

---

## 10. Reportes y Analytics

### Consultas Útiles del Kardex:

**1. Productos más vendidos:**
```typescript
const getTopSellingProducts = async (startDate, endDate) => {
  return await kardex
    .where('type', '==', 'salida')
    .where('module', 'in', ['venta', 'servicio'])
    .where('date', '>=', startDate)
    .where('date', '<=', endDate)
    .groupBy('productId')
    .sum('quantity');
};
```

**2. Valor total de inventario movido:**
```typescript
const getInventoryTurnover = async (period) => {
  const movements = await kardex
    .where('type', 'in', ['entrada', 'salida'])
    .where('date', '>=', period.start)
    .where('date', '<=', period.end);
    
  return {
    totalIn: movements.filter(m => m.type === 'entrada').sum('totalCost'),
    totalOut: movements.filter(m => m.type === 'salida').sum('totalCost'),
    turnoverRate: totalOut / averageStock
  };
};
```

**3. Detección de mermas anormales:**
```typescript
const detectAbnormalWaste = async () => {
  const adjustments = await kardex
    .where('type', '==', 'ajuste')
    .where('quantity', '<', 0);
    
  return adjustments.filter(a => 
    Math.abs(a.quantity) > a.product.normalWasteThreshold
  );
};
```

**4. Productos sin movimiento:**
```typescript
const getSlowMovingProducts = async (days = 90) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentMovements = await kardex
    .where('date', '>=', cutoffDate)
    .select('productId')
    .distinct();
    
  const allProducts = await products.getAll();
  
  return allProducts.filter(p => 
    !recentMovements.includes(p.id) && 
    p.currentStock > 0
  );
};
```

---

## Estructura de Tabla Kardex en Supabase

```sql
CREATE TABLE kardex_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('entrada', 'salida', 'ajuste')),
  module VARCHAR(20) NOT NULL CHECK (module IN ('compra', 'venta', 'servicio', 'ajuste', 'inicial', 'devolucion')),
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10, 2) NOT NULL,
  total_cost DECIMAL(10, 2) NOT NULL,
  balance INTEGER NOT NULL,
  balance_value DECIMAL(10, 2) NOT NULL,
  reference VARCHAR(50) NOT NULL,
  details TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_product_date (product_id, date),
  INDEX idx_module (module),
  INDEX idx_type (type)
);

-- Trigger para calcular saldo automáticamente
CREATE OR REPLACE FUNCTION calculate_kardex_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Obtener último saldo
  SELECT balance INTO NEW.balance
  FROM kardex_entries
  WHERE product_id = NEW.product_id
  ORDER BY date DESC, time DESC, created_at DESC
  LIMIT 1;
  
  -- Si no hay saldo previo, iniciar en 0
  IF NEW.balance IS NULL THEN
    NEW.balance := 0;
  END IF;
  
  -- Calcular nuevo saldo según tipo
  IF NEW.type = 'entrada' THEN
    NEW.balance := NEW.balance + NEW.quantity;
  ELSIF NEW.type = 'salida' THEN
    NEW.balance := NEW.balance - NEW.quantity;
  ELSIF NEW.type = 'ajuste' THEN
    NEW.balance := NEW.balance + NEW.quantity; -- quantity ya viene con signo
  END IF;
  
  -- Calcular valor del saldo
  NEW.balance_value := NEW.balance * NEW.unit_cost;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_kardex_balance
  BEFORE INSERT ON kardex_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_kardex_balance();
```

---

## Políticas de Seguridad (RLS)

```sql
-- Solo usuarios autenticados pueden ver kardex
CREATE POLICY "Usuarios pueden ver kardex"
  ON kardex_entries FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Solo usuarios con rol apropiado pueden insertar
CREATE POLICY "Roles apropiados pueden insertar"
  ON kardex_entries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'manager', 'cashier')
    )
  );

-- Solo admin puede hacer ajustes
CREATE POLICY "Solo admin puede hacer ajustes"
  ON kardex_entries FOR INSERT
  WITH CHECK (
    type != 'ajuste' OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );
```

---

## Checklist de Integración

- [ ] Módulo de Compras registra entradas
- [ ] Módulo de Productos registra salidas por venta
- [ ] Módulo de Servicios registra consumo
- [ ] Módulo Médico registra aplicación de productos
- [ ] Sistema de Devoluciones registra entradas
- [ ] Sistema de Ajustes permite correcciones
- [ ] Inventario inicial está registrado
- [ ] Kardex actualiza stock en tiempo real
- [ ] Alertas de stock crítico funcionan
- [ ] Reportes consultan el Kardex
- [ ] Exportación de Kardex a PDF/Excel funciona
- [ ] Permisos y roles están configurados

---

## Mejores Prácticas

1. **Nunca modificar el Kardex directamente**: Siempre usar funciones que garanticen consistencia
2. **Validar stock antes de salidas**: Prevenir stock negativo
3. **Registrar usuario en cada movimiento**: Para auditoría
4. **Usar referencias únicas**: Facilita rastreo
5. **Incluir detalles descriptivos**: Ayuda en análisis futuro
6. **Hacer respaldos periódicos**: El Kardex es crítico
7. **Revisar inconsistencias**: Comparar stock físico vs sistema regularmente

---

## Soporte

Para cualquier duda sobre la integración del Kardex, consultar:
- Esta documentación
- Código de `/components/ProductKardex.tsx`
- Interfaces TypeScript definidas
