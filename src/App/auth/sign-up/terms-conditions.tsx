import { SquareArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function TermsConditions() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-100 p-6 font-sans">
      <div className="w-full max-w-xl rounded-lg bg-white p-8 shadow-md lg:w-1/2 lg:max-w-none lg:p-12">
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
          <button
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
            onClick={() => navigate(-1)}
          >
            <div className="flex items-center space-x-2">
              <SquareArrowLeft className="mr-2" /> Back
            </div>
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">
            Terms and Conditions
          </h2>
        </div>
        <div className="prose lg:prose-xl">
          <h2 className="mb-2 text-lg font-bold">1. Introduction</h2>
          <p>
            Welcome to Everest Online Education. By accessing or using our
            services, you agree to comply with and be bound by the following
            terms and conditions ("Terms"). Please read them carefully.
          </p>

          <h2 className="mb-2 mt-2 text-lg font-bold">
            2. Account Registration
          </h2>
          <p>
            To access certain features, you may need to create an account. You
            agree to provide accurate and complete information and to keep your
            account credentials confidential. You are responsible for all
            activities under your account.
          </p>

          <h2 className="mb-2 mt-2 text-lg font-bold">3. Services Offered</h2>
          <p>
            We provide online educational content, including courses, tutorials,
            and related materials. We reserve the right to modify or discontinue
            any part of our services without prior notice.
          </p>

          <h2 className="mb-2 mt-2 text-lg font-bold">4. User Conduct</h2>
          <p>
            You agree not to use our services for any unlawful purpose or in a
            way that could harm others. Harassment, discrimination, and
            inappropriate behavior are strictly prohibited.
          </p>

          <h2 className="mb-2 mt-2 text-lg font-bold">
            5. Payment and Refunds
          </h2>
          <p>
            Payments for courses or services must be made in full at the time of
            purchase. Refund policies are outlined separately and are subject to
            change.
          </p>

          <h2 className="mb-2 mt-2 text-lg font-bold">
            6. Intellectual Property
          </h2>
          <p>
            All content provided is the intellectual property of Everest Online
            Education or its licensors and is protected by applicable laws.
            Unauthorized use, reproduction, or distribution is prohibited.
          </p>

          <h2 className="mb-2 mt-2 text-lg font-bold">7. Privacy Policy</h2>
          <p>
            Your privacy is important to us. Please refer to our Privacy Policy
            for information on how we collect, use, and protect your data.
          </p>

          <h2 className="mb-2 mt-2 text-lg font-bold">
            8. Limitation of Liability
          </h2>
          <p>
            We are not liable for any indirect, incidental, or consequential
            damages arising from your use of our services. Our total liability
            is limited to the amount you have paid us for services.
          </p>

          <h2 className="mb-2 mt-2 text-lg font-bold">9. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account if you
            violate these Terms or engage in conduct that we deem harmful to our
            community or services.
          </p>

          {/* <p className="mt-6 text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </p> */}
        </div>
      </div>
      <div className="relative hidden w-1/2 lg:block">
        <img
          src="images/Banner.jpg"
          alt="Login"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/images/logo-white.png"
            alt="Logo"
            className="h-auto w-72"
          />
        </div>
      </div>
    </div>
  );
}

export default TermsConditions;
