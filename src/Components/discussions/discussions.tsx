import { useEffect, useState } from 'react';
import { Play, Download } from 'lucide-react';
import { TailSpin } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { defaultConfig } from '../../App/configs/common';
import { useParams } from 'react-router-dom';

interface ApiVideo {
  id: number;
  week: string | null;
  type_id: number;
  name: string;
  link_type: 'free' | 'paid' | string;
  video_id: string | null;
  video_player_type: number;
  thumbnail: string | null;
  video_platform: string | null;
  tute: string | null;
  tute_link: string | null;
  type: 'video' | 'video_player' | 'zoom' | string;
}

interface ApiGroup {
  id: number;
  class_id: number;
  name: string;
  status: number;
  year: string;
  month: string;
  class_videos: ApiVideo[];
}

interface TransformedVideo extends ApiVideo {
  groupName: string;
  yearString: string;
  monthString: string;
  week: string; // normalized
}

interface MonthFilterItem {
  value: string;
  name: string;
  hasData: boolean;
  linkTypes: string[];
}

const monthOrder = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// ---- helper to detect mobile ----
const isMobileDevice = () => {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};

const APP_LINKS = {
  desktopOpen: 'everestapp://singleclass',
  mobileOpen: 'eoe://login',
  desktopDownload: '/dashboard',
  mobileDownload: '/dashboard',
};

function TuteDiscussions() {
  const [loading, setLoading] = useState(false);

  const [transformedVideos, setTransformedVideos] = useState<TransformedVideo[]>(
    [],
  );
  const { id } = useParams();
  const [, setAvailableYears] = useState<string[]>([]);
  const [availableMonths, setAvailableMonths] = useState<MonthFilterItem[]>([]);
  const [availableNames, setAvailableNames] = useState<string[]>([]);
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);

  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedName, setSelectedName] = useState<string>('All');
  const [selectedWeek, setSelectedWeek] = useState<string>('All');
  const authToken = localStorage.getItem('authToken');
  const [filteredVideos, setFilteredVideos] = useState<TransformedVideo[]>([]);
  const [showPopup, setShowPopup] = useState(false);

  // ------------- API CALL -------------
  const fetchDiscussions = async () => {
    try {
      setLoading(true);

      // If your backend expects POST, change this to api.post('/gettutediscussions')
      const res = await api.get('/gettutediscussions');
      console.log('gettutediscussions =>', res.data);

      const groups: ApiGroup[] = res.data?.class_links_type ?? [];

      const flat: TransformedVideo[] = groups.flatMap((group) =>
        (group.class_videos || []).map((v) => ({
          ...v,
          groupName: group.name,
          yearString: group.year,
          monthString: group.month,
          week: v.week ?? '',
        })),
      );

      setTransformedVideos(flat);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load tute discussions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

  // ------------- FILTER LOGIC -------------
  useEffect(() => {
    if (!transformedVideos.length) {
      setAvailableYears([]);
      setAvailableMonths([]);
      setAvailableNames([]);
      setAvailableWeeks([]);
      setFilteredVideos([]);
      return;
    }

    // 1. Years
    const allYears = Array.from(
      new Set(transformedVideos.map((v) => v.yearString)),
    ).sort((a, b) => parseInt(b) - parseInt(a));

    const yearsWithAll = ['All', ...allYears];
    setAvailableYears(yearsWithAll);

    // Ensure current selected year is valid
    if (selectedYear !== 'All' && !allYears.includes(selectedYear)) {
      setSelectedYear('All');
    }

    // 2. Filter by year
    const linksForYear =
      selectedYear === 'All'
        ? transformedVideos
        : transformedVideos.filter((v) => v.yearString === selectedYear);

    // 3. Months (only based on year-filtered data)
    const monthStats = new Map<
      string,
      {
        hasData: boolean;
        linkTypes: Set<string>;
      }
    >();

    linksForYear.forEach((v) => {
      const current = monthStats.get(v.monthString) || {
        hasData: false,
        linkTypes: new Set<string>(),
      };

      monthStats.set(v.monthString, {
        hasData: true,
        linkTypes: current.linkTypes.add(v.link_type || ''),
      });
    });

    const updatedMonths: MonthFilterItem[] = monthOrder.map((name) => {
      const stat = monthStats.get(name) || {
        hasData: false,
        linkTypes: new Set<string>(),
      };
      return {
        value: name,
        name,
        hasData: stat.hasData,
        linkTypes: Array.from(stat.linkTypes),
      };
    });

    const monthsWithAll: MonthFilterItem[] = [
      {
        value: 'All',
        name: 'All',
        hasData: true,
        linkTypes: [],
      },
      ...updatedMonths,
    ];
    setAvailableMonths(monthsWithAll);

    const availableMonthValues = updatedMonths.map((m) => m.value);
    if (selectedMonth !== 'All' && !availableMonthValues.includes(selectedMonth)) {
      setSelectedMonth('All');
    }

    // 4. Filter by month
    const linksForMonth =
      selectedMonth === 'All'
        ? linksForYear
        : linksForYear.filter((v) => v.monthString === selectedMonth);

    // 5. Names
    const nameSet = Array.from(new Set(linksForMonth.map((v) => v.groupName)));
    const namesWithAll = ['All', ...nameSet];
    setAvailableNames(namesWithAll);

    if (selectedName !== 'All' && !nameSet.includes(selectedName)) {
      setSelectedName('All');
    }

    const linksForName =
      selectedName === 'All'
        ? linksForMonth
        : linksForMonth.filter((v) => v.groupName === selectedName);

    // 6. Weeks
    const rawWeeks = linksForName
      .map((v) => v.week)
      .filter((w) => w && w !== '' && w !== 'All');

    const uniqueWeeks = Array.from(new Set(rawWeeks)).sort((a, b) => {
      const na = Number(a);
      const nb = Number(b);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
      return String(a).localeCompare(String(b));
    });

    const weeksWithAll = ['All', ...uniqueWeeks];
    setAvailableWeeks(weeksWithAll);

    if (selectedWeek !== 'All' && !uniqueWeeks.includes(selectedWeek)) {
      setSelectedWeek('All');
    }

    // 7. Final filter
    const finalFiltered = transformedVideos.filter((v) => {
      const yearMatch = selectedYear === 'All' || v.yearString === selectedYear;
      const monthMatch =
        selectedMonth === 'All' || v.monthString === selectedMonth;
      const nameMatch =
        selectedName === 'All' || v.groupName === selectedName;
      const weekMatch = selectedWeek === 'All' || v.week === selectedWeek;
      return yearMatch && monthMatch && nameMatch && weekMatch;
    });

    setFilteredVideos(finalFiltered);
  }, [
    transformedVideos,
    selectedYear,
    selectedMonth,
    selectedName,
    selectedWeek,
  ]);

  // ------------- RENDER -------------
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <TailSpin height="40" width="40" color="#9b59b6" ariaLabel="loading" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center p-4">
      {/* Year & Month Filters */}
      <div className="mb-6 mt-4 flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
        {/* Years */}
        {/* <div className="mb-6 mt-4">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {availableYears.length > 0 &&
              availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => {
                    setSelectedYear(year);
                    setSelectedMonth('All');
                    setSelectedName('All');
                    setSelectedWeek('All');
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedYear === year
                      ? 'bg-theme text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {year}
                </button>
              ))}
          </div>
        </div> */}

        {/* Months */}
        <div className="mb-5 flex flex-col">
          {availableMonths.length > 0 && selectedYear !== 'All' && (
            <div className="mb-6 mt-2 flex flex-wrap justify-center gap-1 sm:gap-2">
              {availableMonths.map((month) => (
                <button
                  key={month.value}
                  onClick={() => setSelectedMonth(month.value)}
                  disabled={!month.hasData && month.value !== 'All'}
                  className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                    selectedMonth === month.value
                      ? 'bg-theme text-white'
                      : month.value === 'All'
                      ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      : month.hasData
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'cursor-not-allowed bg-gray-100 text-gray-400'
                  }`}
                >
                  {month.value === 'All' ? 'All' : month.name.slice(0, 3)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Name Filter */}
      <div className="mb-6 flex w-full justify-center">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          {availableNames.map((name) => (
            <button
              key={name}
              onClick={() => setSelectedName(name)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedName === name
                  ? 'bg-theme text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Week Filter */}
      <div className="mb-6 flex w-full justify-center">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          {availableWeeks.map((week) => (
            <button
              key={week}
              onClick={() => setSelectedWeek(week)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedWeek === week
                  ? 'bg-theme text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {week === 'All' ? 'All Weeks' : `Week ${week}`}
            </button>
          ))}
        </div>
      </div>

      {/* Everest Player Popup */}
      {showPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '400px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowPopup(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
              }}
            >
              ✖
            </button>

            <h2
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '10px',
              }}
            >
              Everest Player Required
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: '#555',
                marginBottom: '20px',
              }}
            >
              This video can only be watched using{' '}
              <strong>Everest Player</strong>. Please use the Everest Player app
              or platform to access this content.
            </p>

            <div style={{ marginBottom: '16px' }}>
              {isMobileDevice() ? (
                <a href={APP_LINKS.mobileOpen}>
                  <button
                    style={{
                      borderRadius: '6px',
                      backgroundColor: '#6F147B',
                      padding: '10px 16px',
                      color: '#fff',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      marginRight: '10px',
                      border: 'none',
                    }}
                  >
                    Open in Mobile App
                  </button>
                </a>
              ) : (
                <a href={APP_LINKS.desktopOpen}>
                  <button
                    style={{
                      borderRadius: '6px',
                      backgroundColor: '#6F147B',
                      padding: '10px 16px',
                      color: '#fff',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      marginRight: '10px',
                      border: 'none',
                    }}
                  >
                    Open in Desktop App
                  </button>
                </a>
              )}
            </div>

            <p style={{ fontSize: '13px', color: '#444' }}>
              Don’t have the app installed?{' '}
              <a
                href={
                  isMobileDevice()
                    ? APP_LINKS.mobileDownload
                    : APP_LINKS.desktopDownload
                }
                style={{
                  color: '#6F147B',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                }}
              >
                Download here
              </a>
              .
            </p>
          </div>
        </div>
      )}

      {/* Videos List */}
      <div className="mt-4 w-full px-4">
        {filteredVideos.length > 0 ? (
          <div className="custom-scrollbar relative">
            <div className="flex flex-col gap-6">
              {Object.entries(
                filteredVideos.reduce(
                  (acc, video) => {
                    acc[video.groupName] = acc[video.groupName] || [];
                    acc[video.groupName].push(video);
                    return acc;
                  },
                  {} as Record<string, TransformedVideo[]>,
                ),
              ).map(([groupName, groupVideos]) => (
                <div key={groupName}>
                  <h3 className="mb-4 text-lg font-bold capitalize text-gray-800">
                    {groupName}
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                    {groupVideos.map((video) => (
                      <div
                        key={video.id}
                        className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-shadow duration-300 hover:shadow-lg"
                      >
                        <div className="relative">
                          {/* If you want thumbnail: uncomment */}
                          {/* {video.thumbnail && (
                            <img
                              src={`${defaultConfig.BASE_ASSEST_URL}/${video.thumbnail}`}
                              alt="Video Thumbnail"
                              className="h-auto w-full object-cover"
                            />
                          )} */}
                        </div>

                        <div className="p-4 text-center">
                          <h2 className="mb-3 overflow-hidden text-ellipsis whitespace-nowrap text-lg font-semibold text-gray-800">
                            {video.name}
                          </h2>

                          {video.video_id || video.type === 'zoom' ? (
                            <button
                              className={`flex w-full items-center justify-center rounded-md py-2 text-white transition-colors ${
                                video.link_type === 'free'
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : 'bg-gray-400 cursor-not-allowed'
                              }`}
                              onClick={() => {
                                if (video.link_type !== 'free') return;

                                if (video.type === 'video') {
                                  const url = video.video_id || '';
                                  if (url) window.open(url, '_blank');
                                } else if (
                                  video.type === 'video_player' 
                                ) 
                                {
                                  window.location.href = `/video-playerTuteDiscussionsv2/${video.video_id}/${video.id}/${id}`
                                }else if (
                              
                                  video.type === 'zoom'
                                ) 
                                {
                                  window.open(
                                      `https://lve.eoe.lk/?videoId=${video.id}&token=${authToken}`,
                                      'myVideoTab',
                                    );
                                }
                              }}
                            >
                              <Play className="mr-2" size={18} />
                              {video.link_type === 'free'
                                ? 'Watch'
                                : 'Paid Content'}
                            </button>
                          ) : (
                            <button
                              className={`flex w-full items-center justify-center rounded-md py-2 text-white transition-colors ${
                                video.link_type === 'free'
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : 'bg-gray-400 cursor-not-allowed'
                              }`}
                              onClick={() => {
                                if (video.link_type !== 'free') return;

                                if (video.tute) {
                                  const link = document.createElement('a');
                                  link.href = `${defaultConfig.BASE_ASSEST_URL}/${video.tute}`;
                                  link.setAttribute('download', '');
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                } else if (video.tute_link) {
                                  window.open(video.tute_link, '_blank');
                                }
                              }}
                            >
                              <Download className="mr-2" size={18} />
                              {video.link_type === 'free'
                                ? video.tute || video.tute_link
                                  ? 'Download'
                                  : 'Document Not Available'
                                : 'Paid Content'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 flex h-fit w-full flex-col items-center justify-center rounded-lg bg-white p-6 text-center">
            <img
              src="/images/Animation - 1739266164016.gif"
              alt="No Videos"
              className="w-40"
            />
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              No Tute Discussions Available
            </h2>
            <p className="text-gray-600">
              {selectedYear !== 'All' || selectedMonth !== 'All'
                ? 'No discussions match your selected filters.'
                : 'There are no tute discussions available at the moment. Stay tuned!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TuteDiscussions;
