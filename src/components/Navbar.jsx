import { useNavigate } from "react-router-dom";
import "../styles/global.css";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./common/NotificationBell";
import ProfileCard from "./ProfileCard";
import GlobalSearch from "./GlobalSearch";

function Navbar({ role, employee, adminProfile }) {
    const navigate = useNavigate();

    return (
        <header className="navbar">
            <button
                className="navbar-logo"
                onClick={() => navigate("/")}
                type="button"
            >
                HRStack
            </button>

            <GlobalSearch />

            <div className="navbar-actions">
                <ThemeToggle />
                <NotificationBell />
            </div>

            <div className="navbar-right">
                <ProfileCard
                    role={role}
                    employee={employee}
                    adminProfile={adminProfile}
                    placement="navbar"
                />
            </div>
        </header>
    );
}

export default Navbar;

