const safeStorage = {
    getItem(key) {
        try {
            return window.localStorage.getItem(key);
        } catch (error) {
            console.warn(`Unable to read localStorage key: ${key}`, error);
            return null;
        }
    },
    setItem(key, value) {
        try {
            window.localStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.warn(`Unable to write localStorage key: ${key}`, error);
            return false;
        }
    },
    removeItem(key) {
        try {
            window.localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn(`Unable to remove localStorage key: ${key}`, error);
            return false;
        }
    },
    clear() {
        try {
            window.localStorage.clear();
            return true;
        } catch (error) {
            console.warn("Unable to clear localStorage", error);
            return false;
        }
    }
};

export const readStorageItem = (key) => safeStorage.getItem(key);

export const readStorageJson = (key, fallback = null) => {
    const rawValue = safeStorage.getItem(key);

    if (!rawValue || rawValue === "undefined") {
        return fallback;
    }

    try {
        return JSON.parse(rawValue);
    } catch (error) {
        console.warn(`Stored value for ${key} is not valid JSON`, error);
        return fallback;
    }
};

export const writeStorageValue = (key, value) =>
    safeStorage.setItem(key, String(value));

export const writeStorageJson = (key, value) =>
    safeStorage.setItem(key, JSON.stringify(value));

export const clearStorage = () => safeStorage.clear();

export const storageKeys = {
    token: "token",
    employee: "employee",
    email: "email",
    role: "role"
};
