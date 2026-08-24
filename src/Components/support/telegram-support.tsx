import api from '../../services/api';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { defaultConfig } from '../../App/configs/common';

interface TelegramLinkProps {
  id: string;
  title: string;
  platform: string;
  link: string;
  thumbnail: string;
  year?: string;
}

function TelegramDetails() {
  const [links, setLinks] = useState<TelegramLinkProps[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<TelegramLinkProps[]>([]);
  const [yearOptions, setYearOptions] = useState<string[]>(['All']);
  const [selectedYear, setSelectedYear] = useState<string>('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api('/getlinks');
        const data = await response.data;

        const telegramLinks = data.links.filter(
          (link: TelegramLinkProps) => link.platform === 'telegram'
        );

        if (telegramLinks.length > 0) {
          setLinks(telegramLinks);
          setFilteredLinks(telegramLinks);

        const years = Array.from(
          new Set(
            telegramLinks
              .map((link: { year: any; }) => link.year)
              .filter((y: any): y is string => typeof y === 'string')
          ) as Set<string>
        ).sort((a, b) => Number(b) - Number(a));

        setYearOptions(['All', ...years]);


        } else {
          console.log('No Telegram links found');
        }
      } catch (error) {
        toast.error('Something went wrong. Please try again shortly');
        console.log(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedYear === 'All') {
      setFilteredLinks(links);
    } else {
      setFilteredLinks(links.filter(link => link.year === selectedYear));
    }
  }, [selectedYear, links]);

  const handleCardClick = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg">
      <div className="w-full bg-theme p-4 text-white shadow-md">
        <div className="flex items-center justify-center space-x-2">
          <h1 className="text-xl sm:text-2xl font-bold">Telegram</h1>
          <img src="/images/icons/icons8-telegram-48.png" alt="Telegram icon" className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
      </div>

      {/* Year selector */}
      <div className="mt-4 mb-6">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          {yearOptions.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedYear === year
                  ? 'bg-theme text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {filteredLinks.length > 0 ? (
        <div className="mt-5">
          {/* Mobile view */}
          <div className="sm:hidden grid grid-cols-1 gap-3">
            {filteredLinks.map((link) => (
              <div 
                key={link.id} 
                className="bg-gray-50 rounded-md p-3 shadow-sm flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200"
                onClick={() => handleCardClick(link.link)}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                  <img
                    src={`${defaultConfig.BASE_ASSEST_URL}/${link.thumbnail}`}
                    alt={link.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/path/to/fallback/image.jpg';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{link.title}</p>
                  <div className="text-xs text-theme font-medium">Join</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tablet view - 2 columns */}
          <div className="hidden sm:grid sm:grid-cols-2 md:hidden gap-4">
            {[0, 1].map((colIndex) => (
              <div key={colIndex} className="w-full">
                <div className="grid grid-cols-1 gap-3">
                  {filteredLinks
                    .filter((_, index) => index % 2 === colIndex)
                    .map((link) => (
                      <div 
                        key={link.id} 
                        className="bg-gray-50 rounded-md p-3 shadow-sm flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200"
                        onClick={() => handleCardClick(link.link)}
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-gray-200">
                          <img
                            src={`${defaultConfig.BASE_ASSEST_URL}/${link.thumbnail}`}
                            alt={link.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/path/to/fallback/image.jpg';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{link.title}</p>
                          <div className="text-xs text-theme font-medium">Join</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop view - 3 columns */}
          <div className="hidden md:flex space-x-4">
            {[0, 1, 2].map((colIndex) => (
              <div key={colIndex} className="w-1/3">
                <div className="grid grid-cols-1 gap-2">
                  {filteredLinks
                    .filter((_, index) => index % 3 === colIndex)
                    .map((link) => (
                      <div 
                        key={link.id} 
                        className="bg-gray-50 rounded-md p-3 shadow-sm flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200"
                        onClick={() => handleCardClick(link.link)}
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                          <img
                            src={`${defaultConfig.BASE_ASSEST_URL}/${link.thumbnail}`}
                            alt={link.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/path/to/fallback/image.jpg';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{link.title}</p>
                          <div className="text-xs text-theme font-medium">Join</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-600">No Telegram links available for {selectedYear}</p>
        </div>
      )}
    </div>
  );
}

export default TelegramDetails;
