import { Navigate } from "react-router-dom";
import { JSX, useContext } from "react";
import { MyUserContext } from "../../configs/MyContexts"; 

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const user = useContext(MyUserContext);

  if (!user) {
    return <Navigate to="/login" replace />;  
  }

  return children; // component trong thẻ ProtectedRoute
};

export default ProtectedRoute;
