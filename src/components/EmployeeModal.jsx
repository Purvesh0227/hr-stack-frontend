import { useEffect, useRef, useState } from "react";
import { isValidPhone } from "../utils/validators";
import { getEmployeeDocumentViewUrl } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import Loader from "./Loader";
import PdfViewer from "./common/PdfViewer";
import EmployeeIdCard from "./common/EmployeeIdCard";
import { FiEye } from "react-icons/fi";
import { formatDate, formatDateTime } from "../utils/dateUtils";
import "../styles/employee-modal.css";

function EmployeeModal({
    isOpen,
    employee,
    mode,
    onClose,
    onSave,
    onActivate,
    onRequestDocuments
}) {
    const { showNotification } = useNotification();

    const [documentUrls, setDocumentUrls] = useState({
        idProof: null,
        addressProof: null
    });

    const [selectedDocument, setSelectedDocument] = useState(null);
    const [loading, setLoading] = useState(false);
    const [requestingDocuments, setRequestingDocuments] = useState(false);

    const idCardRef = useRef(null);
    const [showIdCard, setShowIdCard] = useState(false);

    useEffect(() => {
        setDocumentUrls({
            idProof: null,
            addressProof: null
        });

        setSelectedDocument(null);
        setShowIdCard(false);
    }, [employee?.id, isOpen]);

    if (!isOpen || !employee) {
        return null;
    }

    const isEdit = mode === "edit";
    const documents = employee.documents;

    /*
     * Normalize status
     */
    const normalizedStatus =
        employee.status
            ?.replace(/[\s_-]+/g, "_")
            .toUpperCase() || "";

    const canActivateEmployee =
        !!documents &&
        (
            normalizedStatus === "PENDING_VERIFICATION" ||
            normalizedStatus === "DOCUMENTS_RECEIVED" ||
            normalizedStatus === "VERIFICATION_PENDING" ||
            normalizedStatus.includes("VERIFICATION")
        );

    /*
     * Save Employee
     */
    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const mobile = formData.get("mobile");

        if (!isValidPhone(mobile)) {
            showNotification(
                "Mobile number must contain exactly 10 digits.",
                "error"
            );
            return;
        }

        const updatedEmployee = {
            ...employee,
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            mobile: mobile
        };

        try {
            setLoading(true);
            await onSave(updatedEmployee);
        } finally {
            setLoading(false);
        }
    };

    /*
     * Get signed document URL
     */
    const loadDocumentUrl = async (documentType) => {
        try {
            setLoading(true);

            const response = await getEmployeeDocumentViewUrl(
                employee.id,
                documentType
            );

            const url = response.data;

            if (documentType === "ID_PROOF") {
                setDocumentUrls((prev) => ({
                    ...prev,
                    idProof: url
                }));

                setSelectedDocument({
                    title: "ID Proof",
                    url
                });
            } else {
                setDocumentUrls((prev) => ({
                    ...prev,
                    addressProof: url
                }));

                setSelectedDocument({
                    title: "Address Proof",
                    url
                });
            }
        } catch (error) {
            console.error("Document view error:", error);

            showNotification(
                error.response?.data?.message ||
                error.response?.data ||
                "Unable to open document",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    /*
     * Request Documents
     */
    const handleRequestDocuments = async () => {
        try {
            setLoading(true);
            setRequestingDocuments(true);

            await onRequestDocuments(employee.id);
        } finally {
            setLoading(false);
            setRequestingDocuments(false);
        }
    };

    /*
     * Activate Employee
     */
    const handleActivate = async () => {
        try {
            setLoading(true);
            await onActivate(employee);
        } finally {
            setLoading(false);
        }
    };

    /*
     * Close document viewer
     */
    const closeDocumentViewer = () => {
        setSelectedDocument(null);
    };

    return (
        <>
            {/* =================================================
                EMPLOYEE MODAL
            ================================================= */}

            <div className="employee-modal-overlay">
                <div className="employee-modal-container">

                    {/* ================= HEADER ================= */}

                    <div className="employee-modal-header">
                        <h2>
                            {isEdit
                                ? "Edit Employee"
                                : "Employee Details"}
                        </h2>

                        <button
                            type="button"
                            className="employee-modal-close"
                            onClick={onClose}
                            disabled={loading}
                            aria-label="Close employee modal"
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* ================= EMPLOYEE DETAILS ================= */}

                        <div className="employee-modal-details-grid">

                            {/* ================= PROFILE PHOTO ================= */}

                            <div className="employee-modal-profile">

                                <div className="employee-modal-profile-photo">
                                    {employee.profilePhotoUrl ? (
                                        <img
                                            src={employee.profilePhotoUrl}
                                            alt="Employee Profile"
                                        />
                                    ) : (
                                        <div className="employee-modal-photo-placeholder">
                                            No Photo
                                        </div>
                                    )}
                                </div>

                                <div className="employee-modal-profile-actions">

                                    <span className="employee-modal-profile-name">
                                        {employee.firstName || ""}{" "}
                                        {employee.lastName || ""}
                                    </span>

                                    <button
                                        type="button"
                                        className="document-view-btn"
                                        onClick={() => setShowIdCard(true)}
                                    >
                                        <FiEye />
                                        View ID Card
                                    </button>

                                </div>

                            </div>

                            {/* ================= EMPLOYEE ID ================= */}

                            <div className="employee-modal-field">
                                <label>Employee ID</label>

                                <input
                                    type="text"
                                    value={employee.empId || ""}
                                    readOnly
                                />
                            </div>

                            {/* ================= FIRST NAME ================= */}

                            <div className="employee-modal-field">
                                <label>First Name</label>

                                <input
                                    type="text"
                                    name="firstName"
                                    defaultValue={employee.firstName || ""}
                                    readOnly={!isEdit}
                                />
                            </div>

                            {/* ================= LAST NAME ================= */}

                            <div className="employee-modal-field">
                                <label>Last Name</label>

                                <input
                                    type="text"
                                    name="lastName"
                                    defaultValue={employee.lastName || ""}
                                    readOnly={!isEdit}
                                />
                            </div>

                            {/* ================= EMAIL ================= */}

                            <div className="employee-modal-field">
                                <label>Email</label>

                                <input
                                    type="email"
                                    value={employee.email || ""}
                                    readOnly
                                />
                            </div>

                            {/* ================= MOBILE ================= */}

                            <div className="employee-modal-field">
                                <label>Mobile</label>

                                <input
                                    type="text"
                                    name="mobile"
                                    defaultValue={employee.mobile || ""}
                                    readOnly={!isEdit}
                                    maxLength={10}
                                    inputMode="numeric"
                                />
                            </div>

                            {/* ================= ROLE ================= */}

                            <div className="employee-modal-field">
                                <label>Role</label>

                                <input
                                    type="text"
                                    value={employee.role || ""}
                                    readOnly
                                />
                            </div>

                            {/* ================= STATUS ================= */}

                            <div className="employee-modal-field">
                                <label>Status</label>

                                <input
                                    type="text"
                                    value={employee.status || "PENDING"}
                                    readOnly
                                />
                            </div>

                            {/* ================= JOINING DATE ================= */}

                            <div className="employee-modal-field">
                                <label>Joining Date</label>

                                <input
                                    type="text"
                                    value={formatDate(employee.createdOn)}
                                    readOnly
                                />
                            </div>

                            {/* ================= LAST UPDATED ================= */}

                            <div className="employee-modal-field">
                                <label>Last Updated</label>

                                <input
                                    type="text"
                                    value={formatDateTime(employee.updatedOn)}
                                    readOnly
                                />
                            </div>

                        </div>

                        {/* ================= DOCUMENTS ================= */}

                        {documents && (
                            <div className="employee-modal-documents">

                                <h3>
                                    Submitted Documents
                                </h3>

                                {/* ================= ID PROOF ================= */}

                                <div className="employee-modal-document-section">

                                    <div className="employee-modal-document-info">

                                        <h4>ID Proof</h4>

                                        <div>
                                            <strong>Type:</strong>
                                            <span>
                                                {documents.idProofType || "-"}
                                            </span>
                                        </div>

                                        <div>
                                            <strong>Number:</strong>
                                            <span>
                                                {documents.idProofNumber || "-"}
                                            </span>
                                        </div>

                                        <div>
                                            <strong>File:</strong>
                                            <span>
                                                {documents.idProofObjectKey
                                                    ? "Uploaded"
                                                    : "Not Uploaded"}
                                            </span>
                                        </div>

                                    </div>

                                    {documents.idProofObjectKey && (
                                        <button
                                            type="button"
                                            className="document-view-btn"
                                            onClick={() =>
                                                loadDocumentUrl("ID_PROOF")
                                            }
                                            disabled={loading}
                                        >
                                            View ID Proof
                                        </button>
                                    )}

                                </div>

                                {/* ================= ADDRESS PROOF ================= */}

                                <div className="employee-modal-document-section">

                                    <div className="employee-modal-document-info">

                                        <h4>Address Proof</h4>

                                        <div>
                                            <strong>Type:</strong>
                                            <span>
                                                {documents.addressProofType || "-"}
                                            </span>
                                        </div>

                                        <div>
                                            <strong>Number:</strong>
                                            <span>
                                                {documents.addressProofNumber || "-"}
                                            </span>
                                        </div>

                                        <div>
                                            <strong>File:</strong>
                                            <span>
                                                {documents.addressProofObjectKey
                                                    ? "Uploaded"
                                                    : "Not Uploaded"}
                                            </span>
                                        </div>

                                    </div>

                                    {documents.addressProofObjectKey && (
                                        <button
                                            type="button"
                                            className="document-view-btn"
                                            onClick={() =>
                                                loadDocumentUrl("ADDRESS_PROOF")
                                            }
                                            disabled={loading}
                                        >
                                            View Address Proof
                                        </button>
                                    )}

                                </div>

                            </div>
                        )}

                        {/* ================= ACTIONS ================= */}

                        <div className="employee-modal-actions">

                            {loading && <Loader />}

                            {!loading && (
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={onClose}
                                >
                                    Close
                                </button>
                            )}

                            {!loading &&
                                isEdit &&
                                normalizedStatus === "PENDING" && (
                                    <button
                                        type="button"
                                        className="primary-btn"
                                        onClick={handleRequestDocuments}
                                        disabled={requestingDocuments}
                                    >
                                        {requestingDocuments
                                            ? "Requesting & sending....."
                                            : "Request Documents"}
                                    </button>
                                )}

                            {!loading && isEdit && (
                                <button
                                    type="submit"
                                    className="primary-btn"
                                >
                                    Save Changes
                                </button>
                            )}

                            {!loading &&
                                isEdit &&
                                canActivateEmployee && (
                                    <button
                                        type="button"
                                        className="activate-btn"
                                        onClick={handleActivate}
                                    >
                                        ACTIVATE
                                    </button>
                                )}

                        </div>

                    </form>

                </div>
            </div>

            {/* =================================================
                DOCUMENT VIEWER
            ================================================= */}

            {selectedDocument && !loading && (
                <div className="employee-document-viewer-overlay">

                    <div className="employee-document-viewer">

                        <div className="employee-document-viewer-header">

                            <h3>
                                {selectedDocument.title}
                            </h3>

                            <button
                                type="button"
                                className="employee-document-viewer-close"
                                onClick={closeDocumentViewer}
                                aria-label="Close document viewer"
                            >
                                ×
                            </button>

                        </div>

                        <div className="employee-document-viewer-content">
                            <PdfViewer
                                url={selectedDocument.url}
                            />
                        </div>

                    </div>

                </div>
            )}

            {/* =================================================
                ID CARD MODAL
            ================================================= */}

            {showIdCard && (
                <div className="employee-id-card-overlay">

                    <div className="employee-id-card-container">

                        <div className="employee-id-card-header">

                            <h2>
                                Employee ID Card
                            </h2>

                            <button
                                type="button"
                                className="employee-id-card-close"
                                onClick={() => setShowIdCard(false)}
                                aria-label="Close ID card"
                            >
                                ×
                            </button>

                        </div>

                        <div className="employee-id-card-content">

                            <EmployeeIdCard
                                ref={idCardRef}
                                employee={employee}
                            />

                        </div>

                    </div>

                </div>
            )}

        </>
    );
}

export default EmployeeModal;