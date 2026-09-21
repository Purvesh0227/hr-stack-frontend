import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { registerEmployee } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import { isValidEmail, isValidPhone, getPasswordChecks, doPasswordsMatch } from "../utils/validators";

function Register() {

    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const [employee, setEmployee] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: ""
    });

    const [profilePhoto, setProfilePhoto] = useState(null);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {

        setEmployee({
            ...employee,
            [e.target.name]: e.target.value
        });

    };

    const emailValid = isValidEmail(employee.email);
    const phoneValid = isValidPhone(employee.mobile);
    const { hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecial } = getPasswordChecks(employee.password);
    const passwordsMatch = doPasswordsMatch(employee.password, employee.confirmPassword);

    const handleProfilePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        const allowedTypes = ["image/jpeg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            showNotification(
                "Only JPG, JPEG and PNG images are allowed.",
                "error"
            );
            return;
        }
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            showNotification(
                "Profile photo must be less than 2 MB.",
                "error"
            );
            return;
        }
        setProfilePhoto(file);
        setProfilePhotoPreview(URL.createObjectURL(file));
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!emailValid) {
            showNotification("Please enter a valid email.", "error");
            return;
        }
        if (!phoneValid) {
            showNotification("Mobile number must contain exactly 10 digits.", "error");
            return;
        }

        if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecial) {
            showNotification("Password does not satisfy all requirements.", "error");
            return;
        }

        if (!passwordsMatch) {
            showNotification("Passwords do not match", "error");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("firstName", employee.firstName);
            formData.append("lastName", employee.lastName);
            formData.append("email", employee.email);
            formData.append("mobile", employee.mobile);
            formData.append("password", employee.password);
            if (profilePhoto) {
                formData.append("profilePhoto", profilePhoto);
            }
            await registerEmployee(formData);

            showNotification("Employee Registered Successfully", "success");
            navigate("/login");
        } catch (error) {

            if (error.response) {
                if (error.response.data.error) {
                    showNotification(error.response.data.error, "error");
                } else {
                    const errors = error.response.data;
                    let message = "";

                    for (let key in errors) {
                        message += errors[key] + "\n";
                    }

                    showNotification(message, "error");
                }

            } else {
                showNotification("Registration Failed", "error");
            }
        }
    };

    return (
        <div className="register-container">
            <form className="register-card" onSubmit={handleRegister}>
                <h2>Employee Registration</h2>

                <div className="profile-photo-section">
                    <div className="profile-photo-preview">
                        {profilePhotoPreview ? (
                            <img
                                src={profilePhotoPreview}
                                alt="Profile Preview"
                            />
                        ) : (
                            <span>Photo</span>
                        )}
                    </div>

                    <label htmlFor="profilePhoto" className="upload-photo-btn">
                        Upload Photo
                    </label>

                    <input
                        id="profilePhoto"
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleProfilePhotoChange}
                        hidden
                    />

                    <small>JPG, JPEG or PNG • Maximum 2 MB</small>
                </div>

                <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={employee.firstName}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={employee.lastName}
                    onChange={handleChange}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={employee.email}
                    onChange={handleChange}
                    required
                />

                {employee.email !== "" && (
                    <small className={emailValid ? "valid" : "invalid"}>
                        {emailValid ? "✓ Valid Email" : "✗ Enter a valid email address"}
                    </small>
                )}

                <input
                    type="text"
                    name="mobile"
                    placeholder="Mobile Number"
                    value={employee.mobile}
                    onChange={handleChange}
                    maxLength="10"
                    required
                />

                {employee.mobile !== "" && (
                    <small className={phoneValid ? "valid" : "invalid"}>
                        {phoneValid ? "✓ Valid Mobile Number" : "✗ Mobile number must contain exactly 10 digits"}
                    </small>
                )}

                <div style={{ position: "relative" }}>
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={employee.password}
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

                <div className="password-rules">

                    <p className={hasMinLength ? "valid" : "invalid"}>
                        {hasMinLength ? "✓" : "✗"} Minimum 8 characters
                    </p>

                    <p className={hasUpperCase ? "valid" : "invalid"}>
                        {hasUpperCase ? "✓" : "✗"} One uppercase letter
                    </p>

                    <p className={hasLowerCase ? "valid" : "invalid"}>
                        {hasLowerCase ? "✓" : "✗"} One lowercase letter
                    </p>

                    <p className={hasNumber ? "valid" : "invalid"}>
                        {hasNumber ? "✓" : "✗"} One number
                    </p>

                    <p className={hasSpecial ? "valid" : "invalid"}>
                        {hasSpecial ? "✓" : "✗"} One special character
                    </p>

                </div>

                <div style={{ position: "relative" }}>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={employee.confirmPassword}
                        onChange={handleChange}
                        required
                        style={{ paddingRight: "40px" }}
                    />

                    <span
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </span>
                </div>

                {employee.confirmPassword !== "" && (
                    <p className={passwordsMatch ? "valid" : "invalid"}>
                        {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={
                        !passwordsMatch ||
                        !emailValid ||
                        !phoneValid ||
                        !hasMinLength ||
                        !hasUpperCase ||
                        !hasLowerCase ||
                        !hasNumber ||
                        !hasSpecial
                    }
                >
                    Register
                </button>

                <p>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </form>
        </div>
    );
}

export default Register;