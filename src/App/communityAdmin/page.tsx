import { useState, useEffect } from 'react';
import axios from 'axios';
// import Post from '../../Components/community/community-post';
// import Headingbar from '../../Components/headingbar/headingbar';
import Pagination from '../../Components/pagination/pagination';
import Filters from '../../Components/Filters/communityAdminFilter';
import { TailSpin } from 'react-loader-spinner';
// import { BotMessageSquare, X } from 'lucide-react';
// import CommunityAdminHeader from '../../Components/communityAdmin/communityAdmin-header';
// import CommunityAdminChat from '../../Components/communityAdmin/communityAdmin-chat';
import AdminPost from '../../Components/communityAdmin/communityAdmin-post';
import { defaultConfig } from '../configs/common';

function CommunityPage() {
  const [posts, setPosts] = useState([]); // State for all posts
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [filters, setFilters] = useState({
    sort: 'newest',
    posted_at: 'DESC',
    pageLimit: 10,
    teacher_id: '',
    category: '',
    view: 'all', // Filter for the view type
    page: 1,
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });
  const [] = useState(false); // State to track popup visibility
  const [token, setToken] = useState<string | null>(null);

  // Check for admin token on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    setToken(token);
  

  }, []);

  useEffect(() => {
    if (token) {
      fetchPosts();
    }
  }, [filters, token]);
  
  // Function to fetch posts from the backend using axios
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      // Replace with your actual backend URL


      const response = await axios.get(`${defaultConfig.BASE_API_URL}/admin/getAllPosts`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        params: filters,
      });
  
      const postData = response.data.data.data || [];

      setPosts(postData);
      setPagination({
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page,
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: {
    sort?: string;
    pageLimit?: number;
    teacher_id?: string;
    category?: string;
    view?: string;
    page?: number;
  }) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters, page: 1 }));
  };

  // Update the page number in filters for pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.last_page) {
      setFilters((prevFilters) => ({ ...prevFilters, page }));
    }
  };


  return (
    <div className="flex h-screen w-full flex-col">
      <div className="flex flex-col sm:ml-64">
        {/* <Headingbar title="Community" /> */}
      </div>

      <div className="flex w-full flex-col sm:flex-row">
        <div className="hide-scrollbar flex h-screen w-full flex-col overflow-y-auto rounded-lg border border-gray-500 bg-white p-4 sm:ml-64 sm:w-3/5">
          <div className="mb-4">
            <Filters onFiltersChange={handleFiltersChange} />
          </div>
          {isLoading ? (
            <div className="flex max-h-screen items-center justify-center">
              <TailSpin
                height="60"
                width="60"
                color="#9b59b6"
                ariaLabel="loading"
              />
            </div>
          ) : (
            <>
              {/* <CommunityAdminHeader refreshPosts={fetchPosts} /> */}
              {/* Pass isAdmin and admin handlers to the Post component */}
              <AdminPost
                posts={posts}
                refreshPosts={fetchPosts}
                // onEditPost={handleEditPost}
                // onDeletePost={handleDeletePost}
              />
              <div className="flex justify-center bg-white">
                <Pagination
                  currentPage={pagination.current_page}
                  lastPage={pagination.last_page}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </div>

        {/* <div className="hidden rounded-lg border border-gray-500 bg-white p-5 sm:ml-4 sm:block sm:h-screen sm:w-2/5">
          <CommunityAdminChat />
        </div> */}
      </div>

      {/* <button
        onClick={togglePopup}
        className="fixed bottom-4 right-4 flex items-center justify-center rounded-full bg-theme p-4 text-xs text-white shadow-lg sm:hidden"
      >
        <span className="material-icons mr-2">
          <BotMessageSquare className="ml-2" />
          chat
        </span>
      </button> */}

      {/* {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-sm rounded-lg bg-white p-4 shadow-lg md:ml-64 md:max-w-md lg:ml-64 lg:max-w-lg">
            <div className="mt-16 rounded-lg border border-gray-200 p-5 text-center">
              <p className="mb-4 text-3xl font-bold text-gray-700">
                Community Chat
              </p>
              <p className="text-xl text-gray-500">Coming Soon</p>
              <img
                src="/images/forbidden.png"
                alt="Coming soon"
                className="w-auto"
              />
            </div>
            <button
              onClick={togglePopup}
              className="absolute right-2 top-2 rounded-full bg-gray-600 p-2 text-white"
            >
              <X />
            </button>
          </div>
        </div>
      )} */}
    </div>
  );
}

export default CommunityPage;
