import { MdDashboard } from "react-icons/md";
import { FaUserShield } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { FaCalendarCheck } from "react-icons/fa6";

import "../styles/global.css";

function AdminSidebar({
    activeMenu,
    setActiveMenu,
    role
}) {

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

                {/* Dashboard / Home */}

                <button
                    className={
                        activeMenu === "dashboard"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setActiveMenu("dashboard")
                    }
                >
                    <MdDashboard className="icon" />

                    <span>
                        {role === "ADMIN"
                            ? "Dashboard"
                            : "Home"}
                    </span>
                </button>


                {/* ADMIN ONLY */}

                {role === "ADMIN" && (
                    <button
                        className={
                            activeMenu === "admins"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveMenu("admins")
                        }
                    >
                        <FaUserShield className="icon" />

                        <span>
                            Admins
                        </span>
                    </button>
                )}


                {/* ADMIN + EMPLOYEE */}

                <button
                    className={
                        activeMenu === "attendance"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setActiveMenu("attendance")
                    }
                >
                    <FaCalendarCheck className="icon" />

                    <span>
                        Attendance
                    </span>
                </button>


                {/* SETTINGS */}

                <button
                    className={
                        activeMenu === "settings"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setActiveMenu("settings")
                    }
                >
                    <IoSettingsSharp className="icon" />

                    <span>
                        Settings
                    </span>
                </button>

            </nav>

        </aside>
    );
}

export default AdminSidebar;