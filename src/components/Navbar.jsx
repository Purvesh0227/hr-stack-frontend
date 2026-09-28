import { useNavigate } from "react-router-dom";
import "../styles/global.css";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
    const navigate = useNavigate();

    const employee = JSON.parse(localStorage.getItem("employee") || "null");

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <header className="navbar">
            <button
                className="navbar-logo"
                onClick={() => navigate("/")}
            >
                HRStack
            </button>

            <div className="navbar-actions">
                <ThemeToggle />
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