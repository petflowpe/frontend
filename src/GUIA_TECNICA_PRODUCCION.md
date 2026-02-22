# 🛠️ GUÍA TÉCNICA PARA PRODUCCIÓN - SMARTPET

**Objetivo:** Llevar SmartPet de prototipo a producción  
**Timeline:** 6-8 semanas  
**Nivel:** Intermedio-Avanzado

---

## 📋 CHECKLIST PRE-PRODUCCIÓN

### Backend (CRÍTICO - Semana 1-3)

#### 1. Setup de Base de Datos PostgreSQL

**Opción A: Managed Database (Recomendado para MVP)**
```bash
# Supabase (más fácil, incluye auth)
npm install @supabase/supabase-js

# O Railway / Render / DigitalOcean
# Ventajas: Backups automáticos, escalable
```

**Opción B: Self-hosted (Para más control)**
```bash
# AWS RDS
# GCP Cloud SQL
# Cuidado: Requiere más mantenimiento
```

**Schema básico:**
```sql
-- Usuarios y autenticación
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Clientes
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mascotas
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  breed VARCHAR(100),
  size VARCHAR(20),
  birthdate DATE,
  medical_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Citas
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id),
  pet_id UUID REFERENCES pets(id),
  service_id UUID REFERENCES services(id),
  groomer_id UUID REFERENCES users(id),
  vehicle_id UUID REFERENCES vehicles(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  confirmed BOOLEAN DEFAULT false,
  total_price DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Servicios
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2),
  duration_minutes INT,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id),
  client_id UUID REFERENCES clients(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  response TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notificaciones
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_pets_client ON pets(client_id);
```

#### 2. API Backend (Node.js + Express)

**Setup inicial:**
```bash
mkdir smartpet-backend
cd smartpet-backend
npm init -y
npm install express cors dotenv pg jsonwebtoken bcrypt
npm install --save-dev typescript @types/node @types/express ts-node nodemon
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

**src/index.ts:**
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Database connection
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
import clientsRouter from './routes/clients';
import appointmentsRouter from './routes/appointments';
import servicesRouter from './routes/services';
import reviewsRouter from './routes/reviews';

app.use('/api/clients', clientsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/reviews', reviewsRouter);

app.listen(port, () => {
  console.log(`SmartPet API running on port ${port}`);
});
```

**src/routes/clients.ts (ejemplo):**
```typescript
import express from 'express';
import { pool } from '../index';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET all clients
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clients ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single client
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM clients WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create client
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, address, lat, lng } = req.body;
    
    const result = await pool.query(
      `INSERT INTO clients (name, email, phone, address, lat, lng) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [name, email, phone, address, lat, lng]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update client
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, lat, lng } = req.body;
    
    const result = await pool.query(
      `UPDATE clients 
       SET name = $1, email = $2, phone = $3, address = $4, lat = $5, lng = $6
       WHERE id = $7 
       RETURNING *`,
      [name, email, phone, address, lat, lng, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE client
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM clients WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

**src/middleware/auth.ts:**
```typescript
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: any;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}
```

#### 3. Variables de Entorno

**.env:**
```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/smartpet

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d

# API Keys
GOOGLE_MAPS_API_KEY=your-google-maps-key
STRIPE_SECRET_KEY=sk_test_your-stripe-key
SENDGRID_API_KEY=your-sendgrid-key

# URLs
FRONTEND_URL=https://smartpet.app
API_URL=https://api.smartpet.app

# Node
NODE_ENV=production
PORT=3000
```

### Frontend (Semana 3-4)

#### 1. Conectar Frontend con Backend

**src/lib/api.ts:**
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  
  return response.json();
}

// Clients API
export const clientsAPI = {
  getAll: () => fetchAPI('/clients'),
  getById: (id: string) => fetchAPI(`/clients/${id}`),
  create: (data: any) => fetchAPI('/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI(`/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI(`/clients/${id}`, {
    method: 'DELETE',
  }),
};

// Appointments API
export const appointmentsAPI = {
  getAll: () => fetchAPI('/appointments'),
  getById: (id: string) => fetchAPI(`/appointments/${id}`),
  create: (data: any) => fetchAPI('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  confirm: (id: string) => fetchAPI(`/appointments/${id}/confirm`, {
    method: 'POST',
  }),
  cancel: (id: string, reason: string) => fetchAPI(`/appointments/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),
};

// Reviews API
export const reviewsAPI = {
  getAll: () => fetchAPI('/reviews'),
  create: (data: any) => fetchAPI('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  respond: (id: string, response: string) => fetchAPI(`/reviews/${id}/respond`, {
    method: 'POST',
    body: JSON.stringify({ response }),
  }),
};
```

#### 2. React Query para Cache

```bash
npm install @tanstack/react-query
```

**src/App.tsx:**
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Tu app aquí */}
    </QueryClientProvider>
  );
}
```

**Uso en componentes:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsAPI } from '../lib/api';

function Clients() {
  const queryClient = useQueryClient();
  
  // Fetch clients
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: clientsAPI.getAll,
  });
  
  // Create client mutation
  const createMutation = useMutation({
    mutationFn: clientsAPI.create,
    onSuccess: () => {
      // Invalidar cache para refetch
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente creado exitosamente');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
  
  const handleCreate = (data: any) => {
    createMutation.mutate(data);
  };
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {clients.map(client => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  );
}
```

### Autenticación (Semana 4)

#### 1. Backend: Login/Register

**src/routes/auth.ts:**
```typescript
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../index';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name, role`,
      [email, hashedPassword, name, role || 'client']
    );
    
    const user = result.rows[0];
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    const result = await pool.query(
      'SELECT id, email, name, role FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

#### 2. Frontend: Auth Context

**src/contexts/AuthContext.tsx:**
```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      // Fetch user data
      fetchCurrentUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  async function fetchCurrentUser(token: string) {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Invalid token
        localStorage.removeItem('authToken');
        setToken(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const { user, token } = await response.json();
    
    setUser(user);
    setToken(token);
    localStorage.setItem('authToken', token);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Integraciones Externas (Semana 5-6)

#### 1. Google Maps API

```bash
npm install @react-google-maps/api
```

**Geocodificación:**
```typescript
async function geocodeAddress(address: string) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );
  
  const data = await response.json();
  
  if (data.results && data.results.length > 0) {
    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
  }
  
  throw new Error('Address not found');
}
```

#### 2. Stripe Payments

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

**Backend:**
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'pen' } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Payment failed' });
  }
});
```

**Frontend:**
```typescript
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });
    
    if (error) {
      toast.error(error.message);
    } else if (paymentIntent.status === 'succeeded') {
      toast.success('Pago exitoso');
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>Pagar</button>
    </form>
  );
}
```

#### 3. SendGrid Email

```bash
npm install @sendgrid/mail
```

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

async function sendAppointmentConfirmation(appointment: any) {
  const msg = {
    to: appointment.client_email,
    from: 'noreply@smartpet.app',
    subject: 'Confirmación de Cita - SmartPet',
    text: `Hola ${appointment.client_name}, tu cita ha sido confirmada para ${appointment.date} a las ${appointment.time}.`,
    html: `
      <h2>¡Hola ${appointment.client_name}!</h2>
      <p>Tu cita ha sido confirmada:</p>
      <ul>
        <li>Fecha: ${appointment.date}</li>
        <li>Hora: ${appointment.time}</li>
        <li>Servicio: ${appointment.service}</li>
      </ul>
      <p>¡Nos vemos pronto!</p>
    `,
  };
  
  await sgMail.send(msg);
}
```

### Deployment (Semana 6-7)

#### 1. Frontend: Vercel

```bash
npm install -g vercel
vercel login
vercel
```

**vercel.json:**
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "@api-url",
    "VITE_STRIPE_PUBLIC_KEY": "@stripe-public-key"
  }
}
```

#### 2. Backend: Railway / Render

**Railway:**
```bash
# Instalar CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

#### 3. Database: Supabase / Railway

**Supabase (Recomendado):**
- Registro en supabase.com
- Crear proyecto
- Copiar DATABASE_URL
- Ejecutar migrations

### Monitoreo (Semana 8)

#### 1. Sentry para Errores

```bash
npm install @sentry/react @sentry/tracing
```

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

#### 2. Analytics

```typescript
// Google Analytics
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>

// Plausible (más privado)
<script defer data-domain="smartpet.app" src="https://plausible.io/js/script.js"></script>
```

---

## 🎯 TESTING

### Unit Tests (Vitest)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**tests/mlPredictionService.test.ts:**
```typescript
import { describe, it, expect } from 'vitest';
import { MLPredictionService } from '../services/mlPredictionService';

describe('MLPredictionService', () => {
  it('should predict demand correctly', () => {
    const historicalData = [
      { date: '2024-01-01', appointments: 10, revenue: 500 },
      { date: '2024-01-02', appointments: 12, revenue: 600 },
    ];
    
    const forecast = MLPredictionService.predictDemand(historicalData, 7);
    
    expect(forecast).toHaveLength(7);
    expect(forecast[0]).toHaveProperty('predictedAppointments');
    expect(forecast[0]).toHaveProperty('confidence');
  });
  
  it('should detect churn risk', () => {
    const clients = [
      {
        id: '1',
        name: 'Test Client',
        lastVisit: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
        totalVisits: 5,
        averageSpend: 100,
        recentSpend: 30,
        recentCancellations: 2,
      },
    ];
    
    const predictions = MLPredictionService.detectChurnRisk(clients);
    
    expect(predictions).toHaveLength(1);
    expect(predictions[0].riskLevel).toBe('high');
    expect(predictions[0].churnProbability).toBeGreaterThan(50);
  });
});
```

---

## 📊 MÉTRICAS DE ÉXITO

### Performance
- [ ] Lighthouse Score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Bundle size < 500KB

### Reliability
- [ ] Uptime > 99.9%
- [ ] Error rate < 0.1%
- [ ] API response time < 200ms (p95)

### Security
- [ ] HTTPS everywhere
- [ ] Inputs sanitized
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] SQL injection protection

---

## 🚀 LAUNCH CHECKLIST

### Pre-launch (1 semana antes)
- [ ] Todos los tests passing
- [ ] Performance optimizado
- [ ] Seguridad auditada
- [ ] Backups configurados
- [ ] Monitoring activo
- [ ] Docs actualizadas

### Launch Day
- [ ] Deploy a producción
- [ ] Verificar todos los endpoints
- [ ] Test de carga básico
- [ ] Monitoreo activo
- [ ] Equipo de soporte listo

### Post-launch (primera semana)
- [ ] Monitorear errores daily
- [ ] Recopilar feedback de usuarios
- [ ] Fix bugs críticos rápido
- [ ] Iterar según data

---

**¡SmartPet está listo para producción!** 🎉

*Recuerda: Ship early, iterate fast, listen to users.* 🚀
