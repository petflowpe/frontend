# 🧪 TESTING RÁPIDO - OPCIÓN C

## ⚡ INICIO RÁPIDO (2 MINUTOS)

```bash
# 1. Iniciar servidor
npm run dev

# 2. Abrir navegador
http://localhost:3000

# 3. Abrir consola (IMPORTANTE)
F12 → Pestaña "Console"
```

---

## ✅ TEST 1: Validador de Disponibilidad (1 min)

### Pasos:

1. **Ir a Citas**
   - Sidebar → `📅 Citas`

2. **Nueva Cita**
   - Click botón `➕ Nueva Cita`

3. **Llenar formulario:**
   - Cliente: `Juan Pérez` (seleccionar del dropdown)
   - Mascota: `Rocky` (aparece automático)
   - Servicio: `✂️ Baño completo` (click en card)
   - Fecha: Seleccionar mañana
   - Hora: `10:00 AM`
   - Vehículo: `Vehículo 1`

4. **Crear**
   - Click `Crear Cita`

### Resultado esperado:

```
✅ Toast verde: "✅ Horario disponible"
✅ Toast verde: "✅ Cita creada exitosamente"
✅ Cita aparece en la lista
```

### Probar validación:

5. **Crear otra cita MISMA HORA:**
   - Mismo cliente, misma hora, mismo vehículo
   - Click `Crear Cita`

### Resultado esperado:

```
❌ Toast rojo: "Conflicto de horario detectado"
📝 Descripción: "Sugerencias:
   • Cambiar a 11:00 AM
   • Usar Vehículo 2
   • Cambiar fecha"
```

**✅ VALIDADOR FUNCIONA!**

---

## 🔑 TEST 2: Recuperación Password (2 min)

### Pasos:

1. **Ir a Password Recovery**
   - Sidebar → `🔑 Recuperar Password`

2. **PASO 1 - Email:**
   ```
   Email: test@smartpet.com
   Click: "Enviar Código"
   ```

3. **⚠️ ABRIR CONSOLA (F12)**
   - Buscar mensaje:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📧 CÓDIGO DE RECUPERACIÓN (MODO DEV)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Email: test@smartpet.com
   Código: 843921  ← COPIAR ESTE
   Expira en: 10 minutos
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

4. **PASO 2 - Código:**
   ```
   Código: [PEGAR EL CÓDIGO COPIADO]
   Click: "Verificar Código"
   ```

5. **PASO 3 - Nueva Contraseña:**
   ```
   Nueva contraseña: NuevaPass123
   Confirmar: NuevaPass123
   Click: "Restablecer Contraseña"
   ```

6. **Revisar consola nuevamente:**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✅ CONTRASEÑA RESTABLECIDA (MODO DEV)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Email: test@smartpet.com
   Nueva contraseña: NuevaPass123
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

### Resultado esperado:

```
✅ Pantalla de éxito
✅ Mensaje: "Contraseña actualizada exitosamente"
✅ Botón: "Volver al inicio"
```

**✅ PASSWORD RECOVERY FUNCIONA!**

---

## 🎯 TEST 3: Código Especial (30 seg)

### Usar código mágico que siempre funciona:

1. **Ir a Password Recovery**
   - Sidebar → `🔑 Recuperar Password`

2. **Email cualquiera:**
   ```
   Email: cualquiera@ejemplo.com
   Click: "Enviar Código"
   ```

3. **Código mágico:**
   ```
   Código: 123456
   Click: "Verificar"
   ```

4. **Nueva password:**
   ```
   Password: Test1234
   Confirmar: Test1234
   Click: "Restablecer"
   ```

### Resultado esperado:

```
✅ Funciona sin necesidad de revisar consola
✅ Código 123456 es aceptado siempre
✅ Contraseña se actualiza
```

**✅ CÓDIGO ESPECIAL FUNCIONA!**

---

## 📊 TEST 4: Exportación de Datos (30 seg)

1. **Ir a Exportar Datos**
   - Sidebar → `💾 Exportar Datos`

2. **Seleccionar tablas:**
   ```
   ✓ Clientes
   ✓ Mascotas
   ✓ Citas
   ```

3. **Formato:**
   ```
   Seleccionar: JSON
   ```

4. **Exportar:**
   ```
   Click: "Exportar Datos"
   ```

### Resultado esperado:

```
✅ Barra de progreso 0% → 100%
✅ Descarga archivo: smartpet-backup-2024-12-31-HHMMSS.json
✅ Toast: "Exportación completada"
```

**✅ EXPORTACIÓN FUNCIONA!**

---

## 🐛 TROUBLESHOOTING

### ❌ No veo el código en consola

**Solución:**
```
1. Presiona F12
2. Ve a pestaña "Console"
3. Si hay muchos mensajes, busca "📧"
4. O filtra por "CÓDIGO"
```

### ❌ Error: "Código incorrecto"

**Solución:**
```
1. Verifica que copiaste TODO el número
2. O usa código mágico: 123456
3. O genera nuevo código
```

### ❌ Validador no funciona

**Solución:**
```
1. Verifica que llenaste TODOS los campos
2. Fecha debe ser día laboral (Lun-Vie)
3. Hora debe ser entre 8am-6pm
```

### ❌ No se descarga el archivo

**Solución:**
```
1. Verifica permisos de descargas en navegador
2. Revisa carpeta de Descargas
3. Prueba con otro formato (CSV)
```

---

## 💾 VER DATOS GUARDADOS

### En consola del navegador:

```javascript
// Ver códigos de recuperación
JSON.parse(localStorage.getItem('smartpet_reset_codes'))

// Ver usuarios
JSON.parse(localStorage.getItem('smartpet_users'))

// Resultado ejemplo:
{
  "test@smartpet.com": {
    "code": "843921",
    "createdAt": "2024-12-31T10:00:00.000Z",
    "expiresAt": "2024-12-31T10:10:00.000Z",
    "used": false
  }
}
```

### Limpiar datos:

```javascript
// Si quieres empezar de cero:
localStorage.removeItem('smartpet_reset_codes')
localStorage.removeItem('smartpet_users')
```

---

## ✅ CHECKLIST COMPLETO

### Validador de Disponibilidad:
- [ ] Crear cita normal → funciona
- [ ] Crear cita en horario ocupado → muestra error
- [ ] Muestra sugerencias de horarios → funciona
- [ ] Permite cita en horario alternativo → funciona

### Password Recovery:
- [ ] Solicitar código → genera y muestra en consola
- [ ] Código expira en 10 min → funciona
- [ ] Verificar código correcto → acepta
- [ ] Verificar código incorrecto → rechaza
- [ ] Código 123456 → acepta siempre
- [ ] Actualizar password → funciona
- [ ] Password débil → rechaza
- [ ] Password fuerte → acepta

### Exportación:
- [ ] Seleccionar tablas → funciona
- [ ] Exportar JSON → descarga
- [ ] Exportar CSV → descarga
- [ ] Exportar Excel → descarga (si instalaste xlsx)
- [ ] Muestra progreso → funciona

---

## 🎉 FELICITACIONES

Si todos los tests pasaron:

```
✅ Validador integrado y funcionando
✅ Password recovery mock funcional  
✅ Exportación operativa
✅ Sistema listo para desarrollo
```

**Total tiempo testing: 5 minutos**

---

## 📝 NOTAS IMPORTANTES

1. **Consola abierta (F12)** es OBLIGATORIA para ver códigos
2. **Código 123456** funciona SIEMPRE (para testing rápido)
3. **Códigos expiran** en 10 minutos
4. **LocalStorage** guarda todo temporalmente
5. **Mock funciona** igual que producción

---

## 🚀 SIGUIENTE PASO

Si todo funciona:

1. ✅ Marcar como completado
2. 📋 Revisar `/IMPLEMENTACION_OPCION_C.md` para detalles
3. 🔧 Configurar producción cuando estés listo
4. 📊 Continuar con otros Quick Wins

---

**🎊 ¡SISTEMA 100% FUNCIONAL! 🎊**
