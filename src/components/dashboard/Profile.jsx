import Loader from "../Loader";

function Profile({
    role,
    employee,
    adminProfile,
    loadingProfile
}) {
    const profile = role === "ADMIN"
        ? adminProfile
        : employee;

    if (role === "ADMIN" && loadingProfile) {
        return (
            <div className="content-card">
                <h2>My Profile</h2>
                <Loader />
            </div>
        );
    }

    return (
        <div className="content-card">
            <h2>My Profile</h2>

            {profile && (
                <div className="profile-details">

                    <p>
                        <strong>Employee ID :</strong>{" "}
                        {profile.empId || profile.id}
                    </p>

                    <p>
                        <strong>Name :</strong>{" "}
                        {profile.firstName} {profile.lastName}
                    </p>

                    <p>
                        <strong>Email :</strong>{" "}
                        {profile.email}
                    </p>

                    {role !== "ADMIN" && (
                        <p>
                            <strong>Mobile :</strong>{" "}
                            {profile.mobile}
                        </p>
                    )}

                    <p>
                        <strong>Role :</strong>{" "}
                        {profile.role}
                    </p>

                </div>
            )}
        </div>
    );
}

export default Profile;