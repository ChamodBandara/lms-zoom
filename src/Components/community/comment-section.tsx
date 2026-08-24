import { ChevronDown, MessageSquareReply, Trash2, X } from 'lucide-react';
import { Camera } from 'lucide-react';
import { useState, useEffect, ChangeEvent } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { defaultConfig } from '../../App/configs/common';
import { TailSpin } from 'react-loader-spinner';

type Comment = {
  student_id: string | null;
  avatar: string;
  id: number;
  user: string;
  teacher: string;
  role: string;
  time: string;
  content: string;
  likes: number;
  liked: boolean;
  isAuthor: boolean;
  image: string | null;
  replies: {
    id: number;
    user: string;
    teacher: string;
    role: string;
    content: string;
    time: string;
    student_id: string | null;
    avatar: string;
    isAuthor: boolean;
    image: string | null;
  }[];
};

function CommentSection({
  post_id,
  updateCommentsCount,
}: {
  post_id: number;
  post_owner_id: string;
  refreshPosts: () => void;
  updateCommentsCount: (increment: boolean) => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showReplies, setShowReplies] = useState<Set<number>>(new Set());
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const currentUserId = localStorage.getItem('user_id');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/getPost', { params: { post_id } });
      if (response.data.success) {
        const fetchedComments = response.data.data.comments.map(
          (comment: any) => ({
            id: comment.id,
            user: comment.student.first_name,
            teacher: comment.student.name,
            role: comment.student.role,
            avatar: comment.student.avatar,
            student_id: comment.student.id,
            time: formatTime(comment.created_at),
            content: comment.comment,
            image: comment.comment_Image,
            likes: 0,
            liked: false,
            isAuthor: comment.student.id === response.data.data.post_owner_id,
            replies: comment.sub_comments.map((subComment: any) => ({
              id: subComment.id,
              student_id: subComment.student.id,
              avatar: subComment.student.avatar,
              user: subComment.student.first_name,
              teacher: subComment.student.name,
              role: subComment.student.role,
              content: subComment.comment,
              image: subComment.comment_Image,
              time: formatTime(subComment.created_at),
              isAuthor:
                subComment.student.id === response.data.data.post_owner_id,
            })),
          }),
        );
        setComments(fetchedComments);
      }
    } catch (error) {
      toast.error('Error fetching comments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [post_id, refreshTrigger]);

  const handleAddComment = async () => {
    if (!newComment.trim() && !selectedFile) {
      toast.error('Please enter a comment or attach an image');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('post_id', post_id.toString());
      formData.append('comment', newComment);

      if (selectedFile) {
        formData.append('comment_Image', selectedFile); // Ensure the name matches backend expectations
      }

      const response = await api.post('/addComment', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setNewComment('');
        setSelectedFile(null);
        setImagePreview(null);
        setRefreshTrigger((prev) => prev + 1);
        updateCommentsCount(true);
      } else {
        toast.error('Failed to add comment. Please try again.');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('An error occurred. Please try again later.');
    }
  };

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

  const handleDeleteComment = async (commentId: number) => {
    try {
      await api.post('/deleteComment', { comment_id: commentId });
      setRefreshTrigger((prev) => prev + 1);
      updateCommentsCount(false);

      // ✅ Reset image preview when deleting a comment
      setImagePreview(null);
      setSelectedFile(null);
    } catch (error) {
      toast.error('Error deleting comment');
    }
  };

  const formatTime = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(new Date(dateString));
  };

  const handleDeleteSubComment = async (
    _parentId: number,
    subCommentId: number,
  ) => {
    try {
      const response = await api.post('/deleteComment', {
        comment_id: subCommentId,
      });
      if (response.data.success) {
        fetchComments(); // Refresh comments
        setRefreshTrigger((prev) => prev + 1); // Trigger refresh
      } else {
        toast.error('Failed to delete the sub-comment. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting sub-comment:', error);
      toast.error('An error occurred while deleting the sub-comment.');
    }
  };

  const handleReply = (commentId: number) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
    setReplyContent('');
  };

  const handleAddSubComment = async (commentId: number) => {
    if (!replyContent.trim()) {
      toast.error('Please enter a reply.');
      return;
    }

    try {
      const response = await api.post('/addSubComment', {
        comment_id: commentId,
        sub_comment: replyContent,
      });
      if (response.data.success) {
        // toast.success('Reply added successfully!');
        setReplyingTo(null);
        setReplyContent('');
        fetchComments(); // Refresh comments
      } else {
        toast.error('Failed to add reply. Please try again.');
      }
    } catch (error) {
      console.error('Error adding sub-comment:', error);
      toast.error('An error occurred. Please try again later.');
    }
  };

  const toggleReplies = (commentId: number) => {
    setShowReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  // ✅ Function to open full-screen image popup
  const openImagePopup = (imageUrl: string | null) => {
    if (imageUrl) {
      setFullscreenImage(imageUrl);
    }
  };

  // ✅ Function to close full-screen image popup
  const closeImagePopup = () => {
    setFullscreenImage(null);
  };

  return (
    <div className="mx-auto w-full rounded-lg bg-white p-8 shadow-xl">
      <div className="mb-4 rounded-lg border border-gray-300 bg-gray-100 p-4">
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
        <textarea
          className="w-full rounded-lg bg-gray-100 p-2 text-sm text-black ring-2 ring-gray-500 focus:outline-none focus:ring focus:ring-gray-500"
          rows={4}
          placeholder="Add a comment"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        ></textarea>

        <div className="mt-2 flex items-center justify-between">
          <div>
            <input
              type="file"
              id="comment-image"
              className="hidden"
              accept="image/*"
              onChange={(e) => setCommentImage(e.target.files?.[0] || null)}
            />
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
            {commentImage && (
              <div className="ml-2 inline-flex items-center">
                <span className="text-sm text-gray-600">
                  {commentImage.name}
                </span>
                <button
                  onClick={() => setCommentImage(null)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <div className="ml-3 flex items-center">
            <button
              className="rounded-lg bg-gray-600 px-2 py-2 text-xs text-white hover:bg-gray-700"
              onClick={() => {
                setNewComment('');
                setCommentImage(null);
              }}
            >
              Cancel
            </button>
            <button
              className="ml-2 rounded-lg bg-theme px-3 py-2 text-xs text-white hover:bg-purple-400"
              onClick={handleAddComment}
            >
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Full-screen Image Popup */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={closeImagePopup} // Close when clicking outside
        >
          <div className="relative max-w-4xl p-2">
            <img
              src={fullscreenImage}
              alt="Full Screen"
              className="max-h-screen w-auto max-w-full rounded-lg object-contain"
            />
            <button
              className="absolute right-2 top-2 rounded-full bg-white p-2 shadow-lg"
              onClick={closeImagePopup}
            >
              <X size={24} color="black" />
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex max-h-screen items-center justify-center">
          <TailSpin
            height="60"
            width="60"
            color="#9b59b6"
            ariaLabel="loading"
          />
        </div>
      ) : comments.length === 0 ? (
        <div className="mb-10 mt-24 text-center text-gray-500">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div
          className="hide-scrollbar mt-5 h-96 space-y-6 overflow-y-scroll"
          onMouseEnter={(e) => e.currentTarget.focus()}
        >
          {comments.map((comment, index) => (
            <div key={comment.id} className="mb-6 items-center">
              <div className="rounded-lg bg-purple-100 p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 overflow-hidden rounded-full">
                    <img
                      src={
                        comment.avatar
                          ? `${defaultConfig.BASE_ASSEST_URL}/${comment.avatar}`
                          : '/images/profile_picture.png'
                      }
                      alt="Profile Picture"
                      className="rounded-full"
                    />
                  </div>

                  <span className="text-xs">
                    {comment.role === 'student' && (
                      <span className="text-xs font-medium capitalize">
                        {comment.user}
                      </span>
                    )}
                    {/* {comment.role === 'super_admin' && (
                      <span className="text-xs font-medium capitalize">
                        {comment.user}
                      </span>
                    )} */}
                    {comment.role === 'teacher' && (
                      <span className="text-xs font-medium capitalize">
                        {comment.teacher}
                      </span>
                    )}
                  </span>
                  <span>
                    {comment.isAuthor && (
                      <span className="-ml-2 text-xs text-gray-500">
                        (Author)
                      </span>
                    )}
                    {comment.role === 'super_admin' && (
                      <span className="-ml-2 text-xs text-gray-500">
                        (Admin)
                      </span>
                    )}
                    {comment.role === 'teacher' && (
                      <span className="-ml-2 text-xs text-gray-500">
                        (Teacher)
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-black">{comment.time}</span>
                  {comment.student_id == currentUserId && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="ml-auto text-red-500 hover:text-red-600"
                      title="Delete Comment"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <p className="ml-11 break-words text-xs text-black">
                  {comment.content}
                </p>
                {comment.image && (
                  <div className="relative ml-11 mt-3">
                    <img
                      src={comment.image}
                      alt="Comment Image"
                      className="h-32 w-32 cursor-pointer rounded-lg object-cover"
                      onClick={() => openImagePopup(comment.image)}
                    />
                  </div>
                )}
                {/* <img
                  src={`${defaultConfig.BASE_ASSEST_URL}/${post.post_Image}`}
                  alt="Comment"
                  className="h-auto max-w-full sm:w-96"
                /> */}
                <div className="ml-11 mt-3 flex items-center space-x-4 text-xs text-black">
                  {/* <button
                    className="flex items-center space-x-1"
                    onClick={() => handleLike(comment.id)}
                  >
                    <Heart
                      size={16}
                      color={comment.liked ? 'red' : 'black'}
                      fill={comment.liked ? 'red' : 'none'}
                    />
                    <span>{comment.likes}</span>
                  </button> */}
                  <button
                    className="flex items-center space-x-2 hover:text-black"
                    onClick={() => handleReply(comment.id)}
                  >
                    <MessageSquareReply size={18} />
                    <span>Reply</span>
                  </button>

                  <button
                    className="flex items-center space-x-1 hover:text-black"
                    onClick={() => toggleReplies(comment.id)}
                  >
                    <ChevronDown
                      size={18}
                      className={
                        showReplies.has(comment.id)
                          ? 'rotate-180 transform'
                          : ''
                      }
                    />
                    <span>
                      {showReplies.has(comment.id)
                        ? `Hide Replies${comment.replies.length > 0 ? ` (${comment.replies.length})` : ''}`
                        : `View Replies${comment.replies.length > 0 ? ` (${comment.replies.length})` : ''}`}
                    </span>
                  </button>
                </div>
              </div>

              {showReplies.has(comment.id) && comment.replies.length > 0 && (
                <div className="ml-8 mt-4 space-y-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="rounded-lg bg-gray-100 p-3">
                      <div className="flex items-center space-x-1.5">
                        <div className="h-8 w-8 overflow-hidden rounded-full">
                          <img
                            src={
                              reply.avatar
                                ? `${defaultConfig.BASE_ASSEST_URL}/${reply.avatar}`
                                : '/images/profile_picture.png'
                            }
                            alt="Profile Picture"
                            className="rounded-full"
                          />
                        </div>
                        <span className="text-xs">
                          {reply.role === 'student' && (
                            <span className="text-xs font-medium capitalize">
                              {reply.user}
                            </span>
                          )}
                          {/* {comment.role === 'super_admin' && (
                            <span className="text-xs font-medium capitalize">
                              {comment.user}
                            </span>
                          )} */}
                          {reply.role === 'teacher' && (
                            <span className="ml-1 text-xs font-medium capitalize">
                              {reply.teacher}
                            </span>
                          )}
                        </span>
                        {reply.isAuthor && (
                          <span className="-ml-4 text-xs text-gray-500">
                            (Author)
                          </span>
                        )}
                        {reply.role === 'super_admin' && (
                          <span className="-ml-2 text-xs text-gray-500">
                            (Admin)
                          </span>
                        )}
                        {reply.role === 'teacher' && (
                          <span className="-ml-2 text-xs text-gray-500">
                            (Teacher)
                          </span>
                        )}
                        <span className="text-xs text-black">{reply.time}</span>
                        {reply.student_id == currentUserId && (
                          <button
                            onClick={() =>
                              handleDeleteSubComment(comment.id, reply.id)
                            }
                            className="ml-auto text-red-500 hover:text-red-600"
                            title="Delete Comment"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <p className="ml-11 break-words text-xs text-black">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {replyingTo === comment.id && (
                <div className="ml-5 mt-4">
                  <textarea
                    className="w-full rounded-lg bg-gray-100 p-2 text-sm text-black"
                    rows={3}
                    placeholder={`Replying to ${comment.user}...`}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  ></textarea>
                  <div className="mt-2 flex justify-end">
                    <button
                      className="rounded-lg bg-gray-600 px-4 py-2 text-xs text-white hover:bg-gray-700"
                      onClick={() => setReplyingTo(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="ml-2 rounded-lg bg-theme px-4 py-2 text-xs text-white hover:bg-purple-400"
                      onClick={() => handleAddSubComment(comment.id)}
                    >
                      Post Reply
                    </button>
                  </div>
                </div>
              )}

              {index !== comments.length - 1 && (
                <hr className="my-4 border-gray-300" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentSection;
