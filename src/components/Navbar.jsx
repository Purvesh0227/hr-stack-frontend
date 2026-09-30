import { useNavigate } from "react-router-dom";
import "../styles/global.css";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./common/NotificationBell";

function Navbar() {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <header className="navbar">
            <button
                className="navbar-logo"
                onClick={() => navigate("/")}
                type="button"
            >
                HRStack
            </button>

            <div className="navbar-actions">
                <ThemeToggle />
                <NotificationBell />
            </div>

            <div className="navbar-right">
                <button
                    className="logout-btn"
                    onClick={logout}
                    type="button"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}

export default Navbar;