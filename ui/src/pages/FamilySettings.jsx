import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import PlaceAutocomplete from '../components/PlaceAutocomplete';

export default function FamilySettings() {
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [settings, setSettings] = useState({
    groceryStores: [],
    schools: [],
    neighborhood: '',
    zipCode: '',
    routines: {
      groceryShopping: '',
      schoolPickup: '',
      other: '',
    },
  });

  const [newStore, setNewStore] = useState('');
  const [newSchool, setNewSchool] = useState({ name: '', pickupTime: '', location: '' });
  const [cityState, setCityState] = useState('');
  const [lookingUpZip, setLookingUpZip] = useState(false);

  // Fetch settings on load
  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lookup city/state when zip code changes
  useEffect(() => {
    const lookupZipCode = async () => {
      if (settings.zipCode && settings.zipCode.length === 5) {
        setLookingUpZip(true);
        try {
          const response = await fetch(`https://api.zippopotam.us/us/${settings.zipCode}`);
          if (response.ok) {
            const data = await response.json();
            const place = data.places[0];
            setCityState(`${place['place name']}, ${place['state abbreviation']}`);
          } else {
            setCityState('');
          }
        } catch (error) {
          console.error('Error looking up zip code:', error);
          setCityState('');
        } finally {
          setLookingUpZip(false);
        }
      } else {
        setCityState('');
      }
    };

    const debounce = setTimeout(lookupZipCode, 500);
    return () => clearTimeout(debounce);
  }, [settings.zipCode]);

  const fetchSettings = async () => {
    try {
      const token = await getAccessTokenSilently();
      const apiUrl = import.meta.env.VITE_API_URL;
      console.log('Fetching settings from:', `${apiUrl}/api/settings`);
      
      const response = await fetch(`${apiUrl}/api/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('Settings loaded:', data);
        setSettings(data.settings.preferences);
      } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        setMessage({ type: 'error', text: `Failed to load settings: ${response.status}` });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: `Failed to load settings: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ preferences: settings }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Settings saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: `Failed to save: ${error.message}` });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const addStore = () => {
    if (newStore.trim() && settings.groceryStores.length < 10) {
      setSettings({
        ...settings,
        groceryStores: [...settings.groceryStores, newStore.trim()],
      });
      setNewStore('');
    }
  };

  const removeStore = (index) => {
    setSettings({
      ...settings,
      groceryStores: settings.groceryStores.filter((_, i) => i !== index),
    });
  };

  const addSchool = () => {
    if (newSchool.name.trim() && settings.schools.length < 5) {
      setSettings({
        ...settings,
        schools: [...settings.schools, newSchool],
      });
      setNewSchool({ name: '', pickupTime: '', location: '' });
    }
  };

  const removeSchool = (index) => {
    setSettings({
      ...settings,
      schools: settings.schools.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back to Tasks
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>⚙️</span>
                Family Settings
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Location Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📍</span>
              Location Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code
                </label>
                <input
                  type="text"
                  value={settings.zipCode}
                  onChange={(e) =>
                    setSettings({ ...settings, zipCode: e.target.value })
                  }
                  placeholder="e.g., 98101"
                  maxLength={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {lookingUpZip && (
                  <p className="text-xs text-blue-600 mt-1">🔍 Looking up location...</p>
                )}
                {cityState && !lookingUpZip && (
                  <p className="text-xs text-green-600 mt-1">📍 {cityState}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  AI will use this to find nearby stores and understand your area
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Neighborhood (Optional)
                </label>
                <input
                  type="text"
                  value={settings.neighborhood}
                  onChange={(e) =>
                    setSettings({ ...settings, neighborhood: e.target.value })
                  }
                  placeholder="e.g., Downtown Seattle near Pike Place"
                  maxLength={200}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {settings.neighborhood.length}/200 characters - Add specific landmarks if helpful
                </p>
              </div>
            </div>
          </div>

          {/* Grocery Stores */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🏪</span>
              Preferred Grocery Stores
              <span className="text-sm font-normal text-gray-500">
                (max 10, within 10mi)
              </span>
            </h2>
            
            {/* Add Store */}
            <div className="flex gap-2 mb-4">
              <PlaceAutocomplete
                value={newStore}
                onChange={setNewStore}
                onSelect={(storeName) => {
                  setNewStore(storeName);
                  // Auto-add if under limit
                  if (settings.groceryStores.length < 10) {
                    setSettings({
                      ...settings,
                      groceryStores: [...settings.groceryStores, storeName],
                    });
                    setNewStore('');
                  }
                }}
                zipCode={settings.zipCode}
                placeType="store"
                placeholder="Store name (e.g., Whole Foods Downtown)"
                disabled={settings.groceryStores.length >= 10}
              />
              <button
                onClick={addStore}
                disabled={!newStore.trim() || settings.groceryStores.length >= 10}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                + Add
              </button>
            </div>

            {/* Store List */}
            <div className="space-y-2">
              {settings.groceryStores.map((store, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <span className="text-gray-700">{store}</span>
                  <button
                    onClick={() => removeStore(index)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    ✕ Remove
                  </button>
                </div>
              ))}
              {settings.groceryStores.length === 0 && (
                <p className="text-gray-500 text-sm italic">No stores added yet</p>
              )}
            </div>
          </div>

          {/* Schools */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🏫</span>
              Schools
              <span className="text-sm font-normal text-gray-500">(max 5)</span>
            </h2>

            {/* Add School */}
            <div className="space-y-3 mb-4 p-4 bg-gray-50 rounded-lg">
              <PlaceAutocomplete
                value={newSchool.name}
                onChange={(name) => setNewSchool({ ...newSchool, name })}
                onSelect={(schoolName) => setNewSchool({ ...newSchool, name: schoolName })}
                zipCode={settings.zipCode}
                placeType="school"
                placeholder="School name (required)"
                disabled={settings.schools.length >= 5}
              />
              <input
                type="text"
                value={newSchool.location}
                onChange={(e) =>
                  setNewSchool({ ...newSchool, location: e.target.value })
                }
                placeholder="Location (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={newSchool.pickupTime}
                onChange={(e) =>
                  setNewSchool({ ...newSchool, pickupTime: e.target.value })
                }
                placeholder="Pickup time (optional, e.g., 3:15 PM)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addSchool}
                disabled={!newSchool.name.trim() || settings.schools.length >= 5}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                + Add School
              </button>
            </div>

            {/* School List */}
            <div className="space-y-3">
              {settings.schools.map((school, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-md border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{school.name}</h3>
                    <button
                      onClick={() => removeSchool(index)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                      ✕ Remove
                    </button>
                  </div>
                  {school.location && (
                    <p className="text-sm text-gray-600">📍 {school.location}</p>
                  )}
                  {school.pickupTime && (
                    <p className="text-sm text-gray-600">🕐 Pickup: {school.pickupTime}</p>
                  )}
                </div>
              ))}
              {settings.schools.length === 0 && (
                <p className="text-gray-500 text-sm italic">No schools added yet</p>
              )}
            </div>
          </div>

          {/* Routines */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📝</span>
              Routines & Preferences
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grocery Shopping Routine
                </label>
                <textarea
                  value={settings.routines.groceryShopping}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      routines: {
                        ...settings.routines,
                        groceryShopping: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., Usually shop on weekends, prefer organic products"
                  maxLength={200}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {settings.routines.groceryShopping.length}/200 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Pickup Routine
                </label>
                <textarea
                  value={settings.routines.schoolPickup}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      routines: {
                        ...settings.routines,
                        schoolPickup: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., Leave 10 minutes early to account for traffic"
                  maxLength={200}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {settings.routines.schoolPickup.length}/200 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Notes
                </label>
                <textarea
                  value={settings.routines.other}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      routines: {
                        ...settings.routines,
                        other: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., Avoid I-5 during rush hour, dog walking daily at 6 PM"
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {settings.routines.other.length}/500 characters
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-4">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : '💾 Save Settings'}
            </button>
            <Link
              to="/"
              className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
