import { MdDashboard } from "react-icons/md";
import { FaUserShield } from "react-icons/fa";
import { FaUsers } from "react-icons/fa6";
import { IoSettingsSharp } from "react-icons/io5";
import { FaCalendarCheck } from "react-icons/fa6";
import { MdAccountBalanceWallet } from "react-icons/md";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/global.css";

function AdminSidebar({ role }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false); // mobile drawer state

    const getActiveMenu = () => {
        const path = location.pathname;

        if (path === "/") return "dashboard";
        if (path.startsWith("/employees")) return "employees";
        if (path.startsWith("/admins")) return "admins";
        if (path.startsWith("/attendance")) return "attendance";
        if (path.startsWith("/finance")) return "finance";
        if (path.startsWith("/settings")) return "settings";

        return "dashboard";
    };

    const activeMenu = getActiveMenu();

    // closes the drawer after picking a page on mobile
    const go = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    return (
        <>
            {/* hamburger, shown only on mobile via CSS */}
            <button
                className="sidebar-mobile-toggle"
                onClick={() => setIsOpen(true)}
                aria-label="Open menu"
            >
                <HiOutlineMenu size={22} />
            </button>

            {/* dims the page behind the drawer on mobile */}
            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
                <div>
                    <div className="logo-section">
                        <p>
                            {role === "ADMIN"
                                ? "Admin Dashboard"
                                : "Employee Dashboard"}
                        </p>
                        {/* close button, shown only on mobile via CSS */}
                        <button
                            className="sidebar-mobile-close"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close menu"
                        >
                            <HiOutlineX size={18} />
                        </button>
                    </div>

                    <nav className="sidebar-menu">
                        <button
                            className={activeMenu === "dashboard" ? "active" : ""}
                            onClick={() => go("/")}
                        >
                            <MdDashboard className="icon" />
                            <span>Dashboard</span>
                        </button>

                        {role === "ADMIN" && (
                            <>
                                <button
                                    className={activeMenu === "employees" ? "active" : ""}
                                    onClick={() => go("/employees")}
                                >
                                    <FaUsers className="icon" />
                                    <span>Employees</span>
                                </button>

                                <button
                                    className={activeMenu === "admins" ? "active" : ""}
                                    onClick={() => go("/admins")}
                                >
                                    <FaUserShield className="icon" />
                                    <span>Admins</span>
                                </button>
                            </>
                        )}

                        <button
                            className={activeMenu === "attendance" ? "active" : ""}
                            onClick={() => go("/attendance")}
                        >
                            <FaCalendarCheck className="icon" />
                            <span>Attendance</span>
                        </button>

                        <button
                            className={activeMenu === "finance" ? "active" : ""}
                            onClick={() => go("/finance")}
                        >
                            <MdAccountBalanceWallet className="icon" />
                            <span>Finance</span>
                        </button>

                        <button
                            className={activeMenu === "settings" ? "active" : ""}
                            onClick={() => go("/settings")}
                        >
                            <IoSettingsSharp className="icon" />
                            <span>Settings</span>
                        </button>
                    </nav>
                </div>
            </aside>
        </>
    );
}

export default AdminSidebar;