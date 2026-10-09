import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const API = axios.create({
    baseURL: `${API_BASE_URL}/employee`
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
    baseURL: API_BASE_URL
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

// If token expired/invalid, clear login data and go to login page
const handleUnauthorized = (error) => {
    if (error.response?.status === 401) {
        ["token", "employee", "email", "role"].forEach((key) =>
            localStorage.removeItem(key)
        );

        const loginPath = `${import.meta.env.BASE_URL}login`;

        // avoid redirect loop if already on login
        if (!window.location.pathname.endsWith("/login")) {
            window.location.replace(loginPath);
        }
    }
    return Promise.reject(error);
};

API.interceptors.response.use((response) => response, handleUnauthorized);
FILE_API.interceptors.response.use((response) => response, handleUnauthorized);


// Lets callers detect aborted requests without importing axios
export const isRequestCancelled = axios.isCancel;

// Login
export const loginEmployee = (loginData) => API.post("/login", loginData);

// Register Employee
export const registerEmployee = (employeeData) => API.post("/register", employeeData,
    {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    }
);

// Create Admin
export const createAdmin = (adminData) =>  API.post("/createAdmin", adminData);

// Get All Admins
// Get All Admins (server-side search + joining date range + pagination)
export const getAllAdmins = ({
    search = "",
    from,
    to,
    page = 0,
    size = 10,
    signal
} = {}) =>
    API.get("/allAdmins", {
        params: { search, from, to, page, size },
        signal
    });

// Get Admin Profile
export const getAdminProfile = (email) =>
    API.get("/adminProfile", { params: { email } });


export const getAllEmployees = ({
    search = "",
    status = "",
    from,
    to,
    page = 0,
    size = 10,
    signal
} = {}) =>
    API.get("/allEmployees", {
        params: {
            search,
            status: status || undefined,   
            from,
            to,
            page,
            size
        },
        signal
    });

// Get Employee by UUID
export const getEmployeeById = (uuid) =>
    API.get(`/${uuid}`);

// Update Employee
// Update Employee Details
export const updateEmployee = (uuid, employeeData) =>
    API.put(`/${uuid}`, employeeData);


// Update Employee Profile Photo
// Uses the same PUT /employee/{uuid} endpoint
export const updateEmployeeProfilePhoto = (
    uuid,
    profilePhoto
) => {

    const formData = new FormData();

    formData.append(
        "profilePhoto",
        profilePhoto
    );

    return API.put(
        `/${uuid}`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );
};

// Mark attendance
export const markAttendance = (otp) =>
    API.post("/attendance", { otp });

// Get attendance (server-side search + date range + pagination)
// scope: "MY" or "ALL". from/to: epoch millis (optional). page is 0-based.
// Undefined params are omitted from the query string by axios.
export const searchAttendance = ({
    scope = "MY",
    search = "",
    from,
    to,
    page = 0,
    size = 7,
    signal
} = {}) =>
    API.get("/attendance/view", {
        params: {
            scope,
            search,
            from,
            to,
            page,
            size
        },
        signal
    });

// Create OTP
// Create OTP
export const createOtp = (date, department) =>
    API.post("/createotp", {
        date,
        department
    });


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
// View salary slips (server-side search + month/year + pagination)
// scope: "MY" or "ALL". month 1-12 and year are optional.
export const viewSalarySlips = ({
    scope = "MY",
    search = "",
    month,
    year,
    page = 0,
    size = 10,
    signal
} = {}) =>
    API.get("/salary/view", {
        params: { scope, search, month, year, page, size },
        signal
    });

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

export const getEmployeeDocumentUploadUrl = (uuid, documentType) =>
    API.get(`/${uuid}/documents/upload-url`, {
        params: { documentType }
    });

export const uploadDocumentDirectlyToMinio = (uploadUrl, file) =>
    axios.put(uploadUrl, file, {
        headers: {
            "Content-Type": file.type
        }
    });

    export const saveEmployeeDocuments = (uuid, data) =>
    API.post(`/${uuid}/documents`, data);

    export const activateEmployee = (uuid) =>
    API.patch(`/${uuid}/activate`);

    export const requestEmployeeDocuments = (uuid) =>
        API.patch(`/${uuid}/request-documents`);

    export const getEmployeeDocumentViewUrl = (
    uuid,
    documentType) =>
    API.get(`/${uuid}/documents/view-url`, { params: { documentType }});

    // forgot password 

    export const forgotPassword = (data) => API.post("/forgot-password", data);
    export const verifyResetOtp = (data) => API.post("/verify-reset-otp", data);
    export const resetPassword = (data) => API.post("/reset-password",data);


    export const sendEmailVerificationOtp = (data) => API.post("/email-verification/send", data);
    export const verifyEmailOtp = (data) => API.post("/email-verification/verify", data);

    export const sendEmailVerificationLink = (data) => API.post("/email-verification/send-link", data);

    export const confirmEmailVerificationLink = (token) =>
    API.post("/email-verification/confirm-link", null, {
        params: { token }
    });

    export const getEmailVerificationStatus = (data) =>
    API.post("/email-verification/status", data);

    // login otp 
    export const verifyLoginOtp = (data) => API.post("/login/verify-otp", data);
    export const resendLoginOtp = (data) => API.post("/login/resend-otp", data);

    // Google sign-in
    export const googleLogin = (idToken) => API.post("/google-login", { idToken });

export default API;