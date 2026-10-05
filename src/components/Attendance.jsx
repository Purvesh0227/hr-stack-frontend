import { useEffect, useState } from "react";
import {
    markAttendance,
    searchAttendance,
    createOtp,
    isRequestCancelled
} from "../services/api";
import { formatDateTime, dateToMillis } from "../utils/dateUtils";
import { DEPARTMENTS } from "../constants/departmentConstants";
import { useNotification } from "../contexts/NotificationContext";
import useDebounce from "../hooks/useDebounce";
import Pagination from "./Pagination";
import "../styles/Attendance.css"
import useSubmitLock from "../hooks/useSubmitLock";

const RECORDS_PER_PAGE = 7;

// Start/end (epoch millis) of the chosen month in the current year,
// using the browser's local time. No month selected = no date limit.
const getMonthRange = (month) => {
    if (!month) {
        return {};
    }

    const year = new Date().getFullYear();
    const monthIndex = Number(month) - 1;

    return {
        from: new Date(year, monthIndex, 1).getTime(),
        to: new Date(year, monthIndex + 1, 1).getTime() - 1
    };
};

function Attendance({ role }) {
    const { showNotification } = useNotification();

    const [attendance, setAttendance] = useState([]); // current page only
    const [attendanceTotalElements, setAttendanceTotalElements] = useState(0);
    const [attendanceTotalPages, setAttendanceTotalPages] = useState(0);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [attendanceRefreshKey, setAttendanceRefreshKey] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");

    // Input stays instant; filtering uses the debounced value
    const debouncedSearchTerm = useDebounce(searchTerm.trim(), 400);

    const [showInitiate, setShowInitiate] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [scope, setScope] = useState(role === "ADMIN" ? "ALL" : "MY");
    const showMyAttendance = scope === "MY";

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

    // Reset to page 1 when scope, search or month changes.
    // Done during render (not in a second effect) so no wasted
    // request is fired for the old page number.
    const attendanceFilterKey = `${scope}|${debouncedSearchTerm}|${selectedMonth}`;
    const [lastAttendanceFilterKey, setLastAttendanceFilterKey] = useState(
        attendanceFilterKey
    );

    if (lastAttendanceFilterKey !== attendanceFilterKey) {
        setLastAttendanceFilterKey(attendanceFilterKey);
        setCurrentPage(1);
    }

    /* =========================================
       LOAD ATTENDANCE (server-side search + pagination)
       ========================================= */

    // Re-runs the fetch effect below (after marking attendance, button clicks)
    const handleRefreshAttendance = () => {
        setAttendanceRefreshKey((key) => key + 1);
    };

    useEffect(() => {
        const controller = new AbortController();

        const loadAttendance = async () => {
            try {
                setLoadingAttendance(true);

                const { data } = await searchAttendance({
                    scope,
                    // Search is only meaningful for the admin "ALL" view
                    search: scope === "ALL" ? debouncedSearchTerm : "",
                    ...getMonthRange(selectedMonth),
                    page: currentPage - 1,
                    size: RECORDS_PER_PAGE,
                    signal: controller.signal
                });

                // Current page no longer exists -> go back
                if (
                    data.totalPages > 0 &&
                    currentPage > data.totalPages
                ) {
                    setCurrentPage(data.totalPages);
                    return;
                }

                setAttendance(data.content);
                setAttendanceTotalElements(data.totalElements);
                setAttendanceTotalPages(data.totalPages);
            } catch (error) {
                // Request was superseded by a newer one
                if (isRequestCancelled(error)) {
                    return;
                }

                showNotification(
                    error.response?.data?.error ||
                        "Unable to fetch attendance",
                    "error"
                );
            } finally {
                if (!controller.signal.aborted) {
                    setLoadingAttendance(false);
                }
            }
        };

        loadAttendance();

        // Cancels the stale request on every change / unmount
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        scope,
        debouncedSearchTerm,
        selectedMonth,
        currentPage,
        attendanceRefreshKey
    ]);

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

            handleRefreshAttendance();
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
        if (otpCooldown > 0 || generatingOtp) {
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
        setScope("ALL");
        handleRefreshAttendance();
    };

    const handleMyAttendance = () => {
        setScope("MY");
        handleRefreshAttendance();
    };

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
                            {attendanceTotalElements} attendance
                            {attendanceTotalElements !== 1
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
                    {attendance.length === 0 ? (
                        !loadingAttendance && (
                            <p className="no-attendance">
                                No attendance records found.
                            </p>
                        )
                    ) : (
                        <>
                            <div
                                className="attendance-table-wrapper"
                                style={{
                                    opacity: loadingAttendance ? 0.6 : 1,
                                    transition: "opacity .15s"
                                }}
                            >
                                <table className="employee-table">
                                    <thead>
                                        <tr>
                                            <th>Employee ID</th>
                                            <th>Marked On</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {attendance.map(
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
                                            attendance.length
                                        }
                                    </strong>{" "}
                                    of{" "}
                                    <strong>
                                        {
                                            attendanceTotalElements
                                        }
                                    </strong>{" "}
                                    records
                                </span>

                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={attendanceTotalPages}
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