import {
    forwardRef,
    useImperativeHandle,
    useRef,
    useState
} from "react";

const EmployeeIdCard = forwardRef(function EmployeeIdCard(
    { employee },
    ref
) {
    const [showBack, setShowBack] = useState(false);

    const frontCaptureRef = useRef(null);
    const backCaptureRef = useRef(null);

    useImperativeHandle(ref, () => ({
        getFrontElement: () => frontCaptureRef.current,
        getBackElement: () => backCaptureRef.current,
    }));

    if (!employee) {
        return null;
    }

    const styles = {
        card: {
            width: "340px",
            height: "520px",
            background: "#ffffff",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
            border: "1px solid #e0e0e0",
            fontFamily: "Arial, sans-serif",
            margin: "20px auto 0",
            boxSizing: "border-box",
        },

        header: {
            background: "#1f2937",
            color: "#ffffff",
            padding: "20px",
            textAlign: "center",
            boxSizing: "border-box",
        },

        companyName: {
            margin: 0,
            fontSize: "24px",
            fontWeight: "700",
            letterSpacing: "1px",
        },

        cardTitle: {
            margin: "6px 0 0",
            fontSize: "12px",
            letterSpacing: "2px",
            opacity: 0.85,
        },

        body: {
            padding: "25px 25px 20px",
            textAlign: "center",
            boxSizing: "border-box",
        },

        photoContainer: {
            width: "120px",
            height: "120px",
            margin: "0 auto 18px",
            borderRadius: "50%",
            overflow: "hidden",
            border: "4px solid #e5e7eb",
            background: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
        },

        photo: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
        },

        photoPlaceholder: {
            fontSize: "13px",
            color: "#6b7280",
        },

        employeeName: {
            margin: "5px 0",
            fontSize: "22px",
            fontWeight: "700",
            color: "#111827",
        },

        designation: {
            margin: "5px 0 22px",
            fontSize: "14px",
            color: "#6b7280",
        },

        details: {
            textAlign: "left",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "15px",
        },

        detailRow: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "15px",
            padding: "9px 0",
            borderBottom: "1px solid #f0f0f0",
            fontSize: "13px",
        },

        detailLabel: {
            fontWeight: "600",
            color: "#374151",
            whiteSpace: "nowrap",
        },

        detailValue: {
            color: "#6b7280",
            textAlign: "right",
            wordBreak: "break-word",
        },

        footer: {
            marginTop: "10px",
            padding: "14px",
            background: "#f9fafb",
            textAlign: "center",
            borderTop: "1px solid #e5e7eb",
            boxSizing: "border-box",
        },
        footerText: {
            margin: 0,
            fontSize: "11px",
            color: "#6b7280",
            letterSpacing: "1px",
        },

        backBody: {
            padding: "20px 25px 10px",
            textAlign: "left",
            boxSizing: "border-box",
        },

        backSection: {
            marginBottom: "14px",
        },

        backHeading: {
            margin: "0 0 10px",
            fontSize: "16px",
            fontWeight: "700",
            color: "#111827",
            textAlign: "center",
        },

        companyInfo: {
            margin: "7px 0",
            fontSize: "12px",
            lineHeight: "1.6",
            color: "#4b5563",
            textAlign: "center",
        },

        termsList: {
            margin: 0,
            paddingLeft: "18px",
            color: "#4b5563",
            fontSize: "11px",
            lineHeight: "1.45",
        },

        switchButton: {
            width: "340px",
            display: "block",
            margin: "0 auto",
            padding: "11px",
            border: "none",
            borderRadius: "0 0 10px 10px",
            background: "#1f2937",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
            boxSizing: "border-box",
        },
    };

    const renderHeader = (title) => (
        <div style={styles.header}>
            <h2 style={styles.companyName}>
                HR-STACK
            </h2>

            <p style={styles.cardTitle}>
                {title}
            </p>
        </div>
    );

    const renderFront = () => (
        <>
            {renderHeader("ID CARD")}

            <div style={styles.body}>

                {/* Profile Photo */}
                <div style={styles.photoContainer}>

                    {employee.profilePhotoUrl ? (
                        <img
                            src={employee.profilePhotoUrl}
                            alt="Employee"
                            style={styles.photo}
                            crossOrigin="anonymous"
                        />
                    ) : (
                        <span style={styles.photoPlaceholder}>
                            No Photo
                        </span>
                    )}

                </div>

                {/* Employee Name */}
                <h3 style={styles.employeeName}>
                    {employee.firstName || ""}{" "}
                    {employee.lastName || ""}
                </h3>

                {/* Designation */}
                <p style={styles.designation}>
                    {employee.designation ||
                        employee.role ||
                        "-"}
                </p>

                {/* Employee Details */}
                <div style={styles.details}>

                    <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>
                            Employee ID
                        </span>

                        <span style={styles.detailValue}>
                            {employee.empId || "-"}
                        </span>
                    </div>

                    <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>
                            Phone
                        </span>

                        <span style={styles.detailValue}>
                            {employee.mobile || "-"}
                        </span>
                    </div>

                    <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>
                            Email
                        </span>

                        <span style={styles.detailValue}>
                            {employee.email || "-"}
                        </span>
                    </div>

                </div>

            </div>

            <div style={styles.footer}>
                <p style={styles.footerText}>
                    • HR-STACK •
                </p>
            </div>
        </>
    );

    const renderBack = () => (
        <>
            {renderHeader("INFORMATION")}

            <div style={styles.backBody}>

                {/* Company Information */}
                <div style={styles.backSection}>

                    <p style={styles.companyInfo}>
                        HR-STACK
                    </p>

                    <p style={styles.companyInfo}>
                        This identity card is issued to the
                        authorized employee of HR-STACK.
                    </p>

                </div>

                {/* Terms & Conditions */}
                <div style={styles.backSection}>

                    <h3 style={styles.backHeading}>
                        TERMS & CONDITIONS
                    </h3>

                    <ul style={styles.termsList}>

                        <li>
                            This ID card is the property of HR-STACK.
                        </li>

                        <li>
                            The card must not be transferred or
                            used by another person.
                        </li>

                        <li>
                            The employee should carry the ID card
                            when required.
                        </li>

                        <li>
                            Any loss or damage must be reported
                            to the HR department.
                        </li>

                        <li>
                            The ID card must be returned when
                            employment ends.
                        </li>

                        <li>
                            Unauthorized use of this card is
                            prohibited.
                        </li>

                    </ul>

                </div>

                {/* If Found */}
                <div style={styles.backSection}>

                    <h3 style={styles.backHeading}>
                        IF FOUND
                    </h3>

                    <p style={styles.companyInfo}>
                        Please return this card to HR-STACK
                        administration.
                    </p>
                    <br></br>

                </div>

            </div>

            <div style={styles.footer}>
                <p style={styles.footerText}>
                    • HR-STACK •
                </p>
            </div>
        </>
    );

    return (
        <>
            {/* =====================================================
                VISIBLE ID CARD
            ====================================================== */}

            <div style={styles.card}>

                {showBack
                    ? renderBack()
                    : renderFront()
                }

            </div>

            {/* =====================================================
                FRONT / BACK SWITCH BUTTON
            ====================================================== */}

            <button
                type="button"
                onClick={() => setShowBack(!showBack)}
                style={styles.switchButton}
            >
                {showBack
                    ? "View Front Side"
                    : "View Back Side"}
            </button>

            <div
                style={{
                    position: "fixed",
                    left: "-10000px",
                    top: "0",
                    width: "340px",
                    pointerEvents: "none",
                    opacity: 1,
                }}
            >

                {/* FRONT CAPTURE */}
                <div
                    ref={frontCaptureRef}
                    style={{
                        ...styles.card,
                        margin: 0,
                        boxShadow: "none",
                        borderRadius: "16px",
                    }}
                >
                    {renderFront()}
                </div>

                {/* BACK CAPTURE */}
                <div
                    ref={backCaptureRef}
                    style={{
                        ...styles.card,
                        margin: "20px 0 0",
                        boxShadow: "none",
                        borderRadius: "16px",
                    }}
                >
                    {renderBack()}
                </div>

            </div>
        </>
    );
});

export default EmployeeIdCard;