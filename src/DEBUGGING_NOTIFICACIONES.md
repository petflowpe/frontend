# 🔍 GUÍA DE DEBUGGING - NOTIFICACIONES

## ✅ **CÓDIGO ACTUALIZADO CON LOGS**

He agregado logs detallados en ambos componentes para identificar el problema.

---

## 🧪 **PASOS PARA PROBAR**

### **1. Refresca la Página**
```
Ctrl + R (Windows/Linux)
Cmd + R (Mac)
```

### **2. Abre la Consola del Navegador**
```
F12 o Ctrl + Shift + I
```

### **3. Haz Clic en la Campana 🔔**
- Verás el popover con las notificaciones
- Busca notificaciones con badge rojo "Acción Requerida"

### **4. Haz Clic en "Ver Detalles"**
- El botón está debajo del badge "Acción Requerida"
- Tiene un icono de ojo 👁️

### **5. Observa la Consola**

**Si funciona, verás:**
```
🔍 Ver Detalles clicked: {id: "...", title: "...", type: "payment", ...}
🔍 onViewDetails function: ƒ handleViewNotificationDetails(notification)
✅ handleViewNotificationDetails ejecutado con: {id: "...", title: "...", type: "payment", ...}
💰 Navegando a payments
```

**Si NO funciona, verás:**
```
🔍 Ver Detalles clicked: {id: "...", title: "...", type: "payment", ...}
🔍 onViewDetails function: undefined
❌ onViewDetails no está definido
```

---

## 🎯 **NOTIFICACIONES CON ACCIÓN REQUERIDA**

Según los datos del sistema, estas notificaciones tienen el botón "Ver Detalles":

| Título | Tipo | Navegación Esperada |
|--------|------|---------------------|
| Pago pendiente de confirmar | payment | → Gestión de Pagos |
| Stock crítico de shampoo | inventory | → Kardex de Productos |
| Mantenimiento vehículo VAN-001 vencido | vehicle | → Gestión de Vehículos |
| Revisión de citas del día requerida | appointment | → Gestión de Citas |

---

## 🔧 **QÉPASA EN EL CÓDIGO**

### **NotificationCenter.tsx (línea 175):**
```tsx
onClick={(e) => {
  e.stopPropagation();
  console.log('🔍 Ver Detalles clicked:', notification);
  console.log('🔍 onViewDetails function:', onViewDetails);
  if (onViewDetails) {
    onViewDetails(notification);
  } else {
    console.error('❌ onViewDetails no está definido');
  }
  setIsOpen(false);
}}
```

### **Header.tsx (línea 52):**
```tsx
const handleViewNotificationDetails = (notification: any) => {
  console.log('✅ handleViewNotificationDetails ejecutado con:', notification);
  
  switch (notification.type) {
    case 'appointment':
      console.log('📅 Navegando a appointments');
      setActiveTab?.('appointments');
      toast.info('Mostrando detalles de la cita', {
        description: notification.title
      });
      break;
    // ... más casos
  }
};
```

### **Header.tsx (línea 203):**
```tsx
<NotificationCenter 
  onViewAll={() => setActiveTab?.('notifications')} 
  onViewDetails={handleViewNotificationDetails} 
/>
```

---

## 🐛 **POSIBLES PROBLEMAS**

### **Problema 1: onViewDetails es undefined**
**Causa:** El Header no está pasando la función
**Solución:** Verificar que Header.tsx esté actualizado

### **Problema 2: setActiveTab es undefined**
**Causa:** La prop `setActiveTab` no llega al Header
**Solución:** Verificar que App.tsx pasa `setActiveTab` al Header

### **Problema 3: El botón no aparece**
**Causa:** La notificación no tiene `actionRequired: true`
**Solución:** Verificar `systemNotificationsData.ts`

### **Problema 4: El clic no hace nada**
**Causa:** El evento se está propagando o el popover no se cierra
**Solución:** Ya tenemos `e.stopPropagation()` y `setIsOpen(false)`

---

## 📋 **CHECKLIST DE VERIFICACIÓN**

Copia y pega este checklist en un comentario cuando pruebes:

```
[ ] Refresqué la página
[ ] Abrí la consola del navegador
[ ] Hice clic en la campana 🔔
[ ] Veo notificaciones con "Acción Requerida"
[ ] Veo el botón "Ver Detalles" con icono de ojo
[ ] Hice clic en "Ver Detalles"
[ ] En consola veo: "🔍 Ver Detalles clicked"
[ ] En consola veo: "🔍 onViewDetails function: ƒ"
[ ] En consola veo: "✅ handleViewNotificationDetails ejecutado"
[ ] El popover se cierra automáticamente
[ ] Navega al módulo correcto
[ ] Veo el toast informativo
```

---

## 🎨 **ASPECTO VISUAL DEL BOTÓN**

El botón "Ver Detalles" se ve así:

```
┌────────────────────────────────────┐
│ 👁️ Ver Detalles                    │
└────────────────────────────────────┘
```

- Width completo
- Border outline
- Altura pequeña (h-8)
- Texto xs
- Margen superior (mt-3)
- Solo aparece si `actionRequired: true`

---

## ✅ **QUÉ ESPERAR**

Cuando hagas clic en "Ver Detalles":

1. **El popover se cierra** (inmediatamente)
2. **Navega al módulo** (cambia la vista)
3. **Muestra un toast** (esquina superior derecha)
4. **En consola aparecen logs** (con emojis)

---

## 📝 **REPORTA LOS RESULTADOS**

Cuando pruebes, por favor reporta:

1. ¿Ves el botón "Ver Detalles"? (Sí/No)
2. ¿Qué logs aparecen en consola? (Copia y pega)
3. ¿El popover se cierra? (Sí/No)
4. ¿Navega al módulo correcto? (Sí/No)
5. ¿Ves el toast? (Sí/No)

---

## 🚀 **ARCHIVOS ACTUALIZADOS**

1. `/components/NotificationCenter.tsx` - Logs de debugging
2. `/components/Header.tsx` - Logs de debugging

**Ambos archivos tienen console.log detallados para identificar el problema.**

---

**¡Ahora prueba y comparte los logs de la consola!** 🔍
