import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiPhone, FiX, FiClock } from "react-icons/fi";
import "../styles/global.css";

function Support() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleExit = () => {
        const isLoggedIn = localStorage.getItem("token") && localStorage.getItem("employee");
        if (isLoggedIn) navigate("/"); else navigate("/login");
    };

    const cardStyle = {
        display: "flex", 
        alignItems: "flex-start",
        flexDirection: "column",
        padding: "30px", 
        background: "var(--bg-card)", 
        border: "1px solid var(--border-color)", 
        borderRadius: "16px", 
        textDecoration: "none",
        transition: "all 0.2s ease",
        cursor: "pointer"
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-page)", padding: isMobile ? "20px" : "40px", display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: "1000px", display: "flex", flexDirection: "column", marginTop: "20px" }}>
                
                {/* EXIT BUTTON */}
                <div style={{ marginBottom: "40px" }}>
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
                        <FiX size={16} /> Exit
                    </button>
                </div>

                {/* HEADER */}
                <div style={{ marginBottom: "50px", textAlign: "center" }}>
                    <h1 style={{ color: "var(--text-primary)", fontSize: isMobile ? "36px" : "48px", margin: "0 0 15px 0", fontWeight: "700", letterSpacing: "-1px" }}>
                        Contact Support
                    </h1>
                    <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "18px" }}>
                        Our team is here to help you with any issues or questions.
                    </p>
                </div>

                {/* CONTACT CARDS */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px", marginBottom: "40px" }}>
                    
                    {/* Email Card */}
                    <a 
                        href="mailto:support@hrstack.com" 
                        style={cardStyle}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                        <div style={{ padding: "12px", background: "var(--bg-hover-row)", borderRadius: "12px", marginBottom: "20px", color: "var(--text-primary)" }}>
                            <FiMail size={24} />
                        </div>
                        <h3 style={{ color: "var(--text-primary)", fontSize: "20px", margin: "0 0 10px 0", fontWeight: "600" }}>Email Us</h3>
                        <p style={{ color: "var(--text-secondary)", margin: "0 0 20px 0", fontSize: "15px", lineHeight: "1.6" }}>
                            Our friendly team is here to help. We usually reply within 24 hours.
                        </p>
                        <span style={{ color: "var(--accent-blue)", fontWeight: "600", fontSize: "15px" }}>
                            support@hrstack.com
                        </span>
                    </a>

                    {/* Phone Card */}
                    <a 
                        href="tel:+919999999999" 
                        style={cardStyle}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                        <div style={{ padding: "12px", background: "var(--bg-hover-row)", borderRadius: "12px", marginBottom: "20px", color: "var(--text-primary)" }}>
                            <FiPhone size={24} />
                        </div>
                        <h3 style={{ color: "var(--text-primary)", fontSize: "20px", margin: "0 0 10px 0", fontWeight: "600" }}>Call Us</h3>
                        <p style={{ color: "var(--text-secondary)", margin: "0 0 20px 0", fontSize: "15px", lineHeight: "1.6" }}>
                            Our team is available to assist you over the phone during business hours.
                        </p>
                        <span style={{ color: "var(--accent-blue)", fontWeight: "600", fontSize: "15px" }}>
                            +91 99999 99999
                        </span>
                    </a>
                </div>

                {/* HOURS BANNER */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "20px", background: "var(--bg-hover-row)", borderRadius: "12px", border: "1px solid var(--border-color)", color: "var(--text-secondary)", fontSize: "15px" }}>
                    <FiClock size={20} color="var(--text-primary)" />
                    <span><strong>Support Hours:</strong> Monday to Friday, 9:00 AM to 6:00 PM IST.</span>
                </div>

            </div>
        </div>
    );
}

export default Support;