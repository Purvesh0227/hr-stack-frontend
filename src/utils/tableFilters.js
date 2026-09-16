export const filterBySearch = (records, searchTerm, field) => {
    if (!searchTerm.trim()) {
        return records;
    }

    const search = searchTerm.toLowerCase();

    return records.filter((record) =>
        record[field]
            ?.toString()
            .toLowerCase()
            .includes(search)
    );
};

export const filterByMonth = (records, selectedMonth) => {
    if (selectedMonth === "") {
        return records;
    }

    return records.filter((record) => {
        const recordMonth = new Date(record.markedOn).getMonth() + 1;
        return recordMonth === Number(selectedMonth);
    });
};