// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
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
  placeholder = stryMutAct_9fa48("318") ? "" : (stryCov_9fa48("318"), "Start typing your address..."),
  required = stryMutAct_9fa48("319") ? true : (stryCov_9fa48("319"), false),
  className = stryMutAct_9fa48("320") ? "Stryker was here!" : (stryCov_9fa48("320"), ""),
  id
}) => {
  if (stryMutAct_9fa48("321")) {
    {}
  } else {
    stryCov_9fa48("321");
    const [suggestions, setSuggestions] = useState(stryMutAct_9fa48("322") ? ["Stryker was here"] : (stryCov_9fa48("322"), []));
    const [isLoading, setIsLoading] = useState(stryMutAct_9fa48("323") ? true : (stryCov_9fa48("323"), false));
    const [showSuggestions, setShowSuggestions] = useState(stryMutAct_9fa48("324") ? true : (stryCov_9fa48("324"), false));
    const [selectedIndex, setSelectedIndex] = useState(stryMutAct_9fa48("325") ? +1 : (stryCov_9fa48("325"), -1));
    const [googleMapsLoaded, setGoogleMapsLoaded] = useState(stryMutAct_9fa48("326") ? true : (stryCov_9fa48("326"), false));
    const [placesService, setPlacesService] = useState(null);
    const [isValidAddress, setIsValidAddress] = useState(stryMutAct_9fa48("327") ? true : (stryCov_9fa48("327"), false));
    const [userHasTyped, setUserHasTyped] = useState(stryMutAct_9fa48("328") ? true : (stryCov_9fa48("328"), false));
    const inputRef = useRef(null);
    const timeoutRef = useRef(null);

    // Notify parent component when validation status changes
    useEffect(() => {
      if (stryMutAct_9fa48("329")) {
        {}
      } else {
        stryCov_9fa48("329");
        if (stryMutAct_9fa48("331") ? false : stryMutAct_9fa48("330") ? true : (stryCov_9fa48("330", "331"), onValidationChange)) {
          if (stryMutAct_9fa48("332")) {
            {}
          } else {
            stryCov_9fa48("332");
            // Address is valid if:
            // 1. Google Maps is not loaded (fallback mode) AND value exists, OR
            // 2. Google Maps is loaded AND a valid address was selected from suggestions
            const isValid = stryMutAct_9fa48("335") ? !googleMapsLoaded && value && value.trim().length > 0 && googleMapsLoaded && isValidAddress : stryMutAct_9fa48("334") ? false : stryMutAct_9fa48("333") ? true : (stryCov_9fa48("333", "334", "335"), (stryMutAct_9fa48("337") ? !googleMapsLoaded && value || value.trim().length > 0 : stryMutAct_9fa48("336") ? false : (stryCov_9fa48("336", "337"), (stryMutAct_9fa48("339") ? !googleMapsLoaded || value : stryMutAct_9fa48("338") ? true : (stryCov_9fa48("338", "339"), (stryMutAct_9fa48("340") ? googleMapsLoaded : (stryCov_9fa48("340"), !googleMapsLoaded)) && value)) && (stryMutAct_9fa48("343") ? value.trim().length <= 0 : stryMutAct_9fa48("342") ? value.trim().length >= 0 : stryMutAct_9fa48("341") ? true : (stryCov_9fa48("341", "342", "343"), (stryMutAct_9fa48("344") ? value.length : (stryCov_9fa48("344"), value.trim().length)) > 0)))) || (stryMutAct_9fa48("346") ? googleMapsLoaded || isValidAddress : stryMutAct_9fa48("345") ? false : (stryCov_9fa48("345", "346"), googleMapsLoaded && isValidAddress)));
            onValidationChange(isValid);
          }
        }
      }
    }, stryMutAct_9fa48("347") ? [] : (stryCov_9fa48("347"), [isValidAddress, googleMapsLoaded, value, onValidationChange]));
    useEffect(() => {
      if (stryMutAct_9fa48("348")) {
        {}
      } else {
        stryCov_9fa48("348");
        console.log(stryMutAct_9fa48("349") ? "" : (stryCov_9fa48("349"), '🗺️ AddressAutocomplete component mounted'));

        // Check if Google Maps is already loaded
        if (stryMutAct_9fa48("352") ? window.google && window.google.maps || window.google.maps.places : stryMutAct_9fa48("351") ? false : stryMutAct_9fa48("350") ? true : (stryCov_9fa48("350", "351", "352"), (stryMutAct_9fa48("354") ? window.google || window.google.maps : stryMutAct_9fa48("353") ? true : (stryCov_9fa48("353", "354"), window.google && window.google.maps)) && window.google.maps.places)) {
          if (stryMutAct_9fa48("355")) {
            {}
          } else {
            stryCov_9fa48("355");
            console.log(stryMutAct_9fa48("356") ? "" : (stryCov_9fa48("356"), '✅ Google Maps already loaded'));
            initializeGoogleServices();
            return;
          }
        }

        // Try to load Google Maps API
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        console.log(stryMutAct_9fa48("357") ? "" : (stryCov_9fa48("357"), '🔑 API Key check:'), apiKey ? stryMutAct_9fa48("358") ? "" : (stryCov_9fa48("358"), 'Found') : stryMutAct_9fa48("359") ? "" : (stryCov_9fa48("359"), 'Not found'));

        // Skip loading if no API key
        if (stryMutAct_9fa48("362") ? !apiKey && apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE' : stryMutAct_9fa48("361") ? false : stryMutAct_9fa48("360") ? true : (stryCov_9fa48("360", "361", "362"), (stryMutAct_9fa48("363") ? apiKey : (stryCov_9fa48("363"), !apiKey)) || (stryMutAct_9fa48("365") ? apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE' : stryMutAct_9fa48("364") ? false : (stryCov_9fa48("364", "365"), apiKey === (stryMutAct_9fa48("366") ? "" : (stryCov_9fa48("366"), 'YOUR_GOOGLE_MAPS_API_KEY_HERE')))))) {
          if (stryMutAct_9fa48("367")) {
            {}
          } else {
            stryCov_9fa48("367");
            console.log(stryMutAct_9fa48("368") ? "" : (stryCov_9fa48("368"), '❌ Google Maps API key not configured - using fallback mode'));
            console.log(stryMutAct_9fa48("369") ? "" : (stryCov_9fa48("369"), 'To enable address autocomplete, add VITE_GOOGLE_MAPS_API_KEY to your .env file'));
            return;
          }
        }

        // Load Google Maps script
        console.log(stryMutAct_9fa48("370") ? "" : (stryCov_9fa48("370"), '📡 Loading Google Maps API...'));
        const script = document.createElement(stryMutAct_9fa48("371") ? "" : (stryCov_9fa48("371"), 'script'));
        script.src = stryMutAct_9fa48("372") ? `` : (stryCov_9fa48("372"), `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`);
        script.async = stryMutAct_9fa48("373") ? false : (stryCov_9fa48("373"), true);
        script.defer = stryMutAct_9fa48("374") ? false : (stryCov_9fa48("374"), true);
        script.onload = () => {
          if (stryMutAct_9fa48("375")) {
            {}
          } else {
            stryCov_9fa48("375");
            console.log(stryMutAct_9fa48("376") ? "" : (stryCov_9fa48("376"), '✅ Google Maps API loaded successfully'));
            setGoogleMapsLoaded(stryMutAct_9fa48("377") ? false : (stryCov_9fa48("377"), true));
            initializeGoogleServices();
          }
        };
        script.onerror = () => {
          if (stryMutAct_9fa48("378")) {
            {}
          } else {
            stryCov_9fa48("378");
            console.error(stryMutAct_9fa48("379") ? "" : (stryCov_9fa48("379"), '❌ Failed to load Google Maps API'));
          }
        };
        document.head.appendChild(script);
        return () => {
          if (stryMutAct_9fa48("380")) {
            {}
          } else {
            stryCov_9fa48("380");
            // Cleanup timeout on unmount
            if (stryMutAct_9fa48("382") ? false : stryMutAct_9fa48("381") ? true : (stryCov_9fa48("381", "382"), timeoutRef.current)) {
              if (stryMutAct_9fa48("383")) {
                {}
              } else {
                stryCov_9fa48("383");
                clearTimeout(timeoutRef.current);
              }
            }
          }
        };
      }
    }, stryMutAct_9fa48("384") ? ["Stryker was here"] : (stryCov_9fa48("384"), []));
    const initializeGoogleServices = () => {
      if (stryMutAct_9fa48("385")) {
        {}
      } else {
        stryCov_9fa48("385");
        try {
          if (stryMutAct_9fa48("386")) {
            {}
          } else {
            stryCov_9fa48("386");
            if (stryMutAct_9fa48("389") ? window.google && window.google.maps || window.google.maps.places : stryMutAct_9fa48("388") ? false : stryMutAct_9fa48("387") ? true : (stryCov_9fa48("387", "388", "389"), (stryMutAct_9fa48("391") ? window.google || window.google.maps : stryMutAct_9fa48("390") ? true : (stryCov_9fa48("390", "391"), window.google && window.google.maps)) && window.google.maps.places)) {
              if (stryMutAct_9fa48("392")) {
                {}
              } else {
                stryCov_9fa48("392");
                const service = new window.google.maps.places.AutocompleteService();
                setPlacesService(service);
                setGoogleMapsLoaded(stryMutAct_9fa48("393") ? false : (stryCov_9fa48("393"), true));
                console.log(stryMutAct_9fa48("394") ? "" : (stryCov_9fa48("394"), 'Google Places service initialized'));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("395")) {
            {}
          } else {
            stryCov_9fa48("395");
            console.error(stryMutAct_9fa48("396") ? "" : (stryCov_9fa48("396"), 'Error initializing Google Places service:'), error);
          }
        }
      }
    };
    const searchAddresses = query => {
      if (stryMutAct_9fa48("397")) {
        {}
      } else {
        stryCov_9fa48("397");
        if (stryMutAct_9fa48("400") ? (!placesService || !query.trim()) && query.length < 3 : stryMutAct_9fa48("399") ? false : stryMutAct_9fa48("398") ? true : (stryCov_9fa48("398", "399", "400"), (stryMutAct_9fa48("402") ? !placesService && !query.trim() : stryMutAct_9fa48("401") ? false : (stryCov_9fa48("401", "402"), (stryMutAct_9fa48("403") ? placesService : (stryCov_9fa48("403"), !placesService)) || (stryMutAct_9fa48("404") ? query.trim() : (stryCov_9fa48("404"), !(stryMutAct_9fa48("405") ? query : (stryCov_9fa48("405"), query.trim())))))) || (stryMutAct_9fa48("408") ? query.length >= 3 : stryMutAct_9fa48("407") ? query.length <= 3 : stryMutAct_9fa48("406") ? false : (stryCov_9fa48("406", "407", "408"), query.length < 3)))) {
          if (stryMutAct_9fa48("409")) {
            {}
          } else {
            stryCov_9fa48("409");
            setSuggestions(stryMutAct_9fa48("410") ? ["Stryker was here"] : (stryCov_9fa48("410"), []));
            setShowSuggestions(stryMutAct_9fa48("411") ? true : (stryCov_9fa48("411"), false));
            return;
          }
        }
        setIsLoading(stryMutAct_9fa48("412") ? false : (stryCov_9fa48("412"), true));
        const request = stryMutAct_9fa48("413") ? {} : (stryCov_9fa48("413"), {
          input: query,
          types: stryMutAct_9fa48("414") ? [] : (stryCov_9fa48("414"), [stryMutAct_9fa48("415") ? "" : (stryCov_9fa48("415"), 'address')]),
          componentRestrictions: stryMutAct_9fa48("416") ? {} : (stryCov_9fa48("416"), {
            country: stryMutAct_9fa48("417") ? "" : (stryCov_9fa48("417"), 'us')
          })
        });
        placesService.getPlacePredictions(request, (predictions, status) => {
          if (stryMutAct_9fa48("418")) {
            {}
          } else {
            stryCov_9fa48("418");
            setIsLoading(stryMutAct_9fa48("419") ? true : (stryCov_9fa48("419"), false));
            if (stryMutAct_9fa48("422") ? status === window.google.maps.places.PlacesServiceStatus.OK || predictions : stryMutAct_9fa48("421") ? false : stryMutAct_9fa48("420") ? true : (stryCov_9fa48("420", "421", "422"), (stryMutAct_9fa48("424") ? status !== window.google.maps.places.PlacesServiceStatus.OK : stryMutAct_9fa48("423") ? true : (stryCov_9fa48("423", "424"), status === window.google.maps.places.PlacesServiceStatus.OK)) && predictions)) {
              if (stryMutAct_9fa48("425")) {
                {}
              } else {
                stryCov_9fa48("425");
                const formattedSuggestions = predictions.map(stryMutAct_9fa48("426") ? () => undefined : (stryCov_9fa48("426"), prediction => stryMutAct_9fa48("427") ? {} : (stryCov_9fa48("427"), {
                  id: prediction.place_id,
                  description: prediction.description,
                  main_text: stryMutAct_9fa48("430") ? prediction.structured_formatting?.main_text && prediction.description : stryMutAct_9fa48("429") ? false : stryMutAct_9fa48("428") ? true : (stryCov_9fa48("428", "429", "430"), (stryMutAct_9fa48("431") ? prediction.structured_formatting.main_text : (stryCov_9fa48("431"), prediction.structured_formatting?.main_text)) || prediction.description),
                  secondary_text: stryMutAct_9fa48("434") ? prediction.structured_formatting?.secondary_text && '' : stryMutAct_9fa48("433") ? false : stryMutAct_9fa48("432") ? true : (stryCov_9fa48("432", "433", "434"), (stryMutAct_9fa48("435") ? prediction.structured_formatting.secondary_text : (stryCov_9fa48("435"), prediction.structured_formatting?.secondary_text)) || (stryMutAct_9fa48("436") ? "Stryker was here!" : (stryCov_9fa48("436"), '')))
                })));
                setSuggestions(formattedSuggestions);
                setShowSuggestions(stryMutAct_9fa48("437") ? false : (stryCov_9fa48("437"), true));
                setSelectedIndex(stryMutAct_9fa48("438") ? +1 : (stryCov_9fa48("438"), -1));
              }
            } else {
              if (stryMutAct_9fa48("439")) {
                {}
              } else {
                stryCov_9fa48("439");
                setSuggestions(stryMutAct_9fa48("440") ? ["Stryker was here"] : (stryCov_9fa48("440"), []));
                setShowSuggestions(stryMutAct_9fa48("441") ? true : (stryCov_9fa48("441"), false));
              }
            }
          }
        });
      }
    };
    const handleInputChange = e => {
      if (stryMutAct_9fa48("442")) {
        {}
      } else {
        stryCov_9fa48("442");
        const newValue = e.target.value;
        setUserHasTyped(stryMutAct_9fa48("443") ? false : (stryCov_9fa48("443"), true));

        // If Google Maps is loaded, mark as invalid until a suggestion is selected
        if (stryMutAct_9fa48("445") ? false : stryMutAct_9fa48("444") ? true : (stryCov_9fa48("444", "445"), googleMapsLoaded)) {
          if (stryMutAct_9fa48("446")) {
            {}
          } else {
            stryCov_9fa48("446");
            setIsValidAddress(stryMutAct_9fa48("447") ? true : (stryCov_9fa48("447"), false));
          }
        }
        onChange(newValue);

        // Clear existing timeout
        if (stryMutAct_9fa48("449") ? false : stryMutAct_9fa48("448") ? true : (stryCov_9fa48("448", "449"), timeoutRef.current)) {
          if (stryMutAct_9fa48("450")) {
            {}
          } else {
            stryCov_9fa48("450");
            clearTimeout(timeoutRef.current);
          }
        }

        // Debounce the search
        timeoutRef.current = setTimeout(() => {
          if (stryMutAct_9fa48("451")) {
            {}
          } else {
            stryCov_9fa48("451");
            searchAddresses(newValue);
          }
        }, 300);
      }
    };
    const handleSuggestionClick = suggestion => {
      if (stryMutAct_9fa48("452")) {
        {}
      } else {
        stryCov_9fa48("452");
        console.log(stryMutAct_9fa48("453") ? "" : (stryCov_9fa48("453"), '✅ Valid address selected:'), suggestion.description);
        onChange(suggestion.description);
        setIsValidAddress(stryMutAct_9fa48("454") ? false : (stryCov_9fa48("454"), true));
        setShowSuggestions(stryMutAct_9fa48("455") ? true : (stryCov_9fa48("455"), false));
        setSuggestions(stryMutAct_9fa48("456") ? ["Stryker was here"] : (stryCov_9fa48("456"), []));
        setSelectedIndex(stryMutAct_9fa48("457") ? +1 : (stryCov_9fa48("457"), -1));
      }
    };
    const handleKeyDown = e => {
      if (stryMutAct_9fa48("458")) {
        {}
      } else {
        stryCov_9fa48("458");
        if (stryMutAct_9fa48("461") ? !showSuggestions && suggestions.length === 0 : stryMutAct_9fa48("460") ? false : stryMutAct_9fa48("459") ? true : (stryCov_9fa48("459", "460", "461"), (stryMutAct_9fa48("462") ? showSuggestions : (stryCov_9fa48("462"), !showSuggestions)) || (stryMutAct_9fa48("464") ? suggestions.length !== 0 : stryMutAct_9fa48("463") ? false : (stryCov_9fa48("463", "464"), suggestions.length === 0)))) return;
        switch (e.key) {
          case stryMutAct_9fa48("466") ? "" : (stryCov_9fa48("466"), 'ArrowDown'):
            if (stryMutAct_9fa48("465")) {} else {
              stryCov_9fa48("465");
              e.preventDefault();
              setSelectedIndex(stryMutAct_9fa48("467") ? () => undefined : (stryCov_9fa48("467"), prev => (stryMutAct_9fa48("471") ? prev >= suggestions.length - 1 : stryMutAct_9fa48("470") ? prev <= suggestions.length - 1 : stryMutAct_9fa48("469") ? false : stryMutAct_9fa48("468") ? true : (stryCov_9fa48("468", "469", "470", "471"), prev < (stryMutAct_9fa48("472") ? suggestions.length + 1 : (stryCov_9fa48("472"), suggestions.length - 1)))) ? stryMutAct_9fa48("473") ? prev - 1 : (stryCov_9fa48("473"), prev + 1) : prev));
              break;
            }
          case stryMutAct_9fa48("475") ? "" : (stryCov_9fa48("475"), 'ArrowUp'):
            if (stryMutAct_9fa48("474")) {} else {
              stryCov_9fa48("474");
              e.preventDefault();
              setSelectedIndex(stryMutAct_9fa48("476") ? () => undefined : (stryCov_9fa48("476"), prev => (stryMutAct_9fa48("480") ? prev <= 0 : stryMutAct_9fa48("479") ? prev >= 0 : stryMutAct_9fa48("478") ? false : stryMutAct_9fa48("477") ? true : (stryCov_9fa48("477", "478", "479", "480"), prev > 0)) ? stryMutAct_9fa48("481") ? prev + 1 : (stryCov_9fa48("481"), prev - 1) : stryMutAct_9fa48("482") ? +1 : (stryCov_9fa48("482"), -1)));
              break;
            }
          case stryMutAct_9fa48("484") ? "" : (stryCov_9fa48("484"), 'Enter'):
            if (stryMutAct_9fa48("483")) {} else {
              stryCov_9fa48("483");
              e.preventDefault();
              if (stryMutAct_9fa48("487") ? selectedIndex >= 0 || selectedIndex < suggestions.length : stryMutAct_9fa48("486") ? false : stryMutAct_9fa48("485") ? true : (stryCov_9fa48("485", "486", "487"), (stryMutAct_9fa48("490") ? selectedIndex < 0 : stryMutAct_9fa48("489") ? selectedIndex > 0 : stryMutAct_9fa48("488") ? true : (stryCov_9fa48("488", "489", "490"), selectedIndex >= 0)) && (stryMutAct_9fa48("493") ? selectedIndex >= suggestions.length : stryMutAct_9fa48("492") ? selectedIndex <= suggestions.length : stryMutAct_9fa48("491") ? true : (stryCov_9fa48("491", "492", "493"), selectedIndex < suggestions.length)))) {
                if (stryMutAct_9fa48("494")) {
                  {}
                } else {
                  stryCov_9fa48("494");
                  handleSuggestionClick(suggestions[selectedIndex]);
                }
              }
              break;
            }
          case stryMutAct_9fa48("496") ? "" : (stryCov_9fa48("496"), 'Escape'):
            if (stryMutAct_9fa48("495")) {} else {
              stryCov_9fa48("495");
              setShowSuggestions(stryMutAct_9fa48("497") ? true : (stryCov_9fa48("497"), false));
              setSelectedIndex(stryMutAct_9fa48("498") ? +1 : (stryCov_9fa48("498"), -1));
              break;
            }
          default:
            if (stryMutAct_9fa48("499")) {} else {
              stryCov_9fa48("499");
              break;
            }
        }
      }
    };
    const handleBlur = () => {
      if (stryMutAct_9fa48("500")) {
        {}
      } else {
        stryCov_9fa48("500");
        // Delay hiding suggestions to allow for clicks
        setTimeout(() => {
          if (stryMutAct_9fa48("501")) {
            {}
          } else {
            stryCov_9fa48("501");
            setShowSuggestions(stryMutAct_9fa48("502") ? true : (stryCov_9fa48("502"), false));
            setSelectedIndex(stryMutAct_9fa48("503") ? +1 : (stryCov_9fa48("503"), -1));
          }
        }, 200);
      }
    };
    const handleFocus = () => {
      if (stryMutAct_9fa48("504")) {
        {}
      } else {
        stryCov_9fa48("504");
        if (stryMutAct_9fa48("508") ? suggestions.length <= 0 : stryMutAct_9fa48("507") ? suggestions.length >= 0 : stryMutAct_9fa48("506") ? false : stryMutAct_9fa48("505") ? true : (stryCov_9fa48("505", "506", "507", "508"), suggestions.length > 0)) {
          if (stryMutAct_9fa48("509")) {
            {}
          } else {
            stryCov_9fa48("509");
            setShowSuggestions(stryMutAct_9fa48("510") ? false : (stryCov_9fa48("510"), true));
          }
        }
      }
    };

    // Determine if we should show validation error
    const showValidationError = stryMutAct_9fa48("513") ? googleMapsLoaded && userHasTyped && value && value.trim().length > 0 || !isValidAddress : stryMutAct_9fa48("512") ? false : stryMutAct_9fa48("511") ? true : (stryCov_9fa48("511", "512", "513"), (stryMutAct_9fa48("515") ? googleMapsLoaded && userHasTyped && value || value.trim().length > 0 : stryMutAct_9fa48("514") ? true : (stryCov_9fa48("514", "515"), (stryMutAct_9fa48("517") ? googleMapsLoaded && userHasTyped || value : stryMutAct_9fa48("516") ? true : (stryCov_9fa48("516", "517"), (stryMutAct_9fa48("519") ? googleMapsLoaded || userHasTyped : stryMutAct_9fa48("518") ? true : (stryCov_9fa48("518", "519"), googleMapsLoaded && userHasTyped)) && value)) && (stryMutAct_9fa48("522") ? value.trim().length <= 0 : stryMutAct_9fa48("521") ? value.trim().length >= 0 : stryMutAct_9fa48("520") ? true : (stryCov_9fa48("520", "521", "522"), (stryMutAct_9fa48("523") ? value.length : (stryCov_9fa48("523"), value.trim().length)) > 0)))) && (stryMutAct_9fa48("524") ? isValidAddress : (stryCov_9fa48("524"), !isValidAddress)));

    // Always render the input, with or without Google Maps
    return <div className="address-autocomplete-container">
      <div className="address-input-wrapper">
        <input ref={inputRef} type="text" value={value} onChange={handleInputChange} onKeyDown={handleKeyDown} onBlur={handleBlur} onFocus={handleFocus} placeholder={placeholder} required={required} className={stryMutAct_9fa48("525") ? `` : (stryCov_9fa48("525"), `form-input ${className} ${showValidationError ? stryMutAct_9fa48("526") ? "" : (stryCov_9fa48("526"), 'address-invalid') : stryMutAct_9fa48("527") ? "Stryker was here!" : (stryCov_9fa48("527"), '')} ${isValidAddress ? stryMutAct_9fa48("528") ? "" : (stryCov_9fa48("528"), 'address-valid') : stryMutAct_9fa48("529") ? "Stryker was here!" : (stryCov_9fa48("529"), '')}`)} id={id} autoComplete="off" />
        {stryMutAct_9fa48("532") ? isLoading || <div className="address-loading-indicator">
            <div className="loading-spinner"></div>
          </div> : stryMutAct_9fa48("531") ? false : stryMutAct_9fa48("530") ? true : (stryCov_9fa48("530", "531", "532"), isLoading && <div className="address-loading-indicator">
            <div className="loading-spinner"></div>
          </div>)}
        {stryMutAct_9fa48("535") ? isValidAddress || <div className="address-valid-indicator">
            <span className="checkmark">✓</span>
          </div> : stryMutAct_9fa48("534") ? false : stryMutAct_9fa48("533") ? true : (stryCov_9fa48("533", "534", "535"), isValidAddress && <div className="address-valid-indicator">
            <span className="checkmark">✓</span>
          </div>)}
      </div>
      
      {stryMutAct_9fa48("538") ? showSuggestions && suggestions.length > 0 || <div className="address-suggestions">
          {suggestions.map((suggestion, index) => <div key={suggestion.id} className={`address-suggestion ${index === selectedIndex ? 'selected' : ''}`} onClick={() => handleSuggestionClick(suggestion)}>
              <div className="suggestion-main">
                {suggestion.main_text}
              </div>
              <div className="suggestion-secondary">
                {suggestion.secondary_text}
              </div>
            </div>)}
        </div> : stryMutAct_9fa48("537") ? false : stryMutAct_9fa48("536") ? true : (stryCov_9fa48("536", "537", "538"), (stryMutAct_9fa48("540") ? showSuggestions || suggestions.length > 0 : stryMutAct_9fa48("539") ? true : (stryCov_9fa48("539", "540"), showSuggestions && (stryMutAct_9fa48("543") ? suggestions.length <= 0 : stryMutAct_9fa48("542") ? suggestions.length >= 0 : stryMutAct_9fa48("541") ? true : (stryCov_9fa48("541", "542", "543"), suggestions.length > 0)))) && <div className="address-suggestions">
          {suggestions.map(stryMutAct_9fa48("544") ? () => undefined : (stryCov_9fa48("544"), (suggestion, index) => <div key={suggestion.id} className={stryMutAct_9fa48("545") ? `` : (stryCov_9fa48("545"), `address-suggestion ${(stryMutAct_9fa48("548") ? index !== selectedIndex : stryMutAct_9fa48("547") ? false : stryMutAct_9fa48("546") ? true : (stryCov_9fa48("546", "547", "548"), index === selectedIndex)) ? stryMutAct_9fa48("549") ? "" : (stryCov_9fa48("549"), 'selected') : stryMutAct_9fa48("550") ? "Stryker was here!" : (stryCov_9fa48("550"), '')}`)} onClick={stryMutAct_9fa48("551") ? () => undefined : (stryCov_9fa48("551"), () => handleSuggestionClick(suggestion))}>
              <div className="suggestion-main">
                {suggestion.main_text}
              </div>
              <div className="suggestion-secondary">
                {suggestion.secondary_text}
              </div>
            </div>))}
        </div>)}
      
      {stryMutAct_9fa48("554") ? showValidationError || <div className="address-validation-error">
          Please select a valid address from the suggestions above
        </div> : stryMutAct_9fa48("553") ? false : stryMutAct_9fa48("552") ? true : (stryCov_9fa48("552", "553", "554"), showValidationError && <div className="address-validation-error">
          Please select a valid address from the suggestions above
        </div>)}
      
      {stryMutAct_9fa48("557") ? !googleMapsLoaded && !placesService || <div className="address-fallback-note">
          <small>💡 Address autocomplete available with Google Maps API key</small>
        </div> : stryMutAct_9fa48("556") ? false : stryMutAct_9fa48("555") ? true : (stryCov_9fa48("555", "556", "557"), (stryMutAct_9fa48("559") ? !googleMapsLoaded || !placesService : stryMutAct_9fa48("558") ? true : (stryCov_9fa48("558", "559"), (stryMutAct_9fa48("560") ? googleMapsLoaded : (stryCov_9fa48("560"), !googleMapsLoaded)) && (stryMutAct_9fa48("561") ? placesService : (stryCov_9fa48("561"), !placesService)))) && <div className="address-fallback-note">
          <small>💡 Address autocomplete available with Google Maps API key</small>
        </div>)}
    </div>;
  }
};
export default AddressAutocomplete;