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
    const searchPlaces = () => {
      if (!value || value.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      // Show suggestions immediately based on common chains
      generateFallbackSuggestions(value, placeType);
      setLoading(false);
    };

    const debounce = setTimeout(searchPlaces, 200);
    return () => clearTimeout(debounce);
  }, [value, placeType]);

  const generateFallbackSuggestions = (searchValue, type) => {
    const search = searchValue.toLowerCase();
    
    if (type === 'school') {
      const schoolTypes = [
        'Elementary School',
        'Middle School', 
        'High School',
        'Charter School',
        'Private School',
        'Montessori School',
        'Preschool',
        'Academy',
      ];
      
      // If user typed a school name, suggest with types
      const suggestions = schoolTypes
        .map(type => ({ 
          name: `${searchValue.charAt(0).toUpperCase() + searchValue.slice(1)} ${type}`,
          address: 'Suggestion'
        }));
      
      // Also add exact match
      suggestions.unshift({
        name: searchValue.charAt(0).toUpperCase() + searchValue.slice(1),
        address: 'Use as typed'
      });
      
      setSuggestions(suggestions.slice(0, 6));
    } else {
      const stores = [
        'Whole Foods Market',
        'Trader Joe\'s',
        'Safeway',
        'Kroger',
        'Albertsons',
        'Costco Wholesale',
        'Target',
        'Walmart Supercenter',
        'Sprouts Farmers Market',
        'Vons',
        'Ralphs',
        'QFC',
        'Fred Meyer',
        'King Soopers',
        'Smith\'s',
        'Food Lion',
        'Publix',
        'H-E-B',
        'Wegmans',
        'Aldi',
        'Lidl',
      ];
      
      const filtered = stores
        .filter(s => s.toLowerCase().includes(search))
        .map(name => ({ name, address: 'Chain store' }));
      
      // Add exact match if not in the list
      if (filtered.length === 0 || !filtered.some(s => s.name.toLowerCase() === search)) {
        filtered.unshift({
          name: searchValue.charAt(0).toUpperCase() + searchValue.slice(1),
          address: 'Use as typed'
        });
      }
      
      setSuggestions(filtered.slice(0, 6));
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
