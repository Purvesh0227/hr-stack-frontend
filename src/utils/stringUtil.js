export const toDisplayText = (value) => {
    if (!value || !value.trim()) {
        return "";
    }

    return value
        .replace(/_/g, " ")
        .toLowerCase()
        .split(" ")
        .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
};