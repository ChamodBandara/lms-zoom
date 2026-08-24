import Mainbanner from '../../Components/mainbanner/mainbanner';
import { TailSpin } from 'react-loader-spinner';
import api from '../../services/api';
import { defaultConfig } from '../../App/configs/common';
import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {
  ChevronLeftCircle as CircleChevronLeft,
  ChevronRightCircle as CircleChevronRight,
  X,
} from 'lucide-react';
// import UpcommingClass from '../../Components/classcards/upcommingclass';
import MyClassesList from '../../Components/classcards/myClassesList';
// import OngoingClass from '../../Components/classcards/ongoingclass';
import UpcomingSeminars from '../../Components/classcards/upcomingSeminars';
import LessonPackages from '../../Components/classcards/lessonPackages';
import FreeClass from '../../Components/classcards/freeclass';
import { toast } from 'react-toastify';
import Headingbar from '../../Components/headingbar/headingbar';
import AppDetails from '../../Components/dashboard/app-details';

type UserData = { first_name: string; status: string; gender: any };

const Dashboard = () => {
  const [noticeData, setNoticeData] = useState<
    { notice_image: string; message: string; title: string }[]
  >([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalData, setModalData] = useState<{
    image: string;
    text: string;
    title: string;
  } | null>(null);
  // const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [ongoingClasses, setOngoingClasses] = useState([]);
  const [freeClasses, setFreeClasses] = useState([]);
  const [myClassesList, setmyClassesList] = useState([]);
  const [packList, setPackList] = useState([]);
  // const [showModal, setShowModal] = useState(false); // State to control modal visibility
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardResponse, classesResponse] = await Promise.all([
          api.get('/get_dashboard_data'),
          api.get('/get_live_classesList_mobile'),
        ]);

        setNoticeData(dashboardResponse.data.data.noticeData);
        setUserData(dashboardResponse.data.data.userData);

        // setUpcomingClasses(classesResponse.data.data.upcomingClassesList);
        setmyClassesList(classesResponse.data.data.myClassesList);
        setPackList(classesResponse.data.data.packList);

        // if (classesResponse.data.data.myClassesList.length === 0) {
        //   setShowModal(true);
        // }

        setOngoingClasses(classesResponse.data.data.upcomingSeminars);
        setFreeClasses(classesResponse.data.data.freeClassesList);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('An error occurred while fetching data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: noticeData.length > 2,
    speed: 500,
    slidesToShow: Math.min(noticeData.length, 3),
    slidesToScroll: Math.min(noticeData.length, 3),
    autoplay: noticeData.length > 2,
    autoplaySpeed: 5000,
    arrows: noticeData.length > 2,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
          arrows: true,
        },
      },
    ],
  };

  const openModal = (image: string, text: string, title: string) => {
    setModalData({ image, text, title });
  };

  const closeModal = () => {
    setModalData(null);
  };

  // const closeModalerror = () => {
  //   setShowModal(false);
  // };

  return (
    <div className="overflow-x-hidden p-2 sm:ml-64">
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
          <Headingbar title="Dashboard" />
          <div className="mt-5 flex flex-col items-center gap-6 md:gap-12">
            {/* {userData && <NotificationBar data={userData} />} */}

            {/* {showModal && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    maxWidth: '400px',
                    width: '100%',
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  <button
                    onClick={closeModalerror}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#666',
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <p className="p-5 text-black">
                    ඔබ මෙම මාසය සඳහා මේ වන තෙක් කිසිඳු පන්තියකට ඇතුලත් වී නොමැත.
                  </p>
                </div>
              </div>
            )} */}

            <Mainbanner
              first_name={userData?.first_name || 'Default Name'}
              gender={userData?.gender}
            />
          </div>
          <div className="w-full">
            <AppDetails />
          </div>

          {/* <div className="w-full">
            <UpcommingClass data={upcomingClasses} />
          </div> */}
          <div className="w-full">
            <MyClassesList data={myClassesList} />
          </div>

          {/* <div className="w-full">
            <OngoingClass data={ongoingClasses} />
          </div> */}

          <div className="w-full">
            <UpcomingSeminars data={ongoingClasses} />
          </div>

          <div className="w-full">
            <LessonPackages data={packList} />
          </div>

          <div className="w-full">
            <FreeClass data={freeClasses} />
          </div>

          {noticeData && noticeData.length > 0 && (
            <div className="mt-16 w-full rounded-lg bg-white p-5">
              <h1 className="text-center text-2xl font-semibold">Notices</h1>
              <div className="mt-8 flex w-full flex-col items-center justify-center overflow-hidden p-5">
                <Slider {...sliderSettings}>
                  {noticeData.map((item, index) => (
                    <div
                      key={index}
                      className="flex w-full items-center justify-center"
                      onClick={() =>
                        openModal(
                          `${defaultConfig.BASE_ASSEST_URL}/${item.notice_image}`,
                          item.message,
                          item.title,
                        )
                      }
                    >
                      <img
                        src={`${defaultConfig.BASE_ASSEST_URL}/${item.notice_image}`}
                        alt={`carousel-${index}`}
                        className="h-32 w-full cursor-pointer object-cover sm:h-80 sm:w-80"
                      />
                    </div>
                  ))}
                </Slider>
              </div>
            </div>
          )}
          {modalData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="custom-scrollbar relative h-auto max-h-[98vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-4">
                <button
                  onClick={closeModal}
                  className="absolute right-2 top-2 rounded-full bg-gray-500 p-2 text-white"
                >
                  <X size={16} />
                </button>
                <div className="flex w-full flex-col items-center justify-center space-y-4">
                  <div className="w-4/5">
                    <img
                      src={modalData.image}
                      alt="modal notice"
                      className="h-auto w-full object-contain shadow-xl"
                    />
                  </div>

                  <div className="w-4/5 rounded-lg border border-gray-300 bg-purple-200 p-2">
                    <div className="w-4/5 whitespace-pre-wrap text-left text-lg font-semibold lowercase text-gray-800">
                      {modalData.title}
                    </div>

                    <div
                      className="w-4/5 whitespace-pre-wrap text-left text-sm text-gray-800"
                      dangerouslySetInnerHTML={{ __html: modalData.text }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
