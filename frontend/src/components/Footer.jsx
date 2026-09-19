import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-border pt-16 pb-8 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    {/* Brand Column */}
                    <div>
                        <Link to="/" className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-teal to-forest-dark rounded-xl flex items-center justify-center text-white shadow-md">
                                <Leaf size={24} />
                            </div>
                            <span className="text-2xl font-bold text-forest-dark tracking-tight">EcoPulse</span>
                        </Link>
                        <p className="text-text-muted leading-relaxed mb-6">
                            Empowering households to reduce their carbon footprint and live sustainably through data-driven insights and actionable tips.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-off-white flex items-center justify-center text-text-muted hover:bg-primary-teal hover:text-white transition-colors">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-off-white flex items-center justify-center text-text-muted hover:bg-primary-teal hover:text-white transition-colors">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-off-white flex items-center justify-center text-text-muted hover:bg-primary-teal hover:text-white transition-colors">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Link 1 */}
                    <div>
                        <h4 className="font-bold text-text-main mb-6">Platform</h4>
                        <ul className="space-y-4">
                            <li><Link to="/about" className="text-text-muted hover:text-primary-teal transition-colors">About Us</Link></li>
                            <li><Link to="/features" className="text-text-muted hover:text-primary-teal transition-colors">Features</Link></li>
                            <li><Link to="/pricing" className="text-text-muted hover:text-primary-teal transition-colors">Pricing</Link></li>
                            <li><Link to="/blog" className="text-text-muted hover:text-primary-teal transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Quick Link 2 */}
                    <div>
                        <h4 className="font-bold text-text-main mb-6">Resources</h4>
                        <ul className="space-y-4">
                            <li><Link to="/help" className="text-text-muted hover:text-primary-teal transition-colors">Help Center</Link></li>
                            <li><Link to="/privacy" className="text-text-muted hover:text-primary-teal transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="text-text-muted hover:text-primary-teal transition-colors">Terms of Service</Link></li>
                            <li><Link to="/contact" className="text-text-muted hover:text-primary-teal transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-bold text-text-main mb-6">Stay Updated</h4>
                        <p className="text-text-muted mb-4">Join our newsletter for the latest sustainability tips and news.</p>
                        <form className="flex flex-col gap-3">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full pl-10 pr-4 py-3 bg-off-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-teal/50 transition-all"
                                />
                            </div>
                            <button className="bg-forest-dark text-white font-semibold py-3 rounded-xl hover:bg-deep-eco transition-colors shadow-md">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-muted">
                    <p>&copy; {new Date().getFullYear()} EcoPulse. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="hover:text-primary-teal">Privacy</Link>
                        <Link to="/terms" className="hover:text-primary-teal">Terms</Link>
                        <Link to="/cookies" className="hover:text-primary-teal">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
