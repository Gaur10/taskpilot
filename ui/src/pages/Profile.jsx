import { Link } from 'react-router-dom';

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-gray-800 transition-colors">
              ← Back to Tasks
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span>👤</span>
              Profile
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600">Profile page coming soon...</p>
        </div>
      </div>
    </div>
  );
}
