import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import './CompanyAutocomplete.css';

function CompanyAutocomplete({ value, onChange, required = false, className = '' }) {
  const { token } = useAuth();
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const timeoutRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update input when value prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Search companies with debounce
  const searchCompanies = async (query) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/companies/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Debug: Log first result to check logo URLs
        if (data.length > 0) {
          console.log('Company autocomplete - first result:', {
            name: data[0].name,
            domain: data[0].domain,
            logo: data[0].logo,
            source: data[0].source
          });
        }
        
        setSuggestions(data);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Error searching companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setSelectedIndex(-1);

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce search
    timeoutRef.current = setTimeout(() => {
      searchCompanies(newValue);
    }, 300);
  };

  // Handle company selection
  const selectCompany = (company) => {
    // Trim any whitespace from company name
    const cleanName = company.name.trim();
    setInputValue(cleanName);
    onChange(cleanName);
    setIsOpen(false);
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          selectCompany(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="company-autocomplete" ref={wrapperRef}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        required={required}
        placeholder="Start typing company name..."
        className={`company-autocomplete__input ${className}`}
        autoComplete="off"
      />

      {isOpen && (
        <div className="company-autocomplete__dropdown">
          {isLoading && (
            <div className="company-autocomplete__loading">
              Searching companies...
            </div>
          )}

          {!isLoading && suggestions.length === 0 && inputValue.length >= 2 && (
            <div className="company-autocomplete__no-results">
              No companies found. Type to add &quot;{inputValue}&quot;
            </div>
          )}

          {!isLoading && suggestions.length > 0 && (
            <ul className="company-autocomplete__list">
              {suggestions.map((company, index) => (
                <li
                  key={company.id || company.name}
                  className={`company-autocomplete__item ${
                    index === selectedIndex ? 'company-autocomplete__item--selected' : ''
                  }`}
                  onClick={() => selectCompany(company)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="company-autocomplete__item-content">
                    <div className="company-autocomplete__logo-container">
                      {company.logo && (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="company-autocomplete__logo"
                          onError={(e) => {
                            console.log(`Failed to load logo for ${company.name}: ${company.logo}`);
                            e.target.style.visibility = 'hidden';
                          }}
                          onLoad={(e) => {
                            console.log(`Successfully loaded logo for ${company.name}`);
                          }}
                        />
                      )}
                    </div>
                    <div className="company-autocomplete__item-text">
                      <div className="company-autocomplete__name">{company.name.trim()}</div>
                      {company.domain && (
                        <div className="company-autocomplete__domain">{company.domain.trim()}</div>
                      )}
                    </div>
                  </div>
                  {company.source === 'database' && (
                    <span className="company-autocomplete__badge">Saved</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default CompanyAutocomplete;



