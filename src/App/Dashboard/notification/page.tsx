import { useState, useEffect } from 'react';
import Headingbar from '../../../Components/headingbar/headingbar';
import NotificationList from '../../../Components/notification/notifiaction';
import { TailSpin } from 'react-loader-spinner'; 

function NotificationPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    
    setTimeout(() => {
      setIsLoading(false);
    }, 2000); 
  }, []);

  return (
    <div className="flex flex-col p-2 sm:ml-64">
    
          <div className="flex flex-col gap-5">
            <Headingbar title="Notifications" />
          </div>

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
          <NotificationList />
        </>
      )}
    </div>
  );
}

export default NotificationPage;
