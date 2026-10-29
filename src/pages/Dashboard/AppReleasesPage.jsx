import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { FiPlus, FiDownload, FiEdit2, FiTrash2 } from "react-icons/fi";
import { getAdminAppReleases, getPublicAppReleases, deleteAppRelease } from "../../services/api";
import AppReleaseModal from "../../components/AppReleaseModal";
import Loader from "../../components/Loader";
import { open } from '@tauri-apps/plugin-opener';

export default function AppReleasesPage() {
    const { role, showNotification } = useOutletContext();
    const isAdmin = role === "ADMIN";

    const [releases, setReleases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRelease, setEditingRelease] = useState(null);

    const loadReleases = async () => {
        try {
            setLoading(true);
            const response = isAdmin 
                ? await getAdminAppReleases() 
                : await getPublicAppReleases();
            setReleases(response.data);
        } catch (error) {
            showNotification("Failed to load app releases", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReleases();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this release?")) return;
        try {
            await deleteAppRelease(id);
            showNotification("Release deleted", "success");
            loadReleases();
        } catch (error) {
            showNotification("Failed to delete", "error");
        }
    };

        const handleDownload = async (url) => {
        try {
            // Check if we are in Tauri
            if (window.__TAURI__) {
                await open(url);
            } else {
                window.open(url, "_blank");
            }
        } catch (error) {
            console.error("Failed to open link:", error);
            // Last resort fallback
            window.open(url, "_blank");
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            RELEASED: { bg: "rgba(16, 185, 129, 0.1)", color: "var(--status-active-text)", border: "1px solid rgba(16, 185, 129, 0.2)" },
            IN_REVIEW: { bg: "rgba(245, 158, 11, 0.1)", color: "var(--status-pending-text)", border: "1px solid rgba(245, 158, 11, 0.2)" },
            DRAFT: { bg: "rgba(107, 114, 128, 0.1)", color: "var(--text-secondary)", border: "1px solid rgba(107, 114, 128, 0.2)" }
        };
        const style = styles[status] || styles.DRAFT;
        
        return (
            <span style={{
                padding: "4px 10px",
                borderRadius: "99px",
                fontSize: "11px",
                fontWeight: "600",
                letterSpacing: "0.5px",
                background: style.bg,
                color: style.color,
                border: style.border,
                display: "inline-block",
                textAlign: "center",
                minWidth: "80px"
            }}>
                {status.replace("_", " ")}
            </span>
        );
    };

    // Reusable circular icon button style
    const iconBtnStyle = {
        width: "32px",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "8px",
        border: "1px solid var(--border-color)",
        background: "var(--bg-card)",
        color: "var(--text-secondary)",
        cursor: "pointer",
        transition: "all 0.2s ease"
    };

    return (
        <div className="attendance-page">
            {/* Header */}
            <div className="attendance-page-header">
                <div>
                    <p className="dashboard-eyebrow">
                        {isAdmin ? "Admin Dashboard" : "Employee Dashboard"}
                    </p>
                    <h1>App Releases</h1>
                    <p className="attendance-page-subtitle">
                        {isAdmin 
                            ? "Manage and publish mobile app versions." 
                            : "Download the latest version of the HR-Stack app."}
                    </p>
                </div>

                {isAdmin && (
                    <button 
                        className="primary-btn" 
                        style={{ display: "flex", alignItems: "center", gap: "8px" }}
                        onClick={() => { setEditingRelease(null); setModalOpen(true); }}
                    >
                        <FiPlus /> New Release
                    </button>
                )}
            </div>

            {/* Card */}
            <div className="attendance-card" style={{ padding: "0", overflow: "hidden" }}>
                <div className="attendance-table-header" style={{ padding: "20px", borderBottom: "none" }}>
                    <div>
                        <h3>Version History</h3>
                        <p>Total {releases.length} versions</p>
                    </div>
                </div>

                {loading ? (
                    <Loader />
                ) : releases.length === 0 ? (
                    <p className="no-attendance">No releases found.</p>
                ) : (
                                        <div className="attendance-table-wrapper">
                        {/* Set a maxWidth so the table doesn't stretch across the whole screen on large monitors */}
                        <table className="employee-table" style={{ maxWidth: "1000px", margin: "0" }}>
                            <thead>
                                <tr>
                                    <th style={{ width: "120px" }}>Version</th>
                                    <th>Release Notes</th>
                                    <th style={{ width: "150px" }}>Release Date</th>
                                    <th style={{ width: "140px" }}>Status</th>
                                    <th style={{ width: "150px" }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {releases.map((release) => (
                                    <tr key={release.id}>
                                        <td>
                                            <strong style={{ color: "var(--text-primary)" }}>{release.version}</strong>
                                        </td>

                                        <td style={{ 
                                            color: "var(--text-secondary)"
                                        }}>
                                            {release.releaseNotes}
                                        </td>

                                        <td style={{ color: "var(--text-secondary)" }}>
                                            {release.releaseDate}
                                        </td>
                                        
                                        <td>{getStatusBadge(release.status)}</td>
                                        <td>
                                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                                
                                                <button
                                                    onClick={() => handleDownload(release.downloadUrl)}
                                                    style={{
                                                        height: "32px",
                                                        padding: "0 14px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "6px",
                                                        borderRadius: "8px",
                                                        border: "1px solid var(--border-color)",
                                                        background: "var(--bg-hover-row)",
                                                        color: "var(--text-primary)",
                                                        fontSize: "12px",
                                                        fontWeight: "600",
                                                        cursor: "pointer",
                                                        transition: "background 0.2s ease"
                                                    }}
                                                    title="Download APK"
                                                >
                                                    <FiDownload size={14} /> Download
                                                </button>
                                                
                                                {isAdmin && (
                                                    <>
                                                        <button
                                                            style={iconBtnStyle}
                                                            onClick={() => { setEditingRelease(release); setModalOpen(true); }}
                                                            title="Edit Release"
                                                            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border-color)"; }}
                                                        >
                                                            <FiEdit2 size={14} />
                                                        </button>

                                                        <button
                                                            style={iconBtnStyle}
                                                            onClick={() => handleDelete(release.id)}
                                                            title="Delete Release"
                                                            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.borderColor = "var(--danger)"; e.currentTarget.style.background = "rgba(220, 38, 38, 0.05)"; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.background = "var(--bg-card)"; }}
                                                        >
                                                            <FiTrash2 size={14} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isAdmin && (
                <AppReleaseModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSaved={loadReleases}
                    release={editingRelease}
                />
            )}
        </div>
    );
}