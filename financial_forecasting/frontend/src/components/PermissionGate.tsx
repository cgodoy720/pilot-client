import React, { useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { usePermissions } from '../contexts/PermissionsContext';
import toast from 'react-hot-toast';

interface PermissionGateProps {
  /** A single permission key string, or a function for complex checks (e.g. OR logic). */
  permission: string | ((can: (k: string) => boolean) => boolean);
  children: React.ReactNode;
  /** Where to redirect when access is denied. Defaults to /priorities. */
  redirectTo?: string;
}

/**
 * Route-level permission gate. Wraps a page component and redirects
 * to a safe page if the current user lacks the required permission.
 *
 * Shows a loading spinner while permissions are being resolved to
 * prevent flash-of-redirect on first render.
 */
const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  children,
  redirectTo = '/priorities',
}) => {
  const { can, loading } = usePermissions();
  const toastShown = useRef(false);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const hasAccess = typeof permission === 'function' ? permission(can) : can(permission);

  if (!hasAccess) {
    // Show toast only once per gate render cycle (React.StrictMode can double-render)
    if (!toastShown.current) {
      toast.error("You don't have access to this page");
      toastShown.current = true;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default PermissionGate;
