import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginEmployee } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import { FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import "../styles/global.css";
import useSubmitLock from "../hooks/useSubmitLock";

function Login() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value
        });
    };

    const [loading, run] = useSubmitLock();

    const handleLogin = async (e) => {
        e.preventDefault();
         run(async () => {
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
     });
    };

    return (
        <div className="login-page">

            {/* =========================================
                LEFT BRANDING PANEL
            ========================================= */}

            <section className="login-brand-panel">

                <div className="login-brand-content">

                    <div className="login-logo">
                        HRStack
                    </div>

                    <div className="login-brand-copy">
                        <span className="login-brand-eyebrow">
                            Employee Management Platform
                        </span>

                        <h1>
                            Everything your team
                            <span> needs, in one place.</span>
                        </h1>

                        <p>
                            Manage employees, attendance, documents,
                            and payroll information from a single
                            secure workspace.
                        </p>
                    </div>
                </div>

            </section>


            {/* =========================================
                RIGHT LOGIN PANEL
            ========================================= */}

            <section className="login-form-panel">

                <div className="login-card">

                    <div className="login-header">

                        <div className="login-mobile-logo">
                            HRStack
                        </div>

                        <h2>
                            Welcome back
                        </h2>

                        <p>
                            Sign in to continue to your account.
                        </p>

                    </div>


                    <form
                        className="login-form"
                        onSubmit={handleLogin}
                    >

                        {/* EMAIL */}

                        <div className="login-field">

                            <label htmlFor="login-email">
                                Email address
                            </label>

                            <input
                                id="login-email"
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={loginData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="login-field">

                            <div className="login-label-row">

                                <label htmlFor="login-password">Password</label>
                                <Link to="/forgot-password" className="login-forgot-link">Forgot Password?</Link>

                            </div>

                            <div className="login-password-wrapper">

                                <input
                                    id="login-password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    placeholder="Enter your password"
                                    value={loginData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="login-password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            (prev) => !prev
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <FiEyeOff size={17} />
                                    ) : (
                                        <FiEye size={17} />
                                    )}
                                </button>

                            </div>

                        </div>


                        {/* LOGIN BUTTON */}

                        <button type="submit" className="login-submit-btn" disabled={loading}>
                            <span>{loading ? "Signing in..." : "Sign in"}</span>
                            <FiArrowRight size={17} />
                        </button>

                    </form>


                    {/* REGISTER */}

                    <div className="login-register">

                        <span>
                            Don't have an account?
                        </span>

                        <Link to="/register">
                            Create an account
                        </Link>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default Login;