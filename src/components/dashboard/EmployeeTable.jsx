import Loader from "../Loader";
import Pagination from "../Pagination";
import { FiEdit2, FiEye, FiSearch } from "react-icons/fi";
import { formatDate } from "../../utils/dateUtils";

function EmployeeTable({
    employees,
    employeeTotalElements,
    activeSearch,
    loadingEmployees,
    employeeSearchTerm,
    setEmployeeSearchTerm,
    employeeCurrentPage,
    employeeTotalPages,
    setEmployeeCurrentPage,
    handleGetAllEmployees,
    handleViewEmployee,
    handleEditEmployee,
    toDisplayText
}) {
    const getInitials = (employee) => {
        const first = employee?.firstName?.charAt(0) || "";
        const last = employee?.lastName?.charAt(0) || "";

        return `${first}${last}`.toUpperCase() || "U";
    };

    const getStatusClass = (status) => {
        return `status-badge status-${status
            ?.toLowerCase()
            .replace(/_/g, "-")}`;
    };

    return (
        <div className="employee-card">

            {/* Card Header */}
            <div className="employee-card-header">
                <div className="card-title-group">
                    <div>
                        <h2>Employee Directory</h2>

                        <p className="table-count">
                            {employeeTotalElements} employee
                            {employeeTotalElements !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                <div className="employee-table-actions">

                    {/* Search */}
                    <div className="employee-search-wrapper">
                        <span className="employee-search-icon">
                            <FiSearch size={16} />
                        </span>

                        <input
                            type="text"
                            placeholder="Search Employee ID..."
                            value={employeeSearchTerm}
                            onChange={(e) =>
                                setEmployeeSearchTerm(e.target.value)
                            }
                            className="employee-search-input"
                        />
                    </div>

                    {/* View Employees */}
                    {/* <button
                        className="primary-btn table-action-btn"
                        onClick={handleGetAllEmployees}
                        disabled={loadingEmployees}
                    >
                        {loadingEmployees ? (
                            <>
                                <span className="button-spinner" />
                                Loading...
                            </>
                        ) : (
                            "View Employees"
                        )}
                    </button> */}
                </div>
            </div>

            {/* Loading (first load only, so the table doesn't vanish on every search) */}
            {loadingEmployees && employees.length === 0 && <Loader />}

            {/* Employee Table */}
            {employees.length > 0 && (
                <>
                    <div
                        className="employee-table-wrapper"
                        style={{
                            opacity: loadingEmployees ? 0.6 : 1,
                            transition: "opacity .15s"
                        }}
                    >
                        <table className="employee-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Mobile</th>
                                    <th>Role</th>
                                    <th>Joining Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {employees.map((emp) => (
                                    <tr key={emp.id}>

                                        {/* ID */}
                                        <td>
                                            <button
                                                className="employee-id-btn"
                                                onClick={() =>
                                                    handleViewEmployee(emp)
                                                }
                                            >
                                                {emp.empId}
                                            </button>
                                        </td>

                                        {/* Name */}
                                        <td>
                                            <div className="employee-name-cell">
                                                <div className="employee-avatar">
                                                    {getInitials(emp)}
                                                </div>

                                                <div className="employee-name-info">
                                                    <strong>
                                                        {emp.firstName}{" "}
                                                        {emp.lastName}
                                                    </strong>

                                                    <span>
                                                        Employee
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td>{emp.email}</td>

                                        {/* Mobile */}
                                        <td>{emp.mobile}</td>

                                        {/* Role */}
                                        <td>{emp.role}</td>

                                        {/* Joining Date */}
                                        <td>
                                            {formatDate(emp.createdOn)}
                                        </td>

                                        {/* Status */}
                                        <td>
                                            <span
                                                className={getStatusClass(
                                                    emp.status
                                                )}
                                            >
                                                {toDisplayText(emp.status)}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td>
                                            <div className="action-buttons">

                                                <button
                                                    className="view-btn"
                                                    onClick={() =>
                                                        handleViewEmployee(emp)
                                                    }
                                                    title="View Employee"
                                                    aria-label="View Employee"
                                                >
                                                    <FiEye size={16} />
                                                </button>

                                                <button
                                                    className="edit-btn"
                                                    onClick={() =>
                                                        handleEditEmployee(emp)
                                                    }
                                                    title="Edit Employee"
                                                    aria-label="Edit Employee"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Pagination */}
                    <div className="employee-table-footer">
                        <span>
                            Showing{" "}
                            <strong>
                                {employees.length}
                            </strong>{" "}
                            of{" "}
                            <strong>
                                {employeeTotalElements}
                            </strong>{" "}
                            employees
                        </span>

                        <Pagination
                            currentPage={employeeCurrentPage}
                            totalPages={employeeTotalPages}
                            onPageChange={setEmployeeCurrentPage}
                        />
                    </div>
                </>
            )}

            {/* No Employees / No Search Results */}
            {!loadingEmployees && employees.length === 0 && (
                <p className="no-attendance">
                    {activeSearch
                        ? `No employees found for "${activeSearch}".`
                        : "No employees available."}
                </p>
            )}

        </div>
    );
}

export default EmployeeTable;