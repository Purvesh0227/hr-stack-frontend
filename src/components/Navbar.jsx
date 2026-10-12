import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronDown, FiCreditCard, FiLogOut, FiSettings } from "react-icons/fi";
import "../styles/global.css";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./common/NotificationBell";
import IdCardModal from "./common/IdCardModal";

function Navbar({ role, employee, adminProfile }) {
    const navigate = useNavigate();
    const menuRef = useRef(null);

    const [menuOpen, setMenuOpen] = useState(false);
    const [showIdCard, setShowIdCard] = useState(false);
    const [photoFailed, setPhotoFailed] = useState(false);

    // admin data loads a moment later, so fall back to the login data
    const profile =
        (role === "ADMIN" ? adminProfile : employee) || employee;

    const firstName = profile?.firstName || "";
    const lastName = profile?.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim() || "My account";
    const email = profile?.email || "";
    const initials =
        `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
    const photoUrl = photoFailed ? null : profile?.profilePhotoUrl;

    // a new photo URL gets another chance
    useEffect(() => {
        setPhotoFailed(false);
    }, [profile?.profilePhotoUrl]);

    // close on outside click and on Esc
    useEffect(() => {
        if (!menuOpen) return;

        const onPointerDown = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        const onKeyDown = (event) => {
            if (event.key === "Escape") setMenuOpen(false);
        };

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [menuOpen]);

    const openSettings = () => {
        setMenuOpen(false);
        navigate("/settings");
    };

    const openIdCard = () => {
        setMenuOpen(false);
        setShowIdCard(true);          // opens the modal right here, no redirect
    };

    const logout = () => {
        setMenuOpen(false);
        localStorage.clear();
        navigate("/login");
    };

    const avatar = (extraClass = "") => (
        <span className={`account-avatar ${extraClass}`}>
            {photoUrl ? (
                <img
                    src={photoUrl}
                    alt={fullName}
                    onError={() => setPhotoFailed(true)}
                />
            ) : (
                initials
            )}
        </span>
    );

    return (
        <>
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
                    <div className="account-dropdown" ref={menuRef}>
                        <button
                            type="button"
                            className="account-dropdown-trigger"
                            onClick={() => setMenuOpen((open) => !open)}
                            aria-haspopup="menu"
                            aria-expanded={menuOpen}
                            aria-label="Account menu"
                        >
                            {avatar()}
                            <span className="account-trigger-name">{fullName}</span>
                            <FiChevronDown
                                className={`account-chevron ${
                                    menuOpen ? "account-chevron-open" : ""
                                }`}
                            />
                        </button>

                        {menuOpen && (
                            <div className="account-dropdown-menu" role="menu">
                                <div className="account-dropdown-header">
                                    {avatar("account-avatar-large")}
                                    <div className="account-dropdown-identity">
                                        <strong>{fullName}</strong>
                                        <span>{email}</span>
                                    </div>
                                </div>

                                <div className="account-dropdown-divider" />

                                <button
                                    type="button"
                                    role="menuitem"
                                    className="account-dropdown-item"
                                    onClick={openSettings}
                                >
                                    <FiSettings />
                                    <span>Settings</span>
                                </button>

                                <button
                                    type="button"
                                    role="menuitem"
                                    className="account-dropdown-item"
                                    onClick={openIdCard}
                                    disabled={!profile}
                                >
                                    <FiCreditCard />
                                    <span>ID Card</span>
                                </button>

                                <div className="account-dropdown-divider" />

                                <button
                                    type="button"
                                    role="menuitem"
                                    className="account-dropdown-item account-dropdown-logout"
                                    onClick={logout}
                                >
                                    <FiLogOut />
                                    <span>Log out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {showIdCard && profile && (
                <IdCardModal
                    profile={profile}
                    onClose={() => setShowIdCard(false)}
                />
            )}
        </>
    );
}

export default Navbar;