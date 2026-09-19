import { useEffect, useState } from "react";
import {
  getFlaggedActions,
  deleteAction,
} from "../services/actionService"; 
import { toast } from "react-toastify";

const AdminActions = () => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchFlagged = async () => {
  try {
    const token = localStorage.getItem("token");

    const data = await getFlaggedActions(token);

    console.log("FLAGGED:", data);

    setActions(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("FETCH ERROR:", err);

    toast.error(
      err?.response?.data?.msg || "Failed to load flagged actions ❌"
    );

    setActions([]);
  } finally {
    setLoading(false);
  }
};
  
const handleDelete = (id) => {
  setSelectedId(id);
  setDeleteOpen(true);
};

const confirmDelete = async () => {
  try {
    const token = localStorage.getItem("token");

    await deleteAction(selectedId, token);

    setActions((prev) =>
      prev.filter((a) => a._id !== selectedId)
    );

    toast.success("Action deleted successfully ✅");
  } catch (err) {
    console.error("DELETE ERROR:", err);

    toast.error(
      err?.response?.data?.msg || "Delete failed ❌"
    );
  } finally {
    setDeleteOpen(false);
    setSelectedId(null);
  }
};
  useEffect(() => {
    fetchFlagged();
  }, []);

  if (loading) {
    return <p className="p-4">Loading...</p>;
  }

  return (
    <>
    <div className="p-4 md:p-6 min-h-screen bg-gray-50 pb-24 md:pb-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
          <span className="text-2xl">🚩</span> Flagged Actions
        </h1>
        <p className="text-sm text-slate-500 mt-1">Review reported content from the community.</p>
      </div>

      {actions.length === 0 ? (
        <p>No flagged actions</p>
      ) : (
        <div className="space-y-4">
          {actions.map((action) => (
            <div
              key={action._id}
              className="bg-white rounded-xl shadow p-5 border"
            >
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 items-start">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    {action.title}
                  </h2>
                  <p className="text-sm text-slate-500">
                    by <span className="font-medium text-slate-700">{action.createdBy?.username || "Unknown"}</span>
                  </p>
                </div>

                {/* REPORT COUNT */}
                <div className="bg-red-50 text-red-700 border border-red-100 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                  🚨 {action.reports?.length || 0} Reports
                </div>
              </div>

              {/* DESCRIPTION */}
              <p className="mt-3 text-slate-600 text-sm md:text-base line-clamp-3">
                {action.description}
              </p>

              {/* IMAGE */}
              {action.images?.length > 0 && (
                <img
                  src={action.images[0]}
                  alt="action"
                  className="mt-4 w-full h-48 md:h-60 object-cover rounded-xl"
                />
              )}

              {/* REPORT DETAILS */}
              <div className="mt-5 p-3 md:p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                  Recent Reports
                </h3>

                <div className="space-y-2">
                  {action.reports?.slice(0, 3).map((r, index) => (
                    <div
                      key={index}
                      className="bg-white p-2 md:p-3 rounded-lg border border-slate-200 text-sm"
                    >
                      <span className="font-bold text-slate-700">
                        {r.user?.username || "User"}:
                      </span>{" "}
                      {r.reason}
                    </div>
                  ))}
                </div>
              </div>

              {/* DELETE BUTTON */}
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => handleDelete(action._id)}
                  className="w-full md:w-auto bg-red-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-sm"
                >
                  Delete Action
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
        </div>

      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-white p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
          <h2 className="text-xl font-bold text-slate-800">
            Confirm Deletion
          </h2>

          <p className="mt-2 text-slate-600">
            Are you sure you want to permanently delete this action? This cannot be undone.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={() => setDeleteOpen(false)}
              className="order-2 sm:order-1 flex-1 sm:flex-none rounded-xl bg-slate-100 px-6 py-3 font-semibold text-slate-600 hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>

            <button
              onClick={confirmDelete}
              className="order-1 sm:order-2 flex-1 sm:flex-none rounded-xl bg-red-500 px-6 py-3 font-bold text-white hover:bg-red-600 transition-all shadow-md shadow-red-200"
            >
              Delete Action
            </button>
          </div>
        </div>
      </div>
  </>
);

};

export default AdminActions;