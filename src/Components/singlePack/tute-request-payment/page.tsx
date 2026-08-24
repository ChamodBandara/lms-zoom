import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import api from '../../../services/api';

interface TuteRequestFormData {
  first_name: string;
  last_name: string;
  nic: string;
  email: string;
  number: string;
  address_1: string;
  city: string;
  zip: string;
  special_requirements: string;
  home_no: string;
  address_2: string;
  class_id: string | undefined;
}

interface TuteRequestErrors {
  home_no: string;
  address_2: string;
  first_name: string;
  last_name: string;
  nic: string;
  email: string;
  number: string;
  address_1: string;
  city: string;
  zip: string;
}

interface TuteRequestModalProps {
  classId: any | undefined;
  onClose: () => void;
  onSubmitData: (data: TuteRequestFormData) => void;
}

const TuteRequestModal: React.FC<TuteRequestModalProps> = ({
  classId,
  onClose,
  onSubmitData,
}) => {
  const [] = useState<boolean>(false);
  const [hasRequestedTute] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<TuteRequestFormData>({
    first_name: '',
    last_name: '',
    nic: '',
    email: '',
    number: '',
    address_1: '',
    city: '',
    zip: '',
    special_requirements: '',
    home_no: '',
    address_2: '',
    class_id: classId,
  });

  const [errors, setErrors] = useState<TuteRequestErrors>({
    first_name: '',
    last_name: '',
    nic: '',
    email: '',
    number: '',
    address_1: '',
    address_2: '',
    home_no: '',
    city: '',
    zip: '',
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await api.get('/profile', {
          params: { teacher_id: classId },
        });
        const profileData = response.data.data;
        setFormData((prev) => ({
          ...prev,
          first_name: profileData.first_name || prev.first_name,
          last_name: profileData.last_name || prev.last_name,
          nic: profileData.nic || prev.nic,
          number: profileData.mobile_contact_number || prev.number,
          city: profileData.district || prev.city,
          zip: profileData.postal_code || prev.zip,
          email: profileData.email || prev.email,
          address_1: profileData.address || prev.address_1,
        }));
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, [classId]);

  const validate = (): boolean => {
    let tempErrors: Partial<TuteRequestErrors> = {};
    let isValid = true;

    // Required fields based on backend rules.
    const requiredFields: (keyof TuteRequestErrors)[] = [
      'first_name',
      'last_name',
      'nic',
      'number',
      'address_1',
      'city',
    ];
    requiredFields.forEach((key) => {
      if (!formData[key as keyof TuteRequestFormData]) {
        tempErrors[key] = `${key.replace('_', ' ')} is required.`;
        isValid = false;
      }
    });

    // Validate NIC: length and regex check.
    if (formData.nic) {
      if (formData.nic.length > 12) {
        tempErrors.nic = 'NIC should not exceed 12 characters.';
        isValid = false;
      }
      const nicRegex = /^\d{9}[VX]$|^\d{12}$/;
      if (!nicRegex.test(formData.nic)) {
        tempErrors.nic =
          "NIC must be 9 digits followed by 'V' or 'X', or 12 digits.";
        isValid = false;
      }
    }

    // Validate email if provided.
    if (formData.email) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(formData.email)) {
        tempErrors.email = 'Please enter a valid email address.';
        isValid = false;
      }
    }

    // Validate phone number: ensure only digits.
    if (formData.number && !/^\d+$/.test(formData.number)) {
      tempErrors.number = 'Please enter a valid phone number.';
      isValid = false;
    }

    setErrors(tempErrors as TuteRequestErrors);
    return isValid;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateAddress = (address: string): string | null => {
    const rawParts = address.split(',');
    const parts = rawParts.map((part) => part.trim()).filter(Boolean);

    if (rawParts.some((part) => part.trim() === '')) {
      return 'Address contains an empty part — check for misplaced or extra commas (e.g., near position 2 or more).';
    }

    if (parts.length < 2) {
      return 'Address must contain at least two parts separated by a comma (e.g., "Street, City").';
    }

    if (parts.some((part) => part.length < 1)) {
      return 'Each part of the address must have at least 2 characters — check for short entries near commas.';
    }
    const specialCharRegex = /[^a-zA-Z0-9\s,/]/;
    if (parts.some((part) => specialCharRegex.test(part))) {
      return 'Address parts can only contain letters, numbers, spaces, commas, and forward slashes — check for invalid characters.';
    }

    return null; // valid
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      //setIsSubmitting(true);
      const addressError = validateAddress(formData.address_1);
      if (addressError) {
        setError(addressError);
        return;
      }

      onSubmitData(formData);
      onClose();

      // try {
      //   const response = await api.post('/submit_tute', formData);
      //   if (response.status === 200 || response.status === 201) {
      //     toast.success(response.data.message);
      //     setHasRequestedTute(true);
      //     // Pass formData to PaymentComponent (storing in an array)
      //     onSubmitData(formData);
      //     onClose();
      //   }
      // } catch (error) {
      //   setIsSubmitting(false);
      //   if (axios.isAxiosError(error)) {
      //     const errorMessage = error.response?.data?.message || 'Server error occurred';
      //     if (error.response?.data?.hasRequestedTute) {
      //       setHasRequestedTute(true);
      //     }
      //     toast.error(errorMessage);
      //   } else {
      //     toast.error('An unexpected error occurred');
      //   }
      // }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="max-h-full w-11/12 max-w-3xl overflow-y-auto rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tute Request</h2>
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-gray-900"
          >
            X
          </button>
        </div>
        <form
          className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow"
          onSubmit={handleSubmit}
        >
          <span className="font-medium text-red-500">
            <li>
              නිබන්ධන නිවසට තැපැල් කිරීම සිදුවන්නේ මෙහි සදහන් ලිපිනයට බැවින්
              නිවැරදිව ලිපිනය ඇතුලත් කරන්න.
              <br />
              <span className="ml-5">
                (We send your tutes to the address you have provided. Please
                enter the correct address)
              </span>
            </li>
            <li className="mt-2">
              කරුණාකර උදාහරණයේ ඇති පරිදි ලිපින රේඛා පුරවන්න.
              <br />
              <span className="ml-5">
                (Please fill the address lines as in the given example)
              </span>
            </li>
          </span>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="first_name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                placeholder="Enter your first name"
                value={formData.first_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-theme focus:outline-none focus:ring-theme"
                required
              />
              {errors.first_name && (
                <p className="text-sm text-red-500">{errors.first_name}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="last_name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                placeholder="Enter your last name"
                value={formData.last_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-theme focus:outline-none focus:ring-theme"
                required
              />
              {errors.last_name && (
                <p className="text-sm text-red-500">{errors.last_name}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="nic"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                NIC <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nic"
                name="nic"
                placeholder="Enter your NIC number"
                value={formData.nic}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-theme focus:outline-none focus:ring-theme"
                required
              />
              {errors.nic && (
                <p className="text-sm text-red-500">{errors.nic}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-theme focus:outline-none focus:ring-theme"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="number"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="number"
                name="number"
                placeholder="Enter your phone number"
                value={formData.number}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-theme focus:outline-none focus:ring-theme"
                required
              />
              {errors.number && (
                <p className="text-sm text-red-500">{errors.number}</p>
              )}
            </div>
            {/* <div>
              <label
                htmlFor="home_no"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Home No <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-gray-500">(eg:- 12/3A)</span>
              </label>
              <input
                type="text"
                id="home_no"
                name="home_no"
                placeholder="Enter your home no"
                value={formData.home_no}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-theme focus:outline-none focus:ring-theme"
                required
              />
              {errors.home_no && (
                <p className="text-sm text-red-500">{errors.home_no}</p>
              )}
            </div> */}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
            <div>
              <div className="mb-2 flex flex-col">
                <label
                  htmlFor="address_1"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Address Line 1 <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs text-gray-500">
                    (eg:- Maradana Road , Colombo)
                  </span>
                </label>
                {error && <span className="text-xs text-red-500">{error}</span>}
              </div>
              <input
                type="text"
                id="address_1"
                name="address_1"
                placeholder="Enter your address line 1"
                value={formData.address_1}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-theme focus:outline-none focus:ring-theme"
                required
              />
              {errors.address_1 && (
                <p className="text-sm text-red-500">{errors.address_1}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="city"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                City/District <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="Enter your city or district"
                value={formData.city}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-theme focus:outline-none focus:ring-theme"
                required
              />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="zip"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Postal Code
              </label>
              <input
                type="text"
                id="zip"
                name="zip"
                placeholder="Enter your postal code"
                value={formData.zip}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-theme focus:outline-none focus:ring-theme"
              />
              {errors.zip && (
                <p className="text-sm text-red-500">{errors.zip}</p>
              )}
            </div>
          </div>
          <div>
            <label
              htmlFor="special_requirements"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Special Requests
            </label>
            <textarea
              id="special_requirements"
              name="special_requirements"
              placeholder="Enter any special requests"
              value={formData.special_requirements}
              onChange={handleChange}
              maxLength={40}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-theme focus:outline-none focus:ring-theme"
            ></textarea>
          </div>

          {/* <div>
            <label
              htmlFor="special_requirements"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Special Requests
            </label>
            <select
              id="special_requirements"
              name="special_requirements"
              value={formData.special_requirements}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-theme focus:outline-none focus:ring-theme"
            >
              <option value="" disabled>Select a month</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
          </div> */}

          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-theme py-2 text-sm text-white sm:w-1/2"
          >
            {hasRequestedTute ? 'Tute Requested' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TuteRequestModal;
