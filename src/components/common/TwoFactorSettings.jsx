import { useEffect, useState } from "react";
import API from "../../services/api";
import "../../styles/SecuritySettings.css";

export default function TwoFactorSettings() {
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        let active = true;

        API.get("/two-factor")
            .then((response) => {
                if (active) {
                    setEnabled(response.data.twoFactorEnabled);
                }
            })
            .catch(() => {
                if (active) {
                    setMessage("Unable to load two-factor settings.");
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const handleToggle = async (event) => {
        const nextValue = event.target.checked;

        setSaving(true);
        setMessage("");

        try {
            const response = await API.put("/two-factor", {
                enabled: nextValue,
            });

            setEnabled(response.data.twoFactorEnabled);
            setMessage(
                nextValue
                    ? "Two-factor authentication enabled."
                    : "Two-factor authentication disabled."
            );
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to update two-factor settings."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="two-factor-settings">
            <div className="two-factor-settings__header">
                <div>
                    <h3>Two-Factor Authentication</h3>
                    <p>
                        Add an extra layer of security using an OTP sent
                        to your registered email during login.
                    </p>
                </div>
            </div>

            <label className="two-factor-settings__toggle">
                <input
                    type="checkbox"
                    checked={enabled}
                    onChange={handleToggle}
                    disabled={loading || saving}
                />

                <span>
                    {loading
                        ? "Loading settings..."
                        : enabled
                          ? "Enabled"
                          : "Disabled"}
                </span>
            </label>

            {message && (
                <p role="status" aria-live="polite">
                    {message}
                </p>
            )}
        </section>
    );
}
