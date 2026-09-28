import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiCamera, FiCheck, FiX } from "react-icons/fi";
import { registerEmployee } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import {
    isValidEmail,
    isValidPhone,
    getPasswordChecks,
    doPasswordsMatch
} from "../utils/validators";
import "../styles/global.css";

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

    const {
        hasMinLength,
        hasUpperCase,
        hasLowerCase,
        hasNumber,
        hasSpecial
    } = getPasswordChecks(employee.password);

    const passwordsMatch = doPasswordsMatch(
        employee.password,
        employee.confirmPassword
    );

    /* =========================================
       PROFILE PHOTO
       ========================================= */

    const handleProfilePhotoChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png"
        ];

        if (!allowedTypes.includes(file.type)) {
            showNotification(
                "Only JPG, JPEG and PNG images are allowed.",
                "error"
            );

            e.target.value = "";
            return;
        }

        const maxSize = 2 * 1024 * 1024;

        if (file.size > maxSize) {
            showNotification(
                "Profile photo must be less than 2 MB.",
                "error"
            );

            e.target.value = "";
            return;
        }

        setProfilePhoto(file);
        setProfilePhotoPreview(URL.createObjectURL(file));
    };

    /* =========================================
       REGISTER
       ========================================= */

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!emailValid) {
            showNotification(
                "Please enter a valid email.",
                "error"
            );
            return;
        }

        if (!phoneValid) {
            showNotification(
                "Mobile number must contain exactly 10 digits.",
                "error"
            );
            return;
        }

        if (
            !hasMinLength ||
            !hasUpperCase ||
            !hasLowerCase ||
            !hasNumber ||
            !hasSpecial
        ) {
            showNotification(
                "Password does not satisfy all requirements.",
                "error"
            );
            return;
        }

        if (!passwordsMatch) {
            showNotification(
                "Passwords do not match.",
                "error"
            );
            return;
        }

        try {
            const formData = new FormData();

            formData.append(
                "firstName",
                employee.firstName
            );

            formData.append(
                "lastName",
                employee.lastName
            );

            formData.append(
                "email",
                employee.email
            );

            formData.append(
                "mobile",
                employee.mobile
            );

            formData.append(
                "password",
                employee.password
            );

            if (profilePhoto) {
                formData.append(
                    "profilePhoto",
                    profilePhoto
                );
            }

            await registerEmployee(formData);

            showNotification(
                "Employee Registered Successfully",
                "success"
            );

            navigate("/login");

        } catch (error) {
            if (error.response) {

                if (error.response.data?.error) {
                    showNotification(
                        error.response.data.error,
                        "error"
                    );
                } else {
                    const errors = error.response.data;

                    let message = "";

                    for (const key in errors) {
                        message += `${errors[key]}\n`;
                    }

                    showNotification(
                        message || "Registration Failed",
                        "error"
                    );
                }

            } else {
                showNotification(
                    "Registration Failed",
                    "error"
                );
            }
        }
    };

    return (
        <div className="register-page">

            {/* =========================================
                LEFT BRAND PANEL
               ========================================= */}

            <section className="register-brand-panel">

                <div className="register-brand-content">

                    <div className="register-logo">
                        HRStack
                    </div>

                    <div className="register-brand-copy">

                        <span className="register-brand-eyebrow">
                            Employee Management Platform
                        </span>

                        <h1>
                            Build your profile.
                            <span>
                                Join your team.
                            </span>
                        </h1>

                        <p>
                            Create your employee account and get
                            access to attendance, documents,
                            finance and your HR workspace.
                        </p>

                    </div>
                </div>

            </section>


            {/* =========================================
                RIGHT FORM PANEL
               ========================================= */}

            <section className="register-form-panel">

                <form
                    className="register-card"
                    onSubmit={handleRegister}
                >

                    {/* Mobile logo */}
                    <div className="register-mobile-logo">
                        HRStack
                    </div>


                    {/* Header */}
                    <div className="register-header">

                        <h2>
                            Create your account
                        </h2>

                        <p>
                            Enter your details to create your
                            employee account.
                        </p>

                    </div>


                    {/* =====================================
                        PROFILE PHOTO
                       ===================================== */}

                    <div className="register-photo-section">

                        <label
                            htmlFor="profilePhoto"
                            className={`register-photo-upload ${
                                profilePhotoPreview
                                    ? "has-photo"
                                    : ""
                            }`}
                        >

                            {profilePhotoPreview ? (
                                <img
                                    src={profilePhotoPreview}
                                    alt="Profile preview"
                                />
                            ) : (
                                <div className="register-photo-placeholder">
                                    <FiCamera size={22} />
                                    <span>
                                        Add profile photo
                                    </span>
                                </div>
                            )}

                            <div className="register-photo-overlay">
                                <FiCamera size={15} />
                                <span>
                                    {profilePhotoPreview
                                        ? "Change photo"
                                        : "Upload photo"}
                                </span>
                            </div>

                        </label>

                        <input
                            id="profilePhoto"
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={handleProfilePhotoChange}
                            hidden
                        />

                        <p className="register-field-help">
                            JPG, JPEG or PNG · Maximum 2 MB
                        </p>

                    </div>


                    {/* =====================================
                        NAME
                       ===================================== */}

                    <div className="register-name-row">

                        <div className="register-field">

                            <label htmlFor="firstName">
                                First name
                            </label>

                            <input
                                id="firstName"
                                type="text"
                                name="firstName"
                                placeholder="First name"
                                value={employee.firstName}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="register-field">

                            <label htmlFor="lastName">
                                Last name
                            </label>

                            <input
                                id="lastName"
                                type="text"
                                name="lastName"
                                placeholder="Last name"
                                value={employee.lastName}
                                onChange={handleChange}
                                required
                            />

                        </div>

                    </div>


                    {/* =====================================
                        EMAIL
                       ===================================== */}

                    <div className="register-field">

                        <label htmlFor="email">
                            Email address
                        </label>

                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={employee.email}
                            onChange={handleChange}
                            required
                        />

                        {employee.email !== "" && (
                            <p
                                className={`register-validation ${
                                    emailValid
                                        ? "valid"
                                        : "invalid"
                                }`}
                            >
                                {emailValid ? (
                                    <FiCheck />
                                ) : (
                                    <FiX />
                                )}

                                {emailValid
                                    ? "Valid email address"
                                    : "Enter a valid email address"}
                            </p>
                        )}

                    </div>


                    {/* =====================================
                        MOBILE
                       ===================================== */}

                    <div className="register-field">

                        <label htmlFor="mobile">
                            Mobile number
                        </label>

                        <input
                            id="mobile"
                            type="text"
                            name="mobile"
                            placeholder="10-digit mobile number"
                            value={employee.mobile}
                            onChange={handleChange}
                            maxLength="10"
                            required
                        />

                        {employee.mobile !== "" && (
                            <p
                                className={`register-validation ${
                                    phoneValid
                                        ? "valid"
                                        : "invalid"
                                }`}
                            >
                                {phoneValid ? (
                                    <FiCheck />
                                ) : (
                                    <FiX />
                                )}

                                {phoneValid
                                    ? "Valid mobile number"
                                    : "Mobile number must contain exactly 10 digits"}
                            </p>
                        )}

                    </div>


                    {/* =====================================
                        PASSWORD
                       ===================================== */}

                    <div className="register-field">

                        <label htmlFor="password">
                            Password
                        </label>

                        <div className="register-password-wrapper">

                            <input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                placeholder="Create a password"
                                value={employee.password}
                                onChange={handleChange}
                                required
                            />

                            <button
                                type="button"
                                className="register-password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
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


                        {/* Password rules */}

                        <div className="password-rules">

                            <span
                                className={
                                    hasMinLength
                                        ? "rule-valid"
                                        : "rule-invalid"
                                }
                            >
                                {hasMinLength ? (
                                    <FiCheck />
                                ) : (
                                    <FiX />
                                )}
                                8 characters
                            </span>

                            <span
                                className={
                                    hasUpperCase
                                        ? "rule-valid"
                                        : "rule-invalid"
                                }
                            >
                                {hasUpperCase ? (
                                    <FiCheck />
                                ) : (
                                    <FiX />
                                )}
                                Uppercase
                            </span>

                            <span
                                className={
                                    hasLowerCase
                                        ? "rule-valid"
                                        : "rule-invalid"
                                }
                            >
                                {hasLowerCase ? (
                                    <FiCheck />
                                ) : (
                                    <FiX />
                                )}
                                Lowercase
                            </span>

                            <span
                                className={
                                    hasNumber
                                        ? "rule-valid"
                                        : "rule-invalid"
                                }
                            >
                                {hasNumber ? (
                                    <FiCheck />
                                ) : (
                                    <FiX />
                                )}
                                Number
                            </span>

                            <span
                                className={
                                    hasSpecial
                                        ? "rule-valid"
                                        : "rule-invalid"
                                }
                            >
                                {hasSpecial ? (
                                    <FiCheck />
                                ) : (
                                    <FiX />
                                )}
                                Special character
                            </span>

                        </div>

                    </div>


                    {/* =====================================
                        CONFIRM PASSWORD
                       ===================================== */}

                    <div className="register-field">

                        <label htmlFor="confirmPassword">
                            Confirm password
                        </label>

                        <div className="register-password-wrapper">

                            <input
                                id="confirmPassword"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                value={
                                    employee.confirmPassword
                                }
                                onChange={handleChange}
                                required
                            />

                            <button
                                type="button"
                                className="register-password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                                aria-label={
                                    showConfirmPassword
                                        ? "Hide confirm password"
                                        : "Show confirm password"
                                }
                            >
                                {showConfirmPassword ? (
                                    <FiEyeOff size={17} />
                                ) : (
                                    <FiEye size={17} />
                                )}
                            </button>

                        </div>


                        {employee.confirmPassword !== "" && (
                            <p
                                className={`register-validation ${
                                    passwordsMatch
                                        ? "valid"
                                        : "invalid"
                                }`}
                            >
                                {passwordsMatch ? (
                                    <FiCheck />
                                ) : (
                                    <FiX />
                                )}

                                {passwordsMatch
                                    ? "Passwords match"
                                    : "Passwords do not match"}
                            </p>
                        )}

                    </div>


                    {/* =====================================
                        SUBMIT
                       ===================================== */}

                    <button
                        type="submit"
                        className="register-submit-btn"
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
                        Create account
                    </button>


                    {/* =====================================
                        LOGIN
                       ===================================== */}

                    <div className="register-login">

                        <span>
                            Already have an account?
                        </span>

                        <Link to="/login">
                            Sign in
                        </Link>

                    </div>

                </form>

            </section>

        </div>
    );
}

export default Register;