import { useState } from "react";
import { Navigate, useOutletContext } from "react-router-dom";
import AdminTable from "../../components/dashboard/AdminTable";
import AddAdminModal from "../../components/AddAdminModal";
import Loader from "../../components/Loader";
import { FiShield, FiUserPlus } from "react-icons/fi";

function Admins() {
    const {
        role,
        admins,
        loadingAdmins,
        handleGetAllAdmins
    } = useOutletContext();

    const [showAddAdminModal, setShowAddAdminModal] = useState(false);

    if (role !== "ADMIN") {
        return <Navigate to="/" replace />;
    }

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
                            <strong>{admins?.length || 0}</strong>
                        </div>
                    </div>
                </div>

                {/* Admin Management Card */}
                <div className="admin-card">

                    <div className="admin-card-header">
                        <div>
                            <h2>Administrator Directory</h2>

                            <p>
                                View and manage registered administrators.
                            </p>
                        </div>

                        <div className="admin-card-actions">
                            <button
                                className="secondary-btn"
                                onClick={handleGetAllAdmins}
                                disabled={loadingAdmins}
                            >
                                View Admins
                            </button>

                            <button
                                className="primary-btn"
                                onClick={() => setShowAddAdminModal(true)}
                            >
                                <FiUserPlus size={16} />
                                Add Admin
                            </button>
                        </div>
                    </div>

                    {/* Loading */}
                    {loadingAdmins && <Loader />}

                    {/* Admin Table */}
                    <AdminTable
                        admins={admins}
                        loadingAdmins={loadingAdmins}
                    />
                </div>
            </div>

            {/* Add Admin Modal */}
            <AddAdminModal
                isOpen={showAddAdminModal}
                onClose={() => setShowAddAdminModal(false)}
                refreshAdmins={handleGetAllAdmins}
            />
        </>
    );
}

export default Admins;