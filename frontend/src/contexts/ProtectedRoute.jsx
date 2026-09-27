import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { HashLoader } from "react-spinners";
import { useState } from "react";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <HashLoader color={"#040413"} size={100} />
      </div>
    );
  }

  return user?.token ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
