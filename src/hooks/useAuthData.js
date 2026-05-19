// hooks/useAuth.js
import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { user, token, adminId, isAuthenticated, systemRights, userRights } = 
    useSelector((state) => state.auth);
  
  return {
    user,
    token,
    adminId,
    isAuthenticated,
    systemRights,
    userRights,
    refId: user?.refId,
    userName: user?.name,
    userEmail: user?.email,
    isAdmin: user?.role === 'admin'
  };
};

// Use in any component
const CompanySettings = () => {
  const { user, refId, isAdmin, token } = useAuth();
  // Now directly use these variables
};