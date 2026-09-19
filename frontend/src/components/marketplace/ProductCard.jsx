import React from "react";
import { Link } from "react-router-dom";
import { LocateFixed, Tag } from "lucide-react";
import { CATEGORY_LABELS } from "../../utils/categoryLabels";
import placeholderImage from "../../assets/no-image.jpg";
import RequestButton from "./RequestButton";

const ProductCard = ({ product, onRequest }) => {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">

      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={product.imageUrl || placeholderImage}
          alt={product.title}
          className="h-44 sm:h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = placeholderImage;
          }}
        />
        {/* Category badge */}
        <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-teal-700 border border-teal-100 shadow-sm">
          <Tag size={10} className="text-teal-500" />
          {CATEGORY_LABELS[product.category] || product.category}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">

        <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2">
          {product.title}
        </h3>

        {product.locationName && (
          <p className="flex items-center gap-1 text-xs text-gray-400">
            <LocateFixed size={11} className="text-teal-400 shrink-0" />
            <span className="truncate">{product.locationName}</span>
          </p>
        )}

        {/* Price + Actions */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-gray-50">
          <span className="text-teal-600 font-bold text-lg leading-none">
            Rs.&nbsp;{product.price}
          </span>

          <div className="flex items-center gap-2">
            <Link
              to={`/marketplace/${product._id}`}
              className="px-3 py-1.5 rounded-xl border border-teal-200 text-teal-700 text-xs font-semibold hover:bg-teal-50 transition-colors"
            >
              View
            </Link>

            <RequestButton size="sm" onClick={() => onRequest(product._id)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;