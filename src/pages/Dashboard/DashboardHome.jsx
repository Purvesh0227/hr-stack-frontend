import { useOutletContext } from "react-router-dom";
import EmployeeDocumentUpload from "../../components/EmployeeDocumentUpload";

function DashboardHome() {
    const {
        role,
        employee,
        normalizedEmployeeStatus
    } = useOutletContext();

    return (
        <>
            <div className="dashboard-header">
                <div>
                    <h1>Welcome, {employee?.firstName}</h1>
                    <p>
                        {role === "ADMIN"
                            ? "Welcome to your admin dashboard."
                            : "Welcome to your employee dashboard."}
                    </p>
                </div>
            </div>

            {role !== "ADMIN" &&
                normalizedEmployeeStatus === "PENDING_VERIFICATION" && (
                    <>
                        <div className="document-verification-banner">
                            <strong>Please Upload Required Documents</strong>
                            <p>
                                Your account is pending document verification.
                                Please upload your ID proof and Address proof.
                            </p>
                        </div>

                        <EmployeeDocumentUpload employee={employee} />
                    </>
                )}
        </>
    );
}

export default DashboardHome;