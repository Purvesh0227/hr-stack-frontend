import { useState } from "react";
import { Navigate, useOutletContext } from "react-router-dom";
import AdminTable from "../../components/dashboard/AdminTable";
import AddAdminModal from "../../components/AddAdminModal";
import Loader from "../../components/Loader";

function Admins() {
    const {
        role,
        admins,
        loadingAdmins,
        handleGetAllAdmins
    } = useOutletContext();

    const [showAddAdminModal, setShowAddAdminModal] = useState(false);

    if (role !== "ADMIN") {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="content-card">
            <div className="card-header">
                <h2>Administrators</h2>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        className="primary-btn"
                        onClick={handleGetAllAdmins}
                        disabled={loadingAdmins}
                    >
                        View Admins
                    </button>
                    <button
                        className="primary-btn"
                        onClick={() => setShowAddAdminModal(true)}
                    >
                        Add Admin
                    </button>
                </div>
            </div>

            {loadingAdmins && <Loader />}

            <AdminTable
                admins={admins}
                loadingAdmins={loadingAdmins}
            />

            <AddAdminModal
                isOpen={showAddAdminModal}
                onClose={() => setShowAddAdminModal(false)}
                refreshAdmins={handleGetAllAdmins}
            />
        </div>
    );
}

export default Admins;