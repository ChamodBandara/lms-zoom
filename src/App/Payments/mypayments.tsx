// import React from 'react'

import MyPaymentsHistory from '../../Components/mypayments/mypayments';
import ClassHeader from '../../Components/ClassHeaders/page';
import Headingbar from '../../Components/headingbar/headingbar';
import Filters from '../../Components/Filters/page';
import api from '../../services/api';
import { useState, useEffect } from 'react';
import { TailSpin } from 'react-loader-spinner';


function PackPayments() {
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    posted_at: 'DESC',
    pageLimit: '10',
    teacher_id: '',
    subject: '',
    payment_status: '',
    category: '',
    page: 1,
  });

  const [paymentData, setPaymentData] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const response = await api.get('/get_paymet_details', {
          params: filters, // Pass filters as query parameters
        });
        setPaymentData(response.data.data.paymentList.data); // Save the API response to state
        setPagination({
          current_page: response.data.data.paymentList.current_page,
          last_page: response.data.data.paymentList.last_page,
        });
      } catch (error) {
        console.error('Error fetching payment data:', error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [filters]);

  const handleFiltersChange = (newFilters: any) => {
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
          <div className="flex flex-col gap-5">
            <Headingbar title="purchase" />
            <ClassHeader
              sub_text="All the details about class payments you need are listed below."
              main_text="Class payments"
              icon="images/icons/bank1.png"
            />
          </div>
          <div className="mt-5">
            <Filters onFiltersChange={handleFiltersChange} />
            <hr className="border-gray-200 w-full" />
          </div>

          <MyPaymentsHistory
            data={paymentData}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange} // Pass the page change handler
          />
        </>
      )}
    </div>
  );
}

export default PackPayments;
