import React, { useEffect, useState } from 'react';

interface CountdownProps {
  targetDate: string; // Accepts targetDate as a string
  onComplete: () => void;
  format?: string;
}

const Countdown: React.FC<CountdownProps> = ({
  targetDate,
  onComplete,
  format = 'dd:hh:mm:ss',
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(
    calculateTimeLeft(targetDate),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft(targetDate);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  // Convert the targetDate string to a Date object
  function calculateTimeLeft(target: string): number {
    const targetDate = new Date(target);
    return Math.max(0, targetDate.getTime() - new Date().getTime());
  }

  function formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (format === 'hh:mm:ss') {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    } else if (format === 'dd:hh:mm:ss') {
      return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    } else if (format === 'd h m s') {
      // return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
      return `${days} Day${days !== 1 ? 's' : ''} ${hours} : ${minutes} : ${seconds} `;
    }
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  function pad(value: number): string {
    return value.toString().padStart(2, '0');
  }

  return (
    <div>
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
};

export default Countdown;
