import {  User, Logs } from 'lucide-react';
import { useState, useEffect, useRef } from "react";
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
  });

  const [, setClassCategoryTypes] = useState<
    Record<string, string>
  >({});
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
        const [commonDataResponse, teachersResponse] = await Promise.all([
          api.get("/get_common_data"),
          api.get("/get_teachers_list"),
        ]);

        if (commonDataResponse.data.success) {
          setClassCategoryTypes(commonDataResponse.data.data.classCategoryType);
        }

        if (teachersResponse.data.success) {
          setTeachersList(teachersResponse.data.data.teachersList);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
<div className=" flex flex-col gap-4 lg:w-2/3 w-full bg-white p-4 sm:flex-row sm:items-center sm:justify-end sm:gap-2 justify-end">

    
      {/* Sort Order Dropdown */}
      <div className="sm:w-42 relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Logs className="h-4 w-4 text-gray-500" />
        </div>
        <select
          value={filters.posted_at}
          onChange={(e) => updateFilter('posted_at', e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 pl-10 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        >
         
          <option value="ASC">New Uploads </option>
          <option value="DESC">Old Uploads</option>
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
          className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 pl-10 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select Class Type</option>
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
          className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 pl-10 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 capitalize"
        >
          <option value="">All Teachers</option>
          {teachersList.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </select>
      </div>

      
    </div>
  );
};

export default Filters;
