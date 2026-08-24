import { useEffect, useState } from 'react';
import api from '../../services/api';
import StudentVerification from './student-verification';
import { toast } from 'react-toastify';
import axios from 'axios';
import { defaultConfig } from '../../App/configs/common';
import { TailSpin } from 'react-loader-spinner';
import { CircleX, CircleCheckBig } from 'lucide-react';

interface MyProfileProps {
  first_name: string;
  last_name: string;
  contact_number: string;
  gender: string;
  mobile_contact_number: string;
  address: string;
  district: string;
  exam_year: string;
  school_name: string;
  stream: string;
  status: string;
  email: string;
  city?: string;
  postal_code?: string;
  tute_address?: string;
  avatar: string;
  evrest_id: string;
}

interface CommonData {
  districtsList: string[];
  examYearList: string[];
  streamList: string[];
}
function MyProfile() {
  const [showVerification, setShowVerification] = useState(true);
  const [user, setUser] = useState<MyProfileProps | null>({
    first_name: '',
    last_name: '',
    contact_number: '',
    gender: '',
    mobile_contact_number: '',
    address: '',
    district: '',
    exam_year: '',
    school_name: '',
    stream: '',
    status: '',
    email: '',
    city: '',
    postal_code: '',
    tute_address: '',
    avatar: '',
    evrest_id: '',
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [imageUploaded] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [genders] = useState(['Male', 'Female']);

  const [isLoading, setIsLoading] = useState(true);
  const [, setLoading] = useState(false);

  // const [city] = useState([
  //   'Colombo',
  //   'Kandy',
  //   'Galle',
  //   'Jaffna',
  //   'Negombo',
  //   'Anuradhapura',
  //   'Trincomalee',
  //   'Batticaloa',
  //   'Matara',
  //   'Nuwara Eliya',
  //   'Ratnapura',
  //   'Kurunegala',
  //   'Vavuniya',
  //   'Mannar',
  //   'Pollonnaruwa',
  // ]);

  const [commondata, setCommonData] = useState<CommonData | null>(null);

  useEffect(() => {
    const common_data = async () => {
      try {
        // const response = await axiosInstance.get('/api/get_common_data');
        const response = await axios.get(
          `${defaultConfig.BASE_API_URL}/get_common_data`,
        );
        //console.log('response1', response.data.data);
        setCommonData(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    common_data();
  }, []);

  const getProfileData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/profile');
      const userData = response.data.data;
      localStorage.setItem('avatar', response.data.data.avatar);
      setUser(userData);
    } catch (error: any) {
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProfileData();
  }, []);

  const handleAvatarSaveChanges = async () => {
    const maxFileSize = 4 * 1024 * 1024; // 4MB
    try {
      const formData = new FormData();

      if (selectedFile) {
        formData.append('avatar', selectedFile);
      }
      if (!selectedFile) {
        toast.error('Please select a valid file.');
        return;
      }
      if (selectedFile.size > maxFileSize) {
        toast.error(
          `NIC with image is too large: ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB (Max: 4MB)`,
        );
        return;
      }

      const response = await api.post('/update_profile_avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        getProfileData();
        toast.success(response.data.message);
        setIsPopupOpen(false);
        setImagePreview(null);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || 'Server error occurred';

        if (error.response?.status === 422) {
          // Handle validation errors
          const validationErrors = error.response?.data?.errors;
          if (validationErrors) {
            Object.values(validationErrors).forEach((errArray: any) => {
              if (Array.isArray(errArray)) {
                errArray.forEach((err: string) => toast.error(err));
              }
            });
          } else {
            toast.error(errorMessage);
          }
        } else if (error.response?.status === 400) {
          // Handle other client-side errors
          toast.error(errorMessage);
        } else {
          toast.error(errorMessage);
        }
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }

      setIsPopupOpen(false);
      setImagePreview(null);
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Create a FormData object to handle both text and file data
      const formData = new FormData();

      // Append user data fields
      for (const key in user) {
        if (user[key as keyof typeof user]) {
          formData.append(key, user[key as keyof typeof user] as string);
        }
      }

      formData.delete('avatar');
      // Append selected image file if available
      // if (selectedFile) {
      //   formData.append('avatar', selectedFile); // Backend should expect 'avatar'
      // }

      // console.log('FormData being sent:', Array.from(formData.entries()));

      // Send data to the backend
      const response = await api.post('/update_profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        toast.success(response.data.message);
        setIsEditing(false);
        setIsPopupOpen(false);
        setImagePreview(null);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || 'Server error occurred';

        if (error.response?.status === 422) {
          // Handle validation errors
          const validationErrors = error.response?.data?.errors;
          if (validationErrors) {
            Object.values(validationErrors).forEach((errArray: any) => {
              if (Array.isArray(errArray)) {
                errArray.forEach((err: string) => toast.error(err));
              }
            });
          } else {
            toast.error(errorMessage);
          }
        } else if (error.response?.status === 400) {
          // Handle other client-side errors
          toast.error(errorMessage);
        } else {
          toast.error(errorMessage);
        }
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setUser((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // const handleUpload = async () => {
  //   if (!selectedFile) {
  //     toast.error('Please select an image to upload.');
  //     return;
  //   }

  //   try {
  //     const formData = new FormData();

  //     // Append the file
  //     formData.append('profile_picture', selectedFile);

  //     // Append the user data
  //     Object.keys(user || {}).forEach((key) => {
  //       if (user?.[key]) {
  //         formData.append(key, user[key as keyof MyProfileProps] as string);
  //       }
  //     });

  //     // API Call
  //     const response = await api.post('/update_profile', formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     });

  //     if (response.status === 200) {
  //       toast.success('Profile and image uploaded successfully!');
  //       setIsPopupOpen(false);
  //       setImagePreview(null);
  //       setIsEditing(false);
  //     }
  //   } catch (error) {
  //     console.error('Error uploading profile and image:', error);
  //     toast.error('Failed to upload profile and image. Please try again.');
  //   }
  // };

  return (
    <div className="">
      {isLoading ? (
        <div className="flex h-screen items-center justify-center">
          <TailSpin
            height="40"
            width="40"
            color="#9b59b6"
            ariaLabel="loading"
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-12">
            {/* <div className="container mx-auto mt-5 bg-white p-4 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1 bg-white p-4">
            <h2 className="mb-2 text-3xl text-black">My Profile</h2>
            <img
              src={
                user?.avatar
                  ? `${defaultConfig.BASE_API_URL}/${user.avatar}`
                  : 'images/fallback.png'
              }
              alt="Profile Picture"
              className="h-24 w-24 rounded"
            />

            <p className="mt-1 text-xs text-red-500">
              When uploading profile pictures, use photos that are less than 1MB
              in size and less than 1000 x 1000 pixels.
            </p>
          </div>

          <div className="flex w-full flex-col items-center justify-center p-4 md:w-1/5">
            <button
              type="button"
              className="mb-2 rounded-lg bg-gray-800 px-5 py-2.5 text-xs font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300"
              onClick={handleSaveChanges}
            >
              Save Profile
            </button>
            <p className="mb-2 text-center text-xs text-gray-400">OR</p>
            <div>
              <button
                type="button"
                className="mb-2 rounded-lg bg-purple-700 px-5 py-2.5 text-xs font-medium text-white hover:bg-purple-900 focus:outline-none focus:ring-4 focus:ring-purple-300"
                onClick={() => setIsPopupOpen(true)}
              >
                Upload My Image
              </button>

              {isPopupOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="w-11/12 rounded-lg bg-white p-6 sm:w-1/3">
                    <h2 className="mb-4 text-sm font-bold">
                      Upload Your Image
                    </h2>
                    <input
                      type="file"
                      name="avatar"
                      onChange={handleFileChange}
                      className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />

                    {imagePreview && (
                      <div className="mb-4">
                        <img
                          src={imagePreview}
                          alt="Image Preview"
                          className="mx-auto h-24 w-24 rounded-lg object-cover"
                        />
                      </div>
                    )}

                    <div className="mt-4 flex justify-between">
                      <button
                        className="rounded-lg bg-gray-500 px-4 py-2 text-sm text-white"
                        onClick={() => {
                          setIsPopupOpen(false);
                          setImagePreview(null);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="rounded-lg bg-theme px-4 py-2 text-sm text-white"
                        onClick={handleSaveChanges}
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {imageUploaded && (
                <div className="fixed left-1/2 top-0 w-full -translate-x-1/2 transform bg-green-600 py-2 text-center text-white">
                  <p className="mx-auto">Image uploaded successfully!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div> */}

            <div className="flex h-auto flex-col items-start justify-center gap-8 bg-white p-6 md:flex-row">
              <div className="h-auto w-full rounded-lg bg-white p-6 shadow-md md:w-1/2">
                <h2 className="mb-4 text-3xl text-black">My Profile</h2>
                {user?.avatar ? (
                  <div className="items-left justify-left flex">
                    <img
                      src={`${defaultConfig.BASE_ASSEST_URL}/${user?.avatar}`}
                      alt="Profile"
                      className="mb-4 h-32 w-32 rounded-lg object-cover md:h-40 md:w-40"
                    />
                  </div>
                ) : (
                  <div className="items-left justify-left flex">
                    <img
                      src="images/profile-1.png"
                      alt="Profile"
                      className="mb-4 h-32 w-32 rounded-lg md:h-40 md:w-40"
                    />
                  </div>
                )}

                <p className="mt-1 text-[10px] text-red-500">
                  When uploading profile pictures, use photos that are less than
                  1MB in size and less than 1000 x 1000 pixels.
                </p>

                <div className="flex w-full flex-col items-center justify-center p-4">
                  <div className="flex w-full items-center justify-center">
                    <button
                      type="button"
                      className="mt-2 w-full max-w-xs truncate rounded-lg bg-theme px-8 py-2.5 text-center text-xs font-medium text-white hover:bg-purple-900 focus:outline-none focus:ring-4 focus:ring-purple-300 sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
                      onClick={() => setIsPopupOpen(true)}
                    >
                      Upload My Image
                    </button>
                  </div>

                  {isPopupOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="w-11/12 rounded-lg bg-white p-6 sm:w-1/3">
                        <h2 className="mb-4 text-sm font-bold">
                          Upload Your Image
                        </h2>
                        {/* <input
                          type="file"
                          name="avatar"
                          onChange={handleFileChange}
                          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        /> */}

                        <div className="flex w-full items-center justify-center">
                          <label
                            htmlFor="file-upload"
                            className="w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-center transition duration-300 ease-in-out hover:bg-gray-100"
                          >
                            <span className="text-sm font-medium text-gray-600">
                              Choose a file
                            </span>
                            <input
                              id="file-upload"
                              type="file"
                              accept="avatar"
                              onChange={handleFileChange}
                              className="hidden"
                              required
                            />
                          </label>
                        </div>

                        {imagePreview && (
                          <div className="mb-4 mt-2 flex">
                            <img
                              src={imagePreview}
                              alt="Image Preview"
                              className="mx-auto h-24 w-24 rounded-lg object-cover"
                            />
                          </div>
                        )}

                        <div className="mt-4 flex justify-between">
                          <button
                            className="rounded-lg bg-gray-500 px-4 py-2 text-sm text-white"
                            onClick={() => {
                              setIsPopupOpen(false);
                              setImagePreview(null);
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="rounded-lg bg-theme px-4 py-2 text-sm text-white"
                            onClick={handleAvatarSaveChanges}
                          >
                            Upload
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {imageUploaded && (
                    <div className="fixed left-1/2 top-0 w-full -translate-x-1/2 transform bg-green-600 py-2 text-center text-white">
                      <p className="mx-auto">Image uploaded successfully!</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-96 w-full rounded-lg bg-white p-4 shadow-md md:w-1/2">
                <div className="space-y-4">
                  <div className="flex items-start justify-between border-b pb-4">
                    <div className="flex flex-col gap-4">
                      <div>
                        <h2 className="mb-4 text-4xl font-semibold capitalize">
                          {user?.first_name + ' ' + user?.last_name}
                        </h2>
                        <p className="mb-5 text-gray-600">
                          Everest ID:{' '}
                          <span className="font-medium">{user?.evrest_id}</span>
                        </p>

                        {user?.status === 'notsubmit' ? (
                          <div className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-[#3F3F3F] px-4 py-2">
                            <span className="text-white">Unverified</span>
                            <span className="text-xl text-white">
                              <CircleX color="#fa0000" size={20} />
                            </span>
                          </div>
                        ) : user?.status === 'rejected' ? (
                          <div className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-[#3F3F3F] px-4 py-2">
                            <span className="text-white">Rejected</span>
                            <span className="text-xl text-white">
                              <CircleX color="#fa0000" size={20} />
                            </span>
                          </div>
                        ) : user?.status === 'submit' ? (
                          <div className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2">
                            <span className="text-white">Pending</span>
                            {/* <span className="text-xl text-white">
                        <CircleX color="#fa0000" size={20} />
                      </span> */}
                          </div>
                        ) : user?.status === 'approved' ? (
                          <div className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-theme px-4 py-2">
                            <span className="text-white">Verified</span>
                            <span className="text-xl text-white">
                              <CircleCheckBig color="#04b910" size={20} />
                            </span>
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-4 flex items-center gap-4">
                        <img
                          src="images/icons/radix-icons_mobile.png"
                          alt="Mobile Verification Icon"
                          className="h-8 w-8 object-contain"
                        />
                        <div>
                          <p className="font-semibold">
                            Mobile :{' '}
                            <span className="text-gray-700">
                              {user?.mobile_contact_number}
                            </span>
                          </p>
                          <p className="flex items-center gap-2 text-sm text-black">
                            {user && user?.status === 'approved' ? (
                              <>
                                Verified{' '}
                                <CircleCheckBig color="#04b910" size={20} />
                              </>
                            ) : (
                              <>
                                Verified <CircleX color="#fa0000" size={20} />{' '}
                                {/* Optional different color or icon */}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-1 flex flex-col items-center justify-between md:flex-row">
                  {user && user?.status === 'approved' ? (
                    ''
                  ) : (
                    <p className="w-full text-xs text-red-500">
                      Please upload all the required documents and press submit
                      to verify your information.
                    </p>
                  )}

                  {/* <button className="mt-4 w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black outline outline-1 outline-[#3F3F3F] md:mt-0 md:w-auto">
            Submit
          </button> */}
                </div>
              </div>
            </div>

            <div className="flex h-screen w-full flex-col">
              <div className="flex flex-1 flex-col items-start justify-start bg-white p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-black">
                  Student Profile
                </h2>
                <p className="mt-4 text-sm text-gray-700">
                  Fill in all the requested information and click the “Save
                  Changes” to complete your verification process.
                </p>

                <h2 className="mt-5 text-2xl font-bold text-black">
                  Personal Details
                </h2>

                <form className="mt-5 w-full space-y-4">
                  <div className="flex w-full space-x-4">
                    <div className="flex-1">
                      <label
                        className="text-1xl mb-2 block font-medium text-black"
                        htmlFor="first-name"
                      >
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={user?.first_name}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-4 py-2 text-xs text-black focus:ring focus:ring-blue-300"
                        placeholder="Enter your first name"
                        required
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex-1">
                      <label
                        className="text-1xl mb-2 block font-medium text-black"
                        htmlFor="last_name"
                      >
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={user?.last_name}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-4 py-2 text-xs text-black focus:ring focus:ring-blue-300"
                        placeholder="Enter your last name"
                        required
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="flex w-full space-x-4">
                    {/* <div className="w-full sm:w-1/2">
                      <label
                        className="text-1xl mb-2 block font-medium text-gray-700"
                        htmlFor="email"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={user?.email}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-4 py-2 text-xs focus:ring focus:ring-blue-300"
                        placeholder="Enter your email"
                        disabled={!isEditing}
                      />
                    </div> */}

                    <div className="w-full sm:w-1/2">
                      <label
                        className="text-1xl mb-2 block font-medium text-black"
                        htmlFor="gender"
                      >
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gender"
                        value={user?.gender}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-4 py-2 text-xs text-black focus:ring focus:ring-blue-300"
                        required
                        disabled={!isEditing}
                      >
                        {genders.map((gender) => (
                          <option key={gender} value={gender}>
                            {gender}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex w-full space-x-4">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="text-1xl mb-2 block font-medium text-black"
                        htmlFor="contact_number"
                      >
                        WhatsApp Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="contact_number"
                        value={user?.contact_number}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(
                            /\D/g,
                            '',
                          );

                          const syntheticEvent = {
                            ...e,
                            target: {
                              ...e.target,
                              name: e.target.name,
                              value: numericValue,
                            },
                          };

                          handleChange(syntheticEvent);
                        }}
                        className="w-full rounded-lg border px-4 py-2 text-xs text-black focus:ring focus:ring-blue-300"
                        placeholder="Enter your phone number"
                        required
                        disabled={!isEditing}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="text-1xl mb-2 block font-medium text-black"
                        htmlFor="school_name"
                      >
                        School <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="school_name"
                        value={user?.school_name}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-4 py-2 text-xs text-black focus:ring focus:ring-blue-300"
                        placeholder="Enter your phone number"
                        required
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="flex w-full space-x-4">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="text-1xl mb-2 block font-medium text-black"
                        htmlFor="exam_year"
                      >
                        Batch <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="exam_year"
                        name="exam_year"
                        value={user?.exam_year}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-4 py-2 text-xs focus:ring focus:ring-blue-300"
                        required
                        disabled={!isEditing}
                      >
                        {commondata?.examYearList.map((exam_year, index) => (
                          <option key={index} value={exam_year}>
                            {exam_year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full sm:w-1/2">
                      <label
                        className="text-1xl mb-2 block font-medium text-black"
                        htmlFor="stream"
                      >
                        Stream <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="stream"
                        name="stream"
                        value={user?.stream}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-4 py-2 text-xs text-black focus:ring focus:ring-blue-300"
                        required
                        disabled={!isEditing}
                      >
                        {commondata?.streamList.map((stream, index) => (
                          <option key={index} value={stream}>
                            {stream}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <h2 className="mt-5 text-2xl font-bold text-black">
                    Other Details
                  </h2>

                  <div className="flex w-full space-x-4">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="text-1xl mb-2 block font-medium text-black"
                        htmlFor="address"
                      >
                        Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={user?.address}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-4 py-2 text-xs text-black focus:ring focus:ring-blue-300"
                        placeholder="Enter your address"
                        required
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="text-1xl mb-2 block font-medium text-black"
                        htmlFor="district"
                      >
                        District <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="district"
                        value={user?.district}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-4 py-2 text-xs text-black focus:ring focus:ring-blue-300"
                        required
                        disabled={!isEditing}
                      >
                        {commondata?.districtsList.map((district, index) => (
                          <option key={index} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex w-full space-x-4">
                    {/* <div className="w-full sm:w-1/2">
                      <label
                        className="text-1xl mb-2 block font-medium text-gray-700"
                        htmlFor="city"
                      >
                        City <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="city"
                        value={user?.city}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-4 py-2 text-xs focus:ring focus:ring-blue-300"
                        required
                        disabled={!isEditing}
                      >
                        {city.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div> */}

                    <div className="w-full sm:w-1/2">
                      <label
                        className="text-1xl mb-2 block font-medium text-gray-700"
                        htmlFor="postal_code"
                      >
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="postal_code"
                        value={user?.postal_code}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-4 py-2 text-xs focus:ring focus:ring-blue-300"
                        placeholder="Enter your postal code"
                        required
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {/* <div className="w-full sm:w-1/2">
                    <label
                      className="text-1xl mb-2 block font-medium text-gray-700"
                      htmlFor="tute_address"
                    >
                      Address For Tute Tracking
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="tute_address"
                      value={user?.tute_address}
                      onChange={handleChange}
                      className="w-full rounded-lg border px-4 py-6 text-xs focus:ring focus:ring-blue-300"
                      placeholder="Enter your address"
                      required
                      disabled={!isEditing}
                    />
                  </div>

                  <p className="mt-4 flex items-center text-xs text-gray-700">
                    <img
                      src="/images/warn.png"
                      alt="Warning"
                      className="mr-2 h-5 w-5"
                    />
                    When entering the online student address, enter the correct
                    address to receive Tutes.
                  </p> */}

                  <div className="flex w-full flex-wrap justify-end sm:space-x-2">
                    <button
                      type="button"
                      className="mb-2 w-full rounded-lg border border-gray-200 bg-white px-10 py-2 text-xs font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 sm:w-auto"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </button>
                    {isEditing && (
                      <button
                        type="button"
                        className="mb-2 w-full rounded-lg border border-gray-200 bg-theme px-2 py-2 text-xs font-medium text-white hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 sm:w-auto"
                        onClick={handleSaveChanges}
                      >
                        Save Changes
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="flex flex-1 items-center justify-center">
                {(user?.status === 'notsubmit' ||
                  user?.status === 'rejected') &&
                  showVerification && (
                    <StudentVerification
                      onClose={() => setShowVerification(false)}
                    />
                  )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MyProfile;
