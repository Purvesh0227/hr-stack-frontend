import { FiSearch, FiX } from "react-icons/fi";
import { getMonthName } from "../../utils/salaryUtils";

function TableFilters({
    showSearch = true,
    searchValue,
    onSearchChange,
    searchPlaceholder = "Search...",

    statusOptions,              // [{ value, label }] -> shows status dropdown
    statusValue = "",
    onStatusChange,

    showMonthYear = false,      // Finance: month + year dropdowns
    monthValue = "",
    onMonthChange,
    yearValue = "",
    onYearChange,
    yearOptions = [],

    showDateRange = false,      // joining date range
    fromDate = "",
    toDate = "",
    onFromDateChange,
    onToDateChange,

    hasActiveFilters = false,
    onClear
}) {
    // "YYYY-MM-DD" strings compare correctly as text
    const invalidRange = fromDate && toDate && fromDate > toDate;

    return (
        <div className="table-filters">

            {/* Search */}
            {showSearch && (
                <div className="employee-search-wrapper">
                    <span className="employee-search-icon">
                        <FiSearch size={16} />
                    </span>

                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="employee-search-input"
                        maxLength={100}
                        aria-label="Search"
                    />
                </div>
            )}

            {/* Status */}
            {statusOptions && (
                <select
                    className="filter-control"
                    value={statusValue}
                    onChange={(e) => onStatusChange(e.target.value)}
                    aria-label="Filter by status"
                >
                    {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            )}

            {/* Month + Year */}
            {showMonthYear && (
                <>
                    <select
                        className="filter-control"
                        value={monthValue}
                        onChange={(e) => onMonthChange(e.target.value)}
                        aria-label="Filter by month"
                    >
                        <option value="">All Months</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (month) => (
                                <option key={month} value={month}>
                                    {getMonthName(month)}
                                </option>
                            )
                        )}
                    </select>

                    <select
                        className="filter-control"
                        value={yearValue}
                        onChange={(e) => onYearChange(e.target.value)}
                        aria-label="Filter by year"
                    >
                        <option value="">All Years</option>
                        {yearOptions.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </>
            )}

            {/* Joining date range */}
            {showDateRange && (
                <div className="filter-date-group">
                    <label>
                        <span>From</span>
                        <input
                            type="date"
                            className="filter-control"
                            value={fromDate}
                            max={toDate || undefined}
                            onChange={(e) => onFromDateChange(e.target.value)}
                            aria-label="Joining date from"
                        />
                    </label>

                    <label>
                        <span>To</span>
                        <input
                            type="date"
                            className="filter-control"
                            value={toDate}
                            min={fromDate || undefined}
                            onChange={(e) => onToDateChange(e.target.value)}
                            aria-label="Joining date to"
                        />
                    </label>
                </div>
            )}

            {/* Clear */}
            {hasActiveFilters && (
                <button
                    type="button"
                    className="filter-clear-btn"
                    onClick={onClear}
                >
                    <FiX size={14} /> Reset
                </button>
            )}

            {invalidRange && (
                <p className="filter-error" role="alert">
                    Start date cannot be after end date.
                </p>
            )}
        </div>
    );
}

export default TableFilters;