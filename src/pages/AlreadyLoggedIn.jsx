import { useNavigate } from "react-router-dom";

function AlreadyLoggedIn() {
    const navigate = useNavigate();
    const employee = JSON.parse(localStorage.getItem("employee"));

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const handleContinue = () => {
        navigate("/");
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                backgroundColor: "#f5f7fb"
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "420px",
                    padding: "35px",
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
                    textAlign: "center"
                }}
            >
                <p
                    style={{
                        margin: "0 0 8px",
                        color: "#666",
                        fontSize: "15px"
                    }}
                >
                    You are currently logged in with
                </p>

                <p
                    style={{
                        margin: "0 0 28px",
                        color: "#222",
                        fontSize: "16px",
                        fontWeight: "600",
                        wordBreak: "break-word"
                    }}
                >
                    {employee?.email || "Registered user"}
                </p>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "12px"
                    }}
                >
                    <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                            minWidth: "110px",
                            padding: "11px 20px",
                            border: "1px solid #dc3545",
                            borderRadius: "6px",
                            backgroundColor: "#ffffff",
                            color: "#dc3545",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer"
                        }}
                    >
                        Logout
                    </button>

                    <button
                        type="button"
                        onClick={handleContinue}
                        style={{
                            minWidth: "110px",
                            padding: "11px 20px",
                            border: "none",
                            borderRadius: "6px",
                            backgroundColor: "#2563eb",
                            color: "#ffffff",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer"
                        }}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AlreadyLoggedIn;