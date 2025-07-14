import express from 'express';
import { 
  getChatHistory, 
  getUsersForSalesManager, 
  markMessagesAsRead,
  sendMessage 
} from './chatController.js';

const router = express.Router();

// Get chat history between user and sales manager
router.get('/history/:userId/:salesManagerId', getChatHistory);

// Get all users assigned to a sales manager
router.get('/users/:salesManagerId', getUsersForSalesManager);

// Mark messages as read
router.post('/mark-read', markMessagesAsRead);

// Send message (REST endpoint as backup)
router.post('/send', sendMessage);

export default router;