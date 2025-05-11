import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminAuthContext } from '../context/adminAuthContext';

const AdminRoute = ({ children }) => {
  const { currentAdmin } = useContext(AdminAuthContext);

  if (!currentAdmin) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default AdminRoute;
