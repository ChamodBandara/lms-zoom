

function PaymentError() {
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-screen bg-white px-4">
     
      <img
        src="/images/404.png" 
        alt="Payment Error"
        className=" w-2/3 sm:w-1/2 md:w-1/3"
      />

      
      <h1 className="mb-4 text-3xl sm:text-4xl font-bold text-gray-800  text-center">
        Payment Failed
      </h1>

     
      <p className="px-2 text-sm sm:text-base text-gray-600  text-center">
        Your payment could not be processed. This could be due to insufficient funds, 
        network issues, or an incorrect payment method.
      </p>

     
      <p className=" mt-2 text-xs px-2 sm:text-base text-gray-500 mb-6 text-center">
        Please try again, or contact our support team if the issue persists.
      </p>

     
      <div className="mb-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <a
          href="/retry-payment"
          className="px-6 py-2 text-white bg-theme rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out text-center"
        >
          Retry Payment
        </a>
        <a
          href="/contact-support" 
          className="px-6 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition duration-300 ease-in-out text-center"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}

export default PaymentError;
