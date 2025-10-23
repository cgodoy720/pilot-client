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
const STORAGE_KEYS = stryMutAct_9fa48("29390") ? {} : (stryCov_9fa48("29390"), {
  TOKEN: stryMutAct_9fa48("29391") ? "" : (stryCov_9fa48("29391"), 'attendanceToken'),
  USER: stryMutAct_9fa48("29392") ? "" : (stryCov_9fa48("29392"), 'attendanceUser'),
  SESSION_START: stryMutAct_9fa48("29393") ? "" : (stryCov_9fa48("29393"), 'attendanceSessionStart'),
  LAST_ACTIVITY: stryMutAct_9fa48("29394") ? "" : (stryCov_9fa48("29394"), 'attendanceLastActivity')
});

// Session timeout (8 hours in milliseconds)
const SESSION_TIMEOUT = stryMutAct_9fa48("29395") ? 8 * 60 * 60 / 1000 : (stryCov_9fa48("29395"), (stryMutAct_9fa48("29396") ? 8 * 60 / 60 : (stryCov_9fa48("29396"), (stryMutAct_9fa48("29397") ? 8 / 60 : (stryCov_9fa48("29397"), 8 * 60)) * 60)) * 1000);

/**
 * Store authentication data securely
 * @param {string} token - JWT token
 * @param {object} user - User data
 */
export const storeAuthData = (token, user) => {
  if (stryMutAct_9fa48("29398")) {
    {}
  } else {
    stryCov_9fa48("29398");
    try {
      if (stryMutAct_9fa48("29399")) {
        {}
      } else {
        stryCov_9fa48("29399");
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.SESSION_START, Date.now().toString());
        localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
        return stryMutAct_9fa48("29400") ? false : (stryCov_9fa48("29400"), true);
      }
    } catch (error) {
      if (stryMutAct_9fa48("29401")) {
        {}
      } else {
        stryCov_9fa48("29401");
        console.error(stryMutAct_9fa48("29402") ? "" : (stryCov_9fa48("29402"), 'Error storing auth data:'), error);
        return stryMutAct_9fa48("29403") ? true : (stryCov_9fa48("29403"), false);
      }
    }
  }
};

/**
 * Get stored authentication token
 * @returns {string|null} JWT token or null if not found
 */
export const getAuthToken = () => {
  if (stryMutAct_9fa48("29404")) {
    {}
  } else {
    stryCov_9fa48("29404");
    try {
      if (stryMutAct_9fa48("29405")) {
        {}
      } else {
        stryCov_9fa48("29405");
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
      }
    } catch (error) {
      if (stryMutAct_9fa48("29406")) {
        {}
      } else {
        stryCov_9fa48("29406");
        console.error(stryMutAct_9fa48("29407") ? "" : (stryCov_9fa48("29407"), 'Error getting auth token:'), error);
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
  if (stryMutAct_9fa48("29408")) {
    {}
  } else {
    stryCov_9fa48("29408");
    try {
      if (stryMutAct_9fa48("29409")) {
        {}
      } else {
        stryCov_9fa48("29409");
        const userData = localStorage.getItem(STORAGE_KEYS.USER);
        return userData ? JSON.parse(userData) : null;
      }
    } catch (error) {
      if (stryMutAct_9fa48("29410")) {
        {}
      } else {
        stryCov_9fa48("29410");
        console.error(stryMutAct_9fa48("29411") ? "" : (stryCov_9fa48("29411"), 'Error getting auth user:'), error);
        return null;
      }
    }
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  if (stryMutAct_9fa48("29412")) {
    {}
  } else {
    stryCov_9fa48("29412");
    try {
      if (stryMutAct_9fa48("29413")) {
        {}
      } else {
        stryCov_9fa48("29413");
        Object.values(STORAGE_KEYS).forEach(key => {
          if (stryMutAct_9fa48("29414")) {
            {}
          } else {
            stryCov_9fa48("29414");
            localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      if (stryMutAct_9fa48("29415")) {
        {}
      } else {
        stryCov_9fa48("29415");
        console.error(stryMutAct_9fa48("29416") ? "" : (stryCov_9fa48("29416"), 'Error clearing auth data:'), error);
      }
    }
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated and session is valid
 */
export const isAuthenticated = () => {
  if (stryMutAct_9fa48("29417")) {
    {}
  } else {
    stryCov_9fa48("29417");
    try {
      if (stryMutAct_9fa48("29418")) {
        {}
      } else {
        stryCov_9fa48("29418");
        const token = getAuthToken();
        const user = getAuthUser();
        if (stryMutAct_9fa48("29421") ? !token && !user : stryMutAct_9fa48("29420") ? false : stryMutAct_9fa48("29419") ? true : (stryCov_9fa48("29419", "29420", "29421"), (stryMutAct_9fa48("29422") ? token : (stryCov_9fa48("29422"), !token)) || (stryMutAct_9fa48("29423") ? user : (stryCov_9fa48("29423"), !user)))) {
          if (stryMutAct_9fa48("29424")) {
            {}
          } else {
            stryCov_9fa48("29424");
            return stryMutAct_9fa48("29425") ? true : (stryCov_9fa48("29425"), false);
          }
        }

        // Validate token structure
        const tokenParts = token.split(stryMutAct_9fa48("29426") ? "" : (stryCov_9fa48("29426"), '.'));
        if (stryMutAct_9fa48("29429") ? tokenParts.length === 3 : stryMutAct_9fa48("29428") ? false : stryMutAct_9fa48("29427") ? true : (stryCov_9fa48("29427", "29428", "29429"), tokenParts.length !== 3)) {
          if (stryMutAct_9fa48("29430")) {
            {}
          } else {
            stryCov_9fa48("29430");
            clearAuthData();
            return stryMutAct_9fa48("29431") ? true : (stryCov_9fa48("29431"), false);
          }
        }

        // Decode and validate token
        const payload = JSON.parse(atob(tokenParts[1]));
        const currentTime = Math.floor(stryMutAct_9fa48("29432") ? Date.now() * 1000 : (stryCov_9fa48("29432"), Date.now() / 1000));

        // Check token expiration
        if (stryMutAct_9fa48("29436") ? payload.exp > currentTime : stryMutAct_9fa48("29435") ? payload.exp < currentTime : stryMutAct_9fa48("29434") ? false : stryMutAct_9fa48("29433") ? true : (stryCov_9fa48("29433", "29434", "29435", "29436"), payload.exp <= currentTime)) {
          if (stryMutAct_9fa48("29437")) {
            {}
          } else {
            stryCov_9fa48("29437");
            clearAuthData();
            return stryMutAct_9fa48("29438") ? true : (stryCov_9fa48("29438"), false);
          }
        }

        // Check session timeout
        const sessionStart = localStorage.getItem(STORAGE_KEYS.SESSION_START);
        if (stryMutAct_9fa48("29440") ? false : stryMutAct_9fa48("29439") ? true : (stryCov_9fa48("29439", "29440"), sessionStart)) {
          if (stryMutAct_9fa48("29441")) {
            {}
          } else {
            stryCov_9fa48("29441");
            const sessionAge = stryMutAct_9fa48("29442") ? Date.now() + parseInt(sessionStart) : (stryCov_9fa48("29442"), Date.now() - parseInt(sessionStart));
            if (stryMutAct_9fa48("29446") ? sessionAge <= SESSION_TIMEOUT : stryMutAct_9fa48("29445") ? sessionAge >= SESSION_TIMEOUT : stryMutAct_9fa48("29444") ? false : stryMutAct_9fa48("29443") ? true : (stryCov_9fa48("29443", "29444", "29445", "29446"), sessionAge > SESSION_TIMEOUT)) {
              if (stryMutAct_9fa48("29447")) {
                {}
              } else {
                stryCov_9fa48("29447");
                clearAuthData();
                return stryMutAct_9fa48("29448") ? true : (stryCov_9fa48("29448"), false);
              }
            }
          }
        }

        // Update last activity
        localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
        return stryMutAct_9fa48("29449") ? false : (stryCov_9fa48("29449"), true);
      }
    } catch (error) {
      if (stryMutAct_9fa48("29450")) {
        {}
      } else {
        stryCov_9fa48("29450");
        console.error(stryMutAct_9fa48("29451") ? "" : (stryCov_9fa48("29451"), 'Error checking authentication:'), error);
        clearAuthData();
        return stryMutAct_9fa48("29452") ? true : (stryCov_9fa48("29452"), false);
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
  if (stryMutAct_9fa48("29453")) {
    {}
  } else {
    stryCov_9fa48("29453");
    try {
      if (stryMutAct_9fa48("29454")) {
        {}
      } else {
        stryCov_9fa48("29454");
        if (stryMutAct_9fa48("29457") ? false : stryMutAct_9fa48("29456") ? true : stryMutAct_9fa48("29455") ? token : (stryCov_9fa48("29455", "29456", "29457"), !token)) {
          if (stryMutAct_9fa48("29458")) {
            {}
          } else {
            stryCov_9fa48("29458");
            return stryMutAct_9fa48("29459") ? {} : (stryCov_9fa48("29459"), {
              isValid: stryMutAct_9fa48("29460") ? true : (stryCov_9fa48("29460"), false),
              error: stryMutAct_9fa48("29461") ? "" : (stryCov_9fa48("29461"), 'No token provided')
            });
          }
        }
        const tokenParts = token.split(stryMutAct_9fa48("29462") ? "" : (stryCov_9fa48("29462"), '.'));
        if (stryMutAct_9fa48("29465") ? tokenParts.length === 3 : stryMutAct_9fa48("29464") ? false : stryMutAct_9fa48("29463") ? true : (stryCov_9fa48("29463", "29464", "29465"), tokenParts.length !== 3)) {
          if (stryMutAct_9fa48("29466")) {
            {}
          } else {
            stryCov_9fa48("29466");
            return stryMutAct_9fa48("29467") ? {} : (stryCov_9fa48("29467"), {
              isValid: stryMutAct_9fa48("29468") ? true : (stryCov_9fa48("29468"), false),
              error: stryMutAct_9fa48("29469") ? "" : (stryCov_9fa48("29469"), 'Invalid token structure')
            });
          }
        }
        const payload = JSON.parse(atob(tokenParts[1]));
        const currentTime = Math.floor(stryMutAct_9fa48("29470") ? Date.now() * 1000 : (stryCov_9fa48("29470"), Date.now() / 1000));
        if (stryMutAct_9fa48("29474") ? payload.exp > currentTime : stryMutAct_9fa48("29473") ? payload.exp < currentTime : stryMutAct_9fa48("29472") ? false : stryMutAct_9fa48("29471") ? true : (stryCov_9fa48("29471", "29472", "29473", "29474"), payload.exp <= currentTime)) {
          if (stryMutAct_9fa48("29475")) {
            {}
          } else {
            stryCov_9fa48("29475");
            return stryMutAct_9fa48("29476") ? {} : (stryCov_9fa48("29476"), {
              isValid: stryMutAct_9fa48("29477") ? true : (stryCov_9fa48("29477"), false),
              error: stryMutAct_9fa48("29478") ? "" : (stryCov_9fa48("29478"), 'Token expired')
            });
          }
        }
        if (stryMutAct_9fa48("29481") ? (!payload.userId || !payload.email) && !payload.role : stryMutAct_9fa48("29480") ? false : stryMutAct_9fa48("29479") ? true : (stryCov_9fa48("29479", "29480", "29481"), (stryMutAct_9fa48("29483") ? !payload.userId && !payload.email : stryMutAct_9fa48("29482") ? false : (stryCov_9fa48("29482", "29483"), (stryMutAct_9fa48("29484") ? payload.userId : (stryCov_9fa48("29484"), !payload.userId)) || (stryMutAct_9fa48("29485") ? payload.email : (stryCov_9fa48("29485"), !payload.email)))) || (stryMutAct_9fa48("29486") ? payload.role : (stryCov_9fa48("29486"), !payload.role)))) {
          if (stryMutAct_9fa48("29487")) {
            {}
          } else {
            stryCov_9fa48("29487");
            return stryMutAct_9fa48("29488") ? {} : (stryCov_9fa48("29488"), {
              isValid: stryMutAct_9fa48("29489") ? true : (stryCov_9fa48("29489"), false),
              error: stryMutAct_9fa48("29490") ? "" : (stryCov_9fa48("29490"), 'Invalid token payload')
            });
          }
        }
        if (stryMutAct_9fa48("29493") ? payload.role !== 'admin' || payload.role !== 'staff' : stryMutAct_9fa48("29492") ? false : stryMutAct_9fa48("29491") ? true : (stryCov_9fa48("29491", "29492", "29493"), (stryMutAct_9fa48("29495") ? payload.role === 'admin' : stryMutAct_9fa48("29494") ? true : (stryCov_9fa48("29494", "29495"), payload.role !== (stryMutAct_9fa48("29496") ? "" : (stryCov_9fa48("29496"), 'admin')))) && (stryMutAct_9fa48("29498") ? payload.role === 'staff' : stryMutAct_9fa48("29497") ? true : (stryCov_9fa48("29497", "29498"), payload.role !== (stryMutAct_9fa48("29499") ? "" : (stryCov_9fa48("29499"), 'staff')))))) {
          if (stryMutAct_9fa48("29500")) {
            {}
          } else {
            stryCov_9fa48("29500");
            return stryMutAct_9fa48("29501") ? {} : (stryCov_9fa48("29501"), {
              isValid: stryMutAct_9fa48("29502") ? true : (stryCov_9fa48("29502"), false),
              error: stryMutAct_9fa48("29503") ? "" : (stryCov_9fa48("29503"), 'Insufficient privileges')
            });
          }
        }
        return stryMutAct_9fa48("29504") ? {} : (stryCov_9fa48("29504"), {
          isValid: stryMutAct_9fa48("29505") ? false : (stryCov_9fa48("29505"), true),
          payload
        });
      }
    } catch (error) {
      if (stryMutAct_9fa48("29506")) {
        {}
      } else {
        stryCov_9fa48("29506");
        return stryMutAct_9fa48("29507") ? {} : (stryCov_9fa48("29507"), {
          isValid: stryMutAct_9fa48("29508") ? true : (stryCov_9fa48("29508"), false),
          error: stryMutAct_9fa48("29509") ? "" : (stryCov_9fa48("29509"), 'Token validation failed')
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
  if (stryMutAct_9fa48("29510")) {
    {}
  } else {
    stryCov_9fa48("29510");
    const token = getAuthToken();
    return stryMutAct_9fa48("29511") ? {} : (stryCov_9fa48("29511"), {
      'Authorization': stryMutAct_9fa48("29512") ? `` : (stryCov_9fa48("29512"), `Bearer ${token}`),
      'Content-Type': stryMutAct_9fa48("29513") ? "" : (stryCov_9fa48("29513"), 'application/json')
    });
  }
};

/**
 * Check if user has admin privileges
 * @returns {boolean} True if user is admin or staff
 */
export const hasAdminPrivileges = () => {
  if (stryMutAct_9fa48("29514")) {
    {}
  } else {
    stryCov_9fa48("29514");
    try {
      if (stryMutAct_9fa48("29515")) {
        {}
      } else {
        stryCov_9fa48("29515");
        const user = getAuthUser();
        return stryMutAct_9fa48("29518") ? user || user.role === 'admin' || user.role === 'staff' : stryMutAct_9fa48("29517") ? false : stryMutAct_9fa48("29516") ? true : (stryCov_9fa48("29516", "29517", "29518"), user && (stryMutAct_9fa48("29520") ? user.role === 'admin' && user.role === 'staff' : stryMutAct_9fa48("29519") ? true : (stryCov_9fa48("29519", "29520"), (stryMutAct_9fa48("29522") ? user.role !== 'admin' : stryMutAct_9fa48("29521") ? false : (stryCov_9fa48("29521", "29522"), user.role === (stryMutAct_9fa48("29523") ? "" : (stryCov_9fa48("29523"), 'admin')))) || (stryMutAct_9fa48("29525") ? user.role !== 'staff' : stryMutAct_9fa48("29524") ? false : (stryCov_9fa48("29524", "29525"), user.role === (stryMutAct_9fa48("29526") ? "" : (stryCov_9fa48("29526"), 'staff')))))));
      }
    } catch (error) {
      if (stryMutAct_9fa48("29527")) {
        {}
      } else {
        stryCov_9fa48("29527");
        return stryMutAct_9fa48("29528") ? true : (stryCov_9fa48("29528"), false);
      }
    }
  }
};

/**
 * Get session information
 * @returns {object} Session info including age and remaining time
 */
export const getSessionInfo = () => {
  if (stryMutAct_9fa48("29529")) {
    {}
  } else {
    stryCov_9fa48("29529");
    try {
      if (stryMutAct_9fa48("29530")) {
        {}
      } else {
        stryCov_9fa48("29530");
        const sessionStart = localStorage.getItem(STORAGE_KEYS.SESSION_START);
        const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
        if (stryMutAct_9fa48("29533") ? false : stryMutAct_9fa48("29532") ? true : stryMutAct_9fa48("29531") ? sessionStart : (stryCov_9fa48("29531", "29532", "29533"), !sessionStart)) {
          if (stryMutAct_9fa48("29534")) {
            {}
          } else {
            stryCov_9fa48("29534");
            return null;
          }
        }
        const sessionAge = stryMutAct_9fa48("29535") ? Date.now() + parseInt(sessionStart) : (stryCov_9fa48("29535"), Date.now() - parseInt(sessionStart));
        const remainingTime = stryMutAct_9fa48("29536") ? SESSION_TIMEOUT + sessionAge : (stryCov_9fa48("29536"), SESSION_TIMEOUT - sessionAge);
        const lastActivityAge = lastActivity ? stryMutAct_9fa48("29537") ? Date.now() + parseInt(lastActivity) : (stryCov_9fa48("29537"), Date.now() - parseInt(lastActivity)) : 0;
        return stryMutAct_9fa48("29538") ? {} : (stryCov_9fa48("29538"), {
          sessionAge,
          remainingTime,
          lastActivityAge,
          isExpired: stryMutAct_9fa48("29542") ? remainingTime > 0 : stryMutAct_9fa48("29541") ? remainingTime < 0 : stryMutAct_9fa48("29540") ? false : stryMutAct_9fa48("29539") ? true : (stryCov_9fa48("29539", "29540", "29541", "29542"), remainingTime <= 0)
        });
      }
    } catch (error) {
      if (stryMutAct_9fa48("29543")) {
        {}
      } else {
        stryCov_9fa48("29543");
        return null;
      }
    }
  }
};

/**
 * Refresh session activity timestamp
 */
export const refreshSession = () => {
  if (stryMutAct_9fa48("29544")) {
    {}
  } else {
    stryCov_9fa48("29544");
    try {
      if (stryMutAct_9fa48("29545")) {
        {}
      } else {
        stryCov_9fa48("29545");
        localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
      }
    } catch (error) {
      if (stryMutAct_9fa48("29546")) {
        {}
      } else {
        stryCov_9fa48("29546");
        console.error(stryMutAct_9fa48("29547") ? "" : (stryCov_9fa48("29547"), 'Error refreshing session:'), error);
      }
    }
  }
};

/**
 * Setup session monitoring
 * @param {function} onSessionExpired - Callback when session expires
 */
export const setupSessionMonitoring = onSessionExpired => {
  if (stryMutAct_9fa48("29548")) {
    {}
  } else {
    stryCov_9fa48("29548");
    // Check session every minute
    const interval = setInterval(() => {
      if (stryMutAct_9fa48("29549")) {
        {}
      } else {
        stryCov_9fa48("29549");
        if (stryMutAct_9fa48("29552") ? false : stryMutAct_9fa48("29551") ? true : stryMutAct_9fa48("29550") ? isAuthenticated() : (stryCov_9fa48("29550", "29551", "29552"), !isAuthenticated())) {
          if (stryMutAct_9fa48("29553")) {
            {}
          } else {
            stryCov_9fa48("29553");
            clearInterval(interval);
            if (stryMutAct_9fa48("29555") ? false : stryMutAct_9fa48("29554") ? true : (stryCov_9fa48("29554", "29555"), onSessionExpired)) {
              if (stryMutAct_9fa48("29556")) {
                {}
              } else {
                stryCov_9fa48("29556");
                onSessionExpired();
              }
            }
          }
        }
      }
    }, 60000);

    // Update activity on user interaction
    const updateActivity = () => {
      if (stryMutAct_9fa48("29557")) {
        {}
      } else {
        stryCov_9fa48("29557");
        if (stryMutAct_9fa48("29559") ? false : stryMutAct_9fa48("29558") ? true : (stryCov_9fa48("29558", "29559"), isAuthenticated())) {
          if (stryMutAct_9fa48("29560")) {
            {}
          } else {
            stryCov_9fa48("29560");
            refreshSession();
          }
        }
      }
    };

    // Listen for user activity
    (stryMutAct_9fa48("29561") ? [] : (stryCov_9fa48("29561"), [stryMutAct_9fa48("29562") ? "" : (stryCov_9fa48("29562"), 'mousedown'), stryMutAct_9fa48("29563") ? "" : (stryCov_9fa48("29563"), 'mousemove'), stryMutAct_9fa48("29564") ? "" : (stryCov_9fa48("29564"), 'keypress'), stryMutAct_9fa48("29565") ? "" : (stryCov_9fa48("29565"), 'scroll'), stryMutAct_9fa48("29566") ? "" : (stryCov_9fa48("29566"), 'touchstart')])).forEach(event => {
      if (stryMutAct_9fa48("29567")) {
        {}
      } else {
        stryCov_9fa48("29567");
        document.addEventListener(event, updateActivity, stryMutAct_9fa48("29568") ? false : (stryCov_9fa48("29568"), true));
      }
    });
    return () => {
      if (stryMutAct_9fa48("29569")) {
        {}
      } else {
        stryCov_9fa48("29569");
        clearInterval(interval);
        (stryMutAct_9fa48("29570") ? [] : (stryCov_9fa48("29570"), [stryMutAct_9fa48("29571") ? "" : (stryCov_9fa48("29571"), 'mousedown'), stryMutAct_9fa48("29572") ? "" : (stryCov_9fa48("29572"), 'mousemove'), stryMutAct_9fa48("29573") ? "" : (stryCov_9fa48("29573"), 'keypress'), stryMutAct_9fa48("29574") ? "" : (stryCov_9fa48("29574"), 'scroll'), stryMutAct_9fa48("29575") ? "" : (stryCov_9fa48("29575"), 'touchstart')])).forEach(event => {
          if (stryMutAct_9fa48("29576")) {
            {}
          } else {
            stryCov_9fa48("29576");
            document.removeEventListener(event, updateActivity, stryMutAct_9fa48("29577") ? false : (stryCov_9fa48("29577"), true));
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
  if (stryMutAct_9fa48("29578")) {
    {}
  } else {
    stryCov_9fa48("29578");
    clearAuthData();
    if (stryMutAct_9fa48("29580") ? false : stryMutAct_9fa48("29579") ? true : (stryCov_9fa48("29579", "29580"), redirectCallback)) {
      if (stryMutAct_9fa48("29581")) {
        {}
      } else {
        stryCov_9fa48("29581");
        redirectCallback();
      }
    }
  }
};
export default stryMutAct_9fa48("29582") ? {} : (stryCov_9fa48("29582"), {
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