import { Phone } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function BankdetailsForm() {
  const [isInstructionsExpanded, setIsInstructionsExpanded] = useState(false);
  const [isTuteDetailsExpanded, setIsTuteDetailsExpanded] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false); // State to manage popup visibility

  const toggleInstructions = () => {
    setIsInstructionsExpanded(!isInstructionsExpanded);
  };

  const toggleTuteDetails = () => {
    setIsTuteDetailsExpanded(!isTuteDetailsExpanded);
  };

  const showPopup = () => {
    setIsPopupVisible(true); // Show the popup
  };

  const closePopup = () => {
    setIsPopupVisible(false); // Close the popup
  };

  return (
    <div className="mt-3 grid h-screen w-full grid-rows-[1fr,1fr,2fr] gap-4 bg-white p-4">
      {/* Instructions Section */}
      <div
        className="mt-3 cursor-pointer rounded-lg bg-white p-4 shadow-custom"
        onClick={toggleInstructions}
      >
        <div className="flex flex-col items-start">
          <div className="flex items-center">
            <img src="/images/icons/bank2.png" alt="" className="h-6 w-6" />
            <h2 className="ml-2 text-xl font-bold text-black">
              Banking Instructions
            </h2>
          </div>
          <span className="mt-1 text-sm text-black">
            All the details regarding banking instructions are listed here. Make
            sure to follow them carefully for successful transactions.
          </span>
          <hr className="mt-2 text-gray-300" />
        </div>

        {isInstructionsExpanded && (
          <div className="mt-4">
            <div className="space-y-4">
              <div className="flex items-start rounded-md bg-green-100 p-4 shadow-md">
                <div className="flex-shrink-0">
                  <img
                    src="/images/success.png"
                    alt="Green Check Icon"
                    className="h-6 w-6"
                  />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-bold text-black">
                    Transaction Completed:
                  </h3>
                  <p className="text-sm text-black">
                    Once your bank transaction is successfully completed, click
                    the confirm button to verify that the transaction has been
                    processed.
                  </p>
                  <button
                    onClick={showPopup}
                    className="mt-2 rounded-md bg-theme px-4 py-2 text-xs text-white"
                  >
                    Confirm Transaction
                  </button>
                </div>
              </div>

              <div className="flex items-start rounded-md bg-yellow-100 p-4 shadow-md">
                <div className="flex-shrink-0">
                  <Phone className="h-6 w-6 text-black" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-bold text-black">
                    Contact Bank:
                  </h3>
                  <p className="text-sm text-black">
                    If you encounter any issues with your transaction, you can
                    contact your bank using the provided contact details below.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start rounded-md bg-orange-100 p-4 shadow-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <img
                      src="/images/icons/share.png"
                      alt="Contact Icon"
                      className="h-6 w-6"
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-bold text-black">
                      Contact Bank Support:
                    </h3>
                    <p className="text-sm text-black">
                      If you need further assistance, feel free to reach out to
                      the bank's customer support team at the number below.
                    </p>
                  </div>
                </div>
                <p className="ml-10 mt-2 text-sm font-bold text-black">
                  <Link to="tel:0114422733" className="text-black">
                    Bank Hotline: 0114422733
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Details Section */}
      <div
        className="cursor-pointer rounded-lg bg-white p-4 shadow-custom"
        onClick={toggleTuteDetails}
      >
        <div className="flex flex-col items-start">
          <div className="flex items-center">
            <img src="/images/icons/bank.png" alt="" className="h-4 w-6" />
            <h2 className="ml-2 text-xl font-bold text-black">
              Bank Account Details
            </h2>
          </div>
          <span className="mt-1 text-sm text-black">
            Details regarding payment and bank account information are shown
            below.
          </span>
        </div>

        {isTuteDetailsExpanded && (
          <div className="mt-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              <div className="w-full rounded-lg bg-white p-4 shadow-md">
                <h2 className="mb-2 text-lg font-semibold text-black">
                  Bank Account Information
                </h2>
                <img
                  src="/images/boc.png"
                  alt="BOC Logo"
                  className="mb-2 h-12"
                />
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Account Name:</span> AIB
                  Business Group (Private) Limited
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Account Number:</span> 9240 3275
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Account Type:</span> Current
                  Account
                </p>
              </div>

              <div className="w-full rounded-lg bg-white p-4 shadow-md">
                <h2 className="mb-2 text-lg font-semibold text-black">
                  Alternate Bank Account Information
                </h2>
                <img
                  src="/images/boc.png"
                  alt="BOC Logo"
                  className="mb-2 h-12"
                />
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Account Name:</span> AIB
                  Business Group (Private) Limited
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Account Number:</span> 9240 3275
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Account Type:</span> Current
                  Account
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Popup for Transaction Confirmation */}
      {isPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-xl font-bold text-black">
              Transaction Confirmed!
            </h3>
            <p className="mt-2 text-sm text-black">
              Your bank transaction has been successfully confirmed. Thank you
              for using our services.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={closePopup}
                className="rounded-md bg-theme px-4 py-2 text-xs text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BankdetailsForm;
