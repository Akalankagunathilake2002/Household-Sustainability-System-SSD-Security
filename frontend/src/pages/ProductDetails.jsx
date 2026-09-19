import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Leaf, Phone, ArrowLeft, LocateFixed } from "lucide-react";
import api from "../services/api";
import { API_ENDPOINTS } from "../config/apiConfig";
import placeholderImage from "../assets/no-image.jpg";
import RequestButton from "../components/marketplace/RequestButton";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(
          API_ENDPOINTS.PRODUCTS.BY_ID + id
        );

        setProduct(res.data.product);
      } catch (err) {
        console.error("Error fetching product:", err.response?.data || err);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  const formatPhoneNumber = (number) => {
    if (!number) return null;

    let cleaned = number.replace(/\s+/g, "");

    if (cleaned.startsWith("0")) {
      return "94" + cleaned.substring(1);
    }

    return cleaned;
  };

  const formattedNumber = formatPhoneNumber(product.seller?.mobileNumber);

  const message = encodeURIComponent(
    `Hi, I am interested in your "${product.title}" listed on EcoPulse. Is it still available?`
  );

  const whatsappUrl = formattedNumber ? `https://wa.me/${formattedNumber}?text=${message}` : null;

  const placeOrder = async () => {
    try {
        setLoading(true);

        const res = await api.post(API_ENDPOINTS.ORDERS.BASE, {
          productId: product._id
        });

        toast.success(res.data.message);
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
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:p-6 pb-24 md:pb-12">

      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-600 hover:text-teal-600 font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Marketplace
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

        <div>
          <img
            src={product.imageUrl || placeholderImage}
            alt={product.title}
            className="w-full h-[300px] md:h-[400px] rounded-2xl shadow-xl object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }}
          />

          {/* CO2 BANNER */}
          <div className="mt-6 bg-gradient-to-r from-[#0F2E24] to-[#0F766E] text-white rounded-xl px-6 py-4 flex items-center gap-4 shadow-lg">

            <div className="bg-white/20 p-3 rounded-full">
              <Leaf size={20} className="text-white" />
            </div>

            <div>
              <p className="text-xs opacity-80">
                Estimated Carbon Impact Reduction
              </p>
              <p className="font-semibold text-lg">
                {product.co2Saved || 0} kg CO₂ Saved
              </p>
            </div>

          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="flex flex-col gap-6">

          <h1 className="text-2xl md:text-3xl font-bold text-[#0F2E24] leading-tight">
            {product.title}
          </h1>

          <span className="text-2xl font-semibold text-[#0EA5A4]">
            Rs. {product.price}
          </span>

          <p className="text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {/* Category */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#CCFBF1] rounded-full w-fit text-sm font-medium text-[#0F766E]">
            <Leaf size={14} />
            {product.category
              ?.replace(/_/g, " ")
              .replace(/\b\w/g, c => c.toUpperCase())}
          </div>

          {/* Condition */}
          {product.condition && (
            <div className="text-sm text-gray-500">
              Condition:{" "}
              <span className="font-medium text-gray-700">
                {product.condition}
              </span>
            </div>
          )}

          {/* Location */}
          {product.locationName && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <LocateFixed size={15} className="text-teal-500 shrink-0" />
              <span className="font-medium text-gray-700">{product.locationName}</span>
            </div>
          )}

          {/* WhatsApp Button */}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 px-6 py-4 bg-[#25D366] text-white rounded-xl flex items-center justify-center gap-3 font-semibold hover:scale-[1.02] transition transform shadow-md"
            >
              <Phone size={20} />
              Chat with Seller on WhatsApp
            </a>
          )}

          <RequestButton 
            fullWidth 
            loading={loading} 
            onClick={() => {
              if (!isAuthenticated) {
                navigate("/login");
                return;
              }
              setIsConfirmOpen(true);
            }}
          >
            Request This Item
          </RequestButton>

        </div>
      </div>
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={placeOrder}
        title="Confirm Product Request"
        message={`You are about to request "${product.title}". The seller will be notified and the item will be reserved for you. Do you want to proceed?`}
        confirmText="Yes, Request Item"
        cancelText="Cancel"
        type="info"
      />
    </div>
  );
};

export default ProductDetails;