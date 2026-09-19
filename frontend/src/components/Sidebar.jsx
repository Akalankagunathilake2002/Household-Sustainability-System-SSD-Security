import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  User,
  ShieldCheck,
  Recycle,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Calendar as CalendarIcon,
  Store, 
  ShoppingBag,
  Users,
  BookOpen
} from 'lucide-react';
import { ROLES } from '../utils/roles';
import ConfirmModal from './ConfirmModal';

const Sidebar = ({ isAdmin = false, isOpen = true, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
    setShowLogoutConfirm(false);
  };

  const userMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Audits', path: '/audits', icon: <FileText size={20} /> },
    { name: 'Waste Mgmt', path: '/waste', icon: <Recycle size={20} /> },

    { name: 'My Marketplace', path: '/my-marketplace', icon: <ShoppingBag size={20} /> },

    { name: 'Disaster Alerts', path: '/disasters', icon: <AlertTriangle size={20} /> },
    { name: 'Calendar', path: '/calendar', icon: <CalendarIcon size={20} /> },

    // ✅ NEW: User support center
    { name: 'Support Center', path: '/issues', icon: <AlertCircle size={20} /> },

    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
  ];

  const adminMenuItems = [
    { name: 'Admin Overview', path: '/admin', icon: <ShieldCheck size={20} /> },
    { name: 'Audit Logs', path: '/admin/audits', icon: <FileText size={20} /> },
    { name: 'Waste Requests', path: '/admin/waste', icon: <Recycle size={20} /> },

    { name: 'Disaster Mgmt', path: '/admin/disasters', icon: <AlertTriangle size={20} /> },
    { name: 'Collection Calendar', path: '/calendar', icon: <CalendarIcon size={20} /> },
    { name: 'Manage Issues', path: '/admin/issues', icon: <AlertCircle size={20} /> },

    { name: 'Manage Articles', path: '/admin/articles', icon: <BookOpen size={20} /> },
    { name: 'Manage Actions', path: '/admin/actions', icon: <Users size={20} /> },
    
    { name: 'Marketplace Mgmt', path: '/admin/marketplace', icon: <Store size={20} /> },

    { name: 'Score Mgmt', path: '/admin/scoring', icon: <Settings size={20} /> }, // Changed icon to Settings
  ];

  // ✅ NEW: Collector-specific menu items
  const collectorMenuItems = [
    { name: 'Collector Home', path: '/collector/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Collection Calendar', path: '/calendar', icon: <CalendarIcon size={20} /> },
  ];

  let menuItems = userMenuItems;
  if (user?.role === ROLES.ADMIN) {
    menuItems = adminMenuItems;
  } else if (user?.role === ROLES.COLLECTOR) {
    menuItems = collectorMenuItems;
  }

  return (
    <aside
      className={`hidden md:flex fixed left-0 top-[88px] z-40 h-[calc(100vh-88px)] bg-forest-dark text-white flex-col transition-all duration-300 shadow-xl ${isOpen ? 'md:w-[260px]' : 'md:w-[80px]'
        }`}
    >
      {/* Toggle Button (Desktop Only) */}
      <button
        onClick={toggleSidebar}
        className="hidden md:flex absolute -right-3 top-6 bg-white text-forest-dark rounded-full p-1 shadow-md border border-gray-200 hover:bg-gray-100 transition-colors z-50"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <nav className="flex-1 py-6 px-3 flex flex-col gap-2 items-center md:items-stretch overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-3 md:px-4 md:py-3.5 rounded-xl font-medium transition-all w-full overflow-hidden whitespace-nowrap ${location.pathname === item.path
              ? 'bg-primary-teal text-white shadow-lg shadow-primary-teal/20'
              : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            title={item.name}
          >
            <div className="min-w-[20px]">{item.icon}</div>
            <span
              className={`hidden md:block transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'
                }`}
            >
              {item.name}
            </span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 flex justify-center md:justify-start">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 md:px-4 md:py-3.5 rounded-xl font-medium text-white/70 hover:text-red-400 hover:bg-red-400/10 transition-all w-full"
        >
          <div className="min-w-[20px]">
            <LogOut size={20} />
          </div>
          <span
            className={`hidden md:block transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'
              }`}
          >
            Logout
          </span>
        </button>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        confirmText="Logout"
        type="danger"
      />
    </aside>
  );
};

export default Sidebar;
