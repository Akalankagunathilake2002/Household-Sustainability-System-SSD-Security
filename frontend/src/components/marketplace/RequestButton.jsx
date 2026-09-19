import React from "react";
import { ShoppingCart, Loader2 } from "lucide-react";

const RequestButton = ({
  onClick,
  fullWidth = false,
  size = "md",
  disabled = false,
  loading = false,
  children = "Request Item"
}) => {

  const sizeClasses =
    size === "sm" ? "px-3 py-2 text-sm" : "px-6 py-3 text-base";

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${sizeClasses}
        ${fullWidth ? "w-full" : ""}
        bg-[#0EA5A4] text-white
        rounded-xl font-semibold
        flex items-center justify-center gap-2
        hover:bg-[#0F766E]
        transition transform hover:scale-[1.02]
        shadow-md disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <ShoppingCart size={18} />
      )}
      {loading ? "Requesting..." : children}
    </button>
  );
};

export default RequestButton;