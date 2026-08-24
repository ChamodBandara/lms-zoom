import Headingbar from '../../Components/headingbar/headingbar';

function ComingClass() {
  return (
    <div className="flex min-h-screen flex-col p-2 sm:ml-64">
      <div className="flex flex-col gap-5">
        <Headingbar title="Everest online education" />
      </div>

      <div className="relative flex h-screen items-center justify-center bg-white bg-cover bg-center rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/images/rb_7616.png"
              alt="Company Logo"
              className="h-auto w-60 sm:w-60 md:w-72 lg:w-72"
            />
          </div>

          <h1 className="animate-typewriter mb-4 text-2xl font-bold leading-tight text-black sm:text-3xl md:text-4xl">
            Coming Soon
          </h1>
          <p className="mb-10 text-base text-black sm:text-lg md:text-xl">
            We're working hard to bring Everest Online LMS to you. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  );
}

export default ComingClass;
