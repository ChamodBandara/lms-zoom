import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Download,
  ExternalLink,
  BookOpen,
  CalendarDays,
} from 'lucide-react';
import api from '../../services/api';
import { defaultConfig } from '../../App/configs/common';
import { useParams } from 'react-router-dom';

interface TuteItem {
  id: string;
  name: string;
  acedemic_year: string;
  month: string;
  link: string;
  file: string;
}

type TuteList = TuteItem[];

function PackTutePage() {
  const monthNames = [
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

  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [data, setData] = useState<TuteList>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableMonths, setAvailableMonths] = useState<
    { value: string; name: string }[]
  >([]);
  const [year, setYear] = useState<number>();
  const [month, setMonth] = useState<number>();

  const now = new Date();
  const { id } = useParams();

  const fetchData = async () => {
    const response = await api.get('/getpacktutes', {
      params: {
        pack_id: id,
      },
    });
    setData(response.data.data);

    const years = Array.from(
      new Set<string>(
        response.data.data.map((item: TuteItem) => item.acedemic_year),
      ),
    );
    setAvailableYears(years);

    const currentYear = now.getFullYear().toString();
    const initialYear = years.includes(currentYear) ? currentYear : years[0];
    setSelectedYear(initialYear);

    setYear(now.getFullYear());
    setMonth(now.getMonth());
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedYear && data.length > 0) {
      const monthsInYear = data
        .filter((item) => item.acedemic_year === selectedYear)
        .map((item) => ({
          value: item.month,
          name: monthNames[parseInt(item.month) - 1] || item.month,
        }));

      const uniqueMonths = Array.from(
        new Map(monthsInYear.map((item) => [item.value, item])).values(),
      );
      setAvailableMonths(Array.from(uniqueMonths));

      const currentMonth = (now.getMonth() + 1).toString();
      const initialMonth = monthsInYear.find((m) => m.value === currentMonth)
        ? currentMonth
        : monthsInYear[0]?.value || '';
      setSelectedMonth(initialMonth);
    }
  }, [selectedYear, data]);

  const currentMonthData = data.filter(
    (item) =>
      item.acedemic_year === year?.toString() &&
      item.month === (month !== undefined ? (month + 1).toString() : ''),
  );

  const filteredData =
    selectedYear && selectedMonth
      ? data.filter(
          (item) =>
            item.acedemic_year === selectedYear && item.month === selectedMonth,
        )
      : [];

  return (
    <div className="ml-2 min-h-screen bg-white px-4 py-8">
      <div className="">
        {/* Back button */}
        <button
          className="mb-6 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>

        {/* Current month materials */}
        {currentMonthData.length > 0 ? (
          <div className="mb-12">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-800">
              <CalendarDays className="h-5 w-5 text-purple-600" />
              Current Month Materials
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {currentMonthData.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col rounded-lg border border-gray-200 bg-gray-50 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-center p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-theme text-white">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div className="flex-1 pl-4">
                      <h3 className="mb-2 max-w-52 truncate text-lg font-medium capitalize text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.acedemic_year} •{' '}
                        {monthNames[parseInt(item.month) - 1]}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-gray-200 p-4">
                    {item.file && (
                      <button
                        onClick={() => {
                          const fileUrl = `${defaultConfig.BASE_ASSEST_URL}/${item.file}`;
                          const link = document.createElement('a');
                          link.href = fileUrl;
                          link.download = item.file;
                          link.click();
                        }}
                        className="flex flex-1 items-center justify-center gap-2 rounded-md bg-theme px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    )}
                    {item.link && (
                      <button
                        onClick={() => {
                          window.open(item.link, '_blank');
                        }}
                        className="flex flex-1 items-center justify-center gap-2 rounded-md bg-theme px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Access Material
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-12 flex w-full flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-12">
            <div className="flex justify-center">
              <img
                src="/images/Animation - 1739266164016.gif"
                alt="No materials"
                className="w-40"
              />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-800">
              No Class Materials for the Current Month
            </h2>
          </div>
        )}

        {/* Browse materials section */}
        <div className="mb-12">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-800">
            <BookOpen className="h-5 w-5 text-purple-600" />
            Browse Materials
          </h2>

          {/* Filter controls */}
          <div className="flex flex-col items-center justify-center px-5">
            <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
              {/* Year filter */}
              <div className="mb-6 mt-4">
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
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
              </div>

              {/* Month filter */}
              <div className="mb-6 mt-4">
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                  {availableMonths.map((month) => (
                    <button
                      key={month.value}
                      onClick={() => setSelectedMonth(month.value)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        selectedMonth === month.value
                          ? 'bg-theme text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {month.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Filtered materials grid */}
          {selectedYear && selectedMonth ? (
            filteredData.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredData.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col rounded-lg border border-gray-200 bg-gray-50 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex items-center p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-theme text-white">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div className="flex-1 pl-4">
                        <h3 className="mb-2 max-w-52 truncate text-lg font-medium capitalize text-gray-900">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500">

                          {selectedYear} •{' '}
                          {monthNames[parseInt(selectedMonth) - 1]}

                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 border-t border-gray-200 p-4">
                      {item.file && (
                        <button
                          onClick={() => {
                            const fileUrl = `${defaultConfig.BASE_ASSEST_URL}/${item.file}`;
                            const link = document.createElement('a');
                            link.href = fileUrl;
                            link.download = item.file;
                            link.click();
                          }}
                          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-theme px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                      )}
                      {item.link && (
                        <button
                          onClick={() => {
                            window.open(item.link, '_blank');
                          }}
                          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-theme px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Access Material
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex w-full flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-12">
                <div className="flex justify-center">
                  <img
                    src="/images/Animation - 1739266164016.gif"
                    alt="No materials"
                    className="w-40"
                  />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-gray-800">
                  No materials found for the selected year and month.
                </h2>
              </div>
            )
          ) : (
            <div className="flex w-full flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-12">
              <div className="flex justify-center">
                <img
                  src="/images/Animation - 1739266164016.gif"
                  alt="No materials"
                  className="w-40"
                />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-800">
                Please select both year and month to view materials
              </h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PackTutePage;
