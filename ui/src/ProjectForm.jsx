import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/**
 * Form to create a new project with status and due date.
 */
export default function ProjectForm({ onProjectCreated }) {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [dueDate, setDueDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage("⚠️ Project name is required.");
      return;
    }
  
    setLoading(true);
    setMessage("");
  
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, status, dueDate }),
      });
  
      const data = await res.json();
  
      if (data.ok) {
        setMessage("✅ Project created successfully!");
        setName("");
        setDescription("");
        setStatus("todo");
        setDueDate(null);
  
        // Refresh parent list
        onProjectCreated?.();
  
        // Auto-hide success after 2 seconds
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessage(`❌ Failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error creating project:", err);
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
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Create New Project</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            placeholder="Enter project name"
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
          placeholder="Enter project description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
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
          {loading ? "Creating..." : "Create Project"}
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
