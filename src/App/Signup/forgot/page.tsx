import { Link } from 'react-router-dom';

function ForgotPasswordPage() {
  return (
    <div className="flex h-screen flex-col md:flex-row">
      <div className="flex h-screen w-full items-center justify-center">
        <img
          src="images/Login.png"
          alt="Login"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex h-1/2 w-full items-center justify-center bg-white p-5 md:h-full md:w-[60%]">
        <div className="container mt-16 p-10">
          <div className="mb-2">
            <h3 className="mb-5 mt-5 text-2xl font-bold sm:text-3xl">
              Forgot Password
            </h3>
            <h5 className="text-gray-500">
              Enter the phone number associated with your account and we’ll send
              an OTP instruction to reset your password.
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

          <div className="mt-8">
            <Link to="/forgot-varification">
              <button className="w-full rounded bg-theme px-4 py-2 text-white hover:bg-purple-400">
                Sent OTP
              </button>
            </Link>
          </div>

          <div className="relative mt-8 flex items-center justify-center">
            <hr className="h-px w-full border-0 bg-gray-300 dark:bg-gray-700" />
            <span className="absolute bg-white px-2 text-gray-500">or</span>
          </div>

          <div className="mt-8">
            <Link to="/signin">
              <button className="w-full rounded bg-theme px-4 py-2 text-white hover:bg-purple-400">
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
