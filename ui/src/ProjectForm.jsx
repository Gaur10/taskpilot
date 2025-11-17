import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

/**
 * Small form to create a new project.
 * Sends POST /api/projects with Auth0 token.
 */
export default function ProjectForm({ onProjectCreated }) {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
        body: JSON.stringify({ name, description }),
      });
  
      const data = await res.json();
  
      if (data.ok) {
        setMessage("✅ Project created successfully!");
        setName("");
        setDescription("");
  
        // Refresh parent list
        onProjectCreated?.();
  
        // 🔹 Auto-hide success after 2 seconds
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
      style={{
        marginBottom: "1rem",
        padding: "1rem",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#fafafa",
      }}
    >
      <h3>Create New Project</h3>
      <div style={{ marginBottom: "0.5rem" }}>
        <input
          type="text"
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>

      <button
  type="submit"
  disabled={loading}
  style={{
    padding: "0.5rem 1rem",
    backgroundColor: loading ? "#ccc" : "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: loading ? "not-allowed" : "pointer",
  }}
>
  {loading ? "Creating..." : "Create Project"}
</button>

{message && (
  <p
    style={{
      marginTop: "0.5rem",
      color: message.startsWith("✅") ? "green" : "red",
      transition: "opacity 0.3s",
    }}
  >
    {message}
  </p>
)}
    </form>
  );
}
