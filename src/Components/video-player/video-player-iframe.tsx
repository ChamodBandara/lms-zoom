import { useParams } from 'react-router-dom';

export default function ViewPageIframe() {
  const { videoId, id } = useParams<{ videoId: string; id: string }>();
  const authToken = localStorage.getItem('authToken');

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <main className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
        <div className="mb-6">
          <button
            onClick={() => (window.location.href = `/singleclass/${id}`)}
            className="inline-flex items-center px-4 py-2 bg-white text-purple-700 rounded-lg shadow-sm hover:bg-purple-50 transition-all duration-300 border border-purple-100 font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 
                   010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 
                   1 0 110 2H5.414l4.293 4.293a1 1 0 
                   010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Class
          </button>
        </div>

        {/* Iframe player */}
        <div className="flex-1">
          <iframe
            src={`https://lve.eoe.lk/?videoId=${videoId}&token=${authToken}`}
            title="EOE Live Video"
            allowFullScreen
            className="w-full h-[80vh] rounded-lg border border-purple-200 shadow-md"
          />
        </div>
      </main>
    </div>
  );
}
