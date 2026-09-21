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
            <div className="dashboard-header">
                <div>
                    <h1>Employees</h1>
                    <p>Manage employees and employee information.</p>
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

export default Employees;