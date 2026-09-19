import React, { useState, useEffect, useMemo } from "react";
import { RefreshCw, Clock, CheckCircle, XCircle, ShoppingCart, AlertCircle, Search, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import api from "../../services/api";
import { API_ENDPOINTS } from "../../config/apiConfig";
import ConfirmModal from "../ConfirmModal";

const ITEMS_PER_PAGE = 8;

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-yellow-50 text-yellow-700",
    Confirmed: "bg-teal-50 text-teal-700",
    Cancelled: "bg-red-50 text-red-600",
  };
  const dots = {
    Pending: "bg-yellow-400",
    Confirmed: "bg-teal-400",
    Cancelled: "bg-red-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || "bg-gray-400"}`} />
      {status}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, iconClass }) => (
  <div className="flex items-center gap-3 rounded-2xl px-4 py-3 flex-1 min-w-[130px] bg-white border border-green-100 shadow-sm">
    <div className="rounded-xl p-2 bg-teal-50">
      <Icon size={18} className={iconClass || "text-teal-500"} />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const getRemainingDays = (expiresAt) => {
  const diff = new Date(expiresAt) - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? `${days}d left` : "Expired";
};

const inputClass = "px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white outline-none focus:border-teal-400 transition-all";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [modalData, setModalData] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.ORDERS.ADMIN);
      setOrders(res.data.orders || []);
      setCurrentPage(0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.ORDERS.REPORT);
      const { summary, orders: reportOrders } = res.data;

      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.setTextColor(15, 118, 110);
      doc.text("EcoPulse Marketplace Orders Report", 14, 22);

      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.text("Order Summary", 14, 40);

      const summaryData = [
        ["Total Orders", summary.total],
        ["Confirmed", summary.confirmed],
        ["Pending", summary.pending],
        ["Cancelled", summary.cancelled],
        ["Completion Rate", summary.completionRate]
      ];

      autoTable(doc, {
        startY: 45,
        head: [["Metric", "Value"]],
        body: summaryData,
        theme: "grid",
        headStyles: { fillColor: [15, 118, 110] },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 }
      });

      doc.text("Recent Orders", 14, doc.lastAutoTable.finalY + 10);

      const tableData = reportOrders.map(o => [
        o._id ? o._id.substring(0, 8) + "..." : "N/A",
        o.product?.title || "N/A",
        o.buyer?.username || "N/A",
        o.seller?.username || "N/A",
        o.status || "N/A",
        o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "N/A"
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [["ID", "Product", "Buyer", "Seller", "Status", "Date"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [15, 118, 110] },
        styles: { fontSize: 9 }
      });

      doc.save(`orders-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(res.data.message || "Report downloaded successfully");

    } catch (err) {
      console.error("Report generation error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to generate report.");
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter ? o.status === statusFilter : true;
      const expiry = o.expiresAt ? new Date(o.expiresAt) : null;
      const matchesFrom = dateFrom ? (expiry && expiry >= new Date(dateFrom)) : true;
      const matchesTo = dateTo ? (expiry && expiry <= new Date(dateTo + "T23:59:59")) : true;
      return matchesStatus && matchesFrom && matchesTo;
    });
  }, [orders, statusFilter, dateFrom, dateTo]);

  const pageCount = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const offset = currentPage * ITEMS_PER_PAGE;
  const currentItems = useMemo(() => filteredOrders.slice(offset, offset + ITEMS_PER_PAGE), [filteredOrders, offset]);

  const pendingCount = orders.filter(o => o.status === "Pending").length;
  const confirmedCount = orders.filter(o => o.status === "Confirmed").length;
  const cancelledCount = orders.filter(o => o.status === "Cancelled").length;

  const handleConfirmAction = async () => {
    try {
      const res = await api.put(`${API_ENDPOINTS.ORDERS.ORDER_STATUS}${modalData.id}/${modalData.action}`);
      toast.success(res.data.message);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order.");
    } finally {
      setModalData(null);
    }
  };

  const clearFilters = () => {
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(0);
  };

  const hasActiveFilters = statusFilter || dateFrom || dateTo;

  return (
    <div className="flex flex-col gap-5">

      <header className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Orders</h2>
          <p className="text-xs md:text-sm text-gray-400 mt-0.5">Manage marketplace orders and confirmations.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={generateReport}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-all shadow-sm"
          >
            <Download size={15} /> Report
          </button>
          <button
            onClick={fetchOrders}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-teal-700 bg-white hover:bg-teal-50 transition-all shadow-sm"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </header>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={ShoppingCart} label="Total" value={orders.length} iconClass="text-teal-500" />
        <StatCard icon={AlertCircle} label="Pending" value={pendingCount} iconClass="text-yellow-400" />
        <StatCard icon={CheckCircle} label="Confirmed" value={confirmedCount} iconClass="text-teal-400" />
        <StatCard icon={XCircle} label="Cancelled" value={cancelledCount} iconClass="text-red-400" />
      </div>

      {/* FILTERS */}
      <div className="flex flex-col lg:flex-row gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">

        {/* Status */}
        <select
          className={`${inputClass} cursor-pointer`}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {/* Expiry From */}
        <div className="flex items-center gap-2 flex-1">
          <label className="text-xs font-semibold text-gray-400 whitespace-nowrap">Expires From</label>
          <input
            type="date"
            className={`${inputClass} flex-1`}
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(0); }}
          />
        </div>

        {/* Expiry To */}
        <div className="flex items-center gap-2 flex-1">
          <label className="text-xs font-semibold text-gray-400 whitespace-nowrap">To</label>
          <input
            type="date"
            className={`${inputClass} flex-1`}
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => { setDateTo(e.target.value); setCurrentPage(0); }}
          />
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all border border-gray-200 whitespace-nowrap"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="rounded-2xl overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 bg-white border border-gray-100 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-teal-600">
            <RefreshCw size={20} className="animate-spin" />
            <span className="text-sm font-medium">Loading orders…</span>
          </div>
        ) : (
          <table className="w-full text-sm border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-green-50 border-b border-green-100">
                {["Order ID", "Product", "Buyer", "Seller", "Status", "Expires", "Actions"].map(h => (
                  <th key={h} className="p-3 text-left text-xs font-semibold text-teal-700 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-sm text-gray-400">
                    {hasActiveFilters ? "No orders match the current filters." : "No orders found."}
                  </td>
                </tr>
              ) : currentItems.map((order, i) => (
                <tr
                  key={order._id}
                  className={`border-b border-gray-50 hover:bg-teal-50 transition-colors ${i % 2 !== 0 ? "bg-gray-50/50" : "bg-white"}`}
                >
                  <td className="p-3">
                    <span className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                      {order._id}
                    </span>
                  </td>

                  <td className="p-3 font-medium text-gray-800">{order.product?.title}</td>

                  <td className="p-3">
                    <div className="font-medium text-gray-700">{order.buyer?.username}</div>
                    <div className="text-xs text-gray-400">{order.buyer?.mobileNumber}</div>
                  </td>

                  <td className="p-3">
                    <div className="font-medium text-gray-700">{order.seller?.username}</div>
                    <div className="text-xs text-gray-400">{order.seller?.mobileNumber}</div>
                  </td>

                  <td className="p-3"><StatusBadge status={order.status} /></td>

                  <td className="p-3">
                    {order.status === "Pending" && order.expiresAt ? (
                      <div>
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
                          <Clock size={11} className="text-amber-400" />
                          {new Date(order.expiresAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                        <div className={`text-xs mt-0.5 ${getRemainingDays(order.expiresAt) === "Expired" ? "text-red-400" : "text-gray-400"}`}>
                          {getRemainingDays(order.expiresAt)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {order.status === "Pending" && (
                        <button
                          onClick={() => setModalData({ id: order._id, action: "confirm" })}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 transition-all"
                        >
                          <CheckCircle size={12} /> Confirm
                        </button>
                      )}
                      {(order.status === "Pending" || order.status === "Confirmed") && (
                        <button
                          onClick={() => setModalData({ id: order._id, action: "cancel" })}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-all"
                        >
                          <XCircle size={12} /> Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      {pageCount > 1 && (
        <div className="flex justify-center mt-2">
          <ReactPaginate
            previousLabel="←"
            nextLabel="→"
            pageCount={pageCount}
            onPageChange={(e) => setCurrentPage(e.selected)}
            containerClassName="flex gap-1.5 items-center"
            pageLinkClassName="w-8 h-8 flex items-center justify-center rounded-lg text-sm border border-green-100 text-teal-700 hover:bg-teal-50 transition-all"
            activeLinkClassName="!bg-teal-500 !text-white !border-teal-500 font-bold"
            previousLinkClassName="w-8 h-8 flex items-center justify-center rounded-lg border border-green-100 text-teal-700 hover:bg-teal-50 text-sm transition-all"
            nextLinkClassName="w-8 h-8 flex items-center justify-center rounded-lg border border-green-100 text-teal-700 hover:bg-teal-50 text-sm transition-all"
          />
        </div>
      )}

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={!!modalData}
        onClose={() => setModalData(null)}
        onConfirm={handleConfirmAction}
        title={modalData?.action === "confirm" ? "Confirm Order" : "Cancel Order"}
        message={modalData?.action === "confirm"
          ? "Are you sure you want to confirm this order?"
          : "Are you sure you want to cancel this order?"}
        confirmText={modalData?.action === "confirm" ? "Confirm" : "Cancel Order"}
        type={modalData?.action === "confirm" ? "info" : "danger"}
      />
    </div>
  );
};

export default OrderManagement;