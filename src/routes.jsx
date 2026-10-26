import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

import VerifyEmail from "./pages/VerifyEmail";
import AppReleasesPage from "./pages/Dashboard/AppReleasesPage";

import QrScanPage from "./pages/QrScanPage";

import DashboardHome from "./pages/Dashboard/DashboardHome";
import Employees from "./pages/Dashboard/Employees";
import Admins from "./pages/Dashboard/Admins";
import AttendancePage from "./pages/Dashboard/AttendancePage";
import FinancePage from "./pages/Dashboard/FinancePage";
import SettingsPage from "./pages/Dashboard/SettingsPage";
import AlreadyLoggedIn from "./pages/AlreadyLoggedIn";
import ForgotPassword from "./pages/ForgotPassword";
import { readStorageJson } from "./utils/storage";
import AnnouncementsPage from "./pages/Dashboard/AnnouncementsPage";

function AuthEntry({ children }) {
    const employee = readStorageJson("employee");

    if (employee) {
        return <AlreadyLoggedIn />;
    }

    return children;
}

function AppRoutes() {
    return (
            <Routes>
                <Route path="/login" element={ <AuthEntry> <Login /> </AuthEntry>} />
                <Route path="/register" element={<AuthEntry> <Register /> </AuthEntry>} />

                <Route path="/verify-email"  element={<VerifyEmail />}/>

                <Route path="/forgot-password" element={<AuthEntry><ForgotPassword /></AuthEntry>} />

            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            >
                <Route path="app-releases" element={<AppReleasesPage />} />
                <Route index element={<DashboardHome />} />
                <Route path="employees" element={<Employees />} />
                <Route path="admins" element={<Admins />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="finance" element={<FinancePage />} />
                <Route path="announcements" element={<AnnouncementsPage />} />
                <Route path="settings" element={<SettingsPage />} />
            </Route>


            <Route
                path="/attendance/scan"
                element={
                    <ProtectedRoute>
                        <QrScanPage />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default AppRoutes;