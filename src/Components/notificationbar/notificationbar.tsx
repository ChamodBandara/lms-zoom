// import { useState, useEffect, useRef } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import api from '../../services/api';
// import { toast } from 'react-toastify';
// import { database, ref, onValue, push } from '../../firebase';
// import { Paperclip, X } from 'lucide-react';
// import { defaultConfig } from '../../App/configs/common';
// import { update } from 'firebase/database';
// import { serverTimestamp } from 'firebase/database';

// interface Message {
//   text: string;
//   sender: string;
//   timestamp: any;
//   read: boolean;
//   user_id: string;
//   image: any;
// }

// const NotificationBar = ({ data }: { data: { status: string } }) => {
//   const [openModal, setOpenModal] = useState<'profile' | 'chat' | null>(null);
//   const [fileModal, setFileModal] = useState<boolean>(false); // State for file upload popup
//   const [userId, setUserId] = useState<string>('');
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState<string>('');
//   let storedavatar = localStorage.getItem('avatar');
//   const navigate = useNavigate();

//   const [unreadCount, setUnreadCount] = useState(0);

//    const [selectedImage, setSelectedImage] = useState<string | null>(null);
//      const fileInputRef = useRef<HTMLInputElement>(null);
     
//      const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//        const maxFileSize = 4 * 1024 * 1024; // 4MB
   
//        const file = event.target.files?.[0];
//        if (file) {
         
//        if (file.size > maxFileSize) {
//          toast.error(`NIC with image is too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (Max: 4MB)`);
//          return;
//        }
//          const reader = new FileReader();
//          reader.onloadend = () => {
//            const base64String = reader.result as string;
//            setSelectedImage(base64String); // Store Base64 image correctly
//          };
//          reader.readAsDataURL(file); // Convert file to Base64
//        }
//      };

     
//        const [, setUploadedFile] = useState<string | null>(null);
//        const [imagePreview, setImagePreview] = useState<string | null>(null); // State to store image preview URL

//   const handleLogOut = async () => {
//     try {
//       await api.post('/logout');
//       localStorage.removeItem('authToken');
//       toast.success('Logged out successfully');
//       navigate('/');
//     } catch (error) {
//       localStorage.removeItem('authToken');
//       toast.success('Logged out successfully');
//       navigate('/');
//     }
//   };

//   const toggleProfileModal = () => {
//     setOpenModal(openModal === 'profile' ? null : 'profile');
//   };

//   const toggleChatModal = () => {
//     const isChatOpening = openModal !== 'chat';
//     setOpenModal(isChatOpening ? 'chat' : null);

//     if (isChatOpening && userId) {
//       const messagesRef = ref(database, `chats/${userId}`);

//       // Listen for messages data once
//       onValue(
//         messagesRef,
//         (snapshot) => {
//           const messagesData = snapshot.val();

//           if (messagesData) {
//             const updates: Record<string, boolean> = {}; // Object to hold updates

//             // Iterate over messages and prepare updates for unread admin messages
//             Object.entries(messagesData).forEach(([key, message]) => {
//               if (
//                 (message as { sender: string; read: boolean }).sender ===
//                   'admin' &&
//                 !(message as { sender: string; read: boolean }).read
//               ) {
//                 updates[`${key}/read`] = true; // Mark message as read
//               }
//             });

//             // Perform a batch update for all unread messages
//             if (Object.keys(updates).length > 0) {
//               update(messagesRef, updates)
//                 .then(() => {
//                   console.log('All unread messages marked as read.');
//                 })
//                 .catch((error) => {
//                   console.error('Error updating messages:', error);
//                 });
//             } else {
//               console.log('No unread messages to update.');
//             }
//           }
//         },
//         { onlyOnce: true }, // Ensure the listener triggers only once
//       );
//     }
//   };

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       const modal = document.getElementById('profileModal');
//       if (modal && !modal.contains(event.target as Node)) {
//         setOpenModal(null);
//       }
//     };

//     if (openModal === 'profile') {
//       document.addEventListener('mousedown', handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [openModal]);

//   useEffect(() => {
//     const storedUserId = localStorage.getItem('user_id');
//     if (storedUserId) {
//       setUserId(storedUserId);
//     }
//   }, []);

//   useEffect(() => {
//     if (userId) {
//       const messagesRef = ref(database, `chats/${userId}`);
//       onValue(messagesRef, (snapshot) => {
//         const messagesData = snapshot.val();
//         const formattedMessages: any = Object.values(messagesData || {});

//         if (formattedMessages.length === 0) {
//           setMessages([
//             {
//               text: 'Hello! How can we assist you today?',
//               sender: 'admin',
//               timestamp: new Date().toLocaleString(), // Local time
//               read: true,
//               user_id: '',
//               image: '',
//             },
//           ]);
//         } else {
//           setMessages(formattedMessages);
//           const unreadMessages = formattedMessages.filter(
//             (msg: { sender: string; read: boolean }) =>
//               msg.sender === 'admin' && msg.read === false,
//           );
//           setUnreadCount(unreadMessages.length);
//         }
//       });
//     }
//   }, [userId]);

//   const handleSendMessage = () => {
//     if (!newMessage.trim() && !selectedImage) return; // Prevent sending empty messages

//     const message = {
//       text: newMessage,
//       sender: "user",
//       timestamp: serverTimestamp(),
//       read: false,
//       user_id: userId,
//       image: selectedImage || "", // Send image if available
//     };

//     const messagesRef = ref(database, `chats/${userId}`);
//     push(messagesRef, message);

//     // Reset input fields
//     setNewMessage("");
//     setSelectedImage(null);
//   };

//   const handleSendMessageImage = (image: string | null) => {
//     if (!newMessage.trim() && !image) return; // Ensure there's a message or image

//     const message: Message = {
//       text: newMessage,
//       sender: 'user',
//       timestamp: serverTimestamp(),
//       read: false,
//       user_id: userId,
//       image: image || null, // Include image only if provided
//     };

//     const messagesRef = ref(database, `chats/${userId}`);
//     push(messagesRef, message);

//     // Reset the input fields
//     setNewMessage('');
//     setUploadedFile(null);
//     setImagePreview(null);
//   };

//   const handleUploadClick = () => {
//     const fileInput = document.getElementById('file_input') as HTMLInputElement;
//     const file = fileInput?.files?.[0];

//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         const base64String = reader.result as any;

//         // Set the Base64 string and send the message
//         setUploadedFile(base64String);
//         setImagePreview(base64String);
//         console.log(base64String);

//         handleSendMessageImage(base64String);

//         // Close the modal
//         setFileModal(false);
//       };
//       reader.readAsDataURL(file); // Convert file to Base64
//     } else {
//       alert('Please select a file to upload.');
//     }
//   };

//   const chatContainerRef = useRef<HTMLDivElement>(null);
//   const lastMessageRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (lastMessageRef.current) {
//       lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [messages]);

//   function formatTimestamp(timestamp: string | number | Date) {
//     if (timestamp) {
//       const date = new Date(timestamp);
//       const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
//       const formattedTime = `${date.getHours() > 12 ? date.getHours() - 12 : date.getHours()}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
//       return `${formattedDate} ${formattedTime}`;
//     } else {
//       return 'No Timestamp'; // Or any other placeholder you prefer
//     }
//   }
//   const modalRef = useRef<HTMLDivElement | null>(null); // 👈 Ensure proper typing

//   useEffect(() => {
//   const handleClickOutside = (event: MouseEvent) => {
//     const modal = document.getElementById('fileUploadModal');
//     if (modal && !modal.contains(event.target as Node)) {
//       setOpenModal(null);
//     }
//   };

//   // Only add the event listener if the profile modal is open
//   if (openModal === 'profile') {
//     document.addEventListener('mousedown', handleClickOutside);
//   }

//   return () => {
//     document.removeEventListener('mousedown', handleClickOutside);
//   };
// }, [openModal]);

//   return (
//     <div className="w-full">
//       <div className="flex h-20 w-full items-center justify-between rounded-xl bg-[#F9F9F9] px-4 shadow-lg sm:px-6 md:px-10 lg:px-5">
//         <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
//           {data.status === 'notsubmit' || data.status === 'rejected' ? (
//             <>
//               <img
//                 src="/images/warn.png"
//                 alt="Warning icon"
//                 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
//               />
//               <span className="md:text-md lg:text-md text-xs sm:text-sm">
//                 <span className="font-semibold">Action required: </span>
//                 Verify your identity to resume activity on Everest Online
//                 Education
//                 <Link
//                   to="/profile"
//                   className="ml-1 font-semibold text-blue-600 underline hover:text-blue-800"
//                   aria-label="Verify your identity to resume activity"
//                 >
//                   Get started.
//                 </Link>
//               </span>
//             </>
//           ) : (
//             // Else part (empty flex container)
//             <div className="flex flex-row items-center gap-2 md:gap-4">
//             <span className="text-xl font-semibold uppercase text-[#000000BD] sm:text-2xl md:text-3xl">
//              Dashboard
//             </span>
//           </div>
//           )}
//         </div>

//         <div className="relative flex items-center justify-between gap-4 rounded-[72px] bg-[#6F147B] px-3 py-2 sm:px-5 sm:py-3 md:h-16 md:px-7 md:py-3">
//           <div className="relative">
//             <img
//               src="/images/call-center-agent.png"
//               alt="chat icon"
//               className="mb-1 max-h-7 max-w-8 cursor-pointer sm:max-h-10 sm:max-w-10 md:max-h-10 md:max-w-10"
//               onClick={toggleChatModal}
//             />
//             {unreadCount > 0 && (
//               <span className="absolute right-0 top-1 flex h-5 w-5 -translate-y-1/2 translate-x-1/2 transform items-center justify-center rounded-full bg-red-500 text-xs text-white">
//                 {unreadCount}
//               </span>
//             )}
//           </div>

//           {storedavatar && storedavatar !== 'null' ? (
//             <img
//               src={`${defaultConfig.BASE_ASSEST_URL}/${storedavatar}`}
//               alt="User Avatar"
//               className="aspect-square h-8 w-8 cursor-pointer rounded-full object-cover sm:h-10 sm:w-10 md:h-12 md:w-12"
//               onClick={toggleProfileModal}
//             />
//           ) : (
//             <img
//               src="/images/profile-1.png"
//               alt="Default Profile Pic"
//               className="max-h-8 max-w-8 cursor-pointer rounded-full sm:max-h-10 sm:max-w-10 md:max-h-12 md:max-w-12"
//               onClick={toggleProfileModal}
//             />
//           )}
//      {openModal === 'chat' && (
//         <div
//           ref={modalRef}
//           className="fixed bottom-0 right-4 z-50 mb-2 h-auto w-full max-w-[90vw] rounded-lg bg-white p-4 shadow-lg sm:max-w-lg md:right-10 lg:right-8"
//           style={{
//             height: 'auto',
//             maxHeight: '90vh', // Adjust based on screen size
//           }}
//         >
//           <div className="flex items-center justify-between">
//             <h3 className="text-lg font-semibold text-[#6F147B]">
//               Chat Supports
//             </h3>
//             <button
//               className="text-black hover:text-theme"
//               onClick={toggleChatModal}
//             >
//               <X size={18} />
//             </button>
//           </div>
//           <div
//             className="hide-scrollbar mt-3 h-[60vh] overflow-y-auto border border-gray-300 p-5 sm:h-[50vh] md:h-[55vh] lg:h-[60vh] 2xl:h-[70vh]"
//             ref={chatContainerRef}
//           >
//             {messages.map((message, index) => (
//               <div
//                 key={index}
//                 className={`mb-2 flex items-start ${message.sender === 'admin' ? '' : 'justify-end'}`}
//               >
//                 {message.sender === 'admin' && (
//                   <img
//                     src="/images/bot.png"
//                     alt="bot"
//                     className="h-6 w-6 rounded-full"
//                   />
//                 )}
//                  <div
//                   className={`ml-2 w-full max-w-full rounded-lg ${
//                     message.sender === "admin"
//                       ? "bg-gray-100 text-gray-800"
//                       : "bg-[#6F147B] text-white"
//                   } overflow-hidden break-words p-2 text-xs`}
//                 >
//                   {/* Show Image if Available */}
//                   {message.image && (
//                     <img
//                       src={message.image}
//                       alt="message"
//                       className="mt-2 max-h-48 w-auto rounded-lg"
//                     />
//                   )}

//                   {/* Show Text if Available */}
//                   {message.text && <span className="block mt-1">{message.text}</span>}

//                   {/* Timestamp */}
//                   <div className="mt-1 text-xs text-gray-400">
//                     {formatTimestamp(message.timestamp)}
//                   </div>
//                 </div>
//                 {message.sender === 'user' &&
//                   (storedavatar && storedavatar !== 'null' ? (
//                     <img
//                       src={`${defaultConfig.BASE_ASSEST_URL}/${storedavatar}`}
//                       alt="user"
//                       className="ml-1 h-6 w-6 rounded-full"
//                     />
//                   ) : (
//                     <img
//                       src="images/profile_picture.png"
//                       alt="user"
//                       className="h-6 w-6"
//                     />
//                   ))}
//               </div>
//             ))}
//             <div ref={lastMessageRef}></div>
//           </div>
//           <div className="mt-3 flex items-center gap-1 md:gap-2">
//       {/* Image Preview (if selected) */}
//       {selectedImage && (
//         <div className="relative">
//           <img
//             src={selectedImage}
//             alt="Selected"
//             className="h-12 w-12 rounded-lg object-cover"
//           />
//           <button
//             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
//             onClick={() => setSelectedImage(null)}
//           >
//             ✕
//           </button>
//         </div>
//       )}

//       {/* Text Input */}
//       <input
//         type="text"
//         className="min-w-0 flex-1 rounded-lg border p-2 text-sm"
//         placeholder="Type your message..."
//         value={newMessage}
//         onChange={(e) => setNewMessage(e.target.value)}
//         onKeyDown={(e) => {
//           if (e.key === "Enter") {
//             handleSendMessage();
//           }
//         }}
//       />

//       {/* Hidden File Input */}
//       <input
//         type="file"
//         accept="image/*"
//         className="hidden"
//         ref={fileInputRef}
//         onChange={handleImageSelect}
//       />

//       {/* Image Picker Button */}
//       <button
//         className="rounded-lg bg-[#6F147B] p-2 text-white"
//         onClick={() => fileInputRef.current?.click()}
//       >
//         <Paperclip size={16} color="#ffffff" />
//       </button>

//       {/* Send Button */}
//       <button
//         className="rounded-lg bg-[#6F147B] p-2 text-sm text-white"
//         onClick={handleSendMessage}
//       >
//         Send
//       </button>
//     </div>
//         </div>
//       )}


//           {openModal === 'profile' && (
//             <div
//               id="profileModal"
//               className="absolute right-0 top-14 z-50 w-56 rounded-lg bg-white p-6 shadow-lg lg:top-20"
//             >
//               <button
//                 onClick={() => setOpenModal(null)}
//                 className="absolute right-2 top-3 text-gray-500 hover:text-gray-800"
//               >
//                 <X size={18} color="#6F147B" />
//               </button>

//               <h3 className="mt-1 text-sm text-gray-900">
//                 <Link to="/profile" className="hover:text-theme">
//                   My Profile
//                 </Link>
//               </h3>

//               <button
//                 onClick={handleLogOut}
//                 className="mt-4 w-full rounded-lg bg-[#6F147B] py-2 text-sm text-white"
//               >
//                 Log Out
//               </button>
//             </div>
//           )}

//           {fileModal && (
//             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//               <div className="w-full rounded-lg bg-white p-6 dark:bg-gray-800 lg:w-1/2">
//                 <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
//                   Upload a Image
//                 </h3>
//                 <input
//                   type="file"
//                   className="block w-full cursor-pointer rounded-lg border p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
//                   id="file_input" // File input with ID
//                 />

//                 {/* <div className="flex w-full items-center justify-center">
//                   <label
//                     htmlFor="file-upload"
//                     className="w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-center transition duration-300 ease-in-out hover:bg-gray-100"
//                   >
//                     <span className="text-sm font-medium text-gray-600">
//                       Choose a file
//                     </span>
//                     <input
//                       id="file-upload"
//                       type="file"
//                       accept="avatar"
//                       onChange={handleFileChange}
//                       className="hidden"
//                       required
//                     />
//                   </label>
//                 </div> */}
//                 {imagePreview && (
//                   <div className="mt-4">
//                     <h4 className="text-sm font-semibold">Preview:</h4>
//                     <img
//                       src={imagePreview}
//                       alt="Preview"
//                       className="mt-2 h-28"
//                     />
//                   </div>
//                 )}
//                 <div className="mt-4 flex justify-between">
//                   <button
//                     className="rounded-lg bg-gray-500 px-4 py-2 text-sm text-white"
//                     onClick={() => {
//                       setFileModal(false);
//                       setUploadedFile(null);
//                       setImagePreview(null);
//                     }}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     className="rounded-lg bg-[#6F147B] px-4 py-2 text-sm text-white"
//                     onClick={handleUploadClick} // Handle file conversion on click
//                   >
//                     Upload
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NotificationBar;
// // function moment() {
// //   throw new Error('Function not implemented.');
// // }
