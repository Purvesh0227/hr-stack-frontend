import { useEffect, useState } from "react";
import { getAllAdmins, isRequestCancelled } from "../services/api";
import useDebounce from "./useDebounce";
import { dateToMillis, dateToEndMillis } from "../utils/dateUtils";
import { getErrorMessage } from "../utils/errorUtils";
import { useNotification } from "../contexts/NotificationContext";

const DEFAULT_PAGE_SIZE = 10;

function useAdminList() {
    const { showNotification } = useNotification();

    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0); // matches for current filters
    const [totalAdmins, setTotalAdmins] = useState(0);     // unfiltered total (page header)
    const [refreshKey, setRefreshKey] = useState(0);

    const [searchTerm, setSearchTerm] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const debouncedSearch = useDebounce(searchTerm.trim(), 400);

    // Any filter or page-size change -> back to page 1 (done during render, no wasted request)
    const filterKey = [debouncedSearch, fromDate, toDate, pageSize].join("|");
    const [lastFilterKey, setLastFilterKey] = useState(filterKey);

    if (lastFilterKey !== filterKey) {
        setLastFilterKey(filterKey);
        setCurrentPage(1);
    }

    const fromMillis = dateToMillis(fromDate);
    const toMillis = dateToEndMillis(toDate);

    const rangeInvalid =
        Boolean(fromDate && toDate) && fromDate > toDate;

    const hasActiveFilters = Boolean(searchTerm.trim() || fromDate || toDate);

    const clearFilters = () => {
        setSearchTerm("");
        setFromDate("");
        setToDate("");
    };

    const refresh = () => setRefreshKey((key) => key + 1);

    useEffect(() => {
        if (rangeInvalid) {
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        const loadAdmins = async () => {
            try {
                setLoading(true);

                const { data } = await getAllAdmins({
                    search: debouncedSearch,
                    from: fromMillis,
                    to: toMillis,
                    page: currentPage - 1,
                    size: pageSize,
                    signal: controller.signal
                });

                // Current page no longer exists
                if (data.totalPages > 0 && currentPage > data.totalPages) {
                    setCurrentPage(data.totalPages);
                    return;
                }

                setAdmins(data.content);
                setTotalElements(data.totalElements);
                setTotalPages(data.totalPages);

                if (!debouncedSearch && !fromDate && !toDate) {
                    setTotalAdmins(data.totalElements);
                }
            } catch (error) {
                if (isRequestCancelled(error)) {
                    return;
                }

                showNotification(
                    getErrorMessage(error, "Unable to fetch admins"),
                    "error"
                );
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        loadAdmins();

        // Cancels the stale request on every change / unmount
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        debouncedSearch,
        fromMillis,
        toMillis,
        rangeInvalid,
        pageSize,
        currentPage,
        refreshKey
    ]);

    return {
        admins,
        loading,
        totalAdmins,
        totalElements,
        totalPages,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        searchTerm,
        setSearchTerm,
        fromDate,
        setFromDate,
        toDate,
        setToDate,
        hasActiveFilters,
        clearFilters,
        refresh
    };
}

export default useAdminList;