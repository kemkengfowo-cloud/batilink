const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const connectedUsers = new Map(); // userId -> socketId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: true,
      methods: ['GET', 'POST']
    }
  });

  // Middleware auth Socket.io
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Token manquant'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'byh_secret_2024');
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connecte: ${socket.userId}`);
    connectedUsers.set(socket.userId, socket.id);

    // Rejoindre sa room personnelle
    socket.join(`user_${socket.userId}`);

    // Rejoindre room admin si admin
    if (socket.userRole === 'admin') {
      socket.join('admins');
    }

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.userId);
      console.log(`❌ User deconnecte: ${socket.userId}`);
    });
  });

  return io;
};

// Envoyer notification à un utilisateur spécifique
const notifyUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

// Envoyer notification à tous les admins
const notifyAdmins = (event, data) => {
  if (io) {
    io.to('admins').emit(event, data);
  }
};

// Envoyer à tous les utilisateurs connectés
const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

const isUserOnline = (userId) => connectedUsers.has(userId.toString());

module.exports = { initSocket, notifyUser, notifyAdmins, broadcast, isUserOnline };
