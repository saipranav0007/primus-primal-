import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ [PRIMAL Socket] Connected with ID:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 [PRIMAL Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.warn('⚠️ [PRIMAL Socket] Connection warning:', error.message);
    });
  }

  return socket;
};
