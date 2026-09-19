import React, { useState, useEffect } from 'react';
import { BookOpen, Search, ArrowRight, Eye, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/apiConfig';

const CATEGORIES = [
  "All",
  "Waste Reduction",
  "Energy Efficiency",
  "Water Conservation",
  "Sustainable DIY",
  "Eco Shopping",
];

const UserArticles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const res = await api.get(API_ENDPOINTS.ARTICLES);
            setArticles(res.data.articles || []);
        } catch (error) {
            console.error('Failed to fetch articles:', error);
            toast.error('Could not load articles. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredArticles = articles.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === "All" || a.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const categoriesList = CATEGORIES.filter(cat => cat === "All" || articles.some(a => a.category === cat));

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto min-h-screen pb-24 md:pb-12">
            {/* Header Section */}
            <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-forest-dark text-white rounded-[2rem] overflow-hidden p-8 md:p-12 shadow-xl"
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-teal/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-soft-yellow-bg/20 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium mb-4 border border-white/20">
                        <BookOpen size={16} /> Eco-Education
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                        Discover Sustainable Living
                    </h1>
                    <p className="text-base md:text-lg text-white/80 mb-6 md:mb-8 max-w-xl">
                        Explore our curated collection of articles on waste reduction, energy efficiency, and modern eco-friendly practices to power your green journey.
                    </p>
                    
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search topics and guides..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 md:py-4 bg-white text-text-main rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-teal transition-shadow text-sm md:text-base"
                        />
                    </div>
                </div>
            </motion.section>

            {/* Content Section */}
            <section className="flex flex-col gap-6">
                {/* Category Pills */}
                <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide py-2 px-1">
                    {categoriesList.map(category => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                                activeCategory === category 
                                ? 'bg-primary-teal text-white shadow-md shadow-primary-teal/20 -translate-y-0.5' 
                                : 'bg-white text-text-muted hover:bg-off-white shadow-sm border border-border/50 hover:border-border hover:shadow'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-primary-teal border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredArticles.length > 0 ? (
                    <motion.div 
                        layout 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        <AnimatePresence>
                            {filteredArticles.map((article, index) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={article._id}
                                    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-border/50 hover:border-primary-teal/30 transition-all duration-300 flex flex-col h-full cursor-pointer"
                                    onClick={() => window.location.href = `/articles/${article._id}`}
                                >
                                    <div className="h-56 overflow-hidden relative">
                                        {article.image ? (
                                            <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-teal-soft-bg to-[#e6f4f1] flex items-center justify-center text-primary-teal/40">
                                                <BookOpen size={48} />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-xs font-bold text-primary-teal shadow-sm flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary-teal"></span>
                                            {article.category}
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 flex flex-col flex-1 relative bg-white z-10 rounded-t-3xl -mt-4 shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.1)]">
                                        <div className="flex items-center gap-3 text-xs text-text-muted mb-3 font-medium">
                                            <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            <span className="w-1 h-1 rounded-full bg-border"></span>
                                            <span className="flex flex-1 items-center gap-1 truncate"><Eye size={14}/> 3 Min Read</span>
                                        </div>
                                        
                                        <h3 className="text-xl font-bold text-forest-dark mb-3 line-clamp-2 leading-snug group-hover:text-primary-teal transition-colors">
                                            {article.title}
                                        </h3>
                                        
                                        <p className="text-text-muted text-sm line-clamp-3 mb-6 flex-1">
                                            {article.content.replace(/<[^>]*>?/gm, '')}
                                        </p>
                                        
                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-soft-yellow-bg text-warm-yellow flex items-center justify-center font-bold text-xs">
                                                    {(article.createdBy?.username || 'A').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-semibold text-text-main truncate max-w-[100px]">{article.createdBy?.username || 'Admin'}</span>
                                            </div>
                                            <Link 
                                                to={`/articles/${article._id}`}
                                                className="w-10 h-10 rounded-full bg-off-white flex items-center justify-center text-primary-teal group-hover:bg-primary-teal group-hover:text-white transition-all transform group-hover:-translate-x-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <ArrowRight size={18} />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-border/50 shadow-sm glass">
                        <div className="w-20 h-20 bg-teal-soft-bg text-primary-teal rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-forest-dark mb-2">No articles found</h3>
                        <p className="text-text-muted">We couldn't align any articles with your search criteria. Try browsing all categories.</p>
                        <button 
                            onClick={() => {setSearchTerm(''); setActiveCategory('All');}}
                            className="mt-6 px-6 py-2.5 bg-primary-teal text-white font-medium rounded-xl hover:bg-teal-700 transition-colors"
                        >
                            View All Articles
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default UserArticles;
