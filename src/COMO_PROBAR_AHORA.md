# 🎯 CÓMO PROBAR AHORA (3 MINUTOS)

## ⚡ START HERE

```bash
npm run dev
```

Espera a que inicie...

```
✓ Ready in 2.3s
➜ Local:   http://localhost:3000
```

---

## 🧪 TEST RÁPIDO #1: VALIDADOR

### 1. Abrir navegador:
```
http://localhost:3000
```

### 2. En la app:
```
1. Click: Sidebar → "📅 Citas"
2. Click: Botón "➕ Nueva Cita"
3. Llenar:
   Cliente: Juan Pérez (dropdown)
   Mascota: Rocky (auto)
   Servicio: Click en "✂️ Baño completo"
   Fecha: Mañana
   Hora: 10:00 AM
   Vehículo: Vehículo 1

4. Click: "Crear Cita"
```

### 3. Ver resultado:
```
✅ Toast verde: "Horario disponible"
✅ Toast verde: "Cita creada exitosamente"
```

### 4. Probar validación:
```
5. Click: "➕ Nueva Cita" otra vez
6. MISMO cliente, MISMA hora, MISMO vehículo
7. Click: "Crear Cita"
```

### 5. Ver error esperado:
```
❌ Toast rojo: "Conflicto de horario detectado"
📝 Sugerencias:
   • Cambiar a 11:00 AM
   • Usar Vehículo 2
   • Cambiar fecha
```

**✅ VALIDADOR FUNCIONA!**

---

## 🔑 TEST RÁPIDO #2: PASSWORD RECOVERY

### 1. IMPORTANTE: Abrir consola
```
Presiona: F12
Ve a pestaña: "Console"
```

### 2. En la app:
```
1. Click: Sidebar → "🔑 Recuperar Password"
```

### 3. PASO 1 - Email:
```
2. Escribir: test@smartpet.com
3. Click: "Enviar Código"
```

### 4. EN LA CONSOLA (F12):
```
Verás algo así:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 CÓDIGO DE RECUPERACIÓN (MODO DEV)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: test@smartpet.com
Código: 843921  ← ⚠️ COPIAR ESTE NÚMERO
Expira en: 10 minutos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. COPIAR el código (ej: 843921)
```

### 5. PASO 2 - Código:
```
5. Pegar código en la app
6. Click: "Verificar Código"
```

### 6. PASO 3 - Nueva Password:
```
7. Nueva: NuevaPass123
8. Confirmar: NuevaPass123
9. Click: "Restablecer Contraseña"
```

### 7. Ver resultado:
```
✅ Pantalla de éxito
✅ "Contraseña actualizada exitosamente"

EN LA CONSOLA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ CONTRASEÑA RESTABLECIDA (MODO DEV)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: test@smartpet.com
Nueva contraseña: NuevaPass123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**✅ PASSWORD RECOVERY FUNCIONA!**

---

## 🎯 CÓDIGO MÁGICO (ATAJO)

Si no quieres revisar la consola:

### Usar código especial:

```
1. Ir a: Sidebar → "🔑 Recuperar Password"
2. Email: cualquiera@ejemplo.com
3. Click: "Enviar Código"
4. Código: 123456  ← Siempre funciona
5. Click: "Verificar"
6. Password: Test1234
7. Click: "Restablecer"
```

**✅ Funciona sin revisar consola!**

---

## 💾 TEST RÁPIDO #3: EXPORTACIÓN

### 1. En la app:
```
1. Click: Sidebar → "💾 Exportar Datos"
```

### 2. Seleccionar:
```
2. Check: ✓ Clientes
3. Check: ✓ Mascotas
4. Check: ✓ Citas
5. Formato: JSON
6. Click: "Exportar Datos"
```

### 3. Ver resultado:
```
✅ Barra progreso: 0% → 100%
✅ Descarga archivo: smartpet-backup-2024-12-31-HHMMSS.json
✅ Toast: "Exportación completada"
```

**✅ EXPORTACIÓN FUNCIONA!**

---

## 🎊 ¡TODO LISTO!

Si llegaste aquí y todo funcionó:

```
✅ Validador integrado
✅ Password recovery operativo
✅ Exportación funcional
✅ Sistema 100% funcional en desarrollo
```

---

## 🆘 SI ALGO FALLA

### No veo código en consola:
```
1. Presiona F12
2. Pestaña "Console"
3. Busca texto: "📧 CÓDIGO"
```

### Validador no funciona:
```
1. Verifica que llenaste TODOS los campos
2. Fecha debe ser día laboral (Lun-Vie)
3. Hora entre 8am-6pm
```

### No descarga archivo:
```
1. Revisa carpeta "Descargas"
2. Permite descargas en navegador
3. Prueba con formato CSV
```

---

## 📖 MÁS INFORMACIÓN

- 🧪 **Testing detallado:** Ver `/TESTING_RAPIDO.md`
- 📘 **Docs técnicas:** Ver `/IMPLEMENTACION_OPCION_C.md`
- 📊 **Resumen:** Ver `/RESUMEN_OPCION_C.md`

---

## 🎯 CHECKLIST RÁPIDO

- [ ] Inicié servidor: `npm run dev`
- [ ] Probé validador: ✅ Funciona
- [ ] Probé password recovery: ✅ Funciona
- [ ] Probé código 123456: ✅ Funciona
- [ ] Probé exportación: ✅ Funciona

**Total tiempo: 3 minutos**

---

**🎉 ¡FELICITACIONES! TODO FUNCIONA 🎉**

Ahora puedes:
1. ✅ Marcar como completado
2. 📝 Revisar documentación detallada
3. 🚀 Continuar con siguiente paso
