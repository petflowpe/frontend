# 🔌 GUÍA COMPLETA DE CONEXIÓN CON BACKEND - SMARTPET

**Objetivo:** Conectar el frontend de SmartPet con un backend real  
**Stack:** React + TypeScript → Node.js + Express + PostgreSQL  
**Nivel:** Paso a paso desde cero

---

## 📋 ÍNDICE

1. [Arquitectura General](#arquitectura)
2. [Setup del Backend](#setup-backend)
3. [Conexión Frontend-Backend](#conexion)
4. [Implementación por Módulo](#implementacion-modulos)
5. [Testing de APIs](#testing)
6. [Deploy a Producción](#deploy)

---

## 🏗️ ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ Components  │  │ React Query  │  │  API Client   │ │
│  └─────────────┘  └──────────────┘  └───────────────┘ │
└─────────────────────────────┬───────────────────────────┘
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │   Routes    │  │ Controllers  │  │   Services    │ │
│  └─────────────┘  └──────────────┘  └───────────────┘ │
│  ┌─────────────┐  ┌──────────────┐                    │
│  │Middlewares  │  │ Validators   │                     │
│  └─────────────┘  └──────────────┘                    │
└─────────────────────────────┬───────────────────────────┘
                              │ SQL
                              ▼
┌─────────────────────────────────────────────────────────┐
│                DATABASE (PostgreSQL)                     │
│                     Tables & Relations                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 SETUP DEL BACKEND

### PASO 1: Crear Proyecto Backend

```bash
# Crear directorio
mkdir smartpet-backend
cd smartpet-backend

# Inicializar proyecto
npm init -y

# Instalar dependencias
npm install express cors dotenv pg bcrypt jsonwebtoken
npm install express-validator helmet rate-limit

# Instalar dev dependencies
npm install --save-dev typescript @types/node @types/express
npm install --save-dev @types/bcrypt @types/jsonwebtoken
npm install --save-dev ts-node nodemon
```

### PASO 2: Configurar TypeScript

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
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### PASO 3: package.json Scripts

```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "node scripts/migrate.js",
    "db:seed": "node scripts/seed.js"
  }
}
```

### PASO 4: Estructura de Carpetas

```
smartpet-backend/
├── src/
│   ├── index.ts                 # Entry point
│   ├── config/
│   │   └── database.ts          # DB connection
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── clients.routes.ts
│   │   ├── appointments.routes.ts
│   │   └── ... (uno por módulo)
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── clients.controller.ts
│   │   └── ...
│   ├── services/
│   │   ├── clients.service.ts
│   │   ├── appointments.service.ts
│   │   └── ...
│   ├── models/
│   │   ├── Client.ts
│   │   ├── Appointment.ts
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validate.middleware.ts
│   │   └── errorHandler.middleware.ts
│   ├── validators/
│   │   ├── client.validator.ts
│   │   └── ...
│   └── types/
│       └── index.ts
├── scripts/
│   ├── migrate.js
│   └── seed.js
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

### PASO 5: Variables de Entorno

**.env.example:**
```bash
# Server
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/smartpet

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# API Keys
GOOGLE_MAPS_API_KEY=your-google-maps-key
SENDGRID_API_KEY=your-sendgrid-key
STRIPE_SECRET_KEY=sk_test_your-stripe-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🗄️ SETUP DE BASE DE DATOS

### PASO 1: Instalar PostgreSQL

**Opción A: Local**
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql
sudo service postgresql start

# Windows: Descargar desde postgresql.org
```

**Opción B: Docker (Recomendado)**
```bash
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: smartpet
      POSTGRES_PASSWORD: smartpet123
      POSTGRES_DB: smartpet
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:

# Iniciar
docker-compose up -d
```

**Opción C: Servicio Managed (Producción)**
- Supabase (incluye auth, storage, etc.)
- Railway
- Render
- DigitalOcean Managed Databases
- AWS RDS

### PASO 2: Crear Schema de Base de Datos

**scripts/migrate.js:**
```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Creating tables...');
    
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'client',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Clients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        lat DECIMAL(10, 8),
        lng DECIMAL(11, 8),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Pets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        breed VARCHAR(100),
        size VARCHAR(20),
        birthdate DATE,
        weight DECIMAL(5, 2),
        color VARCHAR(50),
        medical_notes TEXT,
        allergies TEXT,
        photo_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Services table
    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        duration_minutes INTEGER,
        price_small DECIMAL(10, 2),
        price_medium DECIMAL(10, 2),
        price_large DECIMAL(10, 2),
        price_xlarge DECIMAL(10, 2),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Vehicles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        plate VARCHAR(20) UNIQUE NOT NULL,
        brand VARCHAR(100),
        model VARCHAR(100),
        year INTEGER,
        color VARCHAR(50),
        status VARCHAR(50) DEFAULT 'active',
        equipment JSONB,
        zones JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Staff table
    await client.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        document_id VARCHAR(50) UNIQUE,
        phone VARCHAR(20),
        email VARCHAR(255),
        specialties JSONB,
        vehicle_id UUID REFERENCES vehicles(id),
        salary DECIMAL(10, 2),
        commission_rate DECIMAL(5, 2),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Appointments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID REFERENCES clients(id),
        pet_id UUID REFERENCES pets(id),
        service_id UUID REFERENCES services(id),
        vehicle_id UUID REFERENCES vehicles(id),
        staff_id UUID REFERENCES staff(id),
        date DATE NOT NULL,
        time TIME NOT NULL,
        duration_minutes INTEGER,
        status VARCHAR(50) DEFAULT 'pending',
        confirmed BOOLEAN DEFAULT false,
        confirmed_at TIMESTAMP,
        confirmed_method VARCHAR(50),
        total_price DECIMAL(10, 2),
        notes TEXT,
        is_recurring BOOLEAN DEFAULT false,
        recurring_parent_id UUID REFERENCES appointments(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sku VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        brand VARCHAR(100),
        unit VARCHAR(50),
        purchase_price DECIMAL(10, 2),
        sale_price DECIMAL(10, 2),
        stock DECIMAL(10, 2) DEFAULT 0,
        min_stock DECIMAL(10, 2) DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Invoices table
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        client_id UUID REFERENCES clients(id),
        appointment_id UUID REFERENCES appointments(id),
        invoice_date DATE NOT NULL,
        due_date DATE,
        subtotal DECIMAL(10, 2) NOT NULL,
        tax_rate DECIMAL(5, 2) DEFAULT 0,
        tax_amount DECIMAL(10, 2) DEFAULT 0,
        discount DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        items JSONB NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Payments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_id UUID REFERENCES invoices(id),
        payment_date DATE NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        method VARCHAR(50) NOT NULL,
        reference VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        appointment_id UUID REFERENCES appointments(id),
        client_id UUID REFERENCES clients(id),
        staff_id UUID REFERENCES staff(id),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        response TEXT,
        responded_at TIMESTAMP,
        verified BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Medical records table
    await client.query(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        treatment_name VARCHAR(255),
        date DATE NOT NULL,
        next_date DATE,
        notes TEXT,
        veterinarian VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Indexes for performance
    console.log('Creating indexes...');
    
    await client.query('CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_appointments_staff ON appointments(staff_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_pets_client ON pets(client_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);');
    
    await client.query('COMMIT');
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
```

**Ejecutar migración:**
```bash
npm run db:migrate
```

### PASO 3: Seeders (Datos Iniciales)

**scripts/seed.js:**
```javascript
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('Seeding database...');
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await client.query(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@smartpet.com', hashedPassword, 'Admin Principal', 'superadmin']);
    
    // Create sample services
    await client.query(`
      INSERT INTO services (name, description, category, duration_minutes, price_small, price_medium, price_large, price_xlarge)
      VALUES 
        ('Baño Completo', 'Baño con shampoo premium', 'Aseo', 60, 30.00, 45.00, 60.00, 80.00),
        ('Corte de Pelo', 'Corte según raza', 'Estética', 45, 25.00, 40.00, 55.00, 70.00),
        ('Baño Medicado', 'Baño con shampoo medicado', 'Salud', 75, 40.00, 55.00, 70.00, 90.00),
        ('Corte de Uñas', 'Corte y limado de uñas', 'Aseo', 20, 15.00, 15.00, 20.00, 25.00)
      ON CONFLICT DO NOTHING
    `);
    
    console.log('✅ Seed completed successfully!');
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
```

**Ejecutar seed:**
```bash
npm run db:seed
```

---

## 🔧 IMPLEMENTAR BACKEND

### Archivo Principal: src/index.ts

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Routes
import authRoutes from './routes/auth.routes';
import clientsRoutes from './routes/clients.routes';
import appointmentsRoutes from './routes/appointments.routes';
import servicesRoutes from './routes/services.routes';
import productsRoutes from './routes/products.routes';
import staffRoutes from './routes/staff.routes';
import vehiclesRoutes from './routes/vehicles.routes';
import invoicesRoutes from './routes/invoices.routes';
import paymentsRoutes from './routes/payments.routes';
import reviewsRoutes from './routes/reviews.routes';

// Middleware
import { errorHandler } from './middleware/errorHandler.middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reviews', reviewsRoutes);

// Error handler (debe ser el último middleware)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

app.listen(port, () => {
  console.log(`🚀 SmartPet API running on port ${port}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
});

export default app;
```

### Database Connection: src/config/database.ts

```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
```

### Middleware de Autenticación: src/middleware/auth.middleware.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  });
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This action requires one of: ${roles.join(', ')}`
      });
    }

    next();
  };
}
```

### Error Handler: src/middleware/errorHandler.middleware.ts

```typescript
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  // Log error for debugging
  console.error('❌ Error:', err);

  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      message: err.message,
      stack: err.stack
    })
  });
}
```

---

## 📡 EJEMPLO COMPLETO: MÓDULO DE CLIENTES

### 1. Routes: src/routes/clients.routes.ts

```typescript
import express from 'express';
import { ClientsController } from '../controllers/clients.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { validateClient } from '../validators/client.validator';

const router = express.Router();
const controller = new ClientsController();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// GET /api/clients - List all clients
router.get('/', controller.getAll);

// GET /api/clients/search?q=term - Search clients
router.get('/search', controller.search);

// GET /api/clients/:id - Get single client
router.get('/:id', controller.getById);

// POST /api/clients - Create client
router.post('/', validateClient, controller.create);

// PUT /api/clients/:id - Update client
router.put('/:id', validateClient, controller.update);

// DELETE /api/clients/:id - Delete client
router.delete('/:id', requireRole('admin', 'superadmin'), controller.delete);

// GET /api/clients/:id/pets - Get client's pets
router.get('/:id/pets', controller.getPets);

// POST /api/clients/:id/pets - Add pet to client
router.post('/:id/pets', controller.addPet);

export default router;
```

### 2. Controller: src/controllers/clients.controller.ts

```typescript
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ClientsService } from '../services/clients.service';
import { AppError } from '../middleware/errorHandler.middleware';

const service = new ClientsService();

export class ClientsController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await service.getAll(page, limit);
      
      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  async search(req: AuthRequest, res: Response) {
    try {
      const query = req.query.q as string;
      
      if (!query || query.length < 2) {
        return res.status(400).json({
          error: 'Search query must be at least 2 characters'
        });
      }
      
      const results = await service.search(query);
      
      res.json(results);
    } catch (error) {
      throw error;
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const client = await service.getById(id);
      
      if (!client) {
        throw new AppError('Client not found', 404);
      }
      
      res.json(client);
    } catch (error) {
      throw error;
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const clientData = req.body;
      
      const client = await service.create(clientData);
      
      res.status(201).json(client);
    } catch (error) {
      throw error;
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const clientData = req.body;
      
      const client = await service.update(id, clientData);
      
      if (!client) {
        throw new AppError('Client not found', 404);
      }
      
      res.json(client);
    } catch (error) {
      throw error;
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const deleted = await service.delete(id);
      
      if (!deleted) {
        throw new AppError('Client not found', 404);
      }
      
      res.json({ message: 'Client deleted successfully' });
    } catch (error) {
      throw error;
    }
  }

  async getPets(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const pets = await service.getPets(id);
      
      res.json(pets);
    } catch (error) {
      throw error;
    }
  }

  async addPet(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const petData = req.body;
      
      const pet = await service.addPet(id, petData);
      
      res.status(201).json(pet);
    } catch (error) {
      throw error;
    }
  }
}
```

### 3. Service: src/services/clients.service.ts

```typescript
import pool from '../config/database';
import { Client, Pet } from '../types';

export class ClientsService {
  async getAll(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    
    const countResult = await pool.query('SELECT COUNT(*) FROM clients');
    const total = parseInt(countResult.rows[0].count);
    
    const result = await pool.query(
      `SELECT 
        c.*,
        COUNT(DISTINCT p.id) as pets_count,
        COUNT(DISTINCT a.id) as appointments_count
      FROM clients c
      LEFT JOIN pets p ON p.client_id = c.id
      LEFT JOIN appointments a ON a.client_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async search(query: string) {
    const result = await pool.query(
      `SELECT c.*, COUNT(p.id) as pets_count
      FROM clients c
      LEFT JOIN pets p ON p.client_id = c.id
      WHERE 
        c.name ILIKE $1 OR
        c.email ILIKE $1 OR
        c.phone ILIKE $1 OR
        p.name ILIKE $1
      GROUP BY c.id
      LIMIT 20`,
      [`%${query}%`]
    );
    
    return result.rows;
  }

  async getById(id: string) {
    const result = await pool.query(
      `SELECT c.*,
        json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'breed', p.breed,
            'size', p.size,
            'birthdate', p.birthdate
          )
        ) FILTER (WHERE p.id IS NOT NULL) as pets
      FROM clients c
      LEFT JOIN pets p ON p.client_id = c.id
      WHERE c.id = $1
      GROUP BY c.id`,
      [id]
    );
    
    return result.rows[0];
  }

  async create(clientData: Partial<Client>) {
    const {
      name,
      email,
      phone,
      address,
      lat,
      lng,
      notes
    } = clientData;
    
    const result = await pool.query(
      `INSERT INTO clients (name, email, phone, address, lat, lng, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [name, email, phone, address, lat, lng, notes]
    );
    
    return result.rows[0];
  }

  async update(id: string, clientData: Partial<Client>) {
    const {
      name,
      email,
      phone,
      address,
      lat,
      lng,
      notes
    } = clientData;
    
    const result = await pool.query(
      `UPDATE clients
      SET name = COALESCE($1, name),
          email = COALESCE($2, email),
          phone = COALESCE($3, phone),
          address = COALESCE($4, address),
          lat = COALESCE($5, lat),
          lng = COALESCE($6, lng),
          notes = COALESCE($7, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *`,
      [name, email, phone, address, lat, lng, notes, id]
    );
    
    return result.rows[0];
  }

  async delete(id: string) {
    const result = await pool.query(
      'DELETE FROM clients WHERE id = $1 RETURNING *',
      [id]
    );
    
    return result.rows[0];
  }

  async getPets(clientId: string) {
    const result = await pool.query(
      'SELECT * FROM pets WHERE client_id = $1 ORDER BY created_at DESC',
      [clientId]
    );
    
    return result.rows;
  }

  async addPet(clientId: string, petData: Partial<Pet>) {
    const {
      name,
      breed,
      size,
      birthdate,
      weight,
      color,
      medical_notes,
      allergies
    } = petData;
    
    const result = await pool.query(
      `INSERT INTO pets (client_id, name, breed, size, birthdate, weight, color, medical_notes, allergies)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [clientId, name, breed, size, birthdate, weight, color, medical_notes, allergies]
    );
    
    return result.rows[0];
  }
}
```

### 4. Validator: src/validators/client.validator.ts

```typescript
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateClient = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  
  body('phone')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Invalid phone format'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address too long'),
  
  body('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  
  body('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),

  // Middleware to check validation results
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    
    next();
  }
];
```

### 5. Types: src/types/index.ts

```typescript
export interface Client {
  id: string;
  user_id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  lat?: number;
  lng?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Pet {
  id: string;
  client_id: string;
  name: string;
  breed?: string;
  size?: string;
  birthdate?: Date;
  weight?: number;
  color?: string;
  medical_notes?: string;
  allergies?: string;
  photo_url?: string;
  created_at: Date;
  updated_at: Date;
}

// ... otros types
```

---

## 🔌 CONECTAR FRONTEND CON BACKEND

### PASO 1: Instalar React Query en Frontend

```bash
cd smartpet-frontend  # O tu carpeta de React
npm install @tanstack/react-query axios
```

### PASO 2: Crear API Client

**src/lib/apiClient.ts:**
```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para agregar token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### PASO 3: Crear API Service para Clientes

**src/services/api/clients.api.ts:**
```typescript
import apiClient from '../../lib/apiClient';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  lat?: number;
  lng?: number;
  notes?: string;
  pets_count?: number;
}

export interface CreateClientData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  lat?: number;
  lng?: number;
  notes?: string;
}

export const clientsAPI = {
  // GET /api/clients
  getAll: async (page: number = 1, limit: number = 20) => {
    const { data } = await apiClient.get('/clients', {
      params: { page, limit }
    });
    return data;
  },

  // GET /api/clients/search?q=term
  search: async (query: string) => {
    const { data } = await apiClient.get('/clients/search', {
      params: { q: query }
    });
    return data;
  },

  // GET /api/clients/:id
  getById: async (id: string) => {
    const { data } = await apiClient.get(`/clients/${id}`);
    return data;
  },

  // POST /api/clients
  create: async (clientData: CreateClientData) => {
    const { data } = await apiClient.post('/clients', clientData);
    return data;
  },

  // PUT /api/clients/:id
  update: async (id: string, clientData: Partial<CreateClientData>) => {
    const { data } = await apiClient.put(`/clients/${id}`, clientData);
    return data;
  },

  // DELETE /api/clients/:id
  delete: async (id: string) => {
    const { data } = await apiClient.delete(`/clients/${id}`);
    return data;
  },

  // GET /api/clients/:id/pets
  getPets: async (id: string) => {
    const { data } = await apiClient.get(`/clients/${id}/pets`);
    return data;
  },

  // POST /api/clients/:id/pets
  addPet: async (id: string, petData: any) => {
    const { data } = await apiClient.post(`/clients/${id}/pets`, petData);
    return data;
  },
};
```

### PASO 4: Setup React Query

**src/App.tsx:**
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AppContent />
        <Toaster />
      </AppProvider>
      {/* DevTools solo en desarrollo */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
```

### PASO 5: Usar en Componente Clients

**src/components/Clients.tsx:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsAPI, Client, CreateClientData } from '../services/api/clients.api';
import { toast } from 'sonner';
import { useState } from 'react';
import { Button } from './ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from './ui/input';

export function Clients() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Query para obtener clientes
  const { data, isLoading, error } = useQuery({
    queryKey: ['clients', page],
    queryFn: () => clientsAPI.getAll(page, 20),
  });

  // Mutation para crear cliente
  const createMutation = useMutation({
    mutationFn: clientsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente creado exitosamente');
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al crear cliente');
    },
  });

  // Mutation para actualizar cliente
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateClientData> }) =>
      clientsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al actualizar cliente');
    },
  });

  // Mutation para eliminar cliente
  const deleteMutation = useMutation({
    mutationFn: clientsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al eliminar cliente');
    },
  });

  const handleCreate = (data: CreateClientData) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (id: string, data: Partial<CreateClientData>) => {
    updateMutation.mutate({ id, data });
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error al cargar clientes</p>
          <p className="text-sm text-red-600 mt-1">
            {(error as any).message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Clientes</h1>
          <p className="text-slate-600">
            {data?.pagination.total || 0} clientes registrados
          </p>
        </div>
        
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar clientes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="grid gap-4">
        {data?.data.map((client: Client) => (
          <div
            key={client.id}
            className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-lg">{client.name}</h3>
                {client.email && (
                  <p className="text-sm text-slate-600">{client.email}</p>
                )}
                {client.phone && (
                  <p className="text-sm text-slate-600">{client.phone}</p>
                )}
                {client.pets_count && (
                  <p className="text-xs text-slate-500 mt-1">
                    {client.pets_count} mascota(s)
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {/* Abrir dialog de edición */}}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(client.id)}
                  disabled={deleteMutation.isPending}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {data?.pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Página {data.pagination.page} de {data.pagination.pages}
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= data.pagination.pages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Dialog de crear/editar (implementar con shadcn Dialog) */}
    </div>
  );
}
```

---

## 🧪 TESTING DE APIs

### Con Thunder Client (VS Code Extension)

1. Instalar Thunder Client
2. Crear colección "SmartPet"
3. Agregar requests:

**Login:**
```
POST http://localhost:3000/api/auth/login
Body (JSON):
{
  "email": "admin@smartpet.com",
  "password": "admin123"
}
```

**Get Clients:**
```
GET http://localhost:3000/api/clients
Headers:
  Authorization: Bearer <token-from-login>
```

### Con cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartpet.com","password":"admin123"}'

# Get clients (reemplaza <TOKEN>)
curl http://localhost:3000/api/clients \
  -H "Authorization: Bearer <TOKEN>"

# Create client
curl -X POST http://localhost:3000/api/clients \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan Pérez","email":"juan@email.com","phone":"+51987654321"}'
```

---

## 🚀 DEPLOY A PRODUCCIÓN

### Frontend (Vercel)

```bash
# .env.production
VITE_API_URL=https://api.smartpet.app/api

# Deploy
vercel --prod
```

### Backend (Railway)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Init project
railway init

# Add PostgreSQL
railway add postgresql

# Deploy
railway up
```

### Variables de Entorno en Railway

```
DATABASE_URL=<auto-generado>
JWT_SECRET=<generar-aleatorio>
NODE_ENV=production
CLIENT_URL=https://smartpet.app
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [ ] Proyecto Node.js creado
- [ ] PostgreSQL instalado y funcionando
- [ ] Migraciones ejecutadas
- [ ] Seeders ejecutados
- [ ] Servidor corriendo en localhost:3000
- [ ] Health check funcionando
- [ ] Autenticación implementada
- [ ] Al menos 1 módulo completo (ej: Clients)

### Frontend
- [ ] React Query instalado
- [ ] API Client configurado
- [ ] Interceptors de auth funcionando
- [ ] Al menos 1 módulo conectado
- [ ] Loading states implementados
- [ ] Error handling implementado
- [ ] Toast notifications funcionando

### Testing
- [ ] Login funcional
- [ ] CRUD de clientes funcional
- [ ] Validaciones funcionando
- [ ] Permisos aplicados correctamente

---

**¡Backend completo y frontend conectado!** 🎉

¿Necesitas ayuda con algún módulo específico o tienes dudas sobre la implementación?
