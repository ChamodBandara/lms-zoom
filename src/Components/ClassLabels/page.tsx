import React from 'react';

export enum SmallIconType {
  LIVE = 'live',
  PAID = 'paid',
  NOTPAID = 'notpaid',
  PASTLESSON = 'pastlesson',
  STUDYPACK = 'studypack',
}

interface SmallIconProps {
  text?: string;
  icon?: string;
  type?: SmallIconType;
}

const SmallIcon: React.FC<SmallIconProps> = ({
  text,
  icon,
  type = SmallIconType.LIVE,
}) => {
  const iconStyles = {
    [SmallIconType.LIVE]: {
      text: 'Live',
      img: '/images/live_class.png',
      style: 'rounded-sm bg-[#FF3131] px-2 py-1 w-auto',
    },
    [SmallIconType.PAID]: {
      text: 'Paid',
      img: '/images/check.png',
      style: 'rounded-sm bg-[#157D00] px-2 py-1 w-auto',
    },
    [SmallIconType.NOTPAID]: {
      text: 'Not Paid',
      img: '/images/not_paid.png',
      style: 'rounded-sm bg-[#7D1300] px-2 py-1 w-auto',
    },
    [SmallIconType.PASTLESSON]: {
      text: 'Past Lessons',
      img: '/images/pass_lesson_icon.png',
      style: 'rounded-sm bg-[#CEADE2] px-2 py-1 w-auto',
    },
    [SmallIconType.STUDYPACK]: {
      text: 'Study Packs',
      img: '/images/study_pack_icon.png',
      style: 'rounded-sm bg-[#FFBE31] px-2 py-1 w-auto',
    },
  };

  const {
    text: defaultText,
    img: defaultImg,
    style,
  } = iconStyles[type] || iconStyles[SmallIconType.LIVE];

  return (
    <div className={style}>
      <div className="flex justify-center gap-1">
        <span className="text-[10px] font-semibold text-white">
          {text || defaultText}
        </span>
        <img
          src={icon || defaultImg}
          alt="small icon image"
          className="h-4 w-4"
        />
      </div>
    </div>
  );
};

export default SmallIcon;
