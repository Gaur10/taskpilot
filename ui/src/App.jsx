import { useAuth0 } from "@auth0/auth0-react";
import TestApi from "./TestApi";


function App() {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  return (
    <div>
      {!isAuthenticated ? (
        <button onClick={() => loginWithRedirect()}>Login</button>
      ) : (
        <>
          <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
            Logout
          </button>
          <TestApi />
        </>
      )}
    </div>
  );
}

export default App;
