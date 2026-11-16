import { useState, useEffect } from "react";
import { Navigate, useOutletContext } from "react-router-dom";
import { FiCheckCircle, FiClock, FiUser, FiMail, FiPhone, FiChevronDown, FiChevronUp, FiPaperclip, FiFileText, FiImage, FiVideo } from "react-icons/fi";
import { getAdminSupportTickets, updateSupportTicketStatus, getSupportAttachmentViewUrl } from "../../services/api";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import AttachmentViewer from "../../components/common/AttachmentViewer";
import Pagination from "../../components/Pagination";

const formatDateTime = (millis) =>
    millis ? new Date(millis).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "-";

const formatSize = (bytes) =>
    bytes < 1024 * 1024
        ? `${Math.max(1, Math.round(bytes / 1024))} KB`
        : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

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

    const [viewingFile, setViewingFile] = useState(null);

    useEffect(() => {
        if (role === "ADMIN") {
            fetchTickets();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, page, role]);

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

    const handleUpdateStatus = async (e, ticketId, newStatus) => {
        e.stopPropagation();
        if (newStatus === "RESOLVED" && !window.confirm("Mark this ticket as RESOLVED?")) return;
        
        try {
            setResolvingId(ticketId); 
            await updateSupportTicketStatus(ticketId, newStatus);
            showNotification(`Status updated to ${newStatus}`, "success");
            fetchTickets(); 
        } catch {
            showNotification("Failed to update status", "error");
        } finally {
            setResolvingId(null); 
        }
    };

    const handleOpenAttachment = async (e, ticketId, file) => {
        e.stopPropagation(); 
        try {
            const { data } = await getSupportAttachmentViewUrl(ticketId, file.id);
            setViewingFile({ ...file, url: data.url });
        } catch {
            showNotification("Unable to load file", "error");
        }
    };

    const toggleExpand = (id) => {
        setOpenTicketId(openTicketId === id ? null : id);
    };

    const FileIcon = ({ type }) => {
        if (type.includes("pdf") || type.includes("word")) return <FiFileText />;
        if (type.includes("video")) return <FiVideo />;
        return <FiImage />;
    };

    return (
        <div className="attendance-page">
            <div className="attendance-page-header">
                <div>
                    <p className="dashboard-eyebrow">Admin Dashboard</p>
                    <h1>Support Tickets</h1>
                    <p className="attendance-page-subtitle">
                        Manage employee issues and support requests.
                    </p>
                </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
                {["ALL", "OPEN", "TODO", "IN_PROGRESS", "READY_FOR_REVIEW", "RESOLVED"].map((status) => (
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
                        {status.replace("_", " ")}
                    </button>
                ))}
            </div>

            <div className="attendance-card" style={{ padding: "20px" }}>
                {loading ? (
                    <Loader />
                ) : tickets.length === 0 ? (
                    <p style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                        No {filter !== "ALL" ? filter.toLowerCase().replace("_", " ") : ""} tickets found.
                    </p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        {tickets.map((ticket) => {
                            const pStyle = getPriorityStyle(ticket.priority);
                            const isExpanded = openTicketId === ticket.id;
                            const isResolving = resolvingId === ticket.id;

                            return (
                                <div key={ticket.id} style={{ border: "1px solid var(--border-color)", borderRadius: "10px", overflow: "hidden", background: "var(--bg-card)" }}>
                                    
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
                                            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: "600", color: ticket.status === "RESOLVED" ? "#16a34a" : "#ca8a04" }}>
                                                {ticket.status === "RESOLVED" ? <FiCheckCircle /> : <FiClock />} {ticket.status.replace("_", " ")}
                                            </span>
                                            {isExpanded ? <FiChevronUp color="var(--text-secondary)" /> : <FiChevronDown color="var(--text-secondary)" />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div style={{ padding: "20px", borderTop: "1px solid var(--border-color)", background: "var(--bg-card)" }}>
                                            
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

                                            {/* Admin Status Dropdown */}
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                                                <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>Update Status:</label>
                                                <select 
                                                    value={ticket.status} 
                                                    onChange={(e) => handleUpdateStatus(e, ticket.id, e.target.value)}
                                                    disabled={isResolving}
                                                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-page)", color: "var(--text-primary)", cursor: "pointer" }}
                                                >
                                                    <option value="OPEN">OPEN</option>
                                                    <option value="TODO">TODO</option>
                                                    <option value="IN_PROGRESS">IN PROGRESS</option>
                                                    <option value="READY_FOR_REVIEW">READY FOR REVIEW</option>
                                                    <option value="RESOLVED">RESOLVED</option>
                                                </select>
                                            </div>

                                            <div style={{ padding: "16px", background: "var(--bg-page)", borderLeft: "4px solid var(--accent-blue)", borderRadius: "4px", color: "var(--text-primary)", lineHeight: "1.6", fontSize: "14px", whiteSpace: "pre-wrap", marginBottom: "20px" }}>
                                                {ticket.message}
                                            </div>

                                            {/* Status History Timeline */}
                                            {ticket.statusHistory && ticket.statusHistory.length > 0 && (
                                                <div style={{ marginBottom: "20px", padding: "16px", background: "var(--bg-page)", borderRadius: "8px" }}>
                                                    <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "var(--text-primary)" }}>Status History</h4>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                        {ticket.statusHistory.map((h, idx) => (
                                                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: idx !== ticket.statusHistory.length - 1 ? "1px solid var(--border-color)" : "none", paddingBottom: "4px" }}>
                                                                <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{h.status.replace("_", " ")}</span>
                                                                <span style={{ color: "var(--text-secondary)" }}>{formatDateTime(h.changedOn)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* RENDER ATTACHMENTS */}
                                            {ticket.attachments && ticket.attachments.length > 0 && (
                                                <div style={{ marginBottom: "20px" }}>
                                                    <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "var(--text-primary)" }}>
                                                        <FiPaperclip /> Attachments
                                                    </h4>
                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                                        {ticket.attachments.map((file) => (
                                                            <button
                                                                key={file.id}
                                                                onClick={(e) => handleOpenAttachment(e, ticket.id, file)}
                                                                style={{
                                                                    display: "inline-flex", alignItems: "center", gap: "8px",
                                                                    padding: "8px 12px", borderRadius: "8px", cursor: "pointer",
                                                                    background: "var(--bg-page)", border: "1px solid var(--border-color)",
                                                                    color: "var(--text-primary)", fontSize: "13px"
                                                                }}
                                                            >
                                                                <FileIcon type={file.contentType} />
                                                                <span style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                    {file.fileName}
                                                                </span>
                                                                <small style={{ color: "var(--text-secondary)" }}>({formatSize(file.size)})</small>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

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

            {!loading && tickets.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
            )}

            {viewingFile && (
                <AttachmentViewer
                    file={viewingFile}
                    url={viewingFile.url}
                    onClose={() => setViewingFile(null)}
                />
            )}
        </div>
    );
}

export default SupportTicketsPage;