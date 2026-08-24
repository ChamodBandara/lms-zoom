import { CircleCheckBig, Hourglass } from 'lucide-react';
import { Bars } from 'react-loader-spinner';
import Pagination from '../../Components/pagination/pagination';

// import React from "react";

const MyPaymentsHistory = ({
  data,
  loading,
  pagination,
  onPageChange,
}: {
  data: any[];
  loading: boolean;
  pagination: { current_page: number; last_page: number };
  onPageChange: (page: number) => void;
}) => {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Bars
          height="80"
          width="80"
          color="#4fa94d"
          ariaLabel="bars-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* <div className="flex items-center justify-center rounded-md bg-white p-4 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <span className="text-sm text-gray-600">
            All the details about your performance are listed below.
          </span>
          <div className="mt-4 flex items-center">
            <img
              src="/images/icons/bank1.png"
              alt="Bank Icon"
              className="h-7 w-6"
            />
            <h2 className="ml-2 text-xl font-bold text-gray-800">
              My Payments
            </h2>
          </div>
        </div>
      </div> */}

      <div className="flex items-start justify-start bg-white p-4 shadow-lg">
        <div className="flex flex-col text-left">
          <div className="mt-2 flex items-center">
            <h2 className="ml-2 text-2xl font-bold text-gray-800">
              Payment History
            </h2>
          </div>
          <span className="ml-2 mt-2 text-sm text-gray-600">
            Here is your full payment history.
          </span>
        </div>
      </div>

      <div className="relative overflow-x-auto bg-white p-4 shadow-md">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
          <thead className="bg-gray-800 text-xs uppercase text-white">
            <tr>
              <th scope="col" className="px-4 py-3">
                No
              </th>
              <th scope="col" className="px-4 py-3">
                Title
              </th>
              <th scope="col" className="px-4 py-3">
                Date
              </th>
              <th scope="col" className="px-4 py-3">
                Item
              </th>
              <th scope="col" className="px-4 py-3">
                Month
              </th>
              <th scope="col" className="px-4 py-3">
                Year
              </th>
              <th scope="col" className="px-4 py-3">
                Amount
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((payment, index) => (
                <tr
                  key={index}
                  className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                >
                  <td className="px-4 py-4">{index + 1}</td>
                  <td className="px-4 py-4 font-medium capitalize text-gray-900 dark:text-white">
                    {payment.reference}
                  </td>
                  <td className="px-4 py-4">
                    {new Date(payment.created_at).toISOString().split('T')[0]}
                  </td>
                  <td className="px-4 py-4 capitalize">{payment.item}</td>
                  <td className="px-4 py-4 capitalize">{payment.month}</td>
                  <td className="px-4 py-4 capitalize">{payment.year}</td>
                  <td className="px-4 py-4">Rs. {payment.amount}.00</td>
                  <td className="px-4 py-4">
                    {payment.payment_status === 'pending' ? (
                      <span className="inline-flex items-center rounded bg-[#FFA43C] px-3 py-1 text-xs font-medium text-white">
                        Ongoing
                        <Hourglass color="#ffffff" size={12} className="ml-2" />
                      </span>
                    ) : payment.payment_status === 'successful' ? (
                      <span className="inline-flex items-center rounded bg-green-500 px-6 py-1 text-xs font-medium text-white">
                        Paid
                        <CircleCheckBig
                          color="#ffffff"
                          size={12}
                          className="ml-2"
                        />
                      </span>
                    ) : payment.payment_status === 'failed' ? (
                      <span className="inline-flex items-center rounded bg-red-500 px-3 py-1 text-xs font-medium text-white">
                        Rejected
                        <CircleCheckBig
                          color="#ffffff"
                          size={12}
                          className="ml-2"
                        />
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded bg-gray-400 px-6 py-1 text-xs font-medium text-white">
                        Refunded
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="px-4 py-4 text-center text-gray-500">
                  No payment records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={pagination.current_page}
        lastPage={pagination.last_page}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default MyPaymentsHistory;
