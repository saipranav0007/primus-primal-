import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { config } from '../config';

let io: SocketIOServer | null = null;

export const initializeSocket = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`⚡ [PRIMAL WebSocket] Client connected: ${socket.id}`);

    socket.emit('connection.success', {
      message: 'Connected to PRIMAL Intelligence Real-time Hub',
      timestamp: new Date().toISOString(),
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [PRIMAL WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
};

export const emitEvent = (event: string, data: any) => {
  if (io) {
    io.emit(event, {
      ...data,
      _emittedAt: new Date().toISOString(),
    });
  }
};
