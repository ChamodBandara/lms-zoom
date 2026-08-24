import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { defaultConfig } from '../../App/configs/common';

interface SocialLinkProps {
  id: string;
  title: string;
  platform: string;
  link: string;
  thumbnail: string;
}

function SocialAll() {
  const [links, setLinks] = useState<SocialLinkProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api('/getlinks');
        const data = await response.data;
        if (data.links && data.links.length > 0) {
          setLinks(data.links);
        }
      } catch (error) {
        toast.error('Something went wrong. Please try again shortly');
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPlatformData = (platform: string) => {
    return links.filter(link => link.platform.toLowerCase() === platform.toLowerCase());
  };

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: (
        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'bg-blue-600 hover:bg-blue-700',
      defaultLink: 'https://facebook.com',
      defaultImage: 'https://source.unsplash.com/random/600x400/?facebook'
    },
    {
      name: 'Tiktok',
      icon: (
        <svg className="w-8 h-8 text-black dark:text-pink-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      ),
      bgColor: 'bg-black hover:bg-gray-800',
      defaultLink: 'https://tiktok.com',
      defaultImage: 'https://source.unsplash.com/random/600x400/?tiktok'
    },
    {
      name: 'Youtube',
      icon: (
        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'bg-red-600 hover:bg-red-700',
      defaultLink: 'https://youtube.com',
      defaultImage: 'https://source.unsplash.com/random/600x400/?youtube'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-5 xl:grid-cols-5 gap-6 p-8">
      {socialPlatforms.flatMap((platform) => {
        const platformData = getPlatformData(platform.name.toLowerCase());
        
        // If no data for this platform, return one card with default values
        if (platformData.length === 0) {
          return (
            <div key={platform.name} className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-transform hover:scale-[1.02]">
              <div className="relative lg:max-h-54 md:max-h-84">
                <img 
                  src={platform.defaultImage} 
                  alt={`${platform.name} Cover`} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute -bottom-6 left-4">
                  <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md border-2 border-white dark:border-gray-700">
                    {platform.icon}
                  </div>
                </div>
              </div>
              <div className="p-6 pt-8">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                  {platform.name}
                </h3>
                
                <a 
                  href={platform.defaultLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`w-full mt-5 lg:text-xs inline-flex justify-center items-center px-4 py-2 ${platform.bgColor} text-white font-medium rounded-lg transition-colors md:text-sm`}
                >
                  Visit {platform.name === 'Youtube' ? 'Channel' : platform.name === 'Facebook' ? 'Page' : 'Profile'}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          );
        }

        // Return one card for each link of this platform without index numbers
        return platformData.map((data, index) => (
          <div key={`${platform.name}-${index}`} className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-transform hover:scale-[1.02]">
            <div className="relative lg:max-h-54 md:max-h-84">
              <img 
                src={data.thumbnail ? `${defaultConfig.BASE_ASSEST_URL}/${data.thumbnail}` : platform.defaultImage} 
                alt={`${platform.name} Cover`} 
                className="w-full h-full object-cover"
              />
              <div className="absolute -bottom-6 left-4">
                <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md border-2 border-white dark:border-gray-700">
                  {platform.icon}
                </div>
              </div>
            </div>
            <div className="p-6 pt-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                {platform.name}
              </h3>
              
              <a 
                href={data.link || platform.defaultLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`w-full mt-5 lg:text-xs inline-flex justify-center items-center px-2 py-2 ${platform.bgColor} text-white font-medium rounded-lg transition-colors md:text-sm`}
              >
                Visit {platform.name === 'Youtube' ? 'Channel' : platform.name === 'Facebook' ? 'Page' : 'Profile'}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        ));
      })}
    </div>
  );
}

export default SocialAll;