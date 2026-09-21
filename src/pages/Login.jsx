import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginEmployee } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import { FiEye, FiEyeOff } from "react-icons/fi";


function Login() {

    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value
        });
    };

    const [showPassword, setShowPassword] = useState(false);

    //run when we are going to press login button 
    const handleLogin = async (e) => {
    e.preventDefault();

    try {
        const response = await loginEmployee(loginData);

        const token = response.data.token;
        const employee = response.data.employee;

        // Store JWT
        localStorage.setItem("token", token);

        // Store employee details
        localStorage.setItem(
            "employee",
            JSON.stringify(employee)
        );

        localStorage.setItem(
            "email",
            employee.email
        );

        localStorage.setItem(
            "role",
            employee.role
        );

        showNotification("Login Successful", "success");

        navigate("/");

    } catch (error) {

        showNotification(
            error.response?.data?.error ||
            "Invalid Credentials",
            "error"
        );
    }
};

    return (

        <div className="login-container">
            <form className="login-card" onSubmit={handleLogin}>
                <h2>Employee Login</h2>
                <input
                    type="email"
                    name="email"
                    placeholder="Enter Email"
                    onChange={handleChange}
                    required
                />
               <div style={{ position: "relative" }}>
    <input
        type={showPassword ? "text" : "password"}
        name="password"
        placeholder="Enter Password"
        onChange={handleChange}
        required
        style={{ paddingRight: "40px" }}
    />

    <span
        onClick={() => setShowPassword(!showPassword)}
        style={{
            position: "absolute",
            right: "12px",
            top: "35%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center"
        }}
    >
        {showPassword ? <FiEyeOff /> : <FiEye />}
    </span>
</div>

                <button type="submit">
                    Login
                </button>

                <p>Don't have an account?
                    <Link to="/register">
                        Register
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default Login;