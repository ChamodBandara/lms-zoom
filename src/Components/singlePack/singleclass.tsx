import {
  useState,
  ChangeEvent,
  FormEvent,
  // JSXElementConstructor,
  // Key,
  // ReactElement,
  // ReactNode,
  // ReactPortal,
  useRef,
  useEffect,
} from 'react';
import {

  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Play,

  X,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import api from '../../services/api';
import { defaultConfig } from '../../App/configs/common';
import { TailSpin } from 'react-loader-spinner';
// import { useNavigate } from 'react-router-dom';
// import TuteRequestModal from './tute-request-payment/page';
import ReCAPTCHA from 'react-google-recaptcha';
// import { useChatContext } from '../../context/ChatContext';

interface PackVideo {
  video_type: string;
  type: string;
  monthNumber: string;
  id: number;
  type_id: number;
  name: string;
  video_id: any ;
  thumbnail: string;
  tute: string | null;
  tute_link: string | null;
  year?: string;
  month?: string;
}

// interface PackAttachment {
//   id: number;
//   name: string;
//   year: string;
//   month: string;
//   pack_id: number;
//   packvideos: PackVideo[];
// }

interface Attachment {
  id: string;
  name: string;
  file_path: string;
  year: string;
  month: string;
  packvideos: PackVideo[];
}

// interface ClassLink {
//   id: string;
//   pack_id: number;
//   name: string;
//   video_platform: string;
//   video_id: string;
//   thumbnail: string;
//   created_at: string;
//   link_type?: string;
//   isEnrolled?: boolean;
// }

// interface TransformedClassLink extends ClassLink {
//   yearString: string;
//   monthString: string;
// }

function SinglePack() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [, setShowTutePopup] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    transaction_id: '',
    bankName: '',
    // referenceNumber: '',
    slip: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const { id } = useParams<{ id: string }>();

  const [params] = useState({
    pack_id: id,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    exam_year?: string;
    id?: string;
    name?: string;
    pack_avatar?: string;
    price?: any;
    teacher_id?: string;
    teacher?: any;
    status?: string;
    description?: string;
    created_at?: string;
    class_links?: any;
    assignments?: any;
    isEnrolled?: boolean;
    hasRequestedTute?: boolean;
    subject?: string;
    payStatus?: string;
    packattachment?: Attachment[];
    type?: string;
  }>({});
  const [isVerificationPopupOpen, setIsVerificationPopupOpen] = useState(false);

  // const stripHtmlTags = (html: string | undefined) => {
  //   return html ? html.replace(/<\/?[^>]+(>|$)/g, '') : '';
  // };

  const [showTuteModal, setShowTuteModal] = useState<boolean>(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [tuteRequests] = useState<any[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [filteredVideos, setFilteredVideos] = useState<PackVideo[]>([]);
  const [, setAvailableYears] = useState<string[]>(['All']);
  const [availableMonths, setAvailableMonths] = useState<
    { value: string; name: string }[]
  >([]);
  const [availableNames, setAvailableNames] = useState<string[]>(['All']);
  const [selectedYear] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedName, setSelectedName] = useState<string>('All');

    const [isUserstatus, setisUserstatus] = useState('');


  const fetchData = async () => {
    try {
      const response = await api.get('/get_pack_details', {
        params: params,
      });
      const packData = response.data.data.details;
      setData(packData);

        setisUserstatus(response.data?.data?.isUserstatus);
      if (response.data?.data?.isUserstatus !== 'approved') {
     
        setIsVerificationPopupOpen(true);
      }

      if (packData?.payStatus === 'completed' && !packData?.hasRequestedTute) {
        setShowTutePopup(true);
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    if (data?.packattachment) {
      const allVideos = data.packattachment.flatMap((attachment) =>
        attachment.packvideos.map((video) => ({
          ...video,
          year: attachment.year,
          month: attachment.month,
          monthNumber: (monthNames.indexOf(attachment.month) + 1)
            .toString()
            .padStart(2, '0'),
          groupName: attachment.name,
        })),
      );

      const filtered = allVideos.filter((video) => {
        const yearMatch = selectedYear === 'All' || video.year === selectedYear;
        const monthMatch =
          selectedMonth === 'All' ||
          video.monthNumber === selectedMonth ||
          video.month.toLowerCase() === selectedMonth.toLowerCase();
        const nameMatch =
          selectedName === 'All' || video.groupName === selectedName;
        return yearMatch && monthMatch && nameMatch;
      });

      setFilteredVideos(filtered);

      const years = Array.from(new Set(allVideos.map((v) => v.year))).sort(
        (a, b) => parseInt(b) - parseInt(a),
      );
      setAvailableYears(['All', ...years]);

      const allMonths = Array.from({ length: 12 }, (_, i) => ({
        value: (i + 1).toString().padStart(2, '0'),
        name: monthNames[i],
      }));

      setAvailableMonths([{ value: 'All', name: 'All' }, ...allMonths]);

      const namesForYear =
        selectedYear === 'All'
          ? Array.from(new Set(allVideos.map((v) => v.groupName)))
          : Array.from(
              new Set(
                allVideos
                  .filter((v) => v.year === selectedYear)
                  .map((v) => v.groupName),
              ),
            );
      setAvailableNames(['All', ...namesForYear]);
    }
  }, [selectedYear, selectedMonth, selectedName, data]);

  useState(() => {
    fetchData();
  });

  const bankData = [
    {
      bankName: 'BANK OF CEYLON',
      accountName: 'R.P.U.A HEMACHANDRA',
      accountNumber: '76575515',
      branch: 'KURUNEGALA BRANCH',
      logo: '/images/bank2.png',
    },
    // {
    //   bankName: "PEOPLE'S BANK",
    //   accountName: 'R.P.U.A HEMACHANDRA',
    //   accountNumber: '057200150030734',
    //   branch: 'PERADENIYA BRANCH',
    //   logo: '/images/bank1.png',
    // },
    {
      bankName: 'HNB BANK',
      accountName: 'EVEREST ONLINE PVT LTD',
      accountNumber: '224010010488',
      branch: 'KURUNEGALA BRANCH',
      logo: '/images/bank3.png',
    },
  ];

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isBankSlipClicked, setIsBankSlipClicked] = useState(false);
  const [bankTransferSelected] = useState(false);
  const [bankTransferClicked] = useState(false);
  const [, setBankSlipClicked] = useState(false);
  const [showPaymentText, setShowPaymentText] = useState(true);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, slip: files[0] }));
      setImagePreview(URL.createObjectURL(files[0])); // Create an image preview
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const maxFileSize = 4 * 1024 * 1024; // 4MB
    if (!formData.transaction_id) {
      toast.error('Please provide Reference Number');
      return;
    }

    if (!formData.slip) {
      toast.error('Please provide Slip Image');
      return;
    }

    if (formData.slip.size > maxFileSize) {
      toast.error(
        `NIC back is too large: ${(formData.slip.size / 1024 / 1024).toFixed(2)}MB (Max: 4MB)`,
      );
      return;
    }

    if (!formData.bankName) {
      toast.error('Please select a bank');
      return;
    }

    let tuteRequestsData: any;
    if (tuteRequests.length > 0) {
      tuteRequestsData = JSON.stringify(tuteRequests[0]);
    } else {
      tuteRequestsData = '';
    }

    const params = {
      pack_id: id,
      tute_data: tuteRequestsData,
      // slip: formData.slip,
      bank_type: formData.bankName,
      transaction_id: formData.transaction_id,
      pay_type: 1,
    };
    setLoading(true); // Start loading

    try {
      const response = await api.post('/submit_paymet_packs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: params, // Optional parameters can be sent as URL parameters
      });

      if (response.status === 200 || response.status === 201) {
        fetchData();
        setIsPopupOpen(false);
        setIsSuccess(true);
        toast.success(response.data.message);
      }

      console.error('Error fetching payment data:', response);
    } catch (error) {
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
      setLoading(false);
    }
  };

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

  const handleCardPaymentClick = () => {
    setShowRecaptcha(true); // 👉 Show reCAPTCHA checkbox
  };

  const onCaptchaSuccess = (token: string | null) => {
    if (token) {
      setShowRecaptchaSuccess(true);
      setShowRecaptcha(false);
    }
  };

  // const { setOpenModal, setSubjectFromOutside } = useChatContext();
  // const handleChatNow = () => {
  //   if (data?.name) {
  //     setSubjectFromOutside(data?.name); // send subject to chat
  //     setOpenModal('chat'); // open modal
  //   }
  // };

  const handleCardProviderClick = (provider: string) => {
    if (provider == 'unionpay_amex') {
      handlePaymentPaycorp();
    } else {
      handlePayment();
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
        amount: data?.price * 100,
        class_id: id,
        user_id: userId,
        pay_type: 'pack',
        device_type: 'web',
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
        amount: data?.price,
        currency: 'LKR',
        class_id: id, // Ensure 'id' is defined in your component state
        user_id: userId,
        pay_type: 'pack',
        tute_data: tuteRequestsData,
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

  return (
  <>
      {isLoading && (
        <div className="absolute inset-0 z-50 flex h-screen items-center justify-center bg-white bg-opacity-70">
          <TailSpin
            height="40"
            width="40"
            color="#9b59b6"
            ariaLabel="loading"
          />
        </div>
      )}

      <div className="w-full rounded-lg bg-theme p-6 shadow-xl md:p-12 bg-opacity-20">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <div>
              <h2 className="text-2xl font-bold text-theme md:text-xl lg:text-2xl">
                {data?.name}
              </h2>
              <p className="mt-2 text-xl text-gray-600 md:text-xl lg:text-2xl">
                {data?.subject}
              </p>
              <p className="mt-2 text-sm text-gray-500">{data?.exam_year}</p>
              {/* <p className="mt-2 text-sm capitalize text-gray-500">
        By {data?.teacher?.name}
      </p> */}
            </div>

            {/* <div className="relative mt-3">
              <img
                src={`${defaultConfig.BASE_ASSEST_URL}/${data.pack_avatar}`}
                alt="Class Thumbnail"
                className="h-full w-full rounded-lg object-cover md:h-72 md:w-72"
              />
            </div> */}
          </div>

     
        </div>

        {/* Tute Request Modal Popup */}
         {showTuteModal && (
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
                  onClick={() => setShowTuteModal(false)}
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
                  ගෙවීම සම්පූර්ණ කිරීමට, කරුණාකර <strong>EOE වෙබ් යෙදුම</strong> හෝ{" "}
                  <strong>EOE ජංගම යෙදුම</strong> භාවිත කරන්න.
                </p>

              </div>
            </div>
          )}

        {/* Payment Options Modal */}
        {showPaymentOptions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-96 rounded-lg bg-white p-6 text-center shadow-lg">
              {/* ❌ Close Button Top-Right */}
              <button
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-700"
                onClick={() => setShowPaymentOptions(false)}
              >
                ✕
              </button>

              <h2 className="text-xl font-semibold text-gray-800">
                Choose Option
              </h2>
              {/* <p className="mt-2 text-gray-600">
                  Please choose an option to proceed:
                </p> */}

              <div className="mt-4 flex justify-center gap-4">
                {/* <button
                    className="w-full rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                    onClick={() => {
                      setShowPaymentOptions(false);
                      setIsPopupOpen(true);
                    }}
                  >
                    Only Payment
                  </button> */}
                <button
                  className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
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

        {/* Description Section */}

      
      </div>

      {isVerificationPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-80 rounded-lg bg-white p-6 text-center shadow-lg">
            <h2 className="text-lg font-semibold text-red-600">
              Verification Required
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              You're not an approved student. Please verify your identity first.
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

            {!bankTransferClicked && !isBankSlipClicked && showPaymentText && (
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

            <br />
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

            {!isBankSlipClicked && !bankTransferClicked && showPaymentText && (
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
                      <p className="text-sm text-gray-600">Ujith Hemachandra</p>
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
                  <span className="flex items-center gap-1">
                    <ArrowLeft size={17} />
                    Back
                  </span>
                </button>
                <form onSubmit={handleSubmit} className="mt-4">
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
                              className={`flex cursor-pointer items-start rounded-lg border border-gray-400 bg-white p-2 px-7 shadow-md ${
                                formData.bankName === bank.bankName
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
                    <label className="mt-2 block text-sm font-medium text-gray-700">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      name="transaction_id"
                      value={formData.transaction_id}
                      onChange={handleInputChange}
                      placeholder="Enter your reference number"
                      className="mt-1 w-full rounded-lg border-gray-300 bg-slate-100 p-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="mb-4 mt-2">
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
                        <p className="text-sm text-gray-700">Preview:</p>
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
                  setShowPaymentText(true);
                  setIsBankSlipClicked(false);
                }}
              >
                Cancel
              </button>

              {isBankSlipClicked && (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`flex w-full items-center justify-center rounded-lg bg-theme py-2 text-sm text-white hover:bg-purple-600 ${
                    loading ? 'cursor-not-allowed opacity-50' : ''
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
            <h2 className="text-lg font-semibold text-green-600">Success!</h2>
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

      { (
        <>
          {/* Video Section */}
          <div className="mt-5 flex flex-col items-center justify-center p-5">
        
            {/* Filter Section */}
            <div className="mb-6 mt-4 flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
              {/* <div className="mb-6 mt-4">
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setSelectedMonth('All');
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        selectedYear === year
                          ? 'bg-theme text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
         
              <div className="mb-4 mt-2">
                <div className="flex flex-row justify-center gap-1 sm:gap-2">
                  {availableMonths.map((month) => {
                    const isCurrentMonth = data?.packattachment?.some(
                      (attachment) =>
                        month.name.toLowerCase() ===
                        attachment.month.toLowerCase(),
                    );

                    // Check if there are any videos for this month (except "All" option)
                    const hasDataForMonth =
                      month.value === 'All' ||
                      filteredVideos.some(
                        (video) =>
                          video.monthNumber === month.value ||
                          video.month?.toLowerCase() ===
                            month.name.toLowerCase(),
                      );

                    return (
                      <button
                        key={month.value}
                        onClick={() =>
                          hasDataForMonth && setSelectedMonth(month.value)
                        }
                        className={`flex w-full items-center justify-center rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                          selectedMonth === month.value
                            ? 'bg-theme text-white'
                            : isCurrentMonth
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        } ${
                          !hasDataForMonth
                            ? 'cursor-not-allowed opacity-50'
                            : ''
                        }`}
                        disabled={!hasDataForMonth}
                      >
                        {month.name.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div> */}
              {/* Year Filter */}
              {/* <div className="mb-6 mt-4">
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setSelectedMonth('All');
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        selectedYear === year
                          ? 'bg-theme text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div> */}

              {/* <div className="mb-6 mt-4">
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setSelectedMonth('All');
                        setSelectedName('All');
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        selectedYear === year
                          ? 'bg-theme text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div> */}

            {showPopup && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    width: '90%',
                    maxWidth: '400px',
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setShowPopup(false)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'transparent',
                      border: 'none',
                      fontSize: '20px',
                      cursor: 'pointer',
                    }}
                  >
                    ✖
                  </button>

                  {/* Message */}
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                    Everest Player Required
                  </h2>
                  <p style={{ fontSize: '14px', color: '#555', marginBottom: '20px' }}>
                    This video can only be watched using <strong>Everest Player</strong>.
                    Please use the Everest Player app or platform to access this content.
                  </p>

                  {/* Action Buttons */}
                  <div style={{ marginBottom: '16px' }}>
                    <a href="everestapp://singleclass">
                      <button
                        style={{
                          borderRadius: '6px',
                          backgroundColor: '#6F147B',
                          padding: '10px 16px',
                          color: '#fff',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          marginRight: '10px',
                          border: 'none',
                        }}
                      >
                        Open in Desktop App
                      </button>
                    </a>
            {/* 
                    <a href="/dashboard">
                      <button
                        style={{
                          borderRadius: '6px',
                          backgroundColor: '#ddd',
                          padding: '10px 16px',
                          color: '#000',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          border: 'none',
                        }}
                      >
                        Go to Dashboard
                      </button>
                    </a> */}
                  </div>

                  {/* Download Note */}
                  <p style={{ fontSize: '13px', color: '#444' }}>
                    Don’t have the app installed?{' '}
                    <a
                      href="/dashboard"
                      style={{ color: '#6F147B', fontWeight: 'bold', textDecoration: 'none' }}
                    >
                      Download here
                    </a>
                    .
                  </p>
                </div>
              </div>
              )}


              {selectedYear !== 'All' && (
                <div className="mb-4 mt-2">
                  <div className="flex flex-row justify-center gap-1 sm:gap-2">
                    {availableMonths.map((month) => {
                      if (!data?.packattachment) {
                        return null;
                      }
                      const allVideos = data.packattachment.flatMap(
                        (attachment) =>
                          attachment.packvideos.map((video) => ({
                            ...video,
                            year: attachment.year,
                            month: attachment.month,
                            monthNumber: (
                              monthNames.indexOf(attachment.month) + 1
                            )
                              .toString()
                              .padStart(2, '0'),
                            groupName: attachment.name,
                          })),
                      );

                      const hasDataForMonth =
                        month.value === 'All' ||
                        allVideos.some(
                          (video) =>
                            video.year === selectedYear &&
                            (video.monthNumber === month.value ||
                              video.month?.toLowerCase() ===
                                month.name.toLowerCase()),
                        );

                      const isCurrentMonth = data.packattachment.some(
                        (attachment) =>
                          attachment.year === selectedYear &&
                          month.name.toLowerCase() ===
                            attachment.month.toLowerCase(),
                      );

                      return (
                        <button
                          key={month.value}
                          onClick={() => setSelectedMonth(month.value)}
                          className={`flex w-full items-center justify-center rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                            selectedMonth === month.value
                              ? 'bg-theme text-white'
                              : isCurrentMonth
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          } ${
                            !hasDataForMonth && month.value !== 'All'
                              ? 'cursor-not-allowed opacity-50'
                              : ''
                          }`}
                          disabled={!hasDataForMonth && month.value !== 'All'}
                        >
                          {month.name.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {/* Name Filter */}
            <div className="mb-6 mt-4">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                {availableNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setSelectedName(name);
                      setSelectedMonth('All');
                    }}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      selectedName === name
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
            <div className="mt-10 w-full px-4">
              {filteredVideos.length > 0 ? (
               <div className="w-full">
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 pb-4">
                    {filteredVideos.map((video) => (
                      <div
                        key={video.id}
                         className="w-full min-w-[280px] shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-shadow duration-300 hover:shadow-lg"
                      >
                        <div className="relative">
                          {/* {video.thumbnail && (
                            <img
                              src={`${defaultConfig.BASE_ASSEST_URL}/${video.thumbnail}`}
                              alt="Video Thumbnail"
                              className="h-auto w-full object-cover"
                            />
                          )} */}
                          {/* {!video.thumbnail && (
                            <div className="flex h-40 items-center justify-center bg-gray-100">
                              {video.tute ? (
                                <BookOpen size={48} className="text-gray-400" />
                              ) : (
                                <Video size={48} className="text-gray-400" />
                              )}
                            </div>
                          )} */}
                        </div>

                        <div className="p-4 text-center">
                          <h2 className="mb-2 text-lg font-semibold text-gray-800">
                            {video.name}
                          </h2>

                          {/* Video or Tute Button */}
                          {video.video_id ? (
                            <button
                              className={`flex w-full items-center justify-center rounded-md py-2 text-white transition-colors ${
                                video.type === 'free'
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : data?.payStatus === 'completed' 
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : data?.payStatus === 'pending'
                                      ? 'bg-yellow-500'
                                      : 'bg-[#FF3131] hover:bg-red-600'
                              }`}
                              onClick={() => {
                                if (
                                  video.type === 'free' ||
                                  data?.payStatus === 'completed'
                                ) {
                                  if(video.video_type == 'video')
                                  {
                                   window.location.href = `/video-player-url/${encodeURIComponent(video.video_id)}/${id}`;
                                  }else if (video.video_type == 'video_player')
                                  {
                                    window.location.href = `/video-playerTutev2/${video.video_id}/${video.id}/${id}`
                                  }
                                
                                } else if (
                                  isUserstatus !==
                                  'approved'
                                ) {
                                  setIsVerificationPopupOpen(true);
                                } else if (
                                  data?.payStatus != 'completed' &&
                                  data?.payStatus != 'pending'
                                ) {               
                                  setShowTuteModal(true);
                                }
                              }}
                            >
                              <Play className="mr-2" size={18} />
                              {video.type === 'free'
                                ? 'Watch Free'
                                : data?.payStatus  === 'completed'
                                  ? 'Watch'
                                  : data?.payStatus  === 'pending'
                                    ? 'Payment Pending'
                                    : 'Paid Content'}
                            </button>
                          ) : video.tute ? (
                            <button
                              className={`flex w-full items-center justify-center rounded-md bg-[#4CAF50] py-2 text-white transition-colors ${
                                video.type === 'free'
                              ? 'bg-green-500 hover:bg-green-600'
                              : data?.payStatus === 'completed' 
                                ? 'bg-green-500 hover:bg-green-600'
                                : data?.payStatus === 'pending'
                                  ? 'bg-yellow-500'
                                  : 'bg-[#FF3131] hover:bg-red-600'
                              }`}
                              onClick={() => {
                                 if (
                                  video.type === 'free' ||
                                  data?.payStatus === 'completed'
                                ) {
                                  const tuteUrl = `${defaultConfig.BASE_ASSEST_URL}/${video.tute}`;
                                  const link = document.createElement('a');
                                  link.href = tuteUrl;
                                  link.download = video.name || 'download';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                } else if (
                                  isUserstatus !==
                                  'approved'
                                ) {
                                  setIsVerificationPopupOpen(true);
                                } else if (
                                  data?.payStatus != 'completed' &&
                                  data?.payStatus != 'pending'
                                ) {               
                                  setShowTuteModal(true);
                                }

                              }}
                            >
                              <BookOpen className="mr-2" size={18} />   
                                {video.type === 'free'
                              ? 'Download Tute'
                              : data?.payStatus  === 'completed'
                                ? ' Download Tute'
                                : data?.payStatus  === 'pending'
                                  ? 'Payment Pending'
                                  : 'Paid Content'}
                            </button>
                          ) : video.tute_link ? (
                            <button
                              className={`flex w-full items-center justify-center rounded-md bg-[#4CAF50] py-2 text-white transition-colors ${
                               video.type === 'free'
                              ? 'bg-green-500 hover:bg-green-600'
                              : data?.payStatus === 'completed' 
                                ? 'bg-green-500 hover:bg-green-600'
                                : data?.payStatus === 'pending'
                                  ? 'bg-yellow-500'
                                  : 'bg-[#FF3131] hover:bg-red-600'
                              }`}
                            
                            
                              onClick={() => {

                                if (
                                  video.type === 'free' ||
                                  data?.payStatus === 'completed'
                                ) {
                                  if (video.tute_link) {
                                    window.open(video.tute_link, '_blank');
                                  }
                                 } else if (
                                  isUserstatus !==
                                  'approved'
                                ) {
                                  setIsVerificationPopupOpen(true);
                                } else if (
                                  data?.payStatus != 'completed' &&
                                  data?.payStatus != 'pending'
                                ) {               
                                  setShowTuteModal(true);
                                }
                              }}
                              disabled={!video.tute_link}
                            >
                              <ArrowUpRight className="mr-2" size={18} />
                              {video.type === 'free'
                              ? 'Open Tute Link'
                              : data?.payStatus  === 'completed'
                                ? ' Open Tute Link'
                                : data?.payStatus  === 'pending'
                                  ? 'Payment Pending'
                                  : 'Paid Content'}

                              {/* {video.tute_link
                                ? 'Open Tute Link'
                                : 'Link Not Available'} */}
                            </button>
                          ) : (
                            <div className="text-sm text-gray-500">
                              No content available
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-fit w-full flex-col items-center justify-center rounded-lg bg-white p-6 text-center">
                  <div className="flex justify-center">
                    <img
                      src="/images/Animation - 1739266164016.gif"
                      alt="Classes"
                      className="w-40"
                    />
                  </div>
                  <h2 className="mb-4 text-xl font-semibold text-gray-800">
                    No Content Available
                  </h2>
                  <p className="text-gray-600">
                    {selectedYear !== 'All' ||
                    selectedMonth !== 'All' ||
                    selectedName !== 'All'
                      ? 'No content matches your selected filters'
                      : 'There is no content available at the moment. Stay tuned!'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* <h1 className="text-center text-2xl font-semibold">Attachment</h1>
          {data.packattachment && data.packattachment?.length > 0 ? (
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {data.packattachment.map((cls) => (
                <div
                  key={cls.id}
                  className="flex w-full justify-center rounded-lg bg-gray-100 p-3 shadow-md sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6"
                >
                  <div className="flex flex-col items-center p-2">
                    <img
                      src={'/images/Animation - 1740732605777.gif'}
                      alt={cls.name}
                      className="h-32 w-auto rounded-md"
                    />
                    <p className="mt-2 line-clamp-1 max-h-5 min-h-5 w-full truncate text-sm capitalize text-gray-600">
                      {cls.name}
                    </p>
                    <button
                      onClick={() => {
                        const fileUrl = `${defaultConfig.BASE_ASSEST_URL}/${cls.file_path}`;
                        const link = document.createElement('a');
                        link.href = fileUrl;
                        link.download = cls.name || 'download';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-theme px-3 py-2 text-sm text-white hover:bg-purple-600"
                    >
                      <Download className="h-4 w-4" /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <span>
              <div className="mt-4 h-fit w-full rounded-lg bg-white p-6 text-center">
                <div className="flex justify-center">
                  <img
                    src="/images/Animation - 1739266164016.gif"
                    alt="Classes"
                    className="w-40"
                  />
                </div>
                <h2 className="mb-4 text-xl font-semibold text-gray-800">
                  No Attachments Available
                </h2>
                <p className="text-gray-600">
                  There are no Attachments available at the moment. Stay tuned!
                </p>
              </div>
            </span>
          )} */}
        </>
      )}
      </>
  );
}

export default SinglePack;