import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import { initializeSocket } from './websocket/socketServer';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO real-time hub
const io = initializeSocket(server);

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for development
app.use((req, res, next) => {
  if (config.nodeEnv === 'development' && req.path.startsWith('/api')) {
    console.log(`📡 [${req.method}] ${req.path}`);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OPERATIONAL',
    platform: 'PRIMAL Intelligent Warehouse Operations Platform',
    tagline: 'See. Decide. Fulfill.',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api', apiRouter);

// Serve Frontend static assets in unified deployment mode
const possibleDistPaths = [
  path.join(__dirname, '../../frontend/dist'),
  path.join(__dirname, '../frontend/dist'),
  path.join(process.cwd(), 'frontend/dist'),
  path.join(process.cwd(), '../frontend/dist'),
];

const frontendDist = possibleDistPaths.find((p) => fs.existsSync(p));

if (frontendDist) {
  console.log(`🌐 [Static Assets] Serving frontend from: ${frontendDist}`);
  app.use(express.static(frontendDist));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Central error handler
app.use(errorHandler);

// Start server
server.listen(config.port, () => {
  console.log(`
  ══════════════════════════════════════════════════════════════
  🚀 PRIMAL — Intelligent Warehouse Operations Engine
  ⚡ Tagline: See. Decide. Fulfill.
  📡 REST API:   http://localhost:${config.port}/api
  ⚡ WebSockets: http://localhost:${config.port}
  🟢 Environment: ${config.nodeEnv}
  ══════════════════════════════════════════════════════════════
  `);
});

export { app, server, io };
