import React, { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search, Download } from "lucide-react";
import api from "../services/api";
import { API_ENDPOINTS } from "../config/apiConfig";
import DisasterTable from "../components/disasters/DisasterTable";
import DisasterFormModal from "../components/disasters/DisasterFormModal";

const AdminDisasters = () => {
  const [disasters, setDisasters] = useState([]);
  const [liveFema, setLiveFema] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingFema, setLoadingFema] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");

  const types = ["Flood","Fire","Earthquake","Landslide","Storm","Drought","Tsunami","Other"];
  const statuses = ["active","monitoring","resolved"];
  const severities = ["low","medium","high","critical"];

  // ========================
  // FETCH MANUAL DISASTERS
  // ========================
  const fetchDisasters = async () => {
    setLoading(true);
    try {
      const params = {};
      if (type) params.type = type;
      if (status) params.status = status;
      if (severity) params.severity = severity;
      if (search) params.search = search;

      const res = await api.get(API_ENDPOINTS.DISASTERS, { params });
      setDisasters(res.data || []);
    } catch (e) {
      console.error(e);
      alert("Failed to load disasters");
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // FETCH FEMA DATA
  // ========================
  const fetchFema = async () => {
    setLoadingFema(true);
    try {
      const res = await api.get(API_ENDPOINTS.DISASTER_EXTERNAL.LIVE_FEMA);
      setLiveFema(res.data || []);
    } catch (e) {
      console.error(e);
      alert("Failed to load FEMA alerts");
    } finally {
      setLoadingFema(false);
    }
  };

  // ========================
  // INITIAL LOAD
  // ========================
  useEffect(() => {
    fetchDisasters();
    fetchFema();
  }, []);

  // ========================
  // CRUD FUNCTIONS
  // ========================
  const onCreate = () => {
    setEditing(null);
    setOpenModal(true);
  };

  const onEdit = (row) => {
    setEditing(row);
    setOpenModal(true);
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this disaster?")) return;
    try {
      await api.delete(`${API_ENDPOINTS.DISASTERS}/${id}`);
      setDisasters((prev) => prev.filter((d) => d._id !== id));
    } catch (e) {
      alert("Delete failed");
    }
  };

  const onSubmit = async (payload) => {
    try {
      if (editing?._id) {
        const res = await api.put(`${API_ENDPOINTS.DISASTERS}/${editing._id}`, payload);
        setDisasters((prev) =>
          prev.map((d) => (d._id === editing._id ? res.data : d))
        );
      } else {
        const res = await api.post(API_ENDPOINTS.DISASTERS, payload);
        setDisasters((prev) => [res.data, ...prev]);
      }
      setOpenModal(false);
      setEditing(null);
    } catch {
      alert("Save failed");
    }
  };

  // ========================
  // IMPORT FEMA
  // ========================
  const importFema = async (item) => {
    try {
      const res = await api.post(API_ENDPOINTS.DISASTER_EXTERNAL.IMPORT_FEMA, {
        externalId: item.externalId,
      });

      setDisasters((prev) => [res.data, ...prev]);
      alert("Imported successfully");
    } catch (e) {
      alert("Import failed");
    }
  };

  const filteredCount = useMemo(() => disasters.length, [disasters]);

  return (
    <div className="flex flex-col gap-6">

      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1 text-forest-dark">Disaster Management</h1>
          <p className="text-sm md:text-base text-text-muted">
            Manage disasters + live FEMA alerts
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => { fetchDisasters(); fetchFema(); }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-border rounded-xl font-medium text-sm shadow-sm hover:bg-off-white transition-all"
          >
            <RefreshCw size={16} /> <span className="md:hidden">Refresh</span>
          </button>

          <button
            onClick={onCreate}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary-teal text-white rounded-xl font-semibold text-sm shadow-sm hover:opacity-95 transition-all"
          >
            <Plus size={16} /> New Alert
          </button>
        </div>
      </header>

     {/* ================= FEMA SECTION ================= */}
<div className="bg-white p-5 rounded-2xl shadow">
  <h2 className="text-xl font-bold mb-4">Live FEMA Alerts</h2>

  {loadingFema ? (
    <p>Loading FEMA alerts...</p>
  ) : (
    <div className="max-h-[320px] overflow-y-auto pr-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {liveFema.map((item) => (
          <div key={item.externalId} className="border p-4 rounded-xl">
            <h3 className="font-bold">{item.title}</h3>
            <p className="text-sm">{item.type}</p>
            <p className="text-sm">{item.locationName}</p>

            <button
              onClick={() => importFema(item)}
              className="mt-3 flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded"
            >
              <Download size={14} /> Import
            </button>
          </div>
        ))}
      </div>
    </div>
  )}
</div>

      {/* ================= FILTERS ================= */}
      <div className="bg-white p-4 rounded-2xl flex flex-col lg:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Search size={18} />
          <input
            className="w-full outline-none"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={fetchDisasters}>Apply</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:flex gap-2">
          <select className="px-3 py-2 bg-white border border-border rounded-xl text-sm outline-none" value={type} onChange={(e)=>setType(e.target.value)}>
            <option value="">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select className="px-3 py-2 bg-white border border-border rounded-xl text-sm outline-none" value={severity} onChange={(e)=>setSeverity(e.target.value)}>
            <option value="">All Severity</option>
            {severities.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select className="px-3 py-2 bg-white border border-border rounded-xl text-sm outline-none" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">All Status</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <button 
            onClick={fetchDisasters}
            className="col-span-2 md:col-span-1 px-4 py-2 bg-off-white border border-border rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            Apply ({filteredCount})
          </button>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white p-4 md:p-6 rounded-[1.5rem] shadow-sm glass transition-all overflow-hidden pb-24 md:pb-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-text-muted">
            <RefreshCw size={24} className="animate-spin mb-3" />
            <p>Loading disasters...</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <div className="min-w-[800px]">
              <DisasterTable
                rows={disasters}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      <DisasterFormModal
        open={openModal}
        onClose={() => { setOpenModal(false); setEditing(null); }}
        onSubmit={onSubmit}
        initial={editing}
      />
    </div>
  );
};

export default AdminDisasters;