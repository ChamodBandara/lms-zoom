import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { defaultConfig } from '../../App/configs/common';

interface FacebookLinkProps {
  id: string;
  title: string;
  platform: string;
  link: string;
  thumbnail: string;
}

function Facebook() {
  const [links, setLinks] = useState<FacebookLinkProps[]>([]);

  // Custom Arrow Component
  const CustomArrow = ({
    className,
    onClick,
    style,
  }: {
    className: any;
    onClick: any;
    style: any;
  }) => (
    <div
      className={className}
      onClick={onClick}
      style={{
        ...style,
        backgroundColor: '#1877F2',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
      }}
    />
  );

  const settings = {
    dots: true,
    infinite: links.length > 1,
    speed: 500,
    slidesToShow: Math.min(links.length, 3),
    slidesToScroll: 1,
    nextArrow: (
      <CustomArrow
        className={undefined}
        onClick={undefined}
        style={undefined}
      />
    ),
    prevArrow: (
      <CustomArrow
        className={undefined}
        onClick={undefined}
        style={undefined}
      />
    ),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api('/getlinks');
        const data = await response.data;
        const facebookLinks = data.links.filter(
          (link: FacebookLinkProps) => link.platform === 'facebook',
        );
        if (facebookLinks.length > 0) {
          setLinks(facebookLinks);
        } else {
          console.log('No Facebook links found');
        }
      } catch (error) {
        toast.error('Something went wrong. Please try again shortly');
        console.log(error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="mt-10 h-full bg-white p-7">
      <header className="mt-5 w-full bg-blue-600 p-4 text-center text-white shadow-md">
        <h1 className="text-2xl font-bold">Facebook </h1>
        {/* <p className="text-sm">Explore Facebook Tips and Help</p> */}
      </header>

      {links.length > 0 ? (
        <Slider {...settings} className="mb-10 mt-6">
          {links.map((link) => (
            <div key={link.id} className="p-3">
              <div className="w-80 gap-5 rounded-lg border border-gray-400 bg-white p-5 shadow-lg">
                <img
                  src={`${defaultConfig.BASE_ASSEST_URL}/${link.thumbnail}`}
                  alt={link.title}
                  className="block h-auto w-auto rounded-lg object-cover"
                />
                <h2 className="mt-4 text-sm font-semibold text-gray-900">
                  {link.title}
                </h2>
                <div className="flex items-center justify-center">
                  <Link
                    to={link.link}
                    className="mt-4 inline-flex w-full max-w-xs items-center rounded-lg bg-theme px-14 py-2 text-center text-xs text-white hover:bg-purple-500"
                  >
                    <img
                      src="/images/icons/icons8-facebook-48.png"
                      alt="Facebook"
                      className="h-6 w-6"
                    />
                    <span className="mr-5">Join Facebook</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        <div className="mb-10 mt-5 flex flex-col items-center text-center">
          <img src="images/Animation - 1739266164016.gif" alt="No data" />
          <p className="text-sm text-gray-600">No Facebook links available</p>
        </div>
      )}
    </div>
  );
}

export default Facebook;
