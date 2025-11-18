import React, { useState } from "react";
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
  const [message, setMessage] = useState("");

  const handleMemberChange = (memberEmail) => {
    setAssignedToMember(memberEmail);
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
        const member = FAMILY_MEMBERS.find(m => m.email === assignedToMember);
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          placeholder="Enter task description (optional)"
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
            {FAMILY_MEMBERS.map((member) => (
              <option key={member.email} value={member.email}>
                {member.name}
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
