import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { addComment, removeComment } from "../../services/actionService";

const getCommentUserId = (comment) => comment?.user?._id || comment?.user || "";

const ActionComments = ({
  action,
  currentUser,
  token,
  onUpdateSingle,
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const currentUserId = currentUser?._id || currentUser?.id || "";

  const commentsToShow = useMemo(() => {
    if (showAll) return action.comments || [];
    return (action.comments || []).slice(0, 2);
  }, [action.comments, showAll]);

  const handleComment = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const value = text.trim();
    if (!value) return;

    try {
      setLoading(true);
      const updated = await addComment(action._id, value, token);
      onUpdateSingle(updated);
      setText("");
    } catch (err) {
      alert(err?.response?.data?.msg || err.message || "Failed to comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const updated = await removeComment(action._id, commentId, token);
      onUpdateSingle(updated);
    } catch (err) {
      alert(err?.response?.data?.msg || "Failed to delete comment");
    }
  };

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      {!!action.comments?.length && action.comments.length > 2 && (
        <button
          onClick={() => setShowAll((prev) => !prev)}
          className="mb-3 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          {showAll ? "Hide comments" : `View all ${action.comments.length} comments`}
        </button>
      )}

      <div className="space-y-3">
        {commentsToShow.map((comment) => {
          const ownerId = getCommentUserId(comment);
          const canDelete = String(ownerId) === String(currentUserId);

          return (
            <div
              key={comment._id}
              className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm">
                  <span className="font-semibold text-slate-800">
                    {comment?.user?.username || "User"}
                  </span>{" "}
                  <span className="break-words text-slate-700">{comment.text}</span>
                </div>
              </div>

              {canDelete && (
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="shrink-0 text-xs font-medium text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
        />
        <button
          onClick={handleComment}
          disabled={loading || !text.trim()}
          className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
};

export default ActionComments;
