import { SquareArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function PrivacyPolicy() {
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
            Privacy Policy
          </h2>
        </div>
        <div className="prose lg:prose-xl">
          <p>
            Thank you for using eoe app ("we," "our," or "us"). Your privacy is
            important to us, and we are committed to protecting your personal
            data. This Privacy Policy explains how we collect, use, and protect
            your information when you use our mobile application.
          </p>

          <div className="mt-4">
            <h2 className="mb-2 text-lg font-bold">
              1. Information We Collect
            </h2>
            <div className="mb-4">
              <h3 className="text-md mb-1 font-semibold">
                a. Personal Information
              </h3>
              <ul className="list-inside list-disc">
                <li>Name</li>
                <li>Email address</li>
                <li>Contact details</li>
                <li>Phone Number</li>
                <li>Profile information</li>
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="text-md mb-1 font-semibold">b. Usage Data</h3>
              <ul className="list-inside list-disc">
                <li>
                  Log data (e.g., app usage, crash reports, performance data)
                </li>
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="text-md mb-1 font-semibold">
                c. Course and Learning Data
              </h3>
              <ul className="list-inside list-disc">
                <li>Course progress</li>
                <li>Quiz results</li>
                <li>Certifications earned</li>
              </ul>
            </div>
          </div>

          <div className="mt-4">
            <h2 className="mb-2 text-lg font-bold">
              2. How We Use Your Information
            </h2>
            <ul className="list-inside list-disc">
              <li>Provide, maintain, and improve our LMS app</li>
              <li>Personalize your learning experience</li>
              <li>
                Communicate with you about updates, promotions, or customer
                support
              </li>
              <li>Analyze app performance and troubleshoot issues</li>
              <li>Comply with legal and regulatory requirements</li>
            </ul>
          </div>

          <div className="mt-4">
            <h2 className="mb-2 text-lg font-bold">
              3. Data Sharing and Disclosure
            </h2>
            <p>
              We do not sell or rent your personal data. However, we may share
              your information in the following cases:
            </p>
            <ul className="list-inside list-disc">
              <li>
                <strong>Service Providers:</strong> With trusted third-party
                vendors who help operate our app
              </li>
              <li>
                <strong>Legal Compliance:</strong> When required by law or to
                protect our rights
              </li>
              <li>
                <strong>Business Transfers:</strong> In case of a merger, sale,
                or acquisition
              </li>
            </ul>
          </div>

          <div className="mt-4">
            <h2 className="mb-2 text-lg font-bold">4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your
              data. However, no method of transmission over the internet is
              completely secure, and we cannot guarantee absolute security.
            </p>
          </div>

          <div className="mt-4">
            <h2 className="mb-2 text-lg font-bold">
              5. Your Rights and Choices
            </h2>
            <ul className="list-inside list-disc">
              <li>Access, update, or delete your personal data</li>
              <li>Opt-out of marketing communications</li>
              <li>Disable cookies through your device settings</li>
            </ul>
          </div>

          <div className="mt-4">
            <h2 className="mb-2 text-lg font-bold">6. Third-Party Links</h2>
            <p>
              Our app may contain links to third-party websites. We are not
              responsible for their privacy practices, so we recommend reviewing
              their privacy policies.
            </p>
          </div>

          <div className="mt-4">
            <h2 className="mb-2 text-lg font-bold">
              7. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this policy periodically. Any changes will be posted
              within the app, and we encourage you to review it regularly.
            </p>
          </div>

          <div className="mt-4">
            <h2 className="mb-2 text-lg font-bold">8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us.
            </p>
          </div>

          <p className="mt-6 text-gray-500">App Name - eoe</p>
          <p className="mt-2 font-semibold text-gray-700">
          Everest Online (Private) Limited
          </p>
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

export default PrivacyPolicy;
