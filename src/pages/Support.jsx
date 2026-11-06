import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiPhone, FiX, FiMessageSquare, FiCheckCircle, FiClock } from "react-icons/fi";
import { useNotification } from "../contexts/NotificationContext";
import { createSupportTicket, getMySupportTickets } from "../services/api";
import "../styles/global.css";

function Support() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    
    // Form state
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // My Tickets state
    const [myTickets, setMyTickets] = useState([]);
    const [, setLoadingTickets] = useState(true);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 900);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const fetchMyTickets = async () => {
        try {
            const { data } = await getMySupportTickets(0, 5);
            setMyTickets(data.content);
        } catch (error) {
            console.error("Failed to load tickets", error);
        } finally {
            setLoadingTickets(false);
        }
    };

    useEffect(() => {
        // Only fetch if logged in
        if (localStorage.getItem("token")) {
            fetchMyTickets();
        }
    }, []);

    const handleExit = () => {
        const isLoggedIn = localStorage.getItem("token") && localStorage.getItem("employee");
        if (isLoggedIn) navigate("/"); else navigate("/login");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) {
            showNotification("Please fill in all fields.", "error");
            return;
        }

        setLoading(true);
        try {
            await createSupportTicket({ subject, message, priority });
            setSubmitted(true);
            showNotification("Ticket submitted successfully!", "success");
            fetchMyTickets(); // Refresh the ticket list
        } catch (error) {
            showNotification(error.response?.data?.error || "Failed to submit ticket.", "error");
        } finally {
            setLoading(false);
        }
    };

    // Input styles for a clean, modern look
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

    return (
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

                {/* MAIN GRID: Left (Contact) / Right (Form) */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.5fr", gap: "40px", alignItems: "start" }}>
                    
                    {/* LEFT COLUMN: Contact Info */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        
                        {/* Email Card */}
                        <div style={{ padding: "24px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                                <div style={{ padding: "10px", background: "rgba(59, 130, 246, 0.1)", borderRadius: "8px", color: "#3b82f6" }}>
                                    <FiMail size={20} />
                                </div>
                                <h3 style={{ margin: 0, color: "var(--text-primary)", fontSize: "18px" }}>Email Us</h3>
                            </div>
                            <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: "0 0 12px 0", lineHeight: "1.5" }}>
                                Our team is available to help 24/7.
                            </p>
                            <a href="mailto:support@hrstack.com" style={{ color: "var(--accent-blue)", fontWeight: "600", textDecoration: "none", fontSize: "15px" }}>
                                support@hrstack.com
                            </a>
                        </div>

                        {/* Phone Card */}
                        <div style={{ padding: "24px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                                <div style={{ padding: "10px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "8px", color: "#10b981" }}>
                                    <FiPhone size={20} />
                                </div>
                                <h3 style={{ margin: 0, color: "var(--text-primary)", fontSize: "18px" }}>Call Us</h3>
                            </div>
                            <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: "0 0 12px 0", lineHeight: "1.5" }}>
                                Mon-Fri from 9am to 6pm.
                            </p>
                            <a href="tel:+919999999999" style={{ color: "var(--accent-blue)", fontWeight: "600", textDecoration: "none", fontSize: "15px" }}>
                                +91 99999 99999
                            </a>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Form */}
                    <div style={{ background: "var(--bg-card)", padding: "40px", borderRadius: "16px", border: "1px solid var(--border-color)", boxShadow: "0 10px 40px rgba(0,0,0,0.03)" }}>
                        
                        {submitted ? (
                            <div style={{ textAlign: "center", padding: "40px 0" }}>
                                <div style={{ width: "64px", height: "64px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto", color: "#10b981" }}>
                                    <FiCheckCircle size={32} />
                                </div>
                                <h2 style={{ color: "var(--text-primary)", marginBottom: "10px", fontSize: "24px" }}>Ticket Submitted</h2>
                                <p style={{ color: "var(--text-secondary)", marginBottom: "30px", fontSize: "15px" }}>
                                    Your ticket has been sent to our HR team. We will contact you shortly.
                                </p>
                                <button 
                                    onClick={() => { setSubmitted(false); setSubject(""); setMessage(""); }} 
                                    style={{ padding: "12px 24px", background: "var(--bg-page)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)", cursor: "pointer", fontWeight: "600", fontSize: "15px" }}
                                >
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
                                    <input 
                                        type="text" 
                                        value={subject} 
                                        onChange={(e) => setSubject(e.target.value)} 
                                        placeholder="Briefly describe the issue" 
                                        style={inputStyle}
                                        onFocus={(e) => e.target.style.borderColor = "var(--accent-blue)"}
                                        onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
                                        required 
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>Priority</label>
                                    <select 
                                        value={priority} 
                                        onChange={(e) => setPriority(e.target.value)} 
                                        style={{...inputStyle, cursor: "pointer"}}
                                        onFocus={(e) => e.target.style.borderColor = "var(--accent-blue)"}
                                        onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
                                    >
                                        <option value="LOW">Low - General question</option>
                                        <option value="MEDIUM">Medium - Standard issue</option>
                                        <option value="HIGH">High - Blocking my work</option>
                                        <option value="URGENT">Urgent - System is down</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label style={labelStyle}>Message</label>
                                    <textarea 
                                        rows="5" 
                                        value={message} 
                                        onChange={(e) => setMessage(e.target.value)} 
                                        placeholder="Please provide as much detail as possible..." 
                                        style={{...inputStyle, resize: "vertical"}}
                                        onFocus={(e) => e.target.style.borderColor = "var(--accent-blue)"}
                                        onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
                                        required 
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    style={{ 
                                        padding: "14px", 
                                        background: "var(--bg-primary-btn)", 
                                        color: "var(--text-on-active)", 
                                        border: "none", 
                                        borderRadius: "8px", 
                                        fontSize: "16px", 
                                        fontWeight: "600", 
                                        cursor: loading ? "not-allowed" : "pointer", 
                                        opacity: loading ? 0.7 : 1,
                                        marginTop: "10px"
                                    }}
                                >
                                    {loading ? "Submitting..." : "Submit Ticket"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* BOTTOM SECTION: My Recent Tickets */}
                {localStorage.getItem("token") && myTickets.length > 0 && (
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
                                            <td style={{ padding: "16px 20px", color: "var(--text-secondary)", fontSize: "14px" }}>
                                                {new Date(ticket.createdOn).toLocaleDateString()}
                                            </td>
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
    );
}

export default Support;