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
import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the auth context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = stryMutAct_9fa48("4360") ? () => undefined : (stryCov_9fa48("4360"), (() => {
  const useAuth = () => useContext(AuthContext);
  return useAuth;
})());
export const AuthProvider = ({
  children
}) => {
  if (stryMutAct_9fa48("4361")) {
    {}
  } else {
    stryCov_9fa48("4361");
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(stryMutAct_9fa48("4362") ? true : (stryCov_9fa48("4362"), false));
    const [isLoading, setIsLoading] = useState(stryMutAct_9fa48("4363") ? false : (stryCov_9fa48("4363"), true));

    // Check if user is already logged in (from localStorage)
    useEffect(() => {
      if (stryMutAct_9fa48("4364")) {
        {}
      } else {
        stryCov_9fa48("4364");
        const storedUser = localStorage.getItem(stryMutAct_9fa48("4365") ? "" : (stryCov_9fa48("4365"), 'user'));
        const storedToken = localStorage.getItem(stryMutAct_9fa48("4366") ? "" : (stryCov_9fa48("4366"), 'token'));
        if (stryMutAct_9fa48("4369") ? storedUser || storedToken : stryMutAct_9fa48("4368") ? false : stryMutAct_9fa48("4367") ? true : (stryCov_9fa48("4367", "4368", "4369"), storedUser && storedToken)) {
          if (stryMutAct_9fa48("4370")) {
            {}
          } else {
            stryCov_9fa48("4370");
            try {
              if (stryMutAct_9fa48("4371")) {
                {}
              } else {
                stryCov_9fa48("4371");
                const parsedUser = JSON.parse(storedUser);
                // Only set auth state for builder users (unified auth handles this)
                if (stryMutAct_9fa48("4374") ? parsedUser.userType !== 'builder' : stryMutAct_9fa48("4373") ? false : stryMutAct_9fa48("4372") ? true : (stryCov_9fa48("4372", "4373", "4374"), parsedUser.userType === (stryMutAct_9fa48("4375") ? "" : (stryCov_9fa48("4375"), 'builder')))) {
                  if (stryMutAct_9fa48("4376")) {
                    {}
                  } else {
                    stryCov_9fa48("4376");
                    setUser(parsedUser);
                    setToken(storedToken);
                    setIsAuthenticated(stryMutAct_9fa48("4377") ? false : (stryCov_9fa48("4377"), true));
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("4378")) {
                {}
              } else {
                stryCov_9fa48("4378");
                console.error(stryMutAct_9fa48("4379") ? "" : (stryCov_9fa48("4379"), 'Error parsing stored user data:'), error);
                // Clear invalid data
                localStorage.removeItem(stryMutAct_9fa48("4380") ? "" : (stryCov_9fa48("4380"), 'user'));
                localStorage.removeItem(stryMutAct_9fa48("4381") ? "" : (stryCov_9fa48("4381"), 'token'));
              }
            }
          }
        }
        setIsLoading(stryMutAct_9fa48("4382") ? true : (stryCov_9fa48("4382"), false));
      }
    }, stryMutAct_9fa48("4383") ? ["Stryker was here"] : (stryCov_9fa48("4383"), []));

    // Login function - now uses unified auth endpoint
    const login = async (email, password) => {
      if (stryMutAct_9fa48("4384")) {
        {}
      } else {
        stryCov_9fa48("4384");
        try {
          if (stryMutAct_9fa48("4385")) {
            {}
          } else {
            stryCov_9fa48("4385");
            setIsLoading(stryMutAct_9fa48("4386") ? false : (stryCov_9fa48("4386"), true));
            const response = await fetch(stryMutAct_9fa48("4387") ? `` : (stryCov_9fa48("4387"), `${import.meta.env.VITE_API_URL}/api/unified-auth/login`), stryMutAct_9fa48("4388") ? {} : (stryCov_9fa48("4388"), {
              method: stryMutAct_9fa48("4389") ? "" : (stryCov_9fa48("4389"), 'POST'),
              headers: stryMutAct_9fa48("4390") ? {} : (stryCov_9fa48("4390"), {
                'Content-Type': stryMutAct_9fa48("4391") ? "" : (stryCov_9fa48("4391"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("4392") ? {} : (stryCov_9fa48("4392"), {
                email,
                password
              }))
            }));
            const data = await response.json();
            if (stryMutAct_9fa48("4395") ? false : stryMutAct_9fa48("4394") ? true : stryMutAct_9fa48("4393") ? response.ok : (stryCov_9fa48("4393", "4394", "4395"), !response.ok)) {
              if (stryMutAct_9fa48("4396")) {
                {}
              } else {
                stryCov_9fa48("4396");
                // Check if this is a verification issue
                if (stryMutAct_9fa48("4399") ? response.status === 403 || data.needsVerification : stryMutAct_9fa48("4398") ? false : stryMutAct_9fa48("4397") ? true : (stryCov_9fa48("4397", "4398", "4399"), (stryMutAct_9fa48("4401") ? response.status !== 403 : stryMutAct_9fa48("4400") ? true : (stryCov_9fa48("4400", "4401"), response.status === 403)) && data.needsVerification)) {
                  if (stryMutAct_9fa48("4402")) {
                    {}
                  } else {
                    stryCov_9fa48("4402");
                    return stryMutAct_9fa48("4403") ? {} : (stryCov_9fa48("4403"), {
                      success: stryMutAct_9fa48("4404") ? true : (stryCov_9fa48("4404"), false),
                      error: stryMutAct_9fa48("4407") ? data.error && 'Email verification required' : stryMutAct_9fa48("4406") ? false : stryMutAct_9fa48("4405") ? true : (stryCov_9fa48("4405", "4406", "4407"), data.error || (stryMutAct_9fa48("4408") ? "" : (stryCov_9fa48("4408"), 'Email verification required'))),
                      needsVerification: stryMutAct_9fa48("4409") ? false : (stryCov_9fa48("4409"), true)
                    });
                  }
                }
                throw new Error(stryMutAct_9fa48("4412") ? data.error && 'Login failed' : stryMutAct_9fa48("4411") ? false : stryMutAct_9fa48("4410") ? true : (stryCov_9fa48("4410", "4411", "4412"), data.error || (stryMutAct_9fa48("4413") ? "" : (stryCov_9fa48("4413"), 'Login failed'))));
              }
            }

            // Store user data in localStorage
            localStorage.setItem(stryMutAct_9fa48("4414") ? "" : (stryCov_9fa48("4414"), 'user'), JSON.stringify(data.user));
            if (stryMutAct_9fa48("4416") ? false : stryMutAct_9fa48("4415") ? true : (stryCov_9fa48("4415", "4416"), data.token)) {
              if (stryMutAct_9fa48("4417")) {
                {}
              } else {
                stryCov_9fa48("4417");
                localStorage.setItem(stryMutAct_9fa48("4418") ? "" : (stryCov_9fa48("4418"), 'token'), data.token);
              }
            }

            // Only set auth context state for builder users
            if (stryMutAct_9fa48("4421") ? data.user.userType !== 'builder' : stryMutAct_9fa48("4420") ? false : stryMutAct_9fa48("4419") ? true : (stryCov_9fa48("4419", "4420", "4421"), data.user.userType === (stryMutAct_9fa48("4422") ? "" : (stryCov_9fa48("4422"), 'builder')))) {
              if (stryMutAct_9fa48("4423")) {
                {}
              } else {
                stryCov_9fa48("4423");
                setUser(data.user);
                setToken(data.token);
                setIsAuthenticated(stryMutAct_9fa48("4424") ? false : (stryCov_9fa48("4424"), true));
              }
            }
            return stryMutAct_9fa48("4425") ? {} : (stryCov_9fa48("4425"), {
              success: stryMutAct_9fa48("4426") ? false : (stryCov_9fa48("4426"), true),
              redirectTo: data.redirectTo,
              userType: data.user.userType
            });
          }
        } catch (error) {
          if (stryMutAct_9fa48("4427")) {
            {}
          } else {
            stryCov_9fa48("4427");
            return stryMutAct_9fa48("4428") ? {} : (stryCov_9fa48("4428"), {
              success: stryMutAct_9fa48("4429") ? true : (stryCov_9fa48("4429"), false),
              error: error.message
            });
          }
        } finally {
          if (stryMutAct_9fa48("4430")) {
            {}
          } else {
            stryCov_9fa48("4430");
            setIsLoading(stryMutAct_9fa48("4431") ? true : (stryCov_9fa48("4431"), false));
          }
        }
      }
    };

    // Signup function
    const signup = async (firstName, lastName, email, password) => {
      if (stryMutAct_9fa48("4432")) {
        {}
      } else {
        stryCov_9fa48("4432");
        try {
          if (stryMutAct_9fa48("4433")) {
            {}
          } else {
            stryCov_9fa48("4433");
            setIsLoading(stryMutAct_9fa48("4434") ? false : (stryCov_9fa48("4434"), true));
            const response = await fetch(stryMutAct_9fa48("4435") ? `` : (stryCov_9fa48("4435"), `${import.meta.env.VITE_API_URL}/api/users/signup`), stryMutAct_9fa48("4436") ? {} : (stryCov_9fa48("4436"), {
              method: stryMutAct_9fa48("4437") ? "" : (stryCov_9fa48("4437"), 'POST'),
              headers: stryMutAct_9fa48("4438") ? {} : (stryCov_9fa48("4438"), {
                'Content-Type': stryMutAct_9fa48("4439") ? "" : (stryCov_9fa48("4439"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("4440") ? {} : (stryCov_9fa48("4440"), {
                firstName,
                lastName,
                email,
                password
              }))
            }));
            if (stryMutAct_9fa48("4443") ? false : stryMutAct_9fa48("4442") ? true : stryMutAct_9fa48("4441") ? response.ok : (stryCov_9fa48("4441", "4442", "4443"), !response.ok)) {
              if (stryMutAct_9fa48("4444")) {
                {}
              } else {
                stryCov_9fa48("4444");
                const errorData = await response.json();
                throw new Error(stryMutAct_9fa48("4447") ? errorData.error && 'Registration failed' : stryMutAct_9fa48("4446") ? false : stryMutAct_9fa48("4445") ? true : (stryCov_9fa48("4445", "4446", "4447"), errorData.error || (stryMutAct_9fa48("4448") ? "" : (stryCov_9fa48("4448"), 'Registration failed'))));
              }
            }
            const data = await response.json();

            // With email verification, we don't automatically authenticate the user
            // They need to verify their email first
            return stryMutAct_9fa48("4449") ? {} : (stryCov_9fa48("4449"), {
              success: stryMutAct_9fa48("4450") ? false : (stryCov_9fa48("4450"), true),
              message: stryMutAct_9fa48("4453") ? data.message && 'Registration successful. Please check your email to verify your account.' : stryMutAct_9fa48("4452") ? false : stryMutAct_9fa48("4451") ? true : (stryCov_9fa48("4451", "4452", "4453"), data.message || (stryMutAct_9fa48("4454") ? "" : (stryCov_9fa48("4454"), 'Registration successful. Please check your email to verify your account.')))
            });
          }
        } catch (error) {
          if (stryMutAct_9fa48("4455")) {
            {}
          } else {
            stryCov_9fa48("4455");
            return stryMutAct_9fa48("4456") ? {} : (stryCov_9fa48("4456"), {
              success: stryMutAct_9fa48("4457") ? true : (stryCov_9fa48("4457"), false),
              error: error.message
            });
          }
        } finally {
          if (stryMutAct_9fa48("4458")) {
            {}
          } else {
            stryCov_9fa48("4458");
            setIsLoading(stryMutAct_9fa48("4459") ? true : (stryCov_9fa48("4459"), false));
          }
        }
      }
    };

    // Logout function
    const logout = () => {
      if (stryMutAct_9fa48("4460")) {
        {}
      } else {
        stryCov_9fa48("4460");
        // Clear state
        setUser(null);
        setToken(null);
        setIsAuthenticated(stryMutAct_9fa48("4461") ? true : (stryCov_9fa48("4461"), false));

        // Clear localStorage
        localStorage.removeItem(stryMutAct_9fa48("4462") ? "" : (stryCov_9fa48("4462"), 'user'));
        localStorage.removeItem(stryMutAct_9fa48("4463") ? "" : (stryCov_9fa48("4463"), 'token'));
      }
    };

    // Update user function (for profile updates)
    const updateUser = updatedUserData => {
      if (stryMutAct_9fa48("4464")) {
        {}
      } else {
        stryCov_9fa48("4464");
        const updatedUser = stryMutAct_9fa48("4465") ? {} : (stryCov_9fa48("4465"), {
          ...user,
          ...updatedUserData
        });
        setUser(updatedUser);

        // Update localStorage as well
        localStorage.setItem(stryMutAct_9fa48("4466") ? "" : (stryCov_9fa48("4466"), 'user'), JSON.stringify(updatedUser));
      }
    };

    // Manually set authentication state (for external logins like unified auth)
    const setAuthState = (userData, userToken) => {
      if (stryMutAct_9fa48("4467")) {
        {}
      } else {
        stryCov_9fa48("4467");
        setUser(userData);
        setToken(userToken);
        setIsAuthenticated(stryMutAct_9fa48("4468") ? false : (stryCov_9fa48("4468"), true));

        // Update localStorage as well
        localStorage.setItem(stryMutAct_9fa48("4469") ? "" : (stryCov_9fa48("4469"), 'user'), JSON.stringify(userData));
        if (stryMutAct_9fa48("4471") ? false : stryMutAct_9fa48("4470") ? true : (stryCov_9fa48("4470", "4471"), userToken)) {
          if (stryMutAct_9fa48("4472")) {
            {}
          } else {
            stryCov_9fa48("4472");
            localStorage.setItem(stryMutAct_9fa48("4473") ? "" : (stryCov_9fa48("4473"), 'token'), userToken);
          }
        }
      }
    };

    // Value object to be provided to consumers
    const value = stryMutAct_9fa48("4474") ? {} : (stryCov_9fa48("4474"), {
      user,
      token,
      isAuthenticated,
      isLoading,
      login,
      signup,
      logout,
      updateUser,
      setAuthState
    });
    return <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>;
  }
};