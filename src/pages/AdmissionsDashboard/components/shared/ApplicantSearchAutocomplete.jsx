import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../../components/ui/input';

const ApplicantSearchAutocomplete = ({ searchIndex, placeholder = "Search applicants..." }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Filter results based on search term
  const filteredResults = useMemo(() => {
    if (!searchTerm.trim() || !searchIndex || searchIndex.length === 0) {
      return [];
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    return searchIndex
      .filter(applicant => {
        const fullName = `${applicant.first_name} ${applicant.last_name}`.toLowerCase();
        const email = (applicant.email || '').toLowerCase();
        return fullName.includes(searchLower) || email.includes(searchLower);
      })
      .slice(0, 10); // Limit to 10 results for performance
  }, [searchTerm, searchIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || filteredResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredResults[highlightedIndex]) {
          handleSelectApplicant(filteredResults[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  const handleSelectApplicant = (applicant) => {
    setSearchTerm('');
    setIsOpen(false);
    navigate(`/admissions-dashboard/application/${applicant.application_id}`);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  return (
    <div ref={wrapperRef} className="relative w-[300px]">
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => searchTerm.trim() && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className="w-full font-proxima"
      />
      
      {/* Search icon */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </svg>
      </div>

      {/* Dropdown results */}
      {isOpen && filteredResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-[300px] overflow-y-auto">
          {filteredResults.map((applicant, index) => (
            <div
              key={applicant.applicant_id}
              className={`px-3 py-2 cursor-pointer transition-colors ${
                index === highlightedIndex 
                  ? 'bg-[#4242ea] text-white' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => handleSelectApplicant(applicant)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className={`font-proxima font-medium ${index === highlightedIndex ? 'text-white' : 'text-gray-900'}`}>
                {applicant.first_name} {applicant.last_name}
              </div>
              <div className={`text-sm font-proxima ${index === highlightedIndex ? 'text-white/80' : 'text-gray-500'}`}>
                {applicant.email || 'No email'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && searchTerm.trim() && filteredResults.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="px-3 py-2 text-gray-500 font-proxima text-sm">
            No applicants found
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantSearchAutocomplete;

