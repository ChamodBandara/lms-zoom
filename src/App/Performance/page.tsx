import { useEffect, useState } from "react";
import ClassHeader from "../../Components/ClassHeaders/page"
import Headingbar from "../../Components/headingbar/headingbar"
import MyPerformance from "../../Components/mypreformance/prefromance"
import { TailSpin } from "react-loader-spinner"

function PerformancePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="overflow-x-hidden p-2 sm:ml-64">
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
        <div className="flex flex-col p-4" style={{ overflow: 'hidden' }}>
          <div className="flex flex-col gap-5">
            <Headingbar title="Performance" />
            <ClassHeader
              sub_text="All the details about your performance that you need are listed below."
              main_text="My Performance"
              icon="images/icons/bank1.png"
            />
          </div>
          <div style={{ overflowY: 'auto' }}>
            <MyPerformance />
          </div>
        </div>
      )}
    </div>
  )
}

export default PerformancePage