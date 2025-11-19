import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

export default function PlaceAutocomplete({ 
  value, 
  onChange, 
  onSelect, 
  zipCode, 
  placeType, 
  placeholder,
  disabled 
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search for places when user types
  useEffect(() => {
    const searchPlaces = async () => {
      if (!value || value.length < 2 || !zipCode || zipCode.length !== 5) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        // Using Overpass API (OpenStreetMap) for free place search
        const overpassQuery = `
          [out:json][timeout:5];
          area[postal_code="${zipCode}"]->.searchArea;
          (
            node[amenity=${placeType === 'school' ? 'school' : 'supermarket'}]["name"~"${value}",i](area.searchArea);
            way[amenity=${placeType === 'school' ? 'school' : 'supermarket'}]["name"~"${value}",i](area.searchArea);
          );
          out center 10;
        `;

        const response = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: overpassQuery,
        });

        if (response.ok) {
          const data = await response.json();
          const places = data.elements.map(el => ({
            name: el.tags?.name || 'Unknown',
            address: [el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(', '),
          }));
          setSuggestions(places.slice(0, 5));
          setShowSuggestions(true);
        } else {
          // Fallback: generate common suggestions
          generateFallbackSuggestions(value, placeType);
        }
      } catch (error) {
        console.error('Error fetching places:', error);
        generateFallbackSuggestions(value, placeType);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchPlaces, 300);
    return () => clearTimeout(debounce);
  }, [value, zipCode, placeType]);

  const generateFallbackSuggestions = (searchValue, type) => {
    if (type === 'school') {
      const schools = [
        'Elementary School',
        'Middle School', 
        'High School',
        'Charter School',
        'Private School',
      ];
      setSuggestions(
        schools
          .filter(s => s.toLowerCase().includes(searchValue.toLowerCase()))
          .map(name => ({ name: `${searchValue} ${name}`, address: 'Near you' }))
      );
    } else {
      const stores = [
        'Whole Foods Market',
        'Safeway',
        'Kroger',
        'Trader Joe\'s',
        'Costco',
        'Target',
        'Walmart',
        'Albertsons',
      ];
      setSuggestions(
        stores
          .filter(s => s.toLowerCase().includes(searchValue.toLowerCase()))
          .map(name => ({ name, address: 'Chain store' }))
      );
    }
    setShowSuggestions(true);
  };

  const handleSelect = (suggestion) => {
    onSelect(suggestion.name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      
      {loading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelect(suggestion)}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">{suggestion.name}</div>
              {suggestion.address && (
                <div className="text-xs text-gray-500">{suggestion.address}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {!disabled && !zipCode && (
        <p className="text-xs text-orange-600 mt-1">
          💡 Enter zip code above to get suggestions
        </p>
      )}
    </div>
  );
}

PlaceAutocomplete.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  zipCode: PropTypes.string,
  placeType: PropTypes.oneOf(['school', 'store']).isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
};

PlaceAutocomplete.defaultProps = {
  placeholder: 'Start typing...',
  disabled: false,
  zipCode: '',
};
