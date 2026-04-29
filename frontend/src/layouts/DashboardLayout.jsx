import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { useState } from 'react';

const DashboardLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
        {/* pb-20 = bottom padding so content isn't hidden under the tab bar on mobile */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto animate-fade-in pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
