// src/pages/ZoomMeetingPage.tsx or /app/zoom-meeting/page.tsx (if using App Router)

// import { useSearchParams } from 'react-router-dom'; // or 'next/navigation' for Next.js
// import React from 'react';

const ZoomMeetingPage1 = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const meetingId = searchParams.get('meetingId');
  const password = searchParams.get('password');
  const videoId = searchParams.get('videoId');
  const token = searchParams.get('token');

  const zoomUrl = videoId
    ? `https://zoom-sdk-new-kul5.vercel.app/?videoId=${videoId}&token=${token}`
    : `https://zoom-sdk-new-kul5.vercel.app/?meetingId=${meetingId}&password=${password}&token=${token}`;

  return (
    <div style={{ height: '100vh', width: '100vw', margin: 0, padding: 0 }}>
      <iframe
        src={zoomUrl}
        title="Zoom Meeting"
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="camera; microphone; fullscreen"
      />
    </div>
  );
};

export default ZoomMeetingPage1;
