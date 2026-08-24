import {
  useState,
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
} from 'react';
import { ArrowLeft, Download, GraduationCap, Play } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
// import { CopyTextButton } from '../../lib/copyTextButton';
// import { useNavigate } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { defaultConfig } from '../../App/configs/common';
import { TailSpin } from 'react-loader-spinner';
// import TuteRequestModal from '../singleClass/tute-request-payment/page';
import { useChatContext } from '../../context/ChatContext';
import ReCAPTCHA from 'react-google-recaptcha';

interface ClassLink {
  id: number;
  class_id: number;
  name: string;
  link_type: string;
  thumbnail: string;
  video_id: string;
  video_platform: string;
  class_shedule_image: string;
  isEnrolled: boolean;
  year: number;
  month: number;
  createdAt: string;
}

interface TransformedClassLink extends ClassLink {
  groupName: any;
  yearString: string;
  monthString: string;
  isPayed: boolean;
  isPending: boolean;
}

interface SheduleClass {
  id: number;
  class_id: number;
  class_shedule_image: string;
  location: string;
  type: string;
  day: string;
  start_time: string;
  end_time: string;
  links: string;
}

interface SingleClassProps {
  isEnrolledFree: boolean | undefined;
  isEnrolledLastWeek: boolean | undefined;
  start_time: string;
  isSheduleclassStatus: string;
  nextMonthName: string;
  id: number;
  name: string;
  subject: string;
  price: any;
  description: string;
  avatar: string;
  class_avatar: string;
  date: string;
  time: string;
  category: string;
  date_name: string;
  academic_year: string;
  class_links_type: ClassLink[];
  sheduleclass: SheduleClass[];
  teacher: {
    id: number;
    name: string;
    avatar: string;
    teacher_details: {
      qulification: number;
    };
  };
  type: string;
  video_id: string;
  video_platform: string;
  pay_type: string;
  transaction_id: string;
  isEnrolled: boolean;
  isFree: boolean;
  isPending: boolean;
  hasRequestedTute: boolean;
  isUserstatus: string;
}

function SingleClass() {
  const [classDetails, setClassDetail] = useState<SingleClassProps | null>(
    null,
  );

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [] = useState<string>(''); // Added this state for the meeting ID
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [filteredVideos, setFilteredVideos] = useState<any[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableMonths, setAvailableMonths] = useState<
    {
      hasData: any;
      value: string;
      name: string;
      isPayed: boolean;
      isPending: boolean;
      linkTypes: string[];
    }[]
  >([]);
  const [selectedName, setSelectedName] = useState<string>('All');
  const [availableNames, setAvailableNames] = useState<string[]>([]);

  const now = new Date();
  const currentMonth = now.toLocaleString('default', { month: 'long' }); // e.g., "June"
  const currentYear = now.getFullYear().toString(); // e.g., "2025"
  const [selectedMonthPay, setSelectedMonthPay] = useState(currentMonth);
  const [selectedYearPay, setSelectedYearPay] = useState(currentYear);
  const [token, setToken] = useState<string | null>(null);
  // const years = ['2022', '2023', '2024', '2025'];
  // const months = [
  //   'January', 'February', 'March', 'April', 'May', 'June',
  //   'July', 'August', 'September', 'October', 'November', 'December',
  // ];


      // --- Electron/Deep Link Integration Start ---
    const { id } = useParams();
    const [, setDeepLinkData] = useState<any>(null);
    const [, setIsElectron] = useState(false);
    const [authToken, setAuthToken] = useState<string | null>(null);

  // const navigate = useNavigate();

        useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      const user_idFromUrl = urlParams.get('user_id');
      const nameFromUrl = urlParams.get('name');
      const avatarFromUrl = urlParams.get('avatar');
  
      if (tokenFromUrl) {
        localStorage.setItem('authToken', tokenFromUrl);
        
        localStorage.setItem('user_id', user_idFromUrl || ""); // Avoid null storage
        localStorage.setItem('name', nameFromUrl || ""); // Avoid null storage
        localStorage.setItem('avatar', avatarFromUrl || ""); // Avoid null storage
        setToken(tokenFromUrl);  // Update state


      }
    }, []);
  
    useEffect(() => {
      if (token) {
        // navigate('/dashboard', {
        //   state: { mobile_contact_number: "" },
        // });
      }
    }, [token]); // Only depend on token
    
    useEffect(() => {
        // Check if we're running in Electron
        const checkElectron = () => {
            return typeof window !== 'undefined' &&
                ((window as any).process && (window as any).process.type === 'renderer' ||
                    (window as any).require ||
                    navigator.userAgent.toLowerCase().indexOf('electron') > -1);
        };

        const isElectronApp = checkElectron();
        setIsElectron(isElectronApp);

        if (isElectronApp) {
            // Method 1: Listen for custom event
            const handleDeepLinkEvent = (event: any) => {
                setDeepLinkData(event.detail);
                handleAutoLogin(event.detail);
            };
            window.addEventListener('deep-link-data', handleDeepLinkEvent);

            // Method 2: Check if data is already available
            const checkForDeepLinkData = () => {
                if ((window as any).deepLinkData) {
                    setDeepLinkData((window as any).deepLinkData);
                    handleAutoLogin((window as any).deepLinkData);
                }
            };
            checkForDeepLinkData();
            setTimeout(checkForDeepLinkData, 100);
            setTimeout(checkForDeepLinkData, 500);

            // Method 3: Try to get data via IPC if available
            if ((window as any).require) {
                try {
                    const { ipcRenderer } = (window as any).require('electron');
                    ipcRenderer.invoke('get-deep-link-data').then((data: any) => {
                        if (data && data.authToken) {
                            setDeepLinkData(data);
                            handleAutoLogin(data);
                        }
                    }).catch(() => {
                        // Swallow unused error
                    });
                } catch (error) {
                    //
                }
            }
            return () => {
                window.removeEventListener('deep-link-data', handleDeepLinkEvent);
            };
        }
    }, []);

    const handleAutoLogin = (data: any) => {
        if (data && data.authToken) {
            const tokenData = data.authToken;
            setAuthToken(tokenData);
            localStorage.setItem('authToken', tokenData);
        }
    };

    // If not set by Electron, fallback to localStorage
    useEffect(() => {
        if (!authToken) {
            const token = localStorage.getItem('authToken');
            if (token) setAuthToken(token);
        }
    }, [authToken]);

    // --- Electron/Deep Link Integration End ---

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const [formData, setFormData] = useState({
    referenceNumber: '',
    bankName: '',
    slipImage: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const [tuteRequests, setTuteRequests] = useState<any[]>([]);

//   const handleTuteSubmit = (data: any) => {
//     setTuteRequests([data]); // Overwrites with latest data only.
//     console.log('Latest Tute Request: ', data);
//     setShowPaymentOptions(false);
//     setIsPopupOpen(true);
//   };

  const resetTuteRequests = () => {
    setTuteRequests([]);
    console.log('Tute Requests have been reset.');
  };

  const [, setShowTutePopup] = useState(false);
  const [showTuteModal, setShowTuteModal] = useState<boolean>(false);

  useEffect(() => {
    if (classDetails?.isEnrolled && !classDetails?.hasRequestedTute) {
      setShowTutePopup(true);
    }
  }, [classDetails]);
  const [loading, setLoading] = useState(false);
  // const handleTuteRequest = () => {
  //   setShowTutePopup(false);
  //   navigate(`/tute-request/${classDetails?.id}`);
  // };

  const getSingleClassDetails = async () => {
    const response = await api.post(
      `${defaultConfig.BASE_API_URL}/get_purchase_class_detailsV2`,
      {
        class_id: id,
      },
    );
    setClassDetail(response.data?.data.classDetails);
    setIsLoading(false);

    if (response.data?.data.classDetails?.isUserstatus !== 'approved') {
      setIsVerificationPopup(true);
    }
  };

  const transformClassLinks = (links: any[]): TransformedClassLink[] => {
    return links.flatMap((link) =>
      link.class_videos.map((video: any) => ({
        ...video,
        yearString: link.year,
        monthString: link.month,
        groupName: link.name,
        isPayed: link.isPayed,
        isPending: link.isPending,
        monthIndex: monthNames.indexOf(link.month),
        link_type: video.link_type,
      })),
    );
  };

  useEffect(() => {
    if (!classDetails?.class_links_type) return;

    // Step 1: Transform
    const transformedLinks = transformClassLinks(classDetails.class_links_type);

    // Step 2: Available Years
    const allYears = Array.from(
      new Set(transformedLinks.map((v) => v.yearString)),
    ).sort((a, b) => parseInt(b) - parseInt(a));
    const yearsWithAll = ['All', ...allYears];
    setAvailableYears(yearsWithAll);

    // Step 3: Filter for selectedYear
    const linksForYear =
      selectedYear === 'All'
        ? transformedLinks
        : transformedLinks.filter((v) => v.yearString === selectedYear);

    // Step 4: Months for selected year
    const monthOrder = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // Create a map to track both payment and pending status for each month
    // const monthStatus = new Map<
    //   string,
    //   { isPayed: boolean; isPending: boolean }
    // >();

    // // Process all class links to determine status
    // linksForYear.forEach((v) => {
    //   // Initialize if not exists
    //   if (!monthStatus.has(v.monthString)) {
    //     monthStatus.set(v.monthString, {
    //       isPayed: v.isPayed,
    //       isPending: v.isPending,
    //     });
    //   } else {
    //     // Update status - paid takes precedence over pending
    //     const currentStatus = monthStatus.get(v.monthString);
    //     monthStatus.set(v.monthString, {
    //       isPayed: currentStatus?.isPayed || v.isPayed,
    //       isPending: currentStatus?.isPending || v.isPending,
    //     });
    //   }
    // });

    // // Build full month list with proper status
    // const updatedMonths = monthOrder.map((name) => {
    //   const status = monthStatus.get(name) || {
    //     isPayed: false,
    //     isPending: false,
    //   };
    //   return {
    //     value: name,
    //     name: name,
    //     hasData: monthStatus.has(name), // True if any content exists for this month
    //     isPayed: status.isPayed,
    //     isPending: status.isPending,
    //   };
    // });

    // const monthsWithAll = [
    //   {
    //     value: 'All',
    //     name: 'All',
    //     hasData: true,
    //     isPayed: false,
    //     isPending: false,
    //   },
    //   ...updatedMonths,
    // ];
    // setAvailableMonths(monthsWithAll);

    const monthPaymentStatus = new Map<
      string,
      {
        isPayed: boolean;
        isPending: boolean;
        hasData: boolean;
        linkTypes: Set<string>;
      }
    >();

    // Process all class links to determine status
    linksForYear.forEach((v) => {
      const currentStatus = monthPaymentStatus.get(v.monthString) || {
        isPayed: false,
        isPending: false,
        hasData: false,
        linkTypes: new Set<string>(),
      };

      // Update status - paid takes precedence over pending
      monthPaymentStatus.set(v.monthString, {
        isPayed: currentStatus.isPayed || v.isPayed,
        isPending:
          (currentStatus.isPending || v.isPending) && !currentStatus.isPayed,
        hasData: true, // Mark that this month has content
        linkTypes: currentStatus.linkTypes.add(v.link_type),
      });
    });

    // Build full month list with proper status
    const updatedMonths = monthOrder.map((name) => {
      const status = monthPaymentStatus.get(name) || {
        isPayed: false,
        isPending: false,
        hasData: false,
        linkTypes: new Set<string>(),
      };

      return {
        value: name,
        name: name,
        hasData: status.hasData,
        isPayed: status.isPayed,
        isPending: status.isPending && !status.isPayed, // Only pending if not paid
        linkTypes: Array.from(status.linkTypes),
      };
    });

    const monthsWithAll = [
      {
        value: 'All',
        name: 'All',
        hasData: true,
        isPayed: false,
        isPending: false,
        linkTypes: [],
      },
      ...updatedMonths,
    ];
    setAvailableMonths(monthsWithAll);

    // Fix invalid month
    const availableMonthValues = updatedMonths.map((m) => m.value);
    if (
      selectedMonth !== 'All' &&
      !availableMonthValues.includes(selectedMonth)
    ) {
      setSelectedMonth('All');
    }

    // Step 5: Names for selected year & month
    const linksForMonth =
      selectedMonth === 'All'
        ? linksForYear
        : linksForYear.filter((v) => v.monthString === selectedMonth);

    const nameSet = Array.from(new Set(linksForMonth.map((v) => v.groupName)));
    const namesWithAll = ['All', ...nameSet];
    setAvailableNames(namesWithAll);

    // Fix invalid name
    if (selectedName !== 'All' && !nameSet.includes(selectedName)) {
      setSelectedName('All');
    }

    // Step 6: Final filtering
    const filtered = transformedLinks.filter((v) => {
      const yearMatch = selectedYear === 'All' || v.yearString === selectedYear;
      const monthMatch =
        selectedMonth === 'All' || v.monthString === selectedMonth;
      const nameMatch = selectedName === 'All' || v.groupName === selectedName;
      return yearMatch && monthMatch && nameMatch;
    });

    setFilteredVideos(filtered);
  }, [selectedYear, selectedMonth, selectedName, classDetails]);

  const hasAutoSelected = useRef(false);

  // useEffect(() => {
  //   if (!classDetails?.class_links_type || hasAutoSelected.current) return;

  //   const transformedLinks = transformClassLinks(classDetails.class_links_type);

  //   // Extract all years as numbers for proper sorting (DESC)
  //   const allYears = Array.from(
  //     new Set(transformedLinks.map((v) => parseInt(v.yearString))),
  //   )
  //     .sort((a, b) => b - a) // ✅ descending
  //     .map((y) => y.toString());
  //   const latestYear = allYears[0];

  //   // Filter only links from the latest year
  //   const linksInLatestYear = transformedLinks.filter(
  //     (v) => v.yearString === latestYear,
  //   );

  //   // Month order definition
  //   const monthOrder = [
  //     'January',
  //     'February',
  //     'March',
  //     'April',
  //     'May',
  //     'June',
  //     'July',
  //     'August',
  //     'September',
  //     'October',
  //     'November',
  //     'December',
  //   ];

  //   // Get latest month based on index
  //   const allMonths = Array.from(
  //     new Set(linksInLatestYear.map((v) => v.monthString)),
  //   );
  //   const latestMonth = allMonths.sort(
  //     (a, b) => monthOrder.indexOf(b) - monthOrder.indexOf(a),
  //   )[0];

  //   // Set filters
  //   setSelectedYear(latestYear);
  //   setSelectedMonth(latestMonth);
  //   setSelectedName('All');

  //   hasAutoSelected.current = true;
  // }, [classDetails]);


  const handleZoomMeeting = async (videoId: string, zoomId?: string, zoomPassword?: string) => {
        try {
            // Show loading toast
            toast.info('Opening Zoom meeting...', { autoClose: 2000 });

            if (zoomId && zoomPassword) {
                // Direct launch with existing zoom data
                const zoomUrl = `http://localhost:5174/?meetingId=${zoomId}&password=${zoomPassword}&token=${authToken}`;
                window.open(zoomUrl, '_blank');
                toast.success('Zoom meeting opened successfully!');
                return; // Success, no need to continue
            } else {
                // Use video ID approach - let Zoom SDK fetch the details
                const zoomUrl = `http://localhost:5174/?videoId=${videoId}&token=${authToken}`;

                // Check if Zoom SDK is accessible
                const zoomWindow = window.open(zoomUrl, '_blank');
                if (zoomWindow) {
                    toast.success('Zoom meeting is being prepared...');
                } else {
                    throw new Error('Unable to open Zoom window. Please check popup blockers.');
                }
                return; // Success
            }
        } catch (error) {
            console.error('Error launching Zoom meeting:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            toast.error(`Failed to launch Zoom meeting: ${errorMessage}`);
            // Re-throw error so the calling code can handle fallback
            throw error;
        }
    };

    
  useEffect(() => {
    if (!classDetails?.class_links_type || hasAutoSelected.current) return;

    const transformedLinks = transformClassLinks(classDetails.class_links_type);

    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentMonth = monthNames[now.getMonth()];

    const hasCurrentData = transformedLinks.some(
      (link) =>
        link.yearString === currentYear && link.monthString === currentMonth,
    );

    if (hasCurrentData) {
      setSelectedYear(currentYear);
      setSelectedMonth(currentMonth);
    } else {
      const allYears = Array.from(
        new Set(transformedLinks.map((v) => v.yearString)),
      ).sort((a, b) => parseInt(b) - parseInt(a));

      if (allYears.length > 0) {
        const latestYear = allYears[0];
        const linksInLatestYear = transformedLinks.filter(
          (v) => v.yearString === latestYear,
        );

        const monthOrder = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];

        const allMonths = Array.from(
          new Set(linksInLatestYear.map((v) => v.monthString)),
        );

        const latestMonth = allMonths.sort(
          (a, b) => monthOrder.indexOf(b) - monthOrder.indexOf(a),
        )[0];

        setSelectedYear(latestYear);
        setSelectedMonth(latestMonth);

        toast.info(
          `Showing latest available content (${latestMonth} ${latestYear})`,
        );
      } else {
        setSelectedYear('All');
        setSelectedMonth('All');
        toast.warning('No content available');
      }
    }

    setSelectedName('All');
    hasAutoSelected.current = true;
  }, [classDetails]);

  const { setOpenModal, setSubjectFromOutside } = useChatContext();
  const handleChatNow = () => {
    if (classDetails?.name) {
      setSubjectFromOutside(classDetails.name); // send subject to chat
      setOpenModal('chat'); // open modal
    }
  };

  useEffect(() => {
    if (id) {
      getSingleClassDetails();
    }
  }, [id]);

  // Function to strip HTML tags from "about" field
  // const stripHtmlTags = (html: string | undefined) => {
  //   return html ? html.replace(/<\/?[^>]+(>|$)/g, '') : '';
  // };
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isBankSlipClicked, setIsBankSlipClicked] = useState(false);
  const [bankTransferSelected] = useState(false);
  const [bankTransferClicked] = useState(false);
  const [, setBankSlipClicked] = useState(false);
  const [showPaymentText, setShowPaymentText] = useState(true);
  const [isVerificationPopupOpen, setIsVerificationPopup] = useState(false);

  const bankData = [
    {
      bankName: 'BANK OF CEYLON',
      accountName: 'R.P.U.A HEMACHANDRA',
      accountNumber: '76575515',
      branch: 'KURUNEGALA BRANCH',
      logo: '/images/bank2.png',
    },
    {
      bankName: "PEOPLE'S BANK",
      accountName: 'R.P.U.A HEMACHANDRA',
      accountNumber: '057200150030734',
      branch: 'PERADENIYA BRANCH',
      logo: '/images/bank1.png',
    },
    {
      bankName: 'HNB BANK',
      accountName: 'EVEREST ONLINE PVT LTD',
      accountNumber: '224010010488',
      branch: 'KURUNEGALA BRANCH',
      logo: '/images/bank3.png',
    },
  ];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, slipImage: files[0] }));
      setImagePreview(URL.createObjectURL(files[0])); // Create an image preview
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    const maxFileSize = 4 * 1024 * 1024; // 4MB
    e.preventDefault();

    if (!formData.referenceNumber) {
      toast.error('Please provide Reference Number');
      return;
    }

    if (!formData.slipImage) {
      toast.error('Please provide the Slip/Receipt Image');
      return;
    }

    if (formData.slipImage.size > maxFileSize) {
      toast.error(
        `NIC back is too large: ${(formData.slipImage.size / 1024 / 1024).toFixed(2)}MB (Max: 4MB)`,
      );
      return;
    }

    if (!formData.bankName) {
      toast.error('Please select a bank');
      return;
    }
    setLoading(true); // Start loading
    const paymentData = new FormData();
    paymentData.append('pay_type', '2');
    paymentData.append('transaction_id', formData.referenceNumber);
    paymentData.append('class_id', id || '');
    paymentData.append('bank_type', formData.bankName);
    if (formData.slipImage) {
      paymentData.append('slip', formData.slipImage);
    }

    if (tuteRequests.length > 0) {
      paymentData.append('tute_data', JSON.stringify(tuteRequests[0]));
    } else {
      paymentData.append('tute_data', '');
    }

    paymentData.append('year', selectedYearPay);
    paymentData.append('month', selectedMonthPay);

    try {
      const response = await api.post(
        `${defaultConfig.BASE_API_URL}/submit_paymentV2`,
        paymentData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      if (response?.status === 200) {
        setIsPopupOpen(false);
        setIsSuccess(true);
      }

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || 'Server error occurred';

        if (error.response?.status === 422) {
          // Handle validation errors
          const validationErrors = error.response?.data?.errors;
          if (validationErrors) {
            Object.values(validationErrors).forEach((errArray: any) => {
              if (Array.isArray(errArray)) {
                errArray.forEach((err: string) => toast.error(err));
              }
            });
          } else {
            toast.error(errorMessage);
          }
        } else if (error.response?.status === 400) {
          // Handle other client-side errors
          toast.error(errorMessage);
        } else {
          toast.error(errorMessage);
        }
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };
  // const latestLinks =
  //   classDetails?.sheduleclass && classDetails.sheduleclass.length > 0
  //     ? classDetails.sheduleclass[0].links
  //     : null;

  // const [loading, setLoading] = useState(false);

  const [] = useState({
    bill_address1: 'kurunegala',
    bill_city: 'kurunegala',
    bill_country: 'LK', // Default to Sri Lanka
    customer_email: 'neo.induranga123@gmail.com',
    customer_lastname: 'bandara',
  });

  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const [showRecaptchaSuccess, setShowRecaptchaSuccess] = useState(false);
  // const authToken = localStorage.getItem('authToken');

  const handleCardPaymentClick = () => {
    setShowRecaptcha(true); // 👉 Show reCAPTCHA checkbox
  };

  const handleCardProviderClick = (provider: string) => {
    if (provider == 'unionpay_amex') {
      handlePaymentPaycorp();
    } else {
      handlePayment();
    }
  };

  const onCaptchaSuccess = (token: string | null) => {
    if (token) {
      setShowRecaptchaSuccess(true);
      setShowRecaptcha(false);
    }
  };

  const handlePaymentPaycorp = async () => {
    let tuteRequestsData: any;
    if (tuteRequests.length > 0) {
      tuteRequestsData = JSON.stringify(tuteRequests[0]);
    } else {
      tuteRequestsData = '';
    }

    const userId = localStorage.getItem('user_id');

    const res = await api.post(
      `${defaultConfig.BASE_API_URL}/generate-generate`,
      {
        amount: classDetails?.price * 100,
        class_id: id,
        user_id: userId,
        pay_type: 'class',
        device_type: 'web',
        year: selectedYearPay,
        month: selectedMonthPay,
        tute_data: tuteRequestsData,
      },
    );

    const paymentUrl = res.data.responseData?.paymentPageUrl;
    if (paymentUrl) {
      window.location.href = paymentUrl; // Opens in the same window and tab
    } else {
      alert('Failed to retrieve payment URL');
    }

    // const paymentUrl = res.data.responseData?.paymentPageUrl;
    // if (paymentUrl) {
    //   window.open(paymentUrl); // open payment UI in new tab
    // } else {
    //   alert("Failed to retrieve payment URL");
    // }
  };

  const handlePayment = async () => {
    try {
      let tuteRequestsData: any;
      if (tuteRequests.length > 0) {
        tuteRequestsData = JSON.stringify(tuteRequests[0]);
      } else {
        tuteRequestsData = '';
      }

      const userId = localStorage.getItem('user_id');
      const paymentData = {
        transaction_type: 'sale',
        reference_number: `ORDER_${Date.now()}`,
        amount: classDetails?.price,
        currency: 'LKR',
        class_id: id, // Ensure 'id' is defined in your component state
        user_id: userId,
        pay_type: 'class',
        tute_data: tuteRequestsData,
        year: selectedYearPay,
        month: selectedMonthPay,
        // bill_address1: '123 Main St',
        // bill_city: 'Colombo',
        // bill_country: 'UK',
        // customer_email: 'test@example.com',
        // customer_lastname: 'Doe',

        // bill_to_forename: 'Joe',
        // bill_to_surname: 'Smith',
        // bill_to_email: 'joesmith@example.com',
        // bill_to_address_line1: '1 My Apartment',
        // bill_to_address_state: 'CA',
        // bill_to_postal_code: '94043',
        // bill_to_address_country: 'LK',
      };

      const response = await api.post(
        `${defaultConfig.BASE_API_URL}/generate-signature`,
        paymentData,
      );

      const { signature, params, url } = response.data;

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = url;

      for (const key in params) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = params[key];
        form.appendChild(input);
      }

      const signatureInput = document.createElement('input');
      signatureInput.type = 'hidden';
      signatureInput.name = 'signature';
      signatureInput.value = signature;
      form.appendChild(signatureInput);

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error('Payment Error:', error);
      toast.error('Payment failed. Please try again.');
    }
  };



  useEffect(() => {
    const checkElectron = () => {
      return typeof window !== 'undefined' &&
        ((window as any).process && (window as any).process.type === 'renderer' ||
          (window as any).require ||
          navigator.userAgent.toLowerCase().indexOf('electron') > -1);
    };
    setIsElectron(checkElectron());
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
        <div className="w-full rounded-lg bg-white p-6 shadow-xl md:p-12">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold capitalize text-theme">
                {classDetails?.name} - {classDetails?.category}
              </h2>
              <p className="text-2xl text-gray-600">
                {classDetails?.academic_year}
              </p>
              {classDetails?.date_name && (
                <p className="mt-2 max-w-36 rounded-full bg-blue-100 px-2 py-1 text-center text-sm text-blue-800">
                  Date: {classDetails?.date_name}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Link to={`#`}>
                <button
                  onClick={handleChatNow}
                  className="flex items-center rounded-lg border border-purple-500 px-4 py-2 text-sm text-purple-500 hover:bg-purple-100"
                >
                  Chat Now
                </button>
              </Link>
              {/* <Link to={`/tute-list/${classDetails?.id}`}>
                <button
                  // onClick={handleChatNow}
                  className="flex items-center rounded-lg border border-purple-500 px-4 py-2 text-sm text-purple-500 hover:bg-purple-100"
                >
                  Tute List
                </button>
              </Link> */}
              {/* {classDetails?.isEnrolled && !classDetails?.hasRequestedTute && (
                <Link to={`/tute-request/${classDetails.id}`}>
                  <button className="flex items-center rounded-lg border border-purple-500 px-4 py-2 text-sm text-purple-500 hover:bg-purple-100">
                    <Replace color="#000000" size={17} className="mr-2" />{' '}
                    Request Tutes
                  </button>
                </Link>
              )} */}

              {/* {classDetails?.isEnrolled && classDetails?.hasRequestedTute && (
                <Link to={`/tute-request/${classDetails.id}`}>
                  <button
                    className="flex cursor-not-allowed items-center rounded-lg border border-gray-400 px-4 py-2 text-sm text-gray-400"
                    disabled
                  >
                    <Replace color="#000000" size={17} className="mr-2" />{' '}
                    Requested Tutes
                  </button>
                </Link>
              )} */}
            </div>

            {/* {showTutePopup && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="w-96 rounded-lg bg-white p-6 text-center shadow-lg">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Request Tutes for This Month?
                  </h2>
                  <p className="mt-2 text-gray-600">
                    You haven’t requested your tutes for this month yet. Would
                    you like to request them now?
                  </p>
                  <div className="mt-4 flex justify-center gap-4">
                    <button
                      className="w-full rounded-md bg-[#6f147b] px-4 py-2 text-white hover:bg-purple-900"
                      onClick={handleTuteRequest}
                    >
                      Yes
                    </button>
                    <button
                      className="w-full rounded-md bg-[#d1d5db] px-4 py-2 text-gray-700 hover:bg-gray-400"
                      onClick={() => setShowTutePopup(false)}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            )} */}
          </div>
          <div className="bg-white p-4">
            <div className="mx-auto mt-5 flex w-full flex-col items-start overflow-hidden rounded-lg md:flex-row md:items-stretch">
              <div className="flex justify-center md:w-1/2">
                <img
                  src={`${defaultConfig.BASE_ASSEST_URL}/${classDetails?.class_avatar}`}
                  alt="Chemistry Class"
                  className="h-80 w-auto object-cover"
                />
              </div>

              <div className="mt-5 flex flex-col justify-between md:w-1/2 lg:p-6">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="mb-2 flex items-center">
                        <span className="text-xl font-medium capitalize">
                          {classDetails?.teacher.name}
                        </span>
                      </div>
                      <p className="inline-flex items-center text-sm capitalize text-gray-600">
                        <GraduationCap className="mr-1" />
                        {classDetails?.teacher.teacher_details.qulification}
                      </p>
                    </div>
                    <img
                      src={`${defaultConfig.BASE_ASSEST_URL}/${classDetails?.teacher.avatar}`}
                      alt="Profile"
                      className="ml-10 h-14 w-14 rounded-full lg:h-20 lg:w-20"
                    />
                  </div>

                  <div className="mb-2 flex items-center">
                    <img
                      src="/images/book_mark.png"
                      alt="Free Tutas"
                      className="mr-2 h-6 w-6"
                    />
                    <span className="text-sm text-gray-700 md:text-[10px] lg:text-sm">
                      Free Tutes
                    </span>
                    <img
                      src="/images/recordings.png"
                      alt="Recordings"
                      className="ml-4 mr-2 h-6 w-6"
                    />
                    <span className="text-sm text-gray-700 md:text-[10px] lg:text-sm">
                      Recordings
                    </span>
                  </div>
                  <div className="mb-4 flex items-center">
                    <img
                      src="/images/book_icon.png"
                      alt="Lessons"
                      className="mr-2 h-6 w-6"
                    />
                    <span className="text-sm text-gray-700 md:text-[10px] lg:text-sm">
                      Lessons
                    </span>
                    {/* <span className="ml-auto text-sm text-gray-700">
                Price: Rs 3500.00
              </span> */}
                  </div>
                </div>
                {/* <button className="w-full rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700">
            Buy Now
          </button> */}

                {!classDetails?.isEnrolled || classDetails?.isEnrolledFree ? (
                  <div className="mt-8">
                    <p className="text-xl text-gray-700 md:text-lg lg:text-2xl">
                      Monthly Class Price:
                    </p>
                    <p className="text-2xl font-bold text-theme md:text-2xl lg:text-3xl">
                      RS {classDetails?.price}.00
                    </p>
                  </div>
                ) : classDetails?.isEnrolledFree ? (
                  <div className="mt-8">
                    <p className="text-xl text-gray-700 md:text-lg lg:text-2xl">
                      Monthly Class Price:
                    </p>
                    <p className="text-2xl font-bold text-theme md:text-2xl lg:text-3xl">
                      RS {classDetails?.price}.00
                    </p>
                  </div>
                ) : null}

                {/* {!classDetails?.isFree ? (
                  <button
                    className="text-1xl mt-8 w-full rounded-lg bg-theme py-2 text-white hover:bg-purple-900"
                    onClick={() => {
                      if (classDetails?.isUserstatus !== 'approved') {
                        setIsVerificationPopupOpen(true);
                      } else {
                        // setIsPopupOpen(true);
                        setShowPaymentOptions(true);
                      }
                    }}
                  >
                    Buy Now
                  </button>
                ) : null} */}
                {/* <br />
                  {classDetails?.isEnrolledLastWeek ? (
                    <p className="text-xl text-red-700 md:text-lg lg:text-1xl">
                    You are purchasing class for june {classDetails?.nextMonthName} month
                </p>
                  ) : null} */}

                {/* {classDetails?.isFree &&
                  classDetails?.isEnrolled == false &&
                  classDetails?.sheduleclass?.length > 0 && (
                    <CopyTextButton
                      classLink={latestLinks ?? ''}
                      isSheduleclassStatus={classDetails?.isSheduleclassStatus}
                      start_time={classDetails.sheduleclass[0].start_time}
                    />
                  )} */}

                {/* {classDetails?.isEnrolled ? (
                  <>
                    {classDetails?.sheduleclass?.length > 0 && (
                      <CopyTextButton
                        classLink={latestLinks ?? ''}
                        isSheduleclassStatus={
                          classDetails?.isSheduleclassStatus
                        }
                        start_time={classDetails.sheduleclass[0].start_time}
                      />
                    )}
                  )} */}

                {/* {classDetails?.isEnrolled &&
                  classDetails?.sheduleclass?.length > 0 && (
                    <CopyTextButton
                      classLink={latestLinks ?? ''}
                      isSheduleclassStatus={classDetails?.isSheduleclassStatus}
                      start_time={
                        classDetails?.sheduleclass?.[0]?.start_time ?? ''
                      }
                    />
                  )} */}

                {/* {classDetails?.isPending ? (
                  <button className="text-1xl mt-8 w-full rounded-lg bg-green-500 py-2 text-white hover:bg-green-700">
                    Pending
                  </button>
                ) : !classDetails?.isEnrolled ? (
                  <button
                    className="text-1xl mt-8 w-full rounded-lg bg-theme py-2 text-white hover:bg-purple-900"
                    onClick={() => {
                      if (classDetails?.isUserstatus !== 'approved') {
                        setIsVerificationPopupOpen(true);
                      } else {
                        //setIsPopupOpen(true);
                        setShowPaymentOptions(true);
                      }
                    }}
                  >
                    Buy Now
                  </button>
                ) : classDetails?.isEnrolledFree ? (
                  <button
                    className="text-1xl mt-8 w-full rounded-lg bg-theme py-2 text-white hover:bg-purple-900"
                    onClick={() => {
                      if (classDetails?.isUserstatus !== 'approved') {
                        setIsVerificationPopupOpen(true);
                      } else {
                        // setIsPopupOpen(true);
                        setShowPaymentOptions(true);
                      }
                    }}
                  >
                    Buy Now
                  </button>
                ) : null} */}

                {/* <button
                  className="text-1xl mt-8 w-full rounded-lg bg-theme py-2 text-white hover:bg-purple-900"
                  onClick={() => setIsPopupOpen(true)}
                >
                  Enroll
                </button> */}
              </div>
            </div>

            {/* Tute Request Modal Popup */}
            {/* {showTuteModal && (
              <TuteRequestModal
                month={selectedMonth}
                year={selectedYear}
                classId={classDetails?.id}
                onClose={() => setShowTuteModal(false)}
                onSubmitData={handleTuteSubmit}
              />
            )} */}

            {showTuteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
                <h2 className="text-xl font-semibold mb-4 text-red-600">Payment Not Available</h2>
                <p className="mb-6">
                    Can't make payment using this application.<br />
                    Please use the online web app.
                </p>
                <button
                    onClick={() => setShowTuteModal(false)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    OK
                </button>
                </div>
            </div>
            )}


            {/* Payment Options Modal */}
            {showPaymentOptions && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="relative w-96 rounded-lg bg-white p-6 text-center shadow-lg">
                  {/* ✕ Close Button */}
                  <button
                    className="absolute right-2 top-2 text-xl font-bold text-gray-400 hover:text-gray-700"
                    onClick={() => setShowPaymentOptions(false)}
                  >
                    &times;
                  </button>

                  <h2 className="mb-4 text-xl font-semibold text-gray-800">
                    Choose Year and Month
                  </h2>

                  {/* Year Selector */}
                  <select
                    value={selectedYearPay}
                    onChange={(e) => setSelectedYearPay(e.target.value)}
                    className="mb-4 w-full rounded border px-3 py-2"
                  >
                    <option value="">Select Year</option>
                    {['2022', '2023', '2024', '2025'].map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedMonthPay}
                    onChange={(e) => setSelectedMonthPay(e.target.value)}
                    className="mb-4 w-full rounded border px-3 py-2"
                  >
                    <option value="">Select Month</option>
                    {[
                      'January',
                      'February',
                      'March',
                      'April',
                      'May',
                      'June',
                      'July',
                      'August',
                      'September',
                      'October',
                      'November',
                      'December',
                    ].map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>

                  <div className="mt-4 flex justify-center gap-4">
                    <button
                      className={`w-full rounded-md px-4 py-2 text-white ${selectedYearPay && selectedMonthPay
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'cursor-not-allowed bg-gray-400'
                        }`}
                      disabled={!(selectedYearPay && selectedMonthPay)}
                      onClick={() => {
                        setShowPaymentOptions(false);
                        setShowTuteModal(true);
                      }}
                    >
                      Tute Request and Payment
                    </button>
                  </div>
                </div>
              </div>
            )}


    return (
        <div>
            {/* Electron/Deep Link UI blocks */}
            <div className="p-6">

            <div className="mt-5 flex flex-col">
              <hr className="w-full border-gray-200" />
              <h4 className="mt-4 text-lg font-semibold text-gray-800">
                Description
              </h4>
              {/* <span className="mb-4 mt-2 break-words text-sm capitalize text-gray-600">
                {classDetails?.description
                  ? stripHtmlTags(classDetails.description)
                  : 'No description available.'}
              </span> */}

              <span
                className="mb-4 mt-2 break-words text-sm capitalize text-gray-600"
                dangerouslySetInnerHTML={{
                  __html:
                    classDetails?.description || 'No description available.',
                }}
              ></span>

            </div>
          </div>
          {/* {!classDetails?.isEnrolled && (
        <div className="mt-8">
          <p className="text-xl text-gray-700">Monthly Class Price:</p>
          <p className="text-3xl font-bold text-theme">
            RS {classDetails?.price}.00
          </p>
        </div>
      )}

      {classDetails?.isEnrolled ? (
        <CopyTextButton classLink={latestLinks ?? ''} />
      ) : (
        <button
          className="text-1xl mt-8 w-full rounded-lg bg-theme py-2 text-white hover:bg-purple-900 sm:w-1/2"
          onClick={() => setIsPopupOpen(true)}
        >
          Enroll
        </button>
      )} */}
          {isVerificationPopupOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-80 rounded-lg bg-white p-6 text-center shadow-lg">
                <h2 className="text-lg font-semibold text-red-600">
                  Verification Required
                </h2>
                <p className="mt-2 text-sm text-gray-700">
                  You're not an approved student. Please verify your identity
                  first.
                </p>
                <div className="mt-4 flex justify-center gap-4">
                  <Link to={`/profile`}>
                    <button className="mt-4 rounded-lg bg-theme px-4 py-2 text-sm text-white hover:bg-purple-900">
                      Verify
                    </button>
                  </Link>
                  {/* <button
                    className="mt-4 rounded-lg bg-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-400"
                    onClick={() => setIsVerificationPopupOpen(false)}
                  >
                    Close
                  </button> */}
                </div>
              </div>
            </div>
          )}
          {isPopupOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
              <div className="w-full max-w-xs rounded-lg bg-white p-6 shadow-lg md:max-w-xl lg:max-w-xl">
                {showPaymentText && (
                  <>
                    <h3 className="mb-4 text-lg font-bold text-gray-800">
                      Payment Options
                    </h3>
                    <p className="mb-6 text-gray-600">
                      Choose your payment method:
                    </p>
                  </>
                )}

                {!bankTransferClicked &&
                  !isBankSlipClicked &&
                  showPaymentText && (
                    <button
                      className="mb-4 w-full rounded-lg border border-theme bg-white py-2 text-theme hover:bg-purple-100"
                      onClick={() => {
                        handleCardPaymentClick();
                        // setBankTransferClicked(true);
                        // setBankTransferSelected(true);
                        // setShowPaymentText(false);
                        // toast.info('Bank Transfer Selected');
                      }}
                    >
                      Card Payment
                    </button>
                  )}

                {showRecaptchaSuccess && (
                  <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                    <button
                      className="w-full rounded-lg border border-theme bg-white py-2 text-theme hover:bg-purple-100"
                      onClick={() => handleCardProviderClick('unionpay_amex')}
                    >
                      Union Pay / AMEX
                    </button>
                    <button
                      className="w-full rounded-lg border border-theme bg-white py-2 text-theme hover:bg-purple-100"
                      onClick={() => handleCardProviderClick('visa_master')}
                    >
                      Visa / MasterCard
                    </button>
                  </div>
                )}

                {/* Show reCAPTCHA only after button click */}
                {showRecaptcha && (
                  <div className="mt-4 flex justify-center">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={defaultConfig.SITE_KEY} // ✅ reCAPTCHA v2 checkbox key
                      onChange={onCaptchaSuccess}
                    />
                  </div>
                )}

                <br />
                {!isBankSlipClicked &&
                  !bankTransferClicked &&
                  showPaymentText && (
                    <button
                      className="mb-4 w-full rounded-lg bg-theme py-2 text-white hover:bg-purple-600"
                      onClick={() => {
                        setBankSlipClicked(true);
                        setShowRecaptchaSuccess(false);
                        setIsBankSlipClicked(true);
                        setShowPaymentText(false);
                        setShowRecaptcha(false);
                        // toast.info('Bank Slip Upload Selected');
                      }}
                    >
                      Bank Slip Upload
                    </button>
                  )}

                {bankTransferSelected && (
                  <div className="mt-6">
                    <div className="mb-4 rounded-lg border border-gray-200 p-4">
                      <div className="mb-6 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700">
                          <img src="/images/boc.png" alt="" />
                        </div>
                      </div>

                      <h2 className="mb-6 text-center text-3xl font-bold">
                        Transfer Details
                      </h2>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Account Name:</p>
                          <p className="text-sm text-gray-600">
                            Ujith Hemachandra
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Account Number:</p>
                          <p className="text-sm text-gray-600">15184846028</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Bank Name:</p>
                          <p className="text-sm text-gray-600">BOC</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Branch:</p>
                          <p className="text-sm text-gray-600">Kurunegala</p>
                        </div>
                      </div>

                      <p className="mt-8 text-left text-xs text-gray-500">
                        Use the above details to transfer the amount.
                      </p>
                    </div>
                  </div>
                )}

                {isBankSlipClicked && (
                  <div className="mt-6">
                    <button
                      className="rounded bg-gray-200 px-4 py-1 text-gray-700 hover:bg-gray-300"
                      onClick={() => {
                        setIsBankSlipClicked(false);
                        setShowPaymentText(true); // Go back to Payment Options
                      }}
                    >
                      <span className="flex items-center gap-1 text-sm">
                        <ArrowLeft size={17} />
                        Back
                      </span>
                    </button>
                    <form onSubmit={handleSubmit} className="mt-2">
                      <div className="mb-0">
                        <div className="flex justify-center">
                          <div className="max-w-3xl">
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                              {' '}
                              {/* grid layout with 2 columns */}
                              {bankData.map((bank, index) => (
                                <div
                                  key={index}
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      bankName: bank.bankName,
                                    })
                                  } // Set selected bank
                                  className={`flex cursor-pointer items-start rounded-lg border border-gray-400 bg-white p-2 px-7 shadow-md ${formData.bankName === bank.bankName
                                    ? 'border-blue-500 ring-2 ring-blue-300'
                                    : ''
                                    }`}
                                >
                                  <div className="mr-2 h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                                    <img
                                      src={bank.logo}
                                      alt={`${bank.bankName} Logo`}
                                      className="h-full w-full object-contain"
                                    />
                                  </div>
                                  <div className="flex flex-col justify-end text-xs">
                                    <div className="font-semibold">
                                      {bank.bankName}
                                    </div>
                                    <div>{bank.accountName}</div>
                                    <div>{bank.accountNumber}</div>
                                    <div>{bank.branch}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <label className="ml-2 mt-2 block text-sm font-medium text-gray-700">
                          Reference Number
                        </label>
                        <input
                          type="text"
                          name="referenceNumber"
                          value={formData.referenceNumber}
                          onChange={handleInputChange}
                          placeholder="Enter your reference number"
                          className="mt-1 w-full rounded-lg border-gray-300 bg-slate-100 p-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div className="mb-4 ml-2 mt-1">
                        <label className="mb-2 block text-sm font-semibold text-gray-800">
                          Upload Slip Image
                        </label>
                        <div className="flex w-full items-center justify-center">
                          <label
                            htmlFor="file-upload"
                            className="w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-center transition duration-300 ease-in-out hover:bg-gray-100"
                          >
                            <span className="text-sm font-medium text-gray-600">
                              Choose a file
                            </span>
                            <input
                              id="file-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                              required
                            />
                          </label>
                        </div>

                        {imagePreview && (
                          <div className="mt-4">
                            <p className="text-xs text-gray-700">Preview:</p>
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="mt-2 h-auto w-20 rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </form>
                  </div>
                )}

                <div className="mb-5 mt-4 flex space-x-4">
                  <button
                    className="w-full rounded-lg bg-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-400"
                    onClick={() => {
                      setIsPopupOpen(false);
                      setShowPaymentText(true); // Reset to Payment Options when closing
                      setIsBankSlipClicked(false); // Ensure the state resets
                      resetTuteRequests();
                    }}
                  >
                    Cancel
                  </button>

                  {isBankSlipClicked && (
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className={`flex w-full items-center justify-center rounded-lg bg-theme py-2 text-sm text-white hover:bg-purple-600 ${loading ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg
                            className="mr-2 h-5 w-5 animate-spin text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 0116 0H4z"
                            ></path>
                          </svg>
                          Submitting...
                        </span>
                      ) : (
                        'Submit'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          {isSuccess && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="w-80 rounded-lg bg-white p-6 text-center shadow-lg">
                <h2 className="text-lg font-semibold text-green-600">
                  Success!
                </h2>
                <p className="mt-2 text-sm text-gray-700">
                  Your enrollment request has been successful.
                </p>
                <button
                  className="mt-4 rounded-lg bg-theme px-4 py-2 text-sm text-white hover:bg-purple-900"
                  onClick={() => setIsSuccess(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
          {/* <ClassCards /> */}
          {/* Time Table Section */}
          {/* <div className="mt-5 rounded-lg bg-white p-5 shadow-lg">
        <h1 className="text-center text-2xl font-semibold">Time Table</h1>
        <div className="mt-5 flex items-center justify-center overflow-x-auto">
          {classDetails?.sheduleclass &&
          classDetails?.sheduleclass.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-4">
              {classDetails?.sheduleclass.map((cls) => (
                <div
                  key={cls.id}
                  className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-md md:max-w-lg lg:max-w-xl"
                >
                  <div className="relative h-48 w-full md:h-64 lg:h-80">
                    <img
                      src={`${defaultConfig.BASE_ASSEST_URL}/${cls.class_shedule_image}`}
                      alt="Class Schedule"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No class schedules available.
            </p>
          )}
        </div>
      </div> */}
          {/* Free and Paid Videos Section */}
          {/* <div className="mt-5 flex flex-col items-center justify-center p-5">
            <h1 className="text-center text-2xl font-semibold">Videos</h1>
            <div className="mt-10 w-full px-4">
              {classDetails?.class_links &&
              classDetails?.class_links?.length > 0 ? (
                <div className="custom-scrollbar relative">
                  <div className="flex space-x-6 overflow-x-auto pb-4">
                    {classDetails.class_links.map((cls) => (
                      <div
                        key={cls.id}
                        className="w-full min-w-[280px] shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-shadow duration-300 hover:shadow-lg sm:w-64 md:w-72 lg:w-80"
                      >
                        <div className="relative">
                          <img
                            src={`${defaultConfig.BASE_ASSEST_URL}/${cls.thumbnail}`}
                            alt="Class Thumbnail"
                            className="h-auto w-full object-cover"
                          />
                        </div>

                        <div className="p-4 text-center">
                          <h2 className="mb-2 text-lg font-semibold text-gray-800">
                            {cls.name}
                          </h2>

                          <button
                            className="flex w-full items-center justify-center rounded-md bg-[#FF3131] py-2 text-white transition-colors hover:bg-red-600"
                            onClick={() => {
                              if (
                                cls.link_type === 'free' ||
                                classDetails.isEnrolled
                              ) {
                                const url =
                                  cls.video_platform === 'YOUTUBE'
                                    ? `${cls.video_id}`
                                    : `${cls.video_id}`;
                                window.open(url, '_blank');
                              }
                            }}
                            disabled={!classDetails.isEnrolled}
                          >
                            <Play className="mr-2" size={18} />
                            {cls.link_type === 'free'
                              ? 'Watch Free'
                              : classDetails.isEnrolled
                                ? 'Watch'
                                : 'Paid Content'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex h-fit w-full flex-col items-center justify-center rounded-lg bg-white p-6 text-center">
                  <img
                    src="/images/Animation - 1739266164016.gif"
                    alt="Classes"
                    className="w-40"
                  />
                  <h2 className="mb-4 text-xl font-semibold text-gray-800">
                    No Videos Available
                  </h2>
                  <p className="text-gray-600">
                    There are no Videos available at the moment. Stay tuned!
                  </p>
                </div>
              )}
            </div>
          </div> */}
          {/* Year and Month Filters (Row 1) */}
          <div className="mb-6 mt-4 flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
            {/* Year dropdown */}
            <div className="mb-6 mt-4">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                {availableYears.length > 0 &&
                  availableYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setSelectedMonth('All'); // ✅ Reset month to 'All' on year change
                        setSelectedName('All'); // (optional) also reset name
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${selectedYear === year
                        ? 'bg-theme text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                      {year}
                    </button>
                  ))}
              </div>
            </div>

            <div className="mb-5 flex flex-col">
              {availableMonths.length > 0 && selectedYear !== 'All' && (
                <div className="mb-6 mt-2 flex flex-wrap justify-center gap-1 sm:gap-2">
                  {availableMonths.map((month) => (
                    <button
                      key={month.value}
                      onClick={() => setSelectedMonth(month.value)}
                      disabled={!month.hasData}
                      className={`rounded px-2 py-1 text-xs font-medium transition-colors ${selectedMonth === month.value
                        ? 'bg-theme text-white'
                        : month.hasData
                          ? month.isPayed
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'cursor-not-allowed bg-gray-100 text-gray-400'
                        }`}
                    >
                      {month.name.slice(0, 3)}
                    </button>
                  ))}
                </div>
              )}

              {/* Add this under the month filter section */}
              <div className="mb-6 flex w-full justify-center">
                {selectedMonth !== 'All' &&
                  availableMonths
                    .find((m) => m.value === selectedMonth)
                    ?.linkTypes.some((type) => type !== 'free') && (
                    <button
                      className={`flex w-full items-center justify-center rounded-md px-4 py-2 text-white transition-colors ${availableMonths.find((m) => m.value === selectedMonth)
                        ?.isPayed
                        ? 'bg-green-500'
                        : availableMonths.find(
                          (m) => m.value === selectedMonth,
                        )?.isPending
                          ? 'bg-yellow-500'
                          : 'bg-[#FF3131] hover:bg-red-600'
                        }`}
                      onClick={() => {
                        const selectedMonthData = availableMonths.find(
                          (m) => m.value === selectedMonth,
                        );

                        if (classDetails?.isUserstatus !== 'approved') {
                          setIsVerificationPopup(true);
                        } else if (
                          !selectedMonthData?.isPayed &&
                          !selectedMonthData?.isPending
                        ) {
                          setShowTuteModal(true);
                          setSelectedYearPay(selectedYear);
                          setSelectedMonthPay(selectedMonth);
                        }
                      }}
                    >
                      {availableMonths.find((m) => m.value === selectedMonth)
                        ?.isPayed
                        ? 'Already Paid For This Month'
                        : availableMonths.find((m) => m.value === selectedMonth)
                          ?.isPending
                          ? 'Payment Pending'
                          : 'Purchase This Month'}
                    </button>
                  )}
              </div>
            </div>
          </div>
          {/* Name Filter Buttons (New Row 2 - Centered) */}
          <div className="mb-6 flex w-full justify-center">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              {availableNames.map((name) => (
                <button
                  key={name}
                  onClick={() => setSelectedName(name)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${selectedName === name
                    ? 'bg-theme text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Videos List */}
          <div className="mt-4 w-full px-4">
            {filteredVideos.length > 0 ? (
              <div className="custom-scrollbar relative">
                <div className="flex flex-col gap-6">
                  {Object.entries(
                    filteredVideos.reduce(
                      (acc, video) => {
                        acc[video.groupName] = acc[video.groupName] || [];
                        acc[video.groupName].push(video);
                        return acc;
                      },
                      {} as Record<string, any[]>,
                    ),
                  ).map(([groupName, groupVideos]) => (
                    <div key={groupName}>
                      <h3 className="mb-4 text-lg font-bold capitalize text-gray-800">
                        {groupName}
                      </h3>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {(groupVideos as any[]).map(
                          (video: {
                            id: Key | null | undefined;
                            thumbnail: any;
                            name:
                            | string
                            | number
                            | boolean
                            | ReactElement<
                              any,
                              string | JSXElementConstructor<any>
                            >
                            | Iterable<ReactNode>
                            | ReactPortal
                            | null
                            | undefined;
                            link_type: string;
                            video_id: any;
                            isPayed: boolean;
                            isPending: boolean;
                            monthString: string;
                            yearString: string;
                            tute: string;
                            tute_link: string;
                            zoom_id?: string;
                            zoom_password?: string;
                          }) => (
                            <div
                              key={video.id}
                              className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-shadow duration-300 hover:shadow-lg"
                            >
                              <div className="relative">
                                {/* <img
                                  src={`${defaultConfig.BASE_ASSEST_URL}/${video.thumbnail}`}
                                  alt="Video Thumbnail"
                                  className="h-auto w-full object-cover"
                                /> */}
                              </div>

                              <div className="p-4 text-center">
                                <h2 className="mb-3 overflow-hidden text-ellipsis whitespace-nowrap text-lg font-semibold text-gray-800">
                                  {video.name}
                                </h2>
                                {video.video_id ? (
                                  <button
                                    className={`flex w-full items-center justify-center rounded-md py-2 text-white transition-colors ${video.link_type === 'free'
                                      ? 'bg-green-500 hover:bg-green-600'
                                      : video.isPayed
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : video.isPending
                                          ? 'bg-yellow-500'
                                          : 'bg-[#FF3131] hover:bg-red-600'
                                      }`}
                                    onClick={() => {
                                      if (
                                        video.link_type === 'free' ||
                                        video.isPayed
                                      ) {
                                        handleZoomMeeting(String(video.id), video.zoom_id, video.zoom_password);
                                      } else if (
                                        classDetails?.isUserstatus !==
                                        'approved'
                                      ) {
                                        setIsVerificationPopup(true);
                                      } else if (
                                        !video.isPayed &&
                                        !video.isPending
                                      ) {
                                        setSelectedYearPay(video.yearString);
                                        setSelectedMonthPay(video.monthString);
                                        setShowTuteModal(true);
                                      }
                                    }}
                                  >
                                    <Play className="mr-2" size={18} />
                                    {video.link_type === 'free'
                                      ? 'Watch Free'
                                      : video.isPayed
                                        ? 'Watch'
                                        : video.isPending
                                          ? 'Payment Pending'
                                          : 'Paid Content'}
                                  </button>
                                ) : (
                                  <button
                                    className={`flex w-full items-center justify-center rounded-md py-2 text-white transition-colors ${video.link_type === 'free' ||
                                      video.isPayed
                                      ? 'bg-green-500 hover:bg-green-600'
                                      : video.isPending
                                        ? 'bg-yellow-500'
                                        : 'bg-[#FF3131] hover:bg-red-600'
                                      }`}
                                    onClick={() => {
                                      if (
                                        video.link_type === 'free' ||
                                        video.isPayed
                                      ) {
                                        if (video.tute) {
                                          const link =
                                            document.createElement('a');
                                          (link.href = `${defaultConfig.BASE_ASSEST_URL}/${video.tute}`),
                                            '_blank';
                                          link.setAttribute('download', '');
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                        } else if (video.tute_link) {
                                          window.open(
                                            video.tute_link,
                                            '_blank',
                                          );
                                        }
                                      } else if (
                                        classDetails?.isUserstatus !==
                                        'approved'
                                      ) {
                                        setIsVerificationPopup(true);
                                      } else if (
                                        !video.isPayed &&
                                        !video.isPending
                                      ) {
                                        setSelectedYearPay(video.yearString);
                                        setSelectedMonthPay(video.monthString);
                                        setShowTuteModal(true);
                                      }
                                    }}
                                  >
                                    <Download className="mr-2" size={18} />

                                    {video.link_type === 'free' || video.isPayed
                                      ? video.tute || video.tute_link
                                        ? 'Download'
                                        : 'Document Not Available'
                                      : video.isPending
                                        ? 'Payment Pending'
                                        : 'Purchase'}
                                  </button>
                                )}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                  ))}

                </div>
              </div>
            ) : (
              <div className="mt-4 flex h-fit w-full flex-col items-center justify-center rounded-lg bg-white p-6 text-center">
                <img
                  src="/images/Animation - 1739266164016.gif"
                  alt="No Videos"
                  className="w-40"
                />
                <h2 className="mb-4 text-xl font-semibold text-gray-800">
                  No Videos Available
                </h2>
                <p className="text-gray-600">
                  {selectedYear !== 'All' || selectedMonth !== 'All'
                    ? 'No videos match your selected filters'
                    : 'There are no videos available at the moment. Stay tuned!'}
                </p>
              </div>
            )}
          </div>

         
          {/* <div className="mt-4 flex justify-center">
            {isElectron ? (
              <a href={`https://zoom-sdk-new-kul5.vercel.app/?meetingId=${meetingId}&token=${authToken}`}>
                <button className="bg-purple-400 px-5 py-2 rounded-xl text-white hover:bg-purple-500">
                  Join Live Class
                </button>
              </a>
            ) : (
              <a href={`everestapp://singleclass2?meetingId=${meetingId}&token=${authToken}&classId=${id}`}>
                <button className="rounded-xl bg-purple-400 px-5 py-2 text-white hover:bg-purple-500">
                  Open in Desktop App
                </button>
              </a>
            )}
          </div> */}
          </div>
        </div>

        </div>

       
      )}
      
    </>
  );
}

export default SingleClass;
