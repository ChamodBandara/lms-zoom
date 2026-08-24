import { Label } from 'flowbite-react';
import { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import axios from 'axios';
function StudentVerification({ onClose }: { onClose: any }) {
  const [nicFrontImage, setNicFrontImage] = useState<File | null>(null);
  const [nicBackImage, setNicBackImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  const [nicFrontPreview, setNicFrontPreview] = useState<string | null>(null);
  const [nicBackPreview, setNicBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>,
  ) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async () => {
    const maxFileSize = 4 * 1024 * 1024; // 4MB

    if (!nicFrontImage || !nicBackImage || !selfieImage) {
      alert('Please upload all required images before submitting.');
      return;
    }

    if (nicFrontImage.size > maxFileSize) {
      toast.error(`NIC with image is too large: ${(nicFrontImage.size / 1024 / 1024).toFixed(2)}MB (Max: 4MB)`);
      return;
    }
    if (nicBackImage.size > maxFileSize) {
      toast.error(`NIC front is too large: ${(nicBackImage.size / 1024 / 1024).toFixed(2)}MB (Max: 4MB)`);
      return;
    }
    if (selfieImage.size > maxFileSize) {
      toast.error(`NIC back is too large: ${(selfieImage.size / 1024 / 1024).toFixed(2)}MB (Max: 4MB)`);
      return;
    }

    const formData = new FormData();
    formData.append('nic_front', nicFrontImage);
    formData.append('nic_back', nicBackImage);
    formData.append('nic_with_image', selfieImage);
    setLoading(true); // Start loading
    try {
      const response = await api.post('/verify_user', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        toast.success(response.data.message);
        onClose();
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
    
      } finally {
        setLoading(false); // Stop loading
      }
  };

  return (
    <div className="flex h-screen w-full flex-col">
      <div className="relative flex flex-1 flex-col items-start justify-start bg-white p-6 shadow-lg">
        <p className="mt-4 flex flex-col items-start text-base text-gray-700 md:flex-row md:items-center md:text-lg">
          <img
            src="/images/warn.png"
            alt="Warning"
            className="mb-2 mr-0 h-6 w-6 md:mb-0 md:mr-2"
          />
          <span>
            <span className="font-bold">Verification Required:</span> Verify
            your identity to resume activity on Everest Online Education.
          </span>
        </p>

        <h2 className="mt-5 text-2xl font-bold text-black">
          Student Verification
        </h2>
        <p className="mt-4 text-sm text-gray-700">
          Fill in all the requested information and click the 'Submit' to
          complete your verification process.
        </p>

        <div className="container mx-auto mb-10 mt-5">
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex h-auto items-center justify-center">
              <div className="w-full rounded-lg bg-[#F6F5F5] p-6 shadow-md">
                <h2 className="text-lg font-bold text-gray-800">
                  NIC Front Side
                </h2>
                <p className="text-sm text-gray-600">
                  NIC Front - A photo of the front of your National Identity
                  Card
                </p>
                <div className="mt-4 flex w-full items-center justify-center">
                  <Label
                    htmlFor="nic_front"
                    className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pb-6 pt-5">
                      <svg
                        className="mb-4 h-8 w-8 text-gray-500"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{' '}
                      </p>
                      <p className="text-xs text-gray-500">
                        SVG, PNG, JPG (MAX. 800x400px)
                      </p>
                    </div>
                    <input
                      type="file"
                      id="nic_front"
                      name="nic_front"
                      className="hidden"
                      onChange={(e) =>
                        handleImageChange(
                          e,
                          setNicFrontImage,
                          setNicFrontPreview,
                        )
                      }
                    />
                  </Label>
                </div>

                {nicFrontPreview && (
                  <div className="mt-4 flex justify-center">
                    <img
                      src={nicFrontPreview}
                      alt="NIC Front Preview"
                      className="h-24 w-24 rounded-md object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex h-auto items-center justify-center">
              <div className="w-full rounded-lg bg-[#F6F5F5] p-6 shadow-md">
                <h2 className="text-lg font-bold text-gray-800">
                  NIC Back Side
                </h2>
                <p className="text-sm text-gray-600">
                  NIC Back - A photo of the back of your National Identity Card
                </p>
                <div className="mt-4 flex w-full items-center justify-center">
                  <Label
                    htmlFor="nic_back"
                    className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pb-6 pt-5">
                      <svg
                        className="mb-4 h-8 w-8 text-gray-500"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{' '}
                      </p>
                      <p className="text-xs text-gray-500">
                        SVG, PNG, JPG (MAX. 800x400px)
                      </p>
                    </div>
                    <input
                      type="file"
                      id="nic_back"
                      name="nic_back"
                      className="hidden"
                      onChange={(e) =>
                        handleImageChange(e, setNicBackImage, setNicBackPreview)
                      }
                    />
                  </Label>
                </div>

                {nicBackPreview && (
                  <div className="mt-4 flex justify-center">
                    <img
                      src={nicBackPreview}
                      alt="NIC Back Preview"
                      className="h-24 w-24 rounded-md object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-4 flex h-auto items-start justify-start">
            <div className="w-full rounded-lg bg-[#F6F5F5] p-4 shadow-md md:w-1/2">
              <h2 className="text-lg font-bold text-gray-800">
                Selfie with NIC
              </h2>
              <p className="text-sm text-gray-600">
                A photo of you holding your NIC for verification
              </p>
              <div className="mt-4 flex w-full items-center justify-center">
                <Label
                  htmlFor="nic_with_image"
                  className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    <svg
                      className="mb-4 h-8 w-8 text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      SVG, PNG, JPG (MAX. 800x400px)
                    </p>
                  </div>
                  <input
                    type="file"
                    id="nic_with_image"
                    name="nic_with_image"
                    className="hidden"
                    onChange={(e) =>
                      handleImageChange(e, setSelfieImage, setSelfiePreview)
                    }
                  />
                </Label>
              </div>
              {/* Selfie Preview */}
              {selfiePreview && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={selfiePreview}
                    alt="Selfie Preview"
                    className="h-24 w-24 rounded-md object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full justify-center sm:justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`rounded-md bg-theme px-4 py-2 text-sm text-white flex items-center justify-center ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 0116 0H4z"
                  ></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentVerification;
