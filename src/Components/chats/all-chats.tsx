import { ref, onValue, remove } from "firebase/database";
import { database } from "../../firebase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Mail, User, MoreVertical, Trash2 } from "lucide-react";
import Pagination from "../pagination/pagination";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number | string;
  isCustomer: boolean;
  image?: string;
  read?: boolean; // ✅ add this
}

interface Chat {
  id: string; // userId_subject
  userId: string;
  subject: string;
  customer: string;
  lastMessage: string;
  timestamp: string;
  newMessageCount: number;
  unread: boolean;
  messages: Message[];
}

function AllChats() {
  const [chatsPerPage] = useState(10);
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUnread, setFilterUnread] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const totalPages = Math.ceil(filteredChats.length / chatsPerPage);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const chatsRef = ref(database, "chats");

    onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      const chatList: Chat[] = [];

      if (data) {
        Object.entries(data).forEach(([userId, userSubjects]) => {
          Object.entries(userSubjects as Record<string, any>).forEach(([subject, messages]) => {
            const msgList = Object.entries(messages).map(([msgId, msg]: any) => ({
              id: msgId,
              sender: msg.sender === "user" ? "User" : "Admin",
              text: msg.text || "",
              image: msg.image || "",
              timestamp: msg.timestamp,
              isCustomer: msg.sender === "user",
              read: msg.read ?? false, // ✅ map read field
            }));

            msgList.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            const unreadCount = msgList.filter((m) => m.isCustomer && !m.read).length;

            const lastMsg = msgList[msgList.length - 1];

            chatList.push({
              id: `${userId}_${subject}`,
              userId,
              subject,
              customer: `${userId} - ${subject}`,
              lastMessage: lastMsg?.text || "No message",
              timestamp: lastMsg?.timestamp || "",
              newMessageCount: unreadCount,
              unread: unreadCount > 0,
              messages: msgList,
            });
          });
        });

        chatList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setChats(chatList);
        setFilteredChats(chatList);
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    let filtered = chats;

    if (searchTerm) {
      filtered = filtered.filter(
        (chat) =>
          chat.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterUnread) {
      filtered = filtered.filter((chat) => chat.unread);
    }

    setFilteredChats(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterUnread, chats]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleFilterUnread = () => {
    setFilterUnread(!filterUnread);
  };

  const markAsRead = (chatId: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, unread: false, newMessageCount: 0 } : chat
      )
    );
  };

  const handleChatClick = (chat: Chat) => {
    markAsRead(chat.id);
    navigate(`/chat/${chat.id}`, {
      state: {
        chatData: {
          customer: chat.customer,
          messages: chat.messages,
          userId: chat.userId,
          subject: chat.subject,
        },
      },
    });
  };

  const confirmDelete = (chatId: string) => {
    setChatToDelete(chatId);
    setShowDeleteModal(true);
    setShowDeleteConfirm(null);
  };

  const deleteChat = async () => {
    if (!chatToDelete) return;
    const [userId, subject] = chatToDelete.split("_");
    const chatRef = ref(database, `chats/${userId}/${subject}`);

    try {
      await remove(chatRef);
      setChats((prev) => prev.filter((chat) => chat.id !== chatToDelete));
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }

    setShowDeleteModal(false);
    setChatToDelete(null);
  };

  const toggleDeleteConfirm = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(showDeleteConfirm === chatId ? null : chatId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const indexOfLastChat = currentPage * chatsPerPage;
  const indexOfFirstChat = indexOfLastChat - chatsPerPage;
  const currentChats = filteredChats.slice(indexOfFirstChat, indexOfLastChat);

  return (
    <div className="flex flex-col h-full bg-white-50 p-2 md:p-4">
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Delete Chat</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this chat?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteChat}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 uppercase bg-gray-50 p-2 md:p-4 border rounded-lg">
        Live Chat
      </h1>

      <div className="flex flex-col md:flex-row items-center justify-between p-3 md:p-4 border-b bg-gray-50 shadow-lg gap-2 md:gap-0">
        <div className="relative w-full md:flex-1 md:max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <button
          className={`w-full md:w-auto mt-2 md:mt-0 md:ml-4 flex items-center justify-center px-3 py-2 rounded-lg ${
            filterUnread ? "bg-purple-100 text-[#a024b4]" : "bg-gray-100 text-gray-800"
          }`}
          onClick={toggleFilterUnread}
        >
          <Filter size={16} className="mr-1" />
          {filterUnread ? "Showing Unread" : "All Messages"}
        </button>
      </div>

      <div className="flex-1 shadow-lg h-screen overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a024b4]"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {currentChats.length > 0 ? (
              currentChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex items-start p-3 md:p-4 hover:bg-gray-100 cursor-pointer ${
                    chat.unread ? "bg-purple-50" : "bg-white"
                  }`}
                  onClick={() => handleChatClick(chat)}
                >
                  <div className="bg-[#a024b4] text-white rounded-full p-2 shadow-md flex-shrink-0">
                    <User size={20} />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3
                        className={`text-sm font-medium ${
                          chat.unread ? "text-[#a024b4]" : "text-gray-900"
                        } truncate`}
                      >
                        {chat.customer}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {formatDate(chat.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                    <div className="flex items-center mt-1 flex-wrap gap-1">
                      {chat.unread && chat.newMessageCount > 0 && (
                        <>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-[#a024b4]">
                            <Mail className="mr-1" size={12} />
                            {chat.newMessageCount} new message
                            {chat.newMessageCount !== 1 ? "s" : ""}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-[#a024b4]">
                            Unread
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="relative flex-shrink-0">
                    <button
                      className="ml-2 text-gray-400 hover:text-gray-600"
                      onClick={(e) => toggleDeleteConfirm(chat.id, e)}
                    >
                      <MoreVertical size={18} />
                    </button>
                    {showDeleteConfirm === chat.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(chat.id);
                          }}
                        >
                          <Trash2 size={16} className="mr-2" />
                          Delete Chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex justify-center items-center h-64 bg-white">
                <p className="text-gray-500">No chats found</p>
              </div>
            )}
            {!loading && currentChats.length > 0 && (
              <div className="mt-6 p-4 mb-5">
                <Pagination
                  currentPage={currentPage}
                  lastPage={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllChats;