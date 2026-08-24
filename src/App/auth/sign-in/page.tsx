import { useState, useEffect, useRef } from 'react'; // Add useRef
import { Eye, EyeOff, X } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { defaultConfig } from '../../../App/configs/common';

const REMEMBER_KEY = 'rememberMe';
const MOBILE_KEY   = 'savedMobile';
const PASS_KEY     = 'savedPassword';
const UNTIL_KEY    = 'savedUntil';           // optional, for expiry
const REMEMBER_DAYS = 30;                     // change if you want

function SigninPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    mobile_contact_number: '',
    password: '',
  });

  const [showModal, setShowModal] = useState(true); // State to control modal visibility
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null); // Ref for the modal content

  // Prefill from remembered credentials
  useEffect(() => {
    const remembered = localStorage.getItem(REMEMBER_KEY) === 'true';
    const savedUntil = localStorage.getItem(UNTIL_KEY);

    // If you want expiry for remembered fields
    const notExpired =
      !savedUntil || new Date(savedUntil).getTime() > Date.now();

    if (remembered && notExpired) {
      const savedMobile = localStorage.getItem(MOBILE_KEY) || '';
      const savedPassword = localStorage.getItem(PASS_KEY) || ''; // ⚠️ insecure in production
      setFormData({
        mobile_contact_number: savedMobile,
        password: savedPassword,
      });
      setRemember(true);
    } else {
      // Clean up stale memory if expired
      localStorage.removeItem(REMEMBER_KEY);
      localStorage.removeItem(MOBILE_KEY);
      localStorage.removeItem(PASS_KEY);
      localStorage.removeItem(UNTIL_KEY);
      setRemember(false);
    }
  }, []);

  useEffect(() => {
    setShowModal(false); // Show modal when component mounts
  }, []);

  // Handle clicks outside the modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) // Check if the click is outside the modal
      ) {
        closeModal();
      }
    };

    // Attach the event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${defaultConfig.BASE_API_URL}/login`,
        formData,
      );

      const data = response.data;

      if (!data?.success) {
        toast.error(data?.message || 'An error occurred');
        setLoading(false);
        return;
      }

      const { token } = data;
      const user_id  = data?.data?.user_id;
      const evrest_id = data?.data?.evrest_id;
      const name     = data?.data?.name;
      const avatar   = data?.data?.avatar;

      if (token) {
        // Save auth
        localStorage.setItem('authToken', token);
        localStorage.setItem('user_id', user_id);
        localStorage.setItem('evrest_id', evrest_id);
        localStorage.setItem('name', name);
        localStorage.setItem('avatar', avatar);

        // Save remembered creds if opted in
        if (remember) {
          localStorage.setItem(REMEMBER_KEY, 'true');
          localStorage.setItem(MOBILE_KEY, formData.mobile_contact_number);

          // ⚠️ If you don't want to persist password, comment the next line.
          localStorage.setItem(PASS_KEY, formData.password);

          // Optional expiry
          const until = new Date();
          until.setDate(until.getDate() + REMEMBER_DAYS);
          localStorage.setItem(UNTIL_KEY, until.toISOString());
        } else {
          // If not remembered, clear any previously saved values
          localStorage.removeItem(REMEMBER_KEY);
          localStorage.removeItem(MOBILE_KEY);
          localStorage.removeItem(PASS_KEY);
          localStorage.removeItem(UNTIL_KEY);
        }

        // Attach interceptor (ideally do this once in app bootstrap)
        axios.interceptors.request.use((config) => {
          const authToken = localStorage.getItem('authToken');
          if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
          }
          return config;
        });

        toast.success(response?.data?.message);

        navigate('/liveclass', {
          state: { mobile_contact_number: data.mobile_contact_number },
        });
      } else {
        throw new Error('Token not found in response');
      }

      setError(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || 'Server error occurred';

        if (error.response?.status === 422) {
          const validationErrors = (error.response?.data as any)?.errors;
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

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {showModal && (
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
            ref={modalRef}
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
              onClick={closeModal}
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
              ඔබට කලින් Everest Chemistry වෙබ් අඩවියෙහි ගිණුමක් ඇති අයකුනම්
              Forgot Password ගොස් ඔබගේ ජංගම දුරකථන අංකය ඇතුලත් කර මුරපදය වෙනස්
              කිරීමට කාරුණික වන්න.
            </p>

            <div
              className="px-5 py-2"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '5px',
              }}
            >
              <button
                className="rounded bg-theme px-4 py-2 text-sm text-white hover:bg-purple-700"
                onClick={() => navigate('/forgot-password')}
                style={{
                  flex: 1,
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Forgot Password
              </button>
            </div>

            <div
              className="px-5 py-2"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '5px',
              }}
            >
              <button
                className="rounded bg-theme px-4 py-2 text-sm text-white hover:bg-purple-700"
                onClick={() => navigate('/signup')}
                style={{
                  flex: 1,
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative flex h-screen w-full items-center justify-center">
        <img
          src="images/login2.jpg"
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

      <form
        onSubmit={handleSubmit}
        className="flex h-1/2 sm:w-full sm:h-full items-center justify-center bg-[#28242c] p-5 md:h-full md:w-[60%]"
      >
        <div className="container p-10">
          <div className="mb-4">
            <h3 className="mb-3 mt-28 text-3xl font-bold text-white">Sign in</h3>
            <h5 className="text-white">
              Please login to continue to your account
            </h5>
          </div>

          <label htmlFor="mobile_contact_number" className="mt-5 block text-xs font-light text-white ">
            Mobile Number
          </label>
          <input
            type="tel"
            id="mobile_contact_number"
            name="mobile_contact_number"
            value={formData.mobile_contact_number}
            onChange={handleChange}
            placeholder="Enter your phone number"
            className="mt-2 w-full  border border-theme p-2 text-xs bg-[#6844a4] text-white placeholder:text-white font-semibold"
            autoComplete="username"
            inputMode="tel"
          />

          <label htmlFor="password" className="mt-5 block text-xs font-light text-white ">
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
              className="w-full  border border-theme p-2 pr-10  bg-[#6844a4] text-white placeholder:text-white font-semibold"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-500"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
               <EyeOff className="h-5 w-5 text-white" />
              ) : (
                <Eye className="h-5 w-5 text-white" />
              )}
            </button>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center">
              <input
                className="mr-2 h-4 w-4 accent-theme focus:ring-theme focus:ring-offset-2"
                type="checkbox"
                id="remember"
                name="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember" className="text-white">
                Keep me logged in
              </label>
            </div>
            {/* <a
              href="/forgot-password"
              className="text-xs text-blue-600 hover:underline"
            >
              Forgot password?
            </a> */}
          </div>

          <div className="mt-5">
            <button
              type="submit"
              className={`w-full rounded px-4 py-2 text-xs text-white font-semibold ${
                loading
                  ? 'cursor-not-allowed bg-gray-400'
                  : 'bg-theme hover:bg-purple-400'
              }`}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Sign in'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SigninPage;
