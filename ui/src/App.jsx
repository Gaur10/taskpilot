import { useAuth0 } from "@auth0/auth0-react";
import { Routes, Route } from "react-router-dom";
import ProjectList from "./ProjectList";
import FamilySettings from "./pages/FamilySettings";
import Profile from "./pages/Profile";
import Preferences from "./pages/Preferences";
import UserMenu from "./components/UserMenu";

function App() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

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
                <div className="text-3xl mb-3">👨‍👩‍👧‍👦</div>
                <h3 className="text-lg font-semibold mb-2">Family Calendar</h3>
                <p className="text-gray-600">Manage tasks together with your family in one shared space.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-semibold mb-2">Assign Tasks</h3>
                <p className="text-gray-600">Assign tasks to family members and track who's doing what.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
                <p className="text-gray-600">Monitor deadlines, view history, and stay organized together.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Dashboard
        <Routes>
          {/* Main Dashboard */}
          <Route
            path="/"
            element={
              <>
                <nav className="bg-white shadow-sm">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                      <h1 className="text-2xl font-bold text-indigo-600">TaskPilot</h1>
                      <UserMenu />
                    </div>
                  </div>
                </nav>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <ProjectList />
                </main>
              </>
            }
          />

          {/* Settings Pages */}
          <Route path="/settings" element={<FamilySettings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/preferences" element={<Preferences />} />
        </Routes>
      )}
    </div>
  );
}

export default App;
