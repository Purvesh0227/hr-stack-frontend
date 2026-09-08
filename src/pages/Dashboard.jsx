import { useEffect, useState } from "react";
import { getAllEmployees, getAllAdmins, getAdminProfile, updateEmployee} from "../services/api";
import Navbar from "../components/Navbar";
import AdminSidebar from "../components/AdminSidebar";
import Footer from "../components/Footer";
import AddAdminModal from "../components/AddAdminModal";
import Attendance from "../components/Attendance";
import Finance from "../components/Finance";
import EmployeeModal from "../components/EmployeeModal";


function Dashboard() {

    const employee = JSON.parse(localStorage.getItem("employee"));
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    const [employees, setEmployees] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [adminProfile, setAdminProfile] = useState(null);
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [showAddAdminModal, setShowAddAdminModal] = useState(false);


    // Employee Modal
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeModalMode, setEmployeeModalMode] = useState("view");


    const handleGetAllEmployees = async () => {
        try {
            const response = await getAllEmployees(email);
            setEmployees(response.data);
        } catch (error) {
            alert(error.response?.data || "Unable to fetch employees");
        }
    };


    const handleGetAllAdmins = async () => {
        try {
            const response = await getAllAdmins(email);
            setAdmins(response.data);
        } catch (error) {
            alert(error.response?.data || "Unable to fetch admins");
        }
    };


    const handleGetAdminProfile = async () => {
        try {
            const response = await getAdminProfile(email);
            setAdminProfile(response.data);
        } catch (error) {
            alert(error.response?.data || "Unable to fetch admin profile");
        }
    };


    // View Employee
    const handleViewEmployee = (emp) => {
        setSelectedEmployee(emp);
        setEmployeeModalMode("view");
        setShowEmployeeModal(true);
    };


    // Edit Employee
    const handleEditEmployee = (emp) => {
        setSelectedEmployee(emp);
        setEmployeeModalMode("edit");
        setShowEmployeeModal(true);
    };


    // Close Employee Modal
    const handleCloseEmployeeModal = () => {
        setShowEmployeeModal(false);
        setSelectedEmployee(null);
    };


    // Save Employee
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


    useEffect(() => {
        handleGetAdminProfile();
    }, [email]);


    return (
        <>
            <Navbar />

            {role === "ADMIN" ? (

                <div className="dashboard-wrapper">

                    <AdminSidebar
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                        role={role}
                    />

                    <main className="dashboard-main">

                        <div className="dashboard-header">
                            <div>
                                <h1>Welcome, {employee.firstName}</h1>
                                <p>Manage employees and administrators.</p>
                            </div>
                        </div>


                        {activeMenu === "dashboard" && (

                            <div className="content-card">

                                <div className="card-header">

                                    <h2>Employees</h2>

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
                                                        <button className="employee-id-btn" onClick={() => handleViewEmployee(emp)}>
                                                            {emp.empId}
                                                        </button>
                                                    </td>

                                                    <td>
                                                        {emp.firstName} {emp.lastName}
                                                    </td>

                                                    <td>{emp.email}</td>

                                                    <td>{emp.mobile}</td>

                                                    <td>{emp.role}</td>

                                                    <td className="action-buttons">

                                                        <button
                                                            className="view-btn"
                                                            onClick={() =>
                                                                handleViewEmployee(emp)
                                                            }
                                                            title="View Employee"
                                                        >
                                                            👁️
                                                        </button>


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

                                                    <td>{admin.empId}</td>

                                                    <td>
                                                        {admin.firstName} {admin.lastName}
                                                    </td>

                                                    <td>{admin.email}</td>

                                                    <td>{admin.mobile}</td>

                                                    <td>{admin.role}</td>

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
                                    refreshAdmins={handleGetAllAdmins}
                                />

                            </div>

                        )}


                        {activeMenu === "attendance" && (
                            <Attendance role={role} />
                        )}


                        {activeMenu === "finance" && (
                            <Finance role={role} />
                        )}


                        {activeMenu === "settings" && (

                            <div className="content-card">

                                <h2>My Profile</h2>

                                {adminProfile && (

                                    <div className="profile-details">

                                        <p>
                                            <strong>First Name :</strong>{" "}
                                            {adminProfile.firstName}
                                        </p>

                                        <p>
                                            <strong>Last Name :</strong>{" "}
                                            {adminProfile.lastName}
                                        </p>

                                        <p>
                                            <strong>Email :</strong>{" "}
                                            {adminProfile.email}
                                        </p>

                                        <p>
                                            <strong>Role :</strong>{" "}
                                            {adminProfile.role}
                                        </p>

                                    </div>

                                )}

                            </div>

                        )}


                        {/* Employee View / Edit Modal */}

                        <EmployeeModal
                            isOpen={showEmployeeModal}
                            employee={selectedEmployee}
                            mode={employeeModalMode}
                            onClose={handleCloseEmployeeModal}
                            onSave={handleSaveEmployee}
                        />

                    </main>

                </div>

            ) : (

                <div className="dashboard-wrapper">

                    <AdminSidebar
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                        role={role}
                    />

                    <main className="dashboard-main">

                        {/* Home */}

                        {activeMenu === "dashboard" && (

                            <>

                                <div className="dashboard-header">

                                    <div>

                                        <h1>
                                            Welcome, {employee.firstName}
                                        </h1>

                                        <p>
                                            Welcome to your employee dashboard.
                                        </p>

                                    </div>

                                </div>


                                <div className="content-card">

                                    <h2>Home</h2>

                                    <p>
                                        Welcome to HR-Stack Employee Dashboard.
                                    </p>

                                </div>

                            </>

                        )}


                        {activeMenu === "attendance" && (
                            <Attendance role={role} />
                        )}


                        {activeMenu === "finance" && (
                            <Finance role={role} />
                        )}


                        {/* Settings */}

                        {activeMenu === "settings" && (

                            <div className="content-card">

                                <h2>My Profile</h2>

                                <div className="profile-details">

                                    <p>
                                        <strong>Employee ID :</strong>{" "}
                                        {employee.id}
                                    </p>

                                    <p>
                                        <strong>First Name :</strong>{" "}
                                        {employee.firstName}
                                    </p>

                                    <p>
                                        <strong>Last Name :</strong>{" "}
                                        {employee.lastName}
                                    </p>

                                    <p>
                                        <strong>Email :</strong>{" "}
                                        {employee.email}
                                    </p>

                                    <p>
                                        <strong>Mobile :</strong>{" "}
                                        {employee.mobile}
                                    </p>

                                    <p>
                                        <strong>Role :</strong>{" "}
                                        {employee.role}
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