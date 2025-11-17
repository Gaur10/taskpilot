import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import ProjectForm from "./ProjectForm";

export default function ProjectList() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Define fetchProjects so it can be reused
  const fetchProjects = async () => {
    try {
      if (!isAuthenticated) return;
      const token = await getAccessTokenSilently();

      const res = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.ok) {
        setProjects(data.projects);
      } else {
        console.error("❌ Failed to fetch projects:", data.error);
      }
    } catch (err) {
      console.error("❌ Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Allow ProjectForm to trigger a refresh
  const refreshProjects = () => {
    setLoading(true);
    fetchProjects();
  };

  // ✅ Initial load
  useEffect(() => {
    fetchProjects();
  }, [getAccessTokenSilently, isAuthenticated]);

  if (!isAuthenticated) return <p>Please log in to see your projects.</p>;
  if (loading) return <p>Loading projects...</p>;

  
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
  
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
  
      if (data.ok) {
        alert("✅ Project deleted successfully!");
        refreshProjects(); // Re-fetch projects after deletion
      } else {
        alert(`❌ Failed to delete: ${data.error}`);
      }
    } catch (err) {
      console.error("Error deleting:", err);
      alert("⚠️ Network or auth error while deleting.");
    }
  };
  
  // ✅ Render UI
  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "auto" }}>
    <h2>Your Projects</h2>
    <ProjectForm onProjectCreated={refreshProjects} />

    <div
      style={{
        backgroundColor: "#f9f9f9",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "1rem",
      }}
    >
      {projects.length === 0 ? (
        <p>No projects found. Try creating one!</p>
      ) : (
        <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
          {projects.map((p) => (
  <li
    key={p._id}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "0.5rem",
    }}
  >
    <div>
      <strong>{p.name}</strong> — {p.description || "No description"}
    </div>

    <button
      onClick={() => handleDelete(p._id)}
      style={{
        backgroundColor: "#dc3545",
        color: "white",
        border: "none",
        borderRadius: "4px",
        padding: "0.25rem 0.5rem",
        cursor: "pointer",
      }}
    >
      Delete
    </button>
  </li>
))}
        </ul>
      )}
    </div>
  </div>
  );
}
