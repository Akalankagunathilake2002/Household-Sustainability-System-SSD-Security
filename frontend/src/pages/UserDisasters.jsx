import React, { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Filter,
  ShieldAlert,
  Activity,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";
import { API_ENDPOINTS } from "../config/apiConfig";
import DisasterCard from "../components/disasters/DisasterCard";

const UserDisasters = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const types = ["Flood", "Fire", "Earthquake", "Landslide", "Storm", "Drought", "Tsunami", "Other"];
  const statuses = ["active", "monitoring", "resolved"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (type) params.type = type;
      if (status) params.status = status;
      if (search) params.search = search;

      const res = await api.get(API_ENDPOINTS.DISASTERS, { params });
      setItems(res.data || []);
    } catch (e) {
      console.error(e);
      alert("Failed to load disasters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeCount = items.filter((item) => item.status === "active").length;
  const monitoringCount = items.filter((item) => item.status === "monitoring").length;
  const resolvedCount = items.filter((item) => item.status === "resolved").length;

  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-3xl border border-border bg-white p-5 md:p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[11px] font-bold text-red-600 uppercase tracking-wider">
              <ShieldAlert size={12} />
              Safety Updates
            </div>

            <h1 className="mt-3 text-2xl md:text-3xl font-bold text-text-main">Disaster Alerts</h1>
            <p className="mt-2 max-w-2xl text-sm text-text-muted">
              Verified alerts. Stay informed and prepared for situations in your area.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="min-w-[100px] rounded-2xl border border-border bg-off-white px-4 py-3">
              <p className="text-[10px] uppercase font-bold text-text-muted">Total</p>
              <p className="mt-1 text-xl md:text-2xl font-bold text-text-main">{items.length}</p>
            </div>

            <div className="min-w-[100px] rounded-2xl border border-border bg-off-white px-4 py-3">
              <p className="text-[10px] uppercase font-bold text-text-muted">Active</p>
              <p className="mt-1 text-xl md:text-2xl font-bold text-red-600">{activeCount}</p>
            </div>

            <div className="min-w-[100px] rounded-2xl border border-border bg-off-white px-4 py-3 col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase font-bold text-text-muted">Resolved</p>
              <p className="mt-1 text-xl md:text-2xl font-bold text-green-600">{resolvedCount}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="rounded-3xl border border-border bg-white p-4 md:p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Filter size={18} className="text-primary-teal" />
          <h2 className="text-lg font-semibold text-text-main">Filters</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.3fr_0.8fr_0.8fr_auto_auto]">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-off-white px-4 py-3">
            <Search size={18} className="shrink-0 text-text-muted" />
            <input
              className="w-full bg-transparent text-sm text-text-main outline-none placeholder:text-text-muted"
              placeholder="Search alerts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={fetchData}
              className="text-sm font-semibold text-primary-teal hover:opacity-80"
            >
              Apply
            </button>
          </div>

          <select
            className="rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary-teal"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            className="rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary-teal"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            onClick={fetchData}
            className="rounded-2xl border border-primary-teal bg-primary-teal px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Apply Filters
          </button>

          <button
            onClick={fetchData}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-white px-5 py-3 text-sm font-semibold text-text-main transition hover:bg-off-white"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-2 text-red-600">
              <ShieldAlert size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted">Currently Active</p>
              <p className="text-lg font-bold text-text-main">{activeCount} alerts</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-yellow-50 p-2 text-yellow-600">
              <Activity size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted">Monitoring</p>
              <p className="text-lg font-bold text-text-main">{monitoringCount} alerts</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-50 p-2 text-green-600">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted">Resolved</p>
              <p className="text-lg font-bold text-text-main">{resolvedCount} alerts</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-border bg-white py-16 shadow-sm">
          <div className="flex flex-col items-center justify-center text-text-muted">
            <RefreshCw size={24} className="mb-3 animate-spin" />
            <p className="font-medium">Loading alerts...</p>
            <p className="mt-1 text-sm">Please wait while disaster updates are being fetched.</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-border bg-white py-16 shadow-sm">
          <div className="flex flex-col items-center justify-center text-center text-text-muted">
            <ShieldAlert size={30} className="mb-3 opacity-70" />
            <p className="font-medium">No alerts found.</p>
            <p className="mt-1 text-sm">Try changing the search or filter options.</p>
          </div>
        </div>
      ) : (
        <div className="pb-24">
          <div className="mb-4 flex items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-xl font-bold text-text-main">Latest Alerts</h2>
              <p className="text-sm text-text-muted">
                Showing verified disaster alerts.
              </p>
            </div>

            <div className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-text-muted shadow-sm">
              {items.length} result{items.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((d) => (
              <DisasterCard key={d._id} data={d} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDisasters;