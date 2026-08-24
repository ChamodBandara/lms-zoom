

function Maintenance() {
  return (
    <div className="p-2 flex flex-col items-center justify-center min-h-screen bg-white text-center">
      <img
        src="/images/maintenance.png"
        alt="Under Maintenance"
        className="mb-6 w-2/3 sm:w-1/2 md:w-1/3"
      />

      <h1 className="text-4xl  font-bold text-gray-800 mb-2">
        We're Under Maintenance
      </h1>

      <p className="text-lg text-gray-600 mb-6">
        Our website is currently undergoing scheduled maintenance. We'll be back shortly. Thank you for your patience!
      </p>

      <a
        href="/dashboard"
        className="px-6 py-2 mb-10 text-white bg-theme rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out"
      >
        Go Back to Home
      </a>
    </div>
  );
}

export default Maintenance;
