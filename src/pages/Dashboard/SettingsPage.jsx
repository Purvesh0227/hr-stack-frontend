import { useOutletContext } from "react-router-dom";
import Profile from "../../components/dashboard/Profile";

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
        <Profile
            role={role}
            employee={employee}
            adminProfile={role === "ADMIN" ? adminProfile : null}
            loadingProfile={loadingProfile}
            handleSaveOwnProfile={handleSaveOwnProfile}
            refreshAdminProfile={refreshAdminProfile}
        />
    );
}

export default SettingsPage;