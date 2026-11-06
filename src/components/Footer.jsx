import { Link } from "react-router-dom";
import "../styles/global.css";

function Footer() {
    const linkStyle = {
        color: "var(--text-secondary)", 
        textDecoration: "none",
        transition: "color 0.2s ease",
        fontWeight: "500"
    };

    return (
        <footer className="footer">
            <div 
                className="footer-content" 
                style={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "center", 
                    gap: "12px", 
                    flexWrap: "wrap",
                    padding: "20px 15px",
                    fontSize: "14px",
                    textAlign: "center"
                }}
            >
                <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                    <strong>© 2026 HRStack.</strong> All rights reserved.
                </p>
                <span style={{ color: "var(--border-strong)", display: "none" }}>|</span> {/* Hidden on tiny screens to prevent weird breaks */}
                
                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
                    <Link 
                        to="/privacy-policy" 
                        style={linkStyle}
                        onMouseOver={(e) => e.target.style.color = "var(--text-primary)"}
                        onMouseOut={(e) => e.target.style.color = "var(--text-secondary)"}
                    >
                        Privacy Policy
                    </Link>
                    
                    <span style={{ color: "var(--border-strong)" }}>|</span>
                    
                    <Link 
                        to="/faq" 
                        style={linkStyle}
                        onMouseOver={(e) => e.target.style.color = "var(--text-primary)"}
                        onMouseOut={(e) => e.target.style.color = "var(--text-secondary)"}
                    >
                        FAQ's
                    </Link>

                    <span style={{ color: "var(--border-strong)" }}>|</span>

                    <Link 
                        to="/support" 
                        style={linkStyle}
                        onMouseOver={(e) => e.target.style.color = "var(--text-primary)"}
                        onMouseOut={(e) => e.target.style.color = "var(--text-secondary)"}
                    >
                        Support
                    </Link>
                </div>
            </div>
        </footer>
    );
}

export default Footer;