import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiX, FiChevronRight, FiMessageCircle } from "react-icons/fi";
import "../styles/global.css";
import { Helmet } from "react-helmet-async";

const faqs = [
    { question: "How do I mark my attendance?", answer: "You can mark your attendance using the 6-digit OTP sent to your registered email, or by scanning the QR code provided by your Admin on the Attendance page." },
    { question: "I forgot my password. What should I do?", answer: "Click on the 'Forgot Password?' link on the login screen. We will send a one-time password (OTP) to your registered email. Enter the OTP to set a new password." },
    { question: "Can I log in using my Google account?", answer: "Yes! If your HR administrator has enabled it, you can click the 'Sign in with Google' button on the login screen to access your account securely without typing a password." },
    { question: "How do I upload my ID and Address proof?", answer: "If your account status is 'Pending Verification', you will see an upload banner on your Dashboard. Simply select the document type, enter the document number, and upload the PDF or Image file." },
    { question: "Where can I download my salary slip?", answer: "Navigate to the Finance page from the sidebar. Here, you can view, download, or replace your generated salary slips for previous months." },
    { question: "How do I install the app on my phone?", answer: "HR-Stack is a PWA (Progressive Web App). If you visit the site on your Android phone, a prompt will appear to download the Android APK or install it directly to your home screen." }
];

function FAQ() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 900);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleExit = () => {
        const isLoggedIn = localStorage.getItem("token") && localStorage.getItem("employee");
        if (isLoggedIn) navigate("/"); else navigate("/login");
    };

    return (
        <>
         <Helmet>
                <title>Help Center - HRStack</title>
                <meta name="description" content="Find answers to frequently asked questions about HRStack attendance, documents, and finance." />
                <meta property="og:title" content="Help Center - HRStack" />
                <meta property="og:description" content="Browse HRStack FAQs." />
                <meta property="og:image" content="https://purvesh0227.github.io/hr-stack-frontend/icons/icon-512.png" />
        </Helmet>
        <div style={{ minHeight: "100vh", background: "var(--bg-page)", padding: isMobile ? "20px" : "40px", display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: "1100px", display: "flex", flexDirection: "column", marginTop: "20px" }}>
                
                {/* TOP BAR */}
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
                        <FiX size={16} /> Close Page
                    </button>
                </div>

                {/* HEADER */}
                <div style={{ marginBottom: "40px" }}>
                    <h1 style={{ color: "var(--text-primary)", fontSize: isMobile ? "36px" : "48px", margin: "0 0 15px 0", fontWeight: "700", letterSpacing: "-1px" }}>
                        Help Center
                    </h1>
                    <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "18px" }}>
                        Browse our frequently asked questions to find the answers you need.
                    </p>
                </div>

                {/* 2-COLUMN SPLIT LAYOUT */}
                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1.5fr", 
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.03)",
                    minHeight: "400px"
                }}>
                    
                    {/* LEFT: Questions Menu */}
                    <div style={{ borderRight: isMobile ? "none" : "1px solid var(--border-color)", borderBottom: isMobile ? "1px solid var(--border-color)" : "none" }}>
                        {faqs.map((faq, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveIndex(index)}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "22px 24px",
                                    background: activeIndex === index ? "var(--bg-page)" : "transparent",
                                    border: "none",
                                    borderLeft: activeIndex === index ? "3px solid var(--accent-blue)" : "3px solid transparent",
                                    color: activeIndex === index ? "var(--text-primary)" : "var(--text-secondary)",
                                    fontSize: "15px",
                                    fontWeight: activeIndex === index ? "600" : "500",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "all 0.2s ease",
                                    borderBottom: "1px solid var(--border-color)"
                                }}
                            >
                                {faq.question}
                                <FiChevronRight 
                                    size={18} 
                                    style={{ 
                                        opacity: activeIndex === index ? 1 : 0, 
                                        color: "var(--accent-blue)",
                                        transition: "opacity 0.2s ease",
                                        flexShrink: 0
                                    }} 
                                />
                            </button>
                        ))}
                    </div>

                    {/* RIGHT: Active Answer */}
                    <div style={{ padding: isMobile ? "30px" : "40px", display: "flex", flexDirection: "column" }}>
                        <h2 style={{ color: "var(--text-primary)", fontSize: "24px", margin: "0 0 20px 0", fontWeight: "700" }}>
                            {faqs[activeIndex].question}
                        </h2>
                        <p style={{ color: "var(--text-secondary)", fontSize: "16px", lineHeight: "1.8", margin: 0, flex: 1 }}>
                            {faqs[activeIndex].answer}
                        </p>

                        {/* CONTACT SUPPORT INTEGRATED AT BOTTOM */}
                        <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "15px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-secondary)" }}>
                                <FiMessageCircle size={20} />
                                <span style={{ fontSize: "14px" }}>Didn't find your answer?</span>
                            </div>
                            <Link to="/support" style={{ 
                                display: "inline-block", padding: "10px 20px", 
                                background: "var(--bg-primary-btn)", color: "var(--text-on-active)", 
                                borderRadius: "8px", fontWeight: "600", textDecoration: "none", fontSize: "14px" 
                            }}>
                                Contact Support
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </>
    );
}

export default FAQ;