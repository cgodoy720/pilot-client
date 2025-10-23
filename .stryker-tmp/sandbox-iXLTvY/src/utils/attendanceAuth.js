/**
 * Attendance Authentication Utility Service
 * Handles token management, validation, and session management for attendance system
 */
// @ts-nocheck


// Storage keys
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
const STORAGE_KEYS = stryMutAct_9fa48("29391") ? {} : (stryCov_9fa48("29391"), {
  TOKEN: stryMutAct_9fa48("29392") ? "" : (stryCov_9fa48("29392"), 'attendanceToken'),
  USER: stryMutAct_9fa48("29393") ? "" : (stryCov_9fa48("29393"), 'attendanceUser'),
  SESSION_START: stryMutAct_9fa48("29394") ? "" : (stryCov_9fa48("29394"), 'attendanceSessionStart'),
  LAST_ACTIVITY: stryMutAct_9fa48("29395") ? "" : (stryCov_9fa48("29395"), 'attendanceLastActivity')
});

// Session timeout (8 hours in milliseconds)
const SESSION_TIMEOUT = stryMutAct_9fa48("29396") ? 8 * 60 * 60 / 1000 : (stryCov_9fa48("29396"), (stryMutAct_9fa48("29397") ? 8 * 60 / 60 : (stryCov_9fa48("29397"), (stryMutAct_9fa48("29398") ? 8 / 60 : (stryCov_9fa48("29398"), 8 * 60)) * 60)) * 1000);

/**
 * Store authentication data securely
 * @param {string} token - JWT token
 * @param {object} user - User data
 */
export const storeAuthData = (token, user) => {
  if (stryMutAct_9fa48("29399")) {
    {}
  } else {
    stryCov_9fa48("29399");
    try {
      if (stryMutAct_9fa48("29400")) {
        {}
      } else {
        stryCov_9fa48("29400");
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.SESSION_START, Date.now().toString());
        localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
        return stryMutAct_9fa48("29401") ? false : (stryCov_9fa48("29401"), true);
      }
    } catch (error) {
      if (stryMutAct_9fa48("29402")) {
        {}
      } else {
        stryCov_9fa48("29402");
        console.error(stryMutAct_9fa48("29403") ? "" : (stryCov_9fa48("29403"), 'Error storing auth data:'), error);
        return stryMutAct_9fa48("29404") ? true : (stryCov_9fa48("29404"), false);
      }
    }
  }
};

/**
 * Get stored authentication token
 * @returns {string|null} JWT token or null if not found
 */
export const getAuthToken = () => {
  if (stryMutAct_9fa48("29405")) {
    {}
  } else {
    stryCov_9fa48("29405");
    try {
      if (stryMutAct_9fa48("29406")) {
        {}
      } else {
        stryCov_9fa48("29406");
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
      }
    } catch (error) {
      if (stryMutAct_9fa48("29407")) {
        {}
      } else {
        stryCov_9fa48("29407");
        console.error(stryMutAct_9fa48("29408") ? "" : (stryCov_9fa48("29408"), 'Error getting auth token:'), error);
        return null;
      }
    }
  }
};

/**
 * Get stored user data
 * @returns {object|null} User data or null if not found
 */
export const getAuthUser = () => {
  if (stryMutAct_9fa48("29409")) {
    {}
  } else {
    stryCov_9fa48("29409");
    try {
      if (stryMutAct_9fa48("29410")) {
        {}
      } else {
        stryCov_9fa48("29410");
        const userData = localStorage.getItem(STORAGE_KEYS.USER);
        return userData ? JSON.parse(userData) : null;
      }
    } catch (error) {
      if (stryMutAct_9fa48("29411")) {
        {}
      } else {
        stryCov_9fa48("29411");
        console.error(stryMutAct_9fa48("29412") ? "" : (stryCov_9fa48("29412"), 'Error getting auth user:'), error);
        return null;
      }
    }
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  if (stryMutAct_9fa48("29413")) {
    {}
  } else {
    stryCov_9fa48("29413");
    try {
      if (stryMutAct_9fa48("29414")) {
        {}
      } else {
        stryCov_9fa48("29414");
        Object.values(STORAGE_KEYS).forEach(key => {
          if (stryMutAct_9fa48("29415")) {
            {}
          } else {
            stryCov_9fa48("29415");
            localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      if (stryMutAct_9fa48("29416")) {
        {}
      } else {
        stryCov_9fa48("29416");
        console.error(stryMutAct_9fa48("29417") ? "" : (stryCov_9fa48("29417"), 'Error clearing auth data:'), error);
      }
    }
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated and session is valid
 */
export const isAuthenticated = () => {
  if (stryMutAct_9fa48("29418")) {
    {}
  } else {
    stryCov_9fa48("29418");
    try {
      if (stryMutAct_9fa48("29419")) {
        {}
      } else {
        stryCov_9fa48("29419");
        const token = getAuthToken();
        const user = getAuthUser();
        if (stryMutAct_9fa48("29422") ? !token && !user : stryMutAct_9fa48("29421") ? false : stryMutAct_9fa48("29420") ? true : (stryCov_9fa48("29420", "29421", "29422"), (stryMutAct_9fa48("29423") ? token : (stryCov_9fa48("29423"), !token)) || (stryMutAct_9fa48("29424") ? user : (stryCov_9fa48("29424"), !user)))) {
          if (stryMutAct_9fa48("29425")) {
            {}
          } else {
            stryCov_9fa48("29425");
            return stryMutAct_9fa48("29426") ? true : (stryCov_9fa48("29426"), false);
          }
        }

        // Validate token structure
        const tokenParts = token.split(stryMutAct_9fa48("29427") ? "" : (stryCov_9fa48("29427"), '.'));
        if (stryMutAct_9fa48("29430") ? tokenParts.length === 3 : stryMutAct_9fa48("29429") ? false : stryMutAct_9fa48("29428") ? true : (stryCov_9fa48("29428", "29429", "29430"), tokenParts.length !== 3)) {
          if (stryMutAct_9fa48("29431")) {
            {}
          } else {
            stryCov_9fa48("29431");
            clearAuthData();
            return stryMutAct_9fa48("29432") ? true : (stryCov_9fa48("29432"), false);
          }
        }

        // Decode and validate token
        const payload = JSON.parse(atob(tokenParts[1]));
        const currentTime = Math.floor(stryMutAct_9fa48("29433") ? Date.now() * 1000 : (stryCov_9fa48("29433"), Date.now() / 1000));

        // Check token expiration
        if (stryMutAct_9fa48("29437") ? payload.exp > currentTime : stryMutAct_9fa48("29436") ? payload.exp < currentTime : stryMutAct_9fa48("29435") ? false : stryMutAct_9fa48("29434") ? true : (stryCov_9fa48("29434", "29435", "29436", "29437"), payload.exp <= currentTime)) {
          if (stryMutAct_9fa48("29438")) {
            {}
          } else {
            stryCov_9fa48("29438");
            clearAuthData();
            return stryMutAct_9fa48("29439") ? true : (stryCov_9fa48("29439"), false);
          }
        }

        // Check session timeout
        const sessionStart = localStorage.getItem(STORAGE_KEYS.SESSION_START);
        if (stryMutAct_9fa48("29441") ? false : stryMutAct_9fa48("29440") ? true : (stryCov_9fa48("29440", "29441"), sessionStart)) {
          if (stryMutAct_9fa48("29442")) {
            {}
          } else {
            stryCov_9fa48("29442");
            const sessionAge = stryMutAct_9fa48("29443") ? Date.now() + parseInt(sessionStart) : (stryCov_9fa48("29443"), Date.now() - parseInt(sessionStart));
            if (stryMutAct_9fa48("29447") ? sessionAge <= SESSION_TIMEOUT : stryMutAct_9fa48("29446") ? sessionAge >= SESSION_TIMEOUT : stryMutAct_9fa48("29445") ? false : stryMutAct_9fa48("29444") ? true : (stryCov_9fa48("29444", "29445", "29446", "29447"), sessionAge > SESSION_TIMEOUT)) {
              if (stryMutAct_9fa48("29448")) {
                {}
              } else {
                stryCov_9fa48("29448");
                clearAuthData();
                return stryMutAct_9fa48("29449") ? true : (stryCov_9fa48("29449"), false);
              }
            }
          }
        }

        // Update last activity
        localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
        return stryMutAct_9fa48("29450") ? false : (stryCov_9fa48("29450"), true);
      }
    } catch (error) {
      if (stryMutAct_9fa48("29451")) {
        {}
      } else {
        stryCov_9fa48("29451");
        console.error(stryMutAct_9fa48("29452") ? "" : (stryCov_9fa48("29452"), 'Error checking authentication:'), error);
        clearAuthData();
        return stryMutAct_9fa48("29453") ? true : (stryCov_9fa48("29453"), false);
      }
    }
  }
};

/**
 * Validate JWT token structure and content
 * @param {string} token - JWT token to validate
 * @returns {object} Validation result with isValid and payload
 */
export const validateToken = token => {
  if (stryMutAct_9fa48("29454")) {
    {}
  } else {
    stryCov_9fa48("29454");
    try {
      if (stryMutAct_9fa48("29455")) {
        {}
      } else {
        stryCov_9fa48("29455");
        if (stryMutAct_9fa48("29458") ? false : stryMutAct_9fa48("29457") ? true : stryMutAct_9fa48("29456") ? token : (stryCov_9fa48("29456", "29457", "29458"), !token)) {
          if (stryMutAct_9fa48("29459")) {
            {}
          } else {
            stryCov_9fa48("29459");
            return stryMutAct_9fa48("29460") ? {} : (stryCov_9fa48("29460"), {
              isValid: stryMutAct_9fa48("29461") ? true : (stryCov_9fa48("29461"), false),
              error: stryMutAct_9fa48("29462") ? "" : (stryCov_9fa48("29462"), 'No token provided')
            });
          }
        }
        const tokenParts = token.split(stryMutAct_9fa48("29463") ? "" : (stryCov_9fa48("29463"), '.'));
        if (stryMutAct_9fa48("29466") ? tokenParts.length === 3 : stryMutAct_9fa48("29465") ? false : stryMutAct_9fa48("29464") ? true : (stryCov_9fa48("29464", "29465", "29466"), tokenParts.length !== 3)) {
          if (stryMutAct_9fa48("29467")) {
            {}
          } else {
            stryCov_9fa48("29467");
            return stryMutAct_9fa48("29468") ? {} : (stryCov_9fa48("29468"), {
              isValid: stryMutAct_9fa48("29469") ? true : (stryCov_9fa48("29469"), false),
              error: stryMutAct_9fa48("29470") ? "" : (stryCov_9fa48("29470"), 'Invalid token structure')
            });
          }
        }
        const payload = JSON.parse(atob(tokenParts[1]));
        const currentTime = Math.floor(stryMutAct_9fa48("29471") ? Date.now() * 1000 : (stryCov_9fa48("29471"), Date.now() / 1000));
        if (stryMutAct_9fa48("29475") ? payload.exp > currentTime : stryMutAct_9fa48("29474") ? payload.exp < currentTime : stryMutAct_9fa48("29473") ? false : stryMutAct_9fa48("29472") ? true : (stryCov_9fa48("29472", "29473", "29474", "29475"), payload.exp <= currentTime)) {
          if (stryMutAct_9fa48("29476")) {
            {}
          } else {
            stryCov_9fa48("29476");
            return stryMutAct_9fa48("29477") ? {} : (stryCov_9fa48("29477"), {
              isValid: stryMutAct_9fa48("29478") ? true : (stryCov_9fa48("29478"), false),
              error: stryMutAct_9fa48("29479") ? "" : (stryCov_9fa48("29479"), 'Token expired')
            });
          }
        }
        if (stryMutAct_9fa48("29482") ? (!payload.userId || !payload.email) && !payload.role : stryMutAct_9fa48("29481") ? false : stryMutAct_9fa48("29480") ? true : (stryCov_9fa48("29480", "29481", "29482"), (stryMutAct_9fa48("29484") ? !payload.userId && !payload.email : stryMutAct_9fa48("29483") ? false : (stryCov_9fa48("29483", "29484"), (stryMutAct_9fa48("29485") ? payload.userId : (stryCov_9fa48("29485"), !payload.userId)) || (stryMutAct_9fa48("29486") ? payload.email : (stryCov_9fa48("29486"), !payload.email)))) || (stryMutAct_9fa48("29487") ? payload.role : (stryCov_9fa48("29487"), !payload.role)))) {
          if (stryMutAct_9fa48("29488")) {
            {}
          } else {
            stryCov_9fa48("29488");
            return stryMutAct_9fa48("29489") ? {} : (stryCov_9fa48("29489"), {
              isValid: stryMutAct_9fa48("29490") ? true : (stryCov_9fa48("29490"), false),
              error: stryMutAct_9fa48("29491") ? "" : (stryCov_9fa48("29491"), 'Invalid token payload')
            });
          }
        }
        if (stryMutAct_9fa48("29494") ? payload.role !== 'admin' || payload.role !== 'staff' : stryMutAct_9fa48("29493") ? false : stryMutAct_9fa48("29492") ? true : (stryCov_9fa48("29492", "29493", "29494"), (stryMutAct_9fa48("29496") ? payload.role === 'admin' : stryMutAct_9fa48("29495") ? true : (stryCov_9fa48("29495", "29496"), payload.role !== (stryMutAct_9fa48("29497") ? "" : (stryCov_9fa48("29497"), 'admin')))) && (stryMutAct_9fa48("29499") ? payload.role === 'staff' : stryMutAct_9fa48("29498") ? true : (stryCov_9fa48("29498", "29499"), payload.role !== (stryMutAct_9fa48("29500") ? "" : (stryCov_9fa48("29500"), 'staff')))))) {
          if (stryMutAct_9fa48("29501")) {
            {}
          } else {
            stryCov_9fa48("29501");
            return stryMutAct_9fa48("29502") ? {} : (stryCov_9fa48("29502"), {
              isValid: stryMutAct_9fa48("29503") ? true : (stryCov_9fa48("29503"), false),
              error: stryMutAct_9fa48("29504") ? "" : (stryCov_9fa48("29504"), 'Insufficient privileges')
            });
          }
        }
        return stryMutAct_9fa48("29505") ? {} : (stryCov_9fa48("29505"), {
          isValid: stryMutAct_9fa48("29506") ? false : (stryCov_9fa48("29506"), true),
          payload
        });
      }
    } catch (error) {
      if (stryMutAct_9fa48("29507")) {
        {}
      } else {
        stryCov_9fa48("29507");
        return stryMutAct_9fa48("29508") ? {} : (stryCov_9fa48("29508"), {
          isValid: stryMutAct_9fa48("29509") ? true : (stryCov_9fa48("29509"), false),
          error: stryMutAct_9fa48("29510") ? "" : (stryCov_9fa48("29510"), 'Token validation failed')
        });
      }
    }
  }
};

/**
 * Get authentication headers for API requests
 * @returns {object} Headers object with Authorization
 */
export const getAuthHeaders = () => {
  if (stryMutAct_9fa48("29511")) {
    {}
  } else {
    stryCov_9fa48("29511");
    const token = getAuthToken();
    return stryMutAct_9fa48("29512") ? {} : (stryCov_9fa48("29512"), {
      'Authorization': stryMutAct_9fa48("29513") ? `` : (stryCov_9fa48("29513"), `Bearer ${token}`),
      'Content-Type': stryMutAct_9fa48("29514") ? "" : (stryCov_9fa48("29514"), 'application/json')
    });
  }
};

/**
 * Check if user has admin privileges
 * @returns {boolean} True if user is admin or staff
 */
export const hasAdminPrivileges = () => {
  if (stryMutAct_9fa48("29515")) {
    {}
  } else {
    stryCov_9fa48("29515");
    try {
      if (stryMutAct_9fa48("29516")) {
        {}
      } else {
        stryCov_9fa48("29516");
        const user = getAuthUser();
        return stryMutAct_9fa48("29519") ? user || user.role === 'admin' || user.role === 'staff' : stryMutAct_9fa48("29518") ? false : stryMutAct_9fa48("29517") ? true : (stryCov_9fa48("29517", "29518", "29519"), user && (stryMutAct_9fa48("29521") ? user.role === 'admin' && user.role === 'staff' : stryMutAct_9fa48("29520") ? true : (stryCov_9fa48("29520", "29521"), (stryMutAct_9fa48("29523") ? user.role !== 'admin' : stryMutAct_9fa48("29522") ? false : (stryCov_9fa48("29522", "29523"), user.role === (stryMutAct_9fa48("29524") ? "" : (stryCov_9fa48("29524"), 'admin')))) || (stryMutAct_9fa48("29526") ? user.role !== 'staff' : stryMutAct_9fa48("29525") ? false : (stryCov_9fa48("29525", "29526"), user.role === (stryMutAct_9fa48("29527") ? "" : (stryCov_9fa48("29527"), 'staff')))))));
      }
    } catch (error) {
      if (stryMutAct_9fa48("29528")) {
        {}
      } else {
        stryCov_9fa48("29528");
        return stryMutAct_9fa48("29529") ? true : (stryCov_9fa48("29529"), false);
      }
    }
  }
};

/**
 * Get session information
 * @returns {object} Session info including age and remaining time
 */
export const getSessionInfo = () => {
  if (stryMutAct_9fa48("29530")) {
    {}
  } else {
    stryCov_9fa48("29530");
    try {
      if (stryMutAct_9fa48("29531")) {
        {}
      } else {
        stryCov_9fa48("29531");
        const sessionStart = localStorage.getItem(STORAGE_KEYS.SESSION_START);
        const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
        if (stryMutAct_9fa48("29534") ? false : stryMutAct_9fa48("29533") ? true : stryMutAct_9fa48("29532") ? sessionStart : (stryCov_9fa48("29532", "29533", "29534"), !sessionStart)) {
          if (stryMutAct_9fa48("29535")) {
            {}
          } else {
            stryCov_9fa48("29535");
            return null;
          }
        }
        const sessionAge = stryMutAct_9fa48("29536") ? Date.now() + parseInt(sessionStart) : (stryCov_9fa48("29536"), Date.now() - parseInt(sessionStart));
        const remainingTime = stryMutAct_9fa48("29537") ? SESSION_TIMEOUT + sessionAge : (stryCov_9fa48("29537"), SESSION_TIMEOUT - sessionAge);
        const lastActivityAge = lastActivity ? stryMutAct_9fa48("29538") ? Date.now() + parseInt(lastActivity) : (stryCov_9fa48("29538"), Date.now() - parseInt(lastActivity)) : 0;
        return stryMutAct_9fa48("29539") ? {} : (stryCov_9fa48("29539"), {
          sessionAge,
          remainingTime,
          lastActivityAge,
          isExpired: stryMutAct_9fa48("29543") ? remainingTime > 0 : stryMutAct_9fa48("29542") ? remainingTime < 0 : stryMutAct_9fa48("29541") ? false : stryMutAct_9fa48("29540") ? true : (stryCov_9fa48("29540", "29541", "29542", "29543"), remainingTime <= 0)
        });
      }
    } catch (error) {
      if (stryMutAct_9fa48("29544")) {
        {}
      } else {
        stryCov_9fa48("29544");
        return null;
      }
    }
  }
};

/**
 * Refresh session activity timestamp
 */
export const refreshSession = () => {
  if (stryMutAct_9fa48("29545")) {
    {}
  } else {
    stryCov_9fa48("29545");
    try {
      if (stryMutAct_9fa48("29546")) {
        {}
      } else {
        stryCov_9fa48("29546");
        localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
      }
    } catch (error) {
      if (stryMutAct_9fa48("29547")) {
        {}
      } else {
        stryCov_9fa48("29547");
        console.error(stryMutAct_9fa48("29548") ? "" : (stryCov_9fa48("29548"), 'Error refreshing session:'), error);
      }
    }
  }
};

/**
 * Setup session monitoring
 * @param {function} onSessionExpired - Callback when session expires
 */
export const setupSessionMonitoring = onSessionExpired => {
  if (stryMutAct_9fa48("29549")) {
    {}
  } else {
    stryCov_9fa48("29549");
    // Check session every minute
    const interval = setInterval(() => {
      if (stryMutAct_9fa48("29550")) {
        {}
      } else {
        stryCov_9fa48("29550");
        if (stryMutAct_9fa48("29553") ? false : stryMutAct_9fa48("29552") ? true : stryMutAct_9fa48("29551") ? isAuthenticated() : (stryCov_9fa48("29551", "29552", "29553"), !isAuthenticated())) {
          if (stryMutAct_9fa48("29554")) {
            {}
          } else {
            stryCov_9fa48("29554");
            clearInterval(interval);
            if (stryMutAct_9fa48("29556") ? false : stryMutAct_9fa48("29555") ? true : (stryCov_9fa48("29555", "29556"), onSessionExpired)) {
              if (stryMutAct_9fa48("29557")) {
                {}
              } else {
                stryCov_9fa48("29557");
                onSessionExpired();
              }
            }
          }
        }
      }
    }, 60000);

    // Update activity on user interaction
    const updateActivity = () => {
      if (stryMutAct_9fa48("29558")) {
        {}
      } else {
        stryCov_9fa48("29558");
        if (stryMutAct_9fa48("29560") ? false : stryMutAct_9fa48("29559") ? true : (stryCov_9fa48("29559", "29560"), isAuthenticated())) {
          if (stryMutAct_9fa48("29561")) {
            {}
          } else {
            stryCov_9fa48("29561");
            refreshSession();
          }
        }
      }
    };

    // Listen for user activity
    (stryMutAct_9fa48("29562") ? [] : (stryCov_9fa48("29562"), [stryMutAct_9fa48("29563") ? "" : (stryCov_9fa48("29563"), 'mousedown'), stryMutAct_9fa48("29564") ? "" : (stryCov_9fa48("29564"), 'mousemove'), stryMutAct_9fa48("29565") ? "" : (stryCov_9fa48("29565"), 'keypress'), stryMutAct_9fa48("29566") ? "" : (stryCov_9fa48("29566"), 'scroll'), stryMutAct_9fa48("29567") ? "" : (stryCov_9fa48("29567"), 'touchstart')])).forEach(event => {
      if (stryMutAct_9fa48("29568")) {
        {}
      } else {
        stryCov_9fa48("29568");
        document.addEventListener(event, updateActivity, stryMutAct_9fa48("29569") ? false : (stryCov_9fa48("29569"), true));
      }
    });
    return () => {
      if (stryMutAct_9fa48("29570")) {
        {}
      } else {
        stryCov_9fa48("29570");
        clearInterval(interval);
        (stryMutAct_9fa48("29571") ? [] : (stryCov_9fa48("29571"), [stryMutAct_9fa48("29572") ? "" : (stryCov_9fa48("29572"), 'mousedown'), stryMutAct_9fa48("29573") ? "" : (stryCov_9fa48("29573"), 'mousemove'), stryMutAct_9fa48("29574") ? "" : (stryCov_9fa48("29574"), 'keypress'), stryMutAct_9fa48("29575") ? "" : (stryCov_9fa48("29575"), 'scroll'), stryMutAct_9fa48("29576") ? "" : (stryCov_9fa48("29576"), 'touchstart')])).forEach(event => {
          if (stryMutAct_9fa48("29577")) {
            {}
          } else {
            stryCov_9fa48("29577");
            document.removeEventListener(event, updateActivity, stryMutAct_9fa48("29578") ? false : (stryCov_9fa48("29578"), true));
          }
        });
      }
    };
  }
};

/**
 * Secure logout function
 * @param {function} redirectCallback - Optional callback for redirect
 */
export const secureLogout = redirectCallback => {
  if (stryMutAct_9fa48("29579")) {
    {}
  } else {
    stryCov_9fa48("29579");
    clearAuthData();
    if (stryMutAct_9fa48("29581") ? false : stryMutAct_9fa48("29580") ? true : (stryCov_9fa48("29580", "29581"), redirectCallback)) {
      if (stryMutAct_9fa48("29582")) {
        {}
      } else {
        stryCov_9fa48("29582");
        redirectCallback();
      }
    }
  }
};
export default stryMutAct_9fa48("29583") ? {} : (stryCov_9fa48("29583"), {
  storeAuthData,
  getAuthToken,
  getAuthUser,
  clearAuthData,
  isAuthenticated,
  validateToken,
  getAuthHeaders,
  hasAdminPrivileges,
  getSessionInfo,
  refreshSession,
  setupSessionMonitoring,
  secureLogout
});