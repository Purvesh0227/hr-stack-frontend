import { useEffect, useState } from "react";
import { isValidPhone } from "../utils/validators";
import { getEmployeeDocumentViewUrl } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import Loader from "./Loader";

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

    /*
     * Reset document viewer whenever
     * employee changes or modal opens.
     */
    useEffect(() => {
        setDocumentUrls({
            idProof: null,
            addressProof: null
        });

        setSelectedDocument(null);
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
            ?.replace(/[\s_]+/g, "_")
            .toUpperCase();

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

            const response =
                await getEmployeeDocumentViewUrl(
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
                    url: url
                });

            } else {
                setDocumentUrls((prev) => ({
                    ...prev,
                    addressProof: url
                }));

                setSelectedDocument({
                    title: "Address Proof",
                    url: url
                });
            }

        } catch (error) {
            console.error(
                "Document view error:",
                error
            );

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

            await onRequestDocuments(employee);

        } finally {
            setLoading(false);
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
        <div className="modal-overlay">
            <div className="modal employee-modal">

                {/* ================= HEADER ================= */}

                <div className="modal-header">

                    <h2>
                        {isEdit
                            ? "Edit Employee"
                            : "Employee Details"}
                    </h2>

                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        disabled={loading}
                    >
                        ×
                    </button>

                </div>

                <form onSubmit={handleSubmit}>

                    {/* ================= EMPLOYEE DETAILS ================= */}

                    <div className="employee-details-grid">

                        {/* Employee ID */}

                        <div className="modal-field">

                            <label>
                                Employee ID
                            </label>

                            <input
                                type="text"
                                value={
                                    employee.empId || ""
                                }
                                readOnly
                            />

                        </div>

                        {/* First Name */}

                        <div className="modal-field">

                            <label>
                                First Name
                            </label>

                            <input
                                type="text"
                                name="firstName"
                                defaultValue={
                                    employee.firstName || ""
                                }
                                readOnly={!isEdit}
                            />

                        </div>

                        {/* Last Name */}

                        <div className="modal-field">

                            <label>
                                Last Name
                            </label>

                            <input
                                type="text"
                                name="lastName"
                                defaultValue={
                                    employee.lastName || ""
                                }
                                readOnly={!isEdit}
                            />

                        </div>

                        {/* Email */}

                        <div className="modal-field">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                value={
                                    employee.email || ""
                                }
                                readOnly
                            />

                        </div>

                        {/* Mobile */}

                        <div className="modal-field">

                            <label>
                                Mobile
                            </label>

                            <input
                                type="text"
                                name="mobile"
                                defaultValue={
                                    employee.mobile || ""
                                }
                                readOnly={!isEdit}
                                maxLength={10}
                                inputMode="numeric"
                            />

                        </div>

                        {/* Role */}

                        <div className="modal-field">

                            <label>
                                Role
                            </label>

                            <input
                                type="text"
                                value={
                                    employee.role || ""
                                }
                                readOnly
                            />

                        </div>

                        {/* Status */}

                        <div className="modal-field">

                            <label>
                                Status
                            </label>

                            <input
                                type="text"
                                value={
                                    employee.status || "PENDING"
                                }
                                readOnly
                            />

                        </div>

                    </div>

                    {/* ================= DOCUMENTS ================= */}

                    {documents && (

                        <div className="employee-documents">

                            <h3>
                                Submitted Documents
                            </h3>

                            {/* ================= ID PROOF ================= */}

                            <div className="document-section">

                                <div className="document-info">

                                    <h4>
                                        ID Proof
                                    </h4>

                                    <div>
                                        <strong>
                                            Type:
                                        </strong>

                                        <span>
                                            {documents.idProofType || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <strong>
                                            Number:
                                        </strong>

                                        <span>
                                            {documents.idProofNumber || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <strong>
                                            File:
                                        </strong>

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
                                            loadDocumentUrl(
                                                "ID_PROOF"
                                            )
                                        }
                                        disabled={loading}
                                    >
                                        View ID Proof
                                    </button>

                                )}

                            </div>

                            {/* ================= ADDRESS PROOF ================= */}

                            <div className="document-section">

                                <div className="document-info">

                                    <h4>
                                        Address Proof
                                    </h4>

                                    <div>
                                        <strong>
                                            Type:
                                        </strong>

                                        <span>
                                            {documents.addressProofType || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <strong>
                                            Number:
                                        </strong>

                                        <span>
                                            {documents.addressProofNumber || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <strong>
                                            File:
                                        </strong>

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
                                            loadDocumentUrl(
                                                "ADDRESS_PROOF"
                                            )
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

                    <div className="modal-actions">

                        {/* LOADER */}

                        {loading && (
                            <Loader />
                        )}

                        {/* CLOSE */}

                        {!loading && (
                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        )}

                        {/* REQUEST DOCUMENTS */}

                        {!loading &&
                            isEdit &&
                            normalizedStatus === "PENDING" && (

                                <button
                                    type="button"
                                    className="primary-btn"
                                    onClick={handleRequestDocuments}
                                >
                                    REQUEST DOCUMENTS
                                </button>

                            )}

                        {/* SAVE CHANGES */}

                        {!loading && isEdit && (

                            <button
                                type="submit"
                                className="primary-btn"
                            >
                                Save Changes
                            </button>

                        )}

                        {/* ACTIVATE */}

                        {!loading &&
                            isEdit &&
                            normalizedStatus ===
                                "PENDING_VERIFICATION" &&
                            documents && (

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

                {/* ================================================= */}
                {/* DOCUMENT VIEWER */}
                {/* ================================================= */}

                {selectedDocument && !loading && (

                    <div className="document-viewer-overlay">

                        <div className="document-viewer">

                            <div className="document-viewer-header">

                                <h3>
                                    {selectedDocument.title}
                                </h3>

                                <button
                                    type="button"
                                    className="document-viewer-close"
                                    onClick={
                                        closeDocumentViewer
                                    }
                                >
                                    ×
                                </button>

                            </div>

                            <div className="document-viewer-content">

                                <iframe
                                    src={
                                        selectedDocument.url
                                    }
                                    title={
                                        selectedDocument.title
                                    }
                                    className="document-viewer-frame"
                                />

                            </div>

                        </div>

                    </div>

                )}

            </div>
        </div>
    );
}

export default EmployeeModal;