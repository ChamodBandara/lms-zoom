import { useParams } from 'react-router-dom';

export default function ViewPageIframe() {
  const { videoId, id } = useParams<{ videoId: any; id: string }>();

  // decode back the real video URL
  const decodedVideoUrl = decodeURIComponent(videoId);

function getEmbedUrl(url: string) {
  if (url.includes("youtu.be")) {
    // short link
    const videoId = url.split("/").pop()?.split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes("/live/")) {
    // live stream link
    const videoId = url.split("/").pop()?.split("?")[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }
  if (url.includes("watch?v=")) {
    // long link
    const videoId = new URL(url).searchParams.get("v");
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url; // already an embed or something else
}


  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <main className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
        <div className="mb-6">
          <button
            onClick={() => (window.location.href = `/singleclass/${id}`)}
            className="inline-flex items-center px-4 py-2 bg-white text-purple-700 rounded-lg shadow-sm hover:bg-purple-50 transition-all duration-300 border border-purple-100 font-medium"
          >
            Back to Class
          </button>
        </div>

        {/* Iframe player */}
        <div className="flex-1">
          <iframe
            src={getEmbedUrl(decodedVideoUrl)}
            title="EOE Live Video"
            allowFullScreen
            className="w-full h-[80vh] rounded-lg border border-purple-200 shadow-md"
          />
        </div>
      </main>
    </div>
  );
}
