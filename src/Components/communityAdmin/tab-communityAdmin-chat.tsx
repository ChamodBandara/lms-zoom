import { useState, useEffect, useRef } from 'react';

import { database, ref, onValue, push } from '../../firebase';

function MobileCommunityAdminChat() {
  // Define the Message interface
  interface Message {
    text: string;
    timestamp: string;
    user_name: string;
  }

  const [userName, setUserName] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Load userName from localStorage
  useEffect(() => {
    const storedUserName = localStorage.getItem('name');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  // Fetch messages from Firebase
  useEffect(() => {
    const messagesRef = ref(database, `communityChats`);
    onValue(messagesRef, (snapshot) => {
      const messagesData = snapshot.val();
      const formattedMessages: Message[] = Object.values(messagesData || {});
      setMessages(formattedMessages);
    });
  }, []);

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message: Message = {
        text: newMessage,
        timestamp: new Date().toISOString(), // Use ISO string for consistent formatting
        user_name: userName,
      };

      try {
        const messagesRef = ref(database, `communityChats`);
        await push(messagesRef, message);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  // Auto-scroll chat container to the latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="mt-4 flex h-[60vh] flex-col items-center">
      <header className="mb-4 w-full rounded-md bg-theme p-4 shadow-md">
        <h2 className="text-center text-2xl font-semibold text-white">
          Community Chat
        </h2>
      </header>

      {/* Chat Container */}
      <div
        ref={chatContainerRef}
        className="hide-scrollbar w-full flex-1 overflow-y-auto rounded-md bg-white p-4 shadow-md"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 flex items-start ${
              msg.user_name === userName ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* User Avatar */}
            <img
              src={
                msg.user_name === userName
                  ? '/images/profile-1.png'
                  : '/images/icons8-user-64.png'
              }
              alt={msg.user_name}
              className="mr-3 h-10 w-10 rounded-full"
            />
            {/* Message Bubble */}
            <div
              className={`flex flex-col rounded-md p-3 ${
                msg.user_name === userName ? 'bg-purple-300' : 'bg-gray-100'
              }`}
              style={{ wordBreak: 'break-word' }}
            >
              <div className="flex items-center justify-between">
                <p className="mr-2 text-sm font-bold capitalize text-gray-800">
                  {msg.user_name}
                </p>
                <span className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="mt-2 break-words text-xs text-gray-800">
                {msg.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer - Message Input */}
      <footer className="mt-4 w-full max-w-4xl">
        <form
          className="flex items-center rounded-md bg-gray-200 p-2"
          onSubmit={handleSendMessage}
        >
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 rounded-md bg-white p-2 text-xs outline-none"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            className="ml-2 rounded-md bg-theme px-4 py-2 text-xs font-semibold text-white hover:bg-purple-400"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}

export default MobileCommunityAdminChat;
