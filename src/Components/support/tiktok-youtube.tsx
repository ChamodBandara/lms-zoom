import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { defaultConfig } from '../../App/configs/common';

interface VideoProps {
  id: string;
  title: string;
  platform: string;
  link: string;
  thumbnail: string;
}

function SocialMedia() {
  const [videos, setVideos] = useState<{
    youtube: VideoProps | null;
    tiktok: VideoProps | null;
  }>({
    youtube: null,
    tiktok: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api('/getlinks');
        const data = response.data;

        setVideos({
          youtube:
            data.links.find(
              (link: VideoProps) => link.platform === 'youtube',
            ) || null,
          tiktok:
            data.links.find((link: VideoProps) => link.platform === 'tiktok') ||
            null,
        });
      } catch (error) {
        toast.error('Something went wrong. Please try again shortly.');
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex w-full flex-col lg:flex-row">
      {/* Social Media Sections */}
      {['youtube', 'tiktok'].map((platform) => {
        const video = videos[platform as keyof typeof videos];

        return (
          <div
            key={platform}
            className="flex w-full items-center justify-center px-4 sm:px-6 lg:w-1/2 p-5"
          >
            <div className="flex h-full w-full flex-col items-center justify-center bg-white text-gray-800 shadow-md p-5 border border-gray-400 rounded-lg">
              <header
                className={`w-full p-4 text-center text-white shadow-md ${
                  platform === 'youtube' ? 'bg-red-600' : 'bg-black'
                }`}
              >
                <h1 className="text-2xl font-bold">
                  {platform === 'youtube' ? 'YouTube' : 'TikTok'}
                </h1>
              </header>

              <main className="mt-6 flex w-full flex-col items-center">
                <h2 className="mb-4 text-center text-lg font-semibold">
                 
              
                </h2>
                {video ? (
                  <>
                    <div className="flex w-full max-w-xs justify-center sm:max-w-md">
                      <img
                        src={
                          `${defaultConfig.BASE_ASSEST_URL}/${video.thumbnail}` ||
                          '/images/image.png'
                        }
                        alt={`${platform} Video`}
                        className="rounded-lg h-80 object-cover"
                      />
                    </div>

                    <div className="flex items-center justify-center">
                      <button
                        className="mb-5 mt-6 flex w-full items-center space-x-2 rounded-full bg-theme px-6 py-3 text-sm text-white shadow-md hover:bg-purple-500 sm:w-auto"
                        onClick={() =>
                          video.link && window.open(video.link, '_blank')
                        }
                      >
                        <img
                          src={`/images/icons/icons8-${platform}-48.png`}
                          alt={platform}
                          className="h-6 w-6"
                        />
                        <span>
                          Visit{' '}
                          {platform === 'youtube'
                            ? 'YouTube Channel'
                            : 'TikTok Profile'}
                        </span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-16 mb-44 text-center flex flex-col items-center">
                  <img src="images/Animation - 1739266164016.gif" alt="No data" />
                  <p className="text-gray-600 text-sm">No data available</p>
                </div>
                )}
              </main>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SocialMedia;