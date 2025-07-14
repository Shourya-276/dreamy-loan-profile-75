import chatService from './chatService.js';

export const getChatHistory = async (req, res) => {
  try {
    const { userId, salesManagerId } = req.params;
    const { limit = 50 } = req.query;

    const messages = await chatService.getChatHistory(
      parseInt(userId), 
      parseInt(salesManagerId), 
      parseInt(limit)
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chat history' });
  }
};

export const getUsersForSalesManager = async (req, res) => {
  try {
    const { salesManagerId } = req.params;
    
    const users = await chatService.getUsersForSalesManager(parseInt(salesManagerId));
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users for sales manager:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    
    await chatService.markMessagesAsRead(parseInt(senderId), parseInt(receiverId));
    
    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark messages as read' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, text, senderType } = req.body;
    
    const message = await chatService.saveMessage({
      senderId: parseInt(senderId),
      receiverId: parseInt(receiverId),
      text,
      senderType
    });
    
    res.json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};