import { MdDashboard } from "react-icons/md";
import { FaUserShield } from "react-icons/fa";
import { FaUsers } from "react-icons/fa6";
import { IoSettingsSharp } from "react-icons/io5";
import { FaCalendarCheck } from "react-icons/fa6";
import { MdAccountBalanceWallet } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/global.css";

function AdminSidebar({ role }) {
    const navigate = useNavigate();
    const location = useLocation();

    const getActiveMenu = () => {
        const path = location.pathname;

        if (path === "/") {
            return "dashboard";
        }

        if (path.startsWith("/employees")) {
            return "employees";
        }

        if (path.startsWith("/admins")) {
            return "admins";
        }

        if (path.startsWith("/attendance")) {
            return "attendance";
        }

        if (path.startsWith("/finance")) {
            return "finance";
        }

        if (path.startsWith("/settings")) {
            return "settings";
        }

        return "dashboard";
    };

    const activeMenu = getActiveMenu();

    return (
        <aside className="sidebar">
            <div className="logo-section">
                <p>
                    {role === "ADMIN"
                        ? "Admin Dashboard"
                        : "Employee Dashboard"}
                </p>
            </div>

            <nav className="sidebar-menu">
                <button
                    className={activeMenu === "dashboard" ? "active" : ""}
                    onClick={() => navigate("/")}
                >
                    <MdDashboard className="icon" />
                    <span>Dashboard</span>
                </button>

                {role === "ADMIN" && (
                    <>
                        <button
                            className={
                                activeMenu === "employees"
                                    ? "active"
                                    : ""
                            }
                            onClick={() => navigate("/employees")}
                        >
                            <FaUsers className="icon" />
                            <span>Employees</span>
                        </button>

                        <button
                            className={
                                activeMenu === "admins"
                                    ? "active"
                                    : ""
                            }
                            onClick={() => navigate("/admins")}
                        >
                            <FaUserShield className="icon" />
                            <span>Admins</span>
                        </button>
                    </>
                )}

                <button
                    className={
                        activeMenu === "attendance"
                            ? "active"
                            : ""
                    }
                    onClick={() => navigate("/attendance")}
                >
                    <FaCalendarCheck className="icon" />
                    <span>Attendance</span>
                </button>

                <button
                    className={
                        activeMenu === "finance"
                            ? "active"
                            : ""
                    }
                    onClick={() => navigate("/finance")}
                >
                    <MdAccountBalanceWallet className="icon" />
                    <span>Finance</span>
                </button>

                <button
                    className={
                        activeMenu === "settings"
                            ? "active"
                            : ""
                    }
                    onClick={() => navigate("/settings")}
                >
                    <IoSettingsSharp className="icon" />
                    <span>Settings</span>
                </button>
            </nav>
        </aside>
    );
}

export default AdminSidebar;