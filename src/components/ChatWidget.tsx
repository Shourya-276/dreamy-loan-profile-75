
import React, { useState } from "react";
import { ArrowUp, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  id: string;
  text: string;
  sender: "user" | "support" | "manager";
  name: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello, my loan is approved but not credited to my account yet. Can you check?",
      sender: "user",
      name: "Rahul Sharma",
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
    },
    {
      id: "2",
      text: "Hi Rohan, I'll check with the bank. Can you confirm your loan reference number?",
      sender: "support",
      name: "Priya Sharma",
      timestamp: new Date(Date.now() - 1000 * 60 * 22),
    },
    {
      id: "3",
      text: "Sure! It's LOAN12345",
      sender: "user",
      name: "Rahul Sharma",
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
    },
    {
      id: "4",
      text: "Thanks! I've escalated your request to the manager. You'll get an update soon.",
      sender: "support",
      name: "Priya Sharma",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
      id: "5",
      text: "We checked with the bank, and the loan will be credited within 24 hours.",
      sender: "manager",
      name: "Aman Verma (Manager)",
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
    },
    {
      id: "6",
      text: "Your loan will be credited within 24 hours. Let me know if you need anything else!",
      sender: "support",
      name: "Priya Sharma",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "user",
      name: "Rahul Sharma",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setNewMessage("");

    // Simulate support response after 1 second
    setTimeout(() => {
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for your message! Our team will get back to you shortly.",
        sender: "support",
        name: "Priya Sharma",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, supportMessage]);
    }, 1000);
  };

  return (
    <div className="h-full bg-white dark:bg-gray-800 flex flex-col overflow-hidden">
      {/* Chat header */}
      <div className="p-4 bg-brand-purple text-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/lovable-uploads/75bc211c-a5f5-400d-8e31-d21743e7c871.png" alt="Loan for India Team" />
            <AvatarFallback>LI</AvatarFallback>
          </Avatar>
          <span className="font-medium">Loan for India Team</span>
        </div>
      </div>

      {/* Chat messages - scrollable area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.sender !== "user" && (
                <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-sm font-medium mr-2 flex-shrink-0">
                  {message.sender === "manager" ? "AM" : "PS"}
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === "user"
                    ? "bg-green-100 text-gray-800"
                    : message.sender === "manager"
                    ? "bg-rose-100 text-gray-800"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                }`}
              >
                {message.sender !== "user" && (
                  <p className="text-xs font-medium mb-1">
                    {message.name}
                  </p>
                )}
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input area - fixed at bottom */}
      <div className="p-3 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type Something.."
            className="flex-1 bg-transparent outline-none text-gray-800 dark:text-gray-200 placeholder-gray-500 text-sm"
          />
          <button
            onClick={sendMessage}
            className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
