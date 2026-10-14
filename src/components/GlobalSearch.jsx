import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiUser, FiShield, FiCornerDownLeft } from "react-icons/fi";
import {
    MdDashboard,
    MdAccountBalanceWallet
} from "react-icons/md";
import { FaCalendarCheck } from "react-icons/fa6";
import { IoSettingsSharp } from "react-icons/io5";
import { FiBell } from "react-icons/fi";
import { FaUsers } from "react-icons/fa6";
import { getAllEmployees, getAllAdmins, isRequestCancelled } from "../services/api";
import useDebounce from "../hooks/useDebounce";
import { readStorageItem } from "../utils/storage";
import "../styles/GlobalSearch.css";

// Pages everyone can open. `keywords` = extra words that also match.
const PAGES = [
    { label: "Dashboard", path: "/", icon: MdDashboard, keywords: "home overview" },
    { label: "Attendance", path: "/attendance", icon: FaCalendarCheck, keywords: "qr otp present absent mark" },
    { label: "Finance", path: "/finance", icon: MdAccountBalanceWallet, keywords: "salary slip payroll payslip" },
    { label: "Announcements", path: "/announcements", icon: FiBell, keywords: "notice news update circular" },
    { label: "Settings", path: "/settings", icon: IoSettingsSharp, keywords: "password security 2fa profile notification theme" }
];

const ADMIN_PAGES = [
    { label: "Employees", path: "/employees", icon: FaUsers, keywords: "staff people team" },
    { label: "Admins", path: "/admins", icon: FiShield, keywords: "administrators" }
];

const MIN_PEOPLE_QUERY = 2;
const PEOPLE_LIMIT = 4;

const fullName = (p) => `${p.firstName || ""} ${p.lastName || ""}`.trim();

function GlobalSearch() {
    const navigate = useNavigate();
    const isAdmin = readStorageItem("role") === "ADMIN";

    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [employees, setEmployees] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [loadingPeople, setLoadingPeople] = useState(false);

    const debounced = useDebounce(query.trim(), 300);

    // ----- pages (instant, no API) -----
    const pageResults = useMemo(() => {
        const q = query.trim().toLowerCase();
        const all = isAdmin ? [...PAGES, ...ADMIN_PAGES] : PAGES;

        if (!q) return [];

        return all
            .filter((p) =>
                `${p.label} ${p.keywords}`.toLowerCase().includes(q)
            )
            .map((p) => ({ kind: "page", key: `page-${p.path}`, ...p }));
    }, [query, isAdmin]);

    // ----- people (admin only, uses existing list APIs) -----
    useEffect(() => {
        if (!isAdmin || debounced.length < MIN_PEOPLE_QUERY) {
            setEmployees([]);
            setAdmins([]);
            setLoadingPeople(false);
            return;
        }

        const controller = new AbortController();

        const load = async () => {
            try {
                setLoadingPeople(true);

                const [empRes, adminRes] = await Promise.all([
                    getAllEmployees({
                        search: debounced,
                        size: PEOPLE_LIMIT,
                        signal: controller.signal
                    }),
                    getAllAdmins({
                        search: debounced,
                        size: PEOPLE_LIMIT,
                        signal: controller.signal
                    })
                ]);

                setEmployees(empRes.data.content || []);
                setAdmins(adminRes.data.content || []);
            } catch (error) {
                if (isRequestCancelled(error)) return;
                setEmployees([]);
                setAdmins([]);
            } finally {
                if (!controller.signal.aborted) setLoadingPeople(false);
            }
        };

        load();

        return () => controller.abort();
    }, [debounced, isAdmin]);

    const employeeResults = employees.map((p) => ({
        kind: "employee",
        key: `emp-${p.id}`,
        label: fullName(p) || p.email,
        sub: `${p.empId} · ${p.email}`,
        path: "/employees"
    }));

    const adminResults = admins.map((p) => ({
        kind: "admin",
        key: `adm-${p.id}`,
        label: fullName(p) || p.email,
        sub: `${p.empId} · ${p.email}`,
        path: "/admins"
    }));

    // one flat list so arrow keys move through every group
    const results = [...pageResults, ...employeeResults, ...adminResults];

    // keep highlighted row valid when the list shrinks
    const safeIndex = Math.min(activeIndex, Math.max(results.length - 1, 0));

    const close = () => {
        setOpen(false);
        setActiveIndex(0);
    };

    const select = (item) => {
        navigate(item.path);
        setQuery("");
        close();
        inputRef.current?.blur();
    };

    // click outside closes
    useEffect(() => {
        const onClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                close();
            }
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    // Ctrl/Cmd + K focuses the box
    useEffect(() => {
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                inputRef.current?.focus();
                setOpen(true);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            close();
            inputRef.current?.blur();
            return;
        }

        if (!results.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((safeIndex + 1) % results.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((safeIndex - 1 + results.length) % results.length);
        } else if (e.key === "Enter") {
            e.preventDefault();
            select(results[safeIndex]);
        }
    };

    const showDropdown = open && query.trim().length > 0;

    const renderGroup = (title, items, offset) =>
        items.length > 0 && (
            <div className="gs-group" key={title}>
                <div className="gs-group-title">{title}</div>
                {items.map((item, i) => {
                    const index = offset + i;
                    const Icon =
                        item.icon ||
                        (item.kind === "admin" ? FiShield : FiUser);

                    return (
                        <button
                            key={item.key}
                            type="button"
                            className={`gs-item ${index === safeIndex ? "gs-item-active" : ""}`}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => select(item)}
                        >
                            <span className="gs-item-icon"><Icon /></span>
                            <span className="gs-item-text">
                                <strong>{item.label}</strong>
                                {item.sub && <small>{item.sub}</small>}
                            </span>
                            {index === safeIndex && <FiCornerDownLeft className="gs-enter" />}
                        </button>
                    );
                })}
            </div>
        );

    return (
        <div className="global-search" ref={wrapperRef}>
            <FiSearch className="gs-icon" />

            <input
                ref={inputRef}
                type="text"
                value={query}
                placeholder={isAdmin ? "Search people or pages…" : "Search pages…"}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                maxLength={60}
                aria-label="Global search"
                autoComplete="off"
            />

            <kbd className="gs-kbd">Ctrl K</kbd>

            {showDropdown && (
                <div className="gs-dropdown" role="listbox">
                    {renderGroup("Pages", pageResults, 0)}
                    {renderGroup("Employees", employeeResults, pageResults.length)}
                    {renderGroup(
                        "Admins",
                        adminResults,
                        pageResults.length + employeeResults.length
                    )}

                    {results.length === 0 && (
                        <div className="gs-empty">
                            {loadingPeople
                                ? "Searching…"
                                : isAdmin && debounced.length < MIN_PEOPLE_QUERY
                                    ? "Keep typing to search people…"
                                    : "No results found"}
                        </div>
                    )}

                    {results.length > 0 && loadingPeople && (
                        <div className="gs-hint">Searching people…</div>
                    )}
                </div>
            )}
        </div>
    );
}

export default GlobalSearch;