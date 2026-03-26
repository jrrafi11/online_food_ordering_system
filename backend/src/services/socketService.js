let ioInstance = null;

const defaultAllowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
const configuredOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...configuredOrigins]));

const initSocket = (server) => {
  const { Server } = require('socket.io');

  ioInstance = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  ioInstance.on('connection', (socket) => {
    socket.on('join-order-room', (orderId) => {
      if (orderId) {
        socket.join(`order-${orderId}`);
      }
    });

    socket.on('join-user-room', (userId) => {
      if (userId) {
        socket.join(`user-${userId}`);
      }
    });

    socket.on('join-restaurant-room', (restaurantId) => {
      if (restaurantId) {
        socket.join(`restaurant-${restaurantId}`);
      }
    });
  });

  return ioInstance;
};

const getSocket = () => ioInstance;

const emitOrderUpdate = (order) => {
  if (!ioInstance || !order) return;

  ioInstance.to(`order-${order.id}`).emit('order-updated', order);
  ioInstance.to(`user-${order.userId}`).emit('order-updated', order);
  ioInstance.to(`restaurant-${order.restaurantId}`).emit('order-updated', order);

  const riderUserId = order.rider?.userId || null;
  if (riderUserId) {
    ioInstance.to(`user-${riderUserId}`).emit('order-updated', order);
  }
};

module.exports = {
  initSocket,
  getSocket,
  emitOrderUpdate,
};
