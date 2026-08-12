// Format Unix timestamp in milliseconds
export const formatDateTime = (timestamp) => {

    if (!timestamp) {
        return "-";
    }

    return new Date(Number(timestamp)).toLocaleString();
};


// Format only date
export const formatDate = (timestamp) => {

    if (!timestamp) {
        return "-";
    }

    return new Date(Number(timestamp)).toLocaleDateString();
};


// Convert date input YYYY-MM-DD to Unix milliseconds
export const dateToMillis = (date) => {

    if (!date) {
        return Date.now();
    }

    return new Date(
        `${date}T00:00:00`
    ).getTime();
};