
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiX, FiArrowRight } from "react-icons/fi";
import { getAnnouncements } from "../services/announcementService.js";
import "../styles/announcements.css";

const POLL_INTERVAL = 30_000;
const PAGE_SIZE = 50;

// changes 

function AnnouncementPopup({ role, email }) {
    const navigate = useNavigate();
    const [queue, setQueue] = useState([]);
    const pendingIdsRef = useRef(new Set());
    const seenIdsRef = useRef(new Set());
    const initializedRef = useRef(false);

    const userKey = email?.trim().toLowerCase();
    const storageKey = userKey
        ? `hrstack-announcements-seen:${userKey}`
        : null;

    useEffect(() => {
        // Announcements are intended for employees, not the admin who creates them.
        if (
            String(role || "").toUpperCase() === "ADMIN" ||
            !storageKey
        ) {
            return;
        }

        let active = true;

        try {
            const stored = localStorage.getItem(storageKey);

            if (stored !== null) {
                const ids = JSON.parse(stored);
                seenIdsRef.current = new Set(
                    Array.isArray(ids) ? ids : []
                );
                initializedRef.current = true;
            }
        } catch {
            seenIdsRef.current = new Set();
        }

        const checkAnnouncements = async () => {
            try {
                const { data } = await getAnnouncements({
                    page: 0,
                    size: PAGE_SIZE
                });

                if (!active) return;

                const announcements = Array.isArray(data?.content)
                    ? data.content
                    : [];

                // First visit: remember existing announcements without
                // unexpectedly displaying old announcements as new.
                if (!initializedRef.current) {
                    const initialIds = announcements
                        .map((item) => item.id)
                        .filter(Boolean);

                    seenIdsRef.current = new Set(initialIds);
                    initializedRef.current = true;

                    try {
                        localStorage.setItem(
                            storageKey,
                            JSON.stringify(initialIds)
                        );
                    } catch {
                        // The popup can still work if storage is unavailable.
                    }

                    return;
                }

                const newAnnouncements = announcements.filter(
                    (item) =>
                        item.id &&
                        !seenIdsRef.current.has(item.id) &&
                        !pendingIdsRef.current.has(item.id)
                );

                if (newAnnouncements.length === 0) return;

                // Prevent repeated polling from adding the same item twice.
                newAnnouncements.forEach((item) =>
                    pendingIdsRef.current.add(item.id)
                );

                setQueue((previous) => [
                    ...previous,
                    ...newAnnouncements
                ]);
            } catch {
                // A temporary API/network error should not interrupt the app.
            }
        };

        checkAnnouncements();

        const intervalId = window.setInterval(
            checkAnnouncements,
            POLL_INTERVAL
        );

        return () => {
            active = false;
            window.clearInterval(intervalId);
        };
    }, [role, storageKey]);

    const dismissCurrent = () => {
        const current = queue[0];
        if (!current) return;

        pendingIdsRef.current.delete(current.id);
        seenIdsRef.current.add(current.id);

        try {
            localStorage.setItem(
                storageKey,
                JSON.stringify([...seenIdsRef.current].slice(-500))
            );
        } catch {
            // Dismissal still works for the current session.
        }

        setQueue((previous) => previous.slice(1));
    };

    const openAnnouncements = () => {
        dismissCurrent();
        navigate("/announcements");
    };

    const announcement = queue[0];

    
if (!announcement) return null;


return (
    <div className="announcement-toast-container">
        <div
            className="announcement-toast"
            role="status"
            aria-live="polite"
        >
            <span className="announcement-toast-icon">
                <FiBell size={20} />
            </span>

            <div className="announcement-toast-content">
                <span className="announcement-toast-label">
                    COMPANY UPDATE
                </span>

                <strong>{announcement.title}</strong>

                <p>{announcement.message}</p>
            </div>

            <button
                type="button"
                className="announcement-toast-view"
                onClick={() => {
                    dismissCurrent();
                    navigate("/announcements");
                }}
            >
                View announcement <FiArrowRight size={16} />
            </button>

            <button
                type="button"
                className="announcement-toast-close"
                onClick={dismissCurrent}
                aria-label="Dismiss announcement"
            >
                <FiX size={18} />
            </button>
        </div>
    </div>
);

}

export default AnnouncementPopup;
