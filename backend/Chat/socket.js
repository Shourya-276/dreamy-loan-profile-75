import { Server } from 'socket.io';
import chatService from './chatService.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join chat room between user and sales manager
    socket.on('joinRoom', async ({ userId, salesManagerId }) => {
      try {
        const room = `chat_${userId}_${salesManagerId}`;
        socket.join(room);
        socket.userId = userId;
        socket.salesManagerId = salesManagerId;
        socket.room = room;

        console.log(`User ${userId} joined room: ${room}`);

        // Send welcome message from sales manager
        const welcomeMessage = await chatService.sendWelcomeMessage(userId, salesManagerId);
        if (welcomeMessage) {
          io.to(room).emit('message', welcomeMessage);
        }

        // Load and send chat history
        const chatHistory = await chatService.getChatHistory(userId, salesManagerId);
        socket.emit('chatHistory', chatHistory);

      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join chat room' });
      }
    });

    // Handle chat messages
    socket.on('chatMessage', async ({ senderId, receiverId, text, senderType }) => {
      try {
        const message = await chatService.saveMessage({
          senderId,
          receiverId, 
          text,
          senderType
        });

        const room = `chat_${senderId}_${receiverId}`;
        io.to(room).emit('message', message);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', ({ room, isTyping, userName }) => {
      socket.to(room).emit('typing', { isTyping, userName });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export default { initializeSocket, getIO };