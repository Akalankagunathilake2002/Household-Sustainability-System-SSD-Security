import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, BookOpen, Share2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/apiConfig';

const ArticleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArticle();
    }, [id]);

    const fetchArticle = async () => {
        try {
            setLoading(true);
            const res = await api.get(`${API_ENDPOINTS.ARTICLES}/${id}`);
            setArticle(res.data.article);
        } catch (error) {
            console.error('Error fetching article:', error);
            toast.error('Could not load article.');
            navigate('/articles');
        } finally {
            setLoading(false);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: article?.title,
                url: window.location.href,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-off-white">
                <div className="w-12 h-12 border-4 border-primary-teal border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!article) return null;

    return (
        <div className="bg-white md:bg-off-white min-h-screen pb-24 md:pb-12">
            {/* Header/Banner Image */}
            <div className="relative h-[280px] md:h-[500px] w-full bg-forest-dark overflow-hidden">
                {article.image ? (
                    <>
                        <div className="absolute inset-0 bg-black/40 z-10"></div>
                        <img src={article.image} alt={article.title} className="w-full h-full object-cover object-center" />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-forest-dark to-primary-teal z-10 opacity-90"></div>
                )}

                <div className="absolute top-4 md:top-8 left-4 md:left-8 z-20">
                    <button 
                        onClick={() => navigate('/articles')}
                        className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white rounded-xl text-sm md:text-base font-medium transition-colors"
                    >
                        <ArrowLeft size={16} />
                        <span className="hidden xs:inline">Back to Articles</span>
                        <span className="xs:hidden">Back</span>
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <main className="max-w-4xl mx-auto -mt-20 md:-mt-32 relative z-20 px-4">
                <div className="bg-white rounded-[2rem] shadow-xl p-6 md:p-12 mb-12">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <span className="px-4 py-1.5 bg-teal-soft-bg text-primary-teal rounded-full font-bold text-sm flex items-center gap-1.5">
                            <BookOpen size={16} /> {article.category}
                        </span>
                        <div className="flex items-center gap-2 text-text-muted text-sm font-medium">
                            <Calendar size={16} />
                            {new Date(article.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    </div>

                    <h1 className="text-2xl md:text-5xl font-extrabold text-forest-dark leading-tight mb-6 md:mb-8">
                        {article.title}
                    </h1>

                    <div className="flex items-center justify-between py-6 border-y border-border mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-soft-yellow-bg text-warm-yellow rounded-full flex items-center justify-center font-bold text-lg">
                                {/* Using default initial since we don't have avatar yet */}
                                {(article.createdBy?.username || 'A')[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-text-main">{article.createdBy?.username || 'System Admin'}</p>
                                <p className="text-sm text-text-muted">Eco Author</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleShare}
                            className="w-10 h-10 rounded-full bg-off-white hover:bg-gray-200 flex items-center justify-center text-text-main transition-colors"
                            title="Share article"
                        >
                            <Share2 size={18} />
                        </button>
                    </div>

                    <div className="prose prose-lg max-w-none prose-headings:text-forest-dark prose-a:text-primary-teal hover:prose-a:text-teal-700 prose-img:rounded-xl text-text-main whitespace-pre-wrap leading-relaxed">
                        {article.content}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ArticleDetails;
