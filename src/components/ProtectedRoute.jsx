import { Navigate, useLocation } from "react-router-dom";
import { readStorageJson } from "../utils/storage";
import { savePostLoginPath } from "../utils/postLoginRedirect";

function ProtectedRoute({ children }) {
    const employee = readStorageJson("employee");
    const location = useLocation();

    if (employee) {
        return children;
    }
    
    savePostLoginPath(
        `${location.pathname}${location.search}${location.hash}`
    );

    return <Navigate to="/login" replace />;
}

export default ProtectedRoute;