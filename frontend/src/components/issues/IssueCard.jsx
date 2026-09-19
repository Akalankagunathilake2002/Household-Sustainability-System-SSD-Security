import React from "react";
import { Link } from "react-router-dom";
import { StatusBadge, PriorityBadge } from "./IssueBadge";

const IssueCard = ({ item }) => {
  return (
    <Link
      to={`/issues/${item._id}`}
      className="group block bg-white rounded-2xl p-5 shadow-sm border border-border hover:shadow-lg hover:-translate-y-1 hover:border-primary-teal/30 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-text-main group-hover:text-primary-teal transition-colors duration-200">
            {item.title}
          </h3>
          <p className="mt-1 text-sm text-text-muted font-medium">
            {item.category}
          </p>
        </div>

        <div className="flex flex-col gap-2 items-end shrink-0">
          <StatusBadge status={item.status} />
          <PriorityBadge priority={item.priority} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-text-muted border-t border-border pt-3">
        <span className="font-medium">Created</span>
        <span>{new Date(item.createdAt).toLocaleString()}</span>
      </div>

      {item.messages?.length > 0 && (
        <div className="mt-4 rounded-xl bg-off-white/70 border border-border p-3">
          <p className="text-sm text-text-main line-clamp-2 leading-relaxed">
            <span className="font-semibold text-primary-teal">Last message: </span>
            {item.messages[item.messages.length - 1].text}
          </p>
        </div>
      )}
    </Link>
  );
};

export default IssueCard;