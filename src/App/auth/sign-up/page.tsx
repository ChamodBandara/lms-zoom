import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { defaultConfig } from '../../../App/configs/common';
import { Eye, EyeOff } from 'lucide-react';

interface CommonData {
  districtsList: string[];
  examYearList: string[];
  streamList: string[];
}

function SignupPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    mobile_contact_number: '',
    contact_number: '',
    nic: '',
    address: '',
    district: '',
    stream: '',
    school_name: '',
    exam_year: '',
    gender: '',
    password: '',
    password_confirmation: '',
    agreeTerms: false,
  });
  const [, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [commondata, setCommonData] = useState<CommonData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { id, value, type } = e.target;
    setFormData({
      ...formData,
      [id]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const response = await axios.post(
        `${defaultConfig.BASE_API_URL}/register`,
        formData,
      );
      const data = await response.data;

      navigate('/signin-verification', {
        state: {
          userId: data.data.user_id,
          mobile_contact_number: data.data.mobile_contact_number,
        },
      });
    } catch (error) {
      setLoading(false);
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
      setError('An unexpected error occurred');
    }
  };

  useEffect(() => {
    const common_data = async () => {
      try {
        const response = await axios.get(
          `${defaultConfig.BASE_API_URL}/get_common_data`,
        );
        setCommonData(response.data.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || 'Server error occurred');
        } else if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unexpected error occurred');
        }
      }
    };
    common_data();
  }, []);

  return (
    <div className="flex h-full flex-col md:h-screen md:flex-row lg:h-full">
      <div className="relative flex h-full w-full items-center justify-center md:w-[60%]">
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

      <div className="flex h-full w-full items-center justify-center bg-white p-5 md:w-[40%]">
        <div className="container p-5 px-5 md:px-10">
          <div className="mt-0">
            <h3 className="mb-3 text-2xl font-bold md:text-3xl">Sign up</h3>
            <p className="text-base text-gray-600">
              Please create an account to start your journey
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mt-2 flex flex-col gap-4 sm:flex-row md:flex-col lg:flex-row">
              <div className="flex-1">
                <label htmlFor="first_name" className="block text-xs">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className="mt-2 w-full rounded-lg border border-theme p-2 text-xs"
                  required
                />
              </div>
              <div className="flex-1">
                <label htmlFor="last_name" className="block text-xs">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className="mt-2 w-full rounded-lg border border-theme p-2 text-xs"
                  required
                />
              </div>
            </div>
            <div className="mt-2 flex flex-col gap-4 sm:flex-row md:flex-col lg:flex-row">
              <div className="flex-1">
                <label
                  htmlFor="mobile_contact_number"
                  className="block text-xs"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="mobile_contact_number"
                  value={formData.mobile_contact_number}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="mt-2 w-full rounded-lg border border-theme p-2 text-xs"
                  required
                />
              </div>
              <div className="flex-1">
                <label htmlFor="contact_number" className="block text-xs">
                  WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="Enter your WhatsApp number"
                  className="mt-2 w-full rounded-lg border border-theme p-2 text-xs"
                  required
                />
              </div>
            </div>
            <div className="mt-3">
              <label htmlFor="nic" className="block text-xs">
                NIC <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nic"
                value={formData.nic}
                onChange={handleChange}
                placeholder="Enter your NIC"
                className="mt-2 w-full rounded-lg border border-theme p-2 text-xs"
                required
              />
            </div>
            <div className="mt-3">
              <label htmlFor="address" className="block text-xs">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
                className="mt-2 w-full rounded-lg border border-theme p-2 text-xs"
                required
              />
            </div>
            <div className="mt-4 flex gap-4">
              <div className="flex-1">
                <label htmlFor="district" className="block text-xs">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-theme bg-white p-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="" disabled selected>
                  Select Your District
                  </option>
                
                  {commondata?.districtsList.map((district, index) => (
                    <option key={index} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="stream" className="block text-xs">
                  AL Stream <span className="text-red-500">*</span>
                </label>
                <select
                  id="stream"
                  name="stream"
                  value={formData.stream}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-theme bg-white p-2 text-xs focus:border-theme focus:ring-2 focus:ring-theme"
                  required
                >
                  <option value="" disabled selected>
                  Select Your Stream
                  </option>
                 
                  {commondata?.streamList.map((stream, index) => (
                    <option key={index} value={stream}>
                      {stream}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-2">
              <label htmlFor="school_name" className="block text-xs">
                School
              </label>
              <input
                type="text"
                id="school_name"
                name="school_name"
                value={formData.school_name}
                onChange={handleChange}
                placeholder="Enter your school name"
                className="mt-2 w-full rounded-lg border border-theme p-2 text-xs"
              />
            </div>
            <div className="mt-3 flex gap-4">
              <div className="flex-1">
                <label htmlFor="exam_year" className="block text-xs">
                  Exam Year <span className="text-red-500">*</span>
                </label>
                <select
                  id="exam_year"
                  name="exam_year"
                  value={formData.exam_year}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-theme p-2 text-xs"
                  required
                >
                  <option value="" disabled selected>
                  Select Your Exam Year
                  </option>
                
                  {commondata?.examYearList.map((exam_year, index) => (
                    <option key={index} value={exam_year}>
                      {exam_year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="gender" className="block text-xs">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-theme bg-white p-2 text-xs focus:border-theme focus:ring-2 focus:ring-theme"
                  required
                >
                  <option value="" disabled selected>
                    Select Your Gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-4 sm:flex-row md:flex-col lg:flex-row">
              <div className="flex-1">
                <label htmlFor="password" className="block text-xs">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your Password"
                    className="mt-2 w-full rounded-lg border border-theme p-2 text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 appearance-none"
                  >
                    {showPassword ? (
                       <EyeOff size={18} className='mt-2' />
                    
                    ) : (
                     
                      <Eye size={18} className='mt-2' />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <label
                  htmlFor="password_confirmation"
                  className="block text-xs"
                >
                  Password Confirmation <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password_confirmation"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    placeholder="Enter your Password"
                    className="mt-2 w-full rounded-lg border border-theme p-2 text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 appearance-none"
                  >
                    {showPassword ? (
                      <EyeOff size={18} className='mt-2' />
                    ) : (
                    
                      <Eye size={18} className='mt-2' />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <input
                className="mr-2 h-4 w-4 border border-theme accent-theme focus:ring-theme focus:ring-offset-2"
                type="checkbox"
                id="agree"
                name="agree"
                required
              />
              <label htmlFor="agree" className="text-xs text-gray-700">
                I agree to the{' '}
                <Link
                  to="/terms-and-conditions"
                  className="text-[#FF7272] hover:underline"
                >
                  Terms and Conditions
                </Link>
              </label>
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
                {loading ? 'Submitting...' : 'Sign up'}
              </button>
            </div>
          </form>
          <div className="relative mt-8 flex items-center justify-center">
            <hr className="h-px w-full border-0 bg-gray-300 dark:bg-gray-700" />
            <span className="absolute bg-white px-2 text-xs text-gray-500">
              or
            </span>
          </div>

          <div className="mb-5 mt-5 flex items-center justify-center">
            <p className="text-xs text-gray-600">
              Already have an account?{' '}
              <a href="/" className="text-theme hover:underline">
                Sign in instead
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;