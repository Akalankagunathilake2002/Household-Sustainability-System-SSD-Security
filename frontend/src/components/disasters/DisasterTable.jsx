import React from "react";
import { Pencil, Trash2 } from "lucide-react";

const badge = (text, kind) => {
  const base = "px-2.5 py-1 rounded-lg text-xs font-semibold";
  if (kind === "status") {
    const map = {
      active: "bg-red-100 text-red-700",
      monitoring: "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
    };
    return <span className={`${base} ${map[text] || "bg-gray-100 text-gray-700"}`}>{text}</span>;
  }
  if (kind === "severity") {
    const map = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-700",
    };
    return <span className={`${base} ${map[text] || "bg-gray-100 text-gray-700"}`}>{text}</span>;
  }
  return <span className={`${base} bg-gray-100 text-gray-700`}>{text}</span>;
};

const DisasterTable = ({ rows = [], onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">Title</th>
            <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">Type</th>
            <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">Location</th>
            <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">Severity</th>
            <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">Status</th>
            <th className="text-left p-4 border-b border-border text-text-muted font-semibold text-[13px] uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d._id} className="hover:bg-off-white">
              <td className="p-4 border-b border-border">
                <div className="font-semibold text-text-main">{d.title}</div>
                <div className="text-xs text-text-muted">{new Date(d.createdAt).toLocaleString()}</div>
              </td>
              <td className="p-4 border-b border-border">{badge(d.type, "type")}</td>
              <td className="p-4 border-b border-border text-sm text-text-muted">
                {d.locationName}
                <div className="text-xs">({d.latitude}, {d.longitude})</div>
              </td>
              <td className="p-4 border-b border-border">{badge(d.severity, "severity")}</td>
              <td className="p-4 border-b border-border">{badge(d.status, "status")}</td>
              <td className="p-4 border-b border-border">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit?.(d)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border border-border hover:bg-gray-50"
                  >
                    <Pencil size={16} /> Edit
                  </button>
                  <button
                    onClick={() => onDelete?.(d._id)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border border-border text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DisasterTable;
