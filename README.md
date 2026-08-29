# 🇮🇳 DHANDHA (धंधा) — Indian Theme Multiplayer Monopoly Game

An interactive, real-time, Indian-themed multiplayer Monopoly board game (**Vyapar / व्यापार**) built using modern web technology stack, featuring iconic Indian landmarks, Desi characters, authentic sound effects, real-time WebSocket communication, and responsive modern UI.

---

## 🌟 Key Features

- 🎲 **Real-Time Multiplayer**: Built-in room management and live WebSocket synchronization powered by Socket.IO.
- 🏛️ **Desi Board & Landmarks**: Iconic Indian cities and monuments (Taj Mahal, Gateway of India, Hawa Mahal, Howrah Bridge, Charminar, Mumbai, Delhi, Bengaluru, etc.).
- 🎭 **Custom Characters**: Unique avatars and player markers tailored for the Indian business theme.
- 🔊 **Desi Sound FX**: Interactive sound effects and audio hooks (`useDesiSounds`).
- 🏠 **Property Management**: Buy properties, build houses/hotels, collect rent, and trade properties with other players.
- 💬 **Live In-Game Chat**: Integrated floating chat drawer for real-time player bantering and trading.
- 💾 **Resilient Data Store**: Connects to Redis & PostgreSQL via Prisma, with automatic **in-memory fallback** for quick local offline development.

---

## 🏗️ Project Architecture (Monorepo)

The repository is organized as an `npm` workspace monorepo:

```
project dhanda/
├── packages/
│   ├── client/     # Frontend (React 18, Vite, Tailwind CSS, Socket.IO client)
│   ├── server/     # Backend (Node.js, Express, Socket.IO, Prisma, Redis)
│   └── shared/     # Shared TypeScript types, board configs, and game rules
├── docker-compose.yml # PostgreSQL 16 & Redis 7 configuration
└── package.json
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites

- **Node.js** v18+ 
- **npm** v9+
- *(Optional)* **Docker Desktop** for PostgreSQL & Redis

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

- Copy `.env.example` to `packages/server/.env`:
  ```bash
  cp .env.example packages/server/.env
  ```
- Make sure `packages/client/.env` contains:
  ```env
  VITE_SERVER_URL=http://localhost:3001
  ```

### 3. Run Development Servers

Run both backend server and frontend client concurrently with a single command:

```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3001](http://localhost:3001)
- **Health Check**: [http://localhost:3001/health](http://localhost:3001/health)

---

## 🐳 Optional Docker Database Setup

If you want to run local PostgreSQL and Redis containers:

```bash
# Start Postgres & Redis containers
npm run docker:up

# Push Prisma schema to local Postgres database
npm run db:push
```

To stop docker services:
```bash
npm run docker:down
```

*(Note: If Docker is not running, the backend automatically uses an in-memory store fallback for zero-friction setup!)*

---

## 📜 NPM Scripts Reference

| Command | Description |
|---|---|
| `npm run dev` | Runs client (`:5173`) and server (`:3001`) in dev mode simultaneously |
| `npm run build` | Builds `shared`, `server`, and `client` packages for production |
| `npm run test` | Runs server unit tests via Vitest |
| `npm run db:push` | Pushes Prisma schema changes to PostgreSQL |
| `npm run docker:up` | Starts Docker containers for Postgres & Redis |
| `npm run docker:down` | Stops running Docker containers |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Howler.js audio
- **Backend**: Node.js, Express, Socket.IO, Prisma ORM, Redis (ioredis), tsx watcher
- **Database & Caching**: PostgreSQL 16, Redis 7
- **Development**: Concurrently, Vitest, npm Workspaces

---

## 📜 License

ISC License. Made with ❤️ for Indian board game enthusiasts!
