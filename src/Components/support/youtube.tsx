import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { defaultConfig } from '../../App/configs/common';

interface YoutubeProps {
  id: string;
  title: string;
  platform: string;
  link: string;
  thumbnail: string;
}

function Youtube() {
  const [links, setLinks] = useState<YoutubeProps[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api('/getlinks');
        const data = await response.data;
        const YoutubeLinks = data.links.filter(
          (link: YoutubeProps) => link.platform === 'youtube',
        );
        if (YoutubeLinks.length > 0) {
          setLinks(YoutubeLinks);
        } else {
        }
      } catch (error) {
        toast.error('Something went wrong. Please try again shortly');
      }
    };

    fetchData();
  }, []);
  const latestLink = links[0];
  console.log(links);
  return (
    <div className="mt-10 flex h-full flex-col items-center justify-center bg-white text-gray-800">
      <header className="w-full bg-red-600 p-4 text-center text-white shadow-md">
        <h1 className="text-2xl font-bold">YouTube</h1>
        <p className="text-sm">Explore YouTube Tips and Help</p>
      </header>

      <main className="mt-6 flex w-full flex-col items-center px-4">
        <h2 className="mb-4 text-lg font-semibold">
          Check Out Our Latest Video
        </h2>
        <div className="w-full max-w-2xl">
          {latestLink ? (
            <iframe
              className="aspect-video w-full rounded-lg shadow-md"
              src={latestLink.link}
              title={latestLink.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <p className="text-gray-500">No YouTube video available.</p>
          )}
        </div>
        {latestLink && (
          <button
            className="mt-6 flex items-center space-x-2 rounded-full bg-purple-600 px-6 py-3 text-sm text-white shadow-md hover:bg-purple-500"
            onClick={() => window.open(latestLink.link, '_blank')}
          >
            <img
              src={`${defaultConfig.BASE_ASSEST_URL}/${latestLink.thumbnail}`}
              alt="YouTube"
              className="h-6 w-6"
            />
            <span>Visit YouTube Channel</span>
          </button>
        )}
      </main>
    </div>
  );
}

export default Youtube;
