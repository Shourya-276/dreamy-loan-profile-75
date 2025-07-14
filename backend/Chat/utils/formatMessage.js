export const formatMessage = (message, userName = 'Unknown User') => {
  return {
    id: message.id || Date.now(),
    text: message.text || message.message_text,
    sender: message.senderType || message.sender_type,
    name: userName,
    timestamp: message.timestamp || message.sent_at || new Date(),
    senderId: message.senderId || message.sender_id,
    receiverId: message.receiverId || message.receiver_id
  };
};

export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
};

export const validateMessage = (message) => {
  if (!message || typeof message !== 'object') {
    return false;
  }

  const requiredFields = ['senderId', 'receiverId', 'text', 'senderType'];
  
  for (const field of requiredFields) {
    if (!message[field]) {
      return false;
    }
  }

  if (!['user', 'sales_manager'].includes(message.senderType)) {
    return false;
  }

  if (typeof message.text !== 'string' || message.text.trim().length === 0) {
    return false;
  }

  return true;
};