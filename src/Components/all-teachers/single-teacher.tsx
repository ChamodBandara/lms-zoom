import { GraduationCap } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { TailSpin } from 'react-loader-spinner';
import { defaultConfig } from '../../App/configs/common';

// Define expected data structure
interface TeacherData {
  name?: string;
  avatar?: string;
  about?: string;
  banner_image?: string;
  qulification?: string;
}

function TeacherDetails() {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<TeacherData>({});

  // Function to strip HTML tags from "about" field
  const stripHtmlTags = (html: string | undefined) => {
    return html ? html.replace(/<\/?[^>]+(>|$)/g, '') : '';
  };

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      try {
        const response = await api.get('/get_teachers_details', {
          params: { teacher_id: id }, // Pass teacher ID as a query param
        });

        if (response.data?.data?.details) {
          setData(response.data.data.details); // Store response data
        }
      } catch (error) {
        console.error('Error fetching teacher details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherDetails();
  }, [id]); // Dependency only on `id` to prevent unnecessary re-fetching

  return (
    <div className="rounded-lg bg-white p-4">
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <TailSpin
            height="40"
            width="40"
            color="#9b59b6"
            ariaLabel="loading"
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 bg-white ">
            {/* Teacher Info Card */}
            <div className="rounded-lg bg-white p-5 shadow-xl border border-gray-100">
              <div className="flex w-full max-w-md items-center justify-between p-4">
                <div>
                  <h1 className="mt-8 text-2xl font-bold capitalize">{data.name}</h1>
                  <p className="mt-3 flex items-center text-sm text-gray-500">
                    <GraduationCap className="mr-2" />
                    {data?.qulification || 'N/A'}
                  </p>
                </div>

                <div className="ml-4">
                  {data?.avatar ? (
                    <img
                      src={`${defaultConfig.BASE_ASSEST_URL}/${data.avatar}`}
                      alt="Profile"
                      className="h-15 w-20 lg:h-20 lg:w-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
              </div>

              {/* About Teacher (with HTML tags removed) */}
              <div className="mt-5 text-left p-4">
                <p className="text-sm text-gray-700 break-words">
                  {stripHtmlTags(data.about)}
                </p>
              </div>
            </div>

            {/* Banner Image */}
            <div className="flex flex-1 items-start justify-start rounded-lg bg-white p-5 text-xl text-white shadow-xl border border-gray-100 max-h-[80vh] ">
              {data?.banner_image ? (
                <img
                  src={`${defaultConfig.BASE_ASSEST_URL}/${data.banner_image}`}
                  alt="Banner"
                  className="p-2 max-h-[80vh] w-full rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-80 w-full items-center justify-center bg-gray-200 text-gray-500">
                  No Banner Image
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TeacherDetails;
