import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import {
  Album,
  ChevronLeft,
  Paperclip,
  TicketPercent,
  Video,
  X,
} from 'lucide-react';
import { database, ref, onValue, push } from '../../firebase';
import { defaultConfig } from '../../App/configs/common';
import { off, onChildAdded, update, remove } from 'firebase/database';
import { serverTimestamp } from 'firebase/database';
import { useChatContext } from '../../context/ChatContext';

interface HeadingbarProps {
  title: string;
}
interface Message {
  text: string;
  sender: string;
  timestamp: any;
  read: boolean;
  user_id: string;
  image: string;
}

const SUBJECT_LIST = ['Payment Inquiry', 'Technical Support', 'Other'];

const Headingbar: React.FC<HeadingbarProps> = ({ title }) => {
  const { openModal, setOpenModal, subjectFromOutside, setSubjectFromOutside } =
    useChatContext();

  const [fileModal, setFileModal] = useState<boolean>(false); // State for file upload popup
  const [userId, setUserId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [] = useState('');
  const [] = useState<
    {
      sender: 'user' | 'admin';
      text: string;
      timestamp: string;
    }[]
  >([]);
  // Add this ref at the top of your component
  const subjectListenerRef = useRef<any>(null);

  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjectMode, setSubjectMode] = useState<boolean>(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const maxFileSize = 4 * 1024 * 1024; // 4MB

    const file = event.target.files?.[0];
    if (file) {
      if (file.size > maxFileSize) {
        toast.error(
          `NIC with image is too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (Max: 4MB)`,
        );
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String); // Store Base64 image correctly
      };
      reader.readAsDataURL(file); // Convert file to Base64
    }
  };

  // const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    if (openModal === 'chat' && subjectFromOutside) {
      setSelectedSubject(subjectFromOutside); // auto-enter subject
      setSubjectMode(false); // skip subject list
      setSubjectFromOutside(null); // reset
    }
  }, [openModal, subjectFromOutside]);

  const [, setUploadedFile] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // State to store image preview URL
  let storedavatar = localStorage.getItem('avatar');

  function formatTimestamp(timestamp: string | number | Date) {
    if (timestamp) {
      const date = new Date(timestamp);
      const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      const formattedTime = `${date.getHours() > 12 ? date.getHours() - 12 : date.getHours()}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
      return `${formattedDate} ${formattedTime}`;
    } else {
      return 'No Timestamp'; // Or any other placeholder you prefer
    }
  }

  const toggleProfileModal = () => {
    setOpenModal(openModal === 'profile' ? null : 'profile');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.getElementById('profileModal');
      if (modal && !modal.contains(event.target as Node)) {
        setOpenModal(null);
      }
    };

    if (openModal === 'profile') {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openModal]);

  // const toggleChatModal1 = () => {
  //   const isChatOpening = openModal !== 'chat';
  //   setOpenModal(isChatOpening ? 'chat' : null);

  //   if (isChatOpening && userId) {
  //     const messagesRef = ref(database, `chats/${userId}`);

  //     // Listen for messages data once
  //     onValue(
  //       messagesRef,
  //       (snapshot) => {
  //         const messagesData = snapshot.val();

  //         if (messagesData) {
  //           const updates: Record<string, boolean> = {}; // Object to hold updates

  //           // Iterate over messages and prepare updates for unread admin messages
  //           Object.entries(messagesData).forEach(([key, message]) => {
  //             if (
  //               (message as { sender: string; read: boolean }).sender ===
  //                 'admin' &&
  //               !(message as { sender: string; read: boolean }).read
  //             ) {
  //               updates[`${key}/read`] = true; // Mark message as read
  //             }
  //           });

  //           // Perform a batch update for all unread messages
  //           if (Object.keys(updates).length > 0) {
  //             update(messagesRef, updates)
  //               .then(() => {
  //                 console.log('All unread messages marked as read.');
  //               })
  //               .catch((error) => {
  //                 console.error('Error updating messages:', error);
  //               });
  //           } else {
  //             console.log('No unread messages to update.');
  //           }
  //         }
  //       },
  //       { onlyOnce: true }, // Ensure the listener triggers only once
  //     );
  //   }
  // };
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);

  const handleDeleteSubject = async (subject: string) => {
    if (!userId || !subject) return;

    const subjectRef = ref(database, `chats/${userId}/${subject}`);
    try {
      await remove(subjectRef);

      // UI updates
      setSubjects((prev) => prev.filter((subj) => subj !== subject));
      if (selectedSubject === subject) {
        setSelectedSubject(null);
      }
      setSubjectToDelete(null);
      toast.success(`"${subject}" chat deleted successfully!`);
    } catch (error) {
      toast.error('Failed to delete subject. Try again.');
    }
  };
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>(
    {},
  );
  // const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!userId) return;

    const userChatsRef = ref(database, `chats/${userId}`);

    const unsubscribe = onValue(userChatsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const subjectNames = Object.keys(data);
        const newUnreadCounts: { [key: string]: number } = {};
        let totalUnread = 0;

        subjectNames.forEach((subject) => {
          const msgs = Object.values(data[subject] || {}) as Message[];
          const unread = msgs.filter(
            (msg) => msg.sender === 'admin' && !msg.read,
          ).length;

          newUnreadCounts[subject] = unread;
          totalUnread += unread;
        });

        setUnreadCounts(newUnreadCounts);
        // setUnreadCount(totalUnread);
      } else {
        setUnreadCounts({});
        // setUnreadCount(0);
      }
    });

    return () => unsubscribe(); // cleanup on unmount
  }, [userId]);

  const toggleChatModal = () => {
    const isChatOpening = openModal !== 'chat';
    setOpenModal(isChatOpening ? 'chat' : null);

    if (isChatOpening && userId) {
      const userChatsRef = ref(database, `chats/${userId}`);
      onValue(
        userChatsRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const subjectNames = Object.keys(data);
            setSubjects(subjectNames);

            // Track unread count per subject
            const newUnreadCounts: { [key: string]: number } = {};
            let totalUnread = 0;

            subjectNames.forEach((subject) => {
              const msgs = Object.values(data[subject] || {}) as Message[];
              const unread = msgs.filter(
                (msg) => msg.sender === 'admin' && !msg.read,
              ).length;

              newUnreadCounts[subject] = unread;
              totalUnread += unread;
            });

            setUnreadCounts(newUnreadCounts); // for badge per subject
            // setUnreadCount(totalUnread);      // for global icon badge
          } else {
            setSubjects([]);
            setUnreadCounts({});
            // setUnreadCount(0);
          }

          setSubjectMode(true);
          setSelectedSubject(null);
        },
        { onlyOnce: true },
      );
    }
  };

  const selectSubject = (subject: string) => {
    setSelectedSubject(subject);
    setSubjectMode(false);

    // Remove previous listener if exists
    if (subjectListenerRef.current) {
      subjectListenerRef.current(); // unsubscribe
    }

    const messagesRef = ref(database, `chats/${userId}/${subject}`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messagesData = snapshot.val();
      const formattedMessages: any = Object.values(messagesData || {});
      setMessages(formattedMessages);

      const updates: Record<string, boolean> = {};
      if (messagesData) {
        Object.entries(messagesData).forEach(([key, message]) => {
          if (
            (message as Message).sender === 'admin' &&
            !(message as Message).read
          ) {
            updates[`${key}/read`] = true;
          }
        });
        if (Object.keys(updates).length > 0) {
          update(messagesRef, updates);
        }
      }
    });

    subjectListenerRef.current = unsubscribe;
  };
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  // useEffect(() => {
  //   if (userId ||!selectedSubject ) {

  //     const messagesRef = ref(database, `chats/${userId}/${selectedSubject}`);

  //     onValue(messagesRef, (snapshot) => {
  //       const messagesData = snapshot.val();
  //       const formattedMessages: any = Object.values(messagesData || {});

  //       if (formattedMessages.length === 0) {
  //         setMessages([
  //           {
  //             text: 'Hello! How can we assist you today?',
  //             sender: 'admin',
  //             timestamp:  new Date().toLocaleString(), // Local time
  //             read: true,
  //             user_id: '',
  //             image: '',
  //           },
  //         ]);
  //       } else {
  //         setMessages(formattedMessages);

  //         const unreadMessages = formattedMessages.filter(
  //           (msg: { sender: string; read: boolean }) =>
  //             msg.sender === 'admin' && msg.read === false,
  //         );
  //         setUnreadCount(unreadMessages.length);
  //       }
  //     });
  //   }
  // }, [userId]);

  const navigate = useNavigate();

  const modalRef = useRef<HTMLDivElement | null>(null); // 👈 Ensure proper typing

  const handleLogOut = async () => {
    try {
      await api.post('/logout');
      localStorage.removeItem('authToken');
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      localStorage.removeItem('authToken');
      toast.success('Logged out successfully');
      navigate('/');
    }
  };

  useEffect(() => {
    if (!userId || !selectedSubject) return;

    const messagesRef = ref(database, `chats/${userId}/${selectedSubject}`);

    // Clear existing messages first
    setMessages([]);

    const handleNewMessage = (snapshot: { val: () => any }) => {
      const msg = snapshot.val();
      setMessages((prev) => [...prev, msg]);
    };

    onChildAdded(messagesRef, handleNewMessage);

    // Cleanup
    return () => {
      off(messagesRef);
    };
  }, [userId, selectedSubject]);

  const handleSendMessage = () => {
    if ((!newMessage.trim() && !selectedImage) || !selectedSubject) return;

    const message = {
      text: newMessage,
      sender: 'user',
      timestamp: serverTimestamp(),
      read: false,
      user_id: userId,
      image: selectedImage || '',
    };

    const messagesRef = ref(database, `chats/${userId}/${selectedSubject}`);
    push(messagesRef, message);

    // Reset input fields
    setNewMessage('');
    setSelectedImage(null);
  };

  const handleSendMessageImage = (image: any | null) => {
    if (!newMessage.trim() && !image) return; // Ensure there's a message or image

    const message: Message = {
      text: newMessage,
      sender: 'user',
      timestamp: serverTimestamp(),
      read: false,
      user_id: userId,
      image: image || null, // Include image only if provided
    };

    const messagesRef = ref(database, `chats/${userId}/${selectedSubject}`);
    push(messagesRef, message);

    // Reset the input fields
    setNewMessage('');
    setUploadedFile(null);
    setImagePreview(null);
  };

  const handleUploadClick = () => {
    const fileInput = document.getElementById('file_input') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;

        // Set the Base64 string and send the message
        setUploadedFile(base64String);
        setImagePreview(base64String);
        console.log(base64String);

        handleSendMessageImage(base64String);

        // Close the modal
        setFileModal(false);
      };
      reader.readAsDataURL(file); // Convert file to Base64
    } else {
      alert('Please select a file to upload.');
    }
  };

  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.getElementById('fileUploadModal');
      if (modal && !modal.contains(event.target as Node)) {
        setOpenModal(null);
      }
    };

    // Only add the event listener if the profile modal is open
    if (openModal === 'profile') {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openModal]);

  return (
    <div>
      <div className="mb-2 flex h-20 w-full items-center justify-between rounded-xl bg-[#F9F9F9] p-5 shadow-[0_20px_50px_#70147c66]">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex flex-row items-center gap-2 md:gap-4">
              <span className="text-xl font-semibold uppercase text-[#000000BD] sm:text-2xl md:text-3xl">
                {title}
              </span>
            </div>

            
          </div>

          <div className="ml-0 flex h-28 w-50 items-center justify-center p-5">
          <img
            src="/images/logo.png"
            alt="Logo"
            className="h-full w-full object-contain"
          />
        </div>
          <div className="hidden items-center gap-4 px-4 md:flex">
            <Link
              to="/liveclass"
              className="flex items-center gap-2 rounded-3xl p-2 transition-colors hover:bg-purple-600  bg-theme"
            >
              <Video className="h-4 w-4 text-white ml-2" />
              <span className="text-sm font-medium text-white mr-2">Live Classes</span>
            </Link>

            <Link
              to="/all-class"
              className="flex items-center gap-2 rounded-3xl p-2 transition-colors hover:bg-purple-600  bg-theme"
            >
              <Album className="h-4 w-4 text-white ml-2" />
              <span className="text-sm font-medium text-white mr-2">All Classes</span>
            </Link>

            <Link
              to="/studypacks"
              className="flex items-center gap-2 rounded-3xl p-2 transition-colors hover:bg-purple-600  bg-theme"
            >
              <Album className="h-4 w-4 text-white ml-2" />
              <span className="text-sm font-medium text-white mr-2">Study Packs</span>
            </Link>

            <Link
              to="/classpurchase"
              className="flex items-center gap-2 rounded-3xl p-2 transition-colors hover:bg-purple-600  bg-theme"
            >
              <TicketPercent className="h-4 w-4 text-white ml-2" />
              <span className="text-sm font-medium text-white mr-2">Purchased Classes</span>
            </Link>

            <Link
              to="/tutediscussions"
              className="flex items-center gap-2 rounded-3xl p-2 transition-colors hover:bg-purple-600  bg-theme"
            >
              <TicketPercent className="h-4 w-4 text-white ml-2" />
              <span className="text-sm font-medium text-white mr-2">Tute Discussions</span>
            </Link>

          </div>
        </div>
        <div className="relative flex items-center justify-between gap-4 rounded-[72px] bg-[#6F147B] px-3 py-2 sm:px-5 sm:py-3 md:h-16 md:px-7 md:py-3">
          {storedavatar && storedavatar !== 'null' ? (
            <img
              src={`${defaultConfig.BASE_ASSEST_URL}/${storedavatar}`}
              alt="User Avatar"
              className="aspect-square h-8 w-8 cursor-pointer rounded-full object-cover sm:h-10 sm:w-10 md:h-12 md:w-12"
              onClick={toggleProfileModal}
            />
          ) : (
            <img
              src="/images/profile_picture.png"
              alt="Default Profile Pic"
              className="max-h-8 max-w-8 cursor-pointer rounded-full sm:max-h-10 sm:max-w-10 md:max-h-12 md:max-w-12"
              onClick={toggleProfileModal}
            />
          )}
        </div>
      </div>

      {openModal === 'profile' && (
        <div
          id="profileModal"
          className="absolute right-10 top-40 z-50 w-56 rounded-lg bg-white p-6 shadow-lg lg:top-24"
        >
          <button
            onClick={() => setOpenModal(null)}
            className="absolute right-2 top-3 text-gray-500 hover:text-gray-800"
          >
            <X size={18} color="#6F147B" />
          </button>

          <h3 className="mt-1 text-sm text-gray-900">
            <Link to="/profile" className="hover:text-theme">
              My Profile
            </Link>
          </h3>

          <button
            onClick={handleLogOut}
            className="mt-4 w-full rounded-lg bg-[#6F147B] py-2 text-sm text-white"
          >
            Log Out
          </button>
        </div>
      )}

      {subjectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-[90%] max-w-sm rounded-lg bg-white p-6 text-center shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Delete Chat</h2>
            <p className="mb-6 text-sm text-gray-600">
              Are you sure you want to delete the chat for{' '}
              <strong>{subjectToDelete}</strong>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="rounded bg-gray-300 px-4 py-2 text-sm hover:bg-gray-400"
                onClick={() => setSubjectToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="rounded bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
                onClick={() => handleDeleteSubject(subjectToDelete)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {openModal === 'chat' && (
        <div
          ref={modalRef}
          className="fixed bottom-0 right-4 z-50 mb-2 h-auto w-full max-w-[90vw] rounded-lg bg-white p-4 shadow-lg sm:max-w-lg md:right-10 lg:right-8"
          style={{
            height: 'auto',
            maxHeight: '90vh',
          }}
        >
          {subjectMode ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#6F147B]">
                  Chat Support
                </h3>
                <button onClick={toggleChatModal}>
                  <X size={18} />
                </button>
              </div>
              <div className="mt-3 space-y-3">
                <h4 className="text-sm font-semibold">Subject History</h4>
                <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                  {subjects.map((subject, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded border px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      <button
                        className="w-full text-left"
                        onClick={() => selectSubject(subject)}
                      >
                        {subject}
                      </button>
                      {unreadCounts[subject] > 0 && (
                        <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                          {unreadCounts[subject]}
                        </span>
                      )}

                      <button
                        className="ml-2 text-red-500 hover:text-red-700"
                        onClick={() => setSubjectToDelete(subject)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <h5 className="mb-2 text-sm font-semibold">
                    Start New Subject Chat
                  </h5>
                  {SUBJECT_LIST.map((subj, i) => (
                    <button
                      key={i}
                      className="mb-2 w-full rounded bg-[#6F147B] px-3 py-2 text-sm text-white hover:bg-opacity-80"
                      onClick={() => selectSubject(subj)}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Chat Box UI remains unchanged but inside selectedSubject context */}

              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#6F147B]">
                  Chat Support
                </h3>

                <div className="flex items-center gap-2">
                  {!subjectMode && (
                    <button
                      onClick={() => setSubjectMode(true)}
                      className="p-1 text-gray-600 hover:text-[#6F147B]"
                    >
                      <ChevronLeft size={18} />
                    </button>
                  )}
                  <button
                    onClick={toggleChatModal}
                    className="p-1 text-gray-600 hover:text-[#6F147B]"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="hide-scrollbar mt-3 h-[60vh] overflow-y-auto border border-gray-300 p-5 sm:h-[50vh] md:h-[55vh] lg:h-[60vh] 2xl:h-[70vh]">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-2 flex items-start ${message.sender === 'admin' ? '' : 'justify-end'}`}
                  >
                    {message.sender === 'admin' && (
                      <img
                        src="/images/bot.png"
                        alt="bot"
                        className="h-6 w-6 rounded-full"
                      />
                    )}
                    <div
                      className={`ml-2 w-full max-w-full rounded-lg ${
                        message.sender === 'admin'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-[#6F147B] text-white'
                      } overflow-hidden break-words p-2 text-xs`}
                    >
                      {message.image && (
                        <img
                          src={message.image}
                          alt="message"
                          className="mt-2 max-h-48 w-auto rounded-lg"
                        />
                      )}
                      {message.text && (
                        <span className="mt-1 block">{message.text}</span>
                      )}
                      <div className="mt-1 text-xs text-gray-400">
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>
                    {message.sender === 'user' && (
                      <img
                        src={
                          storedavatar && storedavatar !== 'null'
                            ? `${defaultConfig.BASE_ASSEST_URL}/${storedavatar}`
                            : 'images/profile_picture.png'
                        }
                        alt="user"
                        className="ml-1 h-6 w-6 rounded-full"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-1 md:gap-2">
                {selectedImage && (
                  <div className="relative">
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <button
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-xs text-white"
                      onClick={() => setSelectedImage(null)}
                    >
                      ✕
                    </button>
                  </div>
                )}
                <input
                  type="text"
                  className="min-w-0 flex-1 rounded-lg border p-2 text-sm"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                />
                <button
                  className="rounded-lg bg-[#6F147B] p-2 text-white"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip size={16} color="#ffffff" />
                </button>
                <button
                  className="rounded-lg bg-[#6F147B] p-2 text-sm text-white"
                  onClick={handleSendMessage}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {fileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full rounded-lg bg-white p-6 dark:bg-gray-800 lg:w-1/2">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Upload a Image
            </h3>
            <input
              type="file"
              className="block w-full cursor-pointer rounded-lg border p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
              id="file_input" // File input with ID
            />

            {imagePreview && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold">Preview:</h4>
                <img src={imagePreview} alt="Preview" className="mt-2 h-28" />
              </div>
            )}
            <div className="mt-4 flex justify-between">
              <button
                className="rounded-lg bg-gray-500 px-4 py-2 text-sm text-white"
                onClick={() => {
                  setFileModal(false);
                  setUploadedFile(null);
                  setImagePreview(null);
                }}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-[#6F147B] px-4 py-2 text-sm text-white"
                onClick={handleUploadClick} // Handle file conversion on click
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Headingbar;
