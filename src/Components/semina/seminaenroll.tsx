// import { Armchair } from 'lucide-react';
import { Link } from 'react-router-dom';
import { defaultConfig } from '../../App/configs/common';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { TailSpin } from 'react-loader-spinner';

interface SeminaProps {
  id: string;
  name: string;
  description: string;
  start_date: string;
  due_date: string;
  stream: [];
  type: string;
  price: string;
  teacher_id: string;
  seminar_avatar: string;
  video_link: string;
  attachment: string;
  isEnrolled: boolean;
  isPending: boolean;
  isFree: boolean;
  teacher: {
    avatar: string;
    id: string;
    name: string;
  };
}

function SeminaEnroll() {
  const [data, setData] = useState<SeminaProps[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/getallseminar');
        setIsLoading(true);
        setData(res.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
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
        <div className="mt-4 flex h-screen w-full flex-col rounded-lg bg-white px-4">
          {data.length > 0 ? (
            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
              {data.map((cls) => (
                <div
                  key={cls.id}
                  className="mx-auto w-full max-w-xs overflow-hidden rounded-lg bg-white shadow-xl"
                >
                  <div className="relative">
                    <img
                      style={{ maxHeight: '375px' }}
                      src={
                        cls.seminar_avatar
                          ? `${defaultConfig.BASE_ASSEST_URL}/${cls.seminar_avatar}`
                          : '/images/fallback.png'
                      }
                      alt="Class"
                      className="h-auto w-full object-cover"
                    />
                  </div>

                  <div className="mt-4 px-4">
                    <h4 className="max-h-7 min-h-7 text-sm font-semibold capitalize text-gray-800">
                      {cls.name}
                    </h4>

                    <div className="mt-3 flex max-h-6 min-h-6 items-center gap-3">
                      {/* <span className="rounded-full bg-purple-100 px-2 py-1 text-xs capitalize text-purple-800">
                      {cls.type}
                    </span> */}
                    <span
                      className={`rounded-full px-2 py-1 text-xs capitalize ${
                        new Date(cls.start_date) < new Date()
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {new Date(cls.start_date) < new Date()
                        ? 'Expired'
                        : `Date : ${cls.start_date}`}
                    </span>


                    </div>
                  </div>

                  <div className="px-4 pb-2">
                    {cls?.isEnrolled === true ? (
                      <button className="mb-2 mt-2 w-full rounded-lg bg-black py-2 text-white hover:bg-gray-400">
                        <Link
                          to={`/semina-enrollment/${cls.id}`}
                          className="flex h-full w-full items-center justify-center text-white"
                        >
                          Attend
                        </Link>
                      </button>
                    ) : cls.isFree ? (
                      <button className="mb-2 mt-2 w-full rounded-lg bg-black py-2 text-white hover:bg-gray-400">
                        <Link
                          to={`/semina-enrollment/${cls.id}`}
                          className="flex h-full w-full items-center justify-center text-white"
                        >
                          Attend
                        </Link>
                      </button>
                    ) : cls?.isPending === true ? (
                      <button className="mb-2 mt-2 w-full rounded-lg bg-green-500 py-2 text-white">
                        <Link
                          to={`/semina-enrollment/${cls.id}`}
                          className="flex h-full w-full items-center justify-center text-white"
                        >
                          Pending
                        </Link>
                      </button>
                    ) : cls?.isEnrolled === false ? (
                      <button className="mb-2 mt-2 w-full rounded-lg bg-red-500 py-2 text-white">
                        <Link
                          to={`/semina-enrollment/${cls.id}`}
                          className="flex h-full w-full items-center justify-center text-white"
                        >
                          Buy Now
                        </Link>
                      </button>
                    ) : (
                      <button className="mb-2 mt-2 w-full rounded-lg bg-black py-2 text-white hover:bg-gray-400">
                        <Link
                          to={`/semina-enrollment/${cls.id}`}
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
          ) : (
            <div className="mt-6 flex h-screen flex-col items-center justify-center bg-white text-center">
              <img src="images/Animation - 1739266164016.gif" alt="No data" />
              <p className="text-sm text-gray-600">No Seminar available</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default SeminaEnroll;
