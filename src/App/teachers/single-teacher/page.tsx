import { useEffect, useState } from 'react';
import TeacherDetails from "../../../Components/all-teachers/single-teacher";
import Headingbar from "../../../Components/headingbar/headingbar";
import { TailSpin } from 'react-loader-spinner';

function SingleTeacher() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to stop loading after 1 second
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Cleanup the timer when the component unmounts
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex flex-col p-2 sm:ml-64">
      

     
      <div className={`flex flex-col gap-5 ${isLoading ? "opacity-20" : "opacity-100"} transition-opacity duration-500`}>
        <Headingbar title="Info" />
        {isLoading && (
        <div className="absolute inset-0 flex h-screen items-center justify-center bg-white  z-50">
          <TailSpin
            height="40"
            width="40"
            color="#9b59b6"
            ariaLabel="loading"
          />
        </div>
      )}
        <TeacherDetails />
      </div>
    </div>
  );
}

export default SingleTeacher;
