import AllClasses from '../../../Components/all-class/all-class';
import ClassHeader from '../../../Components/ClassHeaders/page';
import Filters from '../../../Components/Filters/all-pack';
import Headingbar from '../../../Components/headingbar/headingbar';
import api from '../../../services/api';
import { useState, useEffect } from 'react';
import { TailSpin } from 'react-loader-spinner';

function LiveClass() {
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    posted_at: 'DESC',
    pageLimit: '9',
    teacher_id: '',
    subject: '',
    page: 1,
  });

  const [dataList, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const response = await api.get('/get_live_classesList', {
          params: filters, // Pass filters as query parameters
        });
        setData(response.data.data.classesList.data); // Save the API response to state
        setPagination({
          current_page: response.data.data.classesList.current_page,
          last_page: response.data.data.classesList.last_page,
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

  return (
    <div className="flex flex-col p-2">
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
            {/* <Headingbar title="Live Classes" /> */}
              <Headingbar title="" />
            <ClassHeader
              sub_text="The Live Classes available to you are listed below."
              main_text="Live Classes"
              icon="/images/icons/live.png"
            />
          </div>

          <div className="mt-4 gap-2">
            <div className="flex flex-col gap-3">
              <Filters onFiltersChange={handleFiltersChange} />
            </div>
            {/* <hr className="w-full border-gray-200" /> */}
            <AllClasses
              data={dataList}
              loading={loading}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default LiveClass;
