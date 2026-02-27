import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

// Create the auth context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch effective permissions from the backend and attach to user object
  const fetchAndSetPermissions = useCallback(async (currentToken, currentUser) => {
    if (!currentToken || !currentUser) return currentUser;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/permissions/my-permissions`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        // data.permissions is { "page:dashboard": true, "feature:edit_curriculum": false, ... }
        // data.detailed is the full array from getUserEffectivePermissions
        const updatedUser = {
          ...currentUser,
          effectivePermissions: data.permissions || {},
          customPermissions: (data.detailed || []).filter(p => p.source === 'custom'),
        };
        // Update localStorage with permissions attached
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
    } catch (error) {
      console.error('Error fetching effective permissions:', error);
    }
    return currentUser;
  }, []);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Set auth state for builder users, workshop participants, volunteers, AND workshop participant applicants
          if (parsedUser.userType === 'builder' || parsedUser.userType === 'workshop_participant' || 
              parsedUser.userType === 'volunteer' || 
              (parsedUser.userType === 'applicant' && parsedUser.isWorkshopParticipant)) {
            // Set initial state with stored data (may include cached permissions)
            setToken(storedToken);
            setIsAuthenticated(true);
            
            // Fetch fresh permissions from DB in the background
            const userWithPerms = await fetchAndSetPermissions(storedToken, parsedUser);
            setUser(userWithPerms);
          }
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Clear invalid data
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      
      setIsLoading(false);
    };
    
    initAuth();
  }, [fetchAndSetPermissions]);

  // Login function - now uses unified auth endpoint
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/unified-auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if this is a verification issue
        if (response.status === 403 && data.needsVerification) {
          return { 
            success: false, 
            error: data.error || 'Email verification required', 
            needsVerification: true 
          };
        }
        throw new Error(data.error || 'Login failed');
      }
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      // Set auth context state for builder users, volunteers, and workshop participant applicants
      if (data.user.userType === 'builder' || data.user.userType === 'volunteer' || 
          (data.user.userType === 'applicant' && data.user.isWorkshopParticipant)) {
        setToken(data.token);
        setIsAuthenticated(true);
        
        // Fetch effective permissions from backend and attach to user
        const userWithPerms = await fetchAndSetPermissions(data.token, data.user);
        setUser(userWithPerms);
      }
      
      return { success: true, redirectTo: data.redirectTo, userType: data.user.userType };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (firstName, lastName, email, password) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data = await response.json();
      
      // With email verification, we don't automatically authenticate the user
      // They need to verify their email first
      return { 
        success: true, 
        message: data.message || 'Registration successful. Please check your email to verify your account.' 
      };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear state
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Update user function (for profile updates)
  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    
    // Update localStorage as well
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Manually set authentication state (for external logins like unified auth)
  const setAuthState = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setIsAuthenticated(true);
    
    // Update localStorage as well
    localStorage.setItem('user', JSON.stringify(userData));
    if (userToken) {
      localStorage.setItem('token', userToken);
    }
  };

  // Refresh permissions from the backend (call after role/permission changes)
  const refreshPermissions = useCallback(async () => {
    if (token && user) {
      const userWithPerms = await fetchAndSetPermissions(token, user);
      setUser(userWithPerms);
    }
  }, [token, user, fetchAndSetPermissions]);

  // Value object to be provided to consumers
  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    updateUser,
    setAuthState,
    refreshPermissions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
