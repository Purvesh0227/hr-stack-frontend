import { useOutletContext } from "react-router-dom";
import EmployeeTable from "../../components/dashboard/EmployeeTable";
import EmployeeDocumentUpload from "../../components/EmployeeDocumentUpload";
import EmployeeModal from "../../components/EmployeeModal";

function DashboardHome() {
    const {
        role,
        employee,
        employees,
        filteredEmployees,
        paginatedEmployees,
        loadingEmployees,
        employeeSearchTerm,
        setEmployeeSearchTerm,
        employeeCurrentPage,
        employeeTotalPages,
        setEmployeeCurrentPage,
        normalizedEmployeeStatus,
        handleGetAllEmployees,
        handleViewEmployee,
        handleEditEmployee,
        handleCloseEmployeeModal,
        handleSaveEmployee,
        handleActivateEmployee,
        handleRequestDocuments,
        showEmployeeModal,
        selectedEmployee,
        employeeModalMode,
        toDisplayText
    } = useOutletContext();

    if (role === "ADMIN") {
        return (
            <>
                <div className="dashboard-header">
                    <div>
                        <h1>Welcome, {employee?.firstName}</h1>
                        <p>Manage employees and administrators.</p>
                    </div>
                </div>

                <div className="content-card">
                    <EmployeeTable
                        employees={employees}
                        filteredEmployees={filteredEmployees}
                        paginatedEmployees={paginatedEmployees}
                        loadingEmployees={loadingEmployees}
                        employeeSearchTerm={employeeSearchTerm}
                        setEmployeeSearchTerm={setEmployeeSearchTerm}
                        employeeCurrentPage={employeeCurrentPage}
                        employeeTotalPages={employeeTotalPages}
                        setEmployeeCurrentPage={setEmployeeCurrentPage}
                        handleGetAllEmployees={handleGetAllEmployees}
                        handleViewEmployee={handleViewEmployee}
                        handleEditEmployee={handleEditEmployee}
                        toDisplayText={toDisplayText}
                    />
                </div>

                <EmployeeModal
                    isOpen={showEmployeeModal}
                    employee={selectedEmployee}
                    mode={employeeModalMode}
                    onClose={handleCloseEmployeeModal}
                    onSave={handleSaveEmployee}
                    onActivate={handleActivateEmployee}
                    onRequestDocuments={handleRequestDocuments}
                />
            </>
        );
    }

    return (
        <>
            <div className="dashboard-header">
                <div>
                    <h1>Welcome, {employee?.firstName}</h1>
                    <p>Welcome to your employee dashboard.</p>
                </div>
            </div>

            <div className="content-card">
                <h2>Home</h2>
                <p>Welcome to HR-Stack Employee Dashboard.</p>
            </div>

            {normalizedEmployeeStatus === "PENDING_VERIFICATION" && (
                <div className="document-verification-banner">
                    <strong>Please Upload Required Documents</strong>
                    <p>
                        Your account is pending document verification.
                        Please upload your ID proof and Address proof.
                    </p>
                </div>
            )}

            {normalizedEmployeeStatus === "PENDING_VERIFICATION" && (
                <EmployeeDocumentUpload employee={employee} />
            )}
        </>
    );
}

export default DashboardHome;