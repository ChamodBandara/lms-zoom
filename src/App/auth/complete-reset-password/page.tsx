import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CompleteResetPassword() {
  const navigate = useNavigate(); // Hook to navigate to a different route

  useEffect(() => {
    // Set a timeout to redirect after 10 seconds (10000 milliseconds)
    const timer = setTimeout(() => {
      navigate('/'); // Redirect to the sign-in page
    }, 2000); // 10 seconds

    // Clear the timeout if the component is unmounted before 10 seconds
    return () => clearTimeout(timer);
  }, [navigate]); // Only run once on component mount

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

      <div className="flex h-1/2 w-full items-center justify-center bg-white md:h-full md:w-[60%]">
        <div className="container flex flex-col items-center justify-center p-16">
          <div className="mb-4 text-center">
            <h3 className="mb-10 mt-2 text-3xl font-bold">Successful</h3>

            <img
              src="images/success.png"
              alt="Success"
              className="mx-auto h-40 w-40 object-cover"
            />
          </div>

          <h5 className="mt-10 text-xs text-center text-gray-600">
            Awesome! Reset password process has been completed.
          </h5>
        </div>
      </div>
    </div>
  );
}

export default CompleteResetPassword;
