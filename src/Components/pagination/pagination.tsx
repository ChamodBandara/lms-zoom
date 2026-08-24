import * as React from 'react';
import MuiPagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

const Pagination = ({
  currentPage,
  lastPage,
  onPageChange,
}: {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}) => {
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page); // Call the parent handler with the selected page
  };

  return (
    <Stack
      spacing={2}
      style={{
        display: 'grid',
        placeItems: 'center',
        height: '10vh',
      }}
      className="mt-4"
    >
      <MuiPagination
        count={lastPage}
        page={currentPage} 
        onChange={handlePageChange} 
        color="secondary" 
        shape="rounded" 
        size="medium" 
      />
    </Stack>
  );
};

export default Pagination;
