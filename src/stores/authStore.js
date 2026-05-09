import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const isValidUserType = (user) => {
  if (!user) return false;
  return (
    user.userType === 'builder' ||
    user.userType === 'workshop_participant' ||
    user.userType === 'volunteer' ||
    (user.userType === 'applicant' && user.isWorkshopParticipant)
  );
};

// Captured store API to avoid TDZ in onRehydrateStorage
// (persist hydration can fire synchronously before useAuthStore is assigned)
let _storeApi;

const useAuthStore = create(
  persist(
    (set, get) => {
      _storeApi = { set, get };
      return {
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      _hasHydrated: false,
      // Tracks whether the post-rehydration `_fetchAndSetUserFields` +
      // `_fetchAndSetPermissions` Promise.all has resolved. `isLoading`
      // alone is NOT a sufficient signal for "auth is fully ready":
      // `onRehydrateStorage` flips `isLoading: false` immediately after
      // STARTING the background refresh, so consumers that gate on
      // `isLoading` will read stale persisted-only fields (e.g. a
      // pre-cohort `user` from localStorage) for the duration of the
      // network round-trip. Consumers that need the freshest server
      // state — most importantly access guards that decide based on
      // user.cohort or user.role — should wait on
      // `_userFieldsHydrated === true` AS WELL.
      // We deliberately did not change `isLoading` itself because
      // ProtectedRoute and other top-level routes use it as a generic
      // "auth has settled enough to render persisted state" gate, and
      // making them wait an extra HTTP round-trip on every hard reload
      // would add a visible loading screen across the whole app for the
      // sake of one specific guard.
      _userFieldsHydrated: false,

      // Internal action: fetch and set permissions
      _fetchAndSetPermissions: async (currentToken, currentUser) => {
        if (!currentToken || !currentUser) return currentUser;
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/permissions/my-permissions`,
            {
              headers: { Authorization: `Bearer ${currentToken}` },
            }
          );
          if (response.ok) {
            const data = await response.json();
            const updatedUser = {
              ...currentUser,
              effectivePermissions: data.permissions || {},
              customPermissions: (data.detailed || []).filter(
                (p) => p.source === 'custom'
              ),
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
          }
        } catch (error) {
          console.error('Error fetching effective permissions:', error);
        }
        return currentUser;
      },

      // Internal action: fetch fresh core user fields from server
      _fetchAndSetUserFields: async (currentToken, currentUser) => {
        if (!currentToken || !currentUser) return currentUser;
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/users/me`,
            { headers: { Authorization: `Bearer ${currentToken}` } }
          );
          if (response.ok) {
            const freshFields = await response.json();
            return { ...currentUser, ...freshFields };
          }
        } catch (error) {
          console.error('Error fetching current user fields:', error);
        }
        return currentUser;
      },

      // Actions
      login: async (email, password) => {
        const { _fetchAndSetPermissions } = get();
        try {
          set({ isLoading: true });
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/unified-auth/login`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            }
          );
          const data = await response.json();
          if (!response.ok) {
            if (response.status === 403 && data.needsVerification) {
              return {
                success: false,
                error: data.error || 'Email verification required',
                needsVerification: true,
              };
            }
            throw new Error(data.error || 'Login failed');
          }

          if (isValidUserType(data.user)) {
            const userWithPerms = await _fetchAndSetPermissions(
              data.token,
              data.user
            );
            set({ token: data.token, isAuthenticated: true, user: userWithPerms });
            localStorage.setItem('token', data.token);
          } else {
            // Applicant portal reads user from localStorage and token from applicantToken
            localStorage.setItem('user', JSON.stringify(data.user));
            if (data.user.userType === 'applicant') {
              localStorage.setItem('applicantToken', data.token);
            }
          }

          return {
            success: true,
            redirectTo: data.redirectTo,
            userType: data.user.userType,
          };
        } catch (error) {
          return { success: false, error: error.message };
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (firstName, lastName, email, password) => {
        try {
          set({ isLoading: true });
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/users/signup`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ firstName, lastName, email, password }),
            }
          );
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Registration failed');
          }
          const data = await response.json();
          return {
            success: true,
            message:
              data.message ||
              'Registration successful. Please check your email to verify your account.',
          };
        } catch (error) {
          return { success: false, error: error.message };
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        // Belt-and-suspenders: explicitly remove all auth data from localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('applicantToken');
      },

      updateUser: (updatedUserData) => {
        const { user } = get();
        const updatedUser = { ...user, ...updatedUserData };
        set({ user: updatedUser });
        localStorage.setItem('user', JSON.stringify(updatedUser));
      },

      setAuthState: (userData, userToken) => {
        set({ user: userData, token: userToken, isAuthenticated: true });
        localStorage.setItem('user', JSON.stringify(userData));
        if (userToken) localStorage.setItem('token', userToken);
      },

      refreshPermissions: async () => {
        const { token, user, _fetchAndSetPermissions } = get();
        if (token && user) {
          const userWithPerms = await _fetchAndSetPermissions(token, user);
          set({ user: userWithPerms });
        }
      },

      setHasHydrated: (value) => {
        set({ _hasHydrated: value });
      },
    };
    },
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state, error) => {
        const { set: storeSet, get: storeGet } = _storeApi;

        if (error) {
          console.error('Error rehydrating auth store:', error);
          // No background refresh on error — mark hydration "done" so
          // guards that wait on _userFieldsHydrated don't deadlock on
          // a missing localStorage payload.
          storeSet({ isLoading: false, _hasHydrated: true, _userFieldsHydrated: true });
          return;
        }

        if (state) {
          const { user, token } = state;

          if (user && token && isValidUserType(user)) {
            storeSet({ isAuthenticated: true });
            localStorage.setItem('token', token);

            // Fetch fresh user fields and permissions in parallel (background, non-blocking)
            const { _fetchAndSetPermissions, _fetchAndSetUserFields } = storeGet();
            Promise.all([
              _fetchAndSetUserFields(token, user),
              _fetchAndSetPermissions(token, user),
            ])
              .then(([userWithFields, userWithPerms]) => {
                const mergedUser = {
                  ...user,
                  ...userWithFields,
                  effectivePermissions: userWithPerms.effectivePermissions,
                  customPermissions: userWithPerms.customPermissions,
                };
                storeSet({ user: mergedUser, _userFieldsHydrated: true });
              })
              .catch((err) => {
                console.error('Error refreshing user data on rehydration:', err);
                // Even on failure, flip the flag so access guards
                // (CompassRouteGuard, etc.) can fall back to whatever
                // persisted state we have rather than waiting forever
                // for a fetch that won't succeed.
                storeSet({ _userFieldsHydrated: true });
              });
          } else {
            // No valid persisted user/token — nothing to fetch, mark
            // the hydration flag immediately so guards proceed to the
            // unauthenticated branch.
            storeSet({ _userFieldsHydrated: true });
          }
        } else {
          // No persisted state at all — same as above.
          storeSet({ _userFieldsHydrated: true });
        }

        storeSet({ isLoading: false, _hasHydrated: true });
      },
    }
  )
);

// Convenience selectors
export const useUser = () => useAuthStore((s) => s.user);
export const useToken = () => useAuthStore((s) => s.token);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);

export { useAuthStore };
export default useAuthStore;
