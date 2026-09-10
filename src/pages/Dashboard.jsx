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
import Loader from "../components/Loader";
import Notification from "../components/Notification";

import { toDisplayText } from "../utils/stringUtil";


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

    const [showAddAdminModal, setShowAddAdminModal] =
        useState(false);

    // Employee Modal
    const [showEmployeeModal, setShowEmployeeModal] =
        useState(false);

    const [selectedEmployee, setSelectedEmployee] =
        useState(null);

    const [employeeModalMode, setEmployeeModalMode] =
        useState("view");

    // =========================================================
    // LOADING STATES
    // =========================================================

    const [loadingEmployees, setLoadingEmployees] =
        useState(false);

    const [loadingAdmins, setLoadingAdmins] =
        useState(false);

    const [loadingProfile, setLoadingProfile] =
        useState(false);

    // =========================================================
    // NOTIFICATION
    // =========================================================

    const [notification, setNotification] = useState({
        message: "",
        type: "success"
    });

    const showNotification = (message, type = "success") => {

        setNotification({
            message,
            type
        });

    };

    const closeNotification = () => {

        setNotification({
            message: "",
            type: "success"
        });

    };

    // Automatically hide notification
    useEffect(() => {

        if (!notification.message) {
            return;
        }

        const timer = setTimeout(() => {
            closeNotification();
        }, 4000);

        return () => clearTimeout(timer);

    }, [notification.message]);

    // =========================================================
    // ADMIN FUNCTIONS
    // =========================================================

    const handleGetAllEmployees = async () => {

        try {

            setLoadingEmployees(true);

            const response =
                await getAllEmployees(email);

            setEmployees(response.data);

        } catch (error) {

            console.error(
                "Fetch employees error:",
                error
            );

            showNotification(
                error.response?.data?.message ||
                error.response?.data ||
                "Unable to fetch employees",
                "error"
            );

        } finally {

            setLoadingEmployees(false);

        }
    };


    const handleGetAllAdmins = async () => {

        try {

            setLoadingAdmins(true);

            const response =
                await getAllAdmins(email);

            setAdmins(response.data);

        } catch (error) {

            console.error(
                "Fetch admins error:",
                error
            );

            showNotification(
                error.response?.data?.message ||
                error.response?.data ||
                "Unable to fetch admins",
                "error"
            );

        } finally {

            setLoadingAdmins(false);

        }
    };


    const handleGetAdminProfile = async () => {

        try {

            setLoadingProfile(true);

            const response =
                await getAdminProfile(email);

            setAdminProfile(response.data);

        } catch (error) {

            console.error(
                "Fetch admin profile error:",
                error
            );

            showNotification(
                error.response?.data?.message ||
                error.response?.data ||
                "Unable to fetch admin profile",
                "error"
            );

        } finally {

            setLoadingProfile(false);

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
                    firstName:
                        updatedEmployee.firstName,

                    lastName:
                        updatedEmployee.lastName,

                    mobile:
                        updatedEmployee.mobile
                }
            );

            showNotification(
                "Employee updated successfully",
                "success"
            );

            setShowEmployeeModal(false);

            setSelectedEmployee(null);

            await handleGetAllEmployees();

        } catch (error) {

            console.error(
                "Update employee error:",
                error
            );

            showNotification(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Unable to update employee",
                "error"
            );

            throw error;
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

            showNotification(
                "Employee activated successfully",
                "success"
            );

            setShowEmployeeModal(false);

            setSelectedEmployee(null);

            await handleGetAllEmployees();

        } catch (error) {

            console.error(
                "Activate employee error:",
                error
            );

            showNotification(
                error.response?.data?.message ||
                error.response?.data ||
                "Unable to activate employee",
                "error"
            );

            throw error;
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

            showNotification(
                "Document request sent successfully",
                "success"
            );

            setShowEmployeeModal(false);

            setSelectedEmployee(null);

            await handleGetAllEmployees();

        } catch (error) {

            console.error(
                "Request documents error:",
                error
            );

            showNotification(
                error.response?.data?.message ||
                error.response?.data ||
                "Unable to request documents",
                "error"
            );

            throw error;
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

    /*
     * Admin can request documents while the employee
     * is already logged in.
     *
     * This refreshes employee data every 5 seconds
     * so PENDING -> PENDING_VERIFICATION appears
     * automatically.
     */

    useEffect(() => {

        if (
            role !== "EMPLOYEE" ||
            !employee?.id
        ) {
            return;
        }

        const refreshEmployee = async () => {

            try {

                const response =
                    await getEmployeeById(
                        employee.id
                    );

                const latestEmployee =
                    response.data;

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

        // Refresh every 5 seconds
        const interval =
            setInterval(
                refreshEmployee,
                5000
            );

        return () =>
            clearInterval(interval);

    }, [role, employee?.id]);


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
                NOTIFICATION
            ================================================= */}

            <Notification
                message={notification.message}
                type={notification.type}
                onClose={closeNotification}
            />


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

                        {/* =================================================
                            ADMIN HEADER
                        ================================================= */}

                        <div className="dashboard-header">

                            <div>

                                <h1>
                                    Welcome,{" "}
                                    {employee?.firstName}
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
                                        onClick={
                                            handleGetAllEmployees
                                        }
                                        disabled={
                                            loadingEmployees
                                        }
                                    >
                                        View Employees
                                    </button>

                                </div>


                                {/* Employee Loader */}

                                {loadingEmployees && (
                                    <Loader />
                                )}


                                {/* Employee Table */}

                                {!loadingEmployees &&
                                    employees.length > 0 && (

                                        <table className="employee-table">

                                            <thead>

                                                <tr>

                                                    <th>
                                                        ID
                                                    </th>

                                                    <th>
                                                        Name
                                                    </th>

                                                    <th>
                                                        Email
                                                    </th>

                                                    <th>
                                                        Mobile
                                                    </th>

                                                    <th>
                                                        Role
                                                    </th>

                                                    <th>
                                                        Status
                                                    </th>

                                                    <th>
                                                        Action
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {employees.map(
                                                    (emp) => (

                                                        <tr
                                                            key={
                                                                emp.id
                                                            }
                                                        >

                                                            <td>

                                                                <button
                                                                    className="employee-id-btn"
                                                                    onClick={() =>
                                                                        handleViewEmployee(
                                                                            emp
                                                                        )
                                                                    }
                                                                >
                                                                    {
                                                                        emp.empId
                                                                    }
                                                                </button>

                                                            </td>


                                                            <td>

                                                                {
                                                                    emp.firstName
                                                                }{" "}
                                                                {
                                                                    emp.lastName
                                                                }

                                                            </td>


                                                            <td>
                                                                {
                                                                    emp.email
                                                                }
                                                            </td>


                                                            <td>
                                                                {
                                                                    emp.mobile
                                                                }
                                                            </td>


                                                            <td>
                                                                {
                                                                    emp.role
                                                                }
                                                            </td>


                                                            {/* STATUS */}

                                                            <td>

                                                                <span
                                                                    className={`status-badge status-${emp.status
                                                                        ?.toLowerCase()
                                                                        .replace(
                                                                            /_/g,
                                                                            "-"
                                                                        )}`}
                                                                >

                                                                    {
                                                                        toDisplayText(
                                                                            emp.status
                                                                        )
                                                                    }

                                                                </span>

                                                            </td>


                                                            {/* ACTIONS */}

                                                            <td className="action-buttons">

                                                                {/* VIEW */}

                                                                <button
                                                                    className="view-btn"
                                                                    onClick={() =>
                                                                        handleViewEmployee(
                                                                            emp
                                                                        )
                                                                    }
                                                                    title="View Employee"
                                                                >
                                                                    👁️
                                                                </button>


                                                                {/* EDIT */}

                                                                <button
                                                                    className="edit-btn"
                                                                    onClick={() =>
                                                                        handleEditEmployee(
                                                                            emp
                                                                        )
                                                                    }
                                                                    title="Edit Employee"
                                                                >
                                                                    ✏️
                                                                </button>

                                                            </td>

                                                        </tr>

                                                    )
                                                )}

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
                                            onClick={
                                                handleGetAllAdmins
                                            }
                                            disabled={
                                                loadingAdmins
                                            }
                                        >
                                            View Admins
                                        </button>


                                        {/* ADD ADMIN */}

                                        <button
                                            className="primary-btn"
                                            onClick={() =>
                                                setShowAddAdminModal(
                                                    true
                                                )
                                            }
                                        >
                                            Add Admin
                                        </button>

                                    </div>

                                </div>


                                {/* Admin Loader */}

                                {loadingAdmins && (
                                    <Loader />
                                )}


                                {/* Admin Table */}

                                {!loadingAdmins &&
                                    admins.length > 0 && (

                                        <table className="employee-table">

                                            <thead>

                                                <tr>

                                                    <th>
                                                        ID
                                                    </th>

                                                    <th>
                                                        Name
                                                    </th>

                                                    <th>
                                                        Email
                                                    </th>

                                                    <th>
                                                        Mobile
                                                    </th>

                                                    <th>
                                                        Role
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {admins.map(
                                                    (admin) => (

                                                        <tr
                                                            key={
                                                                admin.id
                                                            }
                                                        >

                                                            <td>
                                                                {
                                                                    admin.empId
                                                                }
                                                            </td>


                                                            <td>

                                                                {
                                                                    admin.firstName
                                                                }{" "}
                                                                {
                                                                    admin.lastName
                                                                }

                                                            </td>


                                                            <td>
                                                                {
                                                                    admin.email
                                                                }
                                                            </td>


                                                            <td>
                                                                {
                                                                    admin.mobile
                                                                }
                                                            </td>


                                                            <td>
                                                                {
                                                                    admin.role
                                                                }
                                                            </td>

                                                        </tr>

                                                    )
                                                )}

                                            </tbody>

                                        </table>

                                    )}


                                <AddAdminModal

                                    isOpen={
                                        showAddAdminModal
                                    }

                                    onClose={() =>
                                        setShowAddAdminModal(
                                            false
                                        )
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

                            <Attendance
                                role={role}
                            />

                        )}


                        {/* =================================================
                            FINANCE
                        ================================================= */}

                        {activeMenu === "finance" && (

                            <Finance
                                role={role}
                            />

                        )}


                        {/* =================================================
                            ADMIN SETTINGS
                        ================================================= */}

                        {activeMenu === "settings" && (

                            <div className="content-card">

                                <h2>
                                    My Profile
                                </h2>


                                {loadingProfile ? (

                                    <Loader />

                                ) : adminProfile && (

                                    <div className="profile-details">

                                        <p>

                                            <strong>
                                                First Name :
                                            </strong>{" "}

                                            {
                                                adminProfile.firstName
                                            }

                                        </p>


                                        <p>

                                            <strong>
                                                Last Name :
                                            </strong>{" "}

                                            {
                                                adminProfile.lastName
                                            }

                                        </p>


                                        <p>

                                            <strong>
                                                Email :
                                            </strong>{" "}

                                            {
                                                adminProfile.email
                                            }

                                        </p>


                                        <p>

                                            <strong>
                                                Role :
                                            </strong>{" "}

                                            {
                                                adminProfile.role
                                            }

                                        </p>

                                    </div>

                                )}

                            </div>

                        )}


                        {/* =================================================
                            EMPLOYEE VIEW / EDIT MODAL
                        ================================================= */}

                        <EmployeeModal

                            isOpen={
                                showEmployeeModal
                            }

                            employee={
                                selectedEmployee
                            }

                            mode={
                                employeeModalMode
                            }

                            onClose={
                                handleCloseEmployeeModal
                            }

                            onSave={
                                handleSaveEmployee
                            }

                            onActivate={
                                handleActivateEmployee
                            }

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
                                        employee={
                                            employee
                                        }
                                    />

                                )}

                            </>

                        )}


                        {/* =================================================
                            ATTENDANCE
                        ================================================= */}

                        {activeMenu === "attendance" && (

                            <Attendance
                                role={role}
                            />

                        )}


                        {/* =================================================
                            FINANCE
                        ================================================= */}

                        {activeMenu === "finance" && (

                            <Finance
                                role={role}
                            />

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

                                        {
                                            employee?.id
                                        }

                                    </p>


                                    <p>

                                        <strong>
                                            First Name :
                                        </strong>{" "}

                                        {
                                            employee?.firstName
                                        }

                                    </p>


                                    <p>

                                        <strong>
                                            Last Name :
                                        </strong>{" "}

                                        {
                                            employee?.lastName
                                        }

                                    </p>


                                    <p>

                                        <strong>
                                            Email :
                                        </strong>{" "}

                                        {
                                            employee?.email
                                        }

                                    </p>


                                    <p>

                                        <strong>
                                            Mobile :
                                        </strong>{" "}

                                        {
                                            employee?.mobile
                                        }

                                    </p>


                                    <p>

                                        <strong>
                                            Role :
                                        </strong>{" "}

                                        {
                                            employee?.role
                                        }

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