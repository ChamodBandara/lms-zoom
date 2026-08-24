import Headingbar from '../../Components/headingbar/headingbar';

import TelegramDetails from '../../Components/support/telegram-support';
import Whatsapp from '../../Components/support/whatsapp-support';

// import SocialMedeia from '../../Components/support/tiktok-youtube';
import { useState, useEffect } from 'react';
import { TailSpin } from 'react-loader-spinner';
// import Facebook from '../../Components/support/facebook';
import SocialAll from '../../Components/support/social-all';


function Support() {
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
      <Headingbar title="Group links" />
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
              <TelegramDetails />
              <Whatsapp />
              {/* <Facebook /> */}
              {/* <Youtube /> */}
              {/* <TiktokSupport /> */}
              {/* <SocialMedeia /> */}
              <SocialAll />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Support;
