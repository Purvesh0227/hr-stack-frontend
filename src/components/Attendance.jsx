import { useEffect, useState } from "react";
import { markAttendance, getAttendance, createOtp } from "../services/api";
import { formatDateTime, dateToMillis } from "../utils/dateUtils";
import { DEPARTMENTS } from "../constants/departmentConstants";
import { useNotification } from "../contexts/NotificationContext";
import "../styles/Attendance.css";

function Attendance({ role }) {
    const { showNotification } = useNotification();
    const [attendance, setAttendance] = useState([]);
    const [showInitiate, setShowInitiate] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [showMyAttendance, setShowMyAttendance] = useState(false);
    const [department, setDepartment] = useState("IT");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [otp, setOtp] = useState(null);
    const [enteredOtp, setEnteredOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const [generatingOtp, setGeneratingOtp] = useState(false);

    // Load attendance
    const loadAttendance = async (scope) => {
        try {
            const response = await getAttendance(scope);
            setAttendance(response.data);
            setShowMyAttendance(scope === "MY");
        } catch (error) {
            showNotification(
                error.response?.data?.error || "Unable to fetch attendance",
                "error"
            );
        }
    };

    // Initial load
    useEffect(() => {
        if (role === "ADMIN") {
            loadAttendance("ALL");
        } else {
            loadAttendance("MY");
        }
    }, [role]);

    // OTP countdown
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
        return () => {
            clearInterval(timer);
        };
    }, [otp]);

    // Format countdown
    const formatCountdown = () => {
        const minutes = Math.floor(countdown / 60);
        const seconds = countdown % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    // Mark attendance
    const handleMarkAttendance = () => {
        setEnteredOtp("");
        setShowOtpModal(true);
    };

    // Submit OTP
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
            showNotification("Attendance marked successfully", "success");
            setShowOtpModal(false);
            setEnteredOtp("");

            // Refresh current view
            if (showMyAttendance) {
                await loadAttendance("MY");
            } else if (role === "ADMIN") {
                await loadAttendance("ALL");
            } else {
                await loadAttendance("MY");
            }
        } catch (error) {
            showNotification(
                error.response?.data?.error || "Unable to mark attendance",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    // Generate OTP
    // Generate OTP
const handleGenerateOtp = async () => {
    try {
        setGeneratingOtp(true);

        const response = await createOtp(
            dateToMillis(selectedDate),
            department
        );

        setOtp(response.data);

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

    // Open initiate modal
    const handleOpenInitiate = () => {
        setSelectedDate(new Date().toISOString().split("T")[0]);
        setOtp(null);
        setCountdown(0);
        setShowInitiate(true);
    };

    // Close initiate modal
    const handleCloseInitiate = () => {
        setShowInitiate(false);
        setOtp(null);
        setCountdown(0);
    };

    // View all attendance (admin)
    const handleViewAttendance = () => {
        loadAttendance("ALL");
    };

    // View my attendance (admin + employee)
    const handleMyAttendance = () => {
        loadAttendance("MY");
    };

    return (
        <div className="attendance-page">
            <div className="content-card">
                {/* Header */}
                <div className="card-header">
                    <h2>Attendance</h2>
                    <button className="primary-btn mark-attendance-btn" onClick={handleMarkAttendance} disabled={loading}>
                        {loading ? "Marking..." : "Mark Attendance"}
                    </button>
                </div>

                {/* Action buttons */}
                <div className="attendance-actions">
                    {/* Admin only */}
                    {role === "ADMIN" && (
                        <>
                            <button className="primary-btn" onClick={handleViewAttendance}>View Attendance</button>
                            <button className="primary-btn" onClick={handleOpenInitiate}>Initiate Attendance</button>
                        </>
                    )}

                    {/* Admin + employee */}
                    <button className="primary-btn" onClick={handleMyAttendance}>My Attendance</button>
                </div>

                {/* Initiate attendance modal */}
                {role === "ADMIN" && showInitiate && (
                    <div className="attendance-modal-overlay">
                        <div className="attendance-initiate-modal">
                            <h2 className="modal-title">Initiate Attendance</h2>

                            {/* Date + department */}
                            <div className="attendance-form-row">
                                <div className="attendance-form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        max={new Date().toISOString().split("T")[0]}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                    />
                                </div>

                                <div className="attendance-form-group">
                                    <label>Department</label>
                                    <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                                        {DEPARTMENTS.map((dept) => (
                                            <option key={dept.value} value={dept.value}>{dept.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Generate OTP */}
                            <button
                                    className="attendance-generate-btn"
                                    onClick={handleGenerateOtp}
                                    disabled={generatingOtp}
                                >
                                    {generatingOtp ? (
                                        <>
                                            <span className="otp-spinner"></span>
                                            Generating & Sending...
                                        </>
                                    ) : (
                                        "Generate OTP"
                                    )}
                                </button>

                            {/* OTP display */}
                            {otp && countdown > 0 && (
                                <div className="attendance-otp-box">
                                    <div className="otp-label">OTP</div>
                                    <div className="attendance-otp-value">{otp.otp}</div>
                                    <div className="otp-divider"></div>
                                    <div className="otp-countdown-label">OTP expires in</div>
                                    <div className="attendance-otp-countdown">{formatCountdown()}</div>
                                    <div className="otp-time-row">
                                        <div>
                                            <span>Generated On</span>
                                            <strong>{formatDateTime(otp.createdOn)}</strong>
                                        </div>
                                        <div>
                                            <span>Valid Till</span>
                                            <strong>{formatDateTime(otp.expiredOn)}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Expired OTP */}
                            {otp && countdown === 0 && (
                                <div className="attendance-otp-box expired">
                                    <div className="otp-label">OTP Expired</div>
                                    <p>Generate a new OTP to start attendance.</p>
                                    <button className="primary-btn" onClick={handleGenerateOtp}>Generate New OTP</button>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="attendance-modal-footer">
                                <button className="cancel-btn" onClick={handleCloseInitiate}>Close</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mark attendance OTP modal */}
                {showOtpModal && (
                    <div className="attendance-modal-overlay">
                        <div className="attendance-mark-modal">
                            <h2 className="modal-title">Mark Attendance</h2>
                            <p className="attendance-mark-description">Enter the valid 6-digit OTP generated by admin.</p>

                            <div className="attendance-otp-input-group">
                                <label>OTP</label>
                                <input
                                    className="attendance-otp-input"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength="6"
                                    value={enteredOtp}
                                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                                    placeholder="Enter OTP"
                                />
                            </div>

                            <div className="attendance-mark-buttons">
                                <button className="primary-btn" onClick={handleSubmitOtp} disabled={loading}>
                                    {loading ? "Verifying..." : "Verify & Mark"}
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

                {/* Attendance table */}
                <div className="attendance-table-container">
                    <div className="attendance-table-header">
                        <h3>
                            {showMyAttendance
                                ? "My Attendance"
                                : role === "ADMIN"
                                    ? "All Employee Attendance"
                                    : "My Attendance"}
                        </h3>
                    </div>

                    {attendance.length === 0 ? (
                        <p className="no-attendance">No attendance records found.</p>
                    ) : (
                        <table className="employee-table">
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Marked On</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map((record) => (
                                    <tr key={record.uuid}>
                                        <td>{record.empId}</td>
                                        <td>{formatDateTime(record.markedOn)}</td>
                                        <td><span className="status-present">{record.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Attendance;