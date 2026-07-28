# Prescripciones - Frontend

Aplicación web para la gestión de prescripciones médicas. Construida con **Next.js 16** (App Router), **React 19** y **Tailwind CSS 4**.

## Stack

- **Framework**: Next.js 16.2.9 (App Router)
- **UI**: React 19.2.4
- **Estilos**: Tailwind CSS 4
- **HTTP**: Fetch API nativa (cliente custom)
- **Lenguaje**: TypeScript 5

## Requisitos previos

- Node.js >= 18
- Backend corriendo en `http://localhost:3001`

## Instalación

```bash
npm install
```

## Variables de entorno

Copiar `.env` y configurar:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en `localhost:3000` |
| `npm run build` | Compilar para producción |
| `npm run start` | Ejecutar versión compilada |
| `npm run lint` | Linting con ESLint |

## Estructura

```
src/
├── app/
│   ├── layout.tsx            # Layout raíz (fuentes, metadata)
│   ├── page.tsx              # Página principal
│   ├── globals.css           # Variables CSS del tema dark
│   └── login/page.tsx        # Página de login
├── services/
│   ├── auth.service.ts       # Servicio de autenticación
│   └── api/
│       ├── api.ts            # Cliente HTTP genérico (fetch wrapper)
│       └── endpoints.ts      # Constantes de endpoints
├── types/
│   ├── User.ts               # Interfaz User
│   └── auth/
│       ├── AuthResponse.ts   # Respuesta de login/register
│       └── LoginCredentials.ts
└── utils/
    ├── ApiError.ts           # Clase de error para API
    └── getApiErrorMessage.ts # Extrae mensajes de error
```

## Cliente HTTP

Wrapper genérico sobre `fetch` en `services/api/api.ts`:

```typescript
import { api } from "./services/api/api";

// GET
const users = await api.get<User[]>("/users");

// POST
const result = await api.post<AuthResponse>("/auth/login", { email, password });

// PATCH
const updated = await api.patch("/prescripciones/consume/123");

// PUT / DELETE también disponibles
```

Características:
- Construcción automática de URLs con query params
- Soporte para `FormData`
- Parsing automático de JSON/texto
- Errores tipados con `ApiError` (status + data)

## Tema visual

Dark mode estilo tecnológico/médico. Variables definidas en `globals.css`:

| Variable | Valor | Uso |
|----------|-------|-----|
| `--background-primary` | `#0A0A0A` | Fondo principal |
| `--background-secondary` | `#11252C` | Fondo de cards/paneles |
| `--primary` | `#1B5060` | Botones secundarios |
| `--accent` | `#00D9FF` | Acciones principales (cyan) |
| `--text-primary` | `#FFFFFF` | Texto principal |
| `--text-secondary` | `#A7B8BD` | Texto secundario |
| `--border-color` | `#1A3A43` | Bordes |

## Páginas

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/` | Placeholder | Página principal (template Next.js) |
| `/login` | Funcional | Formulario de login con llamada a la API |

## Autenticación

El login almacena `accessToken` y `refreshToken` en `localStorage`:

```typescript
const response = await authService.login({ email, password });
localStorage.setItem("accessToken", response.accessToken);
localStorage.setItem("refreshToken", response.refreshToken);
```

> **Pendiente**: El header `Authorization` no se inyecta automáticamente en los requests. Falta implementar un interceptor o middleware que lea el token de localStorage y lo agregue al header de cada petición.

## Uso del tema en componentes

```tsx
<input
  className="h-11 w-full rounded-md border border-[#1A3A43] bg-black/30 px-3 text-sm text-[#FFFFFF] 
             outline-none transition placeholder:text-[#A7B8BD]/70 
             focus:border-[#00D9FF] focus:ring-2 focus:ring-[#00D9FF]/15"
/>
```
