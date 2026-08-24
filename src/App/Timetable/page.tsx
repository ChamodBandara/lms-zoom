import { useState, useEffect } from 'react';
import TimeTable from '../../Components/timetable/timetable';
import { TailSpin } from 'react-loader-spinner';
import Filters from '../../Components/Filters/time-table';
import api from '../../services/api';
import { Bars } from 'react-loader-spinner';
import Headingbar from '../../Components/headingbar/headingbar';

function TimeTablePage() {
  const [filters, setFilters] = useState({
    posted_at: 'DESC',
    pageLimit: '',
    teacher_id: '',
    category: '',
  });

  const [timetableData, setTimetableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTimetableData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/get_time_table_list', {
          params: filters, // Pass filters as query parameters
        });
        setTimetableData(response.data.data.timeTableList); // Save the API response to state
      } catch (error) {
        console.error('Error fetching payment data:', error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    fetchTimetableData();
  }, [filters]);

  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };
  return (
    <div className="flex flex-col p-2 sm:ml-64">
      <Headingbar title="Time Table" />
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
        <div className="mt-3 rounded-lg bg-white p-4">
          <div className="flex items-center justify-center border border-gray-100 bg-white p-4 shadow-lg">
            <div className="flex flex-col items-center justify-center text-center">
              <img
                src="/images/logo.png"
                alt="Logo"
                className="h-12 w-28 object-contain"
              />
              <div className="flex flex-col items-center">
                <h2 className="mt-2 text-2xl font-bold text-gray-800">
                  Time Table
                </h2>
                <h3 className="mb-2 mt-1 text-sm text-gray-600">
                  Use the filter option to sort your classes.
                </h3>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex justify-end">
              <Filters onFiltersChange={handleFiltersChange} />
            </div>

            <hr className="w-full border-gray-200" />
          </div>

          {/* Show section loader or data */}
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
            <TimeTable data={timetableData} />
          )}
        </div>
      )}
    </div>
  );
}

export default TimeTablePage;
