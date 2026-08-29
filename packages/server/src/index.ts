import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { redis } from './redis/client';
import { registerRoomHandlers } from './socket/rooms';
import { registerGameHandlers } from './socket/handlers';

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

// ─── Health check ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'dhandha-server', timestamp: new Date().toISOString() });
});

// ─── HTTP Server + Socket.IO ──────────────────────────────────
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 30000,
  pingInterval: 10000,
});

// ─── Socket.IO connection ─────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  // Register all event handlers
  registerRoomHandlers(io, socket);
  registerGameHandlers(io, socket);

  socket.on('disconnect', (reason) => {
    console.log(`[Socket] Disconnected: ${socket.id} — ${reason}`);
  });

  socket.on('error', (err) => {
    console.error(`[Socket] Error on ${socket.id}:`, err);
  });
});

// ─── Start server ─────────────────────────────────────────────
async function start() {
  try {
    // Try connecting Redis (gracefully falls back to in-memory Map if unavailable)
    try {
      await redis.connect();
      console.log('[Redis] Connected successfully');
    } catch {
      console.log('[Redis] Not detected — using in-memory store fallback');
    }

    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════╗
║  🇮🇳 VYAPAR Server Running!          ║
║  Port: ${PORT}                          ║
║  Env:  ${process.env.NODE_ENV ?? 'development'}                 ║  
║  Store: In-Memory / Redis Ready      ║
╚══════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}


start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Server] SIGTERM received, shutting down...');
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Server] SIGINT received, shutting down...');
  await redis.quit();
  process.exit(0);
});
