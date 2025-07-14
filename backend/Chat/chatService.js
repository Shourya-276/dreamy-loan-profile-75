import db from '../db.js';

class ChatService {
  
  async initializeTables() {
    try {
      // Create chat_rooms table
      await db.query(`
        CREATE TABLE IF NOT EXISTS chat_rooms (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          sales_manager_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, sales_manager_id)
        )
      `);

      // Create messages table
      await db.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          sender_id INTEGER NOT NULL,
          receiver_id INTEGER NOT NULL,
          message_text TEXT NOT NULL,
          sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'sales_manager')),
          sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_read BOOLEAN DEFAULT FALSE,
          room_id INTEGER REFERENCES chat_rooms(id)
        )
      `);

      console.log('Chat tables initialized successfully');
    } catch (error) {
      console.error('Error initializing chat tables:', error);
    }
  }

  async createOrGetChatRoom(userId, salesManagerId) {
    try {
      // Check if chat room exists
      const existingRoom = await db.query(
        'SELECT * FROM chat_rooms WHERE user_id = $1 AND sales_manager_id = $2',
        [userId, salesManagerId]
      );

      if (existingRoom.rows.length > 0) {
        return existingRoom.rows[0];
      }

      // Create new chat room
      const newRoom = await db.query(
        'INSERT INTO chat_rooms (user_id, sales_manager_id) VALUES ($1, $2) RETURNING *',
        [userId, salesManagerId]
      );

      return newRoom.rows[0];
    } catch (error) {
      console.error('Error creating/getting chat room:', error);
      throw error;
    }
  }

  async saveMessage({ senderId, receiverId, text, senderType }) {
    try {
      const message = await db.query(
        `INSERT INTO messages (sender_id, receiver_id, message_text, sender_type) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [senderId, receiverId, text, senderType]
      );

      return {
        id: message.rows[0].id,
        senderId: message.rows[0].sender_id,
        receiverId: message.rows[0].receiver_id,
        text: message.rows[0].message_text,
        senderType: message.rows[0].sender_type,
        timestamp: message.rows[0].sent_at
      };
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  async sendWelcomeMessage(userId, salesManagerId) {
    try {
      // Check if welcome message already exists
      const existingWelcome = await db.query(
        `SELECT * FROM messages 
         WHERE sender_id = $1 AND receiver_id = $2 AND message_text LIKE '%Welcome to the chat!%'`,
        [salesManagerId, userId]
      );

      if (existingWelcome.rows.length > 0) {
        return null; // Welcome message already sent
      }

      // Create chat room
      await this.createOrGetChatRoom(userId, salesManagerId);

      // Get sales manager name
      const salesManager = await db.query(
        'SELECT name FROM users WHERE id = $1',
        [salesManagerId]
      );

      const welcomeText = `Welcome to the chat! I'm ${salesManager.rows[0]?.name || 'your sales manager'} and I'm here to help you with your loan application.`;

      const welcomeMessage = await this.saveMessage({
        senderId: salesManagerId,
        receiverId: userId,
        text: welcomeText,
        senderType: 'sales_manager'
      });

      return welcomeMessage;
    } catch (error) {
      console.error('Error sending welcome message:', error);
      return null;
    }
  }

  async getChatHistory(userId, salesManagerId, limit = 50) {
    try {
      const messages = await db.query(
        `SELECT m.*, u.name as sender_name 
         FROM messages m
         JOIN users u ON u.id = m.sender_id
         WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
         ORDER BY sent_at ASC
         LIMIT $3`,
        [userId, salesManagerId, limit]
      );

      return messages.rows.map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        text: msg.message_text,
        senderType: msg.sender_type,
        senderName: msg.sender_name,
        timestamp: msg.sent_at
      }));
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  async getUsersForSalesManager(salesManagerId) {
    try {
      const users = await db.query(
        `SELECT DISTINCT u.id, u.name, u.email, u.profile_picture,
                COUNT(m.id) as unread_count
         FROM users u
         JOIN leads l ON l.customer_id = u.id
         LEFT JOIN messages m ON m.sender_id = u.id AND m.receiver_id = $1 AND m.is_read = FALSE
         WHERE l.sales_manager_id = $1 AND u.role = 'customer'
         GROUP BY u.id, u.name, u.email, u.profile_picture
         ORDER BY u.name`,
        [salesManagerId]
      );

      return users.rows;
    } catch (error) {
      console.error('Error getting users for sales manager:', error);
      return [];
    }
  }

  async markMessagesAsRead(senderId, receiverId) {
    try {
      await db.query(
        'UPDATE messages SET is_read = TRUE WHERE sender_id = $1 AND receiver_id = $2',
        [senderId, receiverId]
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }
}

export default new ChatService();