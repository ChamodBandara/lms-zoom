// import { Paperclip } from 'lucide-react';
// import { useState, useEffect, useRef } from 'react';

// interface adminMessage {
//   text: string;
//   time: string;
//   senderName: string;
//   isAdmin: boolean;
// }

// interface selectedUser {
//   text: string;
//   time: string;
//   senderName: string;
//   isAdmin: boolean;
// }

// function Chat() {
//   const users = [
//     { id: 1, name: 'Admin', message: 'Welcome to the chat!' },
//     { id: 2, name: 'Ruchira', message: 'Hey! How are you?' },
//     { id: 3, name: 'Aveen', message: "Let's catch up later." },
//     { id: 4, name: 'Kushan', message: 'Did you see the news?' },
//     { id: 5, name: 'Kavindu', message: 'Meeting at 3 PM.' },
//     { id: 6, name: 'Isuru', message: "Can't wait for the trip!" },
//   ];

//   const [selectedUser, setSelectedUser] = useState<selectedUser[]>([]);
//   const [messages, setMessages] = useState<adminMessage[]>([]);
//   const [input, setInput] = useState('');
//   const [image, setImage] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [formData, setFormData] = useState({
//     name: '',
//     color: '',
//     location: '',
//     hobby: '',
//     food: '',
//   });
//   const [fileModal, setFileModal] = useState(false);
//   const [imagePreview, setImagePreview] = useState(null);

//   const messageEndRef = useRef(null);

//   useEffect(() => {
//     if (selectedUser && messages.length === 0) {
//       const adminMessage = {
//         text: 'Hello, how can I assist you?',
//         time: new Date().toLocaleTimeString(),
//         senderName: 'Admin',
//         isAdmin: true,
//       };
//       setMessages([adminMessage]);
//     }
//   }, [selectedUser, messages]);

//   useEffect(() => {
//     if (messageEndRef.current) {
//       messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [messages]);

//   const handleSendMessage = () => {
//     if (input.trim() || image) {
//       const newMessage = {
//         text: input,
//         image,
//         time: new Date().toLocaleTimeString(),
//         senderName: 'You',
//         isAdmin: false,
//       };
//       setMessages((prevMessages) => [...prevMessages, newMessage]);
//       setInput('');

//       const followUpReply = {
//         text: `You said: "${input}". How can I assist you further?`,
//         time: new Date().toLocaleTimeString(),
//         senderName: 'Admin',
//         isAdmin: true,
//       };
//       setMessages((prevMessages) => [...prevMessages, followUpReply]);
//     }
//   };

//   const handleSubmitForm = () => {
//     const newUser = {
//       id: users.length + 1,
//       name: formData.name || 'New User',
//       message: 'New conversation started',
//     };
//     users.push(newUser);
//     setSelectedUser(newUser);
//     setShowForm(false);
//     setFormData({
//       name: '',
//       color: '',
//       location: '',
//       hobby: '',
//       food: '',
//     });
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImage(file);
//       setImagePreview(URL.createObjectURL(file));
//     }
//   };

//   const handleUploadClick = () => {
//     if (image) {
//       console.log('Uploading file:', image);
//     }
//     setFileModal(false);
//     setImagePreview(null);
//     setImage(null);
//   };

//   const handleKeyDown = (e: { key: string; preventDefault: () => void; }) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   return (
//     <div className="mx-auto h-full w-full max-w-2xl sm:min-h-56 rounded-lg border border-gray-400 bg-white p-4 shadow-md md:max-w-4xl lg:max-w-5xl">
//       {showForm ? (
//         <div>
//           <h3 className="text-lg font-semibold text-[#6F147B]">
//             Answer These Questions
//           </h3>
//           {Object.keys(formData).map((key, index) => (
//             <div key={key} className="mb-2">
//               <p className="mt-4 text-xs font-medium">
//                 {index + 1}.{' '}
//                 {
//                   [
//                     'What is your name?',
//                     'What is your favorite color?',
//                     'Where are you from?',
//                     'What is your hobby?',
//                     'What is your favorite food?',
//                   ][index]
//                 }
//               </p>
//               <input
//                 type="text"
//                 placeholder="Answer here"
//                 value={formData[key]}
//                 onChange={(e) =>
//                   setFormData({ ...formData, [key]: e.target.value })
//                 }
//                 className="mt-1 w-full rounded border p-2 text-xs"
//               />
//             </div>
//           ))}
//           <button
//             onClick={handleSubmitForm}
//             className="mt-3 w-full rounded bg-[#6F147B] p-2 text-xs text-white"
//           >
//             Submit
//           </button>
//         </div>
//       ) : selectedUser ? (
//         <div className="mt-1 flex flex-col h-[50vh] sm:h-full">
//           <div className="mb-4 flex items-center justify-between">
//             <h3 className="text-lg font-semibold text-[#6F147B]">{selectedUser.name}</h3>
//             <button
//               onClick={() => setSelectedUser()}
//               className="text-sm text-red-500"
//             >
//               Back
//             </button>
//           </div>

//           <div className="flex-1 overflow-y-auto mb-4 p-4 custom-scrollbar bg-gray-50 rounded-lg" >
//             {messages.map((msg :any, index) => (
//               <div
//                 key={index}
//                 className={`mb-2 flex items-start gap-2 ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}
//               >
//                 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 font-bold text-white">
//                   <img src="/images/profile-1.png" alt="" className="rounded-full" />
//                 </div>
//                 <div className="flex max-w-[80%] flex-col">
//                   <div className="flex items-center gap-1">
//                     <p className="text-sm font-semibold">{msg.senderName}</p>
//                     <p className="text-[10px] text-gray-500">{msg.time}</p>
//                   </div>
//                   {msg.text && (
//                     <p className={`overflow-hidden break-words rounded p-2 text-xs ${msg.isAdmin ? 'bg-purple-200' : 'bg-gray-200'}`}>
//                       {msg.text}
//                     </p>
//                   )}
//                   {msg.image && (
//                     <img
//                       src={URL.createObjectURL(msg.image)}
//                       alt="Uploaded"
//                       className="mb-1 h-16 w-16 rounded-lg"
//                     />
//                   )}
//                 </div>
//               </div>
//             ))}
//             <div ref={messageEndRef} />
//           </div>

//           <div className="flex items-center gap-2">
//             <input
//               type="text"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={handleKeyDown}
//               placeholder="Type a message..."
//               className="flex-1 rounded border p-2 text-sm"
//             />
//             <button
//               className="rounded-lg bg-[#6F147B] px-3 py-2 text-white"
//               onClick={() => setFileModal(true)}
//             >
//               <Paperclip size={18} color="#ffffff" />
//             </button>
//             <button
//               onClick={handleSendMessage}
//               className="rounded bg-[#6F147B] p-2 text-sm text-white"
//             >
//               Send
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div>
//           <div className="mb-4 flex items-center justify-between p-4">
//             <h3 className="text-lg font-semibold text-[#6F147B]">
//               Chat Supports
//             </h3>
//             <button
//               onClick={() => setShowForm(true)}
//               className="rounded bg-[#6F147B] p-2 text-xs text-white"
//             >
//               New Chat
//             </button>
//           </div>
//           <div className="custom-scrollbar max-h-[58vh] overflow-y-auto border border-gray-200">
//             {users.map((user:any) => (
//               <div
//                 key={user.id}
//                 onClick={() => setSelectedUser(user)}
//                 className="flex cursor-pointer items-center border-b border-gray-200 p-3 transition hover:bg-purple-200"
//               >
//                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 font-bold text-white">
//                   <img
//                     src="/images/profile-1.png"
//                     alt=""
//                     className="rounded-full"
//                   />
//                 </div>
//                 <div className="ml-4">
//                   <p className="text-sm font-medium capitalize text-[#6F147B]">
//                     {user.name}
//                   </p>
//                   <p className="break-words text-xs text-gray-500">
//                     {user.message}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//       {fileModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="w-80 rounded-lg bg-white p-4">
//             <h3 className="mb-2 text-center font-medium">Upload a file</h3>
//             <input
//               type="file"
//               onChange={handleFileChange}
//               className="mb-2 w-full rounded border p-2"
//             />
//             {imagePreview && (
//               <img
//                 src={imagePreview}
//                 alt="Preview"
//                 className="mb-2 h-20 w-20"
//               />
//             )}
//             <div className="flex justify-between">
//               <button
//                 onClick={() => setFileModal(false)}
//                 className="text-sm text-gray-500 hover:text-black"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleUploadClick}
//                 className="rounded bg-[#6F147B] p-2 text-sm text-white"
//               >
//                 Upload
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Chat;