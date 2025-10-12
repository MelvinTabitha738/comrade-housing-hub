import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/signin" />;
  }

  if (role && role !== userRole) {
    return <Navigate to="/" />; // unauthorized → back to home
  }

  return children;
};

export default ProtectedRoute;
