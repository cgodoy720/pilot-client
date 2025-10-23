// @ts-nocheck
// Global error handler that overrides fetch to handle auth errors automatically
// This ensures all API calls get proper auth error handling without component changes
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
let hasTriggeredAuthModal = stryMutAct_9fa48("29676") ? true : (stryCov_9fa48("29676"), false); // One-time flag to prevent any further modals

// Store original fetch
const originalFetch = window.fetch;

// Create enhanced fetch with global auth error handling
const enhancedFetch = async (...args) => {
  if (stryMutAct_9fa48("29677")) {
    {}
  } else {
    stryCov_9fa48("29677");
    try {
      if (stryMutAct_9fa48("29678")) {
        {}
      } else {
        stryCov_9fa48("29678");
        const response = await originalFetch(...args);

        // Check if this is an API call to our backend
        const url = args[0];
        const isApiCall = stryMutAct_9fa48("29681") ? typeof url === 'string' || url.includes(import.meta.env.VITE_API_URL) : stryMutAct_9fa48("29680") ? false : stryMutAct_9fa48("29679") ? true : (stryCov_9fa48("29679", "29680", "29681"), (stryMutAct_9fa48("29683") ? typeof url !== 'string' : stryMutAct_9fa48("29682") ? true : (stryCov_9fa48("29682", "29683"), typeof url === (stryMutAct_9fa48("29684") ? "" : (stryCov_9fa48("29684"), 'string')))) && url.includes(import.meta.env.VITE_API_URL));

        // Only handle auth errors for our API calls
        if (stryMutAct_9fa48("29687") ? isApiCall || response.status === 401 || response.status === 403 : stryMutAct_9fa48("29686") ? false : stryMutAct_9fa48("29685") ? true : (stryCov_9fa48("29685", "29686", "29687"), isApiCall && (stryMutAct_9fa48("29689") ? response.status === 401 && response.status === 403 : stryMutAct_9fa48("29688") ? true : (stryCov_9fa48("29688", "29689"), (stryMutAct_9fa48("29691") ? response.status !== 401 : stryMutAct_9fa48("29690") ? false : (stryCov_9fa48("29690", "29691"), response.status === 401)) || (stryMutAct_9fa48("29693") ? response.status !== 403 : stryMutAct_9fa48("29692") ? false : (stryCov_9fa48("29692", "29693"), response.status === 403)))))) {
          if (stryMutAct_9fa48("29694")) {
            {}
          } else {
            stryCov_9fa48("29694");
            // First, check if this is an email verification error that should be handled by Login component
            try {
              if (stryMutAct_9fa48("29695")) {
                {}
              } else {
                stryCov_9fa48("29695");
                const errorData = await response.clone().json().catch(stryMutAct_9fa48("29696") ? () => undefined : (stryCov_9fa48("29696"), () => ({})));

                // Skip global handling for email verification errors - let Login component handle it
                if (stryMutAct_9fa48("29699") ? response.status === 403 || errorData.needsVerification : stryMutAct_9fa48("29698") ? false : stryMutAct_9fa48("29697") ? true : (stryCov_9fa48("29697", "29698", "29699"), (stryMutAct_9fa48("29701") ? response.status !== 403 : stryMutAct_9fa48("29700") ? true : (stryCov_9fa48("29700", "29701"), response.status === 403)) && errorData.needsVerification)) {
                  if (stryMutAct_9fa48("29702")) {
                    {}
                  } else {
                    stryCov_9fa48("29702");
                    console.log(stryMutAct_9fa48("29703") ? "" : (stryCov_9fa48("29703"), '📧 Email verification error detected, skipping global handler...'));
                    return response;
                  }
                }
              }
            } catch (parseError) {
              if (stryMutAct_9fa48("29704")) {
                {}
              } else {
                stryCov_9fa48("29704");
                // If we can't parse the error, continue with normal global handling
                console.log(stryMutAct_9fa48("29705") ? "" : (stryCov_9fa48("29705"), '⚠️ Could not parse error data for verification check'));
              }
            }

            // Prevent multiple auth error modals - only trigger once per session
            if (stryMutAct_9fa48("29707") ? false : stryMutAct_9fa48("29706") ? true : (stryCov_9fa48("29706", "29707"), hasTriggeredAuthModal)) {
              if (stryMutAct_9fa48("29708")) {
                {}
              } else {
                stryCov_9fa48("29708");
                console.log(stryMutAct_9fa48("29709") ? "" : (stryCov_9fa48("29709"), '🚫 Auth modal already triggered this session, skipping...'));
                return response;
              }
            }
            hasTriggeredAuthModal = stryMutAct_9fa48("29710") ? false : (stryCov_9fa48("29710"), true);
            console.log(stryMutAct_9fa48("29711") ? "" : (stryCov_9fa48("29711"), '🚨 First auth error detected, triggering modal...'));
            try {
              if (stryMutAct_9fa48("29712")) {
                {}
              } else {
                stryCov_9fa48("29712");
                const errorData = await response.clone().json().catch(stryMutAct_9fa48("29713") ? () => undefined : (stryCov_9fa48("29713"), () => ({})));
                console.log(stryMutAct_9fa48("29714") ? "" : (stryCov_9fa48("29714"), '🚨 Auth error detected:'), stryMutAct_9fa48("29715") ? {} : (stryCov_9fa48("29715"), {
                  status: response.status,
                  errorData
                }));

                // Handle different types of auth errors
                if (stryMutAct_9fa48("29718") ? response.status === 401 || errorData.tokenExpired : stryMutAct_9fa48("29717") ? false : stryMutAct_9fa48("29716") ? true : (stryCov_9fa48("29716", "29717", "29718"), (stryMutAct_9fa48("29720") ? response.status !== 401 : stryMutAct_9fa48("29719") ? true : (stryCov_9fa48("29719", "29720"), response.status === 401)) && errorData.tokenExpired)) {
                  if (stryMutAct_9fa48("29721")) {
                    {}
                  } else {
                    stryCov_9fa48("29721");
                    // Token expired - show simple alert and redirect immediately
                    console.log(stryMutAct_9fa48("29722") ? "" : (stryCov_9fa48("29722"), '🚨 Token expired, redirecting to login...'));

                    // Show brief user-friendly message
                    const message = stryMutAct_9fa48("29725") ? errorData.message && 'Your session has expired. Redirecting to login...' : stryMutAct_9fa48("29724") ? false : stryMutAct_9fa48("29723") ? true : (stryCov_9fa48("29723", "29724", "29725"), errorData.message || (stryMutAct_9fa48("29726") ? "" : (stryCov_9fa48("29726"), 'Your session has expired. Redirecting to login...')));

                    // Emit event for modal (but also do immediate redirect as backup)
                    const event = new CustomEvent(stryMutAct_9fa48("29727") ? "" : (stryCov_9fa48("29727"), 'authError'), stryMutAct_9fa48("29728") ? {} : (stryCov_9fa48("29728"), {
                      detail: stryMutAct_9fa48("29729") ? {} : (stryCov_9fa48("29729"), {
                        type: stryMutAct_9fa48("29730") ? "" : (stryCov_9fa48("29730"), 'token_expired'),
                        message: message
                      })
                    }));
                    window.dispatchEvent(event);

                    // Clear auth data and redirect immediately (don't wait for modal)
                    setTimeout(() => {
                      if (stryMutAct_9fa48("29731")) {
                        {}
                      } else {
                        stryCov_9fa48("29731");
                        localStorage.removeItem(stryMutAct_9fa48("29732") ? "" : (stryCov_9fa48("29732"), 'token'));
                        localStorage.removeItem(stryMutAct_9fa48("29733") ? "" : (stryCov_9fa48("29733"), 'user'));
                        window.location.href = stryMutAct_9fa48("29734") ? "" : (stryCov_9fa48("29734"), '/login');
                      }
                    }, 2000); // 2 second delay to show modal briefly
                  }
                } else if (stryMutAct_9fa48("29737") ? response.status === 403 || errorData.userInactive : stryMutAct_9fa48("29736") ? false : stryMutAct_9fa48("29735") ? true : (stryCov_9fa48("29735", "29736", "29737"), (stryMutAct_9fa48("29739") ? response.status !== 403 : stryMutAct_9fa48("29738") ? true : (stryCov_9fa48("29738", "29739"), response.status === 403)) && errorData.userInactive)) {
                  if (stryMutAct_9fa48("29740")) {
                    {}
                  } else {
                    stryCov_9fa48("29740");
                    // User is inactive - only show modal, no redirect
                    const event = new CustomEvent(stryMutAct_9fa48("29741") ? "" : (stryCov_9fa48("29741"), 'authError'), stryMutAct_9fa48("29742") ? {} : (stryCov_9fa48("29742"), {
                      detail: stryMutAct_9fa48("29743") ? {} : (stryCov_9fa48("29743"), {
                        type: stryMutAct_9fa48("29744") ? "" : (stryCov_9fa48("29744"), 'user_inactive'),
                        message: stryMutAct_9fa48("29747") ? errorData.message && 'Your account now has view-only access. You can browse historical content but cannot make new submissions or access active features.' : stryMutAct_9fa48("29746") ? false : stryMutAct_9fa48("29745") ? true : (stryCov_9fa48("29745", "29746", "29747"), errorData.message || (stryMutAct_9fa48("29748") ? "" : (stryCov_9fa48("29748"), 'Your account now has view-only access. You can browse historical content but cannot make new submissions or access active features.')))
                      })
                    }));
                    window.dispatchEvent(event);
                  }
                } else {
                  if (stryMutAct_9fa48("29749")) {
                    {}
                  } else {
                    stryCov_9fa48("29749");
                    // Generic auth error - show message and redirect immediately
                    console.log(stryMutAct_9fa48("29750") ? "" : (stryCov_9fa48("29750"), '🚨 Auth error, redirecting to login...'));
                    const event = new CustomEvent(stryMutAct_9fa48("29751") ? "" : (stryCov_9fa48("29751"), 'authError'), stryMutAct_9fa48("29752") ? {} : (stryCov_9fa48("29752"), {
                      detail: stryMutAct_9fa48("29753") ? {} : (stryCov_9fa48("29753"), {
                        type: stryMutAct_9fa48("29754") ? "" : (stryCov_9fa48("29754"), 'generic_auth_error'),
                        message: stryMutAct_9fa48("29755") ? "" : (stryCov_9fa48("29755"), 'Authentication error. Redirecting to login...')
                      })
                    }));
                    window.dispatchEvent(event);

                    // Clear auth data and redirect immediately
                    setTimeout(() => {
                      if (stryMutAct_9fa48("29756")) {
                        {}
                      } else {
                        stryCov_9fa48("29756");
                        localStorage.removeItem(stryMutAct_9fa48("29757") ? "" : (stryCov_9fa48("29757"), 'token'));
                        localStorage.removeItem(stryMutAct_9fa48("29758") ? "" : (stryCov_9fa48("29758"), 'user'));
                        window.location.href = stryMutAct_9fa48("29759") ? "" : (stryCov_9fa48("29759"), '/login');
                      }
                    }, 2000);
                  }
                }
              }
            } catch (parseError) {
              if (stryMutAct_9fa48("29760")) {
                {}
              } else {
                stryCov_9fa48("29760");
                console.error(stryMutAct_9fa48("29761") ? "" : (stryCov_9fa48("29761"), 'Error parsing auth error response:'), parseError);

                // Fallback for unparseable errors - immediate redirect
                console.log(stryMutAct_9fa48("29762") ? "" : (stryCov_9fa48("29762"), '🚨 Unparseable auth error, redirecting immediately...'));
                const event = new CustomEvent(stryMutAct_9fa48("29763") ? "" : (stryCov_9fa48("29763"), 'authError'), stryMutAct_9fa48("29764") ? {} : (stryCov_9fa48("29764"), {
                  detail: stryMutAct_9fa48("29765") ? {} : (stryCov_9fa48("29765"), {
                    type: stryMutAct_9fa48("29766") ? "" : (stryCov_9fa48("29766"), 'generic_auth_error'),
                    message: stryMutAct_9fa48("29767") ? "" : (stryCov_9fa48("29767"), 'Authentication error. Redirecting to login...')
                  })
                }));
                window.dispatchEvent(event);

                // Immediate redirect for fallback case
                setTimeout(() => {
                  if (stryMutAct_9fa48("29768")) {
                    {}
                  } else {
                    stryCov_9fa48("29768");
                    localStorage.removeItem(stryMutAct_9fa48("29769") ? "" : (stryCov_9fa48("29769"), 'token'));
                    localStorage.removeItem(stryMutAct_9fa48("29770") ? "" : (stryCov_9fa48("29770"), 'user'));
                    window.location.href = stryMutAct_9fa48("29771") ? "" : (stryCov_9fa48("29771"), '/login');
                  }
                }, 1500);
              }
            }

            // No need to reset flag - we only want one modal per session
          }
        }
        return response;
      }
    } catch (error) {
      if (stryMutAct_9fa48("29772")) {
        {}
      } else {
        stryCov_9fa48("29772");
        // Network errors, etc. - just pass through
        throw error;
      }
    }
  }
};

// Reset auth modal state (useful for page refreshes)
export const resetAuthModalState = () => {
  if (stryMutAct_9fa48("29773")) {
    {}
  } else {
    stryCov_9fa48("29773");
    hasTriggeredAuthModal = stryMutAct_9fa48("29774") ? true : (stryCov_9fa48("29774"), false);
    console.log(stryMutAct_9fa48("29775") ? "" : (stryCov_9fa48("29775"), '🔄 Auth modal state reset'));
  }
};

// Install the global error handler
export const installGlobalErrorHandler = () => {
  if (stryMutAct_9fa48("29776")) {
    {}
  } else {
    stryCov_9fa48("29776");
    if (stryMutAct_9fa48("29779") ? window.fetch !== enhancedFetch : stryMutAct_9fa48("29778") ? false : stryMutAct_9fa48("29777") ? true : (stryCov_9fa48("29777", "29778", "29779"), window.fetch === enhancedFetch)) {
      if (stryMutAct_9fa48("29780")) {
        {}
      } else {
        stryCov_9fa48("29780");
        console.log(stryMutAct_9fa48("29781") ? "" : (stryCov_9fa48("29781"), '⚠️ Global error handler already installed'));
        return;
      }
    }
    window.fetch = enhancedFetch;
    console.log(stryMutAct_9fa48("29782") ? "" : (stryCov_9fa48("29782"), '🔧 Global auth error handler installed'));
  }
};

// Uninstall the global error handler
export const uninstallGlobalErrorHandler = () => {
  if (stryMutAct_9fa48("29783")) {
    {}
  } else {
    stryCov_9fa48("29783");
    window.fetch = originalFetch;
    console.log(stryMutAct_9fa48("29784") ? "" : (stryCov_9fa48("29784"), '🔧 Global auth error handler removed'));
  }
};

// Auto-install when this module is imported
installGlobalErrorHandler();