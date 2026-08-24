import { Link } from 'react-router-dom';
import Pagination from '../../Components/pagination/pagination';
import { defaultConfig } from '../../App/configs/common';

const AllClasses = ({
  data,
  pagination,
  onPageChange,
}: {
  data: any[];
  loading: boolean;
  pagination: { current_page: number; last_page: number };
  onPageChange: (page: number) => void;
}) => {
  // Function to strip HTML tags from "about" field
  // const stripHtmlTags = (html: string | undefined) => {
  //   return html ? html.replace(/<\/?[^>]+(>|$)/g, '') : '';
  // };

  if (!data.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-96 w-full bg-transparent p-6 text-center ">
          <div className="mt-16 flex justify-center ">
            <img
              src="/images/Animation - 1739266164016.gif"
              alt=""
              className="w-40 shadow-[0_20px_50px_#70147c66] "
            />
          </div>
          <h2 className="mb-4 mt-5 text-xl font-semibold text-white ">
            No Classes Available.
          </h2>
          <p className="text-white"> Check back later!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col bg-transparent px-4">
      <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
        {data.map((cls) => (
          <div
            key={cls.id}
       className="mx-auto w-full max-w-xs overflow-hidden rounded-lg bg-white shadow-[0_20px_50px_#70147c66]"
          >
            <div className="relative">
              <img
                style={{ maxHeight: '375px' }}
                src={
                  cls.class_avatar
                    ? `${defaultConfig.BASE_ASSEST_URL}/${cls.class_avatar}`
                    : '/images/fallback.png'
                }
                alt="Class"
                className="h-auto w-full object-cover"
              />
            </div>
               <hr className="border-gray-300 w-full" />

            <div className="mt-4 px-4">
              <h4 className="max-h-7 min-h-7 text-sm font-semibold capitalize text-gray-800">
                {cls.name}
              </h4>
              {/* <p className="mt-1 line-clamp-2 max-h-8 min-h-8 break-words text-xs capitalize text-gray-600">
                {cls.description && stripHtmlTags(cls.description).length > 100
                  ? `${stripHtmlTags(cls.description).substring(0, 100)}...`
                  : stripHtmlTags(cls.description)}
              </p> */}

              <div className="mt-5 flex max-h-6 min-h-6 items-center gap-3">
                <span className="rounded-full bg-purple-100 px-2 py-1 text-xs capitalize text-purple-800">
                  {cls.category}
                </span>
                {cls.date_name && (
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs capitalize text-blue-800">
                    {cls.date_name}
                  </span>
                )}
              </div>

              {/* {cls?.isEnrolled === false && cls?.isPending === false ? (
                <div className="mt-4 max-h-4 min-h-4">
                  <span className="mb-2 mt-5 max-h-6 min-h-6 font-semibold text-[#F90909]">
                    Price: Rs {cls?.price}.00
                  </span>
                </div>
              ) : (
                <div className="mt-4 max-h-4 min-h-4">
                  <span className="mb-2 mt-5 max-h-6 min-h-6 font-semibold text-[#F90909]"></span>
                </div>
              )} */}
            </div>

            <div className="mt-4 flex items-center px-4 py-4">
              <div className="flex flex-grow items-center">
                <div className="mr-3 h-8 w-8 overflow-hidden rounded-full">
                  <img
                    src={`${defaultConfig.BASE_ASSEST_URL}/${cls.teacher.avatar}`}
                    alt="Teacher Avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500">by</p>
                  <h3 className="text-xs font-bold capitalize text-gray-900">
                    {cls.teacher.name}
                  </h3>
                </div>
              </div>
            </div>

            <div className="px-4 pb-2">
              {cls?.isEnrolled === true && cls?.isFree !== true ? (
                <button className="mb-2 mt-2 w-full rounded-lg bg-black py-2 text-white hover:bg-gray-400">
                  <Link
                    to={`/singleclass/${cls.id}`}
                    className="flex h-full w-full items-center justify-center text-white"
                  >
                    Attend
                  </Link>
                </button>
              ) : cls?.isPending === true ? (
                <button className="mb-2 mt-2 w-full rounded-lg bg-green-500 py-2 text-white">
                  <Link
                    to={`/singleclass/${cls.id}`}
                    className="flex h-full w-full items-center justify-center text-white"
                  >
                    Pending
                  </Link>
                </button>
              ) : cls?.isEnrolled === false ? (
                <button className="mb-2 mt-2 w-full rounded-lg bg-red-500 py-2 text-white">
                  <Link
                    to={`/singleclass/${cls.id}`}
                    className="flex h-full w-full items-center justify-center text-white"
                  >
                    Buy Now
                  </Link>
                </button>
              ) : cls?.isFree === true ? (
                // <button className="mb-2 mt-2 w-full rounded-lg bg-black py-2 text-white hover:bg-gray-400">
                <button className="mb-2 mt-2 w-full rounded-lg bg-green-500 py-2 text-white">
                  <Link
                    to={`/singleclass/${cls.id}`}
                    className="flex h-full w-full items-center justify-center text-white"
                  >
                    Attend Free
                  </Link>
                </button>
              ) : (
                <button className="mb-2 mt-2 w-full rounded-lg bg-black py-2 text-white hover:bg-gray-400">
                  <Link
                    to={`/singleclass/${cls.id}`}
                    className="flex h-full w-full items-center justify-center text-white"
                  >
                    Attend
                  </Link>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center ">
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default AllClasses;
