import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";

export default function TestApi() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [result, setResult] = useState(null);

  const callProtectedApi = async () => {
    try {
      const token = await getAccessTokenSilently();
      console.log(token)
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/protected`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: "Failed to call API" });
    }
  };

  if (!isAuthenticated) return <p>Please log in first.</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <button
        onClick={callProtectedApi}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#2563eb",
          color: "white",
          borderRadius: "6px",
        }}
      >
        Call Protected API
      </button>

      <pre
        style={{
          marginTop: "1rem",
          background: "#f3f4f6",
          padding: "1rem",
          borderRadius: "6px",
          fontSize: "0.9rem",
        }}
      >
        {result && JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
