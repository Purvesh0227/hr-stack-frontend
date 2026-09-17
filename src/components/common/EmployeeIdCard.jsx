function EmployeeIdCard({ employee }) {
    if (!employee) {
        return null;
    }

    const styles = {
        card: {
            width: "340px",
            minHeight: "520px",
            background: "#ffffff",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
            border: "1px solid #e0e0e0",
            fontFamily: "Arial, sans-serif",
            margin: "20px auto",
        },

        header: {
            background: "#1f2937",
            color: "#ffffff",
            padding: "20px",
            textAlign: "center",
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
        },

        photo: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
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
        },

        footerText: {
            margin: 0,
            fontSize: "11px",
            color: "#6b7280",
            letterSpacing: "1px",
        },
    };

    return (
        <div style={styles.card}>

            {/* Header */}
            <div style={styles.header}>

                <h2 style={styles.companyName}>
                    HR-STACK
                </h2>

                <p style={styles.cardTitle}>
                    ID CARD
                </p>

            </div>

            {/* Body */}
            <div style={styles.body}>

                {/* Profile Photo */}
                <div style={styles.photoContainer}>

                    {employee.profilePhotoUrl ? (
                        <img
                            src={employee.profilePhotoUrl}
                            alt="Employee"
                            style={styles.photo}
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

            {/* Footer */}
            <div style={styles.footer}>

                <p style={styles.footerText}>
                    • HR-STACK • 
                </p>

            </div>

        </div>
    );
}

export default EmployeeIdCard;