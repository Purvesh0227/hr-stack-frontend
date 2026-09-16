import AdminSidebar from "../AdminSidebar";
import Attendance from "../Attendance";
import Finance from "../Finance";
import EmployeeDocumentUpload from "../EmployeeDocumentUpload";
import Profile from "./Profile";

function EmployeeDashboard({
    role,
    employee,
    activeMenu,
    setActiveMenu,
    normalizedEmployeeStatus
}) {
    return (
        <div className="dashboard-wrapper">

            <AdminSidebar
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                role={role}
            />

            <main className="dashboard-main">

                {/* HOME */}

                {activeMenu === "dashboard" && (
                    <>
                        <div className="dashboard-header">
                            <div>
                                <h1>
                                    Welcome, {employee?.firstName}
                                </h1>

                                <p>
                                    Welcome to your employee
                                    dashboard.
                                </p>
                            </div>
                        </div>

                        <div className="content-card">
                            <h2>Home</h2>

                            <p>
                                Welcome to HR-Stack Employee
                                Dashboard.
                            </p>
                        </div>

                        {/* DOCUMENT VERIFICATION */}

                        {normalizedEmployeeStatus ===
                            "PENDING_VERIFICATION" && (
                            <div className="document-verification-banner">
                                <strong>
                                    Please Upload Required Documents
                                </strong>

                                <p>
                                    Your account is pending
                                    document verification.
                                    Please upload your ID proof
                                    and Address proof.
                                </p>
                            </div>
                        )}

                        {normalizedEmployeeStatus ===
                            "PENDING_VERIFICATION" && (
                            <EmployeeDocumentUpload
                                employee={employee}
                            />
                        )}
                    </>
                )}

                {/* ATTENDANCE */}

                {activeMenu === "attendance" && (
                    <Attendance role={role} />
                )}

                {/* FINANCE */}

                {activeMenu === "finance" && (
                    <Finance role={role} />
                )}

                {/* SETTINGS */}

                {activeMenu === "settings" && (
                    <Profile
                        role={role}
                        employee={employee}
                    />
                )}

            </main>
        </div>
    );
}

export default EmployeeDashboard;