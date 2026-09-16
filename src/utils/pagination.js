export const paginate = (
    records,
    currentPage,
    recordsPerPage
) => {
    const totalPages = Math.ceil(
        records.length / recordsPerPage
    );

    const startIndex =
        (currentPage - 1) * recordsPerPage;

    const endIndex =
        startIndex + recordsPerPage;

    const currentItems =
        records.slice(startIndex, endIndex);

    return {
        currentItems,
        totalPages,
        startIndex,
        endIndex
    };
};