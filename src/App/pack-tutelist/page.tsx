import Headingbar from '../../Components/headingbar/headingbar';

// import SocialMedeia from '../../Components/support/tiktok-youtube';
import { useState, useEffect } from 'react';
import { TailSpin } from 'react-loader-spinner';
// import Facebook from '../../Components/support/facebook';

import PackTutePage from '../../Components/pack-tutepage/page';

function PackTuteListPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulating a loading delay (you can replace this with an actual API call)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Adjust the timeout as needed

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col p-2 sm:ml-64">
      <Headingbar title="Tute List" />
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
          <>
            <div className="rounded-lg bg-white">
              <PackTutePage />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PackTuteListPage;
