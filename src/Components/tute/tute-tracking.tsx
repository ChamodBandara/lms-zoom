import { CircleCheckBig, Hourglass, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function TuteTrack() {
  const [isInstructionsExpanded, setInstructionsExpanded] = useState(false);
  const [isTuteDetailsExpanded, setTuteDetailsExpanded] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  // Toggle functions
  const toggleInstructions = () => {
    setInstructionsExpanded((prevState) => !prevState);
  };

  const toggleTuteDetails = () => {
    setTuteDetailsExpanded((prevState) => !prevState);
  };

  // Handle search button click
  const handleSearch = () => {
    console.log(`Tracking number: ${trackingNumber}`);
    // Add tracking logic here
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Handle confirm button click to show the popup
  const handleConfirmClick = () => {
    setConfirmationMessage(
      'You have confirmed that you have received the Tutes set.',
    );
    setShowConfirmPopup(true);
  };

  // Handle close popup
  const handleClosePopup = () => {
    setShowConfirmPopup(false);
    setConfirmationMessage('');
  };

  return (
    <div className="mt-3 bg-white min-h-screen p-4">
      <div
        className="mt-2 cursor-pointer bg-white p-4 shadow-lg"
        onClick={(e) => {
          const target = e.target as Element;
          if (
            target.closest('button') === null &&
            target.closest('input') === null
          ) {
            toggleInstructions();
          }
        }}
      >
        <div className="flex flex-col items-start">
          <div className="flex items-center">
            <img src="/images/icons/bank2.png" alt="" className="h-6 w-5" />
            <h2 className="ml-2 text-lg lg:text-2xl font-bold text-black">Instructions</h2>
          </div>
          <span className="mt-1 ml-7 text-black text-sm lg:text-base">
            Details regarding Tute Delivery are shown below.. !
          </span>
          <hr className="mt-2 text-gray-400" />
        </div>

        {isInstructionsExpanded && (
          <div className="mt-2 space-y-4">
            <div className="flex items-start rounded-md bg-green-100 p-4 shadow-md">
              <img
                src="/images/success.png"
                alt="Green Check Icon"
                className="h-6 w-6"
              />
              <div className="ml-4">
                <h3 className="text-sm font-bold text-black">
                  Click Completed:
                </h3>
                <p className="text-sm text-black">
                  Once you have received the <b>Tutes</b> set, click the confirm
                  button to confirm that you have received the tutorial set.
                </p>
                <button
                  onClick={handleConfirmClick}
                  className="mt-2 rounded-lg bg-theme px-4 py-2 text-xs text-white"
                >
                  Confirm
                </button>
              </div>
            </div>

            <div className="flex items-start rounded-md bg-yellow-100 p-4 shadow-md">
              <Phone color="#000000" />
              <div className="ml-4">
                <h3 className="text-sm font-bold text-black">Take A Call:</h3>
                <p className="text-sm text-black">
                  Instructions: You can obtain the phone number of the local
                  courier branch and call it to obtain information. Use this for
                  further details.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start rounded-md bg-orange-100 p-4 shadow-md">
              <div className="flex items-start">
                <img
                  src="/images/icons/share.png"
                  alt="Contact Icon"
                  className="h-6 w-6"
                />
                <div className="ml-4">
                  <h3 className="text-sm font-bold text-black">
                    Contact Them:
                  </h3>
                  <p className="text-sm text-black">
                    If you have any other questions, you can contact the courier
                    company at the number below.
                  </p>
                </div>
              </div>
              <p className="ml-10 mt-2 text-sm font-bold text-black">
                <a href="tel:0114422733" className="text-black">
                  Promptxpress Hotline: 0114422733
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      <div
        className="mt-2 cursor-pointer bg-white p-4 shadow-lg"
        onClick={(e) => {
          const target = e.target as Element;
          if (
            target.closest('button') === null &&
            target.closest('input') === null
          ) {
            toggleTuteDetails();
          }
        }}
      >
        <div className="flex flex-col items-start">
          <div className="flex items-center">
            <MapPin color="#ff0000" />
            <h2 className="ml-2 text-lg lg:text-2xl font-bold text-black">
              Track Your Tute
            </h2>
          </div>
          <span className="mt-1 ml-8 text-black text-sm lg:text-base">
            Details regarding payment shown below.!
          </span>
        </div>

        {isTuteDetailsExpanded && (
          <div className="mt-2 flex flex-col space-y-4">
            <div className="flex justify-center">
              <Link to="/maintenance">
                <button
                  type="button"
                  className="mb-2 mt-5 rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300"
                  onClick={stopPropagation}
                >
                  Track Your Package
                </button>
              </Link>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full max-w-lg rounded-lg border bg-white p-6 shadow">
                <h1 className="mb-4 text-lg font-semibold text-gray-800">
                  Track your Package
                </h1>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-xs text-gray-800 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    onClick={stopPropagation}
                  />
                  <button
                    onClick={handleSearch}
                    className="rounded-lg bg-red-600 px-4 py-2 text-xs text-white hover:bg-red-700 focus:outline-none focus:ring focus:ring-red-300"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            <div className="relative overflow-x-auto">
              <table className="dark:text-gray-400 mt-5 w-full text-left text-sm text-gray-500 rtl:text-right">
                <thead className="bg-gray-800 text-xs uppercase text-white">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Tute
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600 border-b bg-white hover:bg-gray-50">
                    <td className="px-4 py-4">Atomic Exam</td>
                    <td className="px-4 py-4">Ongoing</td>
                    <td className="px-4 py-4">2024-12-02</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center rounded bg-[#FFA43C] px-3 py-1 text-xs font-medium text-white">
                        Ongoing
                        <Hourglass color="#ffffff" size={12} className="ml-2" />
                      </span>
                    </td>
                  </tr>
                  <tr className="dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600 border-b bg-white hover:bg-gray-50">
                    <td className="px-4 py-4">Atomic Exam</td>
                    <td className="px-4 py-4">Delivered</td>
                    <td className="px-4 py-4">12.02.2024</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center rounded bg-green-500 px-6 py-1 text-xs font-medium text-white">
                        Paid
                        <CircleCheckBig
                          color="#ffffff"
                          size={12}
                          className="ml-2"
                        />
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showConfirmPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-xl font-bold">Confirmation</h3>
            <p className="mt-2 text-sm">{confirmationMessage}</p>
            <div className="mt-4 flex justify-between">
              <button
                onClick={handleClosePopup}
                className="rounded-lg bg-gray-500 px-4 py-2 text-xs text-white"
              >
                Close
              </button>
              <button
                onClick={handleClosePopup}
                className="rounded-lg bg-theme px-4 py-2 text-xs text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TuteTrack;
