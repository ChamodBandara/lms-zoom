import { useEffect, useState } from 'react';
import {
  // BellRing,
  // BookOpenCheck,
  // FileSpreadsheet,
  // HandHelping,
  // House,
  TicketPercent,
  // UserRoundPen,
  // ChartNoAxesCombined,
  // MessageSquareText,
  // NotebookText,
  Album,
  // Ellipsis,
  Video,
  // ChevronDown,
  // HeartHandshake,
  // ShieldQuestion,
  // BookOpen,
  // StickyNote,
  // BookmarkPlus,
  // Ellipsis,
  // Users,
  // Package,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { onMessageListener } from '../../firebaseInit';
import { toast } from 'react-toastify';

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState<number | null>(null); // Active item state
  // const [notificationCount, setNotificationCount] = useState(0);
  const [openDropdown, ] = useState<number | null>(null);
  const [hoveredDropdown] = useState<number | null>(null);

  const stripHtmlTags = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  const handleItemClick = (itemId: number) => {
    setActiveItem(itemId); // Set the clicked item as active
    if (itemId === 5) {
      // setNotificationCount(0);
      localStorage.setItem('notificationCount', '0'); // Reset localStorage
    }
  };

  // const toggleDropdown = (dropdownId: number) => {
  //   setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  // };

  useEffect(() => {
    const storedCount = localStorage.getItem('notificationCount');
    if (storedCount) {
      // setNotificationCount(parseInt(storedCount, 10));
    }

    onMessageListener((payload) => {
      // setNotificationCount((prevCount) => {
      //   const newCount = prevCount + 1;
      //   localStorage.setItem('notificationCount', newCount.toString());
      //   return newCount;
      // });

      if (payload.notification) {
        const { title, body } = payload.notification;

        const cleanBody = stripHtmlTags(body);

        toast.info(`${title}: ${cleanBody}`, {
          position: 'top-right',
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    });
  }, []);

  const getLinkClass = (itemId: number) => {
    return activeItem === itemId
      ? 'bg-theme text-white'
      : 'text-gray-900 hover:bg-theme hover:text-white';
  };

  return (
    <div className="hide-scrollbar h-full overflow-y-auto bg-gray-50 px-3 py-4 shadow-lg dark:bg-gray-800">
      <Link to="/dashboard">
        <div className="ml-2 flex h-28 w-52 items-center justify-center p-5">
          <img
            src="/images/logo.png"
            alt="Logo"
            className="h-full w-full object-contain"
          />
        </div>
      </Link>

      <ul className="space-y-2 font-medium">
        {/* <li>
          <Link
            to="/profile"
            onClick={() => handleItemClick(1)}
            className={`flex items-center rounded-lg p-2 ${getLinkClass(1)}`}
          >
            <UserRoundPen className="me-2" />
            My Profile
          </Link>
        </li> */}

        {/* <li>
          <Link
            to="/dashboard"
            onClick={() => handleItemClick(0)}
            className={`flex items-center rounded-lg p-2 ${getLinkClass(0)}`}
          >
            <House />
            <span className="ms-3">Dashboard</span>
          </Link>
        </li> */}

        {/* <li>
          <Link
            to="/notifications"
            onClick={() => handleItemClick(5)}
            className={`flex items-center rounded-lg p-2 ${getLinkClass(5)}`}
          >
            <BellRing className="me-2" />
            My Notifications
            {notificationCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-1 text-xs font-bold leading-none text-red-100">
                {notificationCount}
              </span>
            )}
          </Link>
        </li> */}

        {/* <li>
          <Link
            to="/time-table"
            onClick={() => handleItemClick(2)}
            className={`flex items-center rounded-lg p-2 ${getLinkClass(2)}`}
          >
            <FileSpreadsheet className="me-2" />
            Time Table
          </Link>
        </li> */}

        {/* <li>
          <Link
            to="/everest-id"
            onClick={() => handleItemClick(4)}
            className={`flex items-center rounded-lg p-2 ${getLinkClass(4)}`}
          >
            <IdCard className="me-2" />
            Everest ID
          </Link>
        </li> */}

        {/* comming soon" */}

        {/* <Link
          to="/coming-soon"
          onClick={() => handleItemClick(29)}
          className={`flex items-center rounded-lg p-2 ${getLinkClass(29)}`}
        >
          <BookOpenCheck className="me-2" />
          Classes
        </Link> */}

        {/* Dropdown for "Classes" */}
        <li>
          {/* <button
            type="button"
            className="group flex w-full items-center rounded-lg p-2 text-base text-gray-900 hover:bg-theme hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              toggleDropdown(1);
            }}
          >
            <BookOpenCheck />
            <span className="ms-3 flex w-full items-center justify-between">
              <span>Classes</span>
              <ChevronDown />
            </span>
          </button> */}
          <ul
            className={`space-y-2 py-2 ${
              openDropdown === 1 || hoveredDropdown === 1 ? 'block' : 'hidden'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* <li>
              <Link
                to="/liveclass"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick(6);
                }}
                className={`ml-5 flex items-center rounded-lg p-2 ${getLinkClass(6)}`}
              >
                <Video className="me-2" />
                <div className="text-sm font-normal">Live Classes</div>
              </Link>
            </li> */}
            {/* <li>
              <Link
                to="/all-class"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick(7);
                }}
                className={`ml-5 flex items-center rounded-lg p-2 ${getLinkClass(7)}`}
              >
                <Album className="me-2" />
                <div className="text-sm font-normal">All Classes</div>
              </Link>
            </li> */}
            {/* <li>
              <Link
                to="/pastclass"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick(8);
                }}
                className={`ml-5 flex items-center rounded-lg p-2 ${getLinkClass(8)}`}
              >
                <History className="me-2" />
                <div className="text-sm font-normal">Past Lessons</div>
              </Link>
            </li> */}

            {/* <li>
              <Link
                to="/classpurchase"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick(10);
                }}
                className={`ml-5 flex items-center rounded-lg p-2 ${getLinkClass(10)}`}
              >
                <TicketPercent className="me-2" />
                <div className="text-sm font-normal">Purchased Classes</div>
              </Link>
            </li> */}

            {/* <li>
              <Link
                to="/tute-tracking"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick(11);
                }}
                className={`ml-5 flex items-center rounded-lg p-2 ${getLinkClass(11)}`}
              >
                <BookOpenText className="me-2" />
                <div className='font-normal text-sm'>
                Tutes Tracking
                </div>
              </Link>
            </li> */}
          </ul>
        </li>


        

       <li>
              <Link
                to="/liveclass"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick(6);
                }}
                className={`ml-2 flex items-center rounded-lg p-2 ${getLinkClass(6)}`}
              >
                <Video className="me-2" />
                <div className="text-sm font-normal">Live Classes</div>
              </Link>
            </li>


            <li>
              <Link
                to="/all-class"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick(7);
                }}
                className={`ml-2 flex items-center rounded-lg p-2 ${getLinkClass(7)}`}
              >
                <Album className="me-2" />
                <div className="text-sm font-normal">All Classes</div>
              </Link>
            </li>

              <li>
              <Link
                to="/classpurchase"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick(10);
                }}
                className={`ml-2 flex items-center rounded-lg p-2 ${getLinkClass(10)}`}
              >
                <TicketPercent className="me-2" />
                <div className="text-sm font-normal">Purchased Classes</div>
              </Link>
            </li>

        {/* <li>
          <Link
            to="/studypacks"
            onClick={(e) => {
              e.stopPropagation();
              handleItemClick(9);
            }}
            className={`flex items-center rounded-lg p-2 ${getLinkClass(9)}`}
          >
            <NotebookText className="me-2" />
            <div className="ms-3">Study Packs</div>
          </Link>
        </li> */}

        {/* <li>
          <Link
            to="/my-studypacks"
            onClick={(e) => {
              e.stopPropagation();
              handleItemClick(59);
            }}
            className={`flex items-center rounded-lg p-2 ${getLinkClass(59)}`}
          >
            <BookOpen className="me-2" />
            <div className="ms-3">My Study Packs</div>
          </Link>
        </li> */}

        {/* <li>
          <button
            type="button"
            className="group flex w-full items-center rounded-lg p-2 text-base text-gray-900 hover:bg-theme hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              toggleDropdown(2);
            }}
          >
            <BookOpenCheck />
            <span className="ms-3 flex w-full items-center justify-between">
              <span>Packs</span>
              <ChevronDown />
            </span>
          </button>
          <ul
            className={`space-y-2 py-2 ${openDropdown === 2 || hoveredDropdown === 2 ? 'block' : 'hidden'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <li>
              <Link
                to="/studypacks"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick(9);
                }}
                className={`ml-5 flex items-center rounded-lg p-2 ${getLinkClass(9)}`}
              >
                <NotebookText className="me-2" />
                <div className="text-sm font-normal">Study Packs</div>
              </Link>
            </li>

            <li>
              <Link
                to="/my-studypacks"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick(59);
                }}
                className={`ml-5 flex items-center rounded-lg p-2 ${getLinkClass(59)}`}
              >
                <BookOpen className="me-2" />
                <div className="text-sm font-normal">My Study Packs</div>
              </Link>
            </li>
          </ul>
        </li> */}

        {/* <li>
          <Link
            to="/community"
            // to="/coming-soon"
            onClick={() => handleItemClick(40)}
            className={`flex items-center rounded-lg p-2 ${getLinkClass(40)}`}
          >
            <MessageSquareText className="me-2" />
            Community
          </Link>
        </li> */}
        {/* 
        <Link
          to="/semina-enrollment"
          onClick={() => handleItemClick(31)}
          className={`flex items-center rounded-lg p-2 ${getLinkClass(31)}`}
        >
          <BookmarkPlus className="me-2" />
          Seminar
        </Link> */}

        {/* <li>
          <Link
            to="/all-teachers"
            onClick={() => handleItemClick(3)}
            className={`flex items-center rounded-lg p-2 ${getLinkClass(3)}`}
          >
            <ContactRound className="me-2" />
            Teachers List
          </Link>
        </li> */}

        {/* <Link
          to="/performance"
          onClick={() => handleItemClick(30)}
          className={`flex items-center rounded-lg p-2 ${getLinkClass(30)}`}
        >
          <ChartNoAxesCombined className="me-2" />
          Performance
        </Link> */}

        {/* Dropdown for "Performance" */}
        {/* <li>
          <Link to="/coming-soon">
            <button
              type="button"
              className="group flex w-full items-center rounded-lg p-2 text-base text-gray-900 hover:bg-theme hover:text-white"
              onClick={() => toggleDropdown(2)}
            >
              <ChartNoAxesCombined />
              <span className="ms-3 flex w-full items-center justify-between">
                <span>Preformance</span>
                <Ellipsis />
              </span>
            </button>
          </Link>
          <ul
            className={`space-y-2 py-2 ${openDropdown === 2 ? 'block' : 'hidden'}`}
          >
            <li>
              <Link
                to="/performance"
                onClick={() => handleItemClick(13)} 
                className={`ml-2 flex items-center rounded-lg p-2 ${getLinkClass(13)}`}
              >
                <Trophy className="me-2" />
                My Performance
              </Link>
            </li>
          </ul>
        </li> */}

        {/* Dropdown for "Seminar" */}

        {/* <li>
          <Link to="/semina-page">
            <button
              type="button"
              className="group flex w-full items-center rounded-lg p-2 text-base text-gray-900 hover:bg-theme hover:text-white"
              onClick={() => toggleDropdown(3)}
            >
              <BookmarkPlus />
              <span className="ms-3 flex w-full items-center justify-between">
                <span>Seminar</span>
                <ChevronDown />
              </span>
            </button>
          </Link>
          <ul
            className={`space-y-2 py-2 ${openDropdown === 3 ? 'block' : 'hidden'}`}
          >
            <li>
              <Link
                to="/semina-enrollment"
                onClick={() => handleItemClick(14)}
                className={`ml-5 flex items-center rounded-lg p-2 ${getLinkClass(14)}`}
              >
                <Users className="me-2" />
                <div className="text-sm font-normal">Seminar Enroll</div>
              </Link>
            </li>
          </ul>
        </li> */}

        {/* Other Links */}

        {/* <Link
          to="/mypayments"
          onClick={() => handleItemClick(32)}
          className={`flex items-center rounded-lg p-2 ${getLinkClass(32)}`}
        >
          <TicketPercent className="me-2" />
          Purchase
        </Link>

        <Link
          to="/tute-tracking"
          onClick={() => handleItemClick(34)}
          className={`flex items-center rounded-lg p-2 ${getLinkClass(34)}`}
        >
          <Package className="me-2" />
          Tute Tracking
        </Link> */}

{/* 
        <li>
          <Link
            to="/help-desk"
            // to="/coming-soon"
            onClick={() => handleItemClick(41)}
            className={`flex items-center rounded-lg p-2 ${getLinkClass(41)}`}
          >
            <HeartHandshake className="me-2" />
            Help Desk
          </Link>
        </li> */}

        {/* <li>
          <Link to="/coming-soon">
            <button
              type="button"
              className="group flex w-full items-center rounded-lg p-2 text-base text-gray-900 hover:bg-theme hover:text-white"
              onClick={() => toggleDropdown(4)}
            >
              <TicketPercent />
              <span className="ms-3 flex w-full items-center justify-between">
                <span>Purchase</span>
                <Ellipsis />
              </span>
            </button>
          </Link>
          <ul
            className={`space-y-2 py-2 ${openDropdown === 4 ? 'block' : 'hidden'}`}
          >
            <li>
              <Link
                to="/packpayments"
                onClick={() => handleItemClick(16)} 
                className={`ml-2 flex items-center rounded-lg p-2 ${getLinkClass(16)}`}
              >
                <BookCopy className="me-2" />
                Study Pack
              </Link>
            </li>

            <li>
              <Link
                to="/mypayments"
                onClick={() => handleItemClick(17)} 
                className={`ml-2 flex items-center rounded-lg p-2 ${getLinkClass(17)}`}
              >
                <HandCoins className="me-2" />
                Class Payment
              </Link>
            </li>

            <li>
              <Link
                to="/bankdetails"
                onClick={() => handleItemClick(15)}
                className={`ml-2 flex items-center rounded-lg p-2 ${getLinkClass(15)}`}
              >
                <Landmark className="me-2" />
                Bank Details
              </Link>
            </li>
          </ul>
        </li> */}

        <li>
          {/* <Link
            to="/support"
            onClick={() => handleItemClick(28)}
            className={`flex items-center rounded-lg p-2 ${getLinkClass(28)}`}
          >
            <HandHelping className="me-2" />
            Group Links
          </Link> */}

          {/* <button
            type="button"
            className="dark:text-white dark:hover:bg-gray-700 group flex w-full items-center rounded-lg p-2 text-base text-gray-900 transition duration-75 hover:bg-gray-100"
            // onClick={() => toggleDropdown(7)}
          >
            <Link
              to="/support"
              className="flex w-full items-center justify-between"
            >
              <HandHelping />
              <span className="ms-3 flex w-full items-center justify-between">
                <span>Support</span>
              </span>
            </Link>
          </button> */}
          {/* <ul
            className={`space-y-2 py-2 ${openDropdown === 7 ? 'block' : 'hidden'}`}
          >
            <li>
              <Link
                to="/support"
                className="ml-2 flex items-center rounded-lg p-2 text-gray-900 hover:bg-theme hover:text-white"
              >
                <img
                  src="images/icons/Vector (14).png"
                  alt="Help & Support"
                  className="me-2 h-5 w-5"
                />
                Telegram
              </Link>
            </li>
            <li>
              <Link
                to="/tiktok"
                className="ml-2 flex items-center rounded-lg p-2 text-gray-900 hover:bg-theme hover:text-white"
              >
                <img
                  src="images/icons/Vector (15).png"
                  alt="Help & Support"
                  className="me-2 h-5 w-5"
                />
                Tiktok
              </Link>
            </li>
            <li>
              <Link
                to="https://www.youtube.com/@UjithHemachandra"
                className="ml-2 flex items-center rounded-lg p-2 text-gray-900 hover:bg-theme hover:text-white"
              >
                <Youtube className="me-2" />
                Youtube
              </Link>
            </li>
            <li>
              <Link
                to="/whatsapp"
                className="ml-2 flex items-center rounded-lg p-2 text-gray-900 hover:bg-theme hover:text-white"
              >
                <img
                  src="images/icons/Vector (17).png"
                  alt="Help & Support"
                  className="me-2 h-5 w-5"
                />
                Whatsapp
              </Link>
            </li>
          </ul> */}
        </li>

        {/* <li>
          <Link
            to="/about-us"
            onClick={() => handleItemClick(60)}
            className={`flex items-center rounded-lg p-2 ${getLinkClass(60)}`}
          >
            <ShieldQuestion className="me-2" />
            About Us
          </Link>
        </li> */}
      </ul>
    </div>
  );
};

export default Sidebar;
