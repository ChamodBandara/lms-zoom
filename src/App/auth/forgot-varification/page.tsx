import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { defaultConfig } from '../../../App/configs/common';
import { toast } from 'react-toastify';

const ForgotVerificationPage: React.FC = () => {
  const location = useLocation();
  const { mobile_contact_number } = location.state || {};
  const [otp, setOtp] = useState<string>(''); // OTP state
  const [timer, setTimer] = useState(120); // Timer for resend
  const [, setError] = useState<string | null>(null); // Error state
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  // Refs to focus next/previous OTP input
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    console.log('Mobile Contact Number:', mobile_contact_number);
  }, [mobile_contact_number]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value;

    // Ensure the value is numeric
    if (/^\d$/.test(value)) {
      const newOtp = otp.split('');
      newOtp[index] = value;
      setOtp(newOtp.join(''));

      // Move to next input if current input is filled
      if (index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    } else if (value === '') {
      const newOtp = otp.split('');
      newOtp[index] = '';
      setOtp(newOtp.join(''));

      // Move to previous input if current input is cleared
      if (index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleResend = async () => {
    try {
      const otpData = { mobile_contact_number };

      // Make the API request
      const response = await axios.post(
        `${defaultConfig.BASE_API_URL}/otpresend`,
        otpData,
      );

      if (response.data.success) {
        setTimer(120);
        setOtp('');
      } else {
        console.log('No notification message found in the response.');
      }
    } catch (error: any) {
      console.error('Error while resending OTP');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setLoading(true);
      setError(null);
      const response = await axios.post(
        `${defaultConfig.BASE_API_URL}/otpforgotpassword`,
        {
          otp,
          mobile_contact_number,
        },
      );

      if (response.data.status) {
        navigate('/password-reset', {
          state: { mobile_contact_number: mobile_contact_number },
        });
        setLoading(false);
        return;
      }

      setError(null);
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

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <div className="relative flex h-full w-full items-center justify-center">
      <img
          src="images/Banner.jpg"
          alt="Login"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/images/logo-white.png"
            className="mt-20 h-auto w-72 lg:mt-10"
          />
        </div>
      </div>

      <div className="flex h-1/2 w-full items-center justify-center bg-white p-5 md:h-full md:w-[60%]">
        <form onSubmit={handleSubmit}>
          <div className="container mt-14 p-10">
            <div className="mb-2">
              <h3 className="mb-5 mt-5 text-2xl font-bold sm:text-3xl">
                Forgot Verification
              </h3>
              <h5 className="text-xs text-gray-500">
                An authentication OTP has been sent to your mobile number:{' '}
                {mobile_contact_number}. Please enter the OTP to log in to the
                eoe.
              </h5>
            </div>

            <div className="flex h-full flex-col items-center justify-center">
              <div className="mb-2 mt-5 flex space-x-2 rtl:space-x-reverse">
                {[...Array(6)].map((_, index) => (
                  <div key={index}>
                    <label htmlFor={`code-${index + 1}`} className="sr-only">
                      Code {index + 1}
                    </label>
                    <input
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      id={`code-${index + 1}`}
                      value={otp[index] || ''}
                      onChange={(e) => handleOtpChange(e, index)} // Handle OTP change
                      ref={(el) => (otpRefs.current[index] = el)} // Auto-focus functionality
                      className="focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 block h-9 w-9 rounded-lg border border-gray-300 bg-white py-3 text-center text-sm font-extrabold text-gray-900"
                      required
                    />
                  </div>
                ))}
              </div>

              <p
                id="helper-text-explanation"
                className="dark:text-gray-400 mt-2 text-xs text-gray-500"
              >
                Please introduce the 6 digit code we sent via phone number.
              </p>

              <p className="mt-3 text-sm text-gray-500">{formatTime(timer)}</p>
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
                className={`w-full rounded px-4 py-2 text-xs text-white ${
                  loading
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'bg-theme hover:bg-purple-400'
                }`}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>

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
        </form>
      </div>
    </div>
  );
};

export default ForgotVerificationPage;
