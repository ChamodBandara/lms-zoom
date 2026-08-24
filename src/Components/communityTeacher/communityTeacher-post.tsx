import {
  Heart,
  MessageCircleMore,
  X,
  // Edit2,
  // Trash
} from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { defaultConfig } from '../../App/configs/common';
import { toast } from 'react-toastify';
import CommentTeacherSection from './commentTeacher-section';

function TeacherPost({
  posts,
  refreshPosts,
}: {
  posts: {
    id: string;
    student: {
      avatar: string;
      first_name: string;
      evrest_id: string;
    };
    student_id: string;
    status: string;
    post_Image: string;
    title: string;
    description: string;
    likes_count: number;
    comments_count: number;
    userLiked: boolean;
    created_at: string;
    updated_at: string;
  }[];
  refreshPosts: () => void;
}) {
  const [postData, setPostData] = useState(posts);
  const [token, setToken] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    id: string;
    title: string;
    description: string;
    currentImage: string;
    newImage: File | null;
  } | null>(null);

  // Check for admin token on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    setToken(token);
  }, []);

  // const currentUserId = localStorage.getItem('user_id');

  const toggleLike = async (postId: string) => {
    try {
      const response = await axios.post(
        `${defaultConfig.BASE_API_URL}/teacher/likePost`,
        { post_id: postId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setPostData((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes_count: post.userLiked
                    ? post.likes_count - 1
                    : post.likes_count + 1,
                  userLiked: !post.userLiked,
                }
              : post,
          ),
        );
        // toast.success('Post liked/unliked successfully!');
      } else {
        toast.error('Failed to like/unlike the post. Please try again.');
      }
    } catch (error) {
      console.error('Error liking/unliking post:', error);
      toast.error('An error occurred while liking/unliking the post.');
    }
  };


  // const deletePost = async (postId: string) => {
  //   try {
  //     console.log('token', token);
  //     const response = await axios.delete(
  //       'http://localhost:8000/api/teacher/deletePost',
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${token}`,
  //         },
  //         data: { post_id: postId },
  //       },
  //     );
  //     if (response.data.success) {
  //       toast.success('Post deleted successfully!');
  //       refreshPosts();
  //     } else {
  //       toast.error('Failed to delete the post. Please try again.');
  //     }
  //   } catch (error) {
  //     console.error('Error deleting post:', error);
  //     toast.error('An error occurred while deleting the post.');
  //   }
  // };

  const togglePopup = (postId: string) => {
    setShowPopup(showPopup === postId ? null : postId);
  };

  // const openEditPopup = (post: {
  //   id: string;
  //   title: string;
  //   description: string;
  //   post_Image: string;
  // }) => {
  //   setEditForm({
  //     id: post.id,
  //     title: post.title,
  //     description: post.description,
  //     currentImage: `${defaultConfig.BASE_ASSEST_URL}/${post.post_Image}`,
  //     newImage: null,
  //   });
  // };

  const closeEditPopup = () => {
    setEditForm(null);
  };

  const handleUpdatePost = async () => {
    if (!editForm) return;

    const formData = new FormData();
    formData.append('post_id', editForm.id);
    formData.append('title', editForm.title || '');
    formData.append('description', editForm.description || '');
    if (editForm.newImage) {
      formData.append('post_Image', editForm.newImage);
    }
    // Append _method to spoof a PUT request
    formData.append('_method', 'PUT');

    try {
      const response = await axios.post(
        `${defaultConfig.BASE_API_URL}/teacher/updatePost`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        toast.success('Post updated successfully!');
        setPostData((prevPosts) =>
          prevPosts.map((post) =>
            post.id === editForm.id
              ? {
                  ...post,
                  title: editForm.title,
                  description: editForm.description,
                  post_Image: editForm.newImage
                    ? URL.createObjectURL(editForm.newImage)
                    : post.post_Image,
                  updated_at: new Date().toISOString(),
                }
              : post,
          ),
        );
        closeEditPopup();
        refreshPosts();
      } else {
        toast.error('Failed to update the post. Please try again.');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('An error occurred while updating the post.');
    }
  };

  return (
    <div className="mt-4">
      {postData.map((post) => {
        const createdAt = new Date(post.created_at);
        const updatedAt = new Date(post.updated_at);
        const isEdited = updatedAt.getTime() !== createdAt.getTime();

        return (
          <div
            key={post.id}
            className="mt-2 w-full rounded-lg bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={
                    post.student.avatar
                      ? `${defaultConfig.BASE_ASSEST_URL}/${post.student.avatar}`
                      : '/images/profile_picture.png'
                  }
                  alt={post.student.first_name || 'Default Profile Pic'}
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <h2 className="flex items-center text-base font-semibold capitalize text-gray-800 sm:text-lg">
                    {post.student.first_name || 'Unknown'}
                    <span
                      className={`-mt-4 ml-2 h-[9px] w-[9px] rounded-full ${
                        post.status === 'deactive'
                          ? 'bg-red-500'
                          : 'bg-green-500'
                      }`}
                    ></span>
                  </h2>
                  <p className="ml-1 flex items-center text-xs text-gray-800 sm:text-xs">
                    EID: {post.student.evrest_id || 'SEID'}
                    {isEdited && (
                      <span className="ml-1 text-gray-500">(edited)</span>
                    )}
                  </p>
                </div>
              </div>

              {/* <div className="flex space-x-4">
                <button
                  onClick={() => openEditPopup(post)}
                  className="text-gray-500 hover:text-blue-600"
                  title="Edit Post"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  className="text-gray-500 hover:text-red-600"
                  title="Delete Post"
                >
                  <Trash size={20} />
                </button>
              </div> */}
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-center">
                <div className="mb-4 text-center">
                  <img
                    src={`${defaultConfig.BASE_ASSEST_URL}/${post.post_Image}`}
                    alt={post.title || 'Post Image'}
                    className="h-auto max-w-full sm:w-96"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="mb-2 break-words text-sm font-medium text-gray-700 sm:text-lg">
                  {post.title || 'Untitled Post'}
                </h3>
                <p className="mt-2 break-words text-xs text-gray-600 sm:text-sm">
                  {post.description || 'No description available.'}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 border-t border-gray-200 pt-2 sm:gap-10">
              <button
                className="flex items-center text-black hover:text-gray-800"
                onClick={() => toggleLike(post.id)}
              >
                <Heart
                  color={post.userLiked ? '#ff0000' : 'black'}
                  fill={post.userLiked ? '#ff0000' : 'none'}
                  className="mr-2"
                  size={18}
                />{' '}
                {post.likes_count}{' '}
                <span className="ml-2 text-black hover:text-gray-800">
                  Likes
                </span>
              </button>

              <button
                className="flex items-center text-black hover:text-gray-800"
                onClick={() => togglePopup(post.id)}
              >
                <MessageCircleMore className="mr-2" size={18} />{' '}
                {post.comments_count}{' '}
                <span className="ml-2 text-black hover:text-gray-800">
                  Comments
                </span>
              </button>
            </div>

            {showPopup === post.id && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="relative mb-16 mt-16 max-h-[100vh] w-11/12 rounded-lg bg-white p-4 md:w-3/5 md:p-6">
                  <button
                    onClick={() => setShowPopup(null)}
                    className="absolute right-4 top-4 rounded-full bg-gray-400 p-2 text-white hover:bg-gray-600"
                  >
                    <X color="#ffffff" />
                  </button>
                  <CommentTeacherSection
                    post_id={Number(post.id)}
                    refreshPosts={refreshPosts}
                    updateCommentsCount={(increment) => {
                      setPostData((prevPosts) =>
                        prevPosts.map((p) =>
                          p.id === post.id
                            ? {
                                ...p,
                                comments_count:
                                  p.comments_count + (increment ? 1 : -1),
                              }
                            : p,
                        ),
                      );
                    }}
                    post_owner_id={''}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative max-h-[100vh] w-11/12 max-w-2xl rounded-lg bg-white shadow-lg">
            <button
              onClick={closeEditPopup}
              className="absolute right-4 top-4 rounded-full bg-gray-200 p-2 text-gray-600 hover:bg-gray-300 hover:text-gray-800"
            >
              <X size={20} />
            </button>
            <div className="px-6 py-8">
              <h3 className="text-2xl font-bold text-gray-800">Edit Post</h3>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  value={editForm.title}
                  placeholder="Enter a title"
                  onChange={(e) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, title: e.target.value } : null,
                    )
                  }
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  rows={4}
                  placeholder="Enter a description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, description: e.target.value } : null,
                    )
                  }
                ></textarea>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Image
                </label>
                <div className="mt-2 flex items-center space-x-4">
                  <input
                    type="file"
                    className="block w-full cursor-pointer rounded-lg border border-gray-300 text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-none file:bg-gray-200 file:px-4 file:py-2 file:text-gray-700 hover:file:bg-gray-300"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setEditForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              newImage: file,
                              currentImage: file
                                ? URL.createObjectURL(file)
                                : prev.currentImage,
                            }
                          : null,
                      );
                    }}
                  />
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600">
                    Current Image:
                  </p>
                  <img
                    src={editForm.currentImage}
                    alt="Post"
                    className="mt-2 h-20 w-auto rounded-lg object-cover shadow"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={closeEditPopup}
                  className="rounded-lg bg-gray-300 px-6 py-2 text-xs font-medium text-gray-700 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePost}
                  className="rounded-lg bg-[#7b1fa2] px-6 py-2 text-xs font-medium text-white hover:bg-[#9c27b0]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherPost;
