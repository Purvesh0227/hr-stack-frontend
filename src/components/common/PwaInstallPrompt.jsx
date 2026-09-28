import { useEffect, useState } from "react";
import {
    FiX,
    FiZap,
    FiWifi,
    FiSmartphone,
    FiDownload
} from "react-icons/fi";
import "../../styles/PwaInstallPrompt.css";

const DISMISS_KEY = "hrstack_pwa_install_dismissed";

function PwaInstallPrompt() {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [dontRemind, setDontRemind] = useState(false);

    useEffect(() => {
        const isStandalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone === true;

        if (isStandalone) {
            return;
        }

        const dismissed = localStorage.getItem(DISMISS_KEY);

        if (dismissed === "true") {
            return;
        }

        const handleBeforeInstallPrompt = (event) => {
            event.preventDefault();

            setInstallPrompt(event);
            setShowModal(true);
        };

        const handleAppInstalled = () => {
            setShowModal(false);
            setInstallPrompt(null);
        };

        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt
        );

        window.addEventListener(
            "appinstalled",
            handleAppInstalled
        );

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            );

            window.removeEventListener(
                "appinstalled",
                handleAppInstalled
            );
        };
    }, []);

    const saveDontRemindPreference = () => {
        if (dontRemind) {
            localStorage.setItem(DISMISS_KEY, "true");
        }
    };

    const handleInstall = async () => {
        if (!installPrompt) {
            return;
        }

        saveDontRemindPreference();

        await installPrompt.prompt();

        setInstallPrompt(null);
        setShowModal(false);
    };

    const handleClose = () => {
        saveDontRemindPreference();
        setShowModal(false);
    };

    if (!showModal) {
        return null;
    }

    return (
        <div className="pwa-install-overlay">
            <div
                className="pwa-install-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="pwa-install-title"
            >
                <button
                    type="button"
                    className="pwa-install-close"
                    onClick={handleClose}
                    aria-label="Close"
                >
                    <FiX />
                </button>

                <div className="pwa-install-icon">
                    <img
                        src="/hr-stack-frontend/icons/icon-192.png"
                        alt="HR-Stack"
                    />
                </div>

                <h2 id="pwa-install-title">
                    Install HR-Stack App
                </h2>

                <p className="pwa-install-description">
                    Get quick access to HR-Stack on your device
                    for a faster and smoother experience.
                </p>

                <div className="pwa-install-benefits">
                    <div className="pwa-benefit">
                        <span className="pwa-benefit-icon">
                            <FiZap />
                        </span>

                        <span>Fast & reliable</span>
                    </div>

                    <div className="pwa-benefit">
                        <span className="pwa-benefit-icon">
                            <FiWifi />
                        </span>

                        <span>Works offline</span>
                    </div>

                    <div className="pwa-benefit">
                        <span className="pwa-benefit-icon">
                            <FiSmartphone />
                        </span>

                        <span>Access from your home screen</span>
                    </div>
                </div>

                <label className="pwa-dont-remind">
                    <input
                        type="checkbox"
                        checked={dontRemind}
                        onChange={(event) =>
                            setDontRemind(event.target.checked)
                        }
                    />

                    <span>Don't remind me again</span>
                </label>

                <div className="pwa-install-actions">
                    <button
                        type="button"
                        className="pwa-not-now"
                        onClick={handleClose}
                    >
                        Not Now
                    </button>

                    <button
                        type="button"
                        className="pwa-install-button"
                        onClick={handleInstall}
                    >
                        <FiDownload />
                        <span>Install</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PwaInstallPrompt;