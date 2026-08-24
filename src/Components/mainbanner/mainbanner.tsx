export default function Mainbanner({
  first_name,
  gender,
}: {
  first_name: string;
  gender?: 'Male' | 'Female';
}) {
  const date = new Date();
  const hours = date.getHours();
  let greeting: string;
  if (hours < 12) {
    greeting = 'Good Morning !';
  } else if (hours >= 12 && hours < 17) {
    greeting = 'Good Afternoon !';
  } else {
    greeting = 'Good Evening !';
  }

  const imageSrc =
    gender === 'Male' ? '/images/men.png' : '/images/homebanner_image.png';
  const imageAlt =
    gender === 'Male' ? 'home_banner_male_image' : 'home_banner_image';

  return (
    <div className="flex h-auto w-full flex-col items-center justify-between rounded-[30px] bg-[#000000B8] px-6 py-8 md:h-72 md:flex-row md:px-16">
      <div className="flex flex-col gap-2 text-center md:text-left">
        <h2 className="text-2xl font-semibold text-white md:text-3xl">
          {greeting}
        </h2>
        <h1 className="mt-2 text-3xl font-extrabold text-white md:text-3xl">
          {first_name}
        </h1>
        <h2 className="mt-2 text-xl font-normal text-white md:text-3xl">
          Let’s Start Learning.
        </h2>
      </div>
      <div>
        <img
          src={imageSrc}
          alt={imageAlt}
          className="mt-6 h-48 w-48 md:mt-0 md:h-72 md:w-64 p-5"
        />
      </div>
    </div>
  );
}
