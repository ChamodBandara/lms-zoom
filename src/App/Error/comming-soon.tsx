import { Link } from 'react-router-dom';

function ComingSoon() {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: 'url(/images/comming-soon.png)' }}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="px-6 text-center text-white md:px-12">
          <img
            src="/images/logo-w.png"
            alt="Company Logo"
            className="w-1/4 sm:w-1/6 mx-auto mb-8"  
          />
          <h1 className="animate-typewriter mb-4 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            Coming Soon
          </h1>
          <p className="mb-6 text-base sm:text-lg md:text-xl">
            We're working hard to bring Everest Online LMS to you. Stay
            tuned!
          </p>
          <Link to="/dashboard">
            <button className="rounded-lg bg-theme px-6 py-3 text-lg font-semibold text-white shadow-md hover:bg-theme">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ComingSoon;
