import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiPlus, FiMinus, FiX } from "react-icons/fi";
import "../styles/global.css";

const faqs = [
    { question: "How do I mark my attendance?", answer: "You can mark your attendance using the 6-digit OTP sent to your registered email, or by scanning the QR code provided by your Admin on the Attendance page." },
    { question: "I forgot my password. What should I do?", answer: "Click on the 'Forgot Password?' link on the login screen. We will send a one-time password (OTP) to your registered email. Enter the OTP to set a new password." },
    { question: "Can I log in using my Google account?", answer: "Yes! If your HR administrator has enabled it, you can click the 'Sign in with Google' button on the login screen to access your account securely without typing a password." },
    { question: "How do I upload my ID and Address proof?", answer: "If your account status is 'Pending Verification', you will see an upload banner on your Dashboard. Simply select the document type, enter the document number, and upload the PDF or Image file." },
    { question: "Where can I download my salary slip?", answer: "Navigate to the Finance page from the sidebar. Here, you can view, download, or replace your generated salary slips for previous months." },
    { question: "How do I install the app on my phone?", answer: "HR-Stack is a PWA (Progressive Web App). If you visit the site on your Android phone, a prompt will appear to download the Android APK or install it directly to your home screen." }
];

function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleExit = () => {
        const isLoggedIn = localStorage.getItem("token") && localStorage.getItem("employee");
        if (isLoggedIn) navigate("/"); else navigate("/login");
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

                <div style={{ marginBottom: "50px" }}>
                    <h1 style={{ color: "var(--text-primary)", fontSize: isMobile ? "36px" : "48px", margin: "0 0 15px 0", fontWeight: "700", letterSpacing: "-1px" }}>
                        Frequently Asked Questions
                    </h1>
                    <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "18px" }}>
                        Everything you need to know about HR-Stack.
                    </p>
                </div>

                {/* FAQ LIST WITH PLUS/MINUS */}
                <div style={{ borderTop: "1px solid var(--border-color)", marginBottom: "60px" }}>
                    {faqs.map((faq, index) => (
                        <div key={index} style={{ borderBottom: "1px solid var(--border-color)" }}>
                            <button
                                onClick={() => toggleFAQ(index)}
                                style={{
                                    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                                    padding: "28px 0", background: "transparent", border: "none",
                                    color: "var(--text-primary)", fontSize: isMobile ? "16px" : "18px",
                                    fontWeight: "600", cursor: "pointer", textAlign: "left"
                                }}
                            >
                                {faq.question}
                                <div style={{ 
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    width: "32px", height: "32px", borderRadius: "50%", 
                                    background: openIndex === index ? "var(--bg-primary-btn)" : "var(--bg-card)",
                                    border: "1px solid var(--border-color)",
                                    color: openIndex === index ? "var(--text-on-active)" : "var(--text-secondary)",
                                    transition: "all 0.2s ease"
                                }}>
                                    {openIndex === index ? <FiMinus size={18} /> : <FiPlus size={18} />}
                                </div>
                            </button>
                            
                            {openIndex === index && (
                                <div style={{ padding: "0 0 28px 0", color: "var(--text-secondary)", fontSize: "16px", lineHeight: "1.7", maxWidth: "850px" }}>
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ padding: "40px", background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border-color)", textAlign: "center" }}>
                    <h3 style={{ color: "var(--text-primary)", margin: "0 0 10px 0", fontSize: "20px" }}>Still have questions?</h3>
                    <p style={{ color: "var(--text-secondary)", margin: "0 0 20px 0", fontSize: "15px" }}>Can't find the answer you're looking for? Please chat with our friendly team.</p>
                    <Link to="/support" style={{ display: "inline-block", padding: "12px 28px", background: "var(--bg-primary-btn)", color: "var(--text-on-active)", borderRadius: "8px", fontWeight: "600", textDecoration: "none" }}>
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default FAQ;