import { MdDashboard } from "react-icons/md";
import { FaUserShield } from "react-icons/fa";
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

        if (path === "/dashboard") {
            return "dashboard";
        }

        if (path.startsWith("/dashboard/admins")) {
            return "admins";
        }

        if (path.startsWith("/dashboard/attendance")) {
            return "attendance";
        }

        if (path.startsWith("/dashboard/finance")) {
            return "finance";
        }

        if (path.startsWith("/dashboard/settings")) {
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
                    className={
                        activeMenu === "dashboard"
                            ? "active"
                            : ""
                    }
                    onClick={() => navigate("/dashboard")}
                >
                    <MdDashboard className="icon" />
                    <span>
                        {role === "ADMIN"
                            ? "Dashboard"
                            : "Home"}
                    </span>
                </button>

                {role === "ADMIN" && (
                    <button
                        className={
                            activeMenu === "admins"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            navigate("/dashboard/admins")
                        }
                    >
                        <FaUserShield className="icon" />
                        <span>Admins</span>
                    </button>
                )}

                <button
                    className={
                        activeMenu === "attendance"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        navigate("/dashboard/attendance")
                    }
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
                    onClick={() =>
                        navigate("/dashboard/finance")
                    }
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
                    onClick={() =>
                        navigate("/dashboard/settings")
                    }
                >
                    <IoSettingsSharp className="icon" />
                    <span>Settings</span>
                </button>
            </nav>
        </aside>
    );
}

export default AdminSidebar;