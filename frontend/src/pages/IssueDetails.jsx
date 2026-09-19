import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import api from "../services/api";
import { API_ENDPOINTS } from "../config/apiConfig";
import MessageThread from "../components/issues/MessageThread";
import { StatusBadge, PriorityBadge } from "../components/issues/IssueBadge";

const IssueDetails = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const isCreateRoute = id === "new" || id === "create";

  const fetchOne = async () => {
    if (!id || isCreateRoute) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`${API_ENDPOINTS.ISSUES.BY_ID}/${id}`);
      setTicket(res.data);
    } catch (e) {
      console.error(e);
      setTicket(null);
      alert("Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const sendMessage = async () => {
    if (!text.trim() || !id || isCreateRoute) return;

    setSending(true);
    try {
      const res = await api.post(
        `${API_ENDPOINTS.ISSUES.MESSAGES}/${id}/messages`,
        { text }
      );
      setTicket(res.data);
      setText("");
    } catch (e) {
      console.error(e);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (isCreateRoute) {
    return <Navigate to="/issues/new" replace />;
  }

  if (loading) {
    return <div className="text-center py-10 text-text-muted">Loading...</div>;
  }

  if (!ticket) {
    return <div className="text-center py-10 text-text-muted">Ticket not found.</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl pb-24 md:pb-6">
      <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">{ticket.title}</h1>
            <div className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              {ticket.category}
            </div>
          </div>

          <div className="flex items-center sm:items-end gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-text-main">
          <div className="text-text-muted">
            Created:{" "}
            <span className="text-text-main font-medium">
              {new Date(ticket.createdAt).toLocaleString()}
            </span>
          </div>

          <div className="text-text-muted">
            Updated:{" "}
            <span className="text-text-main font-medium">
              {new Date(ticket.updatedAt).toLocaleString()}
            </span>
          </div>

          {(ticket.periodFrom || ticket.periodTo) && (
            <div className="md:col-span-2 text-text-muted">
              Period:{" "}
              <span className="text-text-main font-medium">
                {ticket.periodFrom
                  ? new Date(ticket.periodFrom).toLocaleDateString()
                  : "—"}{" "}
                to{" "}
                {ticket.periodTo
                  ? new Date(ticket.periodTo).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          )}

          {(ticket.monthlyBillLKR || ticket.monthlyKwh) && (
            <div className="md:col-span-2 text-text-muted">
              Provided:{" "}
              <span className="text-text-main font-medium">
                {ticket.monthlyBillLKR ? `LKR ${ticket.monthlyBillLKR}` : "—"} |{" "}
                {ticket.monthlyKwh ? `${ticket.monthlyKwh} kWh` : "—"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <MessageCircle size={20} className="text-primary-teal" />
          Conversation Thread
        </h2>

        <MessageThread messages={ticket.messages || []} />

        <div className="mt-8 flex flex-col gap-4">
          <textarea
            className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-2xl outline-none focus:border-primary-teal focus:ring-1 focus:ring-primary-teal transition-all min-h-[120px] text-sm md:text-base resize-none"
            placeholder="Type your message here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="flex justify-end">
            <button
              disabled={sending || !text.trim()}
              onClick={sendMessage}
              className="w-full sm:w-auto px-10 py-3 rounded-xl bg-primary-teal text-white font-bold hover:opacity-95 transition-all shadow-md shadow-emerald-100 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetails;