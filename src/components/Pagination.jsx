import React from "react";

function Pagination({
    currentPage,
    totalPages,
    onPageChange
}) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <>
            <div className="hr-pagination">
                <button
                    type="button"
                    className="hr-pagination-btn"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>

                <div className="hr-pagination-pages">
                    {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                    ).map((page) => (
                        <button
                            key={page}
                            type="button"
                            className={`hr-pagination-page ${
                                currentPage === page ? "active" : ""
                            }`}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    className="hr-pagination-btn"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>

            <style>{`
                .hr-pagination {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 6px;
                    padding: 18px 20px;
                    box-sizing: border-box;
                    border-top: 1px solid var(--border-color);
                }

                .hr-pagination-pages {
                    display: flex;
                    align-items: right;
                    gap: 4px;
                }

                .hr-pagination button {
                    height: 34px;
                    min-width: 34px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 10px;
                    box-sizing: border-box;
                    border: 1px solid var(--border-color);
                    border-radius: 7px;
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-family: var(--font-family);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition:
                        background-color .18s ease,
                        border-color .18s ease,
                        color .18s ease;
                }

                .hr-pagination button:hover:not(:disabled) {
                    background: var(--bg-hover-row);
                    border-color: var(--border-strong);
                    color: var(--text-primary);
                }

                .hr-pagination-page.active {
                    background: var(--bg-primary-btn);
                    border-color: var(--bg-primary-btn);
                    color: var(--text-on-active);
                    font-weight: 600;
                }

                .hr-pagination-page.active:hover {
                    background: var(--bg-primary-btn-hover);
                    border-color: var(--bg-primary-btn-hover);
                    color: var(--text-on-active);
                }

                .hr-pagination button:disabled {
                    opacity: .45;
                    cursor: not-allowed;
                }

                .hr-pagination-btn {
                    min-width: 72px !important;
                }

                @media (max-width: 500px) {
                    .hr-pagination {
                        padding: 14px 10px;
                    }

                    .hr-pagination-btn {
                        min-width: 60px !important;
                        padding: 0 7px !important;
                    }

                    .hr-pagination-page {
                        min-width: 32px !important;
                        padding: 0 7px !important;
                    }
                }
            `}</style>
        </>
    );
}

export default Pagination;