# 🚀 INICIO RÁPIDO - Sistema SUNAT SmartPet

## ✅ Todo Está Listo

El sistema SUNAT ya está **100% integrado** en tu aplicación SmartPet. Aquí te explico cómo empezar a usarlo.

---

## 📍 ¿Dónde Está?

Cuando inicies SmartPet, verás en el **sidebar izquierdo** una nueva sección:

```
🇵🇪 SUNAT PERÚ
├── 🏢 Config SUNAT
├── 🧾 Facturación Electrónica  
├── 📖 Libros Electrónicos
└── 📊 Reportes SUNAT
```

---

## 🎯 Tutorial de 5 Minutos

### PASO 1: Configurar tu Empresa (2 min)

1. **Haz clic en:** `Config SUNAT`

2. **Tab "Empresa"** - Completa:
   ```
   RUC: 20123456789
   Razón Social: TU EMPRESA S.A.C.
   Dirección: Av. Principal 123
   Distrito: Lima
   Provincia: Lima
   Departamento: Lima
   Ubigeo: 150101
   ```

3. **Tab "OSE"** - Selecciona:
   ```
   Proveedor: Nubefact (o el que uses)
   ```

4. **Tab "Series"** - Verifica:
   ```
   Facturas: F001
   Boletas: B001
   ```

5. **Clic en:** `Guardar Configuración` ✅

---

### PASO 2: Emitir tu Primera Factura (2 min)

1. **Haz clic en:** `Facturación Electrónica`

2. **Clic en:** `Nuevo Comprobante`

3. **Selecciona:**
   ```
   Tipo: 01 - Factura
   ```

4. **Datos del Cliente:**
   ```
   Tipo Doc: RUC
   RUC: 20987654321
   Razón Social: CLIENTE EJEMPLO S.A.
   ```

5. **Agregar Item:**
   ```
   Código: SERV-001
   Descripción: Baño para perro mediano
   Cantidad: 1
   Valor Unitario: 50.00
   IGV: Gravado
   ```
   Clic en `Agregar`

6. **Verás los totales automáticos:**
   ```
   Base Imponible: S/ 50.00
   IGV (18%): S/ 9.00
   TOTAL: S/ 59.00
   ```

7. **Clic en:** `Emitir y Enviar` 🚀

8. **¡Listo!** Tu factura fue:
   - ✅ Generada en XML
   - ✅ Firmada digitalmente
   - ✅ Enviada a SUNAT (modo prueba)
   - ✅ Registrada en el sistema

---

### PASO 3: Ver tus Comprobantes (1 min)

1. **Mismo componente** `Facturación Electrónica`
2. **Scroll hacia abajo** para ver la tabla
3. **Verás tu factura emitida** con estado "Aceptado"
4. **Acciones disponibles:**
   - 👁️ Ver
   - 📥 Descargar
   - 🖨️ Imprimir

---

## 📚 Otros Módulos

### 📖 Libros Electrónicos

**Para qué sirve:** Ver todos tus comprobantes organizados por período

**Cómo usar:**
1. Haz clic en `Libros Electrónicos`
2. Selecciona el mes: `2024-12`
3. Ve las tabs:
   - **Registro de Ventas:** Facturas/Boletas emitidas
   - **Registro de Compras:** Facturas de proveedores
   - **Libro Diario:** Asientos contables
   - **Libro Mayor:** Por cuenta
4. Exporta a Excel o PLE

---

### 📊 Reportes SUNAT

**Para qué sirve:** Generar tu declaración mensual (PDT 621)

**Cómo usar:**
1. Haz clic en `Reportes SUNAT`
2. Selecciona el período: `2024-12`
3. Clic en `Calcular IGV`
4. El sistema te muestra:
   ```
   ✅ Total de ventas gravadas
   ✅ IGV de ventas
   ✅ IGV de compras
   ✅ IGV por pagar o saldo a favor
   ```
5. Clic en `Generar PDT 621` para descargar

---

## 🎓 Casos de Uso Comunes

### 💼 Caso 1: Facturar una Cita Realizada

```
1. Finaliza la cita en el módulo "Citas"
2. Ve a "Facturación Electrónica"
3. Los datos ya estarán pre-cargados
4. Solo haz clic en "Emitir y Enviar"
```

### 🛍️ Caso 2: Venta de Productos en Tienda

```
1. Ve a "Facturación Electrónica"
2. Nuevo Comprobante
3. Selecciona: Boleta (si es DNI) o Factura (si es RUC)
4. Agrega los productos
5. Emite
```

### 📝 Caso 3: Anular un Comprobante

```
1. En "Facturación Electrónica"
2. Encuentra el comprobante
3. Clic en opciones
4. "Generar Nota de Crédito"
5. Ingresa el motivo
6. Emite la NC
```

### 📅 Caso 4: Declaración Mensual

```
Al fin de mes:
1. Ve a "Reportes SUNAT"
2. Selecciona el mes
3. Calcula IGV
4. Descarga PDT 621
5. Presenta en SUNAT
```

---

## 🔍 Preguntas Frecuentes

### ❓ ¿Necesito certificado digital desde ya?
**R:** No, el sistema funciona en modo prueba. Para producción sí necesitas certificado.

### ❓ ¿Dónde se guardan los comprobantes?
**R:** Actualmente en localStorage. Próximamente se guardarán en Supabase.

### ❓ ¿Puedo emitir boletas?
**R:** Sí, selecciona tipo "03 - Boleta" y usa DNI del cliente.

### ❓ ¿Cómo configuro mi OSE?
**R:** En Config SUNAT > Tab OSE > Selecciona tu proveedor y agrega credenciales.

### ❓ ¿Qué es el PLE?
**R:** Programa de Libros Electrónicos, formato .txt que SUNAT requiere para tus libros contables.

### ❓ ¿Puedo exportar a Excel?
**R:** Sí, en Libros Electrónicos hay botón "Excel" en cada tab.

---

## 🎨 Tips y Atajos

### ✨ Tip 1: Series Correlativas
El sistema genera automáticamente el número siguiente. No te preocupes por el correlativo.

### ✨ Tip 2: Cálculo Automático
Solo ingresa el valor SIN IGV. El sistema calcula el IGV y total automáticamente.

### ✨ Tip 3: Validaciones
El sistema valida que:
- RUC tenga 11 dígitos
- DNI tenga 8 dígitos
- Items tengan descripción
- Valores sean numéricos

### ✨ Tip 4: Multi-OSE
Puedes cambiar de proveedor OSE en cualquier momento desde Config SUNAT.

---

## 📊 Dashboard de Métricas

En el futuro verás métricas como:
- 📈 Comprobantes emitidos este mes
- 💰 Total facturado
- 📊 IGV por pagar
- ⚠️ Comprobantes pendientes

---

## 🔄 Flujo Recomendado

```
📅 DIARIO
├── Emitir comprobantes según ventas
└── Verificar estado en Facturación Electrónica

📅 SEMANAL
├── Revisar Libros Electrónicos
└── Verificar que todo esté registrado

📅 MENSUAL
├── Calcular IGV (Reportes SUNAT)
├── Exportar Libros Electrónicos
├── Generar PDT 621
└── Presentar declaración a SUNAT
```

---

## 🚨 Checklist Pre-Producción

Antes de usar en producción, verifica:

- [ ] RUC de empresa configurado
- [ ] Certificado digital cargado
- [ ] OSE configurado (Nubefact, etc.)
- [ ] Series autorizadas por SUNAT
- [ ] Credenciales OSE verificadas
- [ ] Prueba en ambiente de homologación
- [ ] Backup de datos configurado

---

## 📞 Soporte

### Documentación Completa
📄 `/GUIA_INTEGRACION_SUNAT.md`

### Recursos SUNAT
- Portal: https://www.sunat.gob.pe
- CPE: https://cpe.sunat.gob.pe
- Orientación: (01) 315-0730

### Proveedores OSE
- Nubefact: https://nubefact.com
- Facturador.pe: https://facturador.pe

---

## ✅ Checklist de Inicio

Para empezar hoy:

1. [ ] Abre SmartPet
2. [ ] Inicia sesión
3. [ ] Ve a "Config SUNAT"
4. [ ] Completa datos de empresa
5. [ ] Guarda configuración
6. [ ] Ve a "Facturación Electrónica"
7. [ ] Emite un comprobante de prueba
8. [ ] Verifica que aparezca en la lista
9. [ ] ¡Listo! Ya estás facturando electrónicamente

---

## 🎉 ¡Empecemos!

**Todo está listo para que empieces a facturar electrónicamente.**

1. Abre SmartPet
2. Busca la sección **🇵🇪 SUNAT Perú**
3. Comienza con **Config SUNAT**

---

**¿Necesitas ayuda?** Consulta `/GUIA_INTEGRACION_SUNAT.md` para más detalles.

**¡Éxito con tu facturación electrónica!** 🚀🇵🇪
