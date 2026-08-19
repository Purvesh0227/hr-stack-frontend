const MONTH_NAMES = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
];

// Convert numeric month (1-12) to a readable month name
export const getMonthName = (month) => {
    return MONTH_NAMES[month - 1] || month;
};

// Format a number/BigDecimal-string amount as INR currency
export const formatCurrency = (amount) => {
    const value = Number(amount) || 0;
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

// Sort salary slips newest to oldest (by year, then month)
export const sortSlipsNewestFirst = (slips) => {
    return [...slips].sort((a, b) => {
        if (b.year !== a.year) {
            return b.year - a.year;
        }
        return b.month - a.month;
    });
};