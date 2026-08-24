import { Logs, Filter } from 'lucide-react';
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
    posted_at: 'ASC',
    view: 'all', // Filter for "My Posts," "All Posts," or "Popular Posts"
  });

  const isFetched = useRef(false);

  const updateFilter = (key: string, value: string) => {
    // Update the specific filter and call the parent's callback with all filters
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, [key]: value };
      onFiltersChange(updatedFilters); // Pass updated filters to the parent
      return updatedFilters;
    });
  };

  useEffect(() => {
    if (isFetched.current) return; // Skip if already fetched
    isFetched.current = true;

    // Fetch data or other initialization logic if needed
    const fetchData = async () => {
      try {
        const response = await api.get('/get_common_data');
        if (response.data.success) {
          console.log('Fetched common data:', response.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-white p-4 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
      {/* View Filter Dropdown */}
      <div className="sm:w-42 relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Filter className="h-4 w-4 text-gray-500" />
        </div>
        <select
          value={filters.view}
          onChange={(e) => updateFilter('view', e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 pl-10 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">All Posts</option>
          {/* <option value="my">My Posts</option> */}
          <option value="popular">Popular Posts</option>
        </select>
      </div>

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
          <option value="DESC">New Uploads</option>
          <option value="ASC">Old Uploads</option>
        </select>
      </div>
    </div>
  );
};

export default Filters;
