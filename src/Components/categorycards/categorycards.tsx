import React from 'react';

interface CategorycardsProps {
  image: string;
  alt: string;
  heading: string;
}

const Categorycards: React.FC<CategorycardsProps> = ({
  image,
  alt,
  heading,
}) => {
  return (
    <div className="flex w-full min-h-[200px] max-w-80 flex-col items-center justify-center gap-4 rounded-2xl bg-white p-4 shadow-md md:max-h-[200px] lg:max-h-[400px] sm:p-6 md:p-8 lg:p-10">
      <img
        src={image}
        alt={alt}
        className="h-14 w-16 sm:h-20 sm:w-24 md:h-24 md:w-24 lg:h-28 lg:w-28"
      />
      <span className="text-center text-lg font-light text-[#000000C2] sm:text-xl md:text-xl lg:text-2xl">
        {heading}
      </span>
    </div>
  );
};

export default Categorycards;
