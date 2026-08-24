
function ErrorPage() {
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-screen bg-white text-center">
      <img
        src="/images/404.png"
        alt="404 Error"
        className="mb-6 w-1/2 sm:w-1/3 md:w-1/4"
      />

      <h1 className=" text-3xl font-bold text-gray-800 mb-2">Oops! Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <a
        href="/dashboard"
        className="px-6 py-2 text-white bg-theme rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out"
      >
        Go Back to Home
      </a>
    </div>
  );
}

export default ErrorPage;
