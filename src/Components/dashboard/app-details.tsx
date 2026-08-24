import { Link } from 'react-router-dom';
import { defaultConfig } from '../../App/configs/common';

function AppDetails() {
  return (
    <div className="mx-4 mt-10 flex  flex-col items-center justify-between rounded-2xl bg-gray-50 p-4 shadow-lg md:mx-auto md:flex-row md:p-8 lg:p-12">
      <div className="flex-1 text-purple-900 md:pr-6 lg:pr-10 p-4 md:p-0">
        <h2 className="mb-4 text-2xl font-bold leading-tight sm:text-3xl">
        Empower Your Learning Journey

          <br />
         
        </h2>

        <p className="mb-6 text-base leading-relaxed text-purple-800 sm:text-lg md:text-base lg:text-xl">
        Unlock tools that make studying smarter and more engaging. Download our app today and take your education to the next level!
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="https://play.google.com/store/apps/details?id=lk.eoe.app&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Get it on Google Play"
              className="h-9 w-auto rounded-lg shadow-md sm:h-10"
            />
          </Link>

          <Link
            to="https://apps.apple.com/us/app/eoe-lk/id6742047550"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
              alt="Download on the App Store"
              className="h-9 w-auto rounded-lg shadow-md sm:h-10"
            />
          </Link>

          <Link
            to="https://appgallery.huawei.com/app/C113744327"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105"
          >
            <img
              src="/images/appgallery.png"
              alt="Get it on Huawei AppGallery"
              className="h-9 w-auto rounded-lg shadow-md sm:h-10"
            />
          </Link>

          <a
            href={`${defaultConfig.BASE_API_URL}/apk/eoe.apk`}
            download // triggers download instead of navigation
            onClick={(e) => {
              e.preventDefault(); // prevent default anchor behavior
              const link = document.createElement('a');
              link.href = `${defaultConfig.BASE_API_URL}/apk/eoe.apk`;
              link.setAttribute('download', 'eoe.apk'); // optional: rename the file
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex h-9 items-center justify-center rounded-lg bg-theme px-3 py-1 text-xs font-medium text-white shadow-md transition-transform hover:scale-105 hover:bg-purple-700 sm:h-10 sm:px-4 sm:text-sm"
          >
            Download APK
          </a>
        </div>
      </div>

      <div className="relative mt-6 flex-1 text-center md:mt-0 md:pl-4 lg:pl-0">
        <div className="absolute -z-0 h-full w-full rotate-2 rounded-3xl bg-gradient-to-br from-purple-600 to-purple-300 opacity-10"></div>

        <img
          src="/images/header.png"
          alt="App Preview"
          className="relative z-10 mx-auto w-full max-w-[280px] md:max-w-[320px] lg:max-w-md transform rounded-3xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        />
      </div>
    </div>
  );
}

export default AppDetails;