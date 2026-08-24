// import Sidebar from '../../Components/Sidebar/page';
import { ReactNode, useState } from 'react';
import Notifications from "../../Components/notification/notifiactionservice";
// import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-[#efefef]">
      {/* Sidebar */}
      {/* <aside
        id="sidebar-multi-level-sidebar"
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white transition-transform transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } sm:translate-x-0 shadow-md`}
        aria-label="Sidebar"
      >
        <Sidebar />
      </aside> */}
      <Notifications />
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto  ">
        {/* Mobile toggle button */}
        {/* <button
          onClick={toggleSidebar}
          aria-controls="sidebar-multi-level-sidebar"
          aria-expanded={isSidebarOpen}
          className="sm:hidden m-3 mt-2 inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        >
          <span className="sr-only">Open sidebar</span>
          <Menu size={30}/>
        </button> */}

     
        {/* <main className="flex-1 p-2 bg-[#25222b]">{children}</main> */}

        <main
  className="flex-1 p-2 bg-[#25222b]"
  onDragStart={(e) => e.preventDefault()}
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => e.preventDefault()}
>
  {children}
</main>

      </div>

   
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black opacity-50 sm:hidden"
        ></div>
      )}
    </div>
  );
};

export default DashboardLayout;
