// Convert date input YYYY-MM-DD to Unix milliseconds
export const dateToMillis = (date) => {
    if (!date) {
        return null;
    }

    return new Date(`${date}T00:00:00`).getTime();
};


// Format Unix milliseconds into readable date/time
export const formatDateTime = (timestamp) => {
    if (!timestamp) {
        return "-";
    }

    return new Date(Number(timestamp)).toLocaleString();
};


// Format Unix milliseconds into only time
export const formatTime = (timestamp) => {
    if (!timestamp) {
        return "-";
    }

    return new Date(Number(timestamp)).toLocaleTimeString();
};


// Format Unix milliseconds into date
export const formatDate = (timestamp) => {
    if (!timestamp) {
        return "-";
    }

    return new Date(Number(timestamp)).toLocaleDateString();
};