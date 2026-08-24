'use client';
import  { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

function Signup() {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flex h-1/2 flex-col md:flex-row">
      <div className="flex h-full w-full items-center justify-center py-12 md:h-full md:w-[60%]">
        <img
          src="images/Login.jpg"
          alt="Login"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex h-full w-full items-center justify-center bg-white md:w-[40%]">
        <div className="container p-5 px-5 md:px-10">
          <div className="mt-5">
            <h3 className="mb-3 text-3xl font-bold">Sign up</h3>
            <p className="text-gray-600">
              Please create an account to start your journey
            </p>
          </div>

          <label htmlFor="first-name" className="mt-4 block">
            First Name
          </label>
          <input
            type="text"
            id="first-name"
            placeholder="Enter your first name"
            className="mt-2 w-full rounded-lg border border-theme p-2"
          />

          <label htmlFor="last-name" className="mt-4 block">
            Last Name
          </label>
          <input
            type="text"
            id="last-name"
            placeholder="Enter your last name"
            className="mt-2 w-full rounded-lg border border-theme p-2"
          />

          <label htmlFor="phone" className="mt-4 block">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            placeholder="Enter your phone number"
            className="mt-2 w-full rounded-lg border border-theme p-2"
          />

          <label htmlFor="gender" className="mt-4 block text-sm md:text-base">
            Gender
          </label>
          <select
            id="gender"
            className="mt-2 w-full rounded-lg border border-theme bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 md:text-base"
          >
            <option value="" disabled>
              Select Your Gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <label htmlFor="batch" className="mt-4 block">
            Batch
          </label>
          <select
            id="batch"
            className="mt-2 w-full rounded-lg border border-theme bg-white p-2 focus:border-theme focus:ring-2 focus:ring-theme"
          >
            <option value="" disabled selected>
              Select Your Batch
            </option>
            <option value="24/23">24/23</option>
            <option value="23/22">23/22</option>
            <option value="22/21">22/21</option>
          </select>

          <label htmlFor="password" className="mt-5 block">
            Password
          </label>
          <div className="relative mt-2">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
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

          <label htmlFor="confirm-password" className="mt-5 block">
            Confirm Password
          </label>
          <div className="relative mt-2">
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirm-password"
              placeholder="Re-enter your password"
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

          <div className="mt-4 flex items-center">
            <input
              className="mr-2 h-4 w-4 border border-theme accent-theme focus:ring-theme focus:ring-offset-2"
              type="checkbox"
              id="agree"
              name="agree"
            />
            <label htmlFor="agree" className="text-sm text-gray-700">
              I agree to{' '}
              <a href="#" className="text-[#FF7272] hover:underline">
                the Terms and Conditions
              </a>
            </label>
          </div>

          <div className="mt-5">
            <button className="w-full rounded bg-theme px-4 py-2 text-white hover:bg-purple-400">
              Sign up
            </button>
          </div>

          <div className="relative mt-8 flex items-center justify-center">
            <hr className="h-px w-full border-0 bg-gray-300 dark:bg-gray-700" />
            <span className="absolute bg-white px-2 text-gray-500">or</span>
          </div>

          <div className="mt-5 flex items-center justify-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <a href="/signin" className="text-theme hover:underline">
                Sign in instead
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
