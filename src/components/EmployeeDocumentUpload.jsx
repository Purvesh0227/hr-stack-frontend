import { useState } from "react";
import useSubmitLock from "../hooks/useSubmitLock";
import {
    getEmployeeDocumentUploadUrl,
    uploadDocumentDirectlyToMinio,
    saveEmployeeDocuments
} from "../services/api";
import { useNotification } from "../contexts/NotificationContext";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const getDocumentNumberConfig = (type) => {
    switch (type) {
        case "AADHAAR":
            return {
                maxLength: 12,
                placeholder: "Enter 12-digit Aadhaar number",
                inputMode: "numeric"
            };
        case "PAN":
            return {
                maxLength: 10,
                placeholder: "Enter PAN (ABCDE1234F)",
                inputMode: "text"
            };
        case "LIGHT_BILL":
            return {
                maxLength: 15,
                placeholder: "Enter light bill number",
                inputMode: "numeric"
            };
        default:
            return {
                maxLength: 50,
                placeholder: "Select proof type first",
                inputMode: "text"
            };
    }
};

const validateDocumentNumber = (type, number) => {
    switch (type) {
        case "AADHAAR":
            return /^\d{12}$/.test(number);
        case "PAN":
            return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(number);
        case "LIGHT_BILL":
            return /^\d{6,15}$/.test(number);
        default:
            return false;
    }
};

// Returns an error message, or null if the file is fine
const validateFile = (file) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return "Only PDF, JPG or PNG files are allowed";
    }
    if (file.size > MAX_FILE_SIZE) {
        return "File size must be 5 MB or less";
    }
    return null;
};

function EmployeeDocumentUpload({ employee, onUploadComplete }) {
    const { showNotification } = useNotification();
    const [loading, run] = useSubmitLock();

    const [idProofType, setIdProofType] = useState("");
    const [idProofNumber, setIdProofNumber] = useState("");
    const [addressProofType, setAddressProofType] = useState("");
    const [addressProofNumber, setAddressProofNumber] = useState("");

    const [idProofFile, setIdProofFile] = useState(null);
    const [addressProofFile, setAddressProofFile] = useState(null);

    const [documentsSubmitted, setDocumentsSubmitted] = useState(false);

    // Check file right when selected, reject bad ones early
    const handleFileChange = (e, setFile) => {
        const file = e.target.files[0];

        if (!file) {
            setFile(null);
            return;
        }

        const error = validateFile(file);
        if (error) {
            showNotification(error, "error");
            e.target.value = "";
            setFile(null);
            return;
        }

        setFile(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!idProofFile || !addressProofFile) {
            showNotification("Please select both documents", "error");
            return;
        }

        if (!idProofType || !idProofNumber) {
            showNotification("Please enter ID proof details", "error");
            return;
        }

        if (!validateDocumentNumber(idProofType, idProofNumber)) {
            showNotification(
                idProofType === "AADHAAR"
                    ? "Aadhaar number must contain exactly 12 digits"
                    : "PAN must be in format ABCDE1234F",
                "error"
            );
            return;
        }

        if (!addressProofType || !addressProofNumber) {
            showNotification("Please enter address proof details", "error");
            return;
        }

        if (!validateDocumentNumber(addressProofType, addressProofNumber)) {
            showNotification(
                addressProofType === "AADHAAR"
                    ? "Aadhaar number must contain exactly 12 digits"
                    : "Light bill number must contain 6 to 15 digits",
                "error"
            );
            return;
        }

        run(async () => {
            try {
                // ================= ID PROOF =================
                const idResponse = await getEmployeeDocumentUploadUrl(
                    employee.id,
                    "ID_PROOF"
                );

                await uploadDocumentDirectlyToMinio(
                    idResponse.data.uploadUrl,
                    idProofFile
                );

                // ================= ADDRESS PROOF =================
                const addressResponse = await getEmployeeDocumentUploadUrl(
                    employee.id,
                    "ADDRESS_PROOF"
                );

                await uploadDocumentDirectlyToMinio(
                    addressResponse.data.uploadUrl,
                    addressProofFile
                );

                // ================= SAVE DOCUMENT DETAILS =================
                await saveEmployeeDocuments(employee.id, {
                    idProofType,
                    idProofNumber,
                    idProofObjectKey: idResponse.data.objectKey,

                    addressProofType,
                    addressProofNumber,
                    addressProofObjectKey: addressResponse.data.objectKey
                });

                // ================= SUCCESS =================
                showNotification(
                    "Documents uploaded successfully. Waiting for verification.",
                    "success"
                );

                setDocumentsSubmitted(true);

                // Tell Dashboard that upload is completed
                if (onUploadComplete) {
                    onUploadComplete();
                }
            } catch (error) {
                const data = error.response?.data;

                showNotification(
                    data?.error ||
                    data?.message ||
                    (typeof data === "string" ? data : null) ||
                    "Unable to submit documents",
                    "error"
                );
            }
        });
    };

    // ================= DOCUMENTS SUBMITTED =================
    if (documentsSubmitted) {
        return (
            <div className="document-upload-status">
                <strong>✓ Documents Uploaded</strong>
                <span>Waiting for verification.</span>
            </div>
        );
    }

    const idConfig = getDocumentNumberConfig(idProofType);
    const addressConfig = getDocumentNumberConfig(addressProofType);

    // ================= UPLOAD FORM =================
    return (
        <div className="content-card employee-document-upload">
            <h2>Upload Required Documents</h2>

            <form onSubmit={handleSubmit}>
                <div className="document-upload-grid">

                    {/* ---------- ID PROOF ---------- */}
                    <div className="document-card">
                        <h3>ID Proof</h3>

                        <div className="document-form-group">
                            <label htmlFor="id-proof-type">Proof Type</label>
                            <select
                                id="id-proof-type"
                                value={idProofType}
                                disabled={loading}
                                onChange={(e) => {
                                    setIdProofType(e.target.value);
                                    setIdProofNumber("");
                                }}
                            >
                                <option value="">Select ID Proof</option>
                                <option value="AADHAAR">Aadhaar</option>
                                <option value="PAN">PAN</option>
                            </select>
                        </div>

                        <div className="document-form-group">
                            <label htmlFor="id-proof-number">Document Number</label>
                            <input
                                id="id-proof-number"
                                type="text"
                                value={idProofNumber}
                                maxLength={idConfig.maxLength}
                                inputMode={idConfig.inputMode}
                                placeholder={idConfig.placeholder}
                                autoComplete="off"
                                onChange={(e) => {
                                    let value = e.target.value;

                                    if (idProofType === "AADHAAR") {
                                        value = value.replace(/\D/g, "");
                                    }

                                    if (idProofType === "PAN") {
                                        value = value
                                            .toUpperCase()
                                            .replace(/[^A-Z0-9]/g, "");
                                    }

                                    setIdProofNumber(value);
                                }}
                                disabled={!idProofType || loading}
                            />
                        </div>

                        <div className="document-form-group">
                            <label htmlFor="id-proof-file">Upload ID Proof</label>
                            <input
                                id="id-proof-file"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                disabled={loading}
                                onChange={(e) => handleFileChange(e, setIdProofFile)}
                            />
                        </div>
                    </div>

                    {/* ---------- ADDRESS PROOF ---------- */}
                    <div className="document-card">
                        <h3>Address Proof</h3>

                        <div className="document-form-group">
                            <label htmlFor="address-proof-type">Proof Type</label>
                            <select
                                id="address-proof-type"
                                value={addressProofType}
                                disabled={loading}
                                onChange={(e) => {
                                    setAddressProofType(e.target.value);
                                    setAddressProofNumber("");
                                }}
                            >
                                <option value="">Select Address Proof</option>
                                <option value="AADHAAR">Aadhaar</option>
                                <option value="LIGHT_BILL">Light Bill</option>
                            </select>
                        </div>

                        <div className="document-form-group">
                            <label htmlFor="address-proof-number">Document Number</label>
                            <input
                                id="address-proof-number"
                                type="text"
                                value={addressProofNumber}
                                maxLength={addressConfig.maxLength}
                                inputMode={addressConfig.inputMode}
                                placeholder={addressConfig.placeholder}
                                autoComplete="off"
                                onChange={(e) =>
                                    setAddressProofNumber(
                                        e.target.value.replace(/\D/g, "")
                                    )
                                }
                                disabled={!addressProofType || loading}
                            />
                        </div>

                        <div className="document-form-group">
                            <label htmlFor="address-proof-file">Upload Address Proof</label>
                            <input
                                id="address-proof-file"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                disabled={loading}
                                onChange={(e) => handleFileChange(e, setAddressProofFile)}
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="primary-btn document-submit-btn"
                    disabled={loading}
                >
                    {loading ? "Uploading..." : "Submit"}
                </button>
            </form>
        </div>
    );
}

export default EmployeeDocumentUpload;