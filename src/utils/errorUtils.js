
export const getErrorMessage = (error, fallback) => {
    const data = error.response?.data;

    return (
        data?.error ||
        data?.message ||
        (typeof data === "string" ? data : null) ||
        fallback
    );
};