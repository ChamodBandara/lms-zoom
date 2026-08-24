import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { defaultConfig } from '../../../App/configs/common';
interface SigninVerificationPageProps {
  userId: string;
  mobile_contact_number: number;
}

const SigninVerificationPage: React.FC = () => {
  const [otp, setOtp] = useState<string>(''); // OTP state
  const [timer, setTimer] = useState(150); // Timer state
  const [, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { mobile_contact_number } =
    (location.state as SigninVerificationPageProps) || {};

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]); // Ref to track OTP input fields

  useEffect(() => {
    // Timer logic for countdown
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Handle OTP input change
  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      const newOtp = otp.split('');
      newOtp[index] = value;
      setOtp(newOtp.join(''));
      // Move focus to the next input if value is entered
      if (value && otpRefs.current[index + 1]) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  // Move focus to previous box if value is deleted
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === 'Backspace' && otp[index] === '') {
      // Focus previous box if current box is empty
      if (otpRefs.current[index - 1]) {
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  // Resend OTP logic
  const handleResend = async () => {
    try {
      const otpData = { mobile_contact_number };

      // Make the API request
      const response = await axios.post(
        `${defaultConfig.BASE_API_URL}/otpresend`,
        otpData,
      );

      if (response.data.success) {
        setTimer(150);
        setOtp('');
      } else {
        console.log('No notification message found in the response.');
      }
    } catch (error: any) {
      console.error('Error while resending OTP');
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = { otp, mobile_contact_number };

    try {
      const response = await axios.post(
        `${defaultConfig.BASE_API_URL}/otplogin`,
        formData,
      );
      const { token, data } = response.data;
      const user_id = response.data.data.user_id;
      const name = response.data.data.name;
      const avatar = response.data.data.avatar;

      if (token) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user_id', user_id);
        localStorage.setItem('name', name);
        localStorage.setItem('avatar', avatar);

        axios.interceptors.request.use((config) => {
          const authToken = localStorage.getItem('authToken');
          if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
          }
          return config;
        });

        toast.success(response?.data?.message);

        navigate('/dashboard', {
          state: { mobile_contact_number: data.mobile_contact_number },
        });
      } else {
        throw new Error('Token not found in response');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || 'Server error occurred';
        toast.error(errorMessage);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Left Section: Background Image */}
      <div className="relative flex h-full w-full items-center justify-center md:w-[90%]">
      <img
          src="images/Banner.jpg"
          alt="Login"
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/images/logo-white.png"
            alt="Logo"
            className="h-auto w-72"
          />
        </div>
      </div>

      <div className="flex h-1/2 w-full items-center justify-center bg-white p-5 md:h-full md:w-[60%]">
        <div className="container mt-14 p-10">
          <div className="mb-2">
            <h3 className="mb-5 mt-5 text-2xl font-bold sm:text-3xl">Log In</h3>
            <h5 className="text-xs text-gray-500">
              An authentication OTP has been sent to your mobile number:{' '}
              {mobile_contact_number || '07*****057'}. Please enter the OTP to
              log in to the eoe.
            </h5>
          </div>

          <form onSubmit={handleSubmit}>
            {/* OTP with timer component */}
            <div className="flex h-full flex-col items-center justify-center">
              <div className="mb-2 mt-5 flex space-x-2 rtl:space-x-reverse">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <div key={num}>
                    <label htmlFor={`code-${num}`} className="sr-only">
                      Code {num}
                    </label>
                    <input
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      id={`code-${num}`}
                      value={otp[num - 1] || ''}
                      onChange={(e) => handleOtpChange(e, num - 1)}
                      onKeyDown={(e) => handleKeyDown(e, num - 1)}
                      ref={(el) => (otpRefs.current[num - 1] = el)}
                      className="focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 block h-9 w-9 rounded-lg border border-gray-300 bg-white py-3 text-center text-sm font-extrabold text-gray-900"
                      required
                    />
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-500">{formatTime(timer)}</p>
              <button
                onClick={handleResend}
                className={`mt-4 text-xs ${timer > 0 ? 'pointer-events-none text-gray-400' : 'text-red-500 hover:underline'}`}
                disabled={timer > 0}
              >
                I didn’t receive any code. RESEND
              </button>
            </div>

            <div className="mt-5">
              <button
                type="submit"
                className={`w-full rounded bg-theme px-4 py-2 text-xs text-white hover:bg-purple-400 
                  ${
                    loading
                      ? 'cursor-not-allowed bg-gray-400'
                      : 'bg-theme hover:bg-purple-400'
                  }`}
                  disabled={loading}

            >
                {loading ? 'Submitting...' : 'Log in'}
              </button>
            </div>
          </form>
          <div className="relative mt-8 flex items-center justify-center">
            <hr className="dark:bg-gray-700 h-px w-full border-0 bg-gray-300" />
            <span className="absolute bg-white px-2 text-xs text-gray-500">
              or
            </span>
          </div>

          <div className="mt-10 flex items-center justify-center">
            <button className="w-full rounded bg-gray-200 px-4 py-2 text-xs text-black hover:bg-purple-400">
              <Link to="/" className="block h-full w-full">
                Back to Login
              </Link>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SigninVerificationPage;
