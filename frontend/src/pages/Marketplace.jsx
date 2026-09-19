import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { API_ENDPOINTS } from "../config/apiConfig";
import ProductCard from "../components/marketplace/ProductCard";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";
import ReactPaginate from "react-paginate";
import { LocateFixed, X, Search, SlidersHorizontal } from "lucide-react";
import marketplaceHeroImg from "../assets/marketplace.png";

// Haversine distance in km
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const NEARBY_RADIUS_KM = 25;
const ITEMS_PER_PAGE = 9;

const Marketplace = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const uniqueCategories = ["All", ...new Set(products.map((p) => p.category))];
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [nearbyActive, setNearbyActive] = useState(false);
  const [buyerCoords, setBuyerCoords] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.PRODUCTS.BASE);
      const availableProducts = res.data.products;
      setProducts(availableProducts);
      setFilteredProducts(availableProducts);
    } catch (err) {
      console.error("Error fetching products:", err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (search) {
      const searchTerm = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(searchTerm) ||
          p.description?.toLowerCase().includes(searchTerm) ||
          p.category?.toLowerCase().includes(searchTerm)
      );
    }

    if (category !== "All") {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (nearbyActive && buyerCoords) {
      filtered = filtered.filter((p) => {
        if (!p.location?.coordinates?.length) return false;
        const [pLng, pLat] = p.location.coordinates;
        return (
          haversineKm(buyerCoords.lat, buyerCoords.lng, pLat, pLng) <=
          NEARBY_RADIUS_KM
        );
      });
    }

    setFilteredProducts(filtered);
    setCurrentPage(0);
  }, [search, category, products, nearbyActive, buyerCoords]);

  const pageCount = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const offset = currentPage * ITEMS_PER_PAGE;
  const currentItems = filteredProducts.slice(offset, offset + ITEMS_PER_PAGE);

  const handleRequestClick = (productId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setSelectedProductId(productId);
    setIsConfirmOpen(true);
  };

  const handleNearbyToggle = () => {
    if (nearbyActive) {
      setNearbyActive(false);
      return;
    }
    if (buyerCoords) {
      setNearbyActive(true);
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBuyerCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setNearbyActive(true);
      },
      () =>
        toast.warning(
          "Location access denied. Enable it to use the Nearby filter."
        )
    );
  };

  const placeOrder = async () => {
    try {
      setLoading(true);
      const res = await api.post(API_ENDPOINTS.ORDERS.BASE, {
        productId: selectedProductId,
      });
      toast.success(res.data.message);
      fetchProducts();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Something went wrong.";
      if (err.response?.status === 400) {
        toast.warning(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
      setIsConfirmOpen(false);
      setSelectedProductId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-12">

      {/* Hero Banner — full bleed, no padding */}
      <div className="relative w-full h-40 md:h-[20vh] min-h-[160px] md:max-h-[260px] overflow-hidden">
        <img
          src={marketplaceHeroImg}
          alt="Sustainable Marketplace"
          className="w-full h-full object-cover object-center"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/70 via-teal-800/50 to-transparent" />

        {/* Hero text */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 lg:px-16">
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight drop-shadow-sm">
            Sustainable Marketplace
          </h1>
          <p className="text-teal-100 text-sm sm:text-base mt-1.5 max-w-md">
            Give items a second life and find great deals in your community.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">

            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="relative">
              <SlidersHorizontal
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <select
                className="w-full sm:w-auto pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all appearance-none cursor-pointer"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Nearby toggle */}
            <button
              onClick={handleNearbyToggle}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                nearbyActive
                  ? "bg-teal-500 text-white shadow-md shadow-teal-100"
                  : "border border-gray-200 bg-gray-50 text-gray-600 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50"
              }`}
            >
              <LocateFixed size={15} />
              Nearby
            </button>
          </div>

          {/* Nearby active pill */}
          {nearbyActive && (
            <div className="mt-3 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-xs text-teal-700 font-medium w-fit">
              <LocateFixed size={12} className="text-teal-500 shrink-0" />
              Showing results within {NEARBY_RADIUS_KM} km of you
              <button
                onClick={() => setNearbyActive(false)}
                className="ml-0.5 text-teal-400 hover:text-teal-700 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Results count */}
        {filteredProducts.length > 0 && (
          <p className="text-xs text-gray-400 mb-4 px-1">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "item" : "items"} found
          </p>
        )}

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
              <Search size={24} className="text-teal-300" />
            </div>
            <p className="text-gray-500 font-medium">No available products found.</p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {currentItems.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onRequest={handleRequestClick}
                />
              ))}
            </div>

            {/* Pagination */}
            {pageCount > 1 && (
              <div className="flex justify-center mt-2 pb-2">
                <ReactPaginate
                  previousLabel="←"
                  nextLabel="→"
                  pageCount={pageCount}
                  onPageChange={(e) => setCurrentPage(e.selected)}
                  containerClassName="flex gap-1.5 items-center"
                  pageLinkClassName="w-8 h-8 flex items-center justify-center rounded-lg text-sm border border-gray-200 text-teal-700 hover:bg-teal-50 transition-all font-medium"
                  activeLinkClassName="!bg-teal-500 !text-white !border-teal-500 font-bold"
                  previousLinkClassName="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-teal-700 hover:bg-teal-50 text-sm transition-all"
                  nextLinkClassName="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-teal-700 hover:bg-teal-50 text-sm transition-all"
                  disabledClassName="opacity-40 cursor-not-allowed pointer-events-none"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={placeOrder}
        title="Confirm Product Request"
        message="This item will be reserved for you and the seller will be notified. Do you want to proceed?"
        confirmText="Yes, Request Item"
        cancelText="Cancel"
        type="info"
      />
    </div>
  );
};

export default Marketplace;