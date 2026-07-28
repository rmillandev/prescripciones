# Prescripciones - Backend

API REST para la gestión de prescripciones médicas. Construida con **NestJS**, **Prisma** y **PostgreSQL**.

## Stack

- **Runtime**: Node.js
- **Framework**: NestJS ^11.0.1
- **ORM**: Prisma ^6.19.3
- **Base de datos**: PostgreSQL
- **Auth**: JWT (access + refresh tokens)
- **Validación**: class-validator + class-transformer
- **Hashing**: bcrypt

## Requisitos previos

- Node.js >= 18
- PostgreSQL corriendo localmente
- npm o yarn

## Instalación

```bash
npm install
```

## Variables de entorno

Copiar `.env` y configurar:

```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/prescripciones"
PORT=3001
JWT_SECRET="tu-secret-aqui"
JWT_EXPIRES_IN="45m"
JWT_REFRESH_SECRET="tu-refresh-secret-aqui"
JWT_REFRESH_EXPIRES_IN="5d"
```

## Base de datos

```bash
# Generar cliente Prisma
npx prisma generate

# Aplicar migraciones
npx prisma migrate deploy

# O en desarrollo (crea migración + aplica)
npx prisma migrate dev
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Servidor en desarrollo con watch |
| `npm run build` | Compilar el proyecto |
| `npm run start:prod` | Ejecutar versión compilada |
| `npm run lint` | Linting con ESLint |
| `npm test` | Tests unitarios con Jest |
| `npm run test:cov` | Tests con cobertura |
| `npm run test:e2e` | Tests end-to-end |
| `npm run prisma:generate` | Regenerar cliente Prisma |

## Estructura

```
src/
├── main.ts                  # Bootstrap, CORS, ValidationPipe, Filtros globales
├── app.module.ts            # Módulo raíz
├── common/filters/          # HttpExceptionFilter
├── prisma/                  # PrismaService (global)
├── auth/                    # JWT, Guards, Roles
├── users/                   # CRUD usuarios
├── doctor/                  # CRUD doctores
├── patient/                 # CRUD pacientes
├── prescripciones/          # CRUD prescripciones
└── admin/                   # Métricas dashboard
```

## Modelo de datos

```
User ──1:1──> Doctor ──1:N──> Prescription ──1:N──> PrescriptionItem
User ──1:1──> Patient ──1:N──> Prescription
```

**Roles**: `admin`, `doctor`, `patient`
**Estados de prescripción**: `pending`, `consumed`

## API Endpoints

### Autenticación

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Registrar usuario |
| POST | `/auth/login` | No | Iniciar sesión |
| POST | `/auth/refresh` | Sí | Renovar tokens |
| GET | `/auth/profile` | Sí | Perfil del usuario actual |

### Usuarios (Admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/users` | Listar usuarios (paginado, filtrable) |
| POST | `/users` | Crear usuario |

### Doctores (Admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/doctor` | Listar doctores (paginado, filtrable) |
| POST | `/doctor` | Asociar perfil Doctor a un User |

### Pacientes (Admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/patient` | Listar pacientes (paginado, filtrable) |
| POST | `/patient` | Asociar perfil Patient a un User |

### Prescripciones

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| POST | `/prescripciones` | Doctor, Admin | Crear prescripción |
| GET | `/prescripciones/doctor` | Doctor, Admin | Listar por doctor |
| GET | `/prescripciones/doctor/:id` | Doctor, Admin | Detalle por doctor |
| GET | `/prescripciones/patient` | Patient, Admin | Listar por paciente |
| GET | `/prescripciones/patient/:id` | Patient, Admin | Detalle por paciente |
| GET | `/prescripciones/admin` | Admin | Listar todas |
| PATCH | `/prescripciones/patient/consume/:id` | Patient, Admin | Marcar como consumida |

### Admin - Métricas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/admin/metrics` | Totales, por estado, por día, top doctores |

## Paginación

Todas las listas soportan paginación:

```
GET /users?page=1&limit=10&role=doctor&query=juan
```

Respuesta:
```json
{
  "data": [...],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

## Respuesta de errores

Formato estandarizado por `HttpExceptionFilter`:

```json
{
  "message": "Invalid credentials",
  "code": 401
}
```

Para errores de validación:
```json
{
  "message": "Validation failed",
  "code": 400,
  "details": ["email must be an email", "password must be longer than or equal to 6 characters"]
}
```
