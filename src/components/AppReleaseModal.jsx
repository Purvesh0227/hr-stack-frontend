import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { useNotification } from "../contexts/NotificationContext";
import useSubmitLock from "../hooks/useSubmitLock";
import { createAppRelease, updateAppRelease } from "../services/api";

export default function AppReleaseModal({ isOpen, onClose, onSaved, release = null }) {
    const { showNotification } = useNotification();
    const [loading, run] = useSubmitLock();
    const isEdit = Boolean(release);

    const [form, setForm] = useState({
        version: "",
        releaseNotes: "",
        releaseDate: "",
        status: "DRAFT"
    });

    useEffect(() => {
        if (isOpen) {
            setForm({
                version: release?.version || "",
                releaseNotes: release?.releaseNotes || "",
                releaseDate: release?.releaseDate || new Date().toISOString().split('T')[0],
                status: release?.status || "DRAFT"
            });
        }
    }, [isOpen, release]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        run(async () => {
            try {
                if (isEdit) {
                    await updateAppRelease(release.id, form);
                    showNotification("Release updated", "success");
                } else {
                    await createAppRelease(form);
                    showNotification("Release created", "success");
                }
                onSaved();
                onClose();
            } catch (error) {
                showNotification(
                    error.response?.data?.error || "Failed to save release",
                    "error"
                );
            }
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: "500px", width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                    <h2>{isEdit ? "Edit Release" : "New App Release"}</h2>
                    <button onClick={onClose} className="cancel-btn" style={{ border: "none" }}><FiX size={20} /></button>
                </div>
                
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <div className="login-field">
                        <label>Version Number</label>
                        <input
                            type="text"
                            placeholder="e.g. 1.0.0 (without 'v')"
                            value={form.version}
                            onChange={(e) => setForm({ ...form, version: e.target.value })}
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label>Release Date</label>
                        <input
                            type="date"
                            value={form.releaseDate}
                            onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label>Status</label>
                        <select
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                            className="filter-control"
                            style={{ width: "100%", height: "44px" }}
                        >
                            <option value="DRAFT">Draft</option>
                            <option value="IN_REVIEW">In Review</option>
                            <option value="RELEASED">Released</option>
                        </select>
                    </div>

                    <div className="login-field">
                        <label>Release Notes</label>
                        <textarea
                            rows={4}
                            value={form.releaseNotes}
                            onChange={(e) => setForm({ ...form, releaseNotes: e.target.value })}
                            placeholder="What's new in this version?"
                            required
                            style={{
                                width: "100%",
                                padding: "12px",
                                borderRadius: "8px",
                                border: "1px solid var(--border-color)",
                                background: "var(--bg-input)",
                                color: "var(--text-primary)",
                                fontFamily: "var(--font-family)"
                            }}
                        />
                    </div>

                    <div className="modal-buttons" style={{ marginTop: "10px" }}>
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? "Saving..." : "Save Release"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}