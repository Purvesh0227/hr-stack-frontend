import AdminSidebar from "../AdminSidebar";
import Attendance from "../Attendance";
import Finance from "../Finance";
import EmployeeModal from "../EmployeeModal";
import EmployeeTable from "./EmployeeTable";
import AdminTable from "./AdminTable";
import Profile from "./Profile";
import AddAdminModal from "../AddAdminModal";
import Loader from "../Loader";

function AdminDashboard({
    role,
    employee,
    activeMenu,
    setActiveMenu,

    employees,
    filteredEmployees,
    paginatedEmployees,
    loadingEmployees,
    employeeSearchTerm,
    setEmployeeSearchTerm,
    employeeCurrentPage,
    employeeTotalPages,
    setEmployeeCurrentPage,

    admins,
    loadingAdmins,

    adminProfile,
    loadingProfile,

    showAddAdminModal,
    setShowAddAdminModal,

    showEmployeeModal,
    selectedEmployee,
    employeeModalMode,

    handleGetAllEmployees,
    handleGetAllAdmins,
    handleViewEmployee,
    handleEditEmployee,
    handleCloseEmployeeModal,
    handleSaveEmployee,
    handleActivateEmployee,
    handleRequestDocuments,

    toDisplayText
}) {
    return (
        <div className="dashboard-wrapper">
            <AdminSidebar
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                role={role}
            />

            <main className="dashboard-main">

                <div className="dashboard-header">
                    <div>
                        <h1>
                            Welcome, {employee?.firstName}
                        </h1>

                        <p>
                            Manage employees and administrators.
                        </p>
                    </div>
                </div>

                {/* EMPLOYEES */}

                {activeMenu === "dashboard" && (
                    <div className="content-card">

                        <EmployeeTable
                            employees={employees}
                            filteredEmployees={filteredEmployees}
                            paginatedEmployees={paginatedEmployees}
                            loadingEmployees={loadingEmployees}
                            employeeSearchTerm={employeeSearchTerm}
                            setEmployeeSearchTerm={
                                setEmployeeSearchTerm
                            }
                            employeeCurrentPage={
                                employeeCurrentPage
                            }
                            employeeTotalPages={
                                employeeTotalPages
                            }
                            setEmployeeCurrentPage={
                                setEmployeeCurrentPage
                            }
                            handleGetAllEmployees={
                                handleGetAllEmployees
                            }
                            handleViewEmployee={
                                handleViewEmployee
                            }
                            handleEditEmployee={
                                handleEditEmployee
                            }
                            toDisplayText={toDisplayText}
                        />

                    </div>
                )}

                {/* ADMINS */}

                {activeMenu === "admins" && (
                    <div className="content-card">

                        <div className="card-header">
                            <h2>Administrators</h2>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "10px"
                                }}
                            >
                                <button
                                    className="primary-btn"
                                    onClick={handleGetAllAdmins}
                                    disabled={loadingAdmins}
                                >
                                    View Admins
                                </button>

                                <button
                                    className="primary-btn"
                                    onClick={() =>
                                        setShowAddAdminModal(true)
                                    }
                                >
                                    Add Admin
                                </button>
                            </div>
                        </div>

                        {loadingAdmins && <Loader />}

                        <AdminTable
                            admins={admins}
                            loadingAdmins={loadingAdmins}
                        />

                        <AddAdminModal
                            isOpen={showAddAdminModal}
                            onClose={() =>
                                setShowAddAdminModal(false)
                            }
                            refreshAdmins={handleGetAllAdmins}
                        />

                    </div>
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
                        adminProfile={adminProfile}
                        loadingProfile={loadingProfile}
                    />
                )}

                {/* EMPLOYEE MODAL */}

                <EmployeeModal
                    isOpen={showEmployeeModal}
                    employee={selectedEmployee}
                    mode={employeeModalMode}
                    onClose={handleCloseEmployeeModal}
                    onSave={handleSaveEmployee}
                    onActivate={handleActivateEmployee}
                    onRequestDocuments={
                        handleRequestDocuments
                    }
                />

            </main>
        </div>
    );
}

export default AdminDashboard;