import { useAuth0 } from "@auth0/auth0-react";
import TestApi from "./TestApi";
import ProjectList from "./ProjectList";

function App() {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {!isAuthenticated ? (
        // Landing Page
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="max-w-4xl w-full text-center">
            <h1 className="text-6xl font-bold text-gray-900 mb-6">
              TaskPilot
            </h1>
            <p className="text-2xl text-gray-600 mb-8">
              Your intelligent task management companion
            </p>
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              Stay organized, meet deadlines, and accomplish more with our intuitive project tracking system.
            </p>
            <button
              onClick={() => loginWithRedirect()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105"
            >
              Get Started →
            </button>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-3">📋</div>
                <h3 className="text-lg font-semibold mb-2">Organize Tasks</h3>
                <p className="text-gray-600">Create, track, and manage all your projects in one place.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-3">⏰</div>
                <h3 className="text-lg font-semibold mb-2">Track Deadlines</h3>
                <p className="text-gray-600">Set due dates and never miss an important deadline.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="text-lg font-semibold mb-2">Stay Productive</h3>
                <p className="text-gray-600">Monitor progress and celebrate your achievements.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Dashboard
        <>
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <h1 className="text-2xl font-bold text-indigo-600">TaskPilot</h1>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {user?.email || user?.name}
                  </span>
                  <button
                    onClick={() =>
                      logout({ logoutParams: { returnTo: window.location.origin } })
                    }
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Optional: Uncomment to show API test */}
            {/* <TestApi /> */}
            
            <ProjectList />
          </main>
        </>
      )}
    </div>
  );
}

export default App;
