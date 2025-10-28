import { useAuth0 } from "@auth0/auth0-react";
import TestApi from "./TestApi";
import ProjectList from "./ProjectList";  // 👈 new import

function App() {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  return (
    <div style={{ padding: "1rem" }}>
      {!isAuthenticated ? (
        <button onClick={() => loginWithRedirect()}>Login</button>
      ) : (
        <>
          <button
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
          >
            Logout
          </button>

          {/* 🔹 Existing API test button */}
          <TestApi />

          {/* 🔹 New Project List section */}
          <ProjectList />
        </>
      )}
    </div>
  );
}

export default App;
