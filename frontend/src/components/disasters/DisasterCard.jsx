import React from "react";
import { MapPin } from "lucide-react";

const statusClass = (s) => ({
  active: "bg-red-100 text-red-700",
  monitoring: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
}[s] || "bg-gray-100 text-gray-700");

const severityClass = (s) => ({
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-700",
}[s] || "bg-gray-100 text-gray-700");

const DisasterCard = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm glass border border-border">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">{data.title}</h3>
          <div className="text-sm text-text-muted">{data.type}</div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${statusClass(data.status)}`}>
            {data.status}
          </span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${severityClass(data.severity)}`}>
            {data.severity}
          </span>
        </div>
      </div>

      {data.description ? (
        <p className="mt-3 text-sm text-text-main leading-relaxed">
          {data.description}
        </p>
      ) : (
        <p className="mt-3 text-sm text-text-muted">No description provided.</p>
      )}

      <div className="mt-4 flex items-center gap-2 text-sm text-text-muted">
        <MapPin size={16} />
        <span className="font-medium text-text-main">{data.locationName}</span>
        <span>({data.latitude}, {data.longitude})</span>
      </div>

      <div className="mt-3 text-xs text-text-muted">
        Posted: {new Date(data.createdAt).toLocaleString()}
      </div>
    </div>
  );
};

export default DisasterCard;
