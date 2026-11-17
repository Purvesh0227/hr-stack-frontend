import { useEffect } from "react";
import { 
    getAllEmployees, 
    getAllAdmins, 
    getAdminSupportTickets,
    getMySupportTickets,
    getAdminAppReleases,   
    getPublicAppReleases,
    getAdminProfile, 
    getEmployeeById    
} from "../services/api";
import { getAnnouncements } from "../services/announcementService"; 
import { getNotifications } from "../services/notificationService"; 
import { readStorageItem } from "../utils/storage";

const TEN_MINUTES = 10 * 60 * 1000; 

export default function useBackgroundSync() {
    useEffect(() => {
        const syncData = async () => {
            
            if (!navigator.onLine) return;
            
            const role = readStorageItem("role");
            const isAdmin = role === "ADMIN";

            try {
                console.log("[Background Sync] Fetching latest data...");
                
                getAnnouncements({ page: 0, size: 5 });
                getNotifications();
                
                if (isAdmin) {
                    if (email) getAdminProfile(email);
                    getAllEmployees({ page: 0, size: 10 });
                    getAllAdmins({ page: 0, size: 10 });
                    getAdminSupportTickets("ALL", 0, 10);
                    getAdminAppReleases(); 
                } else {
                    if (uuid) getEmployeeById(uuid);
                    getMySupportTickets(0, 5);
                    getPublicAppReleases(); 
                }
            } catch (error) {
                console.error("[Background Sync] Failed:", error);
            }
        };

        // Run the timer
        const interval = setInterval(() => {
            // Only trigger if the user has switched to another tab (app is hidden)
            if (document.visibilityState === "hidden") {
                syncData();
            }
        }, TEN_MINUTES);

        return () => clearInterval(interval);
    }, []);
}