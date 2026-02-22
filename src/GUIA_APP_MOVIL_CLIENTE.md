# 📱 GUÍA COMPLETA: APP MÓVIL PARA CLIENTES - SMARTPET

---

## 🎯 **OBJETIVO DE LA APP**

**Una aplicación móvil donde los clientes puedan:**

✅ Crear su perfil personal  
✅ Registrar sus mascotas con fotos y datos  
✅ Ver disponibilidad de horarios en tiempo real  
✅ Reservar citas  
✅ Ver historial de servicios  
✅ Trackear al groomer en tiempo real  
✅ Gestionar su programa de fidelización  
✅ Pagar desde la app  
✅ Recibir notificaciones push  

---

## 🚀 **OPCIONES TECNOLÓGICAS**

### **OPCIÓN 1: REACT NATIVE (⭐⭐⭐⭐⭐ RECOMENDADA)**

#### **¿Por qué React Native?**

```
✅ Usas el MISMO código para iOS y Android
✅ Ya conoces React → Curva de aprendizaje MÍNIMA
✅ Puedes reutilizar lógica del sistema web (services, contexts)
✅ Gran ecosistema de librerías
✅ Performance nativo (no es webview)
✅ Actualizaciones OTA (sin pasar por App Store)
✅ Empresas que lo usan: Facebook, Instagram, Uber Eats, Airbnb
```

#### **Stack Recomendado:**

```typescript
FRAMEWORK:
✅ React Native (0.73+)
✅ Expo (SDK 50+) → Simplifica TODO

NAVEGACIÓN:
✅ React Navigation v6

ESTADO GLOBAL:
✅ Context API (igual que tu sistema web)
✅ O Zustand (más simple que Redux)

BACKEND:
✅ Supabase (autenticación + base de datos + real-time)

UI COMPONENTS:
✅ React Native Paper (Material Design)
✅ O Tamagui (más moderno, mejor performance)

MAPAS:
✅ React Native Maps (Google Maps)

PAGOS:
✅ Stripe SDK para React Native
✅ O Culqi (para Perú)

NOTIFICACIONES:
✅ Expo Notifications
✅ O Firebase Cloud Messaging

IMÁGENES:
✅ Expo Image Picker (cámara + galería)
✅ Cloudinary o Supabase Storage

FORM HANDLING:
✅ React Hook Form (igual que tu sistema web)
```

---

### **OPCIÓN 2: FLUTTER (⭐⭐⭐⭐)**

#### **¿Por qué Flutter?**

```
✅ Código único para iOS y Android
✅ Performance EXCELENTE (compila a nativo)
✅ UI hermosa y consistente
✅ Google lo respalda
✅ Hot reload instantáneo

❌ Nuevo lenguaje (Dart) → Curva de aprendizaje
❌ No puedes reutilizar código React
```

**Recomendación:** Solo si quieres aprender Flutter o si necesitas performance extremo.

---

### **OPCIÓN 3: PROGRESSIVE WEB APP (PWA) (⭐⭐⭐)**

#### **¿Por qué PWA?**

```
✅ Es simplemente tu web adaptada
✅ Se "instala" en el teléfono
✅ Funciona offline (con Service Workers)
✅ Notificaciones push
✅ Acceso a cámara, GPS, etc.

❌ No está en App Store / Play Store
❌ Funcionalidades limitadas vs app nativa
❌ Performance inferior
```

**Recomendación:** Como MVP rápido, pero NO como solución final.

---

## ⭐ **RECOMENDACIÓN FINAL: EXPO (React Native)**

### **¿Qué es Expo?**

```
Expo es React Native "con esteroides":
✅ Sin necesidad de Xcode/Android Studio para desarrollar
✅ Builds en la nube (no necesitas Mac para iOS)
✅ Actualizaciones OTA (cambios sin pasar por stores)
✅ Módulos pre-configurados (cámara, maps, notificaciones)
✅ Testing real en tu teléfono con Expo Go app
```

---

## 📐 **ARQUITECTURA DE LA APP MÓVIL**

### **Estructura de Carpetas:**

```
smartpet-client-app/
├── app/                        # Rutas (Expo Router)
│   ├── (tabs)/                 # Navegación con tabs
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # Home
│   │   ├── reservar.tsx        # Reservas
│   │   ├── mascotas.tsx        # Mis Mascotas
│   │   ├── historial.tsx       # Historial
│   │   └── perfil.tsx          # Mi Perfil
│   ├── (auth)/                 # Autenticación
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── tracking/[id].tsx       # GPS Tracking dinámico
│   └── _layout.tsx
├── components/                 # Componentes reutilizables
│   ├── PetCard.tsx
│   ├── ServiceCard.tsx
│   ├── AppointmentCard.tsx
│   ├── LoyaltyBadge.tsx
│   └── MapView.tsx
├── contexts/                   # Estado global
│   ├── AuthContext.tsx
│   ├── AppContext.tsx          # Reutilizado del web
│   └── ThemeContext.tsx
├── services/                   # Lógica de negocio
│   ├── supabase.ts
│   ├── appointmentService.ts   # Reutilizado del web
│   ├── loyaltyService.ts       # Reutilizado del web
│   └── notificationService.ts
├── hooks/                      # Custom hooks
│   ├── useAuth.ts
│   ├── useAppointments.ts
│   └── useLocation.ts
├── utils/                      # Utilidades
│   ├── formatters.ts
│   └── validators.ts
└── constants/
    └── Colors.ts
```

---

## 🎨 **DISEÑO DE PANTALLAS**

### **1. Pantalla de Login/Registro**

```
┌─────────────────────┐
│   🐾 SmartPet      │
│                     │
│  Grooming Móvil    │
│  a Domicilio        │
│                     │
│  ┌───────────────┐  │
│  │ Email         │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │ Contraseña    │  │
│  └───────────────┘  │
│                     │
│  [  Iniciar Sesión ]│
│                     │
│  Registrarse        │
│  Olvidé contraseña  │
│                     │
│  ─── O ─────        │
│  [ Google Sign-In ] │
└─────────────────────┘
```

---

### **2. Home (Dashboard del Cliente)**

```
┌─────────────────────┐
│ Hola, María 👋      │
│                     │
│ ┌─────────────────┐ │
│ │ 💎 Nivel Plata  │ │
│ │ 2,450 puntos    │ │
│ │ Siguiente: Oro  │ │
│ │ ████░░░░  65%   │ │
│ └─────────────────┘ │
│                     │
│ Próxima Cita:       │
│ ┌─────────────────┐ │
│ │ ✂️ Baño Completo│ │
│ │ 📅 Vie 15 Dic   │ │
│ │ ⏰ 15:30        │ │
│ │ 🐕 Luna         │ │
│ │ [Ver Tracking]  │ │
│ └─────────────────┘ │
│                     │
│ Acciones Rápidas:   │
│ [📅 Reservar]       │
│ [🐾 Mis Mascotas]   │
│ [📊 Historial]      │
│ [🎁 Beneficios]     │
└─────────────────────┘
```

---

### **3. Mis Mascotas**

```
┌─────────────────────┐
│ Mis Mascotas    [+] │
│                     │
│ ┌─────────────────┐ │
│ │ 🐕 [FOTO]       │ │
│ │ Luna            │ │
│ │ Golden Retriever│ │
│ │ 3 años • 28 kg  │ │
│ │                 │ │
│ │ Última visita:  │ │
│ │ 20 Nov 2024     │ │
│ │                 │ │
│ │ [Ver Historial] │ │
│ │ [Editar]        │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ 🐈 [FOTO]       │ │
│ │ Michi           │ │
│ │ Persa           │ │
│ │ 2 años • 5 kg   │ │
│ │ ...             │ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

### **4. Reservar Cita**

```
┌─────────────────────┐
│ ← Nueva Reserva     │
│                     │
│ 1️⃣ Selecciona      │
│    tu mascota       │
│                     │
│ ┌─────────────────┐ │
│ │ ○ Luna          │ │
│ │ ● Michi ✓       │ │
│ └─────────────────┘ │
│                     │
│ 2️⃣ Elige servicio  │
│                     │
│ [🛁 Baño Básico]    │
│ [✨ Baño Completo]  │
│ [✂️ Corte Completo] │
│ [💆 Spa Premium]    │
│                     │
│ 3️⃣ Fecha y hora    │
│                     │
│ 📅 [Calendario]     │
│                     │
│ ⏰ Horarios:        │
│ [09:00] [09:30]     │
│ [10:00] [10:30]     │
│ ...                 │
│                     │
│ Total: S/ 80.00     │
│ [Confirmar Reserva] │
└─────────────────────┘
```

---

### **5. Tracking en Tiempo Real**

```
┌─────────────────────┐
│ ← Tracking          │
│                     │
│ ┌─────────────────┐ │
│ │                 │ │
│ │    🗺️ MAPA     │ │
│ │                 │ │
│ │     🚗 ----→    │ │
│ │            🏠   │ │
│ │                 │ │
│ └─────────────────┘ │
│                     │
│ 🚗 En Camino        │
│                     │
│ ┌─────┬─────┬─────┐ │
│ │2.4km│ 12' │15:45│ │
│ │Dist │ ETA │Lleg.│ │
│ └─────┴─────┴─────┘ │
│                     │
│ Carlos Rodríguez    │
│ Groomer Profesional │
│ ⭐ 4.9 (234 reseñas)│
│                     │
│ [📞 Llamar]         │
│ [💬 Chat]           │
└─────────────────────┘
```

---

### **6. Perfil y Programa de Fidelización**

```
┌─────────────────────┐
│ Mi Perfil      [⚙️] │
│                     │
│     [FOTO]          │
│   María Pérez       │
│ maria@email.com     │
│                     │
│ ┌─────────────────┐ │
│ │ 💎 Nivel Plata  │ │
│ │                 │ │
│ │ 2,450 puntos    │ │
│ │                 │ │
│ │ Beneficios:     │ │
│ │ ✓ 5% descuento  │ │
│ │ ✓ Prioridad     │ │
│ │ ✓ Cupón B-day   │ │
│ │                 │ │
│ │ Próximo nivel:  │ │
│ │ ORO - 550 pts   │ │
│ │ ████████░░ 82%  │ │
│ └─────────────────┘ │
│                     │
│ Cupones Disponibles:│
│ ┌─────────────────┐ │
│ │ 15% OFF         │ │
│ │ Cumpleaños      │ │
│ │ Válido: 30 días │ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

### **7. Historial de Servicios**

```
┌─────────────────────┐
│ Historial     [🔍]  │
│                     │
│ ┌─────────────────┐ │
│ │ 20 Nov 2024     │ │
│ │ ✂️ Corte Complet│ │
│ │ Luna            │ │
│ │ S/ 120.00       │ │
│ │ ⭐⭐⭐⭐⭐       │ │
│ │ Carlos R.       │ │
│ │ [Ver Detalles]  │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ 15 Oct 2024     │ │
│ │ 🛁 Baño Básico  │ │
│ │ Michi           │ │
│ │ S/ 50.00        │ │
│ │ ⭐⭐⭐⭐⭐       │ │
│ │ Ana M.          │ │
│ │ [Ver Detalles]  │ │
│ └─────────────────┘ │
│                     │
│ Total gastado: S/750│
│ Servicios: 8        │
│ Puntos: 7,500       │
└─────────────────────┘
```

---

## 🔧 **IMPLEMENTACIÓN CON EXPO**

### **1. Instalación:**

```bash
# Instalar Expo CLI
npm install -g expo-cli

# Crear proyecto
npx create-expo-app smartpet-client-app --template tabs

# Entrar al proyecto
cd smartpet-client-app

# Instalar dependencias
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar

# Supabase
npm install @supabase/supabase-js

# React Navigation (si no usas Expo Router)
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack

# UI Components
npm install react-native-paper

# Mapas
npx expo install react-native-maps

# Formularios
npm install react-hook-form

# Imágenes
npx expo install expo-image-picker

# Notificaciones
npx expo install expo-notifications

# Location/GPS
npx expo install expo-location

# Pagos (Stripe)
npm install @stripe/stripe-react-native
```

---

### **2. Configuración de Supabase:**

```typescript
// services/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://tu-proyecto.supabase.co';
const supabaseAnonKey = 'tu-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

---

### **3. Context de Autenticación:**

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

---

### **4. Pantalla de Login:**

```typescript
// app/(auth)/login.tsx
import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        🐾 SmartPet
      </Text>
      <Text variant="titleMedium" style={styles.subtitle}>
        Grooming Móvil a Domicilio
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        style={styles.button}
      >
        Iniciar Sesión
      </Button>

      <Button
        mode="text"
        onPress={() => router.push('/(auth)/register')}
      >
        Crear cuenta nueva
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    marginBottom: 16,
  },
});
```

---

### **5. Pantalla de Reservas:**

```typescript
// app/(tabs)/reservar.tsx
import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Button, Text, Chip } from 'react-native-paper';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function ReservarScreen() {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    loadPets();
    loadServices();
  }, []);

  const loadPets = async () => {
    const { data } = await supabase
      .from('pets')
      .select('*')
      .eq('owner_id', user?.id);
    setPets(data || []);
  };

  const loadServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('active', true);
    setServices(data || []);
  };

  const handleReserva = async () => {
    const { error } = await supabase
      .from('appointments')
      .insert({
        client_id: user?.id,
        pet_id: selectedPet,
        service_id: selectedService,
        date: selectedDate,
        time: selectedTime,
        status: 'pending',
      });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('¡Éxito!', 'Tu cita ha sido reservada');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Nueva Reserva
      </Text>

      {/* Seleccionar Mascota */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
        1️⃣ Selecciona tu mascota
      </Text>
      <View style={styles.chipsContainer}>
        {pets.map((pet) => (
          <Chip
            key={pet.id}
            selected={selectedPet === pet.id}
            onPress={() => setSelectedPet(pet.id)}
            style={styles.chip}
          >
            {pet.name}
          </Chip>
        ))}
      </View>

      {/* Seleccionar Servicio */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
        2️⃣ Elige el servicio
      </Text>
      {services.map((service) => (
        <Card
          key={service.id}
          style={styles.card}
          onPress={() => setSelectedService(service.id)}
        >
          <Card.Content>
            <Text variant="titleMedium">{service.name}</Text>
            <Text variant="bodyMedium">{service.description}</Text>
            <Text variant="headlineSmall" style={styles.price}>
              Desde S/ {service.base_price}
            </Text>
          </Card.Content>
        </Card>
      ))}

      {/* Botón Confirmar */}
      <Button
        mode="contained"
        onPress={handleReserva}
        disabled={!selectedPet || !selectedService}
        style={styles.confirmButton}
      >
        Confirmar Reserva
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  card: {
    marginBottom: 12,
  },
  price: {
    marginTop: 8,
    color: '#6200EE',
  },
  confirmButton: {
    marginTop: 24,
    marginBottom: 32,
  },
});
```

---

## 📲 **NOTIFICACIONES PUSH**

```typescript
// services/notificationService.ts
import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';

// Configurar comportamiento de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  // Solicitar permisos
  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permisos de notificación denegados');
    }
    return status;
  },

  // Obtener token de push
  async getExpoPushToken() {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  },

  // Guardar token en Supabase
  async saveTokenToDatabase(userId: string, token: string) {
    await supabase
      .from('push_tokens')
      .upsert({
        user_id: userId,
        token,
        platform: 'expo',
      });
  },

  // Programar notificación local
  async scheduleNotification(title: string, body: string, trigger: Date) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger,
    });
  },
};
```

---

## 🗺️ **TRACKING GPS EN LA APP**

```typescript
// app/tracking/[id].tsx
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Text, Card } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../services/supabase';

export default function TrackingScreen() {
  const { id } = useLocalSearchParams();
  const [vehicleLocation, setVehicleLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [eta, setEta] = useState(null);

  useEffect(() => {
    // Suscribirse a cambios de ubicación en tiempo real
    const channel = supabase
      .channel('vehicle-location')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vehicles',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setVehicleLocation({
            latitude: payload.new.latitude,
            longitude: payload.new.longitude,
          });
          calculateETA(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const calculateETA = (location) => {
    // Lógica de cálculo de ETA
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: vehicleLocation?.latitude || -12.0464,
          longitude: vehicleLocation?.longitude || -77.0428,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {vehicleLocation && (
          <Marker coordinate={vehicleLocation} title="Tu groomer" />
        )}
        {destination && (
          <Marker coordinate={destination} title="Tu domicilio" />
        )}
      </MapView>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text variant="headlineSmall">Tu groomer está en camino 🚗</Text>
          <Text variant="bodyLarge">ETA: {eta || '--'} minutos</Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  infoCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
});
```

---

## 💳 **INTEGRACIÓN DE PAGOS (STRIPE)**

```typescript
// services/paymentService.ts
import { useStripe } from '@stripe/stripe-react-native';

export function usePayment() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const processPayment = async (amount: number, appointmentId: string) => {
    // 1. Crear PaymentIntent en tu backend
    const response = await fetch('https://tu-api.com/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, appointmentId }),
    });
    const { clientSecret } = await response.json();

    // 2. Inicializar Payment Sheet
    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: 'SmartPet',
    });

    if (initError) throw initError;

    // 3. Presentar Payment Sheet
    const { error: presentError } = await presentPaymentSheet();

    if (presentError) {
      throw presentError;
    }

    return { success: true };
  };

  return { processPayment };
}
```

---

## 🚀 **DEPLOYMENT**

### **Testing:**

```bash
# Correr en tu teléfono con Expo Go
npx expo start

# Escanea el QR code con tu teléfono
```

---

### **Build para Producción:**

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Ambos
eas build --platform all
```

---

### **Publicar en Stores:**

```bash
# Crear cuenta en Expo Application Services (EAS)
eas login

# Configurar proyecto
eas build:configure

# Submit a App Store
eas submit --platform ios

# Submit a Play Store
eas submit --platform android
```

---

## 💰 **COSTOS**

### **Desarrollo:**
```
FREE:
✅ Expo (framework)
✅ React Native
✅ React Navigation
✅ Supabase (hasta 500 MB, 2 GB bandwidth)

PAGOS OPCIONALES:
💰 Expo EAS Build: $29/mes (builds ilimitadas)
💰 Supabase Pro: $25/mes (más recursos)
💰 Apple Developer: $99/año (para iOS)
💰 Google Play: $25 one-time (para Android)
```

---

## ⏱️ **TIMELINE ESTIMADO**

```
Semana 1-2: Setup + Autenticación + Perfil
Semana 3-4: Gestión de Mascotas + Reservas
Semana 5-6: GPS Tracking + Notificaciones
Semana 7-8: Pagos + Fidelización + Pulido
Semana 9-10: Testing + Deploy

TOTAL: 2-3 meses para MVP completo
```

---

## 🎯 **RESUMEN FINAL**

### **✅ RECOMENDACIÓN:**

```
TECNOLOGÍA: Expo (React Native)
BACKEND: Supabase
UI: React Native Paper
MAPAS: React Native Maps
PAGOS: Stripe
NOTIFICACIONES: Expo Notifications
```

### **🚀 PRÓXIMOS PASOS:**

1. ✅ Crear proyecto con Expo
2. ✅ Configurar Supabase
3. ✅ Implementar autenticación
4. ✅ Crear pantallas principales
5. ✅ Integrar GPS tracking
6. ✅ Agregar notificaciones
7. ✅ Integrar pagos
8. ✅ Testing
9. ✅ Deploy a stores

---

**¿Quieres que te ayude a empezar con el código de la app móvil? ¿O prefieres primero terminar de integrar Supabase en el sistema web?** 🚀
