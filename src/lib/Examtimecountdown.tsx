// import React, { useState, useEffect } from 'react';

// interface CountdownProps {
//   examProgress: string;
//   duration: number;
// }

// const Examtimecountdown: React.FC<CountdownProps> = ({
//   examProgress,
//   duration,
// }) => {
//   const [timeLeft, setTimeLeft] = useState<string>('');

//   useEffect(() => {
//     const startTime = new Date(examProgress.replace(' ', 'T'));
//     const durationInMilliseconds = duration * 60 * 60 * 1000;
//     const endTime = new Date(startTime.getTime() + durationInMilliseconds);

//     const updateCountdown = () => {
//       const now = new Date();
//       const remainingTime = endTime.getTime() - now.getTime();

//       if (remainingTime <= 0) {
//         setTimeLeft('Exam has ended!');
//         return;
//       }

//       const hours = Math.floor(remainingTime / (1000 * 60 * 60));
//       const minutes = Math.floor(
//         (remainingTime % (1000 * 60 * 60)) / (1000 * 60),
//       );
//       const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

//       setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
//     };

//     const interval = setInterval(updateCountdown, 1000);

//     return () => clearInterval(interval);
//   }, [examProgress, duration]);

//   return <div>{timeLeft}</div>;
// };

// export default Examtimecountdown;
import React, { useState, useEffect } from 'react';

interface CountdownProps {
  examProgress: string;
  onComplete?: () => void;
}

const Examtimecountdown: React.FC<CountdownProps> = ({
  examProgress,
  onComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const dueTime = new Date(examProgress.replace(' ', 'T'));

    const updateCountdown = () => {
      const now = new Date();
      const remainingTime = dueTime.getTime() - now.getTime();

      if (remainingTime <= 0) {
        setTimeLeft('Exam has ended!');
        if (onComplete) {
          onComplete();
        }
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(remainingTime / (1000 * 60 * 60));
      const minutes = Math.floor(
        (remainingTime % (1000 * 60 * 60)) / (1000 * 60),
      );
      const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();
    return () => clearInterval(interval);
  }, [examProgress, onComplete]);

  return <div>{timeLeft}</div>;
};

export default Examtimecountdown;
