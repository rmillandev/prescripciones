# Prescripciones - Documentación del Proyecto

Sistema web para la gestión de prescripciones médicas con arquitectura **client-server**, compuesto por un backend en **NestJS** y un frontend en **Next.js**.

---

## 1. Visión General

La aplicación permite a tres tipos de usuarios (**Admin**, **Doctor**, **Patient**) interactuar con un sistema de prescripciones médicas:

- **Admin**: Gestiona usuarios, doctores, pacientes; ve métricas globales; crea/consume prescripciones en nombre de otros.
- **Doctor**: Crea prescripciones médicas y consulta las que ha emitido.
- **Patient**: Consulta sus prescripciones y las marca como consumidas.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Backend | NestJS | ^11.0.1 |
| ORM | Prisma | ^6.19.3 |
| Base de datos | PostgreSQL | — |
| Autenticación | JWT (`@nestjs/jwt`) | ^11.0.2 |
| Hashing | bcrypt | ^6.0.0 |
| Validación | class-validator + class-transformer | ^0.15.1 / ^0.5.1 |
| Frontend | Next.js (App Router) | 16.2.9 |
| UI Framework | React | 19.2.4 |
| Estilos | Tailwind CSS | ^4 |
| Lenguaje | TypeScript | ^5.7.3 (backend) / ^5 (frontend) |

---

## 3. Estructura del Proyecto

```
prescripciones/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma              # Definición de modelos y enums
│   │   └── migrations/                # Migraciones SQL
│   ├── src/
│   │   ├── main.ts                    # Bootstrap de la app NestJS
│   │   ├── app.module.ts              # Módulo raíz
│   │   ├── app.controller.ts          # GET / → "Hello World!"
│   │   ├── app.service.ts
│   │   ├── common/filters/            # Filtros globales de excepciones
│   │   ├── prisma/                    # Servicio global de Prisma
│   │   ├── auth/                      # Autenticación, JWT, roles
│   │   ├── users/                     # CRUD de usuarios
│   │   ├── doctor/                    # CRUD de doctores
│   │   ├── patient/                   # CRUD de pacientes
│   │   ├── prescripciones/            # CRUD de prescripciones
│   │   └── admin/                     # Métricas del dashboard admin
│   └── .env
├── frontend/
│   └── src/
│       ├── app/                       # App Router (Next.js)
│       │   ├── layout.tsx             # Layout raíz
│       │   ├── page.tsx               # Home inteligente (redirige por rol)
│       │   ├── login/                 # Página de login
│       │   ├── register/              # Registro público
│       │   ├── admin/                 # Layout y páginas del rol Admin
│       │   ├── doctor/                # Layout y páginas del rol Doctor
│       │   ├── patient/               # Layout y páginas del rol Patient
│       │   └── globals.css            # Variables CSS del tema dark
│       ├── components/                # Componentes reutilizables (SidebarLayout, tabla, modales, etc.)
│       ├── services/                  # Capa de servicios HTTP
│       │   ├── auth.service.ts
│       │   └── api/
│       │       ├── api.ts             # Cliente HTTP genérico (fetch)
│       │       └── endpoints.ts       # Constantes de endpoints
│       ├── types/                     # Interfaces TypeScript
│       ├── contexts/                  # Contextos (AuthContext)
│       └── utils/                     # Utilidades
│           ├── ApiError.ts
│           └── getApiErrorMessage.ts
└── .env
```

---

## 4. Modelo de Datos (Prisma Schema)

### Diagrama de relaciones

```
User ──1:1──> Doctor ──1:N──> Prescription
User ──1:1──> Patient ──1:N──> Prescription
Prescription ──1:N──> PrescriptionItem
```

### Modelos

#### `User`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String (cuid) | PK |
| email | String | Unique |
| password | String | Hasheada con bcrypt |
| name | String | Nombre completo |
| role | Role enum | `admin`, `doctor`, `patient` |
| createdAt | DateTime | Default: now() |

#### `Doctor`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String (cuid) | PK |
| userId | String | FK → User (unique) |
| specialty | String? | Especialidad médica |

#### `Patient`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String (cuid) | PK |
| userId | String | FK → User (unique) |
| birthDate | DateTime? | Fecha de nacimiento |

#### `Prescription`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String (cuid) | PK |
| code | String | Unique, formato `RX-{timestamp}` |
| status | PrescriptionStatus | `pending` (default), `consumed` |
| notes | String? | Notas adicionales |
| createdAt | DateTime | Default: now() |
| consumedAt | DateTime? | Fecha de consumo |
| patientId | String | FK → Patient |
| authorId | String | FK → Doctor |

#### `PrescriptionItem`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String (cuid) | PK |
| prescriptionId | String | FK → Prescription |
| name | String | Nombre del medicamento |
| dosage | String? | Dosis |
| quantity | Int? | Cantidad |
| instructions | String? | Instrucciones de uso |

### Enums

```typescript
enum Role { admin, doctor, patient }
enum PrescriptionStatus { pending, consumed }
```

---

## 5. Backend - API REST

### 5.1. Configuración

| Variable | Valor |
|----------|-------|
| `PORT` | `3001` |
| `DATABASE_URL` | `postgresql://postgres:admin123@localhost:5432/prescripciones` |
| `JWT_SECRET` | Secret para access tokens |
| `JWT_EXPIRES_IN` | `45m` |
| `JWT_REFRESH_SECRET` | Secret para refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | `5d` |

### 5.2. Middleware Global

- **`ValidationPipe`**: `transform: true`, `whitelist: true` — valida y transforma DTOs automáticamente.
- **`HttpExceptionFilter`**: Filtro global que normaliza las respuestas de error a formato `{ message, code, details? }`.
- **`app.enableCors()`**: Habilita CORS para todas las origins.

### 5.3. Autenticación (`/auth`)

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| `POST` | `/auth/register` | Público | Registra un nuevo usuario (siempre con rol `patient`). Retorna tokens JWT. |
| `POST` | `/auth/login` | Público | Login con email/password. Retorna tokens JWT. |
| `POST` | `/authRefresh` | Autenticado | Renueva access token usando refresh token (en header Authorization). |
| `GET` | `/auth/profile` | Autenticado | Retorna el payload del JWT del usuario actual. |

**Nota:** Al registrarse se crea automáticamente el perfil `Patient` del usuario (el registro público solo permite pacientes).

**Flujo JWT:**
- Se genera un `accessToken` (45 min) y un `refreshToken` (5 días) en cada login/register.
- El `JwtAuthGuard` verifica el header `Authorization: Bearer <token>` y carga el payload en `request.user`.
- El `RolesGuard` verifica que el `role` del usuario coincida con los roles requeridos por el endpoint (mediante el decorador `@Roles()`).

**Roles disponibles:**
```typescript
enum Role { Admin = 'admin', Doctor = 'doctor', Patient = 'patient' }
```

### 5.4. Usuarios (`/users`)

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| `GET` | `/users` | Admin | Lista usuarios paginados con filtros (role, query). |
| `POST` | `/users` | Admin | Crea un usuario nuevo. |
| `PATCH` | `/users/:id` | Admin | Actualiza nombre/email/password/rol de un usuario. |
| `DELETE` | `/users/:id` | Admin | Elimina un usuario (y sus datos asociados en cascada). |

**Perfiles automáticos:** Al crear un usuario con rol `doctor` o `patient` (y al cambiar el rol de un usuario existente), se crea automáticamente el perfil `Doctor` o `Patient` asociado. Ya no es obligatorio crearlo manualmente desde `/doctor` o `/patient`.

**Filtros de paginación (`FilterUserDto`):**
- `page` (default: 1)
- `limit` (default: 10)
- `role` — Filtrar por rol
- `query` — Buscar por nombre o email (case-insensitive)

**Respuesta paginada estándar:**
```json
{
  "data": [...],
  "meta": { "total": 50, "page": 1, "limit": 10, "totalPages": 5 }
}
```

### 5.5. Doctores (`/doctor`)

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| `GET` | `/doctor` | Admin | Lista doctores paginados con filtros. |
| `POST` | `/doctor` | Admin | Asocia un perfil Doctor a un User existente. |

**Nota:** Normalmente el perfil `Doctor` se crea automáticamente al crear un usuario con rol `doctor`. Este endpoint solo es necesario para casos especiales (asignar `specialty` a un doctor existente).

**Validaciones en create:**
- El User debe existir.
- El User no debe tener ya un perfil Doctor.
- El `role` del User debe ser `doctor`.

**Filtros:**
- `page`, `limit`, `query` (nombre, email, especialidad), `specialty`

### 5.6. Pacientes (`/patient`)

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| `GET` | `/patient` | Admin | Lista pacientes paginados con filtros. |
| `GET` | `/patient/options` | Admin, Doctor | Lista todos los pacientes (id + nombre) para selectores. |
| `POST` | `/patient` | Admin | Asocia un perfil Patient a un User existente. |

**Nota:** Normalmente el perfil `Patient` se crea automáticamente al registrar un usuario o crear uno con rol `patient`. Este endpoint solo es necesario para casos especiales (asignar `birthDate` a un paciente existente).

**Validaciones en create:**
- El User debe existir.
- El User no debe tener ya un perfil Patient.
- El `role` del User debe ser `patient`.

**Filtros:**
- `page`, `limit`, `query` (nombre, email)

### 5.7. Prescripciones (`/prescripciones`)

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| `POST` | `/prescripciones` | Doctor, Admin | Crea una prescripción. |
| `GET` | `/prescripciones/doctor` | Doctor, Admin | Lista prescripciones del doctor actual. |
| `GET` | `/prescripciones/doctor/:id` | Doctor, Admin | Detalle de una prescripción del doctor. |
| `GET` | `/prescripciones/patient` | Patient, Admin | Lista prescripciones del paciente actual. |
| `GET` | `/prescripciones/patient/:id` | Patient, Admin | Detalle de una prescripción del paciente. |
| `GET` | `/prescripciones/admin` | Admin | Lista todas las prescripciones (con filtros extras). |
| `PATCH` | `/prescripciones/patient/consume/:id` | Patient, Admin | Marca una prescripción como consumida. |

**Lógica de creación:**
- El `patientId` es obligatorio.
- Si el rol es `Admin`, se requiere `doctorId` explícito. Si es `Doctor`, se usa el perfil del usuario autenticado.
- Se genera automáticamente un `code` con formato `RX-{timestamp}`.
- Se crean los `items` asociados en cascada.

**Lógica de consumo:**
- Verifica que la prescripción pertenezca al paciente (o sea admin).
- Verifica que no esté ya consumida.
- Actualiza `status` a `consumed` y registra `consumedAt`.

**Filtros de paginación (`FilterPrescripcioneDto`):**
- `page`, `limit`
- `status` — `pending` o `consumed`
- `from`, `to` — Rango de fechas (`createdAt`)
- `order` — `asc` o `desc` (default: `desc`)
- `doctorId`, `patientId` — Solo en vista admin

### 5.8. Admin - Métricas (`/admin`)

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| `GET` | `/admin/metrics` | Admin | Retorna métricas del sistema. |

**Filtros:**
- `from`, `to` — Rango de fechas

**Respuesta:**
```json
{
  "totals": { "doctors": 10, "patients": 50, "prescripciones": 120 },
  "byStatus": { "pending": 30, "consumed": 90 },
  "byDay": [{ "date": "2026-05-23", "count": 5 }, ...],
  "topDoctors": [{ "doctorId": "...", "count": 15 }, ...]
}
```

---

## 6. Frontend

### 6.1. Configuración

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` |

### 6.2. UI Theme

Diseño **Dark Mode** estilo tecnológico/médico:

| Variable CSS | Valor |
|--------------|-------|
| `--background-primary` | `#0A0A0A` |
| `--background-secondary` | `#11252C` |
| `--primary` | `#1B5060` |
| `--accent` | `#00D9FF` (cyan) |
| `--text-primary` | `#FFFFFF` |
| `--text-secondary` | `#A7B8BD` |
| `--border-color` | `#1A3A43` |

### 6.3. Páginas

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `app/page.tsx` | Home inteligente: redirige al panel según el rol (`/admin`, `/doctor`, `/patient`) o a `/login`. |
| `/login` | `app/login/page.tsx` | Formulario de login funcional. |
| `/register` | `app/register/page.tsx` | Registro público (crea usuario y perfil `patient`). |
| `/admin` | `app/admin/page.tsx` | Dashboard admin con métricas globales. |
| `/admin/users` | `app/admin/users/page.tsx` | CRUD de usuarios (crear, editar, eliminar, buscar, filtrar por rol). |
| `/admin/doctors` | `app/admin/doctors/page.tsx` | Listado de doctores con búsqueda. |
| `/admin/patients` | `app/admin/patients/page.tsx` | Listado de pacientes con búsqueda. |
| `/doctor` | `app/doctor/page.tsx` | Dashboard del doctor (totales + prescripciones recientes). |
| `/doctor/prescripciones` | `app/doctor/prescripciones/page.tsx` | Listado de prescripciones emitidas con filtro por estado. |
| `/doctor/prescripciones/nueva` | `app/doctor/prescripciones/nueva/page.tsx` | Crea prescripción: selector de pacientes, notas e items de medicamentos. |
| `/doctor/prescripciones/[id]` | `app/doctor/prescripciones/[id]/page.tsx` | Detalle de una prescripción del doctor. |
| `/patient` | `app/patient/page.tsx` | Dashboard del paciente (totales + recientes). |
| `/patient/prescripciones` | `app/patient/prescripciones/page.tsx` | Listado de sus prescripciones con filtro por estado. |
| `/patient/prescripciones/[id]` | `app/patient/prescripciones/[id]/page.tsx` | Detalle + botón "Marcar como consumida". |

**Layouts por rol:** `app/admin/layout.tsx`, `app/doctor/layout.tsx` y `app/patient/layout.tsx` usan el componente `SidebarLayout`, que valida que el usuario tenga el rol correcto (redirige a `/login` si no) y renderiza una sidebar colapsable con navegación y logout.

### 6.4. Cliente HTTP (`services/api/api.ts`)

Cliente genérico basado en `fetch` con:

- **`api.get<T>(path, options?)`**
- **`api.post<T>(path, body?, options?)`**
- **`api.put<T>(path, body?, options?)`**
- **`api.patch<T>(path, body?, options?)`**
- **`api.delete<T>(path, options?)`**

Características:
- Construye URLs con query params (`buildUrl`).
- Detecta `FormData` para manejo correcto de Content-Type.
- Lanza `ApiError` en respuestas no exitosas (status != 2xx).
- Maneja respuestas 204 (sin contenido) y parsing de JSON/texto.

### 6.5. Servicios

**`auth.service.ts`:**
```typescript
authService.login(credentials) → POST /auth/login → AuthResponse
authService.register(data)    → POST /auth/register → AuthResponse
```

**`users.service.ts`:** `findAll`, `create`, `update`, `remove` → `/users`
**`doctor.service.ts`:** `findAll`, `create` → `/doctor`
**`patient.service.ts`:** `findAll`, `create`, `findOptions` → `/patient`, `/patient/options`
**`prescriptions.service.ts`:** `findAllByDoctor`, `findOneByDoctor`, `create`, `findAllByPatient`, `findOneByPatient`, `consumeByPatient` → `/prescripciones`
**`admin.service.ts`:** `getMetrics` → `/admin/metrics`

### 6.6. Componentes reutilizables (`src/components/`)

| Componente | Descripción |
|------------|-------------|
| `SidebarLayout` | Layout con sidebar colapsable, guard por rol y logout. |
| `Pagination` | Paginación estándar de tablas. |
| `Spinner` | Indicador de carga con tamaño configurable. |
| `Modal` | Modal genérico con overlay y cierre por clic fuera. |
| `Badge` | `RoleBadge` y `StatusBadge` (pending/consumed). |
| `StatCard`, `BarRow` | Tarjetas y barras para dashboards. |
| `PrescriptionTable` | Tabla de prescripciones (código, paciente, doctor, fecha, estado). |
| `PrescriptionDetail` | Vista de detalle con items, notas y acción opcional. |

### 6.7. Tipos

```typescript
interface User { id, email, name, role, createdAt }
interface AuthResponse { status, accessToken, refreshToken, user, message }
type LoginCredentials = { email, password }
interface Prescription { id, code, status, notes, createdAt, consumedAt, patientId, authorId, patient?, author?, items? }
interface PaginatedResponse<T> { data: T[], meta: { total, page, limit, totalPages } }
```

### 6.8. Utilidades

**`ApiError`**: Clase de error personalizada con `status` y `data`.

**`getApiErrorMessage(error, fallback)`**: Extrae mensajes de error de `ApiError` o devuelve un fallback.

---

## 7. Flujo de Autenticación (Completo)

```
1. POST /auth/login → { accessToken, refreshToken, user }
2. Frontend guarda ambos tokens en localStorage
3. requests posteriores usan Authorization: Bearer <accessToken>
4. Cuando accessToken expira → POST /auth/refresh con refreshToken → nuevos tokens
```

---

## 8. Endpoints - Resumen

| # | Método | Ruta | Auth | Roles |
|---|--------|------|------|-------|
| 1 | POST | `/auth/register` | No | — |
| 2 | POST | `/auth/login` | No | — |
| 3 | POST | `/auth/refresh` | Sí | — |
| 4 | GET | `/auth/profile` | Sí | — |
| 5 | GET | `/users` | Sí | Admin |
| 6 | POST | `/users` | Sí | Admin |
| 7 | PATCH | `/users/:id` | Sí | Admin |
| 8 | DELETE | `/users/:id` | Sí | Admin |
| 9 | GET | `/doctor` | Sí | Admin |
| 10 | POST | `/doctor` | Sí | Admin |
| 11 | GET | `/patient` | Sí | Admin |
| 12 | GET | `/patient/options` | Sí | Admin, Doctor |
| 13 | POST | `/patient` | Sí | Admin |
| 14 | POST | `/prescripciones` | Sí | Doctor, Admin |
| 15 | GET | `/prescripciones/doctor` | Sí | Doctor, Admin |
| 16 | GET | `/prescripciones/doctor/:id` | Sí | Doctor, Admin |
| 17 | GET | `/prescripciones/patient` | Sí | Patient, Admin |
| 18 | GET | `/prescripciones/patient/:id` | Sí | Patient, Admin |
| 19 | GET | `/prescripciones/admin` | Sí | Admin |
| 20 | PATCH | `/prescripciones/patient/consume/:id` | Sí | Patient, Admin |
| 21 | GET | `/admin/metrics` | Sí | Admin |

