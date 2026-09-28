import { useOutletContext } from "react-router-dom";
import EmployeeDocumentUpload from "../../components/EmployeeDocumentUpload";

function DashboardHome() {
    const {
        role,
        employee,
        normalizedEmployeeStatus
    } = useOutletContext();

    const isPendingVerification =
        role !== "ADMIN" &&
        normalizedEmployeeStatus === "PENDING_VERIFICATION";

    return (
        <div className="home-page">

            {/* Page header */}
            <div className="dashboard-header">
                <div>
                    <p className="dashboard-eyebrow">
                        {role === "ADMIN" ? "Admin Dashboard" : "Employee Dashboard"}
                    </p>

                    <h1>
                        Welcome, {employee?.firstName || "User"}
                    </h1>

                    <p className="dashboard-subtitle">
                        {role === "ADMIN"
                            ? "Welcome to your admin dashboard."
                            : "Welcome to your employee dashboard."}
                    </p>
                </div>
            </div>

            {/* Verification section */}
            {isPendingVerification && (
                <section className="document-verification-section">

                    <div className="document-verification-banner">
                        <div>
                            <strong>Please Upload Required Documents</strong>

                            <p>
                                Your account is pending document verification.
                                Please upload your ID proof and Address proof.
                            </p>
                        </div>
                    </div>

                    <EmployeeDocumentUpload employee={employee} />

                </section>
            )}

        </div>
    );
}

export default DashboardHome;