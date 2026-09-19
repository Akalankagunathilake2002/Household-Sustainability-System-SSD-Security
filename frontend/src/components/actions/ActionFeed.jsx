import { useContext, useEffect, useMemo, useState } from "react";
import {
  createAction,
  deleteAction,
  getAllActions,
  updateAction,
} from "../../services/actionService";
import ActionComposer from "./ActionComposer";
import ActionCard from "./ActionCard";
import { useAuth } from "../../context/AuthContext";

const getCreatedById = (action) =>
  action?.createdBy?._id || action?.createdBy || "";

const ActionFeed = () => {
  const { token, user, isAuthenticated } = useAuth();

  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("community"); // community | mine
  const [error, setError] = useState("");

  const loggedInUserId = user?._id || user?.id || "";

  const fetchActions = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllActions();
      setActions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.msg || "Failed to load actions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const updateSinglePost = (updatedPost) => {
    setActions((prev) =>
      prev.map((item) => (item._id === updatedPost._id ? updatedPost : item))
    );
  };

  const prependPost = (newPost) => {
    setActions((prev) => [newPost, ...prev]);
  };

  const removeSinglePost = (postId) => {
    setActions((prev) => prev.filter((item) => item._id !== postId));
  };

  const filteredActions = useMemo(() => {
    if (activeTab === "mine") {
      return actions.filter(
        (item) => String(getCreatedById(item)) === String(loggedInUserId)
      );
    }
    return actions;
  }, [actions, activeTab, loggedInUserId]);

  const handleCreate = async ({ title, description, category, images }) => {
    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);

      images.forEach((file) => {
        formData.append("images", file);
      });

      const created = await createAction(formData, token);

      // because createAction currently returns plain action without score/populate in your backend
      // safest approach: reload feed
      await fetchActions();

      // if later you update createAction backend to return populated action + score,
      // you can use: prependPost(created);
      return created;
    } catch (err) {
      throw new Error(err?.response?.data?.msg || "Failed to create action");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAction(id, token);
      removeSinglePost(id);
    } catch (err) {
      alert(err?.response?.data?.msg || "Failed to delete action");
    }
  };

  const handleUpdate = async (id, payload) => {
    try {
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("description", payload.description);
      formData.append("category", payload.category);
      formData.append("existingImages", JSON.stringify(payload.existingImages));

      payload.newImages.forEach((file) => {
        formData.append("images", file);
      });

      const updated = await updateAction(id, formData, token);
      updateSinglePost(updated);
      return updated;
    } catch (err) {
      throw new Error(err?.response?.data?.msg || "Failed to update action");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,720px)] xl:grid-cols-[320px_minmax(0,760px)]">
      <aside className="hidden lg:block">
        <div className="sticky top-6 space-y-4">
          <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
            <div className="mb-3 text-sm font-semibold text-slate-700">
              Feed Filters
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setActiveTab("community")}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                  activeTab === "community"
                    ? "bg-emerald-600 text-white shadow"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Community Feed
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => setActiveTab("mine")}
                  className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    activeTab === "mine"
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  My Actions
                </button>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">
              Eco Tip
            </h3>
            <p className="text-sm leading-6 text-slate-600">
              Small daily actions create visible impact. Share real actions with
              photos to inspire others.
            </p>
          </div>
        </div>
      </aside>

      <main className="space-y-5">
        {isAuthenticated && (
          <div className="lg:hidden px-1">
            <div className="flex gap-1.5 rounded-2xl bg-slate-100 p-1.5 shadow-sm border border-slate-200">
              <button
                onClick={() => setActiveTab("community")}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                  activeTab === "community"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500 hover:bg-slate-200/50"
                }`}
              >
                Community
              </button>
              <button
                onClick={() => setActiveTab("mine")}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                  activeTab === "mine"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500 hover:bg-slate-200/50"
                }`}
              >
                My Actions
              </button>
            </div>
          </div>
        )}

        {isAuthenticated && <ActionComposer onSubmit={handleCreate} submitting={submitting} />}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-3xl bg-white p-5 shadow-sm"
              >
                <div className="mb-4 h-4 w-40 rounded bg-slate-200" />
                <div className="mb-2 h-3 w-full rounded bg-slate-200" />
                <div className="mb-2 h-3 w-5/6 rounded bg-slate-200" />
                <div className="h-64 rounded-2xl bg-slate-200" />
              </div>
            ))}
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <p className="text-slate-600">No actions found.</p>
          </div>
        ) : (
          filteredActions.map((action) => (
            <ActionCard
              key={action._id}
              action={action}
              currentUser={user}
              token={token}
              onUpdateSingle={updateSinglePost}
              onDelete={handleDelete}
              onSaveEdit={handleUpdate}
            />
          ))
        )}
      </main>
    </div>
  );
};

export default ActionFeed;
