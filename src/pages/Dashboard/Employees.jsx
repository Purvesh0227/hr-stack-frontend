import { Navigate, useOutletContext } from "react-router-dom";
import EmployeeTable from "../../components/dashboard/EmployeeTable";
import EmployeeModal from "../../components/EmployeeModal";

function Employees() {
    const {
        role,
        employees,
        employeeTotalElements,
        totalEmployees,
        loadingEmployees,

        employeeSearchTerm,
        setEmployeeSearchTerm,
        employeeStatusFilter,
        setEmployeeStatusFilter,
        employeeFromDate,
        setEmployeeFromDate,
        employeeToDate,
        setEmployeeToDate,
        hasEmployeeFilters,
        handleClearEmployeeFilters,

        employeeCurrentPage,
        employeeTotalPages,
        setEmployeeCurrentPage,
        employeePageSize,
        setEmployeePageSize,

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
                            {totalEmployees}
                        </strong>
                    </div>
                </div>

                {/* Employee Table */}
                <EmployeeTable
                    employees={employees}
                    employeeTotalElements={employeeTotalElements}
                    loadingEmployees={loadingEmployees}

                    employeeSearchTerm={employeeSearchTerm}
                    setEmployeeSearchTerm={setEmployeeSearchTerm}
                    employeeStatusFilter={employeeStatusFilter}
                    setEmployeeStatusFilter={setEmployeeStatusFilter}
                    employeeFromDate={employeeFromDate}
                    setEmployeeFromDate={setEmployeeFromDate}
                    employeeToDate={employeeToDate}
                    setEmployeeToDate={setEmployeeToDate}
                    hasEmployeeFilters={hasEmployeeFilters}
                    handleClearEmployeeFilters={handleClearEmployeeFilters}

                    employeeCurrentPage={employeeCurrentPage}
                    employeeTotalPages={employeeTotalPages}
                    setEmployeeCurrentPage={setEmployeeCurrentPage}
                    employeePageSize={employeePageSize}
                    setEmployeePageSize={setEmployeePageSize}

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