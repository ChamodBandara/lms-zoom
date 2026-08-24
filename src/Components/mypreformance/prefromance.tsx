// import { Line } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';
// import api from '../../services/api';
// import { useEffect, useState } from 'react';

// interface PerformanceProps {
//   marks: {
//     className: string;
//     examName: string;
//     marks: number;
//     structure_marks: number;
//     totalQuestions: number;
//     examMonth: string;
//   }[];
// }

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// );

// function MyPerformance() {
//   const [data, setData] = useState<PerformanceProps>({ marks: [] });
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const fetchData = async (page: number) => {
//     try {
//       const response = await api.get(`/displayexammarks?page=${page}`);
//       console.log('API Response:', response.data);
//       const formattedData = response.data.marks.map((item: any) => ({
//         className: item.class.name,
//         examName: item.exam.name,
//         marks: item.marks,
//         structure_marks: item.recorrection_marks
//           ? item.recorrection_marks
//           : item.structure_marks,
//         totalQuestions: item.count,
//         examMonth: item.exam_month,
//       }));

//       setData({ marks: formattedData });
//       setTotalPages(response.data.totalPages);
//       setCurrentPage(response.data.currentPage);
//     } catch (error) {
//       console.error('Error fetching exam marks:', error);
//     }
//   };

//   useEffect(() => {
//     fetchData(1);
//   }, []);

//   const chartData = {
//     labels: data.marks.map((item) => `${item.examName} (${item.examMonth})`),
//     datasets: [
//       {
//         label: 'Exam Performance',
//         data: data.marks.map((item) =>
//           item.structure_marks !== undefined && item.structure_marks !== null
//             ? item.structure_marks
//             : item.marks || 0,
//         ),
//         borderColor: '#6F147B',
//         backgroundColor: 'rgba(111, 20, 123, 0.2)',
//         fill: true,
//       },
//     ],
//   };

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: 'top' as const,
//       },
//       tooltip: {
//         mode: 'index' as 'index',
//         intersect: false,
//       },
//     },
//     scales: {
//       x: {
//         beginAtZero: true,
//       },
//       y: {
//         beginAtZero: true,
//       },
//     },
//   };
//   console.log(data);
//   return (
//     <div className="mt-3 bg-white p-4">
//       <h2 className="ml-2 mt-5 text-2xl font-bold text-black">Exam Reports</h2>
//       <h2 className="ml-2 mt-2 text-sm text-black">Here are your marks</h2>

//       <div className="mt-6 h-96 bg-white p-4 shadow-lg">
//         <Line data={chartData} options={chartOptions} />
//       </div>

//       <div className="p-4 shadow-md">
//         <h2 className="ml-2 mt-5 text-2xl font-bold text-black">My Exams</h2>
//         <h2 className="ml-2 mt-2 text-sm text-black">Here are your marks</h2>

//         <div className="mt-5 overflow-x-auto">
//           <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
//             <thead className="bg-gray-800 text-xs uppercase text-white">
//               <tr>
//                 <th scope="col" className="px-4 py-3">
//                   Class Name
//                 </th>
//                 <th scope="col" className="px-4 py-3">
//                   Exam Name
//                 </th>
//                 <th scope="col" className="px-4 py-3">
//                   Month
//                 </th>
//                 <th scope="col" className="px-4 py-3">
//                   Marks
//                 </th>
//               </tr>
//             </thead>

//             <tbody>
//               {data.marks.length > 0 ? (
//                 data.marks?.map((item, index) => (
//                   <tr
//                     key={index}
//                     className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
//                   >
//                     <td className="px-4 py-4 font-medium text-gray-900">
//                       {item.className}
//                     </td>
//                     <td className="px-4 py-4">{item.examName}</td>
//                     <td className="px-4 py-4">{item.examMonth}</td>
//                     <td className="px-4 py-4">
//                       {item.structure_marks !== undefined &&
//                       item.structure_marks !== null
//                         ? `${item.structure_marks}`
//                         : `${item.marks || 0} / ${item.totalQuestions}`}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td
//                     colSpan={4}
//                     className="px-4 py-4 text-center text-gray-500"
//                   >
//                     No exam marks available.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {totalPages > 1 && (
//         <nav className="mt-4 flex justify-center">
//           <ul className="flex h-8 items-center -space-x-px text-sm">
//             <li>
//               <button
//                 onClick={() => fetchData(currentPage - 1)}
//                 disabled={currentPage === 1}
//                 className={`ms-0 flex h-8 items-center justify-center rounded-s-lg border border-e-0 border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''}`}
//               >
//                 <span className="sr-only">Previous</span>
//                 <svg
//                   className="h-2.5 w-2.5 rtl:rotate-180"
//                   aria-hidden="true"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 6 10"
//                 >
//                   <path
//                     stroke="currentColor"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M5 1 1 5l4 4"
//                   />
//                 </svg>
//               </button>
//             </li>
//             {[...Array(totalPages)].map((_, index) => (
//               <li key={index}>
//                 <button
//                   onClick={() => fetchData(index + 1)}
//                   className={`flex h-8 items-center justify-center border border-gray-300 bg-white px-3 leading-tight ${currentPage === index + 1 ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
//                 >
//                   {index + 1}
//                 </button>
//               </li>
//             ))}
//             <li>
//               <button
//                 onClick={() => fetchData(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//                 className={`flex h-8 items-center justify-center rounded-e-lg border border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''}`}
//               >
//                 <span className="sr-only">Next</span>
//                 <svg
//                   className="h-2.5 w-2.5 rtl:rotate-180"
//                   aria-hidden="true"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 6 10"
//                 >
//                   <path
//                     stroke="currentColor"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="m1 9 4-4-4-4"
//                   />
//                 </svg>
//               </button>
//             </li>
//           </ul>
//         </nav>
//       )}
//     </div>
//   );
// }

// export default MyPerformance;

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../../services/api';
import { useEffect, useState } from 'react';
import { TailSpin } from 'react-loader-spinner';

interface ExamMark {
  className: string;
  examName: string;
  marks: number;
  structure_marks: number | null;
  recorrection_marks: number | null;
  totalQuestions: number;
  examMonth: string;
}

interface PerformanceProps {
  marks: ExamMark[];
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

function MyPerformance() {
  const [data, setData] = useState<PerformanceProps>({ marks: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchData = async (page: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/displayexammarks?page=${page}`);

      const formattedData = response.data.marks.map((item: any) => ({
        className: item.class?.name || 'Not Available',
        examName: item.exam?.name || 'Not Available',
        marks: item.marks || 0,
        structure_marks: item.recorrection_marks ?? item.structure_marks,
        totalQuestions: item.count || 0,
        examMonth: item.exam_month || 'Not Available',
      }));

      setData({ marks: formattedData });
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      console.error('Error fetching exam marks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const chartData = {
    labels: data.marks.map((item) => `${item.examName} (${item.examMonth})`),
    datasets: [
      {
        label: 'Exam Performance',
        data: data.marks.map((item) =>
          item.structure_marks !== null ? item.structure_marks : item.marks,
        ),
        borderColor: '#6F147B',
        backgroundColor: 'rgba(111, 20, 123, 0.2)',
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <TailSpin height="40" width="40" color="#9b59b6" ariaLabel="loading" />
      </div>
    );
  }

  return (
    <div className="mt-3 bg-white p-4">
      <h2 className="ml-2 mt-5 text-2xl font-bold text-black">Exam Reports</h2>
      <h2 className="ml-2 mt-2 text-sm text-black">Here are your marks</h2>

      <>
        <div className="mt-6 h-96 bg-white p-4 shadow-lg">
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="p-4 shadow-md">
          <h2 className="ml-2 mt-5 text-2xl font-bold text-black">My Exams</h2>
          <h2 className="ml-2 mt-2 text-sm text-black">Here are your marks</h2>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
              <thead className="bg-gray-800 text-xs uppercase text-white">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Class Name
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Exam Name
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Month
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Marks
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.marks.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                  >
                    <td className="px-4 py-4 font-medium text-gray-900">
                      {item.className}
                    </td>
                    <td className="px-4 py-4">{item.examName}</td>
                    <td className="px-4 py-4">{item.examMonth}</td>
                    <td className="px-4 py-4">
                      {item.structure_marks !== null
                        ? item.structure_marks
                        : `${item.marks} / ${item.totalQuestions}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>

      {totalPages > 1 && (
        <nav className="mt-4 flex justify-center">
          <ul className="flex h-8 items-center -space-x-px text-sm">
            <li>
              <button
                onClick={() => fetchData(currentPage - 1)}
                disabled={currentPage === 1}
                className={`ms-0 flex h-8 items-center justify-center rounded-s-lg border border-e-0 border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <span className="sr-only">Previous</span>
                <svg
                  className="h-2.5 w-2.5 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 1 1 5l4 4"
                  />
                </svg>
              </button>
            </li>
            {[...Array(totalPages)].map((_, index) => (
              <li key={index}>
                <button
                  onClick={() => fetchData(index + 1)}
                  className={`flex h-8 items-center justify-center border border-gray-300 bg-white px-3 leading-tight ${currentPage === index + 1 ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => fetchData(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex h-8 items-center justify-center rounded-e-lg border border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <span className="sr-only">Next</span>
                <svg
                  className="h-2.5 w-2.5 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export default MyPerformance;
