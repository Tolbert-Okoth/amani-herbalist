import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  // Check localStorage for an admin session role
  // (The actual secret token is now hidden in an HttpOnly cookie)
  const adminRole = localStorage.getItem('fohow_admin_role');

  // If there is no role assigned, silently kick them back to the Home page
  if (!adminRole) {
    return <Navigate to="/eden-secure-portal-hq/login" replace />;
  }

  // If they have the token, render the Admin component
  return children;
};

export default AdminRoute;
