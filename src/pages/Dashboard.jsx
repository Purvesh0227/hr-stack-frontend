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

import { paginate } from "../utils/pagination";
import { filterBySearch } from "../utils/tableFilters";
import { toDisplayText } from "../utils/stringUtil";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Notification from "../components/Notification";

import AdminDashboard from "../components/dashboard/AdminDashboard";
import EmployeeDashboard from "../components/dashboard/EmployeeDashboard";

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

    // Employee Search
    const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");

    // Loading States
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [requestingDocuments, setRequestingDocuments] = useState(false);

    // Employee Pagination
    const [employeeCurrentPage, setEmployeeCurrentPage] = useState(1);

    // Notification
    const [notification, setNotification] = useState({
        message: "",
        type: "success"
    });

    // =========================================================
    // NOTIFICATION
    // =========================================================
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

            const response = await getAllEmployees(email);

            setEmployees(response.data);
        } catch (error) {
            console.error("Fetch employees error:", error);

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

            const response = await getAllAdmins(email);

            setAdmins(response.data);
        } catch (error) {
            console.error("Fetch admins error:", error);

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

            const response = await getAdminProfile(email);

            setAdminProfile(response.data);
        } catch (error) {
            console.error("Fetch admin profile error:", error);

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

        const refreshAdminProfile = async () => {
        try {
            const response = await getAdminProfile(email);

            setAdminProfile(response.data);

            return response.data;
        } catch (error) {
            console.error(
                "Refresh admin profile error:",
                error
            );

            throw error;
        }
    };
    // =========================================================
    // EMPLOYEE SEARCH + PAGINATION
    // =========================================================
    const filteredEmployees = filterBySearch(
        employees,
        employeeSearchTerm,
        "empId"
    );

    const employeeRecordsPerPage = 10;

    const {
        currentItems: paginatedEmployees,
        totalPages: employeeTotalPages
    } = paginate(
        filteredEmployees,
        employeeCurrentPage,
        employeeRecordsPerPage
    );

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
       const handleSaveOwnProfile = async (updatedDetails) => {
    try {
        // ================================
        // ADMIN PROFILE
        // ================================
        if (role === "ADMIN") {

            if (!adminProfile?.id) {
                throw new Error(
                    "Admin profile ID not available."
                );
            }

            await updateEmployee(
                adminProfile.id,
                {
                    firstName: updatedDetails.firstName,
                    lastName: updatedDetails.lastName,
                    mobile: updatedDetails.mobile
                }
            );

            const response =
                await getAdminProfile(email);

            const latestAdminProfile =
                response.data;

            setAdminProfile(
                latestAdminProfile
            );

            showNotification(
                "Changes applied successfully.",
                "success"
            );

            return latestAdminProfile;
        }

        // ================================
        // EMPLOYEE PROFILE
        // ================================

        await updateEmployee(
            employee.id,
            {
                firstName: updatedDetails.firstName,
                lastName: updatedDetails.lastName,
                mobile: updatedDetails.mobile
            }
        );

        const response =
            await getEmployeeById(employee.id);

        const latestEmployee =
            response.data;

        setEmployee(latestEmployee);

        localStorage.setItem(
            "employee",
            JSON.stringify(latestEmployee)
        );

        showNotification(
            "Changes applied successfully.",
            "success"
        );

        return latestEmployee;

    } catch (error) {

        console.error(
            "Update own profile error:",
            error
        );

        showNotification(
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            "Unable to update profile",
            "error"
        );

        throw error;
    }
};

    const handleSaveEmployee = async (updatedEmployee) => {
        try {
            if (!updatedEmployee?.id) {
                throw new Error("Employee ID not available.");
            }

            await updateEmployee(
                updatedEmployee.id,
                {
                    firstName: updatedEmployee.firstName,
                    lastName: updatedEmployee.lastName,
                    mobile: updatedEmployee.mobile
                }
            );

            await handleGetAllEmployees();

            const refreshedEmployee = await getEmployeeById(updatedEmployee.id);
            const latestEmployee = refreshedEmployee.data;

            if (selectedEmployee?.id === updatedEmployee.id) {
                setSelectedEmployee(latestEmployee);
            }

            showNotification(
                "Employee details updated successfully.",
                "success"
            );

            return latestEmployee;
        } catch (error) {
            console.error("Save employee error:", error);

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
            console.error("Activate employee error:", error);

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
    const handleRequestDocuments = async (uuid) => {
        try {
            setRequestingDocuments(true);

            await requestEmployeeDocuments(uuid);

            showNotification(
                "Document request sent successfully.",
                "success"
            );
        } catch (error) {
            console.error("Failed to request documents:", error);

            showNotification(
                error.response?.data?.error ||
                "Failed to request documents and send email.",
                "error"
            );
        } finally {
            setRequestingDocuments(false);
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
    // EMPLOYEE DATA REFRESH
    // =========================================================
    useEffect(() => {
        if (
            role !== "EMPLOYEE" ||
            !employee?.id
        ) {
            return;
        }

        const refreshEmployee = async () => {
            try {
                const response = await getEmployeeById(employee.id);

                const latestEmployee = response.data;

                // Update React state
                setEmployee(latestEmployee);

                // Update localStorage
                localStorage.setItem(
                    "employee",
                    JSON.stringify(latestEmployee)
                );
            } catch (error) {
                console.error("Unable to refresh employee data:", error);
            }
        };

        // Fetch immediately
        refreshEmployee();

        // Refresh every 60 seconds
        const interval = setInterval(refreshEmployee, 60000);

        return () => clearInterval(interval);
    }, [role, employee?.id]);

    // =========================================================
    // NORMALIZED EMPLOYEE STATUS
    // =========================================================
    const normalizedEmployeeStatus = employee?.status
        ?.replace(/[\s_]+/g, "_")
        .toUpperCase();

    // =========================================================
    // DASHBOARD
    // =========================================================
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
                ADMIN / EMPLOYEE DASHBOARD
            ================================================= */}
            {role === "ADMIN" ? (
                <AdminDashboard
                    role={role}
                    employee={employee}
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}

                    // Employee Data
                    employees={employees}
                    filteredEmployees={filteredEmployees}
                    paginatedEmployees={paginatedEmployees}
                    loadingEmployees={loadingEmployees}
                    employeeSearchTerm={employeeSearchTerm}
                    setEmployeeSearchTerm={setEmployeeSearchTerm}
                    employeeCurrentPage={employeeCurrentPage}
                    employeeTotalPages={employeeTotalPages}
                    setEmployeeCurrentPage={setEmployeeCurrentPage}

                    // Admin Data
                    admins={admins}
                    loadingAdmins={loadingAdmins}

                    handleSaveOwnProfile={handleSaveOwnProfile}

                    // Admin Profile
                    adminProfile={adminProfile}
                    loadingProfile={loadingProfile}
                    refreshAdminProfile={refreshAdminProfile}

                    // Add Admin Modal
                    showAddAdminModal={showAddAdminModal}
                    setShowAddAdminModal={setShowAddAdminModal}

                    // Employee Modal
                    showEmployeeModal={showEmployeeModal}
                    selectedEmployee={selectedEmployee}
                    employeeModalMode={employeeModalMode}

                    // API Handlers
                    handleGetAllEmployees={handleGetAllEmployees}
                    handleGetAllAdmins={handleGetAllAdmins}
                    handleViewEmployee={handleViewEmployee}
                    handleEditEmployee={handleEditEmployee}
                    handleCloseEmployeeModal={handleCloseEmployeeModal}
                    handleSaveEmployee={handleSaveEmployee}
                    handleActivateEmployee={handleActivateEmployee}
                    handleRequestDocuments={handleRequestDocuments}

                    // Utility
                    toDisplayText={toDisplayText}

                />
            ) : (
               <EmployeeDashboard
                    role={role}
                    employee={employee}
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                    normalizedEmployeeStatus={normalizedEmployeeStatus}
                    handleSaveOwnProfile={handleSaveOwnProfile}
                />
            )}

            <Footer />
        </>
    );
}

export default Dashboard;