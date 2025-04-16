const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

// Import separated socket handlers
const setupCallHandlers = require('./call.socket');
const setupChatHandlers = require('./chat.socket');

function initializeSocket(server) {
  const allowedOrigins = [
    'http://localhost:3000',
    "https://4b681p4d-3000.inc1.devtunnels.ms",
    "https://jyotishconnect.vercel.app",
    "https://4b681p4d-7000.inc1.devtunnels.ms",
    "https://jyotishconnect.onrender.com",
    "https://jyotish-frontend-new.vercel.app"
  ];

  const io = socketIO(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true
    }
  });

  // Store online users
  const onlineUsers = new Map();

  // Middleware to parse token from cookie
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        throw new Error('Authentication token missing');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      console.log(`Socket authenticated for user: ${decoded.id}`);
      next();
    } catch (err) {
      console.error('Socket authentication failed:', err.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);

    // Update online users map
    onlineUsers.set(socket.user.id, {
      socketId: socket.id,
      userId: socket.user.id,
      role: socket.user.role,
    });

    // Emit the updated online users list to ALL clients
    const onlineUsersList = Array.from(onlineUsers.values()).map(user => ({
      userId: user.userId,
      status: 'online'
    }));
    io.emit('onlineUsers', onlineUsersList);

    // Set up call and chat handlers for this socket
    setupCallHandlers(io, socket, onlineUsers);
    setupChatHandlers(io, socket, onlineUsers);

    // Handle disconnect
    socket.on('disconnect', () => {
      onlineUsers.delete(socket.user.id);

      const updatedOnlineUsers = Array.from(onlineUsers.values()).map(user => ({
        userId: user.userId,
        status: 'online'
      }));
      io.emit('onlineUsers', updatedOnlineUsers);

      io.emit('userStatusUpdate', {
        userId: socket.user.id,
        status: 'offline'
      });

      console.log(`User disconnected: ${socket.user.id}`);
    });
  });

  return io;
}

module.exports = initializeSocket;
