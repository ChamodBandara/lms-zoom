import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';
import { defaultConfig } from '../../App/configs/common';

const TimeTable = ({ data }: { data: { image: string }[] }) => {
  const [currentImage, setCurrentImage] = useState<number | null>(null);

  const handleImageClick = (index: number) => {
    setCurrentImage(index);
  };

  const handleClosePopup = () => {
    setCurrentImage(null);
  };

  const handleNextImage = () => {
    if (currentImage !== null && currentImage < data.length - 1) {
      setCurrentImage(currentImage + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImage !== null && currentImage > 0) {
      setCurrentImage(currentImage - 1);
    }
  };

  return (
    <div className="mt-10 flex flex-col items-center">
      {data.length > 0 ? (
        data
          .reduce<{ image: string }[][]>((rows, item, index) => {
            if (index % 2 === 0) rows.push([]);
            rows[rows.length - 1].push(item);
            return rows;
          }, [])
          .map((row: { image: string }[], rowIndex: number) => (
            <div
              key={rowIndex}
              className="mb-4 flex w-full flex-wrap justify-center"
            >
              {row.map((item: { image: string }, colIndex: number) => (
                <div
                  key={colIndex}
                  className="mx-2 mb-2 w-full sm:w-auto sm:max-w-sm lg:max-w-md"
                >
                  <img
                    src={`${defaultConfig.BASE_ASSEST_URL}/${item.image}`}
                    className="w-full cursor-pointer object-contain"
                    onClick={() => handleImageClick(rowIndex * 2 + colIndex)}
                    alt={`Image ${rowIndex * 2 + colIndex + 1}`}
                  />
                </div>
              ))}
            </div>
          ))
      ) : (
        <div className="flex w-full items-center justify-center">
          <div className="h-96 w-full rounded-lg border border-gray-400 bg-white p-6 text-center shadow-lg">
            <div className="mt-16 flex justify-center">
              <img
                src="/images/Animation - 1739266164016.gif"
                alt=""
                className="w-40"
              />
            </div>
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              No Time Table Available
            </h2>
            <p className="text-gray-600"> Check back later!</p>
          </div>
        </div>
      )}

      {currentImage !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="relative h-auto w-11/12 max-w-4xl sm:h-full">
            <img
              src={`${defaultConfig.BASE_ASSEST_URL}/${data[currentImage].image}`}
              className="h-full w-full object-contain"
              alt={`Large Image ${currentImage + 1}`}
            />
            <button
              className="absolute right-2 top-2 rounded-full bg-gray-800 p-2 text-white"
              onClick={handleClosePopup}
            >
              <X color="#ffffff" />
            </button>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 transform rounded-full bg-gray-800 p-2 text-white"
              onClick={handlePrevImage}
              disabled={currentImage === 0}
            >
              <ChevronLeft color="#ffffff" />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 transform rounded-full bg-gray-800 p-2 text-white"
              onClick={handleNextImage}
              disabled={currentImage === data.length - 1}
            >
              <ChevronRight color="#ffffff" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTable;
