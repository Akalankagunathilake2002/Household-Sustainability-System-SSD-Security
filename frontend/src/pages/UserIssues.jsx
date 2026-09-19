import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Plus, Search } from "lucide-react";
import api from "../services/api";
import { API_ENDPOINTS } from "../config/apiConfig";
import IssueCard from "../components/issues/IssueCard";

const UserIssues = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [search, setSearch] = useState("");

  const categories = ["High Bill", "Spike", "Appliance Usage", "Billing Confusion", "Savings Advice", "Other"];
  const statuses = ["new", "need_more_info", "in_progress", "resolved", "closed"];
  const priorities = ["low", "medium", "high"];

  const fetchMy = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      if (category) params.category = category;
      if (priority) params.priority = priority;
      if (search) params.search = search;

      const res = await api.get(API_ENDPOINTS.ISSUES.MY, { params });
      setItems(res.data || []);
    } catch (e) {
      console.error(e);
      alert("Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Support Center</h1>
          <p className="text-sm md:text-base text-text-muted">Ask for advice when your electricity usage feels unusually high.</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={fetchMy}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-border rounded-xl font-medium text-sm shadow-sm hover:bg-off-white transition-colors"
          >
            <RefreshCw size={16} /> <span className="md:hidden">Refresh</span>
          </button>

          <Link
            to="/issues/new"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary-teal text-white rounded-xl font-semibold text-sm shadow-sm hover:opacity-95 transition-opacity"
          >
            <Plus size={16} /> New Issue
          </Link>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm glass flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-xl bg-off-white flex-1">
          <Search size={18} className="text-text-muted" />
          <input
            className="w-full bg-transparent outline-none text-sm"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={fetchMy} className="text-sm font-semibold text-primary-teal">
            Apply
          </button>
        </div>

        <select className="px-3 py-2 border border-border rounded-xl text-sm" value={category} onChange={(e)=>setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className="px-3 py-2 border border-border rounded-xl text-sm" value={status} onChange={(e)=>setStatus(e.target.value)}>
          <option value="">All Status</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select className="px-3 py-2 border border-border rounded-xl text-sm" value={priority} onChange={(e)=>setPriority(e.target.value)}>
          <option value="">All Priority</option>
          {priorities.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <button
          onClick={fetchMy}
          className="px-4 py-2 bg-off-white border border-border rounded-xl font-medium text-sm hover:bg-gray-100"
        >
          Apply Filters
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-text-muted transition-all">Loading issues...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-10 text-text-muted transition-all">No issues yet. Create one to get advice.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pb-24 md:pb-6 transition-all duration-300">
          {items.map((it) => <IssueCard key={it._id} item={it} />)}
        </div>
      )}
    </div>
  );
};

export default UserIssues;