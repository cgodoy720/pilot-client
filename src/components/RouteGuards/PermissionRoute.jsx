import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * PermissionRoute Component
 * 
 * A generic route guard that checks if the user has the required permission.
 * Replaces role-specific guards like AdminRoute, BuilderRoute, etc.
 * 
 * @param {string} permission - Required permission key (e.g., 'page:admin_dashboard')
 * @param {React.ReactNode} children - Child components to render if authorized
 * @param {string} fallback - Redirect path if unauthorized (default: '/dashboard')
 * @param {boolean} requireActive - Also require user.active === true (default: false)
 */
export function PermissionRoute({ 
  permission, 
  children, 
  fallback = '/dashboard',
  requireActive = false 
}) {
  const { user, isLoading } = useAuth();
  const { hasPermission } = usePermissions();
  
  // Show loading state while auth is being verified
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // Check active status if required
  if (requireActive && user?.active === false) {
    return <Navigate to={fallback} replace />;
  }
  
  // Check permission
  if (!hasPermission(permission)) {
    return <Navigate to={fallback} replace />;
  }
  
  return children;
}

/**
 * MultiPermissionRoute Component
 * 
 * Requires user to have ANY of the specified permissions.
 * 
 * @param {string[]} permissions - Array of permission keys (user needs at least one)
 * @param {React.ReactNode} children - Child components to render if authorized
 * @param {string} fallback - Redirect path if unauthorized
 */
export function MultiPermissionRoute({ 
  permissions, 
  children, 
  fallback = '/dashboard' 
}) {
  const { isLoading } = useAuth();
  const { hasAnyPermission } = usePermissions();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!hasAnyPermission(permissions)) {
    return <Navigate to={fallback} replace />;
  }
  
  return children;
}

/**
 * ActiveUserRoute Component
 * 
 * Requires user to have active status (user.active !== false).
 * Used for routes that require an active enrollment.
 * 
 * @param {React.ReactNode} children - Child components to render if active
 * @param {string} fallback - Redirect path if inactive
 */
export function ActiveUserRoute({ children, fallback = '/dashboard' }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (user?.active === false) {
    return <Navigate to={fallback} replace />;
  }
  
  return children;
}

/**
 * Legacy route guards for backwards compatibility
 * These use the new permission system under the hood
 */

export function AdminRoute({ children }) {
  return (
    <PermissionRoute permission="page:staff_section">
      {children}
    </PermissionRoute>
  );
}

export function AdminOnlyRoute({ children }) {
  return (
    <PermissionRoute permission="page:admin_section">
      {children}
    </PermissionRoute>
  );
}

export function BuilderRoute({ children }) {
  const { user } = useAuth();
  const { canAccessPage } = usePermissions();
  
  // BuilderRoute excludes workshop/enterprise users from builder-specific pages
  const excludedRoles = ['workshop_participant', 'workshop_admin', 'enterprise_builder', 'enterprise_admin', 'applicant'];
  
  if (excludedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Also check they have pathfinder permission (builder-specific)
  if (!canAccessPage('pathfinder')) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

export function WorkshopAdminRoute({ children }) {
  return (
    <PermissionRoute permission="page:workshop_admin">
      {children}
    </PermissionRoute>
  );
}

export function EnterpriseAdminRoute({ children }) {
  return (
    <PermissionRoute permission="page:cohort_admin">
      {children}
    </PermissionRoute>
  );
}

export function VolunteerRoute({ children }) {
  return (
    <PermissionRoute permission="page:volunteer_section">
      {children}
    </PermissionRoute>
  );
}

export default PermissionRoute;
