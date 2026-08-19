import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080/employee"
});

// Automatically attach JWT to every request
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Login
export const loginEmployee = (loginData) => API.post("/login", loginData);
// Register Employee
export const registerEmployee = (employeeData) => API.post("/register", employeeData);
// Create Admin
export const createAdmin = (adminData) => API.post("/createAdmin", adminData);
// Get All Admins
export const getAllAdmins = (email) => API.get("/allAdmins", { params: { email } });
// Get Admin Profile
export const getAdminProfile = (email) => API.get("/adminProfile", { params: { email } });
// Get All Employees
export const getAllEmployees = (email) => API.get("/allEmployees", { params: { email } });

// Mark attendance
export const markAttendance = (otp) => API.post("/attendance", { otp });
// Get attendance
export const getAttendance = (scope) => API.get("/attendance/view", { params: { scope } });

// Create OTP
export const createOtp = (otpData) => API.post("/createotp", otpData);

// ---------------- Salary / Finance ----------------

// Create or update salary structure (Admin)
export const createOrUpdateSalaryStructure = (structureData) =>
    API.post("/salary/structure", structureData);

// Get salary structure for an employee (Admin)
export const getSalaryStructure = (empId) =>
    API.get(`/salary/structure/${empId}`);

// Generate salary slip for an employee/month/year (Admin)
export const generateSalary = (empId, month, year) =>
    API.post("/salary/generate", null, { params: { empId, month, year } });

// View salary slips - scope: "MY" (Admin + Employee) or "ALL" (Admin only)
export const viewSalarySlips = (scope) =>
    API.get("/salary/view", { params: { scope } });

// Download salary slip PDF (Admin + Employee, own record only)
export const downloadSalarySlip = (empId, month, year) =>
    API.get("/salary/download", {
        params: { empId, month, year },
        responseType: "blob"
    });

export default API;