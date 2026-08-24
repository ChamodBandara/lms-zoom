import { Link } from 'react-router-dom';
import Pagination from '../../Components/pagination/pagination';
import { defaultConfig } from '../../App/configs/common';

const TeachersList = ({
  data,
  pagination,
  onPageChange,
}: {
  data: {
    id: number;
    avatar: string;
    name: string;
    subject: string;
    about: string;
  }[];
  loading: boolean;
  pagination: { current_page: number; last_page: number };
  onPageChange: (page: number) => void;
}) => {
  // Function to strip HTML tags from "about" field

  if (!data.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="mt-20 text-center text-gray-500">
          No teachers found.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-10 grid grid-cols-1 justify-items-center gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
        {data.map((teacher) => (
          <div
            key={teacher.id}
            className="mx-auto w-full overflow-hidden rounded-lg bg-white shadow-md"
          >
            <div className="relative p-2 ">
              <img

                src={`${defaultConfig.BASE_ASSEST_URL}/${teacher.avatar}`}
                alt={teacher.name || 'Teacher'}
                className="w-full rounded-lg object-cover"
                style={{
                  minHeight: '14rem',
                  maxHeight: '14rem',
                }}
              />
            </div>

            <div className="flex items-center px-6 py-1">
              <div className="flex min-h-10 flex-grow items-center">
                <div>
                  <h3 className="text-sm font-bold capitalize text-gray-900 line-clamp-1 ">
                    {teacher.name}
                  </h3>
                </div>
              </div>
            </div>


            <div className="ml-2 min-h-15 max-h-32 p-">
              <h4 className="text-lg font-semibold capitalize text-gray-800 min-h-8 max-h-8">
                {/* {teacher.subject} */}
                <span className="rounded-full bg-purple-100 px-2 py-1 text-xs capitalize text-purple-800">
                  {teacher.subject}
                </span>
              </h4>
              {/* <p className="mt-2 break-words text-sm capitalize text-gray-600">
                {teacher.about && stripHtmlTags(teacher.about).length > 100
                  ? `${stripHtmlTags(teacher.about).substring(0, 100)}...`
                  : stripHtmlTags(teacher.about)}
              </p> */}
            </div>

            <div className="px-6 pb-2">
              <button className="mb-2 mt-2 w-full rounded-lg bg-black py-2 text-white hover:bg-gray-400">
                <Link
                  to={`/single-teacher/${teacher.id}`}
                  className="flex h-full w-full items-center justify-center text-white"
                >
                  View
                </Link>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          onPageChange={onPageChange}
        />
      </div>
    </>
  );
};

export default TeachersList;
