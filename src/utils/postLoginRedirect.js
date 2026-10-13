const KEY = "postLoginPath";
const MAX_AGE_MS = 10 * 60 * 1000; 
const ALLOWED_PREFIX = "/attendance/scan";

const isAllowed = (path) =>
    typeof path === "string" &&
    path.startsWith(ALLOWED_PREFIX) &&
    !path.startsWith("//");

export const savePostLoginPath = (path) => {
    if (!isAllowed(path)) return;

    try {
        sessionStorage.setItem(
            KEY,
            JSON.stringify({ path, savedOn: Date.now() })
        );
    } catch {
        
    }
};

export const clearPostLoginPath = () => {
    try {
        sessionStorage.removeItem(KEY);
    } catch {
        
    }
};


export const consumePostLoginPath = () => {
    try {
        const raw = sessionStorage.getItem(KEY);
        sessionStorage.removeItem(KEY);

        if (!raw) return "/";

        const { path, savedOn } = JSON.parse(raw);

        if (!isAllowed(path) || Date.now() - Number(savedOn) > MAX_AGE_MS) {
            return "/";
        }

        return path;
    } catch {
        return "/";
    }
};