import { useEffect, useState } from "react";

import {
    markAttendance,
    getMyAttendance,
    getAllAttendance,
    createOtp
} from "../services/api";

import "../styles/Attendance.css";


function Attendance({ role }) {

    const [attendance, setAttendance] = useState([]);

    const [showInitiate, setShowInitiate] =
        useState(false);

    const [department, setDepartment] =
        useState("IT");

    const [selectedDate, setSelectedDate] =
        useState(
            new Date()
                .toISOString()
                .split("T")[0]
        );

    const [otp, setOtp] = useState(null);

    const [loading, setLoading] =
        useState(false);


    // ==========================================
    // LOAD ATTENDANCE
    // ==========================================

    const loadAttendance = async () => {

        try {

            let response;

            if (role === "ADMIN") {

                response =
                    await getAllAttendance();

            } else {

                response =
                    await getMyAttendance();
            }

            setAttendance(response.data || []);

        } catch (error) {

            console.error(
                "Attendance error:",
                error
            );

            alert(
                error.response?.data?.error ||
                "Unable to fetch attendance"
            );
        }
    };


    useEffect(() => {

        loadAttendance();

    }, [role]);


    // ==========================================
    // MARK ATTENDANCE
    // ==========================================

    const handleMarkAttendance = async () => {

        try {

            setLoading(true);

            await markAttendance();

            alert(
                "Attendance marked successfully"
            );

            await loadAttendance();

        } catch (error) {

            alert(
                error.response?.data?.error ||
                "Unable to mark attendance"
            );

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // GENERATE OTP
    // ==========================================

    const handleGenerateOtp = async () => {

        try {

            const dateInMillis =
                new Date(
                    selectedDate +
                    "T00:00:00"
                ).getTime();

            const response =
                await createOtp({
                    date: dateInMillis,
                    department: department
                });

            setOtp(response.data);

            alert(
                "OTP generated successfully"
            );

        } catch (error) {

            console.error(
                "OTP error:",
                error
            );

            alert(
                error.response?.data?.error ||
                "Unable to generate OTP"
            );
        }
    };


    // ==========================================
    // FORMAT TIMESTAMP
    // ==========================================

    const formatDate = (timestamp) => {

        if (!timestamp) {
            return "-";
        }

        return new Date(
            Number(timestamp)
        ).toLocaleString();
    };


    return (

        <div className="content-card attendance-card">

            {/* HEADER */}

            <div className="card-header">

                <div>
                    <h2>Attendance</h2>

                    <p className="attendance-subtitle">
                        {role === "ADMIN"
                            ? "Manage employee attendance"
                            : "View and mark your attendance"}
                    </p>
                </div>


                {/* BOTH ADMIN + EMPLOYEE */}

                <button
                    className="primary-btn"
                    onClick={
                        handleMarkAttendance
                    }
                    disabled={loading}
                >

                    {loading
                        ? "Marking..."
                        : "Mark Attendance"}

                </button>

            </div>


            {/* ADMIN BUTTONS */}

            {role === "ADMIN" && (

                <div className="attendance-actions">

                    <button
                        className="primary-btn"
                        onClick={loadAttendance}
                    >
                        View Attendance
                    </button>


                    <button
                        className="primary-btn"
                        onClick={() => {
                            setShowInitiate(true);
                            setOtp(null);
                        }}
                    >
                        Initiate Attendance
                    </button>

                </div>
            )}


            {/* INITIATE ATTENDANCE MODAL */}

            {role === "ADMIN" &&
                showInitiate && (

                    <div className="modal-overlay">

                        <div className="modal">

                            <h2>
                                Initiate Attendance
                            </h2>


                            {/* DATE */}

                            <label>
                                Date
                            </label>

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


                            {/* DEPARTMENT */}

                            <label>
                                Department
                            </label>

                            <select
                                value={department}
                                onChange={(e) =>
                                    setDepartment(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="IT">
                                    IT
                                </option>

                                <option value="HR">
                                    HR
                                </option>

                                <option value="FINANCE">
                                    Finance
                                </option>

                                <option value="SALES">
                                    Sales
                                </option>

                            </select>


                            {/* GENERATE OTP */}

                            <button
                                className="primary-btn generate-otp-btn"
                                onClick={
                                    handleGenerateOtp
                                }
                            >
                                Generate OTP
                            </button>


                            {/* OTP */}

                            {otp && (

                                <div className="otp-display">

                                    <h3>
                                        Attendance OTP
                                    </h3>

                                    <strong>
                                        {otp.otp}
                                    </strong>

                                    <p>
                                        Valid for 5 minutes
                                    </p>

                                </div>
                            )}


                            {/* CLOSE */}

                            <div className="modal-buttons">

                                <button
                                    className="cancel-btn"
                                    onClick={() => {

                                        setShowInitiate(
                                            false
                                        );

                                        setOtp(null);

                                    }}
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>
                )}


            {/* ATTENDANCE TABLE */}

            <div className="attendance-table-container">

                <h3>
                    {role === "ADMIN"
                        ? "All Employee Attendance"
                        : "My Attendance"}
                </h3>


                {attendance.length === 0 ? (

                    <div className="no-attendance">
                        No attendance records found.
                    </div>

                ) : (

                    <table className="attendance-table">

                        <thead>

                            <tr>

                                <th>
                                    Employee ID
                                </th>

                                <th>
                                    Marked On
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {attendance.map(
                                (record) => (

                                    <tr
                                        key={record.uuid}
                                    >

                                        <td>
                                            {record.empId}
                                        </td>

                                        <td>
                                            {formatDate(
                                                record.markedOn
                                            )}
                                        </td>

                                        <td>

                                            <span
                                                className="status-present"
                                            >
                                                {record.status}
                                            </span>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>
                )}

            </div>

        </div>
    );
}

export default Attendance;