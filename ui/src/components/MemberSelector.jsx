import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function MemberSelector({ members, selectedEmail, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedMember = members.find(m => m.email === selectedEmail);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-left flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {selectedMember ? (
            <>
              {selectedMember.avatar?.type === 'base64' ? (
                <img
                  src={selectedMember.avatar.data}
                  alt={selectedMember.name}
                  className="w-6 h-6 rounded-full object-cover border border-gray-300"
                />
              ) : (
                <span className="w-6 h-6 flex items-center justify-center text-base">
                  {selectedMember.avatar?.data || '👤'}
                </span>
              )}
              <span>{selectedMember.name}</span>
            </>
          ) : (
            <span className="text-gray-500">-- Select Family Member --</span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          <button
            type="button"
            onClick={() => {
              onSelect('');
              setIsOpen(false);
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors text-gray-500"
          >
            -- Select Family Member --
          </button>
          {members.map((member) => (
            <button
              key={member.email}
              type="button"
              onClick={() => {
                onSelect(member.email);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left hover:bg-indigo-50 transition-colors flex items-center gap-2 ${
                selectedEmail === member.email ? 'bg-indigo-100' : ''
              }`}
            >
              {member.avatar?.type === 'base64' ? (
                <img
                  src={member.avatar.data}
                  alt={member.name}
                  className="w-6 h-6 rounded-full object-cover border border-gray-300"
                />
              ) : (
                <span className="w-6 h-6 flex items-center justify-center text-base">
                  {member.avatar?.data || '👤'}
                </span>
              )}
              <span>{member.name}</span>
              {selectedEmail === member.email && (
                <svg className="w-4 h-4 ml-auto text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

MemberSelector.propTypes = {
  members: PropTypes.arrayOf(PropTypes.shape({
    email: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.shape({
      type: PropTypes.string,
      data: PropTypes.string,
    }),
  })).isRequired,
  selectedEmail: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};
