import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "./hooks/auth/useAuth";

const VerifyAuth = () => {
  const { auth } = useAuth();
  const location = useLocation();

  return !auth?.accessToken ? (
    <Navigate to="/auth/login" state={{ from: location }} replace />
  ) : (
    <Outlet />
  );
};

export default VerifyAuth;
