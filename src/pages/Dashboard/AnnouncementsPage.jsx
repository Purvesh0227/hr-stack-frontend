import { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiFileText,
    FiImage,
    FiBell
} from "react-icons/fi";
import AnnouncementModal, {
    ANNOUNCEMENT_TYPES
} from "../../components/AnnouncementModal";
import Pagination from "../../components/Pagination";
import Loader from "../../components/Loader";
import {
    getAnnouncements,
    deleteAnnouncement,
    getAnnouncementAttachmentUrl
} from "../../services/announcementService.js";
import { isRequestCancelled } from "../../services/api";
import { getErrorMessage } from "../../utils/errorUtils";
import "../../styles/announcements.css";

const PAGE_SIZE = 5;

const formatDateTime = (millis) =>
    millis
        ? new Date(millis).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short"
          })
        : "";

const typeLabel = (value) =>
    ANNOUNCEMENT_TYPES.find((t) => t.value === value)?.label || value;

function AnnouncementsPage() {
    const { role, showNotification } = useOutletContext();
    const isAdmin = role === "ADMIN";

    // showNotification is a new function every Dashboard render.
    // Keep it in a ref so it never retriggers the fetch effect (error -> toast -> refetch loop).
    const notifyRef = useRef(showNotification);
    useEffect(() => {
        notifyRef.current = showNotification;
    });
    const notify = (message, type) => notifyRef.current(message, type);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [typeFilter, setTypeFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

    // Filter change -> back to page 1
    const handleTypeChange = (value) => {
        setTypeFilter(value);
        setCurrentPage(1);
    };

    useEffect(() => {
        const controller = new AbortController();

        const load = async () => {
            try {
                setLoading(true);

                const { data } = await getAnnouncements({
                    page: currentPage - 1,
                    size: PAGE_SIZE,
                    type: typeFilter,
                    signal: controller.signal
                });

                // page vanished (last item deleted) -> go back one page
                if (data.totalPages > 0 && currentPage > data.totalPages) {
                    setCurrentPage(data.totalPages);
                    return;
                }

                setItems(data.content);
                setTotalPages(data.totalPages);
                setTotalElements(data.totalElements);
            } catch (error) {
                if (isRequestCancelled(error)) return;

                notifyRef.current(
                    getErrorMessage(error, "Unable to load announcements"),
                    "error"
                );
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        load();

        return () => controller.abort();
    }, [currentPage, typeFilter, refreshKey]);

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (announcement) => {
        setEditing(announcement);
        setModalOpen(true);
    };

    const handleDelete = async (announcement) => {
        if (!window.confirm(`Delete "${announcement.title}"?`)) return;

        try {
            await deleteAnnouncement(announcement.id);
            notify("Announcement deleted", "success");
            refresh();
        } catch (error) {
            notify(
                getErrorMessage(error, "Unable to delete announcement"),
                "error"
            );
        }
    };

    // Open the tab first (popup blockers), then point it at the signed URL
    const openAttachment = async (announcementId, attachment) => {
        const tab = window.open("", "_blank");

        try {
            const { data } = await getAnnouncementAttachmentUrl(
                announcementId,
                attachment.id
            );

            if (tab) {
                tab.location.href = data.url;
            } else {
                window.location.href = data.url;
            }
        } catch (error) {
            tab?.close();
            notify(
                getErrorMessage(error, "Unable to open file"),
                "error"
            );
        }
    };

    return (
        <div className="announcements-page">
            <div className="ann-page-header">
                <div>
                    <p className="dashboard-eyebrow">
                        {isAdmin ? "Admin Dashboard" : "Employee Dashboard"}
                    </p>
                    <h1>Announcements</h1>
                    <p className="ann-subtitle">
                        {isAdmin
                            ? "Post updates for everyone in the company."
                            : "Latest updates from your company."}
                    </p>
                </div>

                {isAdmin && (
                    <button
                        type="button"
                        className="ann-btn ann-btn-primary"
                        onClick={openCreate}
                    >
                        <FiPlus /> New Announcement
                    </button>
                )}
            </div>

            <div className="ann-toolbar">
                <select
                    value={typeFilter}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    aria-label="Filter by type"
                >
                    <option value="">All types</option>
                    {ANNOUNCEMENT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
                        </option>
                    ))}
                </select>

                <span className="ann-count">
                    {totalElements} announcement{totalElements === 1 ? "" : "s"}
                </span>
            </div>

            {loading ? (
                <Loader />
            ) : items.length === 0 ? (
                <div className="ann-empty">
                    <FiBell />
                    <strong>No announcements yet</strong>
                    <span>
                        {isAdmin
                            ? "Click “New Announcement” to post the first one."
                            : "Check back later."}
                    </span>
                </div>
            ) : (
                <div className="ann-list">
                    {items.map((item) => (
                        <article key={item.id} className="ann-card">
                            <div className="ann-card-top">
                                <span className={`ann-badge ann-badge-${item.type.toLowerCase()}`}>
                                    {typeLabel(item.type)}
                                </span>

                                {isAdmin && (
                                    <div className="ann-card-actions">
                                        <button
                                            type="button"
                                            className="ann-icon-btn"
                                            onClick={() => openEdit(item)}
                                            aria-label="Edit announcement"
                                        >
                                            <FiEdit2 />
                                        </button>
                                        <button
                                            type="button"
                                            className="ann-icon-btn ann-danger"
                                            onClick={() => handleDelete(item)}
                                            aria-label="Delete announcement"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <h3>{item.title}</h3>

                            <p className="ann-meta">
                                {item.createdByName} · {formatDateTime(item.createdOn)}
                                {item.updatedOn ? " · edited" : ""}
                            </p>

                            <p className="ann-message">{item.message}</p>

                            {item.attachments.length > 0 && (
                                <div className="ann-attachments">
                                    {item.attachments.map((file) => (
                                        <button
                                            key={file.id}
                                            type="button"
                                            className="ann-chip"
                                            onClick={() => openAttachment(item.id, file)}
                                        >
                                            {file.contentType === "application/pdf" ? (
                                                <FiFileText />
                                            ) : (
                                                <FiImage />
                                            )}
                                            <span>{file.fileName}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            )}

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {isAdmin && (
                <AnnouncementModal
                    isOpen={modalOpen}
                    announcement={editing}
                    onClose={() => setModalOpen(false)}
                    onSaved={() => {
                        setCurrentPage(1);
                        refresh();
                    }}
                />
            )}
        </div>
    );
}

export default AnnouncementsPage;