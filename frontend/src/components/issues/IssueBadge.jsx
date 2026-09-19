import React from "react";

const formatLabel = (value) => {
  if (!value) return "";
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

export const StatusBadge = ({ status }) => {
  const base =
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm transition-all duration-200";

  const map = {
    new: "bg-blue-50 text-blue-700 border-blue-200",
    need_more_info: "bg-yellow-50 text-yellow-700 border-yellow-200",
    in_progress: "bg-orange-50 text-orange-700 border-orange-200",
    resolved: "bg-green-50 text-green-700 border-green-200",
    closed: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span className={`${base} ${map[status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
      {formatLabel(status)}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const base =
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm transition-all duration-200";

  const map = {
    low: "bg-gray-100 text-gray-700 border-gray-200",
    medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
    high: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span className={`${base} ${map[priority] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
      {formatLabel(priority)}
    </span>
  );
};