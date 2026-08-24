import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import OtpInput from "react-otp-input";

const ForgotVerificationPage: React.FC = () => {
  const [otp, setOtp] = useState(""); // To store OTP input
  const [timer, setTimer] = useState(150); // Timer for OTP validity (2.5 minutes)
  const [mobileNumber, setMobileNumber] = useState<string>(""); // State for mobile number

  // Simulate API call to fetch mobile number
  useEffect(() => {
    const fetchMobileNumber = async () => {
      // Replace this with your actual API call
      const response = await fetch("https://api.example.com/get-mobile-number");
      const data = await response.json();
      setMobileNumber(data.mobileNumber); // Update mobile number in state
    };

    fetchMobileNumber(); // Call the function on component mount
  }, []);

  // Timer logic: countdown from 150 seconds (2.5 minutes)
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1); // Decrease timer by 1 each second
      }, 1000);
      return () => clearInterval(interval); // Clear interval when component unmounts or timer stops
    }
  }, [timer]);

  // Function to reset timer and OTP field on resend
  const handleResend = () => {
    setTimer(150); // Reset timer to 150 seconds (2.5 minutes)
    setOtp(""); // Clear OTP input field
    console.log("OTP resent");
  };

  // Format time to MM:SS (Minutes:Seconds) format
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Left Section: Background Image */}
      <div className="flex h-screen w-full items-center justify-center">
        <img
          src="images/Login.png" // Replace with your image path
          alt="Login"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Right Section: OTP Form */}
      <div className="flex h-1/2 w-full items-center justify-center bg-white p-5 md:h-full md:w-[60%]">
        <div className="container mt-14 p-10">
          <div className="mb-2">
            <h3 className="mb-5 mt-5 text-2xl font-bold sm:text-3xl">
              Forgot Password
            </h3>
            <h5 className="text-gray-500">
              An authentication OTP has been sent to your mobile number:{" "}
              {mobileNumber || "07*****057"}. Please enter the OTP to log in to
              the app.
            </h5>
          </div>

          {/* OTP with timer component */}
          <div className="flex h-full flex-col items-center justify-center">
            <OtpInput
              value={otp}
              onChange={setOtp}
              numInputs={6}
              containerStyle="flex space-x-2"
              inputStyle="w-12 h-12 border border-gray-300 rounded-lg text-center text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              renderInput={(inputProps, index) => (
                <input {...inputProps} key={index} />
              )}
            />
            <p className="mt-3 text-sm text-gray-500">{formatTime(timer)}</p>
            <button
              onClick={handleResend}
              className={`mt-4 text-sm ${
                timer > 0
                  ? "pointer-events-none text-gray-400"
                  : "text-red-500 hover:underline"
              }`}
              disabled={timer > 0}
            >
              I didn’t receive any code. RESEND
            </button>
          </div>

          <div className="mt-5">
            <button className="w-full rounded bg-theme px-4 py-2 text-white hover:bg-purple-400">
              <Link to="/password-reset" className="block h-full w-full">
                Sign in
              </Link>
            </button>
          </div>

          <div className="relative mt-8 flex items-center justify-center">
            <hr className="h-px w-full border-0 bg-gray-300 dark:bg-gray-700" />
            <span className="absolute bg-white px-2 text-gray-500">or</span>
          </div>

          <div className="mt-10 flex items-center justify-center">
            <button className="w-full rounded bg-gray-200 px-4 py-2 text-black hover:bg-purple-400">
              <Link to="/signin" className="block h-full w-full">
                Back to Login
              </Link>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotVerificationPage;
