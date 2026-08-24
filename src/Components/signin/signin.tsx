import  { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

function Signin() {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Left side */}
      <div className="hidden md:flex h-screen w-full items-center justify-center">
        <img
          src="images/Login.jpg"
          alt="Login"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Right side */}
      <div className="flex h-screen w-full items-center justify-center bg-white md:w-[60%]">
        <div className="w-full max-w-md p-6 shadow-lg rounded-lg">
          <div className="mb-4">
            <h3 className="text-3xl font-bold">Sign in</h3>
            <h5 className="text-gray-600">
              Please login to continue to your account
            </h5>
          </div>

          <label htmlFor="phone" className="mt-5 block font-light">
            Mobile Number
          </label>
          <input
            type="tel"
            id="phone"
            placeholder="Enter your phone number"
            className="mt-2 w-full rounded-lg border border-theme p-2"
          />

          <label htmlFor="phpassword" className="mt-5 block font-light">
            Password
          </label>
          <div className="relative mt-2">
            <input
              type={showPassword ? 'text' : 'password'}
              id="phpassword"
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

          <div className="mt-5 flex items-center">
            <input
              className="mr-2 h-4 w-4 accent-theme focus:ring-theme focus:ring-offset-2"
              type="checkbox"
              id="remember"
              name="remember"
            />
            <label htmlFor="remember" className="text-sm text-gray-700">
              Keep me logged in
            </label>
          </div>

          <div className="mt-5">
            <button className="w-full rounded bg-theme px-4 py-2 text-white hover:bg-purple-400">
              Sign in
            </button>
          </div>

          <div className="relative mt-8 flex items-center justify-center">
            <hr className="h-px w-full border-0 bg-gray-300 dark:bg-gray-700" />
            <span className="absolute bg-white px-2 text-gray-500">or</span>
          </div>

          <div className="mt-5 flex items-center justify-center">
            <h3 className="text-gray-600">
              Need an account?{' '}
              <a href="/signup" className="text-theme hover:underline">
                Create one
              </a>
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signin;
