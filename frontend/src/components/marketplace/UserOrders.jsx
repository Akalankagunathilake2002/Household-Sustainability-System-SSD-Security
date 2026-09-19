import React, { useState, useEffect, useMemo } from "react";
import {
  RefreshCw,
  ShoppingCart,
  Package,
  Phone
} from "lucide-react";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import api from "../../services/api";
import { API_ENDPOINTS } from "../../config/apiConfig";
import ConfirmModal from "../ConfirmModal";
import { useAuth } from "../../context/AuthContext";

const ITEMS_PER_PAGE = 4;

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-yellow-50 text-yellow-700",
    Confirmed: "bg-teal-50 text-teal-700",
    Cancelled: "bg-red-50 text-red-600"
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
};

const getRemainingDays = (expiresAt) => {
  const diff = new Date(expiresAt) - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? `${days}d left` : "Expired";
};

const formatWhatsAppNumber = (number) => {
  if (!number) return null;
  let cleaned = number.replace(/\s+/g, "");
  if (cleaned.startsWith("0")) return "94" + cleaned.substring(1);
  return cleaned;
};

const UserOrders = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [buyerPage, setBuyerPage] = useState(0);
  const [sellerPage, setSellerPage] = useState(0);

  const [modalData, setModalData] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.ORDERS.MY);
      setOrders(res.data.orders || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const buyerOrders = useMemo(
    () => orders.filter((o) => o.buyer?._id === user?._id),
    [orders, user]
  );
  
  const sellerOrders = useMemo(
    () => orders.filter((o) => o.seller?._id === user?._id),
    [orders, user]
  );

  const paginate = (data, page) =>
    data.slice(page * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE + ITEMS_PER_PAGE);

  const buyerPageCount = Math.ceil(buyerOrders.length / ITEMS_PER_PAGE);
  const sellerPageCount = Math.ceil(sellerOrders.length / ITEMS_PER_PAGE);

  const handleConfirmAction = async () => {
    try {
      const res = await api.put(
        `${API_ENDPOINTS.ORDERS.ORDER_STATUS}${modalData.id}/${modalData.action}`
      );
      toast.success(res.data.message);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order.");
    } finally {
      setModalData(null);
    }
  };

  const renderTable = (data, role) => (
    <div className="rounded-2xl overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 bg-white border border-gray-100 shadow-sm mt-4">
      {data.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400">
          No orders found.
        </div>
      ) : (
        <table className="w-full text-sm border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-green-50 border-b border-green-100">
              {["Product", "Counterparty", "Status", "Expires", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="p-3 text-left text-xs font-semibold text-teal-700 uppercase"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((order) => (
              <tr
                key={order._id}
                className="border-b border-gray-50 hover:bg-teal-50"
              >
                <td className="p-3 font-medium">
                  {order.product?.title}
                </td>

                <td className="p-3">
                {(() => {
                    const person =
                    role === "buyer" ? order.seller : order.buyer;

                    const waNumber = role === "buyer" ? formatWhatsAppNumber(person?.mobileNumber) : null;
                    const waMessage = waNumber
                      ? encodeURIComponent(`Hi, I placed a request for "${order.product?.title}" on EcoPulse. Can we arrange the pickup?`)
                      : null;
                    const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${waMessage}` : null;

                    return (
                    <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-gray-800">
                        {person?.username}
                        </span>

                        {person?.mobileNumber ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-400">{person.mobileNumber}</span>
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-green-500 transition-all"
                              title="Chat on WhatsApp"
                            >
                              <Phone size={11} /> WhatsApp
                            </a>
                          )}
                        </div>
                        ) : person?.email ? (
                        <span className="text-xs text-gray-400">
                            {person.email}
                        </span>
                        ) : null}
                    </div>
                    );
                })()}
                </td>

                <td className="p-3">
                  <StatusBadge status={order.status} />
                </td>

                <td className="p-3 text-xs text-gray-500">
                  {order.status === "Pending" && order.expiresAt ? (
                    <div>
                        <div className="text-xs">
                        {new Date(order.expiresAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                        {getRemainingDays(order.expiresAt)}
                        </div>
                    </div>
                    ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>

                <td className="p-3">
                  {order.status === "Pending" && (
                    <div className="flex gap-2">
                      {/* Seller can confirm */}
                      {role === "seller" && (
                        <button
                          onClick={() =>
                            setModalData({
                              id: order._id,
                              action: "confirm"
                            })
                          }
                          className="px-3 py-1 text-xs rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100"
                        >
                          Confirm
                        </button>
                      )}

                      {/* Buyer OR Seller can cancel */}
                      <button
                        onClick={() =>
                          setModalData({
                            id: order._id,
                            action: "cancel"
                          })
                        }
                        className="px-3 py-1 text-xs rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-8">

      {/* HEADER */}
      <header className="flex justify-between items-center">

        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-gray-200 text-teal-700 bg-white hover:bg-teal-50"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </header>

      {/* BUYER SECTION */}
      <section>
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
          <ShoppingCart size={18} /> Orders I Placed
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Track the status of your purchase requests.
        </p>

        {renderTable(
          paginate(buyerOrders, buyerPage),
          "buyer"
        )}

        {buyerPageCount > 1 && (
          <div className="flex justify-center mt-3">
            <ReactPaginate
              previousLabel="←"
              nextLabel="→"
              pageCount={buyerPageCount}
              onPageChange={(e) => setBuyerPage(e.selected)}
              containerClassName="flex gap-1"
              pageLinkClassName="px-3 py-1 border rounded text-sm"
              activeLinkClassName="bg-teal-500 text-white"
            />
          </div>
        )}
      </section>

      {/* SELLER SECTION */}
      <section>
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
          <Package size={18} /> Orders For My Products
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Manage incoming purchase requests for your listings.
        </p>

        {renderTable(
          paginate(sellerOrders, sellerPage),
          "seller"
        )}

        {sellerPageCount > 1 && (
          <div className="flex justify-center mt-3">
            <ReactPaginate
              previousLabel="←"
              nextLabel="→"
              pageCount={sellerPageCount}
              onPageChange={(e) => setSellerPage(e.selected)}
              containerClassName="flex gap-1"
              pageLinkClassName="px-3 py-1 border rounded text-sm"
              activeLinkClassName="bg-teal-500 text-white"
            />
          </div>
        )}
      </section>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={!!modalData}
        onClose={() => setModalData(null)}
        onConfirm={handleConfirmAction}
        title={
          modalData?.action === "confirm"
            ? "Confirm Order"
            : "Cancel Order"
        }
        message={
          modalData?.action === "confirm"
            ? "Are you sure you want to confirm this order?"
            : "Are you sure you want to cancel this order?"
        }
        confirmText={
          modalData?.action === "confirm"
            ? "Confirm"
            : "Cancel Order"
        }
        type={modalData?.action === "confirm" ? "info" : "danger"}
      />
    </div>
  );
};

export default UserOrders;