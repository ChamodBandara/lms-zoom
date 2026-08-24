import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { defaultConfig } from '../../configs/common';
function SigninPageAdmin() {
  const [token, setToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mobile_contact_number: '',
    password: '',
  });
  const navigate = useNavigate();
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };



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
        navigate('/dashboard', {
          state: { mobile_contact_number: "" },
        });
      }
    }, [token]); // Only depend on token
    
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${defaultConfig.BASE_API_URL}/login`,
        formData,
      );

      const data = await response.data;

      if (!data.success) {
        toast.error(data.message || 'An error occurred');
        setLoading(false);
        return;
      }

      const { token } = response.data;
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

      // navigate('/signin-verification', {
      //   state: { mobile_contact_number: formData.mobile_contact_number },
      // });

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
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <div className="relative flex h-screen w-full items-center justify-center">
      
        <img
          src="images/Banner.jpg"
          alt="Login"
          className="h-full w-full object-cover"
        />

      <div className="absolute inset-0 flex items-center justify-center">
          <img src="/images/logo-white.png" className='w-72 h-auto lg:mt-10 mt-20 ' />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex h-1/2 w-full items-center justify-center bg-white p-5 md:h-full md:w-[60%]"
      >
        <div className="container p-10">
          <div className="mb-4">
            <h3 className="mb-3 mt-28 text-3xl font-bold">Admin sign in</h3>
            <h5 className="text-gray-600">
              Please login to continue to your account
            </h5>
          </div>

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

          <label htmlFor="phpassword" className="mt-5 block text-xs font-light">
            Password
          </label>
          <div className="relative mt-2 text-xs">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-theme p-2 pr-10"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-500"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center">
              {/* <input
                className="mr-2 h-4 w-4 accent-theme focus:ring-theme focus:ring-offset-2"
                type="checkbox"
                id="remember"
                name="remember"
              /> */}
              {/* <label htmlFor="remember" className="text-xs text-gray-700">
                Keep me logged in
              </label> */}
            </div>
            <a
              href="/forgot-password"
              className="text-xs text-blue-600 hover:underline"
            >
              Forgot password?
            </a>
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
              {loading ? 'Submitting...' : 'Sign in'}
            </button>
          </div>

          <div className="relative mt-8 flex items-center justify-center">
            <hr className="h-px w-full border-0 bg-gray-300 dark:bg-gray-700" />
            <span className="absolute bg-white px-2 text-xs text-gray-500">
              or
            </span>
          </div>

          <div className="mt-5 flex items-center justify-center text-xs">
            <h3 className="text-gray-600">
              Need an account?{' '}
              <a href="/signup" className="text-theme hover:underline">
                Create one
              </a>
            </h3>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SigninPageAdmin;
