import React, { useState, useEffect, useMemo } from "react";
import {
  Plus, RefreshCw, Search, Trash2, Edit2, Leaf,
  Tag, Activity, Clock, CalendarCheck,
} from "lucide-react";
import ReactPaginate from "react-paginate";
import api from "../../services/api";
import { API_ENDPOINTS } from "../../config/apiConfig";
import { ProductForm } from "./ProductForm";
import ConfirmModal from "../ConfirmModal";
import { toast } from "react-toastify";
import { CATEGORY_LABELS } from "../../utils/categoryLabels";

const ITEMS_PER_PAGE = 8;

const StatusBadge = ({ status }) => {
  const styles = {
    Available: "bg-teal-50 text-teal-700",
    Reserved:  "bg-yellow-50 text-yellow-800",
    Sold:      "bg-red-50 text-red-700",
  };
  const dots = {
    Available: "bg-teal-400",
    Reserved:  "bg-yellow-400",
    Sold:      "bg-red-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || "bg-gray-400"}`} />
      {status}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, iconClass }) => (
  <div className="flex items-center gap-3 rounded-2xl px-4 py-3 flex-1 min-w-[130px] bg-white border border-green-100 shadow-sm">
    <div className="rounded-xl p-2 bg-teal-50">
      <Icon size={18} className={iconClass || "text-teal-500"} />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
};

const formatTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

const UserProducts = () => {
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [status, setStatus]               = useState("");
  const [category, setCategory]           = useState("");
  const [currentPage, setCurrentPage]     = useState(0);
  const [isFormOpen, setIsFormOpen]       = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteId, setDeleteId]           = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.PRODUCTS.MY);
      setProducts(res.data.products || []);
    } catch {
      toast.error("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filteredProducts = useMemo(() =>
    products.filter((p) => {
      const matchesSearch   = p.title?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus   = status   ? p.status   === status   : true;
      const matchesCategory = category ? p.category === category : true;
      return matchesSearch && matchesStatus && matchesCategory;
    }),
    [products, search, status, category]
  );

  const pageCount    = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const offset       = currentPage * ITEMS_PER_PAGE;
  const currentItems = filteredProducts.slice(offset, offset + ITEMS_PER_PAGE);

  const totalCO2       = products.reduce((s, p) => s + (p.co2Saved || 0), 0).toFixed(1);
  const availableCount = products.filter(p => p.status === "Available").length;
  const soldCount      = products.filter(p => p.status === "Sold").length;

  const handleDelete = async () => {
    try {
      const res = await api.delete(`${API_ENDPOINTS.PRODUCTS.BASE}/${deleteId}`);
      toast.success(res.data.message);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete product.");
    } finally {
      setDeleteId(null);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      let res;
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (editingProduct?._id) {
        res = await api.put(`${API_ENDPOINTS.PRODUCTS.BASE}/${editingProduct._id}`, formData, config);
      } else {
        res = await api.post(API_ENDPOINTS.PRODUCTS.BASE, formData, config);
      }
      toast.success(res.data.message);
      setIsFormOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product.");
    }
  };

  const selectClass = "px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white outline-none focus:border-teal-400 cursor-pointer";

  return (
    <div className="flex flex-col gap-5">

      <header className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">My Products</h2>
          <p className="text-xs md:text-sm text-gray-400 mt-0.5">Create and manage your listings. Edit available items or track their status.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={fetchProducts}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-teal-700 bg-white hover:bg-teal-50 transition-all shadow-sm"
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 transition-all shadow-sm"
          >
            <Plus size={15} /> Add
          </button>
        </div>
      </header>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Tag}          label="Total"  value={products.length}    iconClass="text-teal-500" />
        <StatCard icon={Activity}     label="Available"        value={availableCount}      iconClass="text-teal-400" />
        <StatCard icon={CalendarCheck} label="Sold"            value={soldCount}           iconClass="text-amber-400" />
        <StatCard icon={Leaf}         label="CO₂ Saved"        value={`${totalCO2}`}   iconClass="text-green-500" />
      </div>

      {/* FILTERS */}
      <div className="flex flex-col lg:flex-row gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 bg-teal-50 border border-teal-100">
          <Search size={16} className="text-teal-600 shrink-0" />
          <input
            className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-teal-300"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(0); }}
          />
        </div>
        <select className={selectClass} value={status} onChange={(e) => { setStatus(e.target.value); setCurrentPage(0); }}>
          <option value="">All Status</option>
          <option value="Available">Available</option>
          <option value="Reserved">Reserved</option>
          <option value="Sold">Sold</option>
        </select>
        <select className={selectClass} value={category} onChange={(e) => { setCategory(e.target.value); setCurrentPage(0); }}>
          <option value="">All Categories</option>
          {[...new Set(products.map(p => p.category))].map(cat => (
            <option key={cat} value={cat}>{CATEGORY_LABELS[cat] || cat}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 bg-white border border-gray-100 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-teal-600">
            <RefreshCw size={20} className="animate-spin" />
            <span className="text-sm font-medium">Loading products…</span>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">No products found.</div>
        ) : (
          <table className="w-full text-sm border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-green-50 border-b border-green-100">
                {["Title", "Price", "Category", "CO₂ Saved", "Status", "Created", "Updated", "Actions"].map(h => (
                  <th key={h} className="p-3 text-left text-xs font-semibold text-teal-700 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((product, i) => (
                <tr
                  key={product._id}
                  className={`border-b border-gray-50 hover:bg-teal-50 transition-colors ${i % 2 !== 0 ? "bg-gray-50/50" : "bg-white"}`}
                >
                  <td className="p-3 font-medium text-gray-800">{product.title}</td>
                  <td className="p-3 font-semibold text-teal-700">Rs. {product.price}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-800">
                      {CATEGORY_LABELS[product.category] || product.category}
                    </span>
                  </td>
                  <td className="p-3">
                    {product.co2Saved != null ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                        <Leaf size={13} />
                        {product.co2Saved} kg
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="p-3"><StatusBadge status={product.status} /></td>
                  <td className="p-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1 text-xs font-medium text-gray-700">
                        <CalendarCheck size={11} className="text-teal-400" />
                        {formatDate(product.createdAt)}
                      </span>
                      <span className="text-xs text-gray-400">{formatTime(product.createdAt)}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1 text-xs font-medium text-gray-700">
                        <Clock size={11} className="text-amber-400" />
                        {formatDate(product.updatedAt)}
                      </span>
                      <span className="text-xs text-gray-400">{formatTime(product.updatedAt)}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingProduct(product); setIsFormOpen(true); }}
                        className="p-2 rounded-lg text-teal-500 hover:bg-teal-50 transition-all"
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        disabled={product.status !== "Available"}
                        onClick={() => setDeleteId(product._id)}
                        className={`p-2 rounded-lg transition-all ${
                        product.status === "Available" ? "text-red-400 hover:bg-red-50" : "text-gray-300 cursor-not-allowed"
                        }`}
                        title={
                        product.status !== "Available" ? "Cannot delete reserved or sold products" : "Delete"
                        } >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      {pageCount > 1 && (
        <div className="flex justify-center mt-2">
          <ReactPaginate
            previousLabel="←"
            nextLabel="→"
            pageCount={pageCount}
            onPageChange={(e) => setCurrentPage(e.selected)}
            containerClassName="flex gap-1.5 items-center"
            pageLinkClassName="w-8 h-8 flex items-center justify-center rounded-lg text-sm border border-green-100 text-teal-700 hover:bg-teal-50 transition-all"
            activeLinkClassName="!bg-teal-500 !text-white !border-teal-500 font-bold"
            previousLinkClassName="w-8 h-8 flex items-center justify-center rounded-lg border border-green-100 text-teal-700 hover:bg-teal-50 text-sm transition-all"
            nextLinkClassName="w-8 h-8 flex items-center justify-center rounded-lg border border-green-100 text-teal-700 hover:bg-teal-50 text-sm transition-all"
          />
        </div>
      )}

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingProduct(null); }}
        product={editingProduct}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default UserProducts;