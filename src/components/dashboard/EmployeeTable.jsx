import Loader from "../Loader";
import Pagination from "../Pagination";
import { FiEdit2, FiEye } from "react-icons/fi";

function EmployeeTable({
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
    toDisplayText
}) {
    return (
        <>
            <div className="card-header">
                <h2>Employees</h2>

                <div className="employee-table-actions">
                    <button
                        className="primary-btn"
                        onClick={handleGetAllEmployees}
                        disabled={loadingEmployees}
                    >
                        View Employees
                    </button>

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
            </div>

            {loadingEmployees && <Loader />}

            {!loadingEmployees &&
                filteredEmployees.length > 0 && (
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Mobile</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedEmployees.map((emp) => (
                                <tr key={emp.id}>
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

                                    <td>
                                        {emp.firstName} {emp.lastName}
                                    </td>

                                    <td>{emp.email}</td>

                                    <td>{emp.mobile}</td>

                                    <td>{emp.role}</td>

                                    <td>
                                        <span
                                            className={`status-badge status-${emp.status
                                                ?.toLowerCase()
                                                .replace(/_/g, "-")}`}
                                        >
                                            {toDisplayText(emp.status)}
                                        </span>
                                    </td>

                                    <td className="action-buttons">
                                        <button
                                            className="view-btn"
                                            onClick={() =>
                                                handleViewEmployee(emp)
                                            }
                                            title="View Employee"
                                        >
                                            <FiEye size={16} />
                                        </button>

                                        <button
                                            className="edit-btn"
                                            onClick={() =>
                                                handleEditEmployee(emp)
                                            }
                                            title="Edit Employee"
                                        >
                                            <FiEdit2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

            <Pagination
                currentPage={employeeCurrentPage}
                totalPages={employeeTotalPages}
                onPageChange={setEmployeeCurrentPage}
            />

            {!loadingEmployees &&
                employees.length > 0 &&
                filteredEmployees.length === 0 && (
                    <p className="no-attendance">
                        No employees found.
                    </p>
                )}
        </>
    );
}

export default EmployeeTable;