import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function ProjectList() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchProjects();
  }, [getAccessTokenSilently, isAuthenticated]);

  if (!isAuthenticated) return <p>Please log in to see your projects.</p>;
  if (loading) return <p>Loading projects...</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Your Projects</h2>
      {projects.length === 0 ? (
        <p>No projects found. Try creating one!</p>
      ) : (
        <ul>
          {projects.map((p) => (
            <li key={p._id}>
              <strong>{p.name}</strong> — {p.description || "No description"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
