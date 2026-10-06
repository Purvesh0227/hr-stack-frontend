const DEFAULT_OPTIONS = [5, 10, 25, 50];

function PageSizeSelect({ value, onChange, options = DEFAULT_OPTIONS }) {
    return (
        <label className="page-size-select">
            <span>Rows per page</span>

            <select
                className="filter-control"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                aria-label="Rows per page"
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </label>
    );
}

export default PageSizeSelect;