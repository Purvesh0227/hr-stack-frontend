import { Navigate } from "react-router-dom";
import { readStorageJson } from "../utils/storage";

function ProtectedRoute({ children }) {
    const employee = readStorageJson("employee");
    return employee ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;