import { useEffect, useRef, useState } from "react";
import { FiX, FiPaperclip, FiFileText, FiImage, FiTrash2 } from "react-icons/fi";
import {
    createAnnouncement,
    updateAnnouncement,
    getAnnouncementUploadUrl,
    uploadAnnouncementFile
} from "../services/Announcementservice.js";
import { useNotification } from "../contexts/NotificationContext";
import useSubmitLock from "../hooks/useSubmitLock";
import { getErrorMessage } from "../utils/errorUtils";
import "../styles/announcements.css";

export const ANNOUNCEMENT_TYPES = [
    { value: "GENERAL", label: "General" },
    { value: "HOLIDAY", label: "Holiday" },
    { value: "POLICY", label: "Policy" },
    { value: "EVENT", label: "Event" },
    { value: "MAINTENANCE", label: "Maintenance" },
    { value: "URGENT", label: "Urgent" }
];

const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp"
];

const formatSize = (bytes) =>
    bytes < 1024 * 1024
        ? `${Math.max(1, Math.round(bytes / 1024))} KB`
        : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

// announcement = null -> create mode, object -> edit mode
function AnnouncementModal({ isOpen, onClose, onSaved, announcement = null }) {
    const { showNotification } = useNotification();
    const [loading, run] = useSubmitLock();
    const fileInputRef = useRef(null);

    const isEdit = Boolean(announcement);

    const [type, setType] = useState("GENERAL");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [newFiles, setNewFiles] = useState([]);              // File[]
    const [removedIds, setRemovedIds] = useState([]);          // existing attachment ids
    const [fileError, setFileError] = useState("");

    // Fill / reset the form every time the modal opens
    useEffect(() => {
        if (!isOpen) return;

        setType(announcement?.type || "GENERAL");
        setTitle(announcement?.title || "");
        setMessage(announcement?.message || "");
        setNewFiles([]);
        setRemovedIds([]);
        setFileError("");
    }, [isOpen, announcement]);

    // Esc closes (not while saving)
    useEffect(() => {
        if (!isOpen) return;

        const onKey = (e) => {
            if (e.key === "Escape" && !loading) onClose();
        };

        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen, loading, onClose]);

    if (!isOpen) return null;

    const keptExisting = (announcement?.attachments || []).filter(
        (a) => !removedIds.includes(a.id)
    );
    const totalFiles = keptExisting.length + newFiles.length;

    const formValid = title.trim() && message.trim();

    const handlePickFiles = (e) => {
        const picked = Array.from(e.target.files || []);
        e.target.value = "";               // allows picking the same file again
        setFileError("");

        const accepted = [];

        for (const file of picked) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                setFileError(`${file.name}: only PDF, PNG, JPG or WEBP allowed`);
                continue;
            }
            if (file.size > MAX_FILE_BYTES) {
                setFileError(`${file.name}: file is larger than 10 MB`);
                continue;
            }
            if (totalFiles + accepted.length >= MAX_FILES) {
                setFileError(`Maximum ${MAX_FILES} attachments allowed`);
                break;
            }
            accepted.push(file);
        }

        if (accepted.length) {
            setNewFiles((current) => [...current, ...accepted]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formValid) return;

        run(async () => {
            try {
                // 1) upload new files straight to storage
                const uploaded = [];

                for (const file of newFiles) {
                    const { data } = await getAnnouncementUploadUrl(file.name, file.type);
                    await uploadAnnouncementFile(data.uploadUrl, file);

                    uploaded.push({
                        objectKey: data.objectKey,
                        fileName: file.name,
                        contentType: file.type,
                        size: file.size
                    });
                }

                // 2) save the announcement
                const payload = {
                    title: title.trim(),
                    message: message.trim(),
                    type,
                    newAttachments: uploaded,
                    removeAttachmentIds: removedIds
                };

                if (isEdit) {
                    await updateAnnouncement(announcement.id, payload);
                } else {
                    await createAnnouncement(payload);
                }

                showNotification(
                    isEdit ? "Announcement updated" : "Announcement posted",
                    "success"
                );
                onSaved();
                onClose();
            } catch (error) {
                showNotification(
                    getErrorMessage(error, "Unable to save announcement"),
                    "error"
                );
            }
        });
    };

    const FileIcon = ({ contentType }) =>
        contentType === "application/pdf" ? <FiFileText /> : <FiImage />;

    return (
        <div
            className="ann-modal-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !loading) onClose();
            }}
        >
            <div className="ann-modal" role="dialog" aria-modal="true">
                <div className="ann-modal-header">
                    <div>
                        <h2>{isEdit ? "Edit Announcement" : "New Announcement"}</h2>
                        <p>Visible to all admins and employees.</p>
                    </div>
                    <button
                        type="button"
                        className="ann-icon-btn"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close"
                    >
                        <FiX />
                    </button>
                </div>

                <form className="ann-form" onSubmit={handleSubmit}>
                    <div className="ann-field">
                        <label htmlFor="ann-type">Type</label>
                        <select
                            id="ann-type"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            {ANNOUNCEMENT_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="ann-field">
                        <label htmlFor="ann-title">Title</label>
                        <input
                            id="ann-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={150}
                            placeholder="e.g. Office closed on Friday"
                            required
                        />
                    </div>

                    <div className="ann-field">
                        <label htmlFor="ann-message">
                            Message
                            <span className="ann-counter">{message.length}/5000</span>
                        </label>
                        <textarea
                            id="ann-message"
                            rows={6}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={5000}
                            placeholder="Write the announcement..."
                            required
                        />
                    </div>

                    <div className="ann-field">
                        <label>
                            Attachments
                            <span className="ann-counter">
                                {totalFiles}/{MAX_FILES} · PDF, PNG, JPG, WEBP · 10 MB each
                            </span>
                        </label>

                        <button
                            type="button"
                            className="ann-attach-btn"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={totalFiles >= MAX_FILES}
                        >
                            <FiPaperclip /> Add PDF or image
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            hidden
                            multiple
                            accept="application/pdf,image/png,image/jpeg,image/webp"
                            onChange={handlePickFiles}
                        />

                        {fileError && <p className="ann-error">{fileError}</p>}

                        {(keptExisting.length > 0 || newFiles.length > 0) && (
                            <ul className="ann-file-list">
                                {keptExisting.map((file) => (
                                    <li key={file.id}>
                                        <FileIcon contentType={file.contentType} />
                                        <span className="ann-file-name">{file.fileName}</span>
                                        <small>{formatSize(file.size)}</small>
                                        <button
                                            type="button"
                                            className="ann-icon-btn"
                                            onClick={() =>
                                                setRemovedIds((ids) => [...ids, file.id])
                                            }
                                            aria-label={`Remove ${file.fileName}`}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </li>
                                ))}

                                {newFiles.map((file, index) => (
                                    <li key={`${file.name}-${index}`}>
                                        <FileIcon contentType={file.type} />
                                        <span className="ann-file-name">{file.name}</span>
                                        <small>{formatSize(file.size)}</small>
                                        <button
                                            type="button"
                                            className="ann-icon-btn"
                                            onClick={() =>
                                                setNewFiles((files) =>
                                                    files.filter((_, i) => i !== index)
                                                )
                                            }
                                            aria-label={`Remove ${file.name}`}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="ann-modal-actions">
                        <button
                            type="button"
                            className="ann-btn ann-btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="ann-btn ann-btn-primary"
                            disabled={!formValid || loading}
                        >
                            {loading
                                ? "Saving..."
                                : isEdit
                                    ? "Save changes"
                                    : "Post announcement"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AnnouncementModal;