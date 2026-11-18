import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaFileAlt, FaUserCheck, FaHeadset } from "react-icons/fa";
import { getAnalytics, isRequestCancelled } from "../../services/api";
import "../../styles/analytics.css";

/* ---------- chart helpers ---------- */
const W = 620, H = 230, L = 40, R = 580, T = 20, B = 190;
const STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];

// 3 intervals -> 4 grid lines. Returns { lo, step }.
function makeAxis(minV, maxV, fromZero) {
    const base = fromZero
        ? 0
        : Math.max(0, minV - Math.max(1, (maxV - minV) * 0.4));
    for (const s of STEPS) {
        const lo = fromZero ? 0 : Math.floor(base / s) * s;
        if (lo + s * 3 >= maxV) return { lo, step: s };
    }
    return { lo: 0, step: STEPS[STEPS.length - 1] };
}

const scaleY = (v, axis) =>
    B - ((v - axis.lo) / (axis.step * 3)) * (B - T);

const ticks = (axis) => [0, 1, 2, 3].map((k) => axis.lo + axis.step * k);

function Grid({ axis, side = "left" }) {
    return (
        <>
            {ticks(axis).map((v) => {
                const y = scaleY(v, axis);
                return (
                    <g key={`${side}-${v}`}>
                        {side === "left" && (
                            <line x1={L} y1={y} x2={R} y2={y} className="an-grid" />
                        )}
                        <text
                            x={side === "left" ? L - 10 : R + 10}
                            y={y + 4}
                            textAnchor={side === "left" ? "end" : "start"}
                            className={side === "left" ? "an-axis an-axis-blue" : "an-axis"}
                        >
                            {v}
                        </text>
                    </g>
                );
            })}
        </>
    );
}

/* ---------- Workforce growth (new hires bars + headcount line) ---------- */
function GrowthChart({ trend, total }) {
    const n = trend.length;
    if (!n) return <p className="an-empty">No onboarding data yet.</p>;

    const hires = trend.map((t) => t.count);

    // Walk back from today's total to get headcount at end of each month
    const heads = [];
    let h = total;
    for (let i = n - 1; i >= 0; i--) {
        heads[i] = Math.max(0, h);
        h -= hires[i];
    }

    const left = makeAxis(Math.min(...heads), Math.max(...heads), false);
    const right = makeAxis(0, Math.max(...hires, 1), true);
    const step = (R - L) / n;
    const cx = (i) => L + step * (i + 0.5);
    const bw = Math.min(36, step * 0.45);

    const pts = heads.map((v, i) => [cx(i), scaleY(v, left)]);
    const line = pts.map((p) => p.join(",")).join(" ");
    const area = `M${pts[0][0]} ${pts[0][1]} ${pts
        .slice(1)
        .map((p) => `L${p[0]} ${p[1]}`)
        .join(" ")} L${pts[n - 1][0]} ${B} L${pts[0][0]} ${B} Z`;

    return (
        <svg
            className="an-svg"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="New hires per month and total headcount"
        >
            <defs>
                <linearGradient id="an-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="var(--an-line)" stopOpacity=".18" />
                    <stop offset="1" stopColor="var(--an-line)" stopOpacity="0" />
                </linearGradient>
            </defs>

            <Grid axis={left} side="left" />
            <Grid axis={right} side="right" />

            <g className="an-hires">
                {hires.map((v, i) => (
                    <rect
                        key={i}
                        x={cx(i) - bw / 2}
                        y={scaleY(v, right)}
                        width={bw}
                        height={Math.max(0, B - scaleY(v, right))}
                        rx="5"
                    >
                        <title>{`${trend[i].month}: ${v} new hires`}</title>
                    </rect>
                ))}
            </g>

            <path d={area} fill="url(#an-area)" />
            <polyline points={line} className="an-line" />

            {pts.map(([x, y], i) => (
                <g key={i}>
                    <circle cx={x} cy={y} r="4.5" className="an-dot">
                        <title>{`${trend[i].month}: ${heads[i]} employees`}</title>
                    </circle>
                    <text x={x} y={y - 11} textAnchor="middle" className="an-label an-label-blue">
                        {heads[i]}
                    </text>
                </g>
            ))}

            {trend.map((t, i) => (
                <text key={t.month + i} x={cx(i)} y={212} textAnchor="middle" className="an-axis">
                    {t.month}
                </text>
            ))}
        </svg>
    );
}

/* ---------- Attendance (stacked present + absent) ---------- */
function AttendanceChart({ week }) {
    const n = week.length;
    if (!n) return <p className="an-empty">No attendance data yet.</p>;

    const maxTotal = Math.max(...week.map((d) => d.present + d.absent), 1);
    const axis = makeAxis(0, maxTotal, true);
    const step = (R - L) / n;
    const cx = (i) => L + step * (i + 0.5);
    const bw = Math.min(44, step * 0.5);

    return (
        <svg
            className="an-svg"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="Present and absent employees per day"
        >
            <Grid axis={axis} side="left" />
            {week.map((d, i) => {
                const yPresent = scaleY(d.present, axis);
                const yTop = scaleY(d.present + d.absent, axis);
                return (
                    <g key={d.day + i}>
                        <rect
                            x={cx(i) - bw / 2}
                            y={yPresent}
                            width={bw}
                            height={Math.max(0, B - yPresent)}
                            rx="3"
                            className="an-present"
                        >
                            <title>{`${d.day}: ${d.present} present`}</title>
                        </rect>
                        {d.absent > 0 && (
                            <rect
                                x={cx(i) - bw / 2}
                                y={yTop}
                                width={bw}
                                height={Math.max(0, yPresent - yTop)}
                                rx="3"
                                className="an-absent"
                            >
                                <title>{`${d.day}: ${d.absent} absent`}</title>
                            </rect>
                        )}
                        <text x={cx(i)} y={212} textAnchor="middle" className="an-axis">
                            {d.day}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

/* ---------- small pieces ---------- */
const STATUS_META = {
    ACTIVE: { label: "Active", cls: "an-pill-ok" },
    PENDING: { label: "Onboarding", cls: "an-pill-prog" },
    PENDING_VERIFICATION: { label: "Verification pending", cls: "an-pill-wait" }
};

const initials = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0].toUpperCase())
        .join("") || "?";

const ACTION_ICON = {
    PENDING_VERIFICATION: <FaFileAlt />,
    PENDING: <FaUsers />,
    OPEN: <FaHeadset />
};

function Kpi({ icon, tone, label, value, sub }) {
    return (
        <div className="an-card an-kpi">
            <div className={`an-kpi-icon an-tone-${tone}`}>{icon}</div>
            <div className="an-kpi-body">
                <p>{label}</p>
                <h3>{value}</h3>
                <span>{sub}</span>
            </div>
        </div>
    );
}

function Skeleton() {
    return (
        <div className="an-root" aria-busy="true">
            <div className="an-grid-kpi">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="an-card an-skel" style={{ height: 100 }} />
                ))}
            </div>
            <div className="an-grid-2">
                <div className="an-card an-skel" style={{ height: 320 }} />
                <div className="an-card an-skel" style={{ height: 320 }} />
            </div>
        </div>
    );
}

/* ---------- main ---------- */
function AdminAnalytics() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async (signal) => {
        setLoading(true);
        setError("");
        try {
            const res = await getAnalytics({ signal });
            setData(res.data);
        } catch (err) {
            if (isRequestCancelled(err)) return;
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Could not load analytics."
            );
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal);
        return () => controller.abort();
    }, [load]);

    if (loading && !data) return <Skeleton />;

    if (error && !data) {
        return (
            <div className="an-root">
                <div className="an-card an-error">
                    <p>{error}</p>
                    <button className="an-btn" onClick={() => load()}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const {
        totalEmployees = 0,
        activeEmployees = 0,
        pendingVerification = 0,
        attendanceToday = { present: 0, absent: 0, percent: 0 },
        openTickets = 0,
        highPriorityTickets = 0,
        onboardingTrend = [],
        weeklyAttendance = [],
        recentOnboardings = [],
        actionRequired = []
    } = data;

    const newThisMonth = onboardingTrend.length
        ? onboardingTrend[onboardingTrend.length - 1].count
        : 0;
    const hiresTotal = onboardingTrend.reduce((s, t) => s + t.count, 0);

    return (
        <div className="an-root">
            {/* KPI row */}
            <div className="an-grid-kpi">
                <Kpi
                    icon={<FaUsers />}
                    tone="blue"
                    label="Total employees"
                    value={totalEmployees}
                    sub={`+${newThisMonth} this month · ${activeEmployees} active`}
                />
                <Kpi
                    icon={<FaFileAlt />}
                    tone="amber"
                    label="Documents to verify"
                    value={pendingVerification}
                    sub={pendingVerification > 0 ? "Awaiting review" : "All clear"}
                />
                <Kpi
                    icon={<FaUserCheck />}
                    tone="green"
                    label="Attendance today"
                    value={`${attendanceToday.percent}%`}
                    sub={`${attendanceToday.present} present · ${attendanceToday.absent} absent`}
                />
                <Kpi
                    icon={<FaHeadset />}
                    tone="red"
                    label="Open support tickets"
                    value={openTickets}
                    sub={`${highPriorityTickets} high priority`}
                />
            </div>

            {/* Charts */}
            <div className="an-grid-2">
                <div className="an-card">
                    <div className="an-card-head">
                        <div>
                            <h2>Workforce growth</h2>
                            <p>
                                {hiresTotal} new hires in the last {onboardingTrend.length} months
                            </p>
                        </div>
                        <div className="an-legend">
                            <span><i className="an-sw an-sw-hires" />New hires</span>
                            <span><i className="an-sw an-sw-line" />Headcount</span>
                        </div>
                    </div>
                    <GrowthChart trend={onboardingTrend} total={totalEmployees} />
                </div>

                <div className="an-card">
                    <div className="an-card-head">
                        <div>
                            <h2>Attendance, last 7 days</h2>
                            <p>Out of {activeEmployees} active employees</p>
                        </div>
                        <div className="an-legend">
                            <span><i className="an-sw an-sw-present" />Present</span>
                            <span><i className="an-sw an-sw-absent" />Absent</span>
                        </div>
                    </div>
                    <AttendanceChart week={weeklyAttendance} />
                </div>
            </div>

            {/* Lists */}
            <div className="an-grid-2">
                <div className="an-card">
                    <div className="an-card-head"><h2>Recent onboardings</h2></div>
                    {recentOnboardings.length === 0 ? (
                        <p className="an-empty">No recent onboardings.</p>
                    ) : (
                        <ul className="an-list">
                            {recentOnboardings.map((p, i) => {
                                const meta = STATUS_META[p.status] || {
                                    label: p.status,
                                    cls: "an-pill-prog"
                                };
                                return (
                                    <li key={p.name + i} className="an-item">
                                        <div className={`an-avatar an-av-${i % 3}`}>
                                            {initials(p.name)}
                                        </div>
                                        <div className="an-item-info">
                                            <p>{p.name}</p>
                                            <span>{p.role} · {p.timeAgo}</span>
                                        </div>
                                        <span className={`an-pill ${meta.cls}`}>{meta.label}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <div className="an-card">
                    <div className="an-card-head"><h2>Action required</h2></div>
                    {actionRequired.length === 0 ? (
                        <p className="an-empty">You are all caught up.</p>
                    ) : (
                        <ul className="an-list">
                            {actionRequired.map((a, i) => (
                                <li key={a.type + i} className="an-item">
                                    <div className={`an-icon-sq an-tone-${a.type === "OPEN" ? "red" : "amber"}`}>
                                        {ACTION_ICON[a.type] || <FaFileAlt />}
                                    </div>
                                    <div className="an-item-info">
                                        <p>{a.title}</p>
                                        <span>{a.description}</span>
                                    </div>
                                    <button className="an-btn" onClick={() => navigate(a.link)}>
                                        {a.button || "Review"}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminAnalytics;