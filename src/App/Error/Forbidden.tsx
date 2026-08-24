

function ForbiddenPage() {
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-screen bg-white text-center">
      <img
        src="/images/forbidden.png"
        alt="403 Forbidden"
        className="mb-6 w-1/2 sm:w-1/3 md:w-1/4"
      />

      <h1 className="text-4xl font-bold text-gray-800 mb-2">Access Denied</h1>

      <p className="text-lg text-gray-600 mb-6">
        You don't have permission to access this page.
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

export default ForbiddenPage;
