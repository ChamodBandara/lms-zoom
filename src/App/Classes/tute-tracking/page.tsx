import { useState, useEffect } from "react";
import { TailSpin } from "react-loader-spinner";

import TuteTrack from "../../../Components/tute/tute-tracking";
import ClassHeader from "../../../Components/ClassHeaders/page";
import Headingbar from "../../../Components/headingbar/headingbar";

function TuteTrackingPage() {
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
      {isLoading ? (
        <div className="flex h-screen items-center justify-center">
          <TailSpin height="40" width="40" color="#9b59b6" ariaLabel="loading" />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <Headingbar title="Tute Tracking" />
          <ClassHeader
            sub_text="All the details about your performance that you need are listed below."
            main_text="Tute Tracking"
            icon="images/icons/tracking.png"
          />
          <TuteTrack />
        </div>
      )}
    </div>
  );
}

export default TuteTrackingPage;
