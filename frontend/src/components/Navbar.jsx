import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Leaf, Menu, X, User, LogIn, LogOut, ChevronDown, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';
import logoImg from '../assets/logo.png';


const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
        setShowProfileMenu(false);
    };

    const confirmLogout = () => {
        logout();
        navigate('/');
        setShowLogoutConfirm(false);
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Marketplace', path: '/marketplace' },
        { name: 'Community', path: '/actions' },
        { name: 'Articles', path: '/articles' },
    ];

    if (user?.role === 'admin') {
        navLinks.push({ name: 'Admin', path: '/admin' });
    }

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-3 bg-white/80 backdrop-blur-md border-b border-white/30 shadow-sm' : 'py-5 bg-transparent'}`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3 group border-none">
                    <img src={logoImg} alt="EcoPulse Logo" className="h-10 w-auto object-cover rounded-xl shadow-md transition-transform group-hover:scale-105" />
                    <span className="text-2xl font-bold text-forest-dark tracking-tight">EcoPulse</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <div className="flex gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`font-medium transition-colors relative ${location.pathname === link.path
                                    ? 'text-primary-teal after:content-[""] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-primary-teal after:rounded-full'
                                    : 'text-text-main hover:text-primary-teal'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center gap-6 border-l border-border pl-6">
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center gap-3 font-medium text-text-main hover:text-primary-teal transition-colors"
                                >
                                    <div className="w-9 h-9 bg-teal-soft-bg text-primary-teal rounded-full flex items-center justify-center font-bold">
                                        {user?.username?.charAt(0).toUpperCase() || <User size={18} />}
                                    </div>
                                    <span>{user?.username}</span>
                                    <ChevronDown size={16} />
                                </button>

                                {/* Dropdown Menu */}
                                <AnimatePresence>
                                    {showProfileMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-border overflow-hidden"
                                        >
                                            <div className="p-3 border-b border-border">
                                                <p className="text-sm font-semibold text-text-main">{user?.username}</p>
                                                <p className="text-xs text-text-muted truncate">{user?.email}</p>
                                            </div>
                                            <div className="p-2">
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-main hover:bg-off-white rounded-lg transition-colors"
                                                    onClick={() => setShowProfileMenu(false)}
                                                >
                                                    <User size={16} /> Profile
                                                </Link>
                                                <Link
                                                    to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-main hover:bg-off-white rounded-lg transition-colors"
                                                    onClick={() => setShowProfileMenu(false)}
                                                >
                                                    <User size={16} /> Dashboard
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <LogOut size={16} /> Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="font-medium text-text-muted hover:text-forest-dark transition-colors">
                                    Log in
                                </Link>
                                <Link to="/register" className="bg-forest-dark text-white px-6 py-2.5 rounded-full font-semibold shadow-md transition-all hover:bg-deep-eco hover:-translate-y-0.5 hover:shadow-lg">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden text-forest-dark p-2 hover:bg-off-white rounded-lg transition-colors" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Nav Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 top-[60px] md:hidden bg-white/95 backdrop-blur-xl z-[45] overflow-y-auto"
                    >
                        <div className="p-8 flex flex-col gap-6 min-h-[calc(100vh-60px)]">
                            <div className="flex flex-col gap-4">
                                <span className="text-xs font-bold text-text-muted uppercase tracking-widest pl-2">Navigation</span>
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center justify-between p-4 rounded-2xl text-lg font-bold transition-all ${
                                            location.pathname === link.path
                                                ? 'bg-primary-teal text-white shadow-lg'
                                                : 'text-text-main hover:bg-off-white'
                                        }`}
                                    >
                                        {link.name}
                                        <ArrowRight size={20} className={location.pathname === link.path ? 'opacity-100' : 'opacity-0'} />
                                    </Link>
                                ))}
                            </div>
                            
                            <div className="h-px bg-border my-2" />
                            
                            <div className="flex flex-col gap-4">
                                <span className="text-xs font-bold text-text-muted uppercase tracking-widest pl-2">Account</span>
                                {isAuthenticated ? (
                                    <>
                                        <div className="flex items-center gap-4 p-4 bg-teal-soft-bg rounded-2xl">
                                            <div className="w-12 h-12 bg-white text-primary-teal rounded-full flex items-center justify-center font-bold text-xl shadow-sm">
                                                {user?.username?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-bold text-text-main truncate">{user?.username}</p>
                                                <p className="text-sm text-text-muted truncate">{user?.email}</p>
                                            </div>
                                        </div>
                                        
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 p-4 text-lg font-bold text-text-main hover:bg-off-white rounded-2xl transition-all"
                                        >
                                            <User size={22} className="text-primary-teal" /> Profile
                                        </Link>
                                        
                                        <button
                                            onClick={() => { handleLogout(); setIsOpen(false); }}
                                            className="flex items-center gap-3 p-4 text-lg font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                                        >
                                            <LogOut size={22} /> Logout
                                        </button>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 mt-2">
                                        <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 p-4 text-lg font-bold text-text-main bg-off-white rounded-2xl transition-all">
                                            <LogIn size={20} /> Log in
                                        </Link>
                                        <Link to="/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 p-4 text-lg font-bold text-white bg-forest-dark rounded-2xl shadow-lg transition-all active:scale-95">
                                            Get Started
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={confirmLogout}
                title="Confirm Logout"
                message="Are you sure you want to log out of your account?"
                confirmText="Logout"
                type="danger"
            />
        </nav>
    );
};

export default Navbar;
