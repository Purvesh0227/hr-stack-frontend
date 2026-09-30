import { useOutletContext } from "react-router-dom";
import Profile from "../../components/dashboard/Profile";
import NotificationSettings from "../../components/common/NotificationSettings";

function SettingsPage() {
    const {
        role,
        employee,
        adminProfile,
        loadingProfile,
        handleSaveOwnProfile,
        refreshAdminProfile
    } = useOutletContext();

    return (
        <div className="settings-page">

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