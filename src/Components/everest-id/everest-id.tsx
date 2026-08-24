import React, { useState } from 'react';
import { ArrowBigUp, CircleCheckBig, CircleX } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

function EverestId() {
  const [isSelfieModalOpen, setSelfieModalOpen] = useState(false);
  const [isFrontModalOpen, setFrontModalOpen] = useState(false);
  const [isBackModalOpen, setBackModalOpen] = useState(false);

  const [nicWithImage, setNicWithImage] = useState<File | null>(null);
  const [nicFront, setNicFront] = useState<File | null>(null);
  const [nicBack, setNicBack] = useState<File | null>(null);

  const [nicWithImagePreview, setNicWithImagePreview] = useState<string | null>(
    null,
  );
  const [nicFrontPreview, setNicFrontPreview] = useState<string | null>(null);
  const [nicBackPreview, setNicBackPreview] = useState<string | null>(null);

  const openSelfieModal = () => setSelfieModalOpen(true);
  const closeSelfieModal = () => setSelfieModalOpen(false);
  const openFrontModal = () => setFrontModalOpen(true);
  const closeFrontModal = () => setFrontModalOpen(false);
  const openBackModal = () => setBackModalOpen(true);
  const closeBackModal = () => setBackModalOpen(false);

  // Function to handle image upload and preview
  // const handleImageUpload = (
  //   event: React.ChangeEvent<HTMLInputElement>,
  //   type: string,
  // ) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       if (type === 'selfie') {
  //         setSelfieImage(reader.result as string);
  //       } else if (type === 'front') {
  //         setFrontImage(reader.result as string);
  //       } else if (type === 'back') {
  //         setBackImage(reader.result as string);
  //       }
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };
  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'nic_with_image' | 'nic_front' | 'nic_back',
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        switch (type) {
          case 'nic_with_image':
            setNicWithImage(file);
            setNicWithImagePreview(reader.result as string);
            break;
          case 'nic_front':
            setNicFront(file);
            setNicFrontPreview(reader.result as string);
            break;
          case 'nic_back':
            setNicBack(file);
            setNicBackPreview(reader.result as string);
            break;
          default:
            break;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!nicWithImage || !nicFront || !nicBack) {
      toast.error('Please upload all required images before submitting.');
      return;
    }
    const formData = new FormData();
    formData.append('nic_with_image', nicWithImage);
    formData.append('nic_front', nicFront);
    formData.append('nic_back', nicBack);

    try {
      const response = await api.post('/verify_user', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        toast.success('Verification images submitted successfully!');
      } else {
        toast.error('Failed to submit verification images.');
      }
    } catch (error) {
      console.error('Error submitting verification images:', error);
      toast.error('An error occurred while submitting verification images.');
    }
  };
  return (
    <div className=" flex h-25 flex-col items-start justify-center gap-8 bg-white p-6 md:flex-row">
      <div className="w-full rounded-lg bg-white p-6 shadow-md md:w-1/3">
        <img
          src="images/profile-1.png"
          alt="Profile"
          className="mb-4 w-full rounded-lg"
        />
        <h2 className="mb-2 mt-12 text-xl font-semibold">Asanda Imesha</h2>
        <p className="mb-2 text-gray-600">
          Student ID: <span className="font-medium">24643243</span>
        </p>
        <div className="flex items-center justify-center gap-2 rounded-lg bg-[#3F3F3F] px-4 py-2">
          <span className="text-white">Unverified</span>
          <span className="text-xl text-white">
            <CircleX color="#fa0000" size={20} />
          </span>
        </div>
      </div>

      <div className="w-full rounded-lg bg-white p-6 shadow-md md:w-2/3">
        <div className="space-y-4">
          <div className="flex flex-col items-start justify-between border-b pb-4 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <img
                src="/images/icons/iconamoon_profile.png"
                alt="NIC Verification Icon"
                className="h-8 w-8 object-contain"
              />
              <div>
                <p className="font-semibold">Your Photo with NIC :</p>
                <p className="flex items-center gap-2 text-sm text-black">
                  Not Verified <CircleX color="#fa0000" size={18} />
                </p>

                <p className="mt-2 text-xs text-red-500">
                  *NIC will be verified within 24 hours of uploading.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={openSelfieModal}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 md:mt-0 md:w-auto"
            >
              Upload{' '}
              <span>
                <ArrowBigUp color="#050505" size={18} />
              </span>
            </button>
          </div>

          <div className="flex flex-col items-start justify-between border-b pb-4 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <img
                src="/images/icons/hugeicons_id.png"
                alt="NIC Verification Icon"
                className="h-8 w-8 object-contain"
              />
              <div>
                <p className="font-semibold">NIC Front Side :</p>
                <p className="flex items-center gap-2 text-sm text-black">
                  Not Verified <CircleX color="#fa0000" size={18} />
                </p>
                <p className="mt-2 text-xs text-red-500">
                  *NIC will be verified within 24 hours of uploading.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={openFrontModal}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 md:mt-0 md:w-auto"
            >
              Upload{' '}
              <span>
                <ArrowBigUp color="#050505" size={18} />
              </span>
            </button>
          </div>

          <div className="flex flex-col items-start justify-between border-b pb-4 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <img
                src="/images/icons/hugeicons_id.png"
                alt="NIC Verification Icon"
                className="h-8 w-8 object-contain"
              />
              <div>
                <p className="font-semibold">NIC Back Side :</p>
                <p className="flex items-center gap-2 text-sm text-black">
                  Not Verified <CircleX color="#fa0000" size={18} />
                </p>
                <p className="mt-2 text-xs text-red-500">
                  *NIC will be verified within 24 hours of uploading.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={openBackModal}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 md:mt-0 md:w-auto"
            >
              Upload{' '}
              <span>
                <ArrowBigUp color="#050505" size={18} />
              </span>
            </button>
          </div>

          <div className="flex items-start justify-between border-b pb-4">
            <div className="flex items-center gap-4">
              <img
                src="images/icons/radix-icons_mobile.png"
                alt="Mobile Verification Icon"
                className="h-8 w-8 object-contain"
              />
              <div>
                <p className="font-semibold">
                  Mobile : <span className="text-gray-700">076754523</span>
                </p>
                <p className="flex items-center gap-2 text-sm text-black">
                  Verified <CircleCheckBig color="#04b910" size={20} />
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center justify-between md:flex-row">
          <p className="text-xs text-red-500">
            Please upload all the required documents and press submit to verify
            your information with EOE.LK.
          </p>
          <button
            onClick={handleSubmit}
            className="mt-4 w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black outline outline-1 outline-[#3F3F3F] md:mt-0 md:w-auto"
          >
            Submit
          </button>
        </div>
      </div>

      {isSelfieModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className="w-96 rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold">Upload Your Selfie</h3>
            <input
              type="file"
              accept="image/*"
              className="mt-4 block w-full rounded-lg border border-gray-300 p-2 text-sm"
              onChange={(e) => handleImageUpload(e, 'nic_with_image')}
            />
            {nicWithImagePreview && (
              <div className="mt-4">
                <img
                  src={nicWithImagePreview}
                  alt="Nic With Image Preview "
                  className="h-32 w-32 rounded-lg object-cover"
                />
              </div>
            )}
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={closeSelfieModal}
                className="rounded-lg bg-gray-400 px-4 py-2 text-sm text-white"
              >
                Cancel
              </button>
              <button className="rounded-lg bg-theme px-4 py-2 text-sm text-white">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {isFrontModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className="w-96 rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold">
              Upload Your NIC Front Side
            </h3>
            <input
              type="file"
              accept="image/*"
              className="mt-4 block w-full rounded-lg border border-gray-300 p-2 text-sm"
              onChange={(e) => handleImageUpload(e, 'nic_front')}
            />
            {nicFrontPreview && (
              <div className="mt-4">
                <img
                  src={nicFrontPreview}
                  alt="Front NIC Preview"
                  className="h-32 w-32 rounded-lg object-cover"
                />
              </div>
            )}
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={closeFrontModal}
                className="rounded-lg bg-gray-400 px-4 py-2 text-sm text-white"
              >
                Cancel
              </button>
              <button className="rounded-lg bg-theme px-4 py-2 text-sm text-white">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {isBackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className="w-96 rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold">Upload Your NIC Back Side</h3>
            <input
              type="file"
              accept="image/*"
              className="mt-4 block w-full rounded-lg border border-gray-300 p-2 text-sm"
              onChange={(e) => handleImageUpload(e, 'nic_back')}
            />
            {nicBackPreview && (
              <div className="mt-4">
                <img
                  src={nicBackPreview}
                  alt="Back NIC Preview"
                  className="h-32 w-32 rounded-lg object-cover"
                />
              </div>
            )}
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={closeBackModal}
                className="rounded-lg bg-gray-400 px-4 py-2 text-sm text-white"
              >
                Cancel
              </button>
              <button className="rounded-lg bg-theme px-4 py-2 text-sm text-white">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EverestId;
