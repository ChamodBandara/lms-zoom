// import CommunityChat from '../../Components/community/community-chat';
import CommunityHeader from '../../Components/community/community-header';
import Post from '../../Components/community/community-post';
import Pagination from '../../Components/pagination/pagination';
import Filters from '../../Components/Filters/community';
import api from '../../services/api';
import { useState, useEffect } from 'react';
import { TailSpin } from 'react-loader-spinner';
import { BotMessageSquare, X } from 'lucide-react';
import { Link } from 'react-router-dom';
// import CommunityChat from '../../Components/community/community-chat';
// import MobileCommunityChat from '../../Components/community/tab-community-chat';

function CommunityUserPage() {

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const user_idFromUrl = urlParams.get('user_id');
    const nameFromUrl = urlParams.get('name');
    const avatarFromUrl = urlParams.get('avatar');

    if (tokenFromUrl) {
      localStorage.setItem('authToken', tokenFromUrl);
      
      localStorage.setItem('user_id', user_idFromUrl || ""); // Avoid null storage
      localStorage.setItem('name', nameFromUrl || ""); // Avoid null storage
      localStorage.setItem('avatar', avatarFromUrl || ""); // Avoid null storage
      setToken(tokenFromUrl);  // Update state


    }
  }, []);


  const [posts, setPosts] = useState([]); // State for all posts
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [filters, setFilters] = useState({
    posted_at: 'DESC',
    pageLimit: 10,
    teacher_id: '',
    category: '',
    view: 'all', // New filter for the view type
    page: 1,
  });
  
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State to track popup visibility
  const [isVerificationPopupOpen, setIsVerificationPopupOpen] = useState(false);

  useEffect(() => {
    if (token) {
      fetchPosts();
    }
  }, [token ,filters] ); // Only depend on token

  useEffect(() => {
    fetchPosts();
  }, [filters]);

  // Function to fetch posts from the backend
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/getAllPosts', { params: filters });
      const postData = response.data.data.pageList.data || [];


      if (response.data?.data?.isUserstatus !== 'approved') {
        setIsVerificationPopupOpen(true);
      } 

      setPosts(postData);
      setPagination({
        current_page: response.data.data.pageList.current_page,
        last_page: response.data.data.pageList.last_page,
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.last_page) {
      setFilters((prevFilters) => ({ ...prevFilters, page }));
    }
  };

  const togglePopup = () => {
    setIsPopupOpen((prev) => !prev); // Toggle the popup visibility
  };

  return (
    <div className="flex h-screen w-full flex-col">
      {/* <div className="flex flex-col sm:ml-64">
        <Headingbar title="Community" />
      </div> */}

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
              {/* <div className="mt-16 text-center  "> */}
              {/* <div className="mt-2 text-center">
                <img src="/images/forbidden.png" alt="" className="w-auto" />

                <p className="mb-4 text-3xl font-bold text-gray-700 lg:hidden">
                  Community Chat
                </p>
                <p className="text-xl text-gray-500 lg:hidden">Coming Soon</p>
              </div> */}
              <CommunityHeader refreshPosts={fetchPosts} />
              <Post posts={posts} refreshPosts={fetchPosts} />
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
      </div>

      <button
        onClick={togglePopup}
        className="fixed bottom-4 right-4 flex items-center justify-center rounded-full bg-theme p-4 text-xs text-white shadow-lg sm:hidden"
      >
        <span className="material-icons mr-2">
          <BotMessageSquare className="ml-2" />
          chat
        </span>
      </button>
      
      {isVerificationPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-80 rounded-lg bg-white p-6 text-center shadow-lg">
            <h2 className="text-lg font-semibold text-red-600">
              Verification Required
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              You're not an approved student. Please verify your identity
              first.
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <Link to={`/profile`}>
                <button className="mt-4 rounded-lg bg-theme px-4 py-2 text-sm text-white hover:bg-purple-900">
                  Verify
                </button>
              </Link>
              {/* <button
                className="mt-4 rounded-lg bg-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-400"
                onClick={() => setIsVerificationPopupOpen(false)}
              >
                Close
              </button> */}
            </div>
          </div>
        </div>
      )}

      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-sm rounded-lg bg-white p-4 shadow-lg md:ml-64 md:max-w-md lg:ml-64 lg:max-w-lg">
            {/* <MobileCommunityChat /> */}

            <div className="mt-16 rounded-lg border border-gray-200 p-5 text-center">
              <p className="mb-4 text-3xl font-bold text-gray-700">
                Community Chat
              </p>
              <p className="text-xl text-gray-500">Comming Soon</p>

              <img src="/images/forbidden.png" alt="" className="w-auto" />
            </div>
            <button
              onClick={togglePopup}
              className="absolute right-2 top-2 rounded-full bg-gray-600 p-2 text-white"
            >
              <X />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunityUserPage;
