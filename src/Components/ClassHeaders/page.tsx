import React from 'react';
interface ClassHeaderProps {
  sub_text: string;
  main_text: string;
  icon: string;
}
const ClassHeader: React.FC<ClassHeaderProps> = ({
  sub_text,
  main_text,
  icon,
}) => {
  return (
    <div className="flex max-h-36 w-full flex-col items-center justify-center gap-4 bg-theme bg-opacity-30 p-5  rounded-lg shadow-[0_20px_50px_#70147c66] border border-white-50">
      <span className="text-xs font-light md:text-lg text-white">{sub_text}</span>
      <div className="flex flex-row items-center justify-center gap-1">
        <img
          src={icon}
          alt="class header icon"
          className="h-8 w-7 mr-2"
        />
        <span className="text-2xl font-semibold sm:text-2xl lg:text-2xl text-white">
          {main_text}
        </span>
      </div>
    </div>
  );
};

export default ClassHeader;
