import { useEffect, useState } from 'react';
import api from '../../services/api';
import { TailSpin } from 'react-loader-spinner';

interface HelpDeskProps {
  id: string;
  title: string;
  link: string;
  description: string;
}

function HelpPage() {
  const [data, setData] = useState<HelpDeskProps[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/gethelpdesk');

        setData(res.data.posts);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4">
      {loading ? (
        <div className="flex h-screen items-center justify-center">
          <TailSpin height="40" width="40" color="#9b59b6" ariaLabel="loading" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-screen flex-col items-center justify-center text-center">
        <div className="mt-16 flex justify-center">
          <img src="/images/Animation - 1739266164016.gif" alt="" className="w-40" />
        </div>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          No help videos Available.
        </h2>
        <p className="text-gray-600">Check back later!</p>
      </div>
      
      ) : (

        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          

          {data.map((data: HelpDeskProps) => (
            <div
              key={data.id}
              className="rounded-lg flex h-full flex-col justify-between border border-theme bg-white p-6 shadow-xl"
            >
              <div>
                <h2 className="mb-2 text-lg font-semibold">{data.title}</h2>
              </div>
              {data.link.includes('youtube.com') || data.link.includes('youtu.be') ? (
                <iframe
                  width="560"
                  height="192"
                  src={data.link}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="mt-3 min-h-48 w-full rounded-lg"
                ></iframe>
              ) : (
                <video controls className="mt-3 min-h-48 w-full rounded-lg">
                  <source src={data.link} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HelpPage;
