import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, X, Image as ImageIcon, BookOpen, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/apiConfig';
import ConfirmModal from '../components/ConfirmModal';

const CATEGORIES = [
  "Waste Reduction",
  "Energy Efficiency",
  "Water Conservation",
  "Sustainable DIY",
  "Eco Shopping",
];

const AdminArticles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: CATEGORIES[0],
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

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
            toast.error('Failed to fetch articles');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (article = null) => {
        if (article) {
            setEditingArticle(article);
            setFormData({
                title: article.title,
                content: article.content,
                category: article.category,
            });
            setImagePreview(article.image);
        } else {
            setEditingArticle(null);
            setFormData({
                title: '',
                content: '',
                category: CATEGORIES[0],
            });
            setImagePreview(null);
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingArticle(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.content || !formData.category) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            const data = new FormData();
            data.append('title', formData.title);
            data.append('content', formData.content);
            data.append('category', formData.category);
            if (imageFile) {
                data.append('image', imageFile);
            }

            if (editingArticle) {
                await api.put(`${API_ENDPOINTS.ARTICLES}/${editingArticle._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Article updated successfully');
            } else {
                await api.post(API_ENDPOINTS.ARTICLES, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Article created successfully');
            }
            fetchArticles();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving article:', error);
            toast.error(error.response?.data?.message || 'Failed to save article');
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = (id) => {
        setArticleToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!articleToDelete) return;
        try {
            await api.delete(`${API_ENDPOINTS.ARTICLES}/${articleToDelete}`);
            toast.success('Article deleted successfully');
            fetchArticles();
        } catch (error) {
            console.error('Error deleting article:', error);
            toast.error('Failed to delete article');
        } finally {
            setDeleteConfirmOpen(false);
            setArticleToDelete(null);
        }
    };

    const filteredArticles = articles.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[1.5rem] shadow-sm glass">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-forest-dark">
                        <BookOpen className="text-primary-teal" size={28} />
                        Articles
                    </h1>
                    <p className="text-xs md:text-sm text-text-muted mt-1 md:mt-2">Create and organize educational sustainability articles.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-primary-teal hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
                >
                    <Plus size={20} />
                    Create New Article
                </button>
            </header>

            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm glass">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <h3 className="text-xl font-bold text-forest-dark">Article Library</h3>
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-80 pl-10 pr-4 py-2 bg-off-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-teal/50 transition-shadow"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="w-12 h-12 border-4 border-primary-teal border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredArticles.map(article => (
                                <motion.div 
                                    key={article._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-off-white border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
                                >
                                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                                        {article.image ? (
                                            <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                                <ImageIcon size={32} />
                                                <span className="text-sm">No Image</span>
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary-teal shadow-sm">
                                            {article.category}
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h4 className="font-bold text-lg text-text-main line-clamp-2 mb-2 group-hover:text-primary-teal transition-colors">{article.title}</h4>
                                        <p className="text-text-muted text-sm line-clamp-3 mb-4 flex-1">
                                            {article.content}
                                        </p>
                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                                            <span className="text-xs text-text-muted">By {article.createdBy?.username || 'Admin'}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleOpenModal(article)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => confirmDelete(article._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-off-white rounded-2xl border border-dashed border-border/60">
                        <AlertCircle className="mx-auto text-text-muted mb-3" size={40} />
                        <h4 className="text-lg font-semibold text-text-main">No articles found</h4>
                        <p className="text-text-muted text-sm mt-1">Try a different search or create a new article.</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={handleCloseModal}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
                        >
                            <div className="sticky top-0 z-10 flex items-center justify-between p-4 md:p-6 bg-white border-b border-border">
                                <h2 className="text-xl md:text-2xl font-bold text-forest-dark">{editingArticle ? 'Edit Article' : 'Create Article'}</h2>
                                <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={20} className="text-text-muted" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="font-semibold text-text-main">Article Title <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                            className="w-full px-4 py-3 bg-off-white border border-border rounded-xl focus:ring-2 focus:ring-primary-teal focus:outline-none"
                                            placeholder="Enter an engaging title"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="font-semibold text-text-main">Category <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                                className="w-full px-4 py-3 bg-off-white border border-border rounded-xl focus:ring-2 focus:ring-primary-teal focus:outline-none appearance-none"
                                            >
                                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                ▼
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="font-semibold text-text-main">Content <span className="text-red-500">*</span></label>
                                    <textarea
                                        required
                                        rows={8}
                                        value={formData.content}
                                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                                        className="w-full px-4 py-3 bg-off-white border border-border rounded-xl focus:ring-2 focus:ring-primary-teal focus:outline-none resize-none"
                                        placeholder="Write the full content of your article here..."
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="font-semibold text-text-main">Cover Image</label>
                                    <div 
                                        className="border-2 border-dashed border-border/80 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-off-white transition-colors relative overflow-hidden group min-h-[200px]"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                        
                                        {imagePreview ? (
                                            <>
                                                <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <span className="text-white font-medium flex items-center gap-2"><ImageIcon size={20}/> Change Image</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 text-text-muted">
                                                <div className="w-16 h-16 bg-teal-soft-bg rounded-full flex items-center justify-center text-primary-teal">
                                                    <ImageIcon size={32} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-text-main">Click to upload an image</p>
                                                    <p className="text-sm">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-border">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-6 py-2.5 font-medium rounded-xl text-text-main bg-off-white hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2.5 font-medium rounded-xl text-white bg-primary-teal hover:bg-teal-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                                    >
                                        {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                        {editingArticle ? 'Update Article' : 'Publish Article'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Delete Article"
                message="Are you sure you want to delete this article? This action cannot be undone."
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
};

export default AdminArticles;
