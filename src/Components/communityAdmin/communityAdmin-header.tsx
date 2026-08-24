import { useState, ChangeEvent } from 'react';
import { Camera, X, MessageCircleHeart } from 'lucide-react';
import { toast } from 'react-toastify';
// import api from '../../services/api'; // Your Axios instance
import axios from 'axios';
import { defaultConfig } from '../../App/configs/common';

function CommunityAdminHeader({ refreshPosts }: { refreshPosts: () => void }) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // State for the uploaded image file
  const [title, setTitle] = useState(''); // State for the post title
  const [description, setDescription] = useState(''); // State for the post description
  const [] = useState(false);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file); // Save the file for API submission
      const newPreview = URL.createObjectURL(file);
      setImagePreview(newPreview); // Show image preview
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
  };


  const handleSubmit = async () => {
    if (!title || !description || !selectedFile) {
      toast.error('Please fill in all fields and upload an image.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('post_Image', selectedFile);

    try {
      const response = await axios.get(`${defaultConfig.BASE_API_URL}/admin/getAllPosts`, {
        // params: filters,
      });

      if (response.data.success) {
        toast.success('Post added successfully!');
        setTitle('');
        setDescription('');
        removeImage(); // Clear image and preview
        refreshPosts();
      } else {
        toast.error('Failed to add post. Please try again.');
      }
    } catch (error) {
      console.error('Error adding post:', error);
      toast.error('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="flex w-full flex-col items-start rounded-lg bg-white p-4 shadow-xl sm:p-6">
      <div className="flex w-full items-center justify-between p-2 text-left sm:p-4">
        <div>
          {/* <h1 className="mb-1 text-xl font-semibold text-gray-800 sm:text-3xl">
            Hello Daniel
          </h1> */}
          <p className="mb-4 text-xs text-gray-500 sm:text-sm">
          What's new with you? Do you have educational insights or resources to share with the community?
          </p>
        </div>

        {/* <div className="relative">
          <button
            onClick={toggleNotifications}
            className="relative text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            <Bell size={20} />
            <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              3
            </span>
          </button>

        </div> */}
      </div>

      <div className="w-full rounded-lg bg-gray-50 p-4 shadow-lg sm:p-6">
        {imagePreview && (
          <div className="relative mb-4">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-24 w-24 rounded-lg object-cover sm:h-32 sm:w-32"
            />
            <button
              className="absolute right-0 top-0 rounded-full bg-theme p-1 text-white shadow-lg hover:bg-purple-400"
              onClick={removeImage}
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="mb-4 rounded-lg bg-purple-100 p-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-b border-gray-300 bg-transparent text-xs text-gray-800 placeholder-gray-400 outline-none sm:text-sm"
            placeholder="Enter post title"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-6 w-full resize-none border-none bg-transparent text-xs text-gray-800 placeholder-gray-400 outline-none sm:text-sm"
            rows={4}
            placeholder="What's new with you today?"
          ></textarea>
        </div>

        <div className="flex flex-col items-center justify-between sm:flex-row">
          <div className="flex space-x-4">
            <label className="flex cursor-pointer items-center space-x-1 text-xs text-black hover:text-gray-700 sm:text-sm">
              <span>
                <Camera size={20} className="sm:size-22" />
              </span>
              <span>Image</span>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>
          <button
            onClick={handleSubmit}
            className="mt-4 flex w-full items-center justify-center rounded-lg bg-theme px-4 py-2 text-xs font-semibold text-white hover:bg-purple-400 sm:mt-0 sm:w-auto sm:text-sm"
          >
            <MessageCircleHeart color="#ffffff" className="mr-2" />
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommunityAdminHeader;
