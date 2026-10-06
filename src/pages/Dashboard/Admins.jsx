import { useState } from "react";
import { Navigate, useOutletContext } from "react-router-dom";
import AdminTable from "../../components/dashboard/AdminTable";
import AddAdminModal from "../../components/AddAdminModal";
import TableFilters from "../../components/dashboard/TableFilters";
import Pagination from "../../components/Pagination";
import PageSizeSelect from "../../components/PageSizeSelect";
import Loader from "../../components/Loader";
import useAdminList from "../../hooks/useAdminList";
import { FiShield, FiUserPlus } from "react-icons/fi";

// Separate component: the hook (and its API call) only runs for admins
function AdminsContent() {
    const [showAddAdminModal, setShowAddAdminModal] = useState(false);

    const {
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
    } = useAdminList();

    return (
        <>
            <div className="admins-page">

                {/* Page Header */}
                <div className="admins-page-header">
                    <div>
                        <p className="dashboard-eyebrow">
                            Admin Dashboard
                        </p>

                        <h1>Administrators</h1>

                        <p className="admins-page-subtitle">
                            Manage administrator accounts and access.
                        </p>
                    </div>

                    {/* Admin Count */}
                    <div className="admin-summary">
                        <FiShield size={18} />

                        <div>
                            <span>Administrators</span>
                            <strong>{totalAdmins}</strong>
                        </div>
                    </div>
                </div>

                {/* Admin Management Card */}
                <div className="admin-card">

                    <div className="admin-card-header">
                        <div>
                            <h2>Administrator Directory</h2>

                            <p>
                                {totalElements} administrator
                                {totalElements !== 1 ? "s" : ""}
                            </p>
                        </div>

                        <div className="admin-card-actions">
                            <button
                                className="primary-btn"
                                onClick={() => setShowAddAdminModal(true)}
                            >
                                <FiUserPlus size={16} />
                                Add Admin
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="admin-card-filters">
                        <TableFilters
                            searchValue={searchTerm}
                            onSearchChange={setSearchTerm}
                            searchPlaceholder="Search by ID, name or email..."
                            showDateRange
                            fromDate={fromDate}
                            toDate={toDate}
                            onFromDateChange={setFromDate}
                            onToDateChange={setToDate}
                            hasActiveFilters={hasActiveFilters}
                            onClear={clearFilters}
                        />
                    </div>

                    {/* First load only, so the table doesn't vanish on every search */}
                    {loading && admins.length === 0 && <Loader />}

                    {/* Admin Table */}
                    {admins.length > 0 && (
                        <>
                            <AdminTable admins={admins} dimmed={loading} />

                            <div className="employee-table-footer">
                                <span>
                                    Showing <strong>{admins.length}</strong> of{" "}
                                    <strong>{totalElements}</strong> administrators
                                </span>

                                <div className="table-footer-controls">
                                    <PageSizeSelect
                                        value={pageSize}
                                        onChange={setPageSize}
                                    />

                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Empty state */}
                    {!loading && admins.length === 0 && (
                        <p className="no-attendance">
                            {hasActiveFilters
                                ? "No administrators match the selected filters."
                                : "No administrators available."}
                        </p>
                    )}
                </div>
            </div>

            {/* Add Admin Modal */}
            <AddAdminModal
                isOpen={showAddAdminModal}
                onClose={() => setShowAddAdminModal(false)}
                refreshAdmins={refresh}
            />
        </>
    );
}

function Admins() {
    const { role } = useOutletContext();

    if (role !== "ADMIN") {
        return <Navigate to="/" replace />;
    }

    return <AdminsContent />;
}

export default Admins;