import React, { useEffect, useState, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import ProjectForm from "./ProjectForm";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FAMILY_MEMBERS } from "./config/familyMembers";
import ActivityLogModal from "./components/ActivityLogModal";
import MemberSelector from "./components/MemberSelector";

export default function ProjectList() {
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();
  const [projects, setProjects] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [familyProfiles, setFamilyProfiles] = useState([]);

  // Fetch family profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        if (!isAuthenticated) return;
        const token = await getAccessTokenSilently();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/family`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setFamilyProfiles(data.profiles || []);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      }
    };
    fetchProfiles();
  }, [getAccessTokenSilently, isAuthenticated]);

  const fetchProjects = useCallback(async () => {
    try {
      if (!isAuthenticated) return;
      const token = await getAccessTokenSilently();

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.ok) {
        setProjects(data.tasks || []);
      } else {
        console.error("❌ Failed to fetch tasks:", data.error);
        setProjects([]);
      }
    } catch (err) {
      console.error("❌ Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently, isAuthenticated]);

  const refreshProjects = () => {
    setLoading(true);
    fetchProjects();
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.ok) {
        refreshProjects();
      } else {
        alert(`❌ Failed to delete: ${data.error}`);
      }
    } catch (err) {
      console.error("Error deleting:", err);
      alert("⚠️ Network or auth error while deleting.");
    }
  };

  const startEdit = (project) => {
    setEditingProject(project._id);
    setEditForm({
      name: project.name,
      description: project.description,
      status: project.status,
      dueDate: project.dueDate ? new Date(project.dueDate) : null,
      assignedToEmail: project.assignedToEmail || "",
      assignedToName: project.assignedToName || "",
    });
  };

  const cancelEdit = () => {
    setEditingProject(null);
    setEditForm({});
  };

  const saveEdit = async (id) => {
    try {
      const token = await getAccessTokenSilently();
      const payload = {
        ...editForm,
        performedByEmail: user?.email || "",
        performedByName: user?.name || user?.email || "Unknown",
      };

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.ok) {
        setEditingProject(null);
        setEditForm({});
        refreshProjects();
      } else {
        alert(`❌ Failed to update: ${data.error}`);
      }
    } catch (err) {
      console.error("Error updating:", err);
      alert("⚠️ Network error while updating.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "todo":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "done":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "todo":
        return "To Do";
      case "in-progress":
        return "In Progress";
      case "done":
        return "Done";
      default:
        return status;
    }
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === "done") return false;
    return new Date(dueDate) < new Date();
  };

  if (!isAuthenticated) return <p className="text-center text-gray-600">Please log in to see your tasks.</p>;
  if (loading) return <p className="text-center text-gray-600">Loading tasks...</p>;
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Family Tasks</h2>
      <ProjectForm onProjectCreated={refreshProjects} />

      {projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-xl text-gray-600">No tasks yet</p>
          <p className="text-gray-500 mt-2">Create your first task to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const overdue = isOverdue(project.dueDate, project.status);
            const isEditing = editingProject === project._id;

            return (
              <div
                key={project._id}
                className={`bg-white rounded-lg shadow-md p-6 transition duration-300 hover:shadow-lg ${
                  overdue ? "border-2 border-red-500" : ""
                }`}
              >
                {isEditing ? (
                  // Edit Mode
                  <div>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500"
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500"
                    />
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    <div className="mb-3">
                      <MemberSelector
                        members={FAMILY_MEMBERS.map(member => {
                          const profile = familyProfiles.find(p => p.email === member.email);
                          return {
                            ...member,
                            avatar: profile?.avatar || member.avatar,
                            name: profile?.name || member.name,
                          };
                        })}
                        selectedEmail={editForm.assignedToEmail || ""}
                        onSelect={(email) => {
                          const memberStatic = FAMILY_MEMBERS.find(m => m.email === email);
                          const memberProfile = familyProfiles.find(p => p.email === email);
                          setEditForm({ 
                            ...editForm, 
                            assignedToEmail: email,
                            assignedToName: memberProfile?.name || memberStatic?.name || ""
                          });
                        }}
                      />
                    </div>
                    <input
                      type="email"
                      value={editForm.assignedToEmail || ""}
                      readOnly
                      placeholder="Auto-filled when member selected"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 bg-gray-50 text-gray-700"
                    />
                    <DatePicker
                      selected={editForm.dueDate}
                      onChange={(date) => setEditForm({ ...editForm, dueDate: date })}
                      dateFormat="MMM dd, yyyy"
                      placeholderText="Select due date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500"
                      minDate={new Date()}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(project._id)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 flex-1">{project.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 min-h-[40px]">
                      {project.description || "No description"}
                    </p>

                    {project.assignedToEmail && (() => {
                      const profile = familyProfiles.find(p => p.email === project.assignedToEmail || p.userId === project.assignedToEmail);
                      return (
                        <div className="flex items-center gap-2 mb-3 text-sm text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">
                          {profile?.avatar?.type === 'base64' ? (
                            <img
                              src={profile.avatar.data}
                              alt="Profile"
                              className="w-6 h-6 rounded-full object-cover border-2 border-indigo-300"
                            />
                          ) : (
                            <span className="w-6 h-6 flex items-center justify-center text-base">
                              {profile?.avatar?.data || '👤'}
                            </span>
                          )}
                          <span>
                            <strong>{project.assignedToName || project.assignedToEmail}</strong>
                          </span>
                        </div>
                      );
                    })()}

                    {project.dueDate && (
                      <div className={`flex items-center gap-2 mb-4 text-sm ${overdue ? "text-red-600 font-semibold" : "text-gray-500"}`}>
                        <span>📅</span>
                        <span>
                          Due: {new Date(project.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {overdue && <span className="ml-2">⚠️ OVERDUE</span>}
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setSelectedTask(project)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200"
                        title="View activity history"
                      >
                        📊 History
                      </button>
                      <button
                        onClick={() => startEdit(project)}
                        className="flex-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium py-2 px-4 rounded-lg transition duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project._id)}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Activity Log Modal */}
      <ActivityLogModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask || {}}
      />
    </div>
  );
}
