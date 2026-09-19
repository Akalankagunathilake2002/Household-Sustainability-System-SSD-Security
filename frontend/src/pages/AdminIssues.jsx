import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Search,
  Filter,
  MessageSquare,
  Clock3,
  User,
  Flag,
  FolderOpen,
} from "lucide-react";
import api from "../services/api";
import { API_ENDPOINTS } from "../config/apiConfig";
import { StatusBadge, PriorityBadge } from "../components/issues/IssueBadge";
import MessageThread from "../components/issues/MessageThread";

const AdminIssues = () => {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);

  const statuses = ["new", "need_more_info", "in_progress", "resolved", "closed"];
  const priorities = ["low", "medium", "high"];

  const formatLabel = (value) => {
    if (!value) return "";
    return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (search) params.search = search;

      const res = await api.get(API_ENDPOINTS.ISSUES.BASE, { params });
      setItems(res.data || []);
    } catch (e) {
      console.error(e);
      alert("Failed to load issues (admin)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openTicket = async (id) => {
    try {
      const res = await api.get(`${API_ENDPOINTS.ISSUES.BY_ID}/${id}`);
      setSelected(res.data);
      setReply("");
    } catch (e) {
      console.error(e);
      alert("Failed to load ticket");
    }
  };

  const updateMeta = async (field, value) => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await api.put(`${API_ENDPOINTS.ISSUES.BY_ID}/${selected._id}`, {
        [field]: value,
      });
      setSelected(res.data);
      setItems((prev) => prev.map((t) => (t._id === selected._id ? res.data : t)));
    } catch (e) {
      console.error(e);
      alert("Failed to update ticket");
    } finally {
      setSaving(false);
    }
  };

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    setSaving(true);
    try {
      const res = await api.post(
        `${API_ENDPOINTS.ISSUES.MESSAGES}/${selected._id}/messages`,
        { text: reply }
      );
      setSelected(res.data);
      setItems((prev) => prev.map((t) => (t._id === selected._id ? res.data : t)));
      setReply("");
    } catch (e) {
      console.error(e);
      alert("Failed to send reply");
    } finally {
      setSaving(false);
    }
  };

  const summary = useMemo(() => {
    return {
      total: items.length,
      open: items.filter((item) => item.status !== "resolved" && item.status !== "closed").length,
      high: items.filter((item) => item.priority === "high").length,
    };
  }, [items]);

  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-3xl border border-border bg-white p-5 md:p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-bold text-primary-teal border border-teal-100 uppercase tracking-wider">
              <FolderOpen size={12} />
              Admin Panel
            </div>

            <h1 className="mt-3 text-2xl md:text-3xl font-bold text-text-main">Manage Issues</h1>
            <p className="mt-2 text-sm text-text-muted max-w-2xl">
              Review user tickets, update ticket status and priority, and provide advice.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-border bg-off-white px-4 py-3 min-w-[120px]">
              <p className="text-[10px] uppercase font-bold text-text-muted">Total</p>
              <p className="mt-1 text-xl md:text-2xl font-bold text-text-main">{summary.total}</p>
            </div>

            <div className="rounded-2xl border border-border bg-off-white px-4 py-3 min-w-[120px]">
              <p className="text-[10px] uppercase font-bold text-text-muted">Open</p>
              <p className="mt-1 text-xl md:text-2xl font-bold text-orange-600">{summary.open}</p>
            </div>

            <div className="rounded-2xl border border-border bg-off-white px-4 py-3 min-w-[120px] col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase font-bold text-text-muted">High Priority</p>
              <p className="mt-1 text-xl md:text-2xl font-bold text-red-600">{summary.high}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="rounded-3xl border border-border bg-white p-4 md:p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-primary-teal" />
          <h2 className="text-lg font-semibold text-text-main">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_0.7fr_auto_auto] gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-off-white px-4 py-3 md:col-span-2 lg:col-span-1">
            <Search size={18} className="text-text-muted shrink-0" />
            <input
              className="w-full bg-transparent outline-none text-sm text-text-main placeholder:text-text-muted"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary-teal"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {formatLabel(s)}
              </option>
            ))}
          </select>

          <select
            className="rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary-teal"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">All Priority</option>
            {priorities.map((p) => (
              <option key={p} value={p}>
                {formatLabel(p)}
              </option>
            ))}
          </select>

          <button
            onClick={fetchAll}
            className="rounded-2xl border border-primary-teal bg-primary-teal px-5 py-3 text-sm font-semibold text-white hover:opacity-95 transition"
          >
            Apply
          </button>

          <button
            onClick={fetchAll}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-white px-5 py-3 text-sm font-semibold text-text-main hover:bg-off-white transition"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span className="md:hidden">Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.35fr] gap-6">
        <div className="rounded-3xl border border-border bg-white p-4 md:p-5 shadow-sm min-h-[620px]">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-text-main">Tickets</h3>
              <p className="text-sm text-text-muted">
                Browse and open a ticket to view full details.
              </p>
            </div>

            <div className="rounded-full bg-off-white border border-border px-3 py-1 text-xs font-semibold text-text-muted">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-text-muted">
              <RefreshCw size={24} className="animate-spin mb-3" />
              <p>Loading tickets...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-text-muted">
              <MessageSquare size={28} className="mb-3 opacity-70" />
              <p className="font-medium">No tickets found.</p>
              <p className="text-sm mt-1">Try changing the filters or search keyword.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((t) => {
                const lastMessage =
                  t.messages?.length > 0 ? t.messages[t.messages.length - 1]?.text : "";

                return (
                  <button
                    key={t._id}
                    onClick={() => openTicket(t._id)}
                    className={`group text-left rounded-2xl border p-4 transition-all duration-200 ${
                      selected?._id === t._id
                        ? "border-primary-teal bg-teal-50/40 shadow-sm"
                        : "border-border bg-white hover:bg-off-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-text-main group-hover:text-primary-teal transition-colors">
                          {t.title}
                        </h4>

                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                          <span className="inline-flex items-center gap-1">
                            <FolderOpen size={13} />
                            {t.category}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <User size={13} />
                            {t.createdBy?.username ? t.createdBy.username : "user"}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <Clock3 size={13} />
                            {new Date(t.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {lastMessage && (
                          <p className="mt-3 text-sm text-text-main line-clamp-2 leading-relaxed">
                            <span className="font-semibold text-primary-teal">Last message: </span>
                            {lastMessage}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 items-end shrink-0">
                        <StatusBadge status={t.status} />
                        <PriorityBadge priority={t.priority} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-white p-5 md:p-6 shadow-sm min-h-[620px] xl:sticky xl:top-6 self-start">
          {!selected ? (
            <div className="flex flex-col items-center justify-center text-center py-20 text-text-muted">
              <MessageSquare size={34} className="mb-4 opacity-70" />
              <h3 className="text-lg font-semibold text-text-main mb-1">No ticket selected</h3>
              <p>Select a ticket from the left panel to view conversation details.</p>
            </div>
          ) : (
            <>
              <div className="rounded-3xl border border-border bg-gradient-to-br from-white to-off-white p-5 mb-5">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                  <div className="min-w-0">
                    <h3 className="text-2xl font-bold text-text-main break-words">
                      {selected.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <FolderOpen size={15} />
                        {selected.category}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 size={15} />
                        {new Date(selected.createdAt).toLocaleString()}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <MessageSquare size={15} />
                        {(selected.messages || []).length} message
                        {(selected.messages || []).length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <StatusBadge status={selected.status} />
                      <PriorityBadge priority={selected.priority} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto lg:min-w-[320px]">
                    <div>
                      <label className="block text-xs font-semibold text-text-muted mb-2">
                        Update Status
                      </label>
                      <select
                        className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary-teal"
                        value={selected.status}
                        onChange={(e) => updateMeta("status", e.target.value)}
                        disabled={saving}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {formatLabel(s)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-muted mb-2">
                        Update Priority
                      </label>
                      <select
                        className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary-teal"
                        value={selected.priority}
                        onChange={(e) => updateMeta("priority", e.target.value)}
                        disabled={saving}
                      >
                        {priorities.map((p) => (
                          <option key={p} value={p}>
                            {formatLabel(p)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={18} className="text-primary-teal" />
                  <h4 className="text-lg font-semibold text-text-main">Conversation</h4>
                </div>

                <div className="rounded-3xl border border-border bg-off-white/40 p-4">
                  <MessageThread messages={selected.messages || []} />
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-white p-4 md:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Flag size={18} className="text-primary-teal" />
                  <h4 className="text-lg font-semibold text-text-main">Send Admin Advice</h4>
                </div>

                <textarea
                  className="w-full rounded-2xl border border-border bg-off-white/40 px-4 py-3 outline-none min-h-[130px] text-sm text-text-main placeholder:text-text-muted focus:border-primary-teal"
                  placeholder="Write clear advice, next steps, or a request for more information..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />

                <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-xs text-text-muted">
                    Keep the response professional, helpful, and easy for the user to follow.
                  </p>

                  <button
                    disabled={saving || !reply.trim()}
                    onClick={sendReply}
                    className={`px-5 py-2.5 rounded-2xl font-semibold text-sm transition ${
                      saving || !reply.trim()
                        ? "bg-gray-300 text-white cursor-not-allowed"
                        : "bg-primary-teal text-white hover:opacity-95 shadow-sm"
                    }`}
                  >
                    {saving ? "Sending..." : "Send Advice"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminIssues;