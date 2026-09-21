import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

import DashboardHome from "./pages/Dashboard/DashboardHome";
import Employees from "./pages/Dashboard/Employees";
import Admins from "./pages/Dashboard/Admins";
import AttendancePage from "./pages/Dashboard/AttendancePage";
import FinancePage from "./pages/Dashboard/FinancePage";
import SettingsPage from "./pages/Dashboard/SettingsPage";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            >
                <Route index element={<DashboardHome />} />
                <Route path="employees" element={<Employees />} />
                <Route path="admins" element={<Admins />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="finance" element={<FinancePage />} />
                <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default AppRoutes;