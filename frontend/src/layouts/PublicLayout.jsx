import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';

const PublicLayout = () => {
    return (
        <div className="flex flex-col min-h-[calc(100vh-88px)]">
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
