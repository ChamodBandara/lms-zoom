import { Bell } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface NotificationProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

interface NotificationData {
  id: number;
  title: string;
  type: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Function to strip HTML tags from "about" field
const stripHtmlTags = (html: string | undefined) => {
  return html ? html.replace(/<\/?[^>]+(>|$)/g, '') : '';
};

const Notification: React.FC<NotificationProps> = ({
  icon,
  title,
  description,
  color,
}) => (
  <div
    className={`mb-4 flex items-center rounded-lg border bg-white p-4 shadow-md border-${color}-200 hover:bg-${color}-50`}
  >
    <div
      className={`h-10 w-10 rounded-full bg-${color}-100 mr-4 flex items-center justify-center`}
    >
      {icon}
    </div>
    <div className="flex-grow">
      <h3 className="ml-1 break-words text-lg font-medium text-gray-800">{title}</h3>
      <p className="ml-1 line-clamp-3 break-all text-sm text-gray-500">
        {description && stripHtmlTags(description).length > 100
          ? `${stripHtmlTags(description).substring(0, 100)}...`
          : stripHtmlTags(description)}
      </p>
    </div>
    {/* <button className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none">
      <CircleX />
    </button> */}
  </div>
);

const NotificationList: React.FC = () => {
  const [data, setData] = useState<NotificationData[]>([]);
  const [, setLoading] = useState<boolean>(false);
  const [, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/getnotifications');
      const notifications = response.data.data;
      console.log('Data is', notifications);
      setData(notifications);
    } catch (error) {
      setError('Please Try Again Later');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-1 min-h-screen bg-white p-4">
      <div className="mb-4 rounded-lg bg-[#F3DFFF] p-4">
        <div className="flex items-center">
          <Bell />
          <p className="ml-2 text-center text-xs font-medium text-black sm:text-left lg:text-sm">
            All notifications relevant to you will appear below.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* <Notification
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6 text-red-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.803-1.874 1.948-3.374l-4.879-8.944c-.967-1.75-2.29-1.75-3.255 0l-4.878 8.944z"
              />
            </svg>
          }
          title="Verify your identity to resume activity on EOE.LK!"
          description="Verify your identity to resume activity on EOE.LK!"
          color="red"
        />
        <Notification
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6 text-pink-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 7.5A.75.75 0 016 7h12a.75.75 0 01.75.75v9a.75.75 0 01-.75.75H6a.75.75 0 01-.75-.75v-9z"
              />
            </svg>
          }
          title="New Live Classes Going to start."
          description="Verify your identity to resume activity on EOE.LK!"
          color="pink"
        /> */}
        {/* <Notification
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6 text-green-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          }
          title="New To Do Has Listed."
          description="Verify your identity to resume activity on EOE.LK!"
          color="green"
        /> */}
        {/* <Notification
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6 text-lime-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v4.875h4.125c.621 0 1.125-.504 1.125-1.125V9.75"
              />
            </svg>
          }
          title="Your Task for the Day!"
          description="Verify your identity to resume activity on EOE.LK!"
          color="lime"
        /> */}
        {data.map((data) => (
          <Notification
            key={data.id}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={`h-6 w-6 ${data.type === 'successful' ? 'text-green-600' : 'text-red-600'}`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            }
            title={data.title}
            description={data.description}
            color={data.type === 'successful' ? 'green' : 'red'}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationList;
