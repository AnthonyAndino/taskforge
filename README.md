# TaskForge

**Kanban-style project management platform** with real-time collaboration, REST API, CLI client, and React dashboard.

---

## Badges

![TypeScript](https://img.shields.io/badge/TypeScript_6-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?logo=vite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?logo=socket.io&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest_4-6E9F18?logo=vitest&logoColor=white)
![Node](https://img.shields.io/badge/Node_22-339933?logo=nodedotjs&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

## English

### Overview

TaskForge is a full-stack task management application built with a **RESTful API** backend in **Express + TypeScript**, a **React + Vite** dashboard, and a **CLI client** for terminal usage. It supports real-time collaboration via **WebSockets**, full-text search with PostgreSQL `tsvector`, JWT authentication, and activity audit logging.

### Features

- **User authentication** — register, login, refresh tokens (JWT access + refresh)
- **Card management** — create, read, update, delete cards with optimistic concurrency (version field)
- **Full-text search** — powered by PostgreSQL `tsvector` with Spanish language support
- **Labels** — create, assign, and unassign labels to cards
- **Activity log** — audit trail of all mutations with actor, action, entity type, and metadata
- **Real-time events** — WebSocket server broadcasts `card.created`, `card.updated`, `card.deleted`, `card.moved` events
- **Reordering** — move cards between lists with position tracking
- **Dashboard** — React + Vite SPA with dark theme, login/register, card search, create, and delete
- **CLI** — terminal client to login, list, create, move, and search cards
- **CI** — GitHub Actions workflow running tests on Node 20 and 22

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Express 5, TypeScript 6, Node 22 |
| Database | PostgreSQL (via `pg` pool) |
| Auth | JWT (access + refresh tokens), bcryptjs |
| Real-time | WebSocket (`ws` library) |
| Frontend | React 19, Vite 8, TypeScript 6 |
| CLI | TypeScript, `fetch` API |
| Testing | Vitest 4, Supertest |
| CI/CD | GitHub Actions |

### Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Fill in DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

# Seed the database with demo Kanban data
npm run db:seed

# Start development server
npm run dev

# Run tests
npm run test:run

# Start dashboard (separate terminal)
cd dashboard && npm install && npm run dev
```

#### Demo Credentials
After seeding, you can log into the dashboard using:
- **Email:** `demo@taskforge.com`
- **Password:** `password123`

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login |
| POST | `/auth/refresh` | No | Refresh access token |
| GET | `/health` | No | Health check |
| GET | `/api/ping` | No | Ping |
| GET | `/api/ping/me` | Yes | Auth check |
| GET | `/api/lists/:listId/cards` | Yes | List cards in a list |
| POST | `/api/lists/:listId/cards` | Yes | Create card |
| GET | `/api/cards/:id` | Yes | Get card by id |
| PATCH | `/api/cards/:id` | Yes | Update card |
| DELETE | `/api/cards/:id` | Yes | Delete card |
| POST | `/api/cards/:id/move` | Yes | Move card to another list |
| GET | `/api/cards/search?q=` | Yes | Full-text search |
| POST | `/api/labels` | Yes | Create label |
| GET | `/api/labels` | Yes | List all labels |
| POST | `/api/cards/:cardId/labels/:labelId` | Yes | Assign label |
| DELETE | `/api/cards/:cardId/labels/:labelId` | Yes | Unassign label |

---

## Español

### Resumen

TaskForge es una aplicación full-stack de gestión de tareas con una **API REST** en **Express + TypeScript**, un dashboard en **React + Vite** y un **CLI** para terminal. Soporta colaboración en tiempo real via **WebSockets**, búsqueda de texto completo con PostgreSQL `tsvector`, autenticación JWT y registro de auditoría de actividades.

### Características

- **Autenticación de usuarios** — registro, inicio de sesión, renovación de tokens (JWT access + refresh)
- **Gestión de tarjetas** — crear, leer, actualizar, eliminar tarjetas con concurrencia optimista (campo version)
- **Búsqueda de texto completo** — mediante PostgreSQL `tsvector` con soporte para español
- **Etiquetas** — crear, asignar y desasignar etiquetas a las tarjetas
- **Registro de actividad** — trazabilidad de auditoría de todas las mutaciones
- **Eventos en tiempo real** — servidor WebSocket que transmite eventos `card.created`, `card.updated`, `card.deleted`, `card.moved`
- **Reordenamiento** — mover tarjetas entre listas con seguimiento de posición
- **Dashboard** — SPA en React + Vite con tema oscuro, login/registro, búsqueda, creación y eliminación de tarjetas
- **CLI** — cliente de terminal para iniciar sesión, listar, crear, mover y buscar tarjetas
- **CI** — flujo de GitHub Actions ejecutando pruebas en Node 20 y 22

### Tecnologías

| Capa | Tecnología |
|------|-----------|
| Backend | Express 5, TypeScript 6, Node 22 |
| Base de datos | PostgreSQL (pool `pg`) |
| Autenticación | JWT (access + refresh tokens), bcryptjs |
| Tiempo real | WebSocket (`ws`) |
| Frontend | React 19, Vite 8, TypeScript 6 |
| CLI | TypeScript, API `fetch` |
| Pruebas | Vitest 4, Supertest |
| CI/CD | GitHub Actions |

### Primeros pasos

```bash
# Instalar dependencias
npm install

# Configurar entorno
cp .env.example .env
# Completar DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

# Sembrar la base de datos con datos de prueba
npm run db:seed

# Iniciar servidor de desarrollo
npm run dev

# Ejecutar pruebas
npm run test:run

# Iniciar dashboard (terminal separada)
cd dashboard && npm install && npm run dev
```

#### Credenciales de Prueba
Tras sembrar la base de datos, puedes iniciar sesión en el dashboard usando:
- **Correo:** `demo@taskforge.com`
- **Contraseña:** `password123`

---

## Project Structure

```
taskforge/
├── cli/                  # CLI client
│   └── index.ts
├── dashboard/            # React + Vite frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── api.ts
│   │   └── main.tsx
│   └── package.json
├── src/                  # Backend API
│   ├── app.ts
│   ├── server.ts
│   ├── config.ts
│   ├── websocket.ts
│   ├── db/
│   │   └── pool.ts
│   ├── errors/
│   │   └── AppError.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── notFound.ts
│   ├── repositories/
│   │   ├── userRepository.ts
│   │   ├── cardRepository.ts
│   │   ├── labelRepository.ts
│   │   └── activityLogRepository.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── card.ts
│   │   ├── health.ts
│   │   ├── label.ts
│   │   └── ping.ts
│   ├── services/
│   │   ├── auth.ts
│   │   ├── card.ts
│   │   ├── label.ts
│   │   └── ping.ts
│   └── types/
│       └── api.ts
├── tests/                # Integration tests
│   ├── auth.test.ts
│   ├── card.test.ts
│   └── health.test.ts
├── .github/workflows/
│   └── test.yml
├── package.json
└── tsconfig.json
```

## License

MIT — see [LICENSE](LICENSE) for details.
