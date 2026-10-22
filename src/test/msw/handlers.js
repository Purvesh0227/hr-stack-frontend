import { http, HttpResponse } from "msw";


const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const url = (path) => `${API_BASE}${path}`;

const emp = (path) => `${API_BASE}/employee${path}`;



export const handlers = [
    // --- LOGIN ---
    http.post(emp("/login"), async ({ request }) => {
        const body = await request.json();

        if (body.email === "admin@example.com" && body.password === "Test@1234") {
            return HttpResponse.json({
                token: "fake-jwt-token",
                employee: {
                    id: "11111111-1111-1111-1111-111111111111",
                    empId: "HRStack_2025_IT_001",
                    firstName: "Admin",
                    lastName: "One",
                    email: "admin@example.com",
                    mobile: "9999999999",
                    role: "ADMIN",
                    status: "ACTIVE"
                }
            });
        }

        return HttpResponse.json(
            { error: "Invalid email or password" },
            { status: 401 }
        );
    }),

    http.post(emp("/login/verify-otp"), () =>
        HttpResponse.json({ token: "fake-jwt-after-otp", employee: { id: "1", email: "user@example.com", role: "EMPLOYEE" } })
    ),
    http.post(emp("/login/resend-otp"), () =>
        HttpResponse.json({ mfaRequired: true, mfaToken: "mfa", maskedEmail: "u***@example.com", resendAvailableInSeconds: 60 })
    ),

    // --- EMPLOYEES ---
    http.get(emp("/allEmployees"), () =>
        HttpResponse.json({
            content: [],
            page: 0,
            size: 10,
            totalElements: 0,
            totalPages: 0
        })
    ),

    // --- ADMIN PROFILE ---
    http.get(emp("/adminProfile"), () =>
        HttpResponse.json({
            id: "11111111-1111-1111-1111-111111111111",
            empId: "HRStack_2025_IT_001",
            firstName: "Admin",
            lastName: "One",
            email: "admin@example.com",
            role: "ADMIN",
            status: "ACTIVE"
        })
    ),

    // --- ATTENDANCE ---
    http.get(emp("/attendance/view"), () =>
        HttpResponse.json({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 })
    ),
    http.post(emp("/attendance"), () =>
        HttpResponse.json({ uuid: "att-1", empId: "HRStack_2025_IT_001", markedOn: Date.now(), status: "PRESENT" })
    ),

    // --- SALARY ---
    http.get(emp("/salary/view"), () =>
        HttpResponse.json({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 })
    ),

    // --- NOTIFICATIONS ---
    http.get(emp("/notifications"), () =>
        HttpResponse.json({ notifications: [], unreadCount: 0 })
    ),

    // --- ANNOUNCEMENTS (used by AnnouncementPopup polling) ---
    http.get(emp("/announcements"), () =>
        HttpResponse.json({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 })
    )
];