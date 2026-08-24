import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, User, Paperclip } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ref, onValue, push, serverTimestamp, update } from "firebase/database";
import { database } from "../../firebase";


interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isCustomer: boolean;
  type: any;
  fileUrl?: string;
}

function SingleChat() {
  const { chatId = "" } = useParams<{ chatId: string }>();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userId, subject] = chatId.split("_");


  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);


  useEffect(() => {
    const chatRef = ref(database, `chats/${userId}/${subject}`);
   const unsubscribe = onValue(chatRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    const messageList = Object.entries(data).map(([key, msg]: any) => ({
      id: key,
      sender: msg.sender === "user" ? "User" : "Admin",
      content: msg.text || "",
      timestamp: msg.timestamp,
      isCustomer: msg.sender === "user",
      type: msg.image ? "file" : "text",
      fileUrl: msg.image || "",
      read: msg.read ?? false,
    }));

    messageList.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    setMessages(messageList);
    setCustomerName(`${userId} - ${subject}`);

    // 🔁 Mark unread user messages as read
    const updates: Record<string, any> = {};
    Object.entries(data).forEach(([key, msg]: any) => {
      if (msg.sender === "user" && !msg.read) {
        updates[`${key}/read`] = true;
      }
    });
    if (Object.keys(updates).length > 0) {
      update(chatRef, updates);
    }
  }
});

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const chatRef = ref(database, `chats/${userId}/${subject}`);

    if (!message.trim() && selectedFiles.length === 0) return;

    if (message.trim()) {
      const textMsg = {
        text: message,
        sender: "admin",
        timestamp: serverTimestamp(),
        read: false,
        user_id: userId,
        image: "",
      };
      await push(chatRef, textMsg);
    }

    for (const file of selectedFiles) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const imageMsg = {
          text: file.name,
          sender: "admin",
          timestamp: serverTimestamp(),
          read: false,
          user_id: userId,
          image: base64String,
        };
        await push(chatRef, imageMsg);
      };
      reader.readAsDataURL(file);
    }

    setMessage("");
    setSelectedFiles([]);
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (

    
   <div className="flex flex-col h-screen bg-gray-50 ">
      <div className="flex flex-col h-full">
          <div className="flex items-center p-4 border-b bg-white sticky top-0 z-10 border mt-1">
            <button
              onClick={() => navigate("/chats")}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="bg-[#a024b4] text-white rounded-full p-2">
              <User size={20} />
            </div>
            <div className="ml-3">
              <h2 className="font-semibold text-gray-800">{customerName}</h2>
              <p className="text-sm text-gray-500">
                {messages.length} message{messages.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-100 ">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isCustomer ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 shadow text-sm ${
                    msg.isCustomer ? "bg-white text-gray-800" : "bg-[#a024b4] text-white"
                  }`}
                >
                  {msg.type === "file" && msg.fileUrl ? (
                    <img
                      src={msg.fileUrl}
                      alt="chat-img"
                      className="max-h-40 rounded-md cursor-pointer"
                      onClick={() => {
                        setModalImageUrl(msg.fileUrl || null);
                        setImageModalOpen(true);
                      }}
                    />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  <p className="text-xs mt-1 opacity-70 text-right">
                    {formatMessageTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {isImageModalOpen && modalImageUrl && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
              <div className="relative">
                <img src={modalImageUrl} alt="popup" className="max-h-[90vh] max-w-[90vw] rounded shadow-lg" />
                <button
                  className="absolute top-2 right-2 bg-white text-black p-1 rounded-full hover:bg-gray-200"
                  onClick={() => {
                    setImageModalOpen(false);
                    setModalImageUrl(null);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          )}


          <form
            onSubmit={handleSend}
            className="p-5 border-t bg-white flex items-center gap-2 border border-gray-200"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
            />
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files))}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-500 hover:text-[#a024b4]"
            >
              <Paperclip size={20} />
            </button>
            <button
              type="submit"
              className="bg-[#a024b4] text-white p-2 rounded-full hover:bg-[#a024b4]"
              disabled={!message.trim() && selectedFiles.length === 0}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
    </div>
  );
}

export default SingleChat;
