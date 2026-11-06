import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiPhone } from "react-icons/fi";
import "../styles/global.css";

function Support() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div style={{ 
            minHeight: "100vh", 
            background: "var(--bg-page)", 
            padding: isMobile ? "30px 15px" : "60px 20px",
            display: "flex",
            justifyContent: "center"
        }}>
            <div 
                className="content-card" 
                style={{ 
                    width: "100%", 
                    maxWidth: "850px", 
                    padding: isMobile ? "25px" : "50px", 
                    background: "var(--bg-card)", 
                    borderRadius: "16px", 
                    border: "1px solid var(--border-color)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
                }}
            >
                {/* TOP NAVIGATION */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px", flexWrap: "wrap", gap: "10px" }}>
                    <Link 
                        to="/login" 
                        style={{ color: "var(--text-secondary)", textDecoration: "none", fontWeight: "600", display: "flex", alignItems: "center", gap: "5px" }}
                    >
                        ← Back to Login
                    </Link>
                    <Link 
                        to="/" 
                        style={{ color: "var(--accent-blue)", textDecoration: "none", fontWeight: "600" }}
                    >
                        Go to Dashboard →
                    </Link>
                </div>

                <div style={{ textAlign: "center", marginBottom: isMobile ? "30px" : "40px" }}>
                    <h1 style={{ color: "var(--text-primary)", fontSize: isMobile ? "26px" : "32px", margin: "0 0 10px 0", letterSpacing: "-0.5px" }}>
                        Raise a Support Ticket
                    </h1>
                    <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "15px" }}>
                        Need help with HR-Stack? We are here for you.
                    </p>
                </div>

                {/* Cards - Grid on desktop, stacked on mobile */}
                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", 
                    gap: "20px", 
                    marginBottom: "40px" 
                }}>
                    
                    {/* Email Card */}
                    <div style={{ padding: "25px", background: "var(--bg-hover-row)", borderRadius: "12px", border: "1px solid var(--border-color)", textAlign: "center" }}>
                        <div style={{ width: "50px", height: "50px", background: "var(--bg-page)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px auto", color: "var(--accent-blue)" }}>
                            <FiMail size={24} />
                        </div>
                        <h3 style={{ margin: "0 0 10px 0", color: "var(--text-primary)" }}>Email Support</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "15px" }}>Send us an email and we will reply within 24 hours.</p>
                        
                        {/* Styled as a button for mobile users */}
                        <a 
                            href="mailto:support@hrstack.com" 
                            style={{ 
                                display: "inline-block", 
                                padding: "10px 20px", 
                                background: "var(--bg-primary-btn)", 
                                color: "var(--text-on-active)", 
                                borderRadius: "8px", 
                                textDecoration: "none", 
                                fontWeight: "600" 
                            }}
                        >
                            Send Email
                        </a>
                    </div>

                    {/* Phone Card */}
                    <div style={{ padding: "25px", background: "var(--bg-hover-row)", borderRadius: "12px", border: "1px solid var(--border-color)", textAlign: "center" }}>
                        <div style={{ width: "50px", height: "50px", background: "var(--bg-page)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px auto", color: "var(--accent-blue)" }}>
                            <FiPhone size={24} />
                        </div>
                        <h3 style={{ margin: "0 0 10px 0", color: "var(--text-primary)" }}>Call Us</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "15px" }}>Available Mon-Fri, 9:00 AM to 6:00 PM.</p>
                        
                        {/* Styled as a button for mobile users */}
                        <a 
                            href="tel:+919999999999" 
                            style={{ 
                                display: "inline-block", 
                                padding: "10px 20px", 
                                background: "var(--bg-primary-btn)", 
                                color: "var(--text-on-active)", 
                                borderRadius: "8px", 
                                textDecoration: "none", 
                                fontWeight: "600" 
                            }}
                        >
                            Call Now
                        </a>
                    </div>

                </div>

                {/* Footer Button */}
                <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid var(--border-color)", textAlign: "center" }}>
                    <Link 
                        to="/faq" 
                        style={{ 
                            display: "inline-block",
                            padding: "10px 24px",
                            background: "var(--bg-primary-btn)", 
                            color: "var(--text-on-active)", 
                            borderRadius: "8px",
                            fontWeight: "600", 
                            textDecoration: "none" 
                        }}
                    >
                        ← Back to FAQ
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Support;