import { Server } from 'socket.io';

let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`[Socket.IO] Client ${socket.id} joined room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  return io;
}

export function broadcastOrderCreated(orderData) {
  if (io) {
    io.emit('order:created', orderData);
    io.emit('orders:changed', { event: 'INSERT', order: orderData });
  }
}

export function broadcastOrderUpdated(orderData) {
  if (io) {
    io.emit('order:updated', orderData);
    io.emit('orders:changed', { event: 'UPDATE', order: orderData });
  }
}
