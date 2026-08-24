import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { ArrowLeft, Download, GraduationCap } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { toast } from 'react-toastify';

import axios from 'axios';

import { TailSpin } from 'react-loader-spinner';
import { defaultConfig } from '../../configs/common';
import api from '../../../services/api';

interface SingleClassProps {
  id: string;
  name: string;
  description: string;
  stream: [];
  type: string;
  price: string;
  teacher_id: string;
  seminar_avatar: string;
  video_link: string;
  attachment: string;
  start_date: string;
  isEnrolledFree: boolean;
  isEnrolled: boolean;
  isPending: boolean;
  isFree: boolean;
  isUserstatus: string;
  teacher: {
    id: string;
    name: string;
    avatar: string;
    teacher_details: {
      qulification: string;
    };
  };
}

function SingleSemina() {
  const [seminarDetails, setSeminarDetails] = useState<SingleClassProps | null>(
    null,
  );
  const { id } = useParams();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [] = useState(false);

  const [formData, setFormData] = useState({
    referenceNumber: '',
    bankName: '',
    slipImage: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const [loading, setLoading] = useState(false);

  const getSingleSeminarDetails = async () => {
    const response = await api.post(
      `${defaultConfig.BASE_API_URL}/getsingleseminar`,
      {
        seminar_id: id,
      },
    );
    setSeminarDetails(response.data?.data.seminarDetails);
    setIsLoading(false);
  };

  useEffect(() => {
    if (id) {
      getSingleSeminarDetails();
    }
  }, [id]);

  // Function to strip HTML tags from "about" field
  const stripHtmlTags = (html: string | undefined) => {
    return html ? html.replace(/<\/?[^>]+(>|$)/g, '') : '';
  };
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isBankSlipClicked, setIsBankSlipClicked] = useState(false);
  const [bankTransferSelected] = useState(false);
  const [bankTransferClicked] = useState(false);
  const [, setBankSlipClicked] = useState(false);
  const [showPaymentText, setShowPaymentText] = useState(true);
  const [isVerificationPopupOpen, setIsVerificationPopupOpen] = useState(false);

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

    if (!formData.referenceNumber || !formData.slipImage) {
      toast.error('Please provide Reference Number');
      return;
    }

    if (!formData.slipImage) {
      toast.error('Please provide Slip Image');
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
    paymentData.append('seminar_id', id || '');
    paymentData.append('bank_type', formData.bankName);
    if (formData.slipImage) {
      paymentData.append('slip', formData.slipImage);
    }

    try {
      const response = await api.post(
        `${defaultConfig.BASE_API_URL}/submitseminarpayment`,
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

  const [] = useState({
    bill_address1: 'kurunegala',
    bill_city: 'kurunegala',
    bill_country: 'LK', // Default to Sri Lanka
    customer_email: 'neo.induranga123@gmail.com',
    customer_lastname: 'bandara',
  });

  const handlePayment = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      const paymentData = {
        transaction_type: 'sale',
        reference_number: `ORDER_${Date.now()}`,
        amount: '10',
        currency: 'USD',
        class_id: id, // Ensure 'id' is defined in your component state
        user_id: userId,
        pay_type: 'pack',
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

      const { signature, params ,  url} = response.data;

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
                {seminarDetails?.name}
              </h2>

              <p className="mt-2 max-w-36 rounded-full bg-blue-100 px-2 py-1 text-center text-sm text-blue-800">
                Date: {seminarDetails?.start_date}
              </p>
            </div>
          </div>

          <div className="bg-white p-4">
            <div className="mx-auto mt-5 flex w-full flex-col items-start overflow-hidden rounded-lg md:flex-row md:items-stretch">
              <div className="flex justify-center md:w-1/2">
                <img
                  src={`${defaultConfig.BASE_ASSEST_URL}/${seminarDetails?.seminar_avatar}`}
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
                          {seminarDetails?.teacher.name}
                        </span>
                      </div>
                      <p className="inline-flex items-center text-sm capitalize text-gray-600">
                        <GraduationCap className="mr-1" />
                        {seminarDetails?.teacher?.teacher_details?.qulification}
                      </p>
                    </div>
                    <img
                      src={`${defaultConfig.BASE_ASSEST_URL}/${seminarDetails?.teacher.avatar}`}
                      alt="Profile"
                      className="ml-10 h-14 w-14 rounded-full lg:h-20 lg:w-20"
                    />
                  </div>
                </div>

                {!seminarDetails?.isEnrolled && !seminarDetails?.isFree && (
                  <div className="mt-8">
                    <p className="text-xl text-gray-700 md:text-lg lg:text-2xl">
                      Seminar Price:
                    </p>
                    <p className="text-2xl font-bold text-theme md:text-2xl lg:text-3xl">
                      RS {seminarDetails?.price}.00
                    </p>
                  </div>
                )}

                {seminarDetails?.isPending ? (
                  <button className="text-1xl mt-8 w-full rounded-lg bg-green-500 py-2 text-white hover:bg-green-700">
                    Pending
                  </button>
                ) : seminarDetails?.isFree ? (
                  <a
                    href={seminarDetails?.video_link}
                    className="text-1xl mt-8 flex w-full items-center justify-center rounded-lg bg-theme py-2 text-white hover:bg-purple-900"
                  >
                    Join Now
                  </a>
                ) : !seminarDetails?.isEnrolled ? (
                  <button
                    className="text-1xl mt-8 w-full rounded-lg bg-theme py-2 text-white hover:bg-purple-900"
                    onClick={() => {
                      if (seminarDetails?.isUserstatus !== 'approved') {
                        setIsVerificationPopupOpen(true);
                      } else {
                        setIsPopupOpen(true);
                      }
                    }}
                  >
                    Buy Now
                  </button>
                ) : (
                  <a
                    href={seminarDetails?.video_link}
                    className="text-1xl mt-8 flex w-full items-center justify-center rounded-lg bg-theme py-2 text-white hover:bg-purple-900"
                  >
                    Join Now
                  </a>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-col">
              <hr className="w-full border-gray-200" />
              <h4 className="mt-4 text-lg font-semibold text-gray-800">
                Description
              </h4>
              <span className="mb-4 mt-2 break-words text-sm capitalize text-gray-600">
                {seminarDetails?.description
                  ? stripHtmlTags(seminarDetails.description)
                  : 'No description available.'}
              </span>
              {(seminarDetails?.isEnrolled || seminarDetails?.isFree) && (
                <div>
                  <h1 className="text-center text-2xl font-semibold">
                    Attachment
                  </h1>
                  <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <div className="flex w-full justify-center rounded-lg bg-gray-100 p-3 shadow-md sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6">
                      <div className="flex flex-col items-center p-2">
                        <img
                          src={'/images/Animation - 1740732605777.gif'}
                          alt={seminarDetails?.name}
                          className="h-32 w-auto rounded-md"
                        />

                        <button
                          onClick={() => {
                            const fileUrl = `${defaultConfig.BASE_ASSEST_URL}/${seminarDetails?.attachment}`;
                            const link = document.createElement('a');
                            link.href = fileUrl;
                            link.download = seminarDetails?.name || 'download';
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
                  </div>
                </div>
              )}
            </div>
          </div>

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
                  <button
                    className="mt-4 rounded-lg bg-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-400"
                    onClick={() => setIsVerificationPopupOpen(false)}
                  >
                    Close
                  </button>
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
                        handlePayment();
                        // setBankTransferClicked(true);
                        // setBankTransferSelected(true);
                        // setShowPaymentText(false);
                        // toast.info('Bank Transfer Selected');
                      }}
                    >
                      Card Payment
                    </button>
                  )}

                {!isBankSlipClicked &&
                  !bankTransferClicked &&
                  showPaymentText && (
                    <button
                      className="mb-4 w-full rounded-lg bg-theme py-2 text-white hover:bg-purple-600"
                      onClick={() => {
                        setBankSlipClicked(true);
                        setIsBankSlipClicked(true);
                        setShowPaymentText(false);
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
        </div>
      )}
    </>
  );
}

export default SingleSemina;
