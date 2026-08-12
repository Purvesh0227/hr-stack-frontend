import { useEffect, useState } from "react";
import { markAttendance, getMyAttendance, getAllAttendance, createOtp } from "../services/api";
import { formatDateTime, dateToMillis } from "../utils/dateUtils";
import { DEPARTMENTS } from "../constants/departmentConstants";
import "../styles/Attendance.css";

function Attendance({ role }) {
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

    // Load attendance
    const loadAttendance = async () => {
        try {
            let response;
            if (role === "ADMIN") {
                response = await getAllAttendance();
            } else {
                response = await getMyAttendance();
            }
            setAttendance(response.data);
        } catch (error) {
            alert(error.response?.data?.error || "Unable to fetch attendance");
        }
    };

    // Initial load
    useEffect(() => {
        loadAttendance();
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
                setOtp(null);
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

    // Mark attendance button
    const handleMarkAttendance = () => {
        setEnteredOtp("");
        setShowOtpModal(true);
    };

    // Submit OTP
    const handleSubmitOtp = async () => {
        if (!enteredOtp) {
            alert("Please enter OTP");
            return;
        }
        if (enteredOtp.length !== 6) {
            alert("OTP must be 6 digits");
            return;
        }
        try {
            setLoading(true);
            await markAttendance(enteredOtp);
            alert("Attendance marked successfully");
            setShowOtpModal(false);
            setEnteredOtp("");
            await loadAttendance();
        } catch (error) {
            alert(error.response?.data?.error || "Unable to mark attendance");
        } finally {
            setLoading(false);
        }
    };

    // Generate OTP
    const handleGenerateOtp = async () => {
        try {
            const dateInMillis = dateToMillis(selectedDate);
            const response = await createOtp({ date: dateInMillis, department: department });
            setOtp(response.data);
            alert("OTP generated successfully");
        } catch (error) {
            alert(error.response?.data?.error || "Unable to generate OTP");
        }
    };

    // View my attendance
    const handleMyAttendance = async () => {
        try {
            const response = await getMyAttendance();
            setAttendance(response.data);
            setShowMyAttendance(true);
        } catch (error) {
            alert(error.response?.data?.error || "Unable to fetch your attendance");
        }
    };

    return (
    <div className="attendance-page">
        <div className="content-card">
            {/* Header */}
            <div className="card-header">
                <h2>Attendance</h2>
                <button className="primary-btn" onClick={handleMarkAttendance} disabled={loading}>
                    {loading ? "Marking..." : "Mark Attendance"}
                </button>
            </div>

            {/* Action buttons */}
            <div className="attendance-actions">
                {role === "ADMIN" && (
                    <>
                        <button className="primary-btn" onClick={loadAttendance}>View Attendance</button>
                        <button
                            className="primary-btn"
                            onClick={() => {
                                setShowInitiate(true);
                                setOtp(null);
                                setCountdown(0);
                            }}
                        >
                            Initiate Attendance
                        </button>
                    </>
                )}
                <button className="primary-btn" onClick={handleMyAttendance}>My Attendance</button>
            </div>


            {/* Initiate attendance modal */}
                {role === "ADMIN" && showInitiate && (
                    <div className="attendance-modal-overlay">
                        <div className="attendance-initiate-modal">
                            
                            <h2 className="modal-title">
                                Initiate Attendance
                            </h2>

                            <div className="attendance-form-row">

                                {/* Date */}
                                <div className="attendance-form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        max={new Date().toISOString().split("T")[0]}
                                        onChange={(e) =>
                                            setSelectedDate(e.target.value)
                                        }
                                    />
                                </div>

                                {/* Department */}
                                <div className="attendance-form-group">
                                    <label>Department</label>

                                    <select
                                        value={department}
                                        onChange={(e) =>
                                            setDepartment(e.target.value)
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
                            >
                                Generate OTP
                            </button>

                            {/* OTP */}
                            {otp && countdown > 0 && (
                                <div className="attendance-otp-box">

                                    <h3>OTP</h3>

                                    <span className="attendance-otp-value">
                                        {otp.otp}
                                    </span>

                                    <p className="attendance-otp-validity">
                                        Valid for
                                    </p>

                                    <div className="attendance-otp-countdown">
                                        {formatCountdown()}
                                    </div>

                                </div>
                            )}

                            {/* Expired OTP */}
                            {otp && countdown === 0 && (
                                <div className="attendance-otp-box">

                                    <h3>OTP Expired</h3>

                                    <button
                                        className="primary-btn"
                                        onClick={handleGenerateOtp}
                                    >
                                        Generate New OTP
                                    </button>

                                </div>
                            )}

                            {/* Footer */}
                            <div className="attendance-modal-footer">

                                <button
                                    className="cancel-btn"
                                    onClick={() => {
                                        setShowInitiate(false);
                                        setOtp(null);
                                        setCountdown(0);
                                    }}
                                >
                                    Close
                                </button>

                            </div>

                        </div>
                    </div>
                )}

            {/* Enter OTP modal */}
            {/* Enter OTP modal */}
            {showOtpModal && (
                <div className="attendance-modal-overlay">

                    <div className="attendance-mark-modal">

                        <h2 className="modal-title">
                            Mark Attendance
                        </h2>

                        <p className="attendance-mark-description">
                            Enter the valid 6-digit OTP generated by admin.
                        </p>

                        <div className="attendance-otp-input-group">

                            <label>OTP</label>

                            <input
                                className="attendance-otp-input"
                                type="text"
                                maxLength="6"
                                value={enteredOtp}
                                onChange={(e) =>
                                    setEnteredOtp(
                                        e.target.value.replace(/\D/g, "")
                                    )
                                }
                                placeholder="Enter OTP"
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

            {/* Attendance table */}
            <div className="attendance-table-container">
                <h3>
                    {showMyAttendance
                        ? "My Attendance"
                        : role === "ADMIN"
                            ? "All Employee Attendance"
                            : "My Attendance"}
                </h3>

                {attendance.length === 0 ? (
                    <p>No attendance records found.</p>
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
                                    <td>{record.status}</td>
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