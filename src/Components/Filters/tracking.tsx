import { NotebookTabs } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import 'react-datepicker/dist/react-datepicker.css';

const Filters = ({
  onFiltersChange,
}: {
  onFiltersChange: (filters: any) => void;
}) => {
  const [filters, setFilters] = useState({
    category: '',
    teacher_id: '',
    posted_at: 'ASC',
    payment_status: '',
    payment_category: '',
    year: '',
    month: '',
  });

  // const [classCategoryTypes, setClassCategoryTypes] = useState<Record<string, string>>({});
  // const [teachersList, setTeachersList] = useState<{ id: number; name: string }[]>([]);

  const isFetched = useRef(false);

  const updateFilter = (key: string, value: string) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, [key]: value };
      onFiltersChange(updatedFilters);
      return updatedFilters;
    });
  };

  useEffect(() => {
    if (isFetched.current) return; // Skip if already fetched
    isFetched.current = true;

    const fetchData = async () => {
      try {
        const [] = await Promise.all([
          api.get('/get_common_data'),
          api.get('/get_teachers_list'),
        ]);

        // if (commonDataResponse.data.success) {
        //   setClassCategoryTypes(commonDataResponse.data.data.classCategoryType || {});
        // }

        // if (teachersResponse.data.success) {
        //   setTeachersList(teachersResponse.data.data.teachersList || []);
        // }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-4 bg-white p-4 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
      {/* Payment Category Dropdown */}
      <div className="sm:w-42 relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <NotebookTabs className="h-4 w-4 text-gray-500" />
        </div>
        <select
          value={filters.payment_category}
          onChange={(e) => updateFilter('payment_category', e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 pl-10 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          <option value="class">Class</option>
          <option value="pack">Study Pack</option>
          {/* <option value="seminar">Seminar</option> */}
        </select>
      </div>

    {/* Year Filter */}
      <div className="sm:w-42 relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <NotebookTabs className="h-4 w-4 text-gray-500" />
        </div>
        <select
          value={filters.year}
          onChange={(e) => updateFilter('year', e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 pl-10 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Years</option>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </select>
      </div>
      

    {/* Month Filter */}
    <div className="sm:w-42 relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <NotebookTabs className="h-4 w-4 text-gray-500" />
      </div>
      <select
        value={filters.month}
        onChange={(e) => updateFilter('month', e.target.value)}
        className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 pl-10 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="">All Months</option>
        <option value="January">January</option>
        <option value="February">February</option>
        <option value="March">March</option>
        <option value="April">April</option>
        <option value="May">May</option>
        <option value="June">June</option>
        <option value="July">July</option>
        <option value="August">August</option>
        <option value="September">September</option>
        <option value="October">October</option>
        <option value="November">November</option>
        <option value="December">December</option>
      </select>
    </div>


      {/* Payment Status Dropdown */}
      {/* <div className="sm:w-42 relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <NotebookTabs className="h-4 w-4 text-gray-500" />
        </div>
        <select
          value={filters.payment_status}
          onChange={(e) => updateFilter('payment_status', e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 pl-10 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Payment Types</option>
          <option value="pending">Pending</option>
          <option value="successful">Successful</option>
          <option value="failed">Rejected</option>
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
          className="bg-white-50 block w-full rounded-lg border border-gray-300 p-2.5 pl-10 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="ASC">New Payments</option>
          <option value="DESC">Old Payments</option>
        </select>
      </div> */}

      {/* Class Type Dropdown */}
      {/* <div className="sm:w-42 relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <NotebookTabs className="h-4 w-4 text-gray-500" />
        </div>
        <select
          value={filters.category}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="bg-white-50 block w-full rounded-lg border border-gray-300 p-2.5 pl-10 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500"
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
      {/* <div className="sm:w-42 relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <User className="h-4 w-4 text-gray-500" />
        </div>
        <select
          value={filters.teacher_id}
          onChange={(e) => updateFilter('teacher_id', e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 pl-10 text-xs capitalize text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Teachers</option>
          {teachersList.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </select>
      </div> */}
    </div>
  );
};

export default Filters;
