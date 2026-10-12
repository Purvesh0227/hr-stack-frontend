
import { useOutletContext } from "react-router-dom";
import { FiLock } from "react-icons/fi";

import Profile from "../../components/dashboard/Profile";
import NotificationSettings from "../../components/common/NotificationSettings";
import ChangePassword from "../../components/common/ChangePassword";
import TwoFactorSettings from "../../components/common/TwoFactorSettings";

import "../../styles/SecuritySettings.css";

function SettingsPage() {
    const {
        role,
        email,
        employee,
        adminProfile,
        loadingProfile,
        handleSaveOwnProfile,
        refreshAdminProfile
    } = useOutletContext();

    return (
        <div className="settings-page">
            <section className="security-settings-card">
                <div className="security-settings-header">
                    <div className="security-settings-icon">
                        <FiLock />
                    </div>

                    <div className="security-settings-copy">
                        <h3>Password & Security</h3>
                        <p>
                            Manage your password and protect your
                            HR-Stack account.
                        </p>
                    </div>
                </div>

                <div className="security-settings-content">
                    <ChangePassword email={email} />
                    <TwoFactorSettings />
                </div>
            </section>

            <NotificationSettings />

            <Profile
                role={role}
                employee={employee}
                adminProfile={role === "ADMIN" ? adminProfile : null}
                loadingProfile={loadingProfile}
                handleSaveOwnProfile={handleSaveOwnProfile}
                refreshAdminProfile={refreshAdminProfile}
            />
        </div>
    );
}

export default SettingsPage;

