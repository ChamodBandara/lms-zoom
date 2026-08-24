import React from 'react';
import SmallIcon, { SmallIconType } from '../ClassLabels/page';
import { useNavigate } from 'react-router-dom';

export enum ButtonType {
  LIVE = 'live',
  PURCHASE = 'purchase',
  BUY = 'buy',
  PAST = 'past',
  STUDY = 'study',
}

interface CourseCardProps {
  id: string;
  sub_id: string;
  class_avatar: string;
  name: string;
  description: string;
  teacher: string;
  avatar: string;
  category: string;
  price: number;
  buttonType?: ButtonType;
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  sub_id,
  class_avatar,
  name,
  // description,
  category,
  teacher,
  avatar,
  buttonType = ButtonType.LIVE,
}) => {
  // // Function to strip HTML tags from "about" field
  // const stripHtmlTags = (html: string | undefined) => {
  //   return html ? html.replace(/<\/?[^>]+(>|$)/g, '') : '';
  // };

  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate(`/single-pack/${id}`);
  };

  const handleRedirectSub = () => {
    navigate(`/single-pack/${sub_id}`);
  };

  // const buttonStyles = {
  //   [ButtonType.LIVE]:
  //     'w-full rounded bg-red-500 p-2 text-sm font-semibold text-white transition-all hover:bg-red-600',
  //   [ButtonType.PURCHASE]:
  //     'w-full rounded bg-[#343434] p-2 text-sm font-semibold text-white transition-all hover:bg-[#444444]',
  //   [ButtonType.BUY]:
  //     'w-full rounded bg-[#CD2609] p-2 text-sm font-semibold text-white transition-all hover:bg-[#E53935]',
  //   [ButtonType.PAST]:
  //     'w-full rounded bg-[#343434] p-2 text-sm font-semibold text-white transition-all hover:bg-[#444444]',
  //   [ButtonType.STUDY]:
  //     'w-full rounded bg-green-500 p-2 text-sm font-semibold text-white transition-all hover:bg-green-700',
  // };

  // const buttonText = {
  //   [ButtonType.LIVE]: 'Join Now',
  //   [ButtonType.PURCHASE]: 'Attend',
  //   [ButtonType.BUY]: 'Buy',
  //   [ButtonType.PAST]: 'Attend',
  //   [ButtonType.STUDY]: 'Pending',
  // };

  const images: Record<ButtonType, JSX.Element> = {
    [ButtonType.LIVE]: (
      <>
        <div className="absolute ml-4 mt-4">
          <SmallIcon type={SmallIconType.PAID} />
        </div>
        <div className="absolute right-8 mt-4">
          <SmallIcon type={SmallIconType.LIVE} />
        </div>
      </>
    ),
    [ButtonType.PURCHASE]: (
      <>
        <div className="absolute ml-4 mt-4">
          <SmallIcon type={SmallIconType.PAID} />
        </div>
        <div className="absolute right-6 mt-4">
          <SmallIcon type={SmallIconType.STUDYPACK} />
        </div>
      </>
    ),
    [ButtonType.BUY]: (
      <img
      // src="/images/buy_icon.png"
      // alt="Buy Icon"
      // className="absolute ml-4 mt-4 h-7 w-14"
      />
    ),
    [ButtonType.PAST]: (
      <>
        <div className="absolute ml-2 mt-4">
          <SmallIcon type={SmallIconType.NOTPAID} />
        </div>
        <div className="absolute right-6 mt-4 text-xs">
          {/* <SmallIcon type={SmallIconType.PASTLESSON} /> */}
        </div>
      </>
    ),
    [ButtonType.STUDY]: (
      <>
        <div className="absolute ml-2 mt-4">
          <SmallIcon type={SmallIconType.NOTPAID} />
        </div>
        <div className="absolute right-6 mt-4">
          <SmallIcon type={SmallIconType.STUDYPACK} />
        </div>
      </>
    ),
  };

  // Handle the form submission

  return (
    <div className="relative flex h-full w-full max-w-sm flex-col rounded-lg bg-[#F8F8F8] p-4 shadow-md">
      {images[buttonType]}

      <img
        src={class_avatar}
        alt="Class Avatar"
        className="h-auto w-full object-cover lg:h-52 2xl:h-auto"
      />

      <div className="mt-4 flex flex-1 flex-col justify-between">
        <div>
          <span className="block max-h-12 min-h-12 text-lg font-semibold md:text-xl">
            {name}
          </span>
          {/* <span className="mb-2 mt-4 line-clamp-2 block text-sm font-light md:text-xs min-h-14 max-h-14">
            {description && stripHtmlTags(description).length > 100
              ? `${stripHtmlTags(description).substring(0, 100)}...`
              : stripHtmlTags(description)}
          </span> */}
          {/* {[ButtonType.BUY, ButtonType.STUDY, ButtonType.PAST].includes(
            buttonType,
          ) && (
            <span className="mb-2 mt-2 font-semibold text-[#F90909] min-h-6 max-h-6 ">
              Price: Rs {price}
            </span>
          )} */}
        </div>

        <div className="mb-2 mt-2 flex max-h-4 min-h-4 flex-row">
          <div className="flex flex-row items-center gap-1">
            <img
              src="/images/book_mark.png"
              alt="bookmark"
              className="h-4 w-4"
            />
            <span className="text-[9px] font-light text-[#363636]">Tutes</span>
          </div>
          <div className="ml-4 flex flex-row items-center gap-1">
            <img
              src="/images/recordings.png"
              alt="recordings"
              className="h-4 w-4"
            />
            <span className="text-[9px] font-light text-[#363636]">
              Recordings
            </span>
          </div>
          <div className="ml-4 flex flex-row items-center gap-1">
            <img
              src="/images/book_icon.png"
              alt="book icon"
              className="h-4 w-4"
            />
            <span className="text-[9px] font-light text-[#363636]">
              Lessons
            </span>
          </div>
        </div>

        <div className="mb-2 mt-2 flex items-center gap-6">
          <div className="flex flex-row gap-2">
            <img
              src={avatar}
              alt="Class Teacher Avatar"
              className="h-6 w-6 rounded-full object-cover"
            />
            <span className="mb-2 max-h-6 min-h-6 text-xs font-medium capitalize text-gray-500 md:text-xs">
              By <br />
              {teacher}
            </span>
          </div>
          <div>
            <span className="mb-2 max-h-6 min-h-6 text-xs font-medium capitalize text-gray-500 md:text-xs">
              {category}
            </span>
          </div>
        </div>
        {/* <button
          className={buttonStyles[buttonType]}
          onClick={handleRedirect} // Redirect on click
        >
          {buttonText[buttonType]}
        </button> */}
        <div className="mb-2 flex w-full justify-between gap-2 mt-2">
          <button
            className="w-1/2 rounded bg-green-500 p-2 text-sm font-semibold text-white transition-all hover:bg-green-700"
            // onClick={() => navigate(`/theory/${id}`)}
                onClick={handleRedirect}
          >
            Theory
          </button>

          {sub_id !== null && (
              <button
                className="w-1/2 rounded bg-blue-500 p-2 text-sm font-semibold text-white transition-all hover:bg-blue-700"
                onClick={handleRedirectSub}
              >
                Revision
              </button>
            )}

        </div>
      </div>
    </div>
  );
};

export default CourseCard;