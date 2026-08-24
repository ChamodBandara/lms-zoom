import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { defaultConfig } from '../../../App/configs/common';
import { toast } from 'react-toastify';

function ForgotPasswordPage() {
  const [, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mobile_contact_number: '',
  });
  const navigate = useNavigate();
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${defaultConfig.BASE_API_URL}/forgotpassword`,
        formData,
      );

      const data = await response.data;
      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        return;
      }
      navigate('/forgot-varification', {
        state: { mobile_contact_number: formData.mobile_contact_number },
      });
      setError(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || 'Server error occurred';

        if (error.response?.status === 422) {
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
        <div className="container mt-16 p-10">
          <div className="mb-2">
            <h3 className="mb-5 mt-5 text-2xl font-bold sm:text-3xl">
              Forgot Password
            </h3>
            <h5 className="text-xs text-gray-500">
              Enter the phone number associated with your account and we’ll send
              an OTP instruction to reset your password.
            </h5>
          </div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="phone" className="mt-5 block text-xs font-light">
              Mobile Number
            </label>
            <input
              type="tel"
              id="mobile_contact_number"
              name="mobile_contact_number"
              value={formData.mobile_contact_number}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="mt-2 w-full rounded-lg border border-theme p-2 text-xs"
            />

            <div className="mt-8">
              <button
                type="submit"
                className={`w-full rounded px-4 py-2 text-xs text-white ${
                  loading
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'bg-theme hover:bg-purple-400'
                }`}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Sent OTP'}
              </button>
            </div>
          </form>
          <div className="relative mt-8 flex items-center justify-center">
            <hr className="h-px w-full border-0 bg-gray-300 dark:bg-gray-700" />
            <span className="absolute bg-white px-2 text-xs text-gray-500">
              or
            </span>
          </div>

          <div className="mt-8">
            <Link to="/">
              <button className="w-full rounded bg-theme px-4 py-2 text-xs text-white hover:bg-purple-400">
                Back to login
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
