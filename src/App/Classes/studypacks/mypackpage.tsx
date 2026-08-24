import ClassHeader from '../../../Components/ClassHeaders/page';
import { ButtonType } from '../../../Components/CourseCard/page';
import CourseCard from '../../../Components/CourseCard/page';
import { defaultConfig } from '../../configs/common';
// import Filters from '../../../Components/Filters/all-pack';
import Headingbar from '../../../Components/headingbar/headingbar';
import api from '../../../services/api';
import { useState, useEffect } from 'react';
import { TailSpin } from 'react-loader-spinner';
import Pagination from '../../../Components/pagination/pagination';
import PackFilters from '../../../Components/Filters/pack-filter';

const MyStudyPacks = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    posted_at: 'DESC',
    pageLimit: '10',
    teacher_id: '',
    subject: '',
    page: 1,
  });

  const [packtData, setPacksData] = useState([]); // Holds fetched data
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const response = await api.get('/get_paid-study_packs', {
          params: filters, // Pass filters as query parameters
        });

        setPacksData(response.data.data.packList.data);
        setPagination({
          current_page: response.data.data.packList.current_page,
          last_page: response.data.data.packList.last_page,
        });
      } catch (error) {
        console.error('Error fetching payment data:', error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, [filters]);

  const handleFiltersChange = (newFilters: any) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prevFilters) => ({ ...prevFilters, page })); // Update page filter
  };
  console.log(packtData);
  return (
    <div className="flex flex-col p-2 sm:ml-64">
      {isLoading ? (
        <div className="flex h-screen items-center justify-center">
          <TailSpin
            height="40"
            width="40"
            color="#9b59b6"
            ariaLabel="loading"
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-5">
            <Headingbar title="My study packs" />
            <ClassHeader
              sub_text="The Study Packs available to you are listed below."
              main_text="My Study Packs"
              icon="/images/book_icon_love.png"
            />
          </div>
          <div className="mt-5 bg-white p-4">
            <div className="flex flex-col gap-3">
              {/* <Filters onFiltersChange={handleFiltersChange} /> */}
              <PackFilters onFiltersChange={handleFiltersChange} />
              <hr className="w-full border-gray-200" />

              {loading ? (
                <div className="flex items-center justify-center">
                  <TailSpin
                    height="40"
                    width="40"
                    color="#9b59b6"
                    ariaLabel="loading"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
                  {packtData.map((pack: any) => (
                    <CourseCard
                      key={pack.id}
                      id={pack.id}
                      class_avatar={`${defaultConfig.BASE_ASSEST_URL}/${pack.pack_avatar}`}
                      name={pack.name}
                      description={pack.description}
                      teacher={pack.teacher_name}
                      category=""
                      avatar={`${defaultConfig.BASE_ASSEST_URL}/${pack.teacher_avatar}`}
                      buttonType={pack.status === 'pending'
                        ? ButtonType.STUDY
                        : pack.status === 'completed'
                          ? ButtonType.PURCHASE
                          : ButtonType.BUY}
                      price={pack.price} sub_id={''}                    />
                  ))}
                </div>
              )}
            </div>
          </div>

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
  );
};

export default MyStudyPacks;
