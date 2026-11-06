import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
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

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

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

                <div style={{ textAlign: "center", marginBottom: isMobile ? "30px" : "40px" }}>
                    <h1 style={{ color: "var(--text-primary)", fontSize: isMobile ? "26px" : "32px", margin: "0 0 10px 0", letterSpacing: "-0.5px" }}>
                        Frequently Asked Questions
                    </h1>
                    <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "15px" }}>
                        Find quick answers to common questions about HR-Stack.
                    </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {faqs.map((faq, index) => (
                        <div key={index} style={{ border: "1px solid var(--border-color)", borderRadius: "10px", overflow: "hidden" }}>
                            <button
                                onClick={() => toggleFAQ(index)}
                                style={{
                                    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                                    padding: isMobile ? "15px" : "20px",
                                    background: openIndex === index ? "var(--bg-hover-row)" : "transparent",
                                    border: "none", color: "var(--text-primary)",
                                    fontSize: isMobile ? "15px" : "16px",
                                    fontWeight: "600", cursor: "pointer", textAlign: "left", transition: "background 0.2s ease"
                                }}
                            >
                                {faq.question}
                                {openIndex === index ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                            </button>
                            
                            {openIndex === index && (
                                <div style={{ padding: isMobile ? "0 15px 15px 15px" : "0 20px 20px 20px", color: "var(--text-secondary)", fontSize: isMobile ? "14px" : "15px", lineHeight: "1.6" }}>
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: "50px", paddingTop: "20px", borderTop: "1px solid var(--border-color)", textAlign: "center" }}>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "15px" }}>Still have questions?</p>
                    <Link to="/support" style={{ display: "inline-block", padding: "10px 24px", background: "var(--bg-primary-btn)", color: "var(--text-on-active)", borderRadius: "8px", fontWeight: "600", textDecoration: "none" }}>
                        Raise a Support Ticket
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default FAQ;