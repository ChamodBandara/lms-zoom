import { useState, useEffect } from 'react';
import Headingbar from '../../../../Components/headingbar/headingbar';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import axios from 'axios';
import { toast } from 'react-toastify';

function PackTuteRequestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRequestedTute, setHasRequestedTute] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    nic: '',
    email: '',
    number: '',
    home_no: '',
    address_1: '',
    address_2: '',
    city: '',
    zip: '',
    special_requirements: '',
    pack_id: id,
  });

  const [errors, setErrors] = useState({
    first_name: '',
    last_name: '',
    nic: '',
    email: '',
    number: '',
    home_no: '',
    address_1: '',
    address_2: '',
    city: '',
    zip: '',
  });

  const [isPopupVisible, setIsPopupVisible] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await api.get('/profile', {
          params: { teacher_id: id },
        });

        const profileData = response.data.data;
        setFormData((prev) => ({
          ...prev,
          first_name: profileData.first_name || prev.first_name,
          last_name: profileData.last_name || prev.last_name,
          nic: profileData.nic || prev.nic,
          number: profileData.mobile_contact_number || prev.number,
          // address: profileData.address || prev.address,
          city: profileData.district || prev.city, // Map district to city
          zip: profileData.postal_code || prev.zip,
          email: profileData.email || prev.email,
        }));
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const checkTuteRequestStatus = async () => {
      try {
        const response = await api.get('/get_pack_details', {
          params: { pack_id: id },
        });

        console.log('Response from API: ', response.data); // Debugging log

        const details = response.data?.data?.details;
        if (details?.hasRequestedTute) {
          setHasRequestedTute(true); // ✅ Ensure button disables if already requested
        }
      } catch (error) {
        console.error('Error checking tute request status:', error);
      }
    };

    fetchProfileData();
    checkTuteRequestStatus();
  }, [id]);

  // const validate = () => {
  //   let tempErrors: any = {};
  //   let isValid = true;

  //   Object.keys(formData).forEach((key) => {
  //     // Skip validation for zip code since it is not required
  //     if (key !== 'zip' && formData[key as keyof typeof formData] === '') {
  //       tempErrors[key] =
  //         `${key.charAt(0).toUpperCase() + key.slice(1)} is required.`;
  //       isValid = false;
  //     } else {
  //       tempErrors[key] = '';
  //     }
  //   });

  //   if (!formData.email.includes('@')) {
  //     tempErrors.email = 'Please enter a valid email address.';
  //     isValid = false;
  //   }

  //   if (formData.number && !/^\d+$/.test(formData.number)) {
  //     tempErrors.number = 'Please enter a valid phone number.';
  //     isValid = false;
  //   }

  //   setErrors(tempErrors);
  //   return isValid;
  // };

  const validate = () => {
    let tempErrors: any = {};
    let isValid = true;

    // Required fields (excluding email and zip)
    const requiredFields = [
      'first_name',
      'last_name',
      'nic',
      'number',
      'home_no',
      'address_1',
      'address_2',
      'city',
    ];
    requiredFields.forEach((key) => {
      if (!formData[key as keyof typeof formData]) {
        tempErrors[key] = `${key.replace('_', ' ')} is required.`;
        isValid = false;
      }
    });

    // Email validation (only if provided)
    if (formData.email && !formData.email.includes('@')) {
      tempErrors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    // Phone number validation
    if (formData.number && !/^\d+$/.test(formData.number)) {
      tempErrors.number = 'Please enter a valid phone number.';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      setIsSubmitting(true); // ✅ Disable button while submitting

      try {
        const response = await api.post('/submit_tute_pack', formData);
        console.log('Form submission response:', response.data);

        if (response.status === 200 || response.status === 201) {
          toast.success(response.data.message);
          setHasRequestedTute(true); // ✅ Prevent future submissions
          navigate(`/single-pack/${id}`);
        }
      } catch (error) {
        setIsSubmitting(false); // Re-enable button if submission fails

        if (axios.isAxiosError(error)) {
          const errorMessage =
            error.response?.data?.message || 'Server error occurred';
          if (error.response?.data?.hasRequestedTute) {
            setHasRequestedTute(true); // ✅ If API confirms request exists, disable button
          }
          toast.error(errorMessage);
        } else {
          toast.error('An unexpected error occurred');
        }
      }
    }
  };

  const closePopup = () => {
    setIsPopupVisible(false);
  };

  return (
    <div className="flex flex-col p-2 lg:ml-64">
      <div className="flex flex-col gap-5">
        <Headingbar title="Tute Request" />
        <form
          className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow"
          onSubmit={handleSubmit}
        >
          <span className="font-medium text-red-500">
            <li>
              නිබන්ධන නිවසට තැපැල් කිරීම සිදුවන්නේ මෙහි සදහන් ලිපිනයට බැවින්
              නිවැරදිව ලිපිනය ඇතුලත් කරන්න.<br></br>{' '}
              <span className="ml-5">
                (We send your tutes to the address you have provided. Please
                enter the correct address)
              </span>
            </li>
            <li className="mt-2">
              කරුණාකර උදාහරණයේ ඇති පරිදි ලිපින රේඛා පුරවන්න.
              <br></br>{' '}
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
                htmlFor="phone"
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
            <div>
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Home No <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-gray-500">(eg:- 12/3A)</span>
              </label>
              <input
                type="text"
                id=""
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
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Address Line 1<span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-gray-500">
                  (eg:- Maradana Road)
                </span>
              </label>
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
            <div>
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Address Line 2<span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-gray-500">
                  (eg:- Mahabage Ragama)
                </span>
              </label>
              <input
                type="text"
                id="address_2"
                name="address_2"
                placeholder="Enter your address Line 2"
                value={formData.address_2}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-theme focus:outline-none focus:ring-theme"
                required
              />
              {errors.address_2 && (
                <p className="text-sm text-red-500">{errors.address_2}</p>
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
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-theme focus:outline-none focus:ring-theme"
            ></textarea>
          </div>
          {/* <div>
              <label
                htmlFor="special_requirements"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Select Month
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
            className={`mt-4 w-full rounded-md py-2 text-sm text-white sm:w-1/2 ${
              isSubmitting || hasRequestedTute
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-theme'
            }`}
            disabled={isSubmitting || hasRequestedTute} // ✅ Button now properly disables
          >
            {hasRequestedTute
              ? 'Tute Requested'
              : isSubmitting
                ? 'Submitting...'
                : 'Submit'}
          </button>
        </form>
      </div>

      {isPopupVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="rounded-lg bg-white p-8">
            <h2 className="text-xl">Form Submitted Successfully</h2>
            <p>Thank you for your request. We will contact you shortly.</p>
            <button
              onClick={closePopup}
              className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PackTuteRequestPage;
