import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/global.css";

function PrivacyPolicy() {
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
                    <Link to="/login" style={{ color: "var(--text-secondary)", textDecoration: "none", fontWeight: "600", display: "flex", alignItems: "center", gap: "5px" }}>
                        ← Back to Login
                    </Link>
                    <Link to="/" style={{ color: "var(--accent-blue)", textDecoration: "none", fontWeight: "600" }}>
                        Go to Dashboard →
                    </Link>
                </div>

                {/* Header Section */}
                <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "20px", marginBottom: "30px" }}>
                    <h1 style={{ color: "var(--text-primary)", fontSize: isMobile ? "26px" : "32px", margin: "0 0 10px 0", letterSpacing: "-0.5px" }}>
                        Privacy Policy
                    </h1>
                    <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "14px" }}>
                        Last updated: November 2026
                    </p>
                </div>

                {/* Content Section */}
                <div style={{ color: "var(--text-primary)", lineHeight: "1.7", fontSize: "15px" }}>
                    
                    <section style={{ marginBottom: "35px" }}>
                        <h2 style={{ fontSize: "20px", marginBottom: "15px" }}>1. Information We Collect</h2>
                        <p>When you use HR-Stack, we may collect the following information:</p>
                        <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
                            <li style={{ marginBottom: "8px" }}><strong>Personal Data:</strong> Name, email address, mobile number, and profile photo.</li>
                            <li style={{ marginBottom: "8px" }}><strong>Employment Data:</strong> Attendance records, uploaded verification documents (ID/Address proof), and salary information.</li>
                            <li style={{ marginBottom: "8px" }}><strong>Usage Data:</strong> Information about how you interact with the application.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "35px", background: "var(--bg-hover-row)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                        <h2 style={{ fontSize: "18px", marginBottom: "10px", color: "var(--accent-blue)" }}>2. Google Login (OAuth)</h2>
                        <p style={{ margin: 0 }}>
                            We use Google OAuth to allow you to sign in securely. When you choose to log in with Google, we receive basic profile information (your name, email address, and profile picture) from Google to create or authenticate your HR-Stack account. We do not receive or store your Google password.
                        </p>
                    </section>

                    <section style={{ marginBottom: "35px", background: "var(--bg-hover-row)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                        <h2 style={{ fontSize: "18px", marginBottom: "10px", color: "var(--accent-blue)" }}>3. Google Analytics</h2>
                        <p style={{ margin: 0 }}>
                            We use Google Analytics to understand how our application is used and to improve user experience. Google Analytics collects information such as how often users visit the site, what pages they visit, and what other sites they used prior to coming to our site. You can opt-out by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-blue)", fontWeight: "600" }}>Google Analytics Opt-out Browser Add-on</a>.
                        </p>
                    </section>

                    <section style={{ marginBottom: "35px" }}>
                        <h2 style={{ fontSize: "20px", marginBottom: "15px" }}>4. How We Use Your Data</h2>
                        <p>Your data is used strictly for internal HR operations, including:</p>
                        <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
                            <li style={{ marginBottom: "8px" }}>Managing employee profiles and attendance.</li>
                            <li style={{ marginBottom: "8px" }}>Generating salary slips.</li>
                            <li style={{ marginBottom: "8px" }}>Verifying identity via uploaded documents.</li>
                            <li style={{ marginBottom: "8px" }}>Sending essential email notifications (OTPs, announcements).</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "35px" }}>
                        <h2 style={{ fontSize: "20px", marginBottom: "15px" }}>5. Data Security & Storage</h2>
                        <p>We take security seriously. Your data is stored securely using PostgreSQL and S3-compatible cloud storage (Supabase). Passwords are encrypted, and access is protected via JWT and role-based permissions. We do not sell your personal data to third parties.</p>
                    </section>

                </div>

                <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid var(--border-color)", textAlign: "center" }}>
                    <Link to="/login" style={{ display: "inline-block", padding: "10px 24px", background: "var(--bg-primary-btn)", color: "var(--text-on-active)", borderRadius: "8px", fontWeight: "600", textDecoration: "none" }}>
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default PrivacyPolicy;