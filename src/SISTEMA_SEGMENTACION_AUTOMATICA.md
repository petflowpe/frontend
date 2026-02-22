# 🏆 Sistema de Segmentación Automática de Clientes - SmartPet

## 📋 Índice
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [¿Cómo Funciona?](#cómo-funciona)
3. [Instalación en Supabase](#instalación-en-supabase)
4. [Uso en el Frontend](#uso-en-el-frontend)
5. [Ejemplos de Código](#ejemplos-de-código)
6. [Mantenimiento](#mantenimiento)
7. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 📊 Resumen Ejecutivo

### ¿Qué hace este sistema?

Clasifica **automáticamente** a tus clientes en 3 categorías según la cantidad de mascotas que tienen registradas:

| Categoría | Mascotas | Icono | Descuento | % de Clientes |
|-----------|----------|-------|-----------|---------------|
| 🥇 **Oro** | 4 o más | 🥇 | 15% | 3-5% |
| 🥉 **Bronce** | 2-3 mascotas | 🥉 | 10% | 65-70% |
| 🥈 **Plata** | 1 mascota | 🥈 | 0% | 30-35% |

### ✨ Beneficios

- ✅ **Automático**: No requiere intervención manual
- ✅ **En tiempo real**: Se actualiza al instante al registrar/eliminar mascotas
- ✅ **Escalable**: Funciona con 10 o 10,000 clientes
- ✅ **Flexible**: Fácil ajustar umbrales (ej: cambiar 4+ a 5+ para Oro)
- ✅ **Transparente**: Los clientes ven su categoría y progreso

---

## 🔧 ¿Cómo Funciona?

### Flujo Automático

```
┌─────────────────────────────────────────────────────────┐
│ CLIENTE REGISTRA MASCOTA                                │
│ ↓                                                       │
│ Trigger de Supabase se activa automáticamente          │
│ ↓                                                       │
│ Sistema cuenta mascotas ACTIVAS del cliente            │
│ ↓                                                       │
│ Calcula categoría:                                      │
│   • 4+ mascotas → Oro                                   │
│   • 2-3 mascotas → Bronce                               │
│   • 1 mascota → Plata                                   │
│ ↓                                                       │
│ Actualiza tabla "users":                                │
│   - categoria = "Oro" / "Bronce" / "Plata"              │
│   - cantidad_mascotas = número actualizado              │
│   - updated_at = timestamp actual                       │
│ ↓                                                       │
│ CLIENTE VE SU NUEVA CATEGORÍA AL INSTANTE               │
└─────────────────────────────────────────────────────────┘
```

### Casos de Uso

#### 1️⃣ Cliente nuevo registra su primera mascota
```
Estado inicial: 
├─ categoria = NULL (sin categoría)
├─ cantidad_mascotas = 0

Cliente registra "Firulais" (Perro)
↓
Trigger automático:
├─ Cuenta mascotas: 1
├─ categoria → "Plata"
├─ cantidad_mascotas → 1

✅ Cliente ahora es PLATA
```

#### 2️⃣ Cliente registra su 4ta mascota (sube a Oro)
```
Estado actual:
├─ categoria = "Bronce"
├─ cantidad_mascotas = 3

Cliente registra 4ta mascota
↓
Trigger automático:
├─ Cuenta mascotas: 4
├─ categoria → "Oro" ⭐
├─ cantidad_mascotas → 4

✅ Cliente asciende a ORO
📧 Email automático: "¡Felicidades, ahora eres Oro!"
```

#### 3️⃣ Mascota fallece (ajuste automático)
```
Estado actual:
├─ categoria = "Oro"
├─ cantidad_mascotas = 4

Cliente marca mascota como "fallecido = true"
↓
Trigger automático:
├─ Cuenta mascotas activas: 3 (excluye fallecida)
├─ categoria → "Bronce"
├─ cantidad_mascotas → 3

✅ Categoría ajustada automáticamente
📧 Email de condolencias (opcional)
```

---

## 🚀 Instalación en Supabase

### Paso 1: Conectar a tu proyecto de Supabase

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Abre el **SQL Editor** (icono de código en la barra lateral)
3. Crea un nuevo query

### Paso 2: Ejecutar el script SQL

Copia y pega todo el contenido del archivo:
```
/supabase/migrations/001_segmentacion_automatica.sql
```

Y haz click en **RUN** o presiona `Ctrl+Enter`

### Paso 3: Verificar instalación

Ejecuta esta consulta para ver las estadísticas:

```sql
SELECT * FROM vista_estadisticas_segmentacion;
```

Deberías ver algo como:

```
total_clientes | clientes_oro | porcentaje_oro | clientes_bronce | ...
-----------------------------------------------------------------------------
       537     |      15      |      2.8       |       315       | ...
```

### Paso 4: Migrar datos existentes (si aplica)

Si ya tienes clientes y mascotas en tu base de datos, ejecuta:

```sql
SELECT * FROM recalcular_todas_categorias();
```

Esto calculará la categoría de **todos los clientes existentes**.

---

## 💻 Uso en el Frontend

### 1. Importar el Hook

```tsx
import { useClientCategory } from '../hooks/useClientCategory';
import { CategoryBadge } from '../components/client/CategoryBadge';
```

### 2. En el Perfil del Cliente

```tsx
// En tu componente de perfil de cliente
import { CategoryBadge } from '../components/client/CategoryBadge';

function ClientProfile({ user }: { user: User }) {
  return (
    <div>
      <h1>{user.firstName} {user.lastName}</h1>
      
      {/* Mostrar categoría con todos los detalles */}
      <CategoryBadge 
        categoria={user.categoria}
        cantidadMascotas={user.cantidad_mascotas || 0}
        variant="full"
        showMotivation={true}
      />
    </div>
  );
}
```

### 3. En Listas o Tablas (Versión Compacta)

```tsx
// En una tabla de clientes
function ClientTable({ clients }: { clients: User[] }) {
  return (
    <table>
      <tbody>
        {clients.map(client => (
          <tr key={client.id}>
            <td>{client.firstName}</td>
            <td>
              <CategoryBadge 
                categoria={client.categoria}
                cantidadMascotas={client.cantidad_mascotas || 0}
                variant="inline"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### 4. Aplicar Descuento en Precios

```tsx
import { PriceWithDiscount } from '../components/client/CategoryBadge';

function ServicePrice({ price, clientCategory }: { price: number; clientCategory: ClientCategory }) {
  return (
    <div>
      <h3>Precio del servicio:</h3>
      <PriceWithDiscount 
        precio={price}
        categoria={clientCategory}
      />
    </div>
  );
}

// Muestra:
// S/ 100.00 (tachado) -10% (badge)
// S/ 90.00 (grande, destacado)
// (Ahorras S/ 10.00)
```

### 5. Mostrar Solo el Icono

```tsx
import { CategoryIcon } from '../components/client/CategoryBadge';

function ClientListItem({ client }: { client: User }) {
  return (
    <div>
      <CategoryIcon 
        categoria={client.categoria}
        cantidadMascotas={client.cantidad_mascotas || 0}
      />
      {client.firstName}
    </div>
  );
}

// Al pasar el mouse sobre el icono muestra tooltip con detalles
```

---

## 📚 Ejemplos de Código

### Ejemplo 1: Formulario de Registro de Mascota

```tsx
import { useState } from 'react';
import { supabase } from '../supabase/client';
import { toast } from 'sonner';
import { getCategoryChangeMessage } from '../hooks/useClientCategory';

function PetRegistrationForm({ userId, currentCategory }: { userId: string; currentCategory: ClientCategory | null }) {
  const [petData, setPetData] = useState({
    name: '',
    species: 'Perro',
    breed: '',
    // ... otros campos
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Registrar mascota
      const { data: newPet, error } = await supabase
        .from('pets')
        .insert({
          userId: userId,
          ...petData,
          fallecido: false
        })
        .select()
        .single();

      if (error) throw error;

      // El trigger actualizó automáticamente la categoría del cliente
      // Obtener la categoría actualizada
      const { data: updatedUser } = await supabase
        .from('users')
        .select('categoria, cantidad_mascotas')
        .eq('id', userId)
        .single();

      // Si la categoría cambió, mostrar mensaje especial
      if (updatedUser && updatedUser.categoria !== currentCategory) {
        const message = getCategoryChangeMessage(currentCategory, updatedUser.categoria);
        toast.success(
          <div>
            <span className="text-2xl">{message.emoji}</span>
            <strong>{message.title}</strong>
            <p>{message.message}</p>
          </div>
        );
      } else {
        toast.success('¡Mascota registrada exitosamente!');
      }

      // Recargar datos del usuario
      // ...

    } catch (error) {
      console.error('Error al registrar mascota:', error);
      toast.error('Error al registrar mascota');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
      <button type="submit">Registrar Mascota</button>
    </form>
  );
}
```

### Ejemplo 2: Dashboard de Administración - Estadísticas de Segmentación

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { Card } from './ui/card';

interface SegmentationStats {
  total_clientes: number;
  clientes_oro: number;
  porcentaje_oro: number;
  clientes_bronce: number;
  porcentaje_bronce: number;
  clientes_plata: number;
  porcentaje_plata: number;
  sin_categoria: number;
}

function SegmentationDashboard() {
  const [stats, setStats] = useState<SegmentationStats | null>(null);

  useEffect(() => {
    async function loadStats() {
      const { data } = await supabase
        .from('vista_estadisticas_segmentacion')
        .select('*')
        .single();
      
      setStats(data);
    }
    loadStats();
  }, []);

  if (!stats) return <div>Cargando...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-2">Total Clientes</h3>
        <p className="text-4xl font-bold">{stats.total_clientes}</p>
      </Card>

      {/* Oro */}
      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">🥇 Oro</h3>
            <p className="text-4xl font-bold text-yellow-800">{stats.clientes_oro}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-yellow-800">{stats.porcentaje_oro}%</p>
          </div>
        </div>
      </Card>

      {/* Bronce */}
      <Card className="p-6 bg-orange-50 border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">🥉 Bronce</h3>
            <p className="text-4xl font-bold text-orange-800">{stats.clientes_bronce}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-800">{stats.porcentaje_bronce}%</p>
          </div>
        </div>
      </Card>

      {/* Plata */}
      <Card className="p-6 bg-gray-50 border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">🥈 Plata</h3>
            <p className="text-4xl font-bold text-gray-700">{stats.clientes_plata}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-700">{stats.porcentaje_plata}%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

### Ejemplo 3: Filtrar Clientes por Categoría

```tsx
function ClientList() {
  const [selectedCategory, setSelectedCategory] = useState<ClientCategory | 'all'>('all');
  const [clients, setClients] = useState<User[]>([]);

  useEffect(() => {
    async function loadClients() {
      let query = supabase
        .from('users')
        .select('*')
        .order('cantidad_mascotas', { ascending: false });

      // Filtrar por categoría si no es "todos"
      if (selectedCategory !== 'all') {
        query = query.eq('categoria', selectedCategory);
      }

      const { data } = await query;
      setClients(data || []);
    }

    loadClients();
  }, [selectedCategory]);

  return (
    <div>
      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setSelectedCategory('all')}
          className={selectedCategory === 'all' ? 'active' : ''}
        >
          Todos
        </button>
        <button 
          onClick={() => setSelectedCategory('Oro')}
          className={selectedCategory === 'Oro' ? 'active' : ''}
        >
          🥇 Oro
        </button>
        <button 
          onClick={() => setSelectedCategory('Bronce')}
          className={selectedCategory === 'Bronce' ? 'active' : ''}
        >
          🥉 Bronce
        </button>
        <button 
          onClick={() => setSelectedCategory('Plata')}
          className={selectedCategory === 'Plata' ? 'active' : ''}
        >
          🥈 Plata
        </button>
      </div>

      {/* Lista de clientes */}
      <div className="space-y-2">
        {clients.map(client => (
          <div key={client.id} className="flex items-center gap-4 p-4 border rounded">
            <CategoryIcon 
              categoria={client.categoria}
              cantidadMascotas={client.cantidad_mascotas || 0}
            />
            <div className="flex-1">
              <p className="font-semibold">{client.firstName} {client.lastName}</p>
              <p className="text-sm text-gray-600">{client.email}</p>
            </div>
            <Badge>
              {client.cantidad_mascotas} mascota{client.cantidad_mascotas !== 1 ? 's' : ''}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔧 Mantenimiento

### Recalcular Todas las Categorías

Si por alguna razón necesitas recalcular las categorías de todos los clientes:

```sql
SELECT * FROM recalcular_todas_categorias();
```

Esto retorna una tabla con todos los cambios realizados.

### Cambiar Umbrales de Categorías

Para cambiar los umbrales (por ejemplo, que Oro sea 5+ en vez de 4+):

1. Abre el archivo `/supabase/migrations/001_segmentacion_automatica.sql`
2. Busca la función `calcular_categoria_cliente()`
3. Modifica las condiciones:

```sql
-- Cambiar de:
IF cantidad_mascotas_activas >= 4 THEN
  nueva_categoria := 'Oro';

-- A:
IF cantidad_mascotas_activas >= 5 THEN
  nueva_categoria := 'Oro';
```

4. Re-ejecuta la migración
5. Ejecuta `SELECT recalcular_todas_categorias();`

### Ver Log de Cambios

El trigger registra cambios en el log de PostgreSQL:

```sql
-- Ver últimos cambios (requiere permisos de admin)
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%calcular_categoria_cliente%'
ORDER BY calls DESC;
```

---

## ❓ Preguntas Frecuentes

### ¿La categoría se actualiza en tiempo real?

**Sí.** El trigger se ejecuta **inmediatamente** después de:
- Insertar una mascota
- Actualizar el campo `fallecido` de una mascota
- Eliminar una mascota

### ¿Qué pasa si un cliente no tiene mascotas?

Su categoría será `NULL` (sin categoría) y aparecerá como "Sin categoría" en el frontend.

### ¿El cliente puede cambiar su categoría manualmente?

**No.** La categoría se calcula **solo** por la cantidad de mascotas. Es automática e inmutable manualmente.

### ¿Puedo tener diferentes categorías para Peluquería vs MovilVet?

El sistema actual usa una categoría global. Si necesitas categorías diferentes por servicio, se requiere modificar la lógica (agregar `categoria_peluqueria` y `categoria_movilvet`).

### ¿Cómo manejo mascotas fallecidas?

Las mascotas con `fallecido = TRUE` **se excluyen automáticamente** del conteo. El trigger recalcula la categoría al marcar una mascota como fallecida.

### ¿Los descuentos se aplican automáticamente?

El sistema **calcula** el descuento pero debes aplicarlo manualmente en el proceso de pago. Usa el hook `useClientCategory` para obtener el descuento:

```tsx
const categoryInfo = useClientCategory(cliente.categoria, cliente.cantidad_mascotas);
const precioFinal = categoryInfo.applyDiscount(precioBase);
```

### ¿Puedo renombrar las categorías?

Sí, pero requiere cambios en múltiples lugares:
1. Migración SQL (cambiar valores 'Oro', 'Bronce', 'Plata')
2. Tipos TypeScript (`/types/index.ts`)
3. Hook de categorías (`/hooks/useClientCategory.ts`)

### ¿Cómo pruebo el sistema sin datos reales?

```sql
-- Crear cliente de prueba
INSERT INTO users (id, firstName, lastName, email, documentType, documentNumber, password)
VALUES (gen_random_uuid(), 'Test', 'User', 'test@example.com', 'DNI', '12345678', 'test123');

-- Obtener el ID del cliente creado
SELECT id FROM users WHERE email = 'test@example.com';

-- Registrar mascotas de prueba (reemplaza 'USER_ID' con el ID real)
INSERT INTO pets (id, userId, name, species, breed, age, weight, gender, color, fallecido)
VALUES 
  (gen_random_uuid(), 'USER_ID', 'Firulais', 'Perro', 'Labrador', 3, 25, 'Macho', 'Dorado', false),
  (gen_random_uuid(), 'USER_ID', 'Michi', 'Gato', 'Siamés', 2, 4, 'Hembra', 'Blanco', false),
  (gen_random_uuid(), 'USER_ID', 'Rex', 'Perro', 'Pastor Alemán', 5, 30, 'Macho', 'Negro', false),
  (gen_random_uuid(), 'USER_ID', 'Luna', 'Perro', 'Golden', 1, 20, 'Hembra', 'Dorado', false);

-- Ver el resultado (debería ser Oro con 4 mascotas)
SELECT id, firstName, categoria, cantidad_mascotas FROM users WHERE email = 'test@example.com';
```

---

## 🎉 ¡Sistema Implementado!

Ahora tu sistema de SmartPet tiene segmentación automática de clientes. Los clientes verán su categoría actualizada en tiempo real y podrás tomar decisiones estratégicas basadas en datos.

### Próximos Pasos Sugeridos:

1. ✅ **Implementar notificaciones** cuando un cliente sube de categoría
2. ✅ **Crear dashboard de segmentación** para administradores
3. ✅ **Integrar descuentos** en el proceso de pago
4. ✅ **Campañas de marketing** segmentadas por categoría
5. ✅ **Programa de fidelidad** con recompensas por categoría

---

**¿Necesitas ayuda?** Revisa los ejemplos de código o consulta la documentación de Supabase.
