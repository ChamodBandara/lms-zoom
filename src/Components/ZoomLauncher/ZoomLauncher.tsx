import React, { useEffect, useState } from "react";
import { TailSpin } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";

interface ZoomLauncherProps {
  meetingId: string;
  password?: string;
  userName?: string;
  userEmail?: string;
  leaveUrl?: string;
}

const ZoomLauncher: React.FC<ZoomLauncherProps> = ({
  meetingId,
  password = '',
  userName = 'Student',
  userEmail = '',
  leaveUrl = '/dashboard'
}) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      // Redirect to login page if not authenticated
      navigate("/");
      return;
    }

    if (!meetingId) return;

    // Build the Zoom SDK URL with all parameters
    const params = new URLSearchParams({
      meetingId,
      token: authToken,
      ...(password && { password }),
      ...(userName && { userName }),
      ...(userEmail && { userEmail }),
      ...(leaveUrl && { leaveUrl })
    });

    const zoomSdkUrl = `https://zoom-sdk-new-kul5.vercel.app/?${params.toString()}`;

    // Redirect to the Zoom SDK
    window.location.href = zoomSdkUrl;
  }, [meetingId, password, userName, userEmail, leaveUrl, navigate]);

  useEffect(() => {
    const initializeZoom = async () => {
      try {
        // Your zoom initialization code here
        console.log("Initializing Zoom");
        // ...existing code...
      } catch (error) {
        console.error("Failed to initialize Zoom:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeZoom();
  }, [meetingId]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      {loading ? (
        <TailSpin height="80" width="80" color="#6F147B" ariaLabel="loading" />
      ) : (
        <div id="zoom-meeting-container"></div>
      )}
      <p className="mt-4 text-center text-xl font-semibold">
        Launching Zoom meeting...
      </p>
    </div>
  );
};

export default ZoomLauncher;
