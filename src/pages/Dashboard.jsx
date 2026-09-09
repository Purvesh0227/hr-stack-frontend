import { useEffect, useState } from "react";
import {
    getAllEmployees,
    getAllAdmins,
    getAdminProfile,
    updateEmployee,
    activateEmployee,
    requestEmployeeDocuments,
    getEmployeeById
} from "../services/api";
import Navbar from "../components/Navbar";
import AdminSidebar from "../components/AdminSidebar";
import Footer from "../components/Footer";
import AddAdminModal from "../components/AddAdminModal";
import Attendance from "../components/Attendance";
import Finance from "../components/Finance";
import EmployeeModal from "../components/EmployeeModal";
import EmployeeDocumentUpload from "../components/EmployeeDocumentUpload";
function Dashboard() {
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");
    const [employee, setEmployee] = useState(
        JSON.parse(localStorage.getItem("employee"))
    );
    const [employees, setEmployees] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [adminProfile, setAdminProfile] = useState(null);
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [showAddAdminModal, setShowAddAdminModal] = useState(false);
    // Employee Modal
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeModalMode, setEmployeeModalMode] = useState("view");
    // =========================================================
    // ADMIN FUNCTIONS
    // =========================================================
    const handleGetAllEmployees = async () => {
        try {
            const response = await getAllEmployees(email);
            setEmployees(response.data);
        } catch (error) {
            alert(
                error.response?.data ||
                "Unable to fetch employees"
            );
        }
    };
    const handleGetAllAdmins = async () => {
        try {
            const response = await getAllAdmins(email);
            setAdmins(response.data);
        } catch (error) {
            alert(
                error.response?.data ||
                "Unable to fetch admins"
            );
        }
    };
    const handleGetAdminProfile = async () => {
        try {
            const response = await getAdminProfile(email);
            setAdminProfile(response.data);
        } catch (error) {
            alert(
                error.response?.data ||
                "Unable to fetch admin profile"
            );
        }
    };
    // =========================================================
    // EMPLOYEE VIEW
    // =========================================================
    const handleViewEmployee = (emp) => {
        setSelectedEmployee(emp);
        setEmployeeModalMode("view");
        setShowEmployeeModal(true);
    };
    // =========================================================
    // EMPLOYEE EDIT
    // =========================================================
    const handleEditEmployee = (emp) => {
        setSelectedEmployee(emp);
        setEmployeeModalMode("edit");
        setShowEmployeeModal(true);
    };
    // =========================================================
    // CLOSE EMPLOYEE MODAL
    // =========================================================
    const handleCloseEmployeeModal = () => {
        setShowEmployeeModal(false);
        setSelectedEmployee(null);
    };
    // =========================================================
    // SAVE EMPLOYEE
    // =========================================================
    const handleSaveEmployee = async (updatedEmployee) => {
        try {
            await updateEmployee(
                updatedEmployee.id,
                {
                    firstName: updatedEmployee.firstName,
                    lastName: updatedEmployee.lastName,
                    mobile: updatedEmployee.mobile
                }
            );
            alert("Employee updated successfully");
            setShowEmployeeModal(false);
            setSelectedEmployee(null);
            // Refresh employee table
            await handleGetAllEmployees();
        } catch (error) {
            console.error(
                "Update employee error:",
                error
            );
            alert(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Unable to update employee"
            );
        }
    };
    // =========================================================
    // ACTIVATE EMPLOYEE
    // =========================================================
    const handleActivateEmployee = async (emp) => {
        const confirmed = window.confirm(
            `Are you sure you want to activate ${emp.firstName} ${emp.lastName}?`
        );
        if (!confirmed) {
            return;
        }
        try {
            await activateEmployee(emp.id);
            alert("Employee activated successfully");
            setShowEmployeeModal(false);
            setSelectedEmployee(null);
            // Refresh employee list
            await handleGetAllEmployees();
        } catch (error) {
            console.error(
                "Activate employee error:",
                error
            );
            alert(
                error.response?.data?.message ||
                error.response?.data ||
                "Unable to activate employee"
            );
        }
    };
    // =========================================================
    // REQUEST EMPLOYEE DOCUMENTS
    // =========================================================
    const handleRequestDocuments = async (emp) => {
        const confirmed = window.confirm(
            `Request documents from ${emp.firstName} ${emp.lastName}?`
        );
        if (!confirmed) {
            return;
        }
        try {
            await requestEmployeeDocuments(emp.id);
            alert("Document request sent successfully");
            setShowEmployeeModal(false);
            setSelectedEmployee(null);
            // Refresh employee list
            await handleGetAllEmployees();
        } catch (error) {
            console.error(
                "Request documents error:",
                error
            );
            alert(
                error.response?.data?.message ||
                error.response?.data ||
                "Unable to request documents"
            );
        }
    };
    // =========================================================
    // ADMIN PROFILE
    // =========================================================
    useEffect(() => {
        if (role === "ADMIN") {
            handleGetAdminProfile();
        }
    }, [email, role]);
    // =========================================================
    // EMPLOYEE STATUS AUTO REFRESH
    // =========================================================
    //
    // Admin can request documents while employee is already
    // logged in. This refreshes the employee data every 5 sec
    // so PENDING -> PENDING_VERIFICATION appears automatically.
    //
    // =========================================================
    useEffect(() => {
        if (role !== "EMPLOYEE" || !employee?.id) {
            return;
        }
        const refreshEmployee = async () => {
            try {
                const response =
                    await getEmployeeById(employee.id);
                const latestEmployee = response.data;
                // Update React state
                setEmployee(latestEmployee);
                // Update localStorage
                localStorage.setItem(
                    "employee",
                    JSON.stringify(latestEmployee)
                );
            } catch (error) {
                console.error(
                    "Unable to refresh employee data:",
                    error
                );
            }
        };
        // Fetch immediately
        refreshEmployee();
        // Then refresh every 5 seconds
        const interval = setInterval(
            refreshEmployee,
            5000
        );
        // Cleanup interval
        return () => clearInterval(interval);
    }, [role]);
    // =========================================================
    // NORMALIZED EMPLOYEE STATUS
    // =========================================================
    const normalizedEmployeeStatus =
        employee?.status
            ?.replace(/[\s_]+/g, "_")
            .toUpperCase();
    return (
        <>
            <Navbar />
            {/* =================================================
                ADMIN DASHBOARD
            ================================================= */}
            {role === "ADMIN" ? (
                <div className="dashboard-wrapper">
                    <AdminSidebar
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                        role={role}
                    />
                    <main className="dashboard-main">
                        {/* ADMIN HEADER */}
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
                        {/* =================================================
                            EMPLOYEES
                        ================================================= */}
                        {activeMenu === "dashboard" && (
                            <div className="content-card">
                                <div className="card-header">
                                    <h2>
                                        Employees
                                    </h2>
                                    <button
                                        className="primary-btn"
                                        onClick={handleGetAllEmployees}
                                    >
                                        View Employees
                                    </button>
                                </div>
                                {employees.length > 0 && (
                                    <table className="employee-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Mobile</th>
                                                <th>Role</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {employees.map(emp => (
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
                                                        {emp.firstName}{" "}
                                                        {emp.lastName}
                                                    </td>
                                                    <td>
                                                        {emp.email}
                                                    </td>
                                                    <td>
                                                        {emp.mobile}
                                                    </td>
                                                    <td>
                                                        {emp.role}
                                                    </td>
                                                    <td className="action-buttons">
                                                        {/* VIEW */}
                                                        <button
                                                            className="view-btn"
                                                            onClick={() =>
                                                                handleViewEmployee(emp)
                                                            }
                                                            title="View Employee"
                                                        >
                                                            👁️
                                                        </button>
                                                        {/* EDIT */}
                                                        <button
                                                            className="edit-btn"
                                                            onClick={() =>
                                                                handleEditEmployee(emp)
                                                            }
                                                            title="Edit Employee"
                                                        >
                                                            ✏️
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                        {/* =================================================
                            ADMINS
                        ================================================= */}
                        {activeMenu === "admins" && (
                            <div className="content-card">
                                <div className="card-header">
                                    <h2>
                                        Administrators
                                    </h2>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "10px"
                                        }}
                                    >
                                        {/* VIEW ADMINS */}
                                        <button
                                            className="primary-btn"
                                            onClick={handleGetAllAdmins}
                                        >
                                            View Admins
                                        </button>
                                        {/* ADD ADMIN */}
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
                                {admins.length > 0 && (
                                    <table className="employee-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Mobile</th>
                                                <th>Role</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {admins.map(admin => (
                                                <tr key={admin.id}>
                                                    <td>
                                                        {admin.empId}
                                                    </td>
                                                    <td>
                                                        {admin.firstName}{" "}
                                                        {admin.lastName}
                                                    </td>
                                                    <td>
                                                        {admin.email}
                                                    </td>
                                                    <td>
                                                        {admin.mobile}
                                                    </td>
                                                    <td>
                                                        {admin.role}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                                <AddAdminModal
                                    isOpen={showAddAdminModal}
                                    onClose={() =>
                                        setShowAddAdminModal(false)
                                    }
                                    refreshAdmins={
                                        handleGetAllAdmins
                                    }
                                />
                            </div>
                        )}
                        {/* =================================================
                            ATTENDANCE
                        ================================================= */}
                        {activeMenu === "attendance" && (
                            <Attendance role={role} />
                        )}
                        {/* =================================================
                            FINANCE
                        ================================================= */}
                        {activeMenu === "finance" && (
                            <Finance role={role} />
                        )}
                        {/* =================================================
                            ADMIN SETTINGS
                        ================================================= */}
                        {activeMenu === "settings" && (
                            <div className="content-card">
                                <h2>
                                    My Profile
                                </h2>
                                {adminProfile && (
                                    <div className="profile-details">
                                        <p>
                                            <strong>
                                                First Name :
                                            </strong>{" "}
                                            {adminProfile.firstName}
                                        </p>
                                        <p>
                                            <strong>
                                                Last Name :
                                            </strong>{" "}
                                            {adminProfile.lastName}
                                        </p>
                                        <p>
                                            <strong>
                                                Email :
                                            </strong>{" "}
                                            {adminProfile.email}
                                        </p>
                                        <p>
                                            <strong>
                                                Role :
                                            </strong>{" "}
                                            {adminProfile.role}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* =================================================
                            EMPLOYEE VIEW / EDIT MODAL
                        ================================================= */}
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
            ) : (
                /* =========================================================
                   EMPLOYEE DASHBOARD
                ========================================================= */
                <div className="dashboard-wrapper">
                    <AdminSidebar
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                        role={role}
                    />
                    <main className="dashboard-main">
                        {/* =================================================
                            HOME
                        ================================================= */}
                        {activeMenu === "dashboard" && (
                            <>
                                <div className="dashboard-header">
                                    <div>
                                        <h1>
                                            Welcome,{" "}
                                            {employee?.firstName}
                                        </h1>
                                        <p>
                                            Welcome to your employee dashboard.
                                        </p>
                                    </div>
                                </div>
                                {/* HOME CARD */}
                                <div className="content-card">
                                    <h2>
                                        Home
                                    </h2>
                                    <p>
                                        Welcome to HR-Stack Employee Dashboard.
                                    </p>
                                </div>
                                {/* =================================================
                                    DOCUMENT VERIFICATION BANNER
                                ================================================= */}
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
                                {/* =================================================
                                    DOCUMENT UPLOAD
                                ================================================= */}
                                {normalizedEmployeeStatus ===
                                    "PENDING_VERIFICATION" && (
                                    <EmployeeDocumentUpload
                                        employee={employee}
                                    />
                                )}
                            </>
                        )}
                        {/* =================================================
                            ATTENDANCE
                        ================================================= */}
                        {activeMenu === "attendance" && (
                            <Attendance role={role} />
                        )}
                        {/* =================================================
                            FINANCE
                        ================================================= */}
                        {activeMenu === "finance" && (
                            <Finance role={role} />
                        )}
                        {/* =================================================
                            EMPLOYEE SETTINGS
                        ================================================= */}
                        {activeMenu === "settings" && (
                            <div className="content-card">
                                <h2>
                                    My Profile
                                </h2>
                                <div className="profile-details">
                                    <p>
                                        <strong>
                                            Employee ID :
                                        </strong>{" "}
                                        {employee?.id}
                                    </p>
                                    <p>
                                        <strong>
                                            First Name :
                                        </strong>{" "}
                                        {employee?.firstName}
                                    </p>
                                    <p>
                                        <strong>
                                            Last Name :
                                        </strong>{" "}
                                        {employee?.lastName}
                                    </p>
                                    <p>
                                        <strong>
                                            Email :
                                        </strong>{" "}
                                        {employee?.email}
                                    </p>
                                    <p>
                                        <strong>
                                            Mobile :
                                        </strong>{" "}
                                        {employee?.mobile}
                                    </p>
                                    <p>
                                        <strong>
                                            Role :
                                        </strong>{" "}
                                        {employee?.role}
                                    </p>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            )}
            <Footer />
        </>
    );
}
export default Dashboard;