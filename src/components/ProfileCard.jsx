import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiCreditCard,
    FiLogOut,
    FiSettings,
} from "react-icons/fi";
import "../styles/global.css";
import IdCardModal from "./common/IdCardModal";
import { clearStorage } from "../utils/storage";

function ProfileCard({ role, employee, adminProfile, placement = "navbar" }) {
    const navigate = useNavigate();
    const menuRef = useRef(null);

    const [menuOpen, setMenuOpen] = useState(false);
    const [showIdCard, setShowIdCard] = useState(false);
    const [photoFailed, setPhotoFailed] = useState(false);

    // Select the correct profile for the current role.
    const profile =
        (role === "ADMIN" ? adminProfile : employee) || employee;

    const firstName = profile?.firstName || "";
    const lastName = profile?.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim() || "My account";
    const email = profile?.email || "";
    const initials =
        `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
    const photoUrl = photoFailed ? null : profile?.profilePhotoUrl;

    // Retry loading when the profile photo URL changes.
    useEffect(() => {
        setPhotoFailed(false);
    }, [profile?.profilePhotoUrl]);

    // Close the menu when clicking outside or pressing Escape.
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
        setShowIdCard(true);
    };

    const logout = () => {
        setMenuOpen(false);
        clearStorage();
        navigate("/login", { replace: true });
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
            <div
                className={`account-dropdown account-dropdown-${placement}`}
                ref={menuRef}
            >
                <button
                    type="button"
                    className={`account-dropdown-trigger ${
                        placement === "sidebar"
                            ? "account-sidebar-trigger"
                            : "account-navbar-trigger"
                    }`}
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    aria-label="Account menu"
                >
                    {avatar()}

                    {placement === "sidebar" && (
                        <span className="account-trigger-name">
                            {firstName || "My account"} {lastName}
                        </span>
                    )}
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

            {showIdCard && profile && (
                <IdCardModal
                    profile={profile}
                    onClose={() => setShowIdCard(false)}
                />
            )}
        </>
    );
}

export default ProfileCard;

