// import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {
  ChevronLeftCircle as CircleChevronLeft,
  ChevronRightCircle as CircleChevronRight,
} from 'lucide-react';
import { defaultConfig } from '../../App/configs/common';
import { Link } from 'react-router-dom';

type Teacher = {
  id: number;
  avatar: string;
  name: string;
};

type Payment = {
  id: number;
  payment_status: string;
  subscription_expiration_date: string;
};

type ClassData = {
  isFree: any;
  id: number;
  name: string;
  description: string;
  teacher: Teacher;
  class_avatar: string;
  type: string;
  category: string;
  date_name: string;
  teacher_id: number;
  isEnrolled: boolean;
  isPending: boolean;
  lst_payment_id: string;
  payment: Payment;
};

const UpcomingSeminars = ({ data }: { data: ClassData[] }) => {
  
  const NextArrow = ({ onClick }: { onClick?: () => void }) => (
    <div
      className="absolute right-[-1.2rem] top-1/2 z-10 -translate-y-1/2 transform cursor-pointer text-2xl text-black"
      onClick={onClick}
    >
      <CircleChevronRight color="#6F147B" fill="#dbc4de" />
    </div>
  );

  const PrevArrow = ({ onClick }: { onClick?: () => void }) => (
    <div
      className="absolute left-[-1.3rem] top-1/2 z-10 -translate-y-1/2 transform cursor-pointer text-2xl text-black"
      onClick={onClick}
    >
      <CircleChevronLeft color="#6F147B" fill="#dbc4de" />
    </div>
  );

  const sliderSettings = {
    dots: true,
    infinite: data.length > 2,
    speed: 500,
    slidesToShow: Math.min(data.length, 3),
    slidesToScroll: Math.min(data.length, 3),
    autoplay: data.length > 2,
    autoplaySpeed: 5000,
    arrows: data.length > 2,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024, // Tablet size (can be adjusted if necessary)
        settings: {
          slidesToShow: 1, // Show 2 slides for tablets
          slidesToScroll: 2,
          dots: true,
          arrows: true,
        },
      },
      {
        breakpoint: 768, // Mobile size
        settings: {
          slidesToShow: 1, // Show 1 slide for mobile
          slidesToScroll: 1,
          dots: true,
          arrows: true,
        },
      },
    ],
  };

  if (!data || data.length === 0) {
    return (
      <div className="mt-16 flex w-full justify-center">
        <div className="w-full">
          <h1 className="text-center text-2xl font-semibold sm:text-2xl">
          Upcoming Seminars
          </h1>
          <div className="mt-8 flex w-full justify-center">
            <div className="w-full rounded-lg bg-gray-50 p-8 text-center">
              <div className="flex justify-center">
                <img src="/images/Animation - 1739246445719.gif" alt="" />
              </div>
              <p className="text-gray-600">
                No Upcoming Seminars available at the moment
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {data && data.length > 0 && (
        <div className="mt-16 rounded-lg bg-white p-5 2xl:w-full">
          <h1 className="text-center text-2xl font-semibold">
             Upcoming Seminars
          </h1>
          <div className="mt-8 flex w-full flex-col items-center justify-center overflow-hidden p-5">
            <Slider {...sliderSettings}>
              {data.map((cls) => (
                <div
                  key={cls.id}
                  className="mb-2 flex w-64 flex-col items-center justify-center rounded-lg border border-gray-500 bg-white p-4 shadow-lg sm:w-80"
                >
                  <img
                    src={`${defaultConfig.BASE_ASSEST_URL}/${cls.class_avatar}`}
                    alt={`carousel-${cls.name}`}
                    className="h-40 w-64 cursor-pointer rounded-lg object-cover sm:h-48 sm:w-80"
                  />

                  <div className="w-full flex-grow p-3">
                  <h4 className="line-clamp-2 max-h-10 min-h-10 lg:max-w-[18vw] 2xl:max-w-[12vw] overflow-hidden text-xs font-semibold capitalize text-gray-800 sm:text-sm break-words">
                      {cls.name}
                    </h4>

                    {/* <p
                        className="mt-2 line-clamp-3 w-full max-w-[53vw] min-h-16 whitespace-normal break-words text-sm capitalize text-gray-600 lg:max-w-[21vw]"
                      dangerouslySetInnerHTML={{ __html: cls.description }}
                    /> */}
                    <div className="mt-4 flex items-center gap-2">
                      <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800 max-h-5 min-h-5">
                        {cls.category}
                      </span>
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 max-h-5 min-h-5">
                        {cls.date_name}
                      </span>
                    </div>

                    <div className="flex items-center py-4 max-h-16 min-h-16">
                      <div className="flex flex-grow items-center">
                        <div className="mr-3 h-8 w-8 overflow-hidden rounded-full">
                          <img
                            src={`${defaultConfig.BASE_ASSEST_URL}/${cls.teacher.avatar}`}
                            alt="Teacher Avatar"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs capitalize text-gray-500">by</p>
                          <h3 className="text-xs font-bold capitalize text-gray-900 sm:text-sm">
                            {cls.teacher.name}
                          </h3>
                        </div>
                      </div>
                      {cls.payment && (
                        <div className="text-right text-xs">
                          <p className="text-gray-500">Expires</p>
                          <p className="font-medium text-gray-900">
                            {new Date(
                              cls.payment.subscription_expiration_date,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
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
            </Slider>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingSeminars;
