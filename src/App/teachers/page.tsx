import ClassHeader from '../../Components/ClassHeaders/page';
import Filters from '../../Components/Filters/all-teachers';
import Headingbar from '../../Components/headingbar/headingbar';
import TeachersList from '../../Components/all-teachers/allteachers';
import api from '../../services/api';
import { useState, useEffect } from 'react';
import { Bars } from 'react-loader-spinner';
import { TailSpin } from 'react-loader-spinner';

function AllTeachers() {
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    posted_at: 'DESC',
    pageLimit: '9',
    teacher_id: '',
    subject: '',
    page: 1,
  });

  const [teacherstData, setTeachersData] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const response = await api.get('/get_all_teachers_list', {
          params: filters, // Pass filters as query parameters
        });
        setTeachersData(response.data.data.teachersList.data); // Save the API response to state
        setPagination({
          current_page: response.data.data.teachersList.current_page,
          last_page: response.data.data.teachersList.last_page,
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

  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prevFilters) => ({ ...prevFilters, page })); // Update page filter
  };

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
        
          <div className="flex flex-col gap-5 mb-5">
            <Headingbar title="All Teachers" />
            <ClassHeader
              sub_text="The All Teachers available to you are listed below."
              main_text="All Teachers"
              icon="/images/dashicons_awards.png"
            />
          </div>

          <div className="bg-white min-h-screen rounded-lg">
          <div className="  gap-2 p-4">
            <div className="flex flex-col gap-3">
              <div className='flex justify-end'>
              <Filters onFiltersChange={handleFiltersChange} />
              </div>
              <hr className="border-gray-200 w-full" />

            </div>
        
            {loading ? (
              <div className="mt-10 flex justify-center">
                <Bars
                  height="80"
                  width="80"
                  color="#9b59b6"
                  ariaLabel="bars-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={true}
                />
              </div>
            ) : (
              <>
                <TeachersList
                  data={teacherstData}
                  loading={loading}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
          </div>
        </>
      )}
    </div>
    
  );
}

export default AllTeachers;
