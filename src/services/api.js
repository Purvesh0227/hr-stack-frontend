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

// Separate API for file endpoints
const FILE_API = axios.create({
    baseURL: "http://localhost:8080"
});

// Automatically attach JWT to file requests
FILE_API.interceptors.request.use(
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
export const registerEmployee = (employeeData) =>
    API.post("/register", employeeData);

// Create Admin
export const createAdmin = (adminData) =>
    API.post("/createAdmin", adminData);

// Get All Admins
export const getAllAdmins = (email) =>
    API.get("/allAdmins", { params: { email } });

// Get Admin Profile
export const getAdminProfile = (email) =>
    API.get("/adminProfile", { params: { email } });

// Get All Employees
export const getAllEmployees = (email) =>
    API.get("/allEmployees", { params: { email } });
//update Employee
// Update Employee
export const updateEmployee = (uuid, employeeData) =>
    API.put(`/${uuid}`, employeeData);

// Mark attendance
export const markAttendance = (otp) =>
    API.post("/attendance", { otp });

// Get attendance
export const getAttendance = (scope) =>
    API.get("/attendance/view", { params: { scope } });

// Create OTP
export const createOtp = (otpData) =>
    API.post("/createotp", otpData);


// ---------------- Salary / Finance ----------------

// Create or update salary structure (Admin)
export const createOrUpdateSalaryStructure = (structureData) =>
    API.post("/salary/structure", structureData);

// Get salary structure for an employee (Admin)
export const getSalaryStructure = (empId) =>
    API.get(`/salary/structure/${empId}`);

// Generate salary slip for an employee/month/year (Admin)
export const generateSalary = (empId, month, year) =>
    API.post("/salary/generate", null, {
        params: { empId, month, year }
    });

// View salary slips - scope: "MY" or "ALL"
export const viewSalarySlips = (scope) =>
    API.get("/salary/view", { params: { scope } });

// Download salary slip PDF
export const downloadSalarySlip = (empId, month, year) =>
    API.get("/salary/download", {
        params: { empId, month, year },
        responseType: "blob"
    });

// Upload salary slip to temporary MinIO bucket
export const getTempUploadUrl = (empId, month, year) =>
    FILE_API.post("/files/temp/upload-url", null, {
        params: {
            empId,
            month,
            year
        }
    });
// Replace existing salary slip
export const replaceSalarySlip = (
    empId,
    month,
    year,
    tempObjectKey
) =>
    API.post("/salary/replace", null, {
        params: {
            empId,
            month,
            year,
            tempObjectKey
        }
    });

    export const uploadFileDirectlyToMinio = (uploadUrl, file) =>
    axios.put(uploadUrl, file, {
        headers: {
            "Content-Type": file.type
        }
    });
export default API;