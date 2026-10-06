export function formatPhoneNumber(value) {
    if (value === null || value === undefined || value === "") {
        return value;
    }

    const original = String(value).trim();

    if (!original) {
        return original;
    }

    let digits = original.replace(/\D/g, "");

    if (digits.length > 10 && digits.startsWith("91")) {
        digits = digits.substring(2);
    }
    // only format 10 digit no. 
    if (digits.length !== 10) {
        return original;
    }
    return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
}