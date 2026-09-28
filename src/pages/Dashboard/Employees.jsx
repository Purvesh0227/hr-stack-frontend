import { Navigate, useOutletContext } from "react-router-dom";
import EmployeeTable from "../../components/dashboard/EmployeeTable";
import EmployeeModal from "../../components/EmployeeModal";

function Employees() {
    const {
        role,
        employees,
        filteredEmployees,
        paginatedEmployees,
        loadingEmployees,
        employeeSearchTerm,
        setEmployeeSearchTerm,
        employeeCurrentPage,
        employeeTotalPages,
        setEmployeeCurrentPage,
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

    if (role !== "ADMIN") {
        return <Navigate to="/" replace />;
    }

    return (
        <>
            <div className="employees-page">

                {/* Page Header */}
                <div className="employees-page-header">
                    <div>
                        <p className="dashboard-eyebrow">
                            Admin Dashboard
                        </p>

                        <h1>Employees</h1>

                        <p className="employees-page-subtitle">
                            Manage employees and employee information.
                        </p>
                    </div>

                    {/* Employee Count */}
                    <div className="employee-summary">
                        <span className="employee-summary-label">
                            Total Employees
                        </span>

                        <strong>
                            {employees?.length || 0}
                        </strong>
                    </div>
                </div>

                {/* Employee Table */}
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

            {/* Employee Modal */}
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

export default Employees;