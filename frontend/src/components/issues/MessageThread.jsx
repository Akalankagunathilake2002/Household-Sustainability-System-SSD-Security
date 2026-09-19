import React from "react";

const MessageThread = ({ messages = [] }) => {
  return (
    <div className="flex flex-col gap-4">
      {messages.map((m) => {
        const isAdmin = m.senderRole === "admin";

        return (
          <div
            key={m._id || `${m.senderId}-${m.createdAt}`}
            className={`rounded-2xl border p-4 shadow-sm transition-all duration-200 ${
              isAdmin
                ? "bg-gradient-to-br from-purple-50 to-white border-purple-200"
                : "bg-white border-border"
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${
                  isAdmin
                    ? "text-purple-700 bg-purple-100 border-purple-200"
                    : "text-primary-teal bg-teal-50 border-teal-200"
                }`}
              >
                {isAdmin ? "Admin Advice" : "User"}
              </span>

              <span className="text-xs text-text-muted font-medium">
                {new Date(m.createdAt).toLocaleString()}
              </span>
            </div>

            <p className="text-sm text-text-main whitespace-pre-wrap leading-relaxed">
              {m.text}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default MessageThread;