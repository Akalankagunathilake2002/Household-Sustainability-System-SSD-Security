import React from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';


const AuthLayout = ({ children, title, subtitle, linkText, linkPath, linkActionText }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-screen bg-off-white overflow-hidden">
            {/* Image Side */}
            <div className="hidden lg:block relative bg-[url('https://images.unsplash.com/photo-1473081556163-2a17de81fc97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80')] bg-cover bg-center">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-forest-dark/90 to-primary-teal/70 flex flex-col justify-between p-12 text-white">
                    <Link to="/" className="flex items-center gap-3 text-white text-2xl font-bold">
                        <Leaf size={32} />
                        <span>EcoPulse</span>
                    </Link>
                    <div className="max-w-[500px]">
                        <h2 className="text-3xl font-semibold leading-tight mb-4 text-white">"The greatest threat to our planet is the belief that someone else will save it."</h2>
                        <p className="text-lg opacity-80">- Robert Swan</p>
                    </div>
                </div>
            </div>

            {/* Form Side */}
            <div className="flex items-center justify-center p-6 md:p-10 bg-off-white overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-[440px] bg-white p-8 md:p-12 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
                >
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold mb-2">{title}</h1>
                        <p className="text-text-muted">{subtitle}</p>
                    </div>

                    {children}

                    <div className="mt-8 text-center text-sm text-text-muted">
                        <p>
                            {linkText} <Link to={linkPath} className="text-primary-teal font-semibold">{linkActionText}</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthLayout;
