import { useState, useEffect } from "react";
import { Navigate, useOutletContext } from "react-router-dom";
import { FiCheckCircle, FiClock, FiUser, FiMail, FiPhone, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { getAdminSupportTickets, updateSupportTicketStatus } from "../../services/api";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";

const formatDateTime = (millis) =>
    millis ? new Date(millis).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "-";

// Priority Color Mapping
const getPriorityStyle = (priority) => {
    switch (priority) {
        case "URGENT": return { bg: "rgba(220, 38, 38, 0.1)", color: "#dc2626", border: "1px solid rgba(220, 38, 38, 0.2)" };
        case "HIGH": return { bg: "rgba(234, 88, 12, 0.1)", color: "#ea580c", border: "1px solid rgba(234, 88, 12, 0.2)" };
        case "MEDIUM": return { bg: "rgba(202, 138, 4, 0.1)", color: "#ca8a04", border: "1px solid rgba(202, 138, 4, 0.2)" };
        default: return { bg: "rgba(22, 163, 74, 0.1)", color: "#16a34a", border: "1px solid rgba(22, 163, 74, 0.2)" };
    }
};

function SupportTicketsPage() {
    const { role } = useOutletContext(); 
    const { showNotification } = useNotification(); 
    
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL"); 
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [openTicketId, setOpenTicketId] = useState(null);
    const [resolvingId, setResolvingId] = useState(null);

    // 1. ALL HOOKS GO FIRST
    useEffect(() => {
        // Only fetch if user is ADMIN (prevents 403 errors for employees)
        if (role === "ADMIN") {
            fetchTickets();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, page, role]);

    // 2. SECURITY CHECK GOES AFTER HOOKS
    if (role !== "ADMIN") {
        return <Navigate to="/" replace />;
    }

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const { data } = await getAdminSupportTickets(filter, page - 1, 10);
            setTickets(data.content);
            setTotalPages(data.totalPages);
        } catch {
            showNotification("Failed to load tickets", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (e, ticketId) => {
        e.stopPropagation(); 
        if (!window.confirm("Mark this ticket as RESOLVED?")) return;
        
        try {
            setResolvingId(ticketId); 
            await updateSupportTicketStatus(ticketId, "RESOLVED");
            showNotification("Ticket resolved successfully", "success");
            fetchTickets(); 
        } catch {
            showNotification("Failed to update status", "error");
        } finally {
            setResolvingId(null); 
        }
    };

    const toggleExpand = (id) => {
        setOpenTicketId(openTicketId === id ? null : id);
    };

    return (
        <div className="attendance-page">
            {/* Header */}
            <div className="attendance-page-header">
                <div>
                    <p className="dashboard-eyebrow">Admin Dashboard</p>
                    <h1>Support Tickets</h1>
                    <p className="attendance-page-subtitle">
                        Manage employee issues and support requests.
                    </p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                {["ALL", "OPEN", "RESOLVED"].map((status) => (
                    <button
                        key={status}
                        onClick={() => { setFilter(status); setPage(1); }}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: "1px solid var(--border-color)",
                            background: filter === status ? "var(--bg-primary-btn)" : "var(--bg-card)",
                            color: filter === status ? "var(--text-on-active)" : "var(--text-secondary)",
                            fontWeight: "600",
                            cursor: "pointer"
                        }}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Tickets List */}
            <div className="attendance-card" style={{ padding: "20px" }}>
                {loading ? (
                    <Loader />
                ) : tickets.length === 0 ? (
                    <p style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                        No {filter !== "ALL" ? filter.toLowerCase() : ""} tickets found.
                    </p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        {tickets.map((ticket) => {
                            const pStyle = getPriorityStyle(ticket.priority);
                            const isExpanded = openTicketId === ticket.id;
                            const isResolving = resolvingId === ticket.id;

                            return (
                                <div key={ticket.id} style={{ border: "1px solid var(--border-color)", borderRadius: "10px", overflow: "hidden", background: "var(--bg-card)" }}>
                                    
                                    {/* Ticket Header (Click to Expand) */}
                                    <div
                                        onClick={() => toggleExpand(ticket.id)}
                                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", cursor: "pointer", background: isExpanded ? "var(--bg-hover-row)" : "transparent" }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                            <span style={{ padding: "4px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: "700", background: pStyle.bg, color: pStyle.color, border: pStyle.border }}>
                                                {ticket.priority}
                                            </span>
                                            <div>
                                                <strong style={{ color: "var(--text-primary)", fontSize: "15px", display: "block" }}>{ticket.subject}</strong>
                                                <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>{ticket.employeeName} • {formatDateTime(ticket.createdOn)}</span>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                            
                                            {/* QUICK RESOLVE BUTTON WITH LOADER */}
                                            {ticket.status !== "RESOLVED" && (
                                                <button
                                                    onClick={(e) => handleResolve(e, ticket.id)}
                                                    disabled={isResolving}
                                                    style={{ 
                                                        display: "flex", alignItems: "center", gap: "6px",
                                                        padding: "6px 12px", borderRadius: "6px", 
                                                        background: isResolving ? "var(--bg-page)" : "transparent", 
                                                        border: "1px solid #16a34a", 
                                                        color: "#16a34a", fontSize: "12px", fontWeight: "600", 
                                                        cursor: isResolving ? "not-allowed" : "pointer", 
                                                        transition: "all 0.2s ease" 
                                                    }}
                                                    onMouseOver={(e) => { 
                                                        if(!isResolving) {
                                                            e.currentTarget.style.background = "#16a34a"; 
                                                            e.currentTarget.style.color = "#fff"; 
                                                        }
                                                    }}
                                                    onMouseOut={(e) => { 
                                                        if(!isResolving) {
                                                            e.currentTarget.style.background = "transparent"; 
                                                            e.currentTarget.style.color = "#16a34a"; 
                                                        }
                                                    }}
                                                >
                                                    {/* Tiny Spinner */}
                                                    {isResolving ? (
                                                        <>
                                                            <span style={{ width: "12px", height: "12px", border: "2px solid #16a34a", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                                                            Resolving...
                                                        </>
                                                    ) : (
                                                        "Resolve"
                                                    )}
                                                </button>
                                            )}

                                            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: "600", color: ticket.status === "RESOLVED" ? "#16a34a" : "#ca8a04" }}>
                                                {ticket.status === "RESOLVED" ? <FiCheckCircle /> : <FiClock />} {ticket.status}
                                            </span>
                                            
                                            {isExpanded ? <FiChevronUp color="var(--text-secondary)" /> : <FiChevronDown color="var(--text-secondary)" />}
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div style={{ padding: "20px", borderTop: "1px solid var(--border-color)", background: "var(--bg-card)" }}>
                                            
                                            {/* Contact Info */}
                                            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "20px", padding: "12px", background: "var(--bg-page)", borderRadius: "8px", fontSize: "13px" }}>
                                                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                                                    <FiUser /> {ticket.employeeName}
                                                </span>
                                                <a href={`mailto:${ticket.employeeEmail}`} style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent-blue)", textDecoration: "none" }}>
                                                    <FiMail /> {ticket.employeeEmail}
                                                </a>
                                                <a href={`tel:${ticket.employeeMobile}`} style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent-blue)", textDecoration: "none" }}>
                                                    <FiPhone /> {ticket.employeeMobile}
                                                </a>
                                            </div>

                                            {/* Message */}
                                            <div style={{ padding: "16px", background: "var(--bg-page)", borderLeft: "4px solid var(--accent-blue)", borderRadius: "4px", color: "var(--text-primary)", lineHeight: "1.6", fontSize: "14px", whiteSpace: "pre-wrap", marginBottom: "20px" }}>
                                                {ticket.message}
                                            </div>

                                            {/* Resolved Info */}
                                            {ticket.status === "RESOLVED" && ticket.resolvedOn && (
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#16a34a", fontSize: "13px", fontWeight: "500" }}>
                                                    <FiCheckCircle /> Resolved on {formatDateTime(ticket.resolvedOn)}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && tickets.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
            )}

            {/* Inline keyframes for the loader */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default SupportTicketsPage;