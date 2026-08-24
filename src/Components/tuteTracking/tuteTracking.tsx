import { Hourglass } from 'lucide-react';
import { Bars } from 'react-loader-spinner';
import Pagination from '../pagination/pagination';
import { useState } from 'react';
// import React from "react";

const TuteTrackingPage = ({
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

const [showPopup, setShowPopup] = useState(false);
const [selectedTrackingId, setSelectedTrackingId] = useState('');


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
              Tute History
            </h2>
          </div>
          <span className="ml-2 mt-2 text-sm text-gray-600">
            Here is your full tute track history.
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
                Class Name
              </th>
              <th scope="col" className="px-4 py-3">
                Type
              </th>
               <th scope="col" className="px-4 py-3">
                Year and Month
              </th>
              <th scope="col" className="px-4 py-3">
                Action
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
                    {payment.itemName}
                  </td>
            
                  <td className="px-4 py-4 capitalize">{payment.type}</td>
                  <td className="px-4 py-4 capitalize"> {payment.year} - {payment.month}</td>
                  <td className="px-4 py-4">
                      {payment.real_tracking_id != null ? (
                        <button
                          onClick={() => {
                            setSelectedTrackingId(payment.real_tracking_id);
                            setShowPopup(true);
                          }}
                          className="inline-flex items-center rounded bg-[#FFA43C] px-3 py-1 text-xs font-medium text-white hover:bg-[#ff8c1a]"
                        >
                          Track
                          <Hourglass color="#ffffff" size={12} className="ml-2" />
                        </button>
                      ) : (
                        <span className="inline-flex items-center rounded bg-gray-400 px-6 py-1 text-xs font-medium text-white">
                          Processing...
                        </span>
                      )}
                   </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="px-4 py-4 text-center text-gray-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Tracking Information</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-1">Tracking ID:</p>
              <div className="flex items-center justify-between border px-3 py-2 rounded">
                <span className="text-sm">{selectedTrackingId}</span>
                <button
                  className="ml-2 text-blue-600 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedTrackingId);
                    alert('Tracking ID copied!');
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="flex justify-between">
              <a
                href="https://slpmail.slpost.gov.lk/track/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                Track Now
              </a>
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-600 text-sm hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      <Pagination
        currentPage={pagination.current_page}
        lastPage={pagination.last_page}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default TuteTrackingPage;
