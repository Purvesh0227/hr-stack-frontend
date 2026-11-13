import "../styles/global.css";

function SkeletonTable({ rows = 5, cols = 6 }) {
    return (
        <div style={{ 
            padding: "20px", 
            width: "100%", 
            boxSizing: "border-box",
            animation: "skeleton-pulse 1.5s infinite ease-in-out" 
        }}>
            {/* Header Row */}
            <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
                {Array.from({ length: cols }).map((_, i) => (
                    <div key={i} style={{ 
                        height: "16px", 
                        background: "var(--border-color)", 
                        borderRadius: "4px", 
                        flex: 1 
                    }} />
                ))}
            </div>

            {/* Body Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                    {Array.from({ length: cols }).map((_, colIndex) => (
                        <div key={colIndex} style={{ 
                            height: "40px", 
                            background: "var(--bg-hover-row)", 
                            borderRadius: "6px", 
                            flex: 1 
                        }} />
                    ))}
                </div>
            ))}

            <style>{`
                @keyframes skeleton-pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}

export default SkeletonTable;