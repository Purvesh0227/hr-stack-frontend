import { useEffect, useState } from "react";
import { markAttendance, getAttendance, createOtp } from "../services/api";
import { formatDateTime, dateToMillis } from "../utils/dateUtils";
import { DEPARTMENTS } from "../constants/departmentConstants";
import { useNotification } from "../contexts/NotificationContext";
import { filterBySearch } from "../utils/tableFilters";
import { paginate } from "../utils/pagination";
import Pagination from "../components/Pagination";
import "../styles/Attendance.css"

function Attendance({ role }) {
    const { showNotification } = useNotification();

    const [attendance, setAttendance] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");

    const [showInitiate, setShowInitiate] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [showMyAttendance, setShowMyAttendance] = useState(false);

    const [department, setDepartment] = useState("IT");
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    const [otp, setOtp] = useState(null);
    const [enteredOtp, setEnteredOtp] = useState("");

    const [loading, setLoading] = useState(false);
    const [generatingOtp, setGeneratingOtp] = useState(false);

    const [countdown, setCountdown] = useState(0);
    const [otpCooldown, setOtpCooldown] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);

    /* =========================================
       LOAD ATTENDANCE
       ========================================= */

    const loadAttendance = async (scope) => {
        try {
            const response = await getAttendance(scope);

            setAttendance(response.data);
            setShowMyAttendance(scope === "MY");
        } catch (error) {
            showNotification(
                error.response?.data?.error ||
                    "Unable to fetch attendance",
                "error"
            );
        }
    };

    /* =========================================
       INITIAL LOAD
       ========================================= */

    useEffect(() => {
        if (role === "ADMIN") {
            loadAttendance("ALL");
        } else {
            loadAttendance("MY");
        }
    }, [role]);

    /* =========================================
       OTP EXPIRY COUNTDOWN
       ========================================= */

    useEffect(() => {
        if (!otp?.expiredOn) {
            setCountdown(0);
            return;
        }

        const updateCountdown = () => {
            const remaining = Number(otp.expiredOn) - Date.now();

            if (remaining <= 0) {
                setCountdown(0);
                return;
            }

            setCountdown(Math.floor(remaining / 1000));
        };

        updateCountdown();

        const timer = setInterval(updateCountdown, 1000);

        return () => clearInterval(timer);
    }, [otp]);

    /* =========================================
       OTP GENERATION COOLDOWN
       ========================================= */

    useEffect(() => {
        if (otpCooldown <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setOtpCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [otpCooldown]);

    /* =========================================
       RESET PAGINATION WHEN FILTER CHANGES
       ========================================= */

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedMonth]);

    /* =========================================
       FORMATTERS
       ========================================= */

    const formatCountdown = () => {
        const minutes = Math.floor(countdown / 60);
        const seconds = countdown % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            seconds
        ).padStart(2, "0")}`;
    };

    const formatOtpCooldown = () => {
        const minutes = Math.floor(otpCooldown / 60);
        const seconds = otpCooldown % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            seconds
        ).padStart(2, "0")}`;
    };

    /* =========================================
       MARK ATTENDANCE
       ========================================= */

    const handleMarkAttendance = () => {
        setEnteredOtp("");
        setShowOtpModal(true);
    };

    /* =========================================
       SUBMIT OTP
       ========================================= */

    const handleSubmitOtp = async () => {
        if (!enteredOtp) {
            showNotification("Please enter OTP", "error");
            return;
        }

        if (enteredOtp.length !== 6) {
            showNotification("OTP must be 6 digits", "error");
            return;
        }

        try {
            setLoading(true);

            await markAttendance(enteredOtp);

            showNotification(
                "Attendance marked successfully",
                "success"
            );

            setShowOtpModal(false);
            setEnteredOtp("");

            if (showMyAttendance) {
                await loadAttendance("MY");
            } else if (role === "ADMIN") {
                await loadAttendance("ALL");
            } else {
                await loadAttendance("MY");
            }
        } catch (error) {
            showNotification(
                error.response?.data?.error ||
                    "Unable to mark attendance",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    /* =========================================
       GENERATE OTP
       ========================================= */

    const handleGenerateOtp = async () => {
        if (otpCooldown > 0) {
            return;
        }

        try {
            setGeneratingOtp(true);

            const response = await createOtp(
                dateToMillis(selectedDate),
                department
            );

            setOtp(response.data);

            setOtpCooldown(5 * 60);

            showNotification(
                "OTP generated and sent successfully.",
                "success"
            );
        } catch (error) {
            console.error("Failed to generate OTP:", error);

            showNotification(
                error.response?.data?.error ||
                    "Failed to generate and send OTP.",
                "error"
            );
        } finally {
            setGeneratingOtp(false);
        }
    };

    /* =========================================
       INITIATE ATTENDANCE
       ========================================= */

    const handleOpenInitiate = () => {
        setSelectedDate(
            new Date().toISOString().split("T")[0]
        );

        setOtp(null);
        setCountdown(0);
        setShowInitiate(true);
    };

    const handleCloseInitiate = () => {
        setShowInitiate(false);
        setOtp(null);
        setCountdown(0);
    };

    /* =========================================
       ATTENDANCE VIEWS
       ========================================= */

    const handleViewAttendance = () => {
        loadAttendance("ALL");
    };

    const handleMyAttendance = () => {
        loadAttendance("MY");
    };

    /* =========================================
       SEARCH + MONTH FILTER
       ========================================= */

    const searchFilteredAttendance = filterBySearch(
        attendance,
        searchTerm,
        "empId"
    );

    const filteredAttendance = searchFilteredAttendance.filter(
        (record) => {
            return (
                selectedMonth === "" ||
                new Date(record.markedOn).getMonth() + 1 ===
                    Number(selectedMonth)
            );
        }
    );

    /* =========================================
       PAGINATION
       ========================================= */

    const recordsPerPage = 7;

    const {
        currentItems: paginatedAttendance,
        totalPages
    } = paginate(
        filteredAttendance,
        currentPage,
        recordsPerPage
    );

    /* =========================================
       RENDER
       ========================================= */

    return (
        <div className="attendance-page">

            {/* Page Header */}
            <div className="attendance-page-header">
                <div>
                    <p className="dashboard-eyebrow">
                        {role === "ADMIN"
                            ? "Admin Dashboard"
                            : "Employee Dashboard"}
                    </p>

                    <h1>Attendance</h1>

                    <p className="attendance-page-subtitle">
                        Track and manage employee attendance records.
                    </p>
                </div>

                <button
                    className="primary-btn attendance-mark-top-btn"
                    onClick={handleMarkAttendance}
                    disabled={loading}
                >
                    {loading ? "Marking..." : "Mark Attendance"}
                </button>
            </div>

            {/* Main Attendance Card */}
            <div className="attendance-card">

                {/* Card Header */}
                <div className="attendance-card-header">
                    <div>
                        <h2>
                            {showMyAttendance
                                ? "My Attendance"
                                : role === "ADMIN"
                                    ? "All Employee Attendance"
                                    : "My Attendance"}
                        </h2>

                        <p>
                            {filteredAttendance.length} attendance
                            {filteredAttendance.length !== 1
                                ? " records"
                                : " record"}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="attendance-actions">

                        {role === "ADMIN" && (
                            <>
                                <button
                                    className="secondary-btn"
                                    onClick={handleViewAttendance}
                                >
                                    View Attendance
                                </button>

                                <button
                                    className="primary-btn"
                                    onClick={handleOpenInitiate}
                                >
                                    Initiate Attendance
                                </button>
                            </>
                        )}

                        <button
                            className="secondary-btn"
                            onClick={handleMyAttendance}
                        >
                            My Attendance
                        </button>
                    </div>
                </div>

                {/* =========================================
                    INITIATE ATTENDANCE MODAL
                   ========================================= */}

                {role === "ADMIN" && showInitiate && (
                    <div className="attendance-modal-overlay">
                        <div className="attendance-initiate-modal">

                            <h2 className="modal-title">
                                Initiate Attendance
                            </h2>

                            <p className="attendance-modal-subtitle">
                                Select the attendance date and department,
                                then generate the OTP.
                            </p>

                            {/* Date + Department */}
                            <div className="attendance-form-row">

                                <div className="attendance-form-group">
                                    <label>Date</label>

                                    <input
                                        type="date"
                                        value={selectedDate}
                                        max={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        onChange={(e) =>
                                            setSelectedDate(
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="attendance-form-group">
                                    <label>Department</label>

                                    <select
                                        value={department}
                                        onChange={(e) =>
                                            setDepartment(
                                                e.target.value
                                            )
                                        }
                                    >
                                        {DEPARTMENTS.map((dept) => (
                                            <option
                                                key={dept.value}
                                                value={dept.value}
                                            >
                                                {dept.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Generate OTP */}
                            <button
                                className="attendance-generate-btn"
                                onClick={handleGenerateOtp}
                                disabled={
                                    generatingOtp ||
                                    otpCooldown > 0
                                }
                            >
                                {generatingOtp ? (
                                    <>
                                        <span className="otp-spinner" />
                                        Generating & Sending...
                                    </>
                                ) : otpCooldown > 0 ? (
                                    `Generate OTP (${formatOtpCooldown()})`
                                ) : (
                                    "Generate OTP"
                                )}
                            </button>

                            {/* OTP Successfully Sent */}
                            {otp && countdown > 0 && (
                                <div className="attendance-otp-box">

                                    <div className="otp-label">
                                        OTP Sent Successfully
                                    </div>

                                    <p className="otp-sent-description">
                                        The attendance OTP has been
                                        sent to the registered email.
                                    </p>

                                    <div className="otp-divider" />

                                    <div className="otp-countdown-label">
                                        OTP expires in
                                    </div>

                                    <div className="attendance-otp-countdown">
                                        {formatCountdown()}
                                    </div>

                                    <div className="otp-time-row">

                                        <div>
                                            <span>Generated On</span>

                                            <strong>
                                                {formatDateTime(
                                                    otp.createdOn
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Valid Till</span>

                                            <strong>
                                                {formatDateTime(
                                                    otp.expiredOn
                                                )}
                                            </strong>
                                        </div>

                                    </div>
                                </div>
                            )}

                            {/* Expired OTP */}
                            {otp && countdown === 0 && (
                                <div className="attendance-otp-box expired">

                                    <div className="otp-label">
                                        OTP Expired
                                    </div>

                                    <p>
                                        Generate a new OTP to start
                                        attendance.
                                    </p>

                                    <button
                                        className="primary-btn"
                                        onClick={
                                            handleGenerateOtp
                                        }
                                        disabled={
                                            generatingOtp ||
                                            otpCooldown > 0
                                        }
                                    >
                                        {otpCooldown > 0
                                            ? `Generate New OTP (${formatOtpCooldown()})`
                                            : "Generate New OTP"}
                                    </button>
                                </div>
                            )}

                            {/* Modal Footer */}
                            <div className="attendance-modal-footer">
                                <button
                                    className="cancel-btn"
                                    onClick={handleCloseInitiate}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* =========================================
                    MARK ATTENDANCE OTP MODAL
                   ========================================= */}

                {showOtpModal && (
                    <div className="attendance-modal-overlay">
                        <div className="attendance-mark-modal">

                            <h2 className="modal-title">
                                Mark Attendance
                            </h2>

                            <p className="attendance-mark-description">
                                Enter the valid 6-digit OTP generated
                                by the admin.
                            </p>

                            <div className="attendance-otp-input-group">
                                <label>OTP</label>

                                <input
                                    className="attendance-otp-input"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength="6"
                                    value={enteredOtp}
                                    onChange={(e) =>
                                        setEnteredOtp(
                                            e.target.value.replace(
                                                /\D/g,
                                                ""
                                            )
                                        )
                                    }
                                    placeholder="Enter 6-digit OTP"
                                />
                            </div>

                            <div className="attendance-mark-buttons">

                                <button
                                    className="primary-btn"
                                    onClick={handleSubmitOtp}
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Verifying..."
                                        : "Verify & Mark"}
                                </button>

                                <button
                                    className="cancel-btn"
                                    onClick={() => {
                                        setShowOtpModal(false);
                                        setEnteredOtp("");
                                    }}
                                >
                                    Cancel
                                </button>

                            </div>
                        </div>
                    </div>
                )}

                {/* =========================================
                    ATTENDANCE TABLE
                   ========================================= */}

                <div className="attendance-table-container">

                    {/* Table Header */}
                    <div className="attendance-table-header">

                        <div>
                            <h3>
                                {showMyAttendance
                                    ? "My Attendance"
                                    : role === "ADMIN"
                                        ? "All Employee Attendance"
                                        : "My Attendance"}
                            </h3>

                            <p>
                                Review attendance records and filter
                                them by employee or month.
                            </p>
                        </div>

                        <div className="attendance-filters">

                            {role === "ADMIN" && (
                                <div className="attendance-search-wrapper">
                                    <input
                                        type="text"
                                        placeholder="Search Employee ID..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(
                                                e.target.value
                                            )
                                        }
                                        className="attendance-search-input"
                                    />
                                </div>
                            )}

                            <select
                                className="attendance-month-filter"
                                value={selectedMonth}
                                onChange={(e) =>
                                    setSelectedMonth(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="">
                                    All Months
                                </option>

                                <option value="1">January</option>
                                <option value="2">February</option>
                                <option value="3">March</option>
                                <option value="4">April</option>
                                <option value="5">May</option>
                                <option value="6">June</option>
                                <option value="7">July</option>
                                <option value="8">August</option>
                                <option value="9">September</option>
                                <option value="10">October</option>
                                <option value="11">November</option>
                                <option value="12">December</option>
                            </select>
                        </div>
                    </div>

                    {/* Empty State */}
                    {filteredAttendance.length === 0 ? (
                        <p className="no-attendance">
                            No attendance records found.
                        </p>
                    ) : (
                        <>
                            <div className="attendance-table-wrapper">
                                <table className="employee-table">
                                    <thead>
                                        <tr>
                                            <th>Employee ID</th>
                                            <th>Marked On</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {paginatedAttendance.map(
                                            (record) => (
                                                <tr
                                                    key={record.uuid}
                                                >
                                                    <td>
                                                        <strong>
                                                            {record.empId}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {formatDateTime(
                                                            record.markedOn
                                                        )}
                                                    </td>

                                                    <td>
                                                        <span className="status-present">
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="attendance-table-footer">
                                <span>
                                    Showing{" "}
                                    <strong>
                                        {
                                            paginatedAttendance.length
                                        }
                                    </strong>{" "}
                                    of{" "}
                                    <strong>
                                        {
                                            filteredAttendance.length
                                        }
                                    </strong>{" "}
                                    records
                                </span>

                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Attendance;