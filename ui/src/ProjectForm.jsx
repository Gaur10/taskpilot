import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FAMILY_MEMBERS } from "./config/familyMembers";

/**
 * Form to create a new task with status, due date, and assignment.
 */
export default function ProjectForm({ onProjectCreated }) {
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [dueDate, setDueDate] = useState(null);
  const [assignedToMember, setAssignedToMember] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [familyProfiles, setFamilyProfiles] = useState([]);

  // Fetch family profiles with pictures
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
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
    if (isAuthenticated) {
      fetchProfiles();
    }
  }, [getAccessTokenSilently, isAuthenticated]);

  // Merge static config with dynamic profiles
  const members = FAMILY_MEMBERS.map(member => {
    const profile = familyProfiles.find(p => p.email === member.email || p.userId === member.email);
    return {
      ...member,
      avatar: profile?.avatar || member.avatar,
    };
  });

  const handleMemberChange = (memberEmail) => {
    setAssignedToMember(memberEmail);
  };

  const handleAISuggest = async () => {
    if (!name.trim()) {
      setMessage("⚠️ Enter a task name first to get AI suggestions");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    setAiLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const member = members.find(m => m.email === assignedToMember);
      
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/ai/suggest-description`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskName: name,
          assignedToName: member?.name,
          dueDate,
          tags: [],
        }),
      });

      const data = await res.json();

      if (data.ok && data.description) {
        setDescription(data.description);
        setMessage("✨ AI suggestion added!");
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessage("⚠️ AI service unavailable");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (error) {
      console.error("Error getting AI suggestion:", error);
      setMessage("❌ Failed to get AI suggestion");
      setTimeout(() => setMessage(""), 2000);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage("⚠️ Task name is required.");
      return;
    }
  
    setLoading(true);
    setMessage("");
  
    try {
      const token = await getAccessTokenSilently();
      const payload = {
        name,
        description,
        status,
        dueDate,
        createdByEmail: user?.email || "",
        createdByName: user?.name || user?.email || "Unknown",
      };

      // Add assignment fields if provided
      if (assignedToMember) {
        const member = members.find(m => m.email === assignedToMember);
        if (member) {
          payload.assignedToEmail = member.email;
          payload.assignedToName = member.name;
        }
      }

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
  
      if (data.ok) {
        setMessage("✅ Task created successfully!");
        setName("");
        setDescription("");
        setStatus("todo");
        setDueDate(null);
        setAssignedToMember("");
  
        // Refresh parent list
        onProjectCreated?.();
  
        // Auto-hide success after 2 seconds
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessage(`❌ Failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error creating task:", err);
      setMessage("❌ Network error — please retry.");
    } finally {
      setLoading(false);
    }
  };
  

  if (!isAuthenticated) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-md p-6 mb-8"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Create New Task</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Name *
          </label>
          <input
            type="text"
            placeholder="Enter task name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <button
            type="button"
            onClick={handleAISuggest}
            disabled={aiLoading || !name.trim()}
            className="text-sm px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center gap-1"
          >
            {aiLoading ? (
              <>
                <span className="animate-spin">🔄</span>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>AI Suggest</span>
              </>
            )}
          </button>
        </div>
        <textarea
          placeholder="Enter task description (or use AI Suggest)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign to
          </label>
          <select
            value={assignedToMember}
            onChange={(e) => handleMemberChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">-- Select Family Member --</option>
            {members.map((member) => (
              <option key={member.email} value={member.email}>
                {member.avatar?.type === 'base64' ? '🖼️' : member.avatar?.data || '👤'} {member.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={assignedToMember}
            readOnly
            placeholder="Auto-filled when member selected"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Due Date
        </label>
        <DatePicker
          selected={dueDate}
          onChange={(date) => setDueDate(date)}
          dateFormat="MMM dd, yyyy"
          placeholderText="Select due date"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          minDate={new Date()}
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 rounded-lg font-medium transition duration-200 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {loading ? "Creating..." : "Create Task"}
        </button>

        {message && (
          <p
            className={`text-sm font-medium ${
              message.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
