import React from "react";

/**
 * Activity Log Modal - Shows task history timeline
 */
export default function ActivityLogModal({ isOpen, onClose, task }) {
  if (!isOpen) return null;

  const getActionIcon = (action) => {
    switch (action) {
      case "created":
        return "✨";
      case "assigned":
      case "reassigned":
        return "👤";
      case "unassigned":
        return "❌";
      case "status_changed":
        return "🔄";
      case "completed":
        return "✅";
      case "updated":
        return "✏️";
      default:
        return "📝";
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case "created":
        return "Created";
      case "assigned":
        return "Assigned";
      case "reassigned":
        return "Reassigned";
      case "unassigned":
        return "Unassigned";
      case "status_changed":
        return "Status Changed";
      case "completed":
        return "Completed";
      case "updated":
        return "Updated";
      default:
        return action;
    }
  };

  const formatChanges = (changes) => {
    if (!changes || Object.keys(changes).length === 0) return null;
    
    const items = [];
    
    if (changes.name) {
      items.push(
        <div key="name" className="mb-1">
          <span className="font-medium">Name:</span> {changes.name.from} → {changes.name.to}
        </div>
      );
    }
    
    if (changes.description) {
      items.push(
        <div key="description" className="mb-1">
          <span className="font-medium">Description:</span> {changes.description.from} → {changes.description.to}
        </div>
      );
    }
    
    if (changes.status) {
      if (typeof changes.status === 'string') {
        items.push(
          <div key="status" className="mb-1">
            <span className="font-medium">Status:</span> {changes.status}
          </div>
        );
      } else {
        items.push(
          <div key="status" className="mb-1">
            <span className="font-medium">Status:</span> {changes.status.from || 'none'} → {changes.status.to}
          </div>
        );
      }
    }
    
    if (changes.dueDate) {
      items.push(
        <div key="dueDate" className="mb-1">
          <span className="font-medium">Due date:</span> {changes.dueDate.from} → {changes.dueDate.to}
        </div>
      );
    }
    
    if (changes.assignedTo) {
      if (typeof changes.assignedTo === 'string') {
        items.push(
          <div key="assignedTo" className="mb-1">
            <span className="font-medium">Assigned to:</span> {changes.assignedTo}
          </div>
        );
      } else {
        items.push(
          <div key="assignedTo" className="mb-1">
            <span className="font-medium">Assignment:</span> {changes.assignedTo.from || 'Unassigned'} → {changes.assignedTo.to || 'Unassigned'}
          </div>
        );
      }
    }
    
    return items.length > 0 ? <div>{items}</div> : null;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Task History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Task Info */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{task.name}</h3>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          )}
        </div>

        {/* Activity Timeline */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {task.activityLog && task.activityLog.length > 0 ? (
            <div className="space-y-4">
              {[...task.activityLog].reverse().map((activity, index) => (
                <div key={index} className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-lg">
                    {getActionIcon(activity.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4 border-b border-gray-200 last:border-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-800">
                          {getActionLabel(activity.action)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          by <strong>{activity.performedByName || activity.performedBy}</strong>
                        </p>
                        {formatChanges(activity.changes) && (
                          <div className="text-sm text-gray-700 mt-2 bg-gray-50 px-3 py-2 rounded">
                            {formatChanges(activity.changes)}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No activity history yet</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
