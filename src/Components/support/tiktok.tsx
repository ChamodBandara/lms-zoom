

function TiktokSupport() {
  return (
    <div className="mt-10 mb-5 flex h-full flex-col items-center justify-center bg-white text-gray-800 px-4 sm:px-6 md:px-8">
      <header className="w-full bg-black p-4 text-center text-white shadow-md">
        <h1 className="text-2xl font-bold">TikTok Support</h1>
        <p className="text-sm">Explore TikTok Tips and Help</p>
      </header>
      <main className="mt-6 flex w-full flex-col items-center px-4">
        <h2 className="mb-4 text-lg font-semibold text-center">
          Check Out Our Latest TikTok Video
        </h2>
        <div className="w-full max-w-full hidden md:block"> 
          <iframe
            className="aspect-video w-full rounded-lg"
            src="https://www.tiktok.com/embed/7371829149352217874"
            title="TikTok Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <button
          className="mt-6 flex items-center justify-center rounded-full bg-theme px-6 py-3 text-sm text-white shadow-md hover:bg-purple-500 w-full sm:w-auto text-center" // text-center for mobile view
          onClick={() =>
            window.open(
              'https://www.tiktok.com/@ujithhemachandraofficial',
              '_blank',
            )
          }
        >
          <img
            src="/images/icons/icons8-tiktok-48.png"
            alt="TikTok"
            className="mr-2 h-6 w-6"
          />
          Visit TikTok Profile
        </button>
      </main>
    </div>
  );
}

export default TiktokSupport;
