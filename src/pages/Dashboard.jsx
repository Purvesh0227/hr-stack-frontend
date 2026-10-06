import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import {
    getAllEmployees,
    getAdminProfile,
    updateEmployee,
    activateEmployee,
    requestEmployeeDocuments,
    getEmployeeById,
    isRequestCancelled
} from "../services/api";
import useDebounce from "../hooks/useDebounce";
import { toDisplayText } from "../utils/stringUtil";
import { readStorageItem, readStorageJson } from "../utils/storage";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Notification from "../components/Notification";
import AdminSidebar from "../components/AdminSidebar";
import { dateToMillis, dateToEndMillis } from "../utils/dateUtils";

// Backend can send {error}, {message}, a plain string or a field map.
// Always return a string so the toast never receives an object.
const getErrorMessage = (error, fallback) => {
    const data = error.response?.data;

    return (
        data?.error ||
        data?.message ||
        (typeof data === "string" ? data : null) ||
        fallback
    );
};

function Dashboard() {
    const role = readStorageItem("role");
    const email = readStorageItem("email");

    const [employee, setEmployee] = useState(() => readStorageJson("employee"));
    const [employees, setEmployees] = useState([]);
    
    const [adminProfile, setAdminProfile] = useState(null);

    // Employee modal
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeModalMode, setEmployeeModalMode] = useState("view");

    // Employee filters
    const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
    const [employeeStatusFilter, setEmployeeStatusFilter] = useState("");
    const [employeeFromDate, setEmployeeFromDate] = useState("");
    const [employeeToDate, setEmployeeToDate] = useState("");

    const [employeePageSize, setEmployeePageSize] = useState(10);

    // Trimmed, so "abc" and "abc " don't cause two requests
    const debouncedEmployeeSearchTerm = useDebounce(
        employeeSearchTerm.trim(),
        400
    );

    // Loading states
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [requestingDocuments, setRequestingDocuments] = useState(false);

    // Employee pagination
    const [employeeCurrentPage, setEmployeeCurrentPage] = useState(1);
    const [employeeTotalPages, setEmployeeTotalPages] = useState(0);
    const [employeeTotalElements, setEmployeeTotalElements] = useState(0); // matches for current filters
    const [totalEmployees, setTotalEmployees] = useState(0);               // unfiltered total (page header)
    const [employeeRefreshKey, setEmployeeRefreshKey] = useState(0);

    // One key for every employee filter. Any change -> back to page 1.
    // Done during render (not in a second effect) to avoid a wasted request
    // for the old page number.
    const employeeFilterKey = [
        debouncedEmployeeSearchTerm,
        employeeStatusFilter,
        employeeFromDate,
        employeeToDate,
        employeePageSize
    ].join("|");

    const [lastEmployeeFilterKey, setLastEmployeeFilterKey] =
        useState(employeeFilterKey);

    if (lastEmployeeFilterKey !== employeeFilterKey) {
        setLastEmployeeFilterKey(employeeFilterKey);
        setEmployeeCurrentPage(1);
    }

    // Values sent to the API (null when the date is empty)
    const employeeFromMillis = dateToMillis(employeeFromDate);
    const employeeToMillis = dateToEndMillis(employeeToDate);

    // "YYYY-MM-DD" strings compare correctly as text
    const employeeRangeInvalid =
        Boolean(employeeFromDate && employeeToDate) &&
        employeeFromDate > employeeToDate;

    const hasEmployeeFilters = Boolean(
        debouncedEmployeeSearchTerm ||
        employeeStatusFilter ||
        employeeFromDate ||
        employeeToDate
    );

    const handleClearEmployeeFilters = () => {
        setEmployeeSearchTerm("");
        setEmployeeStatusFilter("");
        setEmployeeFromDate("");
        setEmployeeToDate("");
    };

    // Notification
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

    useEffect(() => {
        if (!notification.message) {
            return;
        }

        const timer = setTimeout(() => {
            closeNotification();
        }, 4000);

        return () => clearTimeout(timer);
    }, [notification.message]);

    // Refresh the employee list (used after save / activate).
    // It only re-runs the fetch effect below.
    const handleGetAllEmployees = () => {
        setEmployeeRefreshKey((key) => key + 1);
    };

    // Admin employee list: debounced search + filters + pagination
    useEffect(() => {
        // Not an admin, or start date is after end date -> do not call the API
        if (role !== "ADMIN") {
            return;
        }

        if (employeeRangeInvalid) {
            setLoadingEmployees(false);   // otherwise the loader can stay stuck
            return;
        }

        const controller = new AbortController();

        const loadEmployees = async () => {
            try {
                setLoadingEmployees(true);

                const { data } = await getAllEmployees({
                    search: debouncedEmployeeSearchTerm,
                    status: employeeStatusFilter,
                    from: employeeFromMillis,
                    to: employeeToMillis,
                    page: employeeCurrentPage - 1,
                    size: employeePageSize,
                    signal: controller.signal
                });

                // Current page no longer exists (e.g. last row removed)
                if (
                    data.totalPages > 0 &&
                    employeeCurrentPage > data.totalPages
                ) {
                    setEmployeeCurrentPage(data.totalPages);
                    return;
                }

                setEmployees(data.content);
                setEmployeeTotalElements(data.totalElements);
                setEmployeeTotalPages(data.totalPages);

                // Unfiltered total is only known when nothing is filtered
                if (!hasEmployeeFilters) {
                    setTotalEmployees(data.totalElements);
                }
            } catch (error) {
                // Request was superseded by a newer one
                if (isRequestCancelled(error)) {
                    return;
                }

                console.error("Fetch employees error:", error);

                showNotification(
                    getErrorMessage(error, "Unable to fetch employees"),
                    "error"
                );
            } finally {
                if (!controller.signal.aborted) {
                    setLoadingEmployees(false);
                }
            }
        };

        loadEmployees();

        // Cancels the stale request on every change / unmount
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        role,
        debouncedEmployeeSearchTerm,
        employeeStatusFilter,
        employeeFromMillis,
        employeeToMillis,
        employeeRangeInvalid,
        employeePageSize,
        employeeCurrentPage,
        employeeRefreshKey
    ]);



    // Admin profile
    const handleGetAdminProfile = async () => {
        try {
            setLoadingProfile(true);

            const response = await getAdminProfile(email);

            setAdminProfile(response.data);
        } catch (error) {
            console.error("Fetch admin profile error:", error);

            showNotification(
                getErrorMessage(error, "Unable to fetch admin profile"),
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
            console.error("Refresh admin profile error:", error);
            throw error;
        }
    };


    // View employee
    const handleViewEmployee = async (emp) => {
        try {
            const response = await getEmployeeById(emp.id);

            setSelectedEmployee(response.data);
            setEmployeeModalMode("view");
            setShowEmployeeModal(true);
        } catch (error) {
            console.error("Unable to load employee details:", error);

            showNotification(
                getErrorMessage(error, "Unable to load employee details"),
                "error"
            );
        }
    };

    // Edit employee
    const handleEditEmployee = async (emp) => {
        try {
            const response = await getEmployeeById(emp.id);

            setSelectedEmployee(response.data);
            setEmployeeModalMode("edit");
            setShowEmployeeModal(true);
        } catch (error) {
            console.error("Unable to load employee details:", error);

            showNotification(
                getErrorMessage(error, "Unable to load employee details"),
                "error"
            );
        }
    };

    const handleCloseEmployeeModal = () => {
        setShowEmployeeModal(false);
        setSelectedEmployee(null);
    };

    // Save own profile
    const handleSaveOwnProfile = async (updatedDetails) => {
        try {
            if (role === "ADMIN") {
                if (!adminProfile?.id) {
                    throw new Error("Admin profile ID not available.");
                }

                await updateEmployee(
                    adminProfile.id,
                    {
                        firstName: updatedDetails.firstName,
                        lastName: updatedDetails.lastName,
                        mobile: updatedDetails.mobile
                    }
                );

                const response = await getAdminProfile(email);
                const latestAdminProfile = response.data;

                setAdminProfile(latestAdminProfile);

                showNotification(
                    "Changes applied successfully.",
                    "success"
                );

                return latestAdminProfile;
            }

            await updateEmployee(
                employee.id,
                {
                    firstName: updatedDetails.firstName,
                    lastName: updatedDetails.lastName,
                    mobile: updatedDetails.mobile
                }
            );

            const response = await getEmployeeById(employee.id);
            const latestEmployee = response.data;

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
            console.error("Update own profile error:", error);

            showNotification(
                getErrorMessage(
                    error,
                    error.message || "Unable to update profile"
                ),
                "error"
            );

            throw error;
        }
    };

    // Save employee
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

            const refreshedEmployee = await getEmployeeById(
                updatedEmployee.id
            );

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
                getErrorMessage(error, "Unable to update employee"),
                "error"
            );

            throw error;
        }
    };

    // Activate employee
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
                getErrorMessage(error, "Unable to activate employee"),
                "error"
            );

            throw error;
        }
    };

    // Request employee documents
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
                getErrorMessage(
                    error,
                    "Failed to request documents and send email."
                ),
                "error"
            );
        } finally {
            setRequestingDocuments(false);
        }
    };

    // Load admin profile
    useEffect(() => {
        if (role === "ADMIN") {
            handleGetAdminProfile();
        }
    }, [email, role]);

    // Refresh employee data periodically
    useEffect(() => {
        if (role !== "EMPLOYEE" || !employee?.id) {
            return;
        }

        const refreshEmployee = async () => {
            try {
                const response = await getEmployeeById(employee.id);
                const latestEmployee = response.data;

                setEmployee(latestEmployee);

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

        refreshEmployee();

        const TWELVE_HOURS = 12 * 60 * 60 * 1000;

        const interval = setInterval(refreshEmployee, TWELVE_HOURS);

        return () => clearInterval(interval);
    }, [role, employee?.id]);

    const normalizedEmployeeStatus = employee?.status
        ?.replace(/[\s_]+/g, "_")
        .toUpperCase();

    const outletContext = {
        role,
        email,
        employee,
        employees,
        employeeTotalElements,
        totalEmployees,
        debouncedEmployeeSearchTerm,
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

        adminProfile,
        loadingProfile,
        requestingDocuments,
        normalizedEmployeeStatus,
        handleSaveOwnProfile,
        refreshAdminProfile,
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
        showNotification,
        toDisplayText
    };

    return (
        <>
            <Navbar />

            <Notification
                message={notification.message}
                type={notification.type}
                onClose={closeNotification}
            />

            <div className="dashboard-wrapper">
                <AdminSidebar role={role} />

                <main className="dashboard-main">
                    <Outlet context={outletContext} />
                </main>
            </div>

            <Footer />
        </>
    );
}

export default Dashboard;