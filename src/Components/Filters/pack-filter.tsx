import { NotebookTabs, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import 'react-datepicker/dist/react-datepicker.css';

const PackFilters = ({
  onFiltersChange,
}: {
  onFiltersChange: (filters: any) => void;
}) => {
  const [filters, setFilters] = useState({
    subject: '',
    teacher_id: '',
    posted_at: 'DESC',
    payment_status: '',
    category: '',
    year: '',
  });

  const [streamType, setSubjectType] = useState<Record<string, string>>({});
  const [streamYear, setYearType] = useState<Record<string, string>>({});
//   const [ setClassCategoryType] = useState<
//     Record<string, string>
//   >({});
  const [teachersList, setTeachersList] = useState<
    { id: number; name: string }[]
  >([]);

  const isFetched = useRef(false);

  const updateFilter = (key: string, value: string) => {
    // Update only the specific filter and call the parent's callback with all filters
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, [key]: value };
      onFiltersChange(updatedFilters); // Pass the updated filters to the parent
      return updatedFilters;
    });
  };

  useEffect(() => {
    if (isFetched.current) return; // Skip if already fetched
    isFetched.current = true;

    const fetchData = async () => {
      try {
        const [commonDataResponse] = await Promise.all([
          api.get('/getCommonDataUser'),
          // api.get('/get_teachers_list'),
        ]);

        if (commonDataResponse.data.success) {
          setSubjectType(commonDataResponse.data.data.subjectList);
          // setClassCategoryType(commonDataResponse.data.data.classCategoryType);
          setTeachersList(commonDataResponse.data.data.teachersList);
          setYearType(commonDataResponse.data.data.examYearList);
        }

        // if (teachersResponse.data.success) {
        //   setTeachersList(teachersResponse.data.data.teachersList);
        // }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-4 bg-theme p-4 bg-opacity-30 border border-white-50">
      <div className="flex flex-col gap-4 bg-theme p-4 sm:flex-row sm:items-center sm:justify-end sm:gap-2 rounded-lg  bg-opacity-30 border border-white-50">
      {/* Payment Type Dropdown */}
      {/* <div className="sm:w-42 relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <NotebookTabs className="h-4 w-4 text-gray-500" />
        </div>
        <select
          value={filters.payment_status}
          onChange={(e) => updateFilter('payment_status', e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 pl-10 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select payment Type</option>
          <option value="pending">Pending</option>
          <option value="completed">Paid</option>
        </select>
      </div> */}

      {/* Sort Order Dropdown */}
      {/* <div className="sm:w-42 relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Logs className="h-4 w-4 text-gray-500" />
        </div>
        <select
          value={filters.posted_at}
          onChange={(e) => updateFilter('posted_at', e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="DESC">Descending Order</option>
          <option value="ASC">Ascending Order</option>
        </select>
      </div> */}

      {/* Class Year Dropdown */}
       <div className="sm:w-42 relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <NotebookTabs className="h-4 w-4 text-gray-500" />
        </div>
        <select
          value={filters.year}
          onChange={(e) => updateFilter('year', e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Years</option>
          {Object.entries(streamYear).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {/* Class Type Dropdown */}
      <div className="sm:w-42 relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <NotebookTabs className="h-4 w-4 text-gray-500" />
        </div>
        <select
          value={filters.subject}
          onChange={(e) => updateFilter('subject', e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Subjects</option>
          {Object.entries(streamType).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {/* Class Type Dropdown */}
      {/* <div className="sm:w-42 relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <NotebookTabs className="h-4 w-4 text-gray-500" />
        </div>
        <select
          value={filters.category}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Class Types</option>
          {Object.entries(classCategoryTypes).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      </div> */}

      {/* Lecturer Dropdown */}
      <div className="sm:w-42 relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <User className="h-4 w-4 text-gray-500" />
        </div>
        <select
          value={filters.teacher_id}
          onChange={(e) => updateFilter('teacher_id', e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-xs capitalize text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Teachers </option>
          {teachersList.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </select>
      </div>
      </div>
    </div>

  );
};

export default PackFilters;
