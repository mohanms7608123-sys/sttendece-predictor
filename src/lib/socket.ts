import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    // In dev mode, Socket.IO connects through Vite proxy to http://localhost:5000
    // In production, it connects to window.location.origin or dedicated socket host
    const socketUrl = window.location.origin;

    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to real-time server:', socket?.id);
    });

    socket.on('connect_error', (error) => {
      console.warn('[Socket.IO] Connection error (falling back to polling/fallback):', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected:', reason);
    });
  }

  return socket;
}
