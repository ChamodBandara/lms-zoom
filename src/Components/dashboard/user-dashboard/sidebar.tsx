import { 
  Banknote,
  BellRing, 
  BookMarked, 
  BookOpenText, 
 
  CreditCard, 
  House, 
  IdCard, 
  Landmark, 
  NotebookPen, 
  Ribbon, 
  UserPen, 
  Video, 
  Youtube
} from 'lucide-react';
// import React from 'react';

function UserDashboard() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
    
      <aside
        id="logo-sidebar"
        className="fixed top-0 left-0 z-40 w-64 h-full bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700"
        aria-label="Sidebar"
      >
        <div className="h-full px-3 pb-4 overflow-y-auto">
          <div className="p-5 w-40 h-18 flex items-center justify-center">
            <img
              src="images/logo.jpg"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <House />
                <span className="ml-3">Dashboard</span>
              </a>
            </li>
            <li className="mt-4 text-gray-500 dark:text-gray-400 font-semibold">
              My Profile
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <UserPen />
                <span className="ml-3">My Profile</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <IdCard />
                <span className="ml-3">Everest ID</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <BellRing />
                <span className="ml-3">My Notifications</span>
              </a>
            </li>

            <li className="mt-5 text-gray-500 dark:text-gray-400 font-semibold">
              Classes
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Video />
                <span className="ml-3">Live Classes</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <BookMarked />
                <span className="ml-3">Ongoing Classes</span>
              </a>
            </li>
            {/* <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ClockArrowUp />
                <span className="ml-3">Past Lessons</span>
              </a>
            </li> */}
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <BookOpenText />
                <span className="ml-3">Study Rolls</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <NotebookPen />
                <span className="ml-3">Tute Catching</span>
              </a>
            </li>
            <li className="mt-4 text-gray-500 dark:text-gray-400 font-semibold">
              Performance
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Ribbon />
                <span className="ml-3">My Performance</span>
              </a>
            </li>

            <li className="mt-4 text-gray-500 dark:text-gray-400 font-semibold">
              Purchase
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Landmark />
                <span className="ml-3">Bank Details</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Banknote />
                <span className="ml-3">Purchase Class</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <CreditCard />
                <span className="ml-3">Purchase Study Pack</span>
              </a>
            </li>
            <li className="mt-4 text-gray-500 dark:text-gray-400 font-semibold">
              Purchase
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Landmark />
                <span className="ml-3">My Payments</span>
              </a>
            </li>
            <li className="mt-4 text-gray-500 dark:text-gray-400 font-semibold">
              Support
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Landmark />
                <span className="ml-3">Telegram</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Landmark />
                <span className="ml-3">Tiktok</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Youtube />
                <span className="ml-3">Youtube</span>
              </a>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6">
        <header className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800">
            Add New
          </button>
        </header>

        <section className="mt-6">
          {/* Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
              <h2 className="text-xl font-medium">Sales</h2>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Total: <strong>$25,000</strong>
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
              <h2 className="text-xl font-medium">New Users</h2>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Total: <strong>120</strong>
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
              <h2 className="text-xl font-medium">Active Projects</h2>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Total: <strong>8</strong>
              </p>
            </div>
          </div>

          {/* Table Section */}
          <div className="mt-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-200 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b dark:border-gray-700">
                    <td className="px-4 py-2">John Doe</td>
                    <td className="px-4 py-2">Admin</td>
                    <td className="px-4 py-2">Active</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="px-4 py-2">Jane Smith</td>
                    <td className="px-4 py-2">Editor</td>
                    <td className="px-4 py-2">Pending</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Alice Johnson</td>
                    <td className="px-4 py-2">Viewer</td>
                    <td className="px-4 py-2">Inactive</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default UserDashboard;
