import React, { useState, useEffect, useRef } from 'react';
import './AddressAutocomplete.css';

/**
 * AddressAutocomplete Component
 * 
 * Provides address autocomplete functionality using Google Places API.
 * Falls back to regular text input if Google Maps API is not available.
 * Validates that addresses are selected from Google Places suggestions.
 */

const AddressAutocomplete = ({ 
  value, 
  onChange, 
  onValidationChange,
  placeholder = "Start typing your address...", 
  required = false,
  className = "",
  id
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [placesService, setPlacesService] = useState(null);
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [userHasTyped, setUserHasTyped] = useState(false);
  
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  // Notify parent component when validation status changes
  useEffect(() => {
    if (onValidationChange) {
      // Address is valid if:
      // 1. Google Maps is not loaded (fallback mode) AND value exists, OR
      // 2. Google Maps is loaded AND a valid address was selected from suggestions
      const isValid = (!googleMapsLoaded && value && value.trim().length > 0) || 
                     (googleMapsLoaded && isValidAddress);
      onValidationChange(isValid);
    }
  }, [isValidAddress, googleMapsLoaded, value, onValidationChange]);

  useEffect(() => {
    console.log('🗺️ AddressAutocomplete component mounted');
    
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('✅ Google Maps already loaded');
      initializeGoogleServices();
      return;
    }

    // Try to load Google Maps API
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    console.log('🔑 API Key check:', apiKey ? 'Found' : 'Not found');
    
    // Skip loading if no API key
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      console.log('❌ Google Maps API key not configured - using fallback mode');
      console.log('To enable address autocomplete, add VITE_GOOGLE_MAPS_API_KEY to your .env file');
      return;
    }

    // Load Google Maps script
    console.log('📡 Loading Google Maps API...');
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('✅ Google Maps API loaded successfully');
      setGoogleMapsLoaded(true);
      initializeGoogleServices();
    };
    script.onerror = () => {
      console.error('❌ Failed to load Google Maps API');
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup timeout on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const initializeGoogleServices = () => {
    try {
      if (window.google && window.google.maps && window.google.maps.places) {
        const service = new window.google.maps.places.AutocompleteService();
        setPlacesService(service);
        setGoogleMapsLoaded(true);
        console.log('Google Places service initialized');
      }
    } catch (error) {
      console.error('Error initializing Google Places service:', error);
    }
  };

  const searchAddresses = (query) => {
    if (!placesService || !query.trim() || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    
    const request = {
      input: query,
      types: ['address'],
      componentRestrictions: { country: 'us' },
    };

    placesService.getPlacePredictions(request, (predictions, status) => {
      setIsLoading(false);
      
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        const formattedSuggestions = predictions.map(prediction => ({
          id: prediction.place_id,
          description: prediction.description,
          main_text: prediction.structured_formatting?.main_text || prediction.description,
          secondary_text: prediction.structured_formatting?.secondary_text || ''
        }));
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    });
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setUserHasTyped(true);
    
    // If Google Maps is loaded, mark as invalid until a suggestion is selected
    if (googleMapsLoaded) {
      setIsValidAddress(false);
    }
    
    onChange(newValue);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Debounce the search
    timeoutRef.current = setTimeout(() => {
      searchAddresses(newValue);
    }, 300);
  };

  const handleSuggestionClick = (suggestion) => {
    console.log('✅ Valid address selected:', suggestion.description);
    onChange(suggestion.description);
    setIsValidAddress(true);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

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
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Determine if we should show validation error
  const showValidationError = googleMapsLoaded && userHasTyped && value && value.trim().length > 0 && !isValidAddress;

  // Always render the input, with or without Google Maps
  return (
    <div className="address-autocomplete-container">
      <div className="address-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          required={required}
          className={`form-input ${className} ${showValidationError ? 'address-invalid' : ''} ${isValidAddress ? 'address-valid' : ''}`}
          id={id}
          autoComplete="off"
        />
        {isLoading && (
          <div className="address-loading-indicator">
            <div className="loading-spinner"></div>
          </div>
        )}
        {isValidAddress && (
          <div className="address-valid-indicator">
            <span className="checkmark">✓</span>
          </div>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="address-suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={`address-suggestion ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="suggestion-main">
                {suggestion.main_text}
              </div>
              <div className="suggestion-secondary">
                {suggestion.secondary_text}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showValidationError && (
        <div className="address-validation-error">
          Please select a valid address from the suggestions above
        </div>
      )}
      
      {!googleMapsLoaded && !placesService && (
        <div className="address-fallback-note">
          <small>💡 Address autocomplete available with Google Maps API key</small>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete; 