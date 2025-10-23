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
let hasTriggeredAuthModal = stryMutAct_9fa48("29677") ? true : (stryCov_9fa48("29677"), false); // One-time flag to prevent any further modals

// Store original fetch
const originalFetch = window.fetch;

// Create enhanced fetch with global auth error handling
const enhancedFetch = async (...args) => {
  if (stryMutAct_9fa48("29678")) {
    {}
  } else {
    stryCov_9fa48("29678");
    try {
      if (stryMutAct_9fa48("29679")) {
        {}
      } else {
        stryCov_9fa48("29679");
        const response = await originalFetch(...args);

        // Check if this is an API call to our backend
        const url = args[0];
        const isApiCall = stryMutAct_9fa48("29682") ? typeof url === 'string' || url.includes(import.meta.env.VITE_API_URL) : stryMutAct_9fa48("29681") ? false : stryMutAct_9fa48("29680") ? true : (stryCov_9fa48("29680", "29681", "29682"), (stryMutAct_9fa48("29684") ? typeof url !== 'string' : stryMutAct_9fa48("29683") ? true : (stryCov_9fa48("29683", "29684"), typeof url === (stryMutAct_9fa48("29685") ? "" : (stryCov_9fa48("29685"), 'string')))) && url.includes(import.meta.env.VITE_API_URL));

        // Only handle auth errors for our API calls
        if (stryMutAct_9fa48("29688") ? isApiCall || response.status === 401 || response.status === 403 : stryMutAct_9fa48("29687") ? false : stryMutAct_9fa48("29686") ? true : (stryCov_9fa48("29686", "29687", "29688"), isApiCall && (stryMutAct_9fa48("29690") ? response.status === 401 && response.status === 403 : stryMutAct_9fa48("29689") ? true : (stryCov_9fa48("29689", "29690"), (stryMutAct_9fa48("29692") ? response.status !== 401 : stryMutAct_9fa48("29691") ? false : (stryCov_9fa48("29691", "29692"), response.status === 401)) || (stryMutAct_9fa48("29694") ? response.status !== 403 : stryMutAct_9fa48("29693") ? false : (stryCov_9fa48("29693", "29694"), response.status === 403)))))) {
          if (stryMutAct_9fa48("29695")) {
            {}
          } else {
            stryCov_9fa48("29695");
            // First, check if this is an email verification error that should be handled by Login component
            try {
              if (stryMutAct_9fa48("29696")) {
                {}
              } else {
                stryCov_9fa48("29696");
                const errorData = await response.clone().json().catch(stryMutAct_9fa48("29697") ? () => undefined : (stryCov_9fa48("29697"), () => ({})));

                // Skip global handling for email verification errors - let Login component handle it
                if (stryMutAct_9fa48("29700") ? response.status === 403 || errorData.needsVerification : stryMutAct_9fa48("29699") ? false : stryMutAct_9fa48("29698") ? true : (stryCov_9fa48("29698", "29699", "29700"), (stryMutAct_9fa48("29702") ? response.status !== 403 : stryMutAct_9fa48("29701") ? true : (stryCov_9fa48("29701", "29702"), response.status === 403)) && errorData.needsVerification)) {
                  if (stryMutAct_9fa48("29703")) {
                    {}
                  } else {
                    stryCov_9fa48("29703");
                    console.log(stryMutAct_9fa48("29704") ? "" : (stryCov_9fa48("29704"), '📧 Email verification error detected, skipping global handler...'));
                    return response;
                  }
                }
              }
            } catch (parseError) {
              if (stryMutAct_9fa48("29705")) {
                {}
              } else {
                stryCov_9fa48("29705");
                // If we can't parse the error, continue with normal global handling
                console.log(stryMutAct_9fa48("29706") ? "" : (stryCov_9fa48("29706"), '⚠️ Could not parse error data for verification check'));
              }
            }

            // Prevent multiple auth error modals - only trigger once per session
            if (stryMutAct_9fa48("29708") ? false : stryMutAct_9fa48("29707") ? true : (stryCov_9fa48("29707", "29708"), hasTriggeredAuthModal)) {
              if (stryMutAct_9fa48("29709")) {
                {}
              } else {
                stryCov_9fa48("29709");
                console.log(stryMutAct_9fa48("29710") ? "" : (stryCov_9fa48("29710"), '🚫 Auth modal already triggered this session, skipping...'));
                return response;
              }
            }
            hasTriggeredAuthModal = stryMutAct_9fa48("29711") ? false : (stryCov_9fa48("29711"), true);
            console.log(stryMutAct_9fa48("29712") ? "" : (stryCov_9fa48("29712"), '🚨 First auth error detected, triggering modal...'));
            try {
              if (stryMutAct_9fa48("29713")) {
                {}
              } else {
                stryCov_9fa48("29713");
                const errorData = await response.clone().json().catch(stryMutAct_9fa48("29714") ? () => undefined : (stryCov_9fa48("29714"), () => ({})));
                console.log(stryMutAct_9fa48("29715") ? "" : (stryCov_9fa48("29715"), '🚨 Auth error detected:'), stryMutAct_9fa48("29716") ? {} : (stryCov_9fa48("29716"), {
                  status: response.status,
                  errorData
                }));

                // Handle different types of auth errors
                if (stryMutAct_9fa48("29719") ? response.status === 401 || errorData.tokenExpired : stryMutAct_9fa48("29718") ? false : stryMutAct_9fa48("29717") ? true : (stryCov_9fa48("29717", "29718", "29719"), (stryMutAct_9fa48("29721") ? response.status !== 401 : stryMutAct_9fa48("29720") ? true : (stryCov_9fa48("29720", "29721"), response.status === 401)) && errorData.tokenExpired)) {
                  if (stryMutAct_9fa48("29722")) {
                    {}
                  } else {
                    stryCov_9fa48("29722");
                    // Token expired - show simple alert and redirect immediately
                    console.log(stryMutAct_9fa48("29723") ? "" : (stryCov_9fa48("29723"), '🚨 Token expired, redirecting to login...'));

                    // Show brief user-friendly message
                    const message = stryMutAct_9fa48("29726") ? errorData.message && 'Your session has expired. Redirecting to login...' : stryMutAct_9fa48("29725") ? false : stryMutAct_9fa48("29724") ? true : (stryCov_9fa48("29724", "29725", "29726"), errorData.message || (stryMutAct_9fa48("29727") ? "" : (stryCov_9fa48("29727"), 'Your session has expired. Redirecting to login...')));

                    // Emit event for modal (but also do immediate redirect as backup)
                    const event = new CustomEvent(stryMutAct_9fa48("29728") ? "" : (stryCov_9fa48("29728"), 'authError'), stryMutAct_9fa48("29729") ? {} : (stryCov_9fa48("29729"), {
                      detail: stryMutAct_9fa48("29730") ? {} : (stryCov_9fa48("29730"), {
                        type: stryMutAct_9fa48("29731") ? "" : (stryCov_9fa48("29731"), 'token_expired'),
                        message: message
                      })
                    }));
                    window.dispatchEvent(event);

                    // Clear auth data and redirect immediately (don't wait for modal)
                    setTimeout(() => {
                      if (stryMutAct_9fa48("29732")) {
                        {}
                      } else {
                        stryCov_9fa48("29732");
                        localStorage.removeItem(stryMutAct_9fa48("29733") ? "" : (stryCov_9fa48("29733"), 'token'));
                        localStorage.removeItem(stryMutAct_9fa48("29734") ? "" : (stryCov_9fa48("29734"), 'user'));
                        window.location.href = stryMutAct_9fa48("29735") ? "" : (stryCov_9fa48("29735"), '/login');
                      }
                    }, 2000); // 2 second delay to show modal briefly
                  }
                } else if (stryMutAct_9fa48("29738") ? response.status === 403 || errorData.userInactive : stryMutAct_9fa48("29737") ? false : stryMutAct_9fa48("29736") ? true : (stryCov_9fa48("29736", "29737", "29738"), (stryMutAct_9fa48("29740") ? response.status !== 403 : stryMutAct_9fa48("29739") ? true : (stryCov_9fa48("29739", "29740"), response.status === 403)) && errorData.userInactive)) {
                  if (stryMutAct_9fa48("29741")) {
                    {}
                  } else {
                    stryCov_9fa48("29741");
                    // User is inactive - only show modal, no redirect
                    const event = new CustomEvent(stryMutAct_9fa48("29742") ? "" : (stryCov_9fa48("29742"), 'authError'), stryMutAct_9fa48("29743") ? {} : (stryCov_9fa48("29743"), {
                      detail: stryMutAct_9fa48("29744") ? {} : (stryCov_9fa48("29744"), {
                        type: stryMutAct_9fa48("29745") ? "" : (stryCov_9fa48("29745"), 'user_inactive'),
                        message: stryMutAct_9fa48("29748") ? errorData.message && 'Your account now has view-only access. You can browse historical content but cannot make new submissions or access active features.' : stryMutAct_9fa48("29747") ? false : stryMutAct_9fa48("29746") ? true : (stryCov_9fa48("29746", "29747", "29748"), errorData.message || (stryMutAct_9fa48("29749") ? "" : (stryCov_9fa48("29749"), 'Your account now has view-only access. You can browse historical content but cannot make new submissions or access active features.')))
                      })
                    }));
                    window.dispatchEvent(event);
                  }
                } else {
                  if (stryMutAct_9fa48("29750")) {
                    {}
                  } else {
                    stryCov_9fa48("29750");
                    // Generic auth error - show message and redirect immediately
                    console.log(stryMutAct_9fa48("29751") ? "" : (stryCov_9fa48("29751"), '🚨 Auth error, redirecting to login...'));
                    const event = new CustomEvent(stryMutAct_9fa48("29752") ? "" : (stryCov_9fa48("29752"), 'authError'), stryMutAct_9fa48("29753") ? {} : (stryCov_9fa48("29753"), {
                      detail: stryMutAct_9fa48("29754") ? {} : (stryCov_9fa48("29754"), {
                        type: stryMutAct_9fa48("29755") ? "" : (stryCov_9fa48("29755"), 'generic_auth_error'),
                        message: stryMutAct_9fa48("29756") ? "" : (stryCov_9fa48("29756"), 'Authentication error. Redirecting to login...')
                      })
                    }));
                    window.dispatchEvent(event);

                    // Clear auth data and redirect immediately
                    setTimeout(() => {
                      if (stryMutAct_9fa48("29757")) {
                        {}
                      } else {
                        stryCov_9fa48("29757");
                        localStorage.removeItem(stryMutAct_9fa48("29758") ? "" : (stryCov_9fa48("29758"), 'token'));
                        localStorage.removeItem(stryMutAct_9fa48("29759") ? "" : (stryCov_9fa48("29759"), 'user'));
                        window.location.href = stryMutAct_9fa48("29760") ? "" : (stryCov_9fa48("29760"), '/login');
                      }
                    }, 2000);
                  }
                }
              }
            } catch (parseError) {
              if (stryMutAct_9fa48("29761")) {
                {}
              } else {
                stryCov_9fa48("29761");
                console.error(stryMutAct_9fa48("29762") ? "" : (stryCov_9fa48("29762"), 'Error parsing auth error response:'), parseError);

                // Fallback for unparseable errors - immediate redirect
                console.log(stryMutAct_9fa48("29763") ? "" : (stryCov_9fa48("29763"), '🚨 Unparseable auth error, redirecting immediately...'));
                const event = new CustomEvent(stryMutAct_9fa48("29764") ? "" : (stryCov_9fa48("29764"), 'authError'), stryMutAct_9fa48("29765") ? {} : (stryCov_9fa48("29765"), {
                  detail: stryMutAct_9fa48("29766") ? {} : (stryCov_9fa48("29766"), {
                    type: stryMutAct_9fa48("29767") ? "" : (stryCov_9fa48("29767"), 'generic_auth_error'),
                    message: stryMutAct_9fa48("29768") ? "" : (stryCov_9fa48("29768"), 'Authentication error. Redirecting to login...')
                  })
                }));
                window.dispatchEvent(event);

                // Immediate redirect for fallback case
                setTimeout(() => {
                  if (stryMutAct_9fa48("29769")) {
                    {}
                  } else {
                    stryCov_9fa48("29769");
                    localStorage.removeItem(stryMutAct_9fa48("29770") ? "" : (stryCov_9fa48("29770"), 'token'));
                    localStorage.removeItem(stryMutAct_9fa48("29771") ? "" : (stryCov_9fa48("29771"), 'user'));
                    window.location.href = stryMutAct_9fa48("29772") ? "" : (stryCov_9fa48("29772"), '/login');
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
      if (stryMutAct_9fa48("29773")) {
        {}
      } else {
        stryCov_9fa48("29773");
        // Network errors, etc. - just pass through
        throw error;
      }
    }
  }
};

// Reset auth modal state (useful for page refreshes)
export const resetAuthModalState = () => {
  if (stryMutAct_9fa48("29774")) {
    {}
  } else {
    stryCov_9fa48("29774");
    hasTriggeredAuthModal = stryMutAct_9fa48("29775") ? true : (stryCov_9fa48("29775"), false);
    console.log(stryMutAct_9fa48("29776") ? "" : (stryCov_9fa48("29776"), '🔄 Auth modal state reset'));
  }
};

// Install the global error handler
export const installGlobalErrorHandler = () => {
  if (stryMutAct_9fa48("29777")) {
    {}
  } else {
    stryCov_9fa48("29777");
    if (stryMutAct_9fa48("29780") ? window.fetch !== enhancedFetch : stryMutAct_9fa48("29779") ? false : stryMutAct_9fa48("29778") ? true : (stryCov_9fa48("29778", "29779", "29780"), window.fetch === enhancedFetch)) {
      if (stryMutAct_9fa48("29781")) {
        {}
      } else {
        stryCov_9fa48("29781");
        console.log(stryMutAct_9fa48("29782") ? "" : (stryCov_9fa48("29782"), '⚠️ Global error handler already installed'));
        return;
      }
    }
    window.fetch = enhancedFetch;
    console.log(stryMutAct_9fa48("29783") ? "" : (stryCov_9fa48("29783"), '🔧 Global auth error handler installed'));
  }
};

// Uninstall the global error handler
export const uninstallGlobalErrorHandler = () => {
  if (stryMutAct_9fa48("29784")) {
    {}
  } else {
    stryCov_9fa48("29784");
    window.fetch = originalFetch;
    console.log(stryMutAct_9fa48("29785") ? "" : (stryCov_9fa48("29785"), '🔧 Global auth error handler removed'));
  }
};

// Auto-install when this module is imported
installGlobalErrorHandler();