import axios from "axios";
import API from "./api";

// Admin and emp
export const getAnnouncements = ({
    page = 0,
    size = 10,
    type = "",
    signal
} = {}) =>
    API.get("/announcements", {
        params: { page, size, type },
        signal
    });

export const getAnnouncementAttachmentUrl = (announcementId, attachmentId) =>
    API.get(`/announcements/${announcementId}/attachments/${attachmentId}/view-url`);

// Admin only
export const createAnnouncement = (data) =>
    API.post("/announcements", data);

export const updateAnnouncement = (id, data) =>
    API.put(`/announcements/${id}`, data);

export const deleteAnnouncement = (id) =>
    API.delete(`/announcements/${id}`);

export const getAnnouncementUploadUrl = (fileName, contentType) =>
    API.get("/announcements/attachments/upload-url", {
        params: { fileName, contentType }
    });

// Direct upload to storage (same pattern as employee documents)
export const uploadAnnouncementFile = (uploadUrl, file) =>
    axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type }
    });