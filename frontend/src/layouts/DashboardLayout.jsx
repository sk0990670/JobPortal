import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const DashboardLayout = () => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto animate-fade-in">
        <Outlet />
      </main>
    </div>
  </div>
);

export default DashboardLayout;
