import  { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <div className="flex h-screen w-full items-center justify-center">
        <img
          src="images/Login.png"
          alt="Login"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex h-1/2 w-full items-center justify-center bg-white md:h-full md:w-[60%]">
        <div className="container mt-14 p-14">
          <div className="mb-4">
            <h3 className="mb-5 mt-5 text-2xl font-bold sm:text-3xl">
              Reset Password
            </h3>
            <h5 className="text-gray-600">
              Please make sure your new password must be different from previous
              used passwords.
            </h5>
          </div>

          <label htmlFor="phpassword" className="mt-5 block font-light">
            New Password
          </label>
          <div className="relative mt-4">
            <input
              type={showPassword ? 'text' : 'password'}
              id="phpassword"
              placeholder="Enter your password"
              className="w-full rounded-lg border border-theme p-2 pr-10"
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

          <label htmlFor="phpassword" className="mt-5 block font-light">
            Retype Password
          </label>
          <div className="relative mt-4">
            <input
              type={showPassword ? 'text' : 'password'}
              id="phpassword"
              placeholder="Enter your password"
              className="w-full rounded-lg border border-theme p-2 pr-10"
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
            <Link to="/complete-reset-password">
              <button className="w-full rounded bg-theme px-4 py-2 text-white hover:bg-purple-400">
                Change Password
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
