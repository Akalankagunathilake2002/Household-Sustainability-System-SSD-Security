import React, { useEffect, useMemo, useState } from "react";

const empty = {
  title: "",
  type: "Flood",
  description: "",
  locationName: "",
  latitude: "",
  longitude: "",
  severity: "low",
  status: "active",
};

const DisasterFormModal = ({ open, onClose, onSubmit, initial }) => {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || "",
        type: initial.type || "Flood",
        description: initial.description || "",
        locationName: initial.locationName || "",
        latitude: initial.latitude ?? "",
        longitude: initial.longitude ?? "",
        severity: initial.severity || "low",
        status: initial.status || "active",
      });
    } else {
      setForm(empty);
    }
  }, [initial, open]);

  const isEdit = useMemo(() => Boolean(initial?._id), [initial]);

  if (!open) return null;

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
    };

    if (!payload.title || !payload.type || !payload.locationName || Number.isNaN(payload.latitude) || Number.isNaN(payload.longitude)) {
      alert("Please fill required fields (title, type, location, latitude, longitude).");
      return;
    }

    onSubmit?.(payload);
  };

  const types = ["Flood","Fire","Earthquake","Landslide","Storm","Drought","Tsunami","Other"];
  const severities = ["low","medium","high","critical"];
  const statuses = ["active","monitoring","resolved"];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-lg border border-border">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="text-xl font-bold">{isEdit ? "Edit Disaster" : "Create Disaster"}</h3>
          <button onClick={onClose} className="px-3 py-1 rounded-lg hover:bg-gray-100">✕</button>
        </div>

        <form onSubmit={submit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary-teal/30"
              placeholder="Example: Flood Warning - Kelani River"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-xl outline-none"
            >
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-xl outline-none"
            >
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              value={form.severity}
              onChange={(e) => update("severity", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-xl outline-none"
            >
              {severities.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location Name *</label>
            <input
              value={form.locationName}
              onChange={(e) => update("locationName", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-xl outline-none"
              placeholder="Example: Colombo 10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
            <input
              value={form.latitude}
              onChange={(e) => update("latitude", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-xl outline-none"
              placeholder="6.9271"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
            <input
              value={form.longitude}
              onChange={(e) => update("longitude", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-xl outline-none"
              placeholder="79.8612"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-xl outline-none min-h-[110px]"
              placeholder="Explain risk, safe actions, evacuation instructions..."
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-border hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-primary-teal text-white font-semibold hover:opacity-95">
              {isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisasterFormModal;
