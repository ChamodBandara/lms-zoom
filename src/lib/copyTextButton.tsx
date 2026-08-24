
import { toast } from 'react-toastify';

interface CopyTextButtonProps {
  classLink: string;
  isSheduleclassStatus: string;
  start_time: string;
}

export const CopyTextButton: React.FC<CopyTextButtonProps> = ({
  classLink,
  isSheduleclassStatus,
  start_time,
}) => {
  const copyToClipboard = () => {
    if (isSheduleclassStatus !== "active") {
      toast.error("Class link is not available");
      return;
    }

    if (classLink) {
      window.open(classLink, "_blank");
    } else {
      toast.error("Invalid class link");
    }
  };

  return (
    <div>
      {isSheduleclassStatus === 'active' ? (
        // ✅ Active button
        <button
          onClick={copyToClipboard}
          className="text-1xl mt-8 w-full rounded-lg bg-theme py-2 text-white hover:bg-purple-900"
        >
          Join Now
        </button>
      ) : (
        // 🔴 Pending button with additional text
        <button
          disabled
          className="mt-5 flex cursor-not-allowed items-center rounded-lg border border-gray-500 px-4 py-2 text-sm text-black"
        >
          ⏳ Class Pending - Starts Soon (
          {new Date(start_time).toLocaleString()})
        </button>
      )}
    </div>
  );
};
