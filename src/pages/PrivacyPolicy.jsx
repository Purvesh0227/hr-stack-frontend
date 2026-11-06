import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiX } from "react-icons/fi";
import "../styles/global.css";

function PrivacyPolicy() {
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

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-page)", padding: isMobile ? "20px" : "40px", display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: "900px", display: "flex", flexDirection: "column", marginTop: "20px" }}>
                
                {/* PROFESSIONAL EXIT BUTTON */}
                <div style={{ marginBottom: "40px" }}>
                    <button 
                        onClick={handleExit} 
                        style={{ 
                            display: "inline-flex", alignItems: "center", gap: "8px", 
                            padding: "8px 16px", background: "var(--bg-hover-row)", 
                            border: "1px solid var(--border-color)", borderRadius: "99px", 
                            color: "var(--text-secondary)", cursor: "pointer", fontSize: "14px", 
                            fontWeight: "500", transition: "all 0.2s ease"
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.color = "var(--text-primary)";
                            e.currentTarget.style.borderColor = "var(--border-strong)";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.color = "var(--text-secondary)";
                            e.currentTarget.style.borderColor = "var(--border-color)";
                        }}
                    >
                        <FiX size={16} /> Close Page
                    </button>
                </div>

                <div style={{ marginBottom: "40px" }}>
                    <h1 style={{ color: "var(--text-primary)", fontSize: isMobile ? "36px" : "48px", margin: "0 0 10px 0", fontWeight: "700", letterSpacing: "-1px" }}>
                        Privacy Policy
                    </h1>
                    <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "16px" }}>
                        Last updated: November 2026
                    </p>
                </div>

                <div style={{ color: "var(--text-primary)", lineHeight: "1.8", fontSize: "16px" }}>
                    <section style={{ marginBottom: "40px" }}>
                        <h2 style={{ fontSize: "24px", marginBottom: "15px" }}>1. Information We Collect</h2>
                        <p>When you use HR-Stack, we may collect the following information:</p>
                        <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
                            <li style={{ marginBottom: "10px" }}><strong>Personal Data:</strong> Name, email address, mobile number, and profile photo.</li>
                            <li style={{ marginBottom: "10px" }}><strong>Employment Data:</strong> Attendance records, uploaded verification documents (ID/Address proof), and salary information.</li>
                            <li style={{ marginBottom: "10px" }}><strong>Usage Data:</strong> Information about how you interact with the application.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "40px" }}>
                        <h2 style={{ fontSize: "24px", marginBottom: "15px" }}>2. Google Login (OAuth)</h2>
                        <p>
                            We use Google OAuth to allow you to sign in securely. When you choose to log in with Google, we receive basic profile information (your name, email address, and profile picture) from Google to create or authenticate your HR-Stack account. We do not receive or store your Google password.
                        </p>
                    </section>

                    <section style={{ marginBottom: "40px" }}>
                        <h2 style={{ fontSize: "24px", marginBottom: "15px" }}>3. Google Analytics</h2>
                        <p>
                            We use Google Analytics to understand how our application is used and to improve user experience. Google Analytics collects information such as how often users visit the site, what pages they visit, and what other sites they used prior to coming to our site. You can opt-out by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-blue)", fontWeight: "600" }}>Google Analytics Opt-out Browser Add-on</a>.
                        </p>
                    </section>

                    <section style={{ marginBottom: "40px" }}>
                        <h2 style={{ fontSize: "24px", marginBottom: "15px" }}>4. How We Use Your Data</h2>
                        <p>Your data is used strictly for internal HR operations, including:</p>
                        <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
                            <li style={{ marginBottom: "10px" }}>Managing employee profiles and attendance.</li>
                            <li style={{ marginBottom: "10px" }}>Generating salary slips.</li>
                            <li style={{ marginBottom: "10px" }}>Verifying identity via uploaded documents.</li>
                            <li style={{ marginBottom: "10px" }}>Sending essential email notifications (OTPs, announcements).</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "40px" }}>
                        <h2 style={{ fontSize: "24px", marginBottom: "15px" }}>5. Data Security & Storage</h2>
                        <p>We take security seriously. Your data is stored securely using PostgreSQL and S3-compatible cloud storage (Supabase). Passwords are encrypted, and access is protected via JWT and role-based permissions. We do not sell your personal data to third parties.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default PrivacyPolicy;