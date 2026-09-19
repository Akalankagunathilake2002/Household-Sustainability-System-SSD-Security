import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    FileText, 
    Recycle, 
    User, 
    ShieldCheck, 
    Calendar,
    Store
} from 'lucide-react';
import { ROLES } from '../utils/roles';

const BottomNav = () => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) return null;

    const userTabs = [
        { name: 'Home', path: '/dashboard', icon: <LayoutDashboard size={22} /> },
        { name: 'Audits', path: '/audits', icon: <FileText size={22} /> },
        { name: 'Waste', path: '/waste', icon: <Recycle size={22} /> },
        { name: 'Profile', path: '/profile', icon: <User size={22} /> },
    ];

    const adminTabs = [
        { name: 'Admin', path: '/admin', icon: <ShieldCheck size={22} /> },
        { name: 'Audits', path: '/admin/audits', icon: <FileText size={22} /> },
        { name: 'Waste', path: '/admin/waste', icon: <Recycle size={22} /> },
        { name: 'Market', path: '/admin/marketplace', icon: <Store size={22} /> },
    ];

    const collectorTabs = [
        { name: 'Home', path: '/collector/dashboard', icon: <LayoutDashboard size={22} /> },
        { name: 'Calendar', path: '/calendar', icon: <Calendar size={22} /> },
        { name: 'Profile', path: '/profile', icon: <User size={22} /> },
    ];

    let tabs = userTabs;
    if (user.role === ROLES.ADMIN) tabs = adminTabs;
    else if (user.role === ROLES.COLLECTOR) tabs = collectorTabs;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-border z-50 px-2 shadow-[0_-8px_30px_rgb(0,0,0,0.08)]">
            <div className="flex justify-around items-center h-20 max-w-md mx-auto">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    return (
                        <Link
                            key={tab.name}
                            to={tab.path}
                            className={`flex flex-col items-center justify-center gap-1.5 min-w-[64px] transition-all duration-300 ${
                                isActive ? 'text-primary-teal' : 'text-text-muted hover:text-text-main'
                            }`}
                        >
                            <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-teal-soft-bg scale-110 shadow-sm' : 'hover:bg-off-white'}`}>
                                {tab.icon}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                                {tab.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
