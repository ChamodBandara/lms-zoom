import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { defaultConfig } from '../../../App/configs/common';
import { toast } from 'react-toastify';


function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<{
    password: string;
    password_confirmation: string;
  }>({
    password: '',
    password_confirmation: '',
  });

  const location = useLocation();
  const { mobile_contact_number } = location.state || {};

  console.log('mobile_contact_number', mobile_contact_number);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
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
        `${defaultConfig.BASE_API_URL}/resetpassword`,
        { ...formData, mobile_contact_number },
      );

      if (response.data.success) {
        navigate('/complete-reset-password');
        setLoading(false);
        return;
      }
      

    } catch (error:any) {
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
      <form onSubmit={handleSubmit}>
        <div className="lg:mt-0 mt-10 flex h-1/2 w-full items-center justify-center bg-white md:h-full ">
          <div className="container mt-14 p-14">
            <div className="mb-4">
              <h3 className="mb-5 mt-5 text-2xl font-bold sm:text-3xl">
                Reset Password
              </h3>
              <h5 className="text-xs text-gray-600">
                Please make sure your new password must be different from
                previous used passwords.
              </h5>
            </div>

            <label htmlFor="password" className="mt-5 block text-xs font-light">
              New Password
            </label>
            <div className="relative mt-4">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-theme p-2 pr-10 text-xs"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-2 top-1/2 -translate-y-1/2 transform text-theme"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <label
              htmlFor="password_confirmation"
              className="mt-5 block text-xs font-light"
            >
              Retype Password
            </label>
            <div className="relative mt-4">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password_confirmation"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-theme p-2 pr-10 text-xs"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-2 top-1/2 -translate-y-1/2 transform text-theme"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="mt-12">
              <button
                type="submit"
                className={`w-full rounded px-4 py-2 text-xs text-white ${
                  loading
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'bg-theme hover:bg-purple-400'
                }`}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ResetPasswordPage;
