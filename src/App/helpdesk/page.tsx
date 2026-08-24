import { useState, useEffect } from 'react';
import { TailSpin } from 'react-loader-spinner';
import Headingbar from '../../Components/headingbar/headingbar';
import HelpPage from '../../Components/help-desk/helppage';
import CallCards from '../../Components/help-desk/Call-cards';

function HelpDesk() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col p-2 sm:ml-64">
      <Headingbar title="Help Desk" />
      <div className="flex flex-col gap-5">
        {isLoading ? (
          <div className="flex h-screen items-center justify-center">
            <TailSpin
              height="40"
              width="40"
              color="#9b59b6"
              ariaLabel="loading"
            />
          </div>
        ) : (
          <div className="rounded-lg bg-white">
            <CallCards />
            <h2 className="mb-4 text-xl font-semibold text-gray-800 text-center">
              eoe.lk Guidance Videos
            </h2>

            <HelpPage />
          </div>
        )}
      </div>
    </div>
  );
}

export default HelpDesk;
