import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    FiEye,
    FiEyeOff,
    FiCamera,
    FiCheck,
    FiX
} from "react-icons/fi";
import {
    registerEmployee,
    googleSignupStart,
    googleSignupComplete
} from "../services/api";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useTheme } from "../contexts/ThemeContext";
import { useNotification } from "../contexts/NotificationContext";
import {
    isValidEmail,
    isValidPhone,
    getPasswordChecks,
    doPasswordsMatch
} from "../utils/validators";
import "../styles/global.css";
import useSubmitLock from "../hooks/useSubmitLock";
import EmailVerification from "../components/EmailVerification";
import { signIn } from '@choochmeque/tauri-plugin-google-auth-api';

const REGISTER_DRAFT_KEY = "hrstack-register-draft";
const VERIFIED_EMAIL_KEY = "hrstack-register-verified-email";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const getErrorMessage = (error, fallback) => {
    const data = error.response?.data;
    if (data?.error) return data.error;
    if (data && typeof data === "object") {
        return Object.values(data).join("\n") || fallback;
    }
    return fallback;
};

function Register() {
    const navigate = useNavigate();
    const location = useLocation();
    const { showNotification } = useNotification();
    const { theme } = useTheme();

    // Google sign-up: null = normal register, object = profile step after Google
    const [googleSignup, setGoogleSignup] = useState(null);
    const isGoogle = Boolean(googleSignup);

    const [employee, setEmployee] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: ""
    });

    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    const [profilePhoto, setProfilePhoto] = useState(null);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    /* =========================================
       EMAIL VERIFICATION STATE
       ========================================= */

    const [verifiedEmail, setVerifiedEmail] = useState("");

    const emailVerified =
        Boolean(employee.email) &&
        verifiedEmail === employee.email.trim().toLowerCase();

    /* =========================================
       RESTORE REGISTER DRAFT
       ========================================= */

    useEffect(() => {
        const savedDraft =
            sessionStorage.getItem(REGISTER_DRAFT_KEY);

        const savedVerifiedEmail =
            sessionStorage.getItem(VERIFIED_EMAIL_KEY);

        if (savedDraft) {
            try {
                const parsedDraft = JSON.parse(savedDraft);

                setEmployee((current) => ({
                    ...current,
                    firstName: parsedDraft.firstName || "",
                    lastName: parsedDraft.lastName || "",
                    email: parsedDraft.email || "",
                    mobile: parsedDraft.mobile || ""
                }));
            } catch {
                sessionStorage.removeItem(
                    REGISTER_DRAFT_KEY
                );
            }
        }

        if (savedVerifiedEmail) {
            setVerifiedEmail(
                savedVerifiedEmail.trim().toLowerCase()
            );
        }
    }, []);

    /* =========================================
       RECEIVE VERIFIED EMAIL FROM VERIFY PAGE
       ========================================= */

    useEffect(() => {
        const routerVerifiedEmail =
            location.state?.verifiedEmail;

        if (!routerVerifiedEmail) {
            return;
        }

        const normalizedEmail =
            routerVerifiedEmail.trim().toLowerCase();

        setEmployee((current) => ({
            ...current,
            email: normalizedEmail
        }));

        setVerifiedEmail(normalizedEmail);

        sessionStorage.setItem(
            VERIFIED_EMAIL_KEY,
            normalizedEmail
        );

        /*
         * Remove router state after consuming it.
         * This prevents the same state from being
         * processed again on refresh/navigation.
         */
        navigate(location.pathname, {
            replace: true,
            state: {}
        });
    }, [location, navigate]);

    /* =========================================
       HANDLE INPUT CHANGES
       ========================================= */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setEmployee((current) => ({
            ...current,
            [name]: value
        }));

        /*
         * If the user changes the email after
         * verification, the old verification must
         * no longer count for the new email.
         */
        if (name === "email") {
            const normalizedEmail =
                value.trim().toLowerCase();

            if (normalizedEmail !== verifiedEmail) {
                setVerifiedEmail("");

                sessionStorage.removeItem(
                    VERIFIED_EMAIL_KEY
                );
            }
        }

        /*
         * Store only non-sensitive registration data.
         *
         * Password and confirmPassword are intentionally
         * NOT stored in sessionStorage.
         */
        if (
            name === "firstName" ||
            name === "lastName" ||
            name === "email" ||
            name === "mobile"
        ) {
            setEmployee((current) => {
                const updatedEmployee = {
                    ...current,
                    [name]: value
                };

                sessionStorage.setItem(
                    REGISTER_DRAFT_KEY,
                    JSON.stringify({
                        firstName:
                            updatedEmployee.firstName,
                        lastName:
                            updatedEmployee.lastName,
                        email:
                            updatedEmployee.email,
                        mobile:
                            updatedEmployee.mobile
                    })
                );

                return updatedEmployee;
            });
        }
    };

    /* =========================================
       DERIVED VALIDATION
       ========================================= */

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
        setProfilePhotoPreview(
            URL.createObjectURL(file)
        );
    };

    /* =========================================
       EMAIL VERIFIED CALLBACK
       ========================================= */

    const handleEmailVerified = (email) => {
        const normalizedEmail =
            email.trim().toLowerCase();

        setVerifiedEmail(normalizedEmail);

        sessionStorage.setItem(
            VERIFIED_EMAIL_KEY,
            normalizedEmail
        );
    };

    /* =========================================
       SUBMIT LOCK
       ========================================= */

    const [loading, run] = useSubmitLock();

    const isTauri = window.__TAURI__ !== undefined;

const handleDesktopGoogleSignup = () =>
    run(async () => {
        try {
            const response = await signIn({
                clientId: import.meta.env.VITE_GOOGLE_DESKTOP_CLIENT_ID,
                clientSecret: import.meta.env.VITE_GOOGLE_DESKTOP_CLIENT_SECRET,
                scopes: ['openid', 'email', 'profile'],
            });

            // Reuse your existing backend call, just with the Tauri idToken
            const { data } = await googleSignupStart(response.idToken);

            setGoogleSignup({ signupToken: data.signupToken });

            setEmployee((current) => ({
                ...current,
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                email: data.email,
                password: "",
                confirmPassword: ""
            }));

            setVerifiedEmail("");
            sessionStorage.removeItem(VERIFIED_EMAIL_KEY);
            sessionStorage.removeItem(REGISTER_DRAFT_KEY);
        } catch (error) {
            showNotification(
                getErrorMessage(error, "Google Desktop sign-up failed."),
                "error"
            );
        }
    });

    /* =========================================
       GOOGLE SIGN-UP
       ========================================= */

    const handleGoogleSuccess = (credentialResponse) =>
        run(async () => {
            try {
                const { data } = await googleSignupStart(
                    credentialResponse.credential
                );

                setGoogleSignup({ signupToken: data.signupToken });

                setEmployee((current) => ({
                    ...current,
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    email: data.email,
                    password: "",
                    confirmPassword: ""
                }));

                // old email-verification state must not carry over
                setVerifiedEmail("");
                sessionStorage.removeItem(VERIFIED_EMAIL_KEY);
                sessionStorage.removeItem(REGISTER_DRAFT_KEY);
            } catch (error) {
                showNotification(
                    getErrorMessage(error, "Google sign-up failed."),
                    "error"
                );
            }
        });

    const cancelGoogleSignup = () => {
        setGoogleSignup(null);
        setEmployee({
            firstName: "",
            lastName: "",
            email: "",
            mobile: "",
            password: "",
            confirmPassword: ""
        });
        setVerifiedEmail("");
        sessionStorage.removeItem(VERIFIED_EMAIL_KEY);
        sessionStorage.removeItem(REGISTER_DRAFT_KEY);
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

        if (!isGoogle && !emailVerified) {
            showNotification(
                "Please verify your email first.",
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

        // Google sign-up: JSON call, email comes from the signed token
        if (isGoogle) {
            run(async () => {
                try {
                    const { data } = await googleSignupComplete({
                        signupToken: googleSignup.signupToken,
                        firstName: employee.firstName.trim(),
                        lastName: employee.lastName.trim(),
                        mobile: employee.mobile,
                        password: employee.password,
                        twoFactorEnabled: twoFactorEnabled
                    });

                    localStorage.setItem("token", data.token);
                    localStorage.setItem(
                        "employee",
                        JSON.stringify(data.employee)
                    );
                    localStorage.setItem("email", data.employee.email);
                    localStorage.setItem("role", data.employee.role);

                    sessionStorage.removeItem(REGISTER_DRAFT_KEY);
                    sessionStorage.removeItem(VERIFIED_EMAIL_KEY);

                    showNotification(
                        "Account created successfully",
                        "success"
                    );
                    navigate("/");
                } catch (error) {
                    const message = getErrorMessage(
                        error,
                        "Registration Failed"
                    );
                    showNotification(message, "error");

                    // signup session is dead: start again
                    if (/sign-up session expired/i.test(message)) {
                        cancelGoogleSignup();
                    }
                }
            });
            return;
        }

        // Normal registration
        run(async () => {
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

                formData.append("twoFactorEnabled", String(twoFactorEnabled));

                if (profilePhoto) {
                    formData.append(
                        "profilePhoto",
                        profilePhoto
                    );
                }

                await registerEmployee(formData);

                /*
                 * Registration completed successfully.
                 * Remove the temporary registration draft.
                 */
                sessionStorage.removeItem(
                    REGISTER_DRAFT_KEY
                );

                sessionStorage.removeItem(
                    VERIFIED_EMAIL_KEY
                );

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
                        const errors =
                            error.response.data;

                        let message = "";

                        for (const key in errors) {
                            message += `${errors[key]}\n`;
                        }

                        showNotification(
                            message ||
                            "Registration Failed",
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
        });
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || ""}>
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
                                {isGoogle
                                    ? "Complete your profile"
                                    : "Create your account"}
                            </h2>

                            <p>
                                {isGoogle
                                    ? "Confirm your name, then add your mobile number and a password."
                                    : "Enter your details to create your employee account."}
                            </p>

                        </div>


                        {/* =====================================
                            GOOGLE SIGN-UP
                           ===================================== */}

                        {!isGoogle && GOOGLE_CLIENT_ID && (
                            <div className="register-google">

                                {isTauri ? (
                                    <button
                                        type="button"
                                        className="register-submit-btn"
                                        onClick={handleDesktopGoogleSignup}
                                        disabled={loading}
                                    >
                                        <span>Sign up with Google (Desktop)</span>
                                    </button>
                                ) : (
                                    <GoogleLogin
                                        key={theme}
                                        onSuccess={handleGoogleSuccess}
                                        onError={() =>
                                            showNotification("Google sign-up failed.", "error")
                                        }
                                        theme={theme === "dark" ? "filled_black" : "outline"}
                                        size="large"
                                        shape="rectangular"
                                        text="signup_with"
                                        width="320"
                                    />
                                )}

                                <div className="register-divider">
                                    <span>or</span>
                                </div>

                            </div>
                        )}

                        {isGoogle && (
                            <div className="register-google-banner">
                                <FiCheck />
                                <span>Signed in with Google.</span>
                                <button
                                    type="button"
                                    onClick={cancelGoogleSignup}
                                >
                                    Use a different method
                                </button>
                            </div>
                        )}


                        {/* =====================================
                            PROFILE PHOTO (hidden in Google mode)
                           ===================================== */}

                        {!isGoogle && (
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
                        )}


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
                                readOnly={isGoogle}
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

                            {isGoogle ? (
                                <p className="register-validation valid">
                                    <FiCheck />
                                    Verified by Google
                                </p>
                            ) : (
                                <EmailVerification
                                    email={employee.email}
                                    emailValid={emailValid}
                                    verified={emailVerified}
                                    onVerified={handleEmailVerified}
                                />
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
                        <div className="register-field two-factor-register-option">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={twoFactorEnabled}
                                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                                />
                                <span>Enable Two-Factor Authentication (Email OTP)</span>
                            </label>
                        </div>

                        {/* =====================================
                            SUBMIT
                           ===================================== */}

                        <button
                            type="submit"
                            className="register-submit-btn"
                            disabled={
                                loading ||
                                (!isGoogle && !emailVerified) ||
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
                            {loading
                                ? "Creating account..."
                                : isGoogle
                                    ? "Finish sign-up"
                                    : "Create account"}
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
        </GoogleOAuthProvider>
    );
}

export default Register;