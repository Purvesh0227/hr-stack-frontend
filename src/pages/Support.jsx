import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiMail, FiPhone, FiX, FiMessageSquare, FiCheckCircle, FiClock, FiLock, FiPaperclip, FiTrash2, FiFileText, FiImage, FiVideo } from "react-icons/fi";
import { useNotification } from "../contexts/NotificationContext";
import { createSupportTicket, getMySupportTickets, getSupportTicketUploadUrl } from "../services/api";
import "../styles/global.css";
import { Helmet } from "react-helmet-async";

const MAX_FILES = 3;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = [
    "image/png", 
    "image/jpeg", 
    "application/pdf", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
    "video/mp4"
];

const formatSize = (bytes) =>
    bytes < 1024 * 1024
        ? `${Math.max(1, Math.round(bytes / 1024))} KB`
        : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

function Support() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const fileInputRef = useRef(null);
    
    // Check if user is logged in
    const isLoggedIn = Boolean(localStorage.getItem("token"));

    // Form state
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [attachments, setAttachments] = useState([]); // File objects
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // My Tickets state
    const [myTickets, setMyTickets] = useState([]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 900);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            const fetchMyTickets = async () => {
                try {
                    const { data } = await getMySupportTickets(0, 5);
                    setMyTickets(data.content || []);
                } catch (error) {
                    console.error("Failed to load tickets", error);
                }
            };
            fetchMyTickets();
        }
    }, [isLoggedIn]);

    const handleExit = () => {
        if (isLoggedIn) navigate("/"); else navigate("/login");
    };

    const handleFilePick = (e) => {
        const pickedFiles = Array.from(e.target.files || []);
        e.target.value = ""; // Reset so same file can be picked again

        for (const file of pickedFiles) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                showNotification("Invalid format. Only PDF, DOCX, PNG, JPG, or MP4 are allowed.", "error");
                return;
            }
            if (file.size > MAX_FILE_BYTES) {
                showNotification("File is too large. Max 5MB allowed.", "error");
                return;
            }
            if (attachments.length >= MAX_FILES) {
                showNotification(`Maximum ${MAX_FILES} files allowed.`, "error");
                return;
            }
        }

        setAttachments((prev) => [...prev, ...pickedFiles]);
    };

    const removeFile = (index) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) {
            showNotification("Please fill in all fields.", "error");
            return;
        }

        setLoading(true);
        try {
            // 1. Upload files to S3 (Temp Bucket)
            const uploadedFiles = [];
            for (const file of attachments) {
                // Get presigned URL from backend
                const { data } = await getSupportTicketUploadUrl(file.name, file.type);
                
                // Upload directly to S3
                await axios.put(data.uploadUrl, file, {
                    headers: { "Content-Type": file.type }
                });

                uploadedFiles.push({
                    objectKey: data.objectKey,
                    fileName: file.name,
                    contentType: file.type,
                    size: file.size
                });
            }

            // 2. Submit Ticket with attachment keys
            await createSupportTicket({ 
                subject, 
                message, 
                priority,
                attachments: uploadedFiles 
            });

            setSubmitted(true);
            showNotification("Ticket submitted successfully!", "success");
            setAttachments([]);
            
            // Refresh the ticket list
            const { data } = await getMySupportTickets(0, 5);
            setMyTickets(data.content || []);
        } catch (error) {
            showNotification(error.response?.data?.error || "Failed to submit ticket.", "error");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "12px 16px",
        borderRadius: "8px",
        border: "1px solid var(--border-color)",
        background: "var(--bg-page)",
        color: "var(--text-primary)",
        fontSize: "15px",
        outline: "none",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    };

    const labelStyle = {
        display: "block",
        marginBottom: "8px",
        fontSize: "14px",
        fontWeight: "600",
        color: "var(--text-primary)",
    };

    const FileIcon = ({ type }) => {
        if (type.includes("pdf")) return <FiFileText />;
        if (type.includes("video")) return <FiVideo />;
        return <FiImage />;
    };

    return (
        <>
            <Helmet>
                <title>Contact Support - HRStack</title>
                <meta name="description" content="Need help with HRStack? Submit a support ticket and our team will get back to you." />
            </Helmet>

            <div style={{ minHeight: "100vh", background: "var(--bg-page)", padding: isMobile ? "20px" : "40px", display: "flex", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: "1100px", display: "flex", flexDirection: "column", marginTop: "20px" }}>
                    
                    {/* TOP BAR */}
                    <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <button 
                            onClick={handleExit} 
                            style={{ 
                                display: "inline-flex", alignItems: "center", gap: "8px", 
                                padding: "8px 16px", background: "var(--bg-card)", 
                                border: "1px solid var(--border-color)", borderRadius: "99px", 
                                color: "var(--text-secondary)", cursor: "pointer", fontSize: "14px", 
                                fontWeight: "500", transition: "all 0.2s ease"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--border-strong)"}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--border-color)"}
                        >
                            <FiX size={16} /> Close Page
                        </button>
                    </div>

                    {/* HEADER */}
                    <div style={{ marginBottom: "50px", maxWidth: "600px" }}>
                        <h1 style={{ color: "var(--text-primary)", fontSize: isMobile ? "36px" : "48px", margin: "0 0 15px 0", fontWeight: "700", letterSpacing: "-1px" }}>
                            Contact Support
                        </h1>
                        <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "18px", lineHeight: "1.6" }}>
                            Have an issue or a question? Submit a ticket below and our HR team will get back to you as soon as possible.
                        </p>
                    </div>

                    {/* MAIN GRID */}
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.5fr", gap: "40px", alignItems: "start" }}>
                        
                        {/* LEFT COLUMN: Contact Info */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div style={{ padding: "24px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                                    <div style={{ padding: "10px", background: "rgba(59, 130, 246, 0.1)", borderRadius: "8px", color: "#3b82f6" }}>
                                        <FiMail size={20} />
                                    </div>
                                    <h3 style={{ margin: 0, color: "var(--text-primary)", fontSize: "18px" }}>Email Us</h3>
                                </div>
                                <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: "0 0 12px 0" }}>Our team is available to help 24/7.</p>
                                <a href="mailto:support@hrstack.com" style={{ color: "var(--accent-blue)", fontWeight: "600", textDecoration: "none", fontSize: "15px" }}>support@hrstack.com</a>
                            </div>

                            <div style={{ padding: "24px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                                    <div style={{ padding: "10px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "8px", color: "#10b981" }}>
                                        <FiPhone size={20} />
                                    </div>
                                    <h3 style={{ margin: 0, color: "var(--text-primary)", fontSize: "18px" }}>Call Us</h3>
                                </div>
                                <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: "0 0 12px 0" }}>Mon-Fri from 9am to 6pm.</p>
                                <a href="tel:+919999999999" style={{ color: "var(--accent-blue)", fontWeight: "600", textDecoration: "none", fontSize: "15px" }}>+91 99999 99999</a>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Form or Login Prompt */}
                        <div style={{ background: "var(--bg-card)", padding: isMobile ? "24px" : "40px", borderRadius: "16px", border: "1px solid var(--border-color)", boxShadow: "0 10px 40px rgba(0,0,0,0.03)" }}>
                            
                            {!isLoggedIn ? (
                                <div style={{ textAlign: "center", padding: "40px 0" }}>
                                    <div style={{ width: "64px", height: "64px", background: "rgba(59, 130, 246, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto", color: "#3b82f6" }}>
                                        <FiLock size={32} />
                                    </div>
                                    <h2 style={{ color: "var(--text-primary)", marginBottom: "10px", fontSize: "24px" }}>Sign in required</h2>
                                    <p style={{ color: "var(--text-secondary)", marginBottom: "30px", fontSize: "15px" }}>
                                        You need to be logged in to submit a support ticket.
                                    </p>
                                    <Link to="/login" style={{ display: "inline-block", padding: "12px 32px", background: "var(--bg-primary-btn)", color: "var(--text-on-active)", borderRadius: "8px", fontWeight: "600", textDecoration: "none", fontSize: "15px" }}>
                                        Go to Login
                                    </Link>
                                </div>
                            ) : submitted ? (
                                <div style={{ textAlign: "center", padding: "40px 0" }}>
                                    <div style={{ width: "64px", height: "64px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto", color: "#10b981" }}>
                                        <FiCheckCircle size={32} />
                                    </div>
                                    <h2 style={{ color: "var(--text-primary)", marginBottom: "10px", fontSize: "24px" }}>Ticket Submitted</h2>
                                    <p style={{ color: "var(--text-secondary)", marginBottom: "30px", fontSize: "15px" }}>
                                        Your ticket has been sent to our HR team.
                                    </p>
                                    <button onClick={() => { setSubmitted(false); setSubject(""); setMessage(""); }} style={{ padding: "12px 24px", background: "var(--bg-page)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)", cursor: "pointer", fontWeight: "600", fontSize: "15px" }}>
                                        Submit Another Ticket
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                                        <FiMessageSquare size={24} color="var(--accent-blue)" />
                                        <h2 style={{ margin: 0, color: "var(--text-primary)", fontSize: "22px" }}>Submit a Ticket</h2>
                                    </div>

                                    <div>
                                        <label style={labelStyle}>Subject</label>
                                        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Briefly describe the issue" style={inputStyle} required />
                                    </div>

                                    <div>
                                        <label style={labelStyle}>Priority</label>
                                        <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{...inputStyle, cursor: "pointer"}}>
                                            <option value="LOW">Low - General question</option>
                                            <option value="MEDIUM">Medium - Standard issue</option>
                                            <option value="HIGH">High - Blocking my work</option>
                                            <option value="URGENT">Urgent - System is down</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label style={labelStyle}>Message</label>
                                        <textarea rows="5" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Please provide as much detail as possible..." style={{...inputStyle, resize: "vertical"}} required />
                                    </div>

                                    {/* FILE UPLOAD SECTION */}
                                    <div>
                                        <label style={labelStyle}>
                                            Attachments 
                                            <span style={{ fontSize: "12px", color: "var(--text-secondary)", marginLeft: "8px" }}>
                                                ({attachments.length}/{MAX_FILES} · Max 5MB each · PDF, DOCX, PNG, JPG, MP4)
                                            </span>
                                        </label>

                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={attachments.length >= MAX_FILES}
                                            style={{
                                                display: "inline-flex", alignItems: "center", gap: "8px",
                                                padding: "10px 16px", borderRadius: "8px", cursor: "pointer",
                                                background: "transparent", color: "var(--text-primary)",
                                                border: "1px dashed var(--border-strong)", fontSize: "14px"
                                            }}
                                        >
                                            <FiPaperclip /> Add File
                                        </button>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            hidden
                                            multiple
                                            accept=".pdf,.docx,.png,.jpg,.jpeg,.mp4"
                                            onChange={handleFilePick}
                                        />

                                        {attachments.length > 0 && (
                                            <ul style={{ listStyle: "none", padding: 0, marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                                {attachments.map((file, index) => (
                                                    <li key={index} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: "var(--bg-page)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                                                        <span style={{ color: "var(--accent-blue)" }}><FileIcon type={file.type} /></span>
                                                        <span style={{ flex: 1, fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                                                        <small style={{ color: "var(--text-secondary)" }}>{formatSize(file.size)}</small>
                                                        <button type="button" onClick={() => removeFile(index)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--danger)" }}>
                                                            <FiTrash2 />
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <button type="submit" disabled={loading} style={{ padding: "14px", background: "var(--bg-primary-btn)", color: "var(--text-on-active)", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: "10px" }}>
                                        {loading ? "Uploading & Submitting..." : "Submit Ticket"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* BOTTOM SECTION: My Recent Tickets */}
                    {isLoggedIn && myTickets.length > 0 && (
                        <div style={{ marginTop: "60px" }}>
                            <h2 style={{ color: "var(--text-primary)", fontSize: "24px", marginBottom: "20px" }}>My Recent Tickets</h2>
                            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "16px", overflow: "hidden" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                    <thead>
                                        <tr style={{ background: "var(--bg-page)", borderBottom: "1px solid var(--border-color)" }}>
                                            <th style={{ padding: "16px 20px", color: "var(--text-secondary)", fontSize: "13px", fontWeight: "600" }}>Subject</th>
                                            <th style={{ padding: "16px 20px", color: "var(--text-secondary)", fontSize: "13px", fontWeight: "600" }}>Priority</th>
                                            <th style={{ padding: "16px 20px", color: "var(--text-secondary)", fontSize: "13px", fontWeight: "600" }}>Date</th>
                                            <th style={{ padding: "16px 20px", color: "var(--text-secondary)", fontSize: "13px", fontWeight: "600" }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myTickets.map((ticket) => (
                                            <tr key={ticket.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                                <td style={{ padding: "16px 20px", color: "var(--text-primary)", fontSize: "14px", fontWeight: "500" }}>{ticket.subject}</td>
                                                <td style={{ padding: "16px 20px", color: "var(--text-secondary)", fontSize: "14px" }}>{ticket.priority}</td>
                                                <td style={{ padding: "16px 20px", color: "var(--text-secondary)", fontSize: "14px" }}>{new Date(ticket.createdOn).toLocaleDateString()}</td>
                                                <td style={{ padding: "16px 20px" }}>
                                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: "600", background: ticket.status === "RESOLVED" ? "rgba(22, 163, 74, 0.1)" : "rgba(202, 138, 4, 0.1)", color: ticket.status === "RESOLVED" ? "#16a34a" : "#ca8a04" }}>
                                                        {ticket.status === "RESOLVED" ? <FiCheckCircle /> : <FiClock />} {ticket.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Support;