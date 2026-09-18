import { useState } from "react";
import {
    getEmployeeDocumentUploadUrl,
    uploadDocumentDirectlyToMinio,
    saveEmployeeDocuments
} from "../services/api";
import { useNotification } from "../contexts/NotificationContext";

function EmployeeDocumentUpload({ employee, onUploadComplete }) {
    const { showNotification } = useNotification();

    const [idProofType, setIdProofType] = useState("");
    const [idProofNumber, setIdProofNumber] = useState("");
    const [addressProofType, setAddressProofType] = useState("");
    const [addressProofNumber, setAddressProofNumber] = useState("");

    const [idProofFile, setIdProofFile] = useState(null);
    const [addressProofFile, setAddressProofFile] = useState(null);

    const [documentsSubmitted, setDocumentsSubmitted] = useState(false);


    const getDocumentNumberConfig = (type) => {
    switch (type) {
        case "AADHAAR":
            return {
                maxLength: 12,
                placeholder: "Enter 12-digit Aadhaar number",
                inputMode: "numeric",
            };

        case "PAN":
            return {
                maxLength: 10,
                placeholder: "Enter PAN (ABCDE1234F)",
                inputMode: "text",
            };

        case "LIGHT_BILL":
            return {
                maxLength: 15,
                placeholder: "Enter light bill number",
                inputMode: "numeric",
            };

        default:
            return {
                maxLength: 50,
                placeholder: "Select proof type first",
                inputMode: "text",
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
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!idProofFile || !addressProofFile) {
            showNotification(
                "Please select both documents",
                "error"
            );
            return;
        }

        if (!idProofType || !idProofNumber) {
            showNotification(
                "Please enter ID proof details",
                "error"
            );
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
            showNotification(
                "Please enter address proof details",
                "error"
            );
            return;
        }
        if (!validateDocumentNumber(
            addressProofType,
            addressProofNumber
        )) {
            showNotification(
                addressProofType === "AADHAAR"
                    ? "Aadhaar number must contain exactly 12 digits"
                    : "Light bill number must contain 6 to 15 digits",
                "error"
            );
            return;
        }


        try {
            // ================= ID PROOF =================

            const idResponse =
                await getEmployeeDocumentUploadUrl(
                    employee.id,
                    "ID_PROOF"
                );

            const idUploadUrl =
                idResponse.data.uploadUrl;

            const idObjectKey =
                idResponse.data.objectKey;

            await uploadDocumentDirectlyToMinio(
                idUploadUrl,
                idProofFile
            );

            // ================= ADDRESS PROOF =================

            const addressResponse =
                await getEmployeeDocumentUploadUrl(
                    employee.id,
                    "ADDRESS_PROOF"
                );

            const addressUploadUrl =
                addressResponse.data.uploadUrl;

            const addressObjectKey =
                addressResponse.data.objectKey;

            await uploadDocumentDirectlyToMinio(
                addressUploadUrl,
                addressProofFile
            );

            // ================= SAVE DOCUMENT DETAILS =================

            await saveEmployeeDocuments(
                employee.id,
                {
                    idProofType,
                    idProofNumber,
                    idProofObjectKey: idObjectKey,

                    addressProofType,
                    addressProofNumber,
                    addressProofObjectKey: addressObjectKey
                }
            );

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
            console.error(
                "Document submission error:",
                error
            );

            showNotification(
                error.response?.data?.message ||
                error.response?.data ||
                "Unable to submit documents",
                "error"
            );
        }
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

    // ================= UPLOAD FORM =================

    return (
        <div className="content-card employee-document-upload">
            <h2>Upload Required Documents</h2>

            <form onSubmit={handleSubmit}>
                <div className="document-upload-grid">
                    <div className="document-card">
                        <h3>ID Proof</h3>

                        <div className="document-form-group">
                            <label>Proof Type</label>
                            <select
                                value={idProofType}
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
                            <label>Document Number</label>
                            <input
                                type="text"
                                value={idProofNumber}
                                maxLength={getDocumentNumberConfig(idProofType).maxLength}
                                inputMode={getDocumentNumberConfig(idProofType).inputMode}
                                placeholder={getDocumentNumberConfig(idProofType).placeholder}
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
                                disabled={!idProofType}
                            />
                        </div>

                        <div className="document-form-group">
                            <label>Upload ID Proof</label>
                            <input
                                type="file"
                                accept=".pdf,image/*"
                                onChange={(e) => setIdProofFile(e.target.files[0])}
                            />
                        </div>
                    </div>

                    <div className="document-card">
                        <h3>Address Proof</h3>

                        <div className="document-form-group">
                            <label>Proof Type</label>
                            <select
                                value={addressProofType}
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
                            <label>Document Number</label>
                            <input
                                type="text"
                                value={addressProofNumber}
                                maxLength={getDocumentNumberConfig(addressProofType).maxLength}
                                inputMode={getDocumentNumberConfig(addressProofType).inputMode}
                                placeholder={getDocumentNumberConfig(addressProofType).placeholder}
                                onChange={(e) => {
                                    let value = e.target.value;

                                    if (addressProofType === "AADHAAR") {
                                        value = value.replace(/\D/g, "");
                                    }

                                    if (addressProofType === "LIGHT_BILL") {
                                        value = value.replace(/\D/g, "");
                                    }

                                    setAddressProofNumber(value);
                                }}
                                disabled={!addressProofType}
                            />
                        </div>

                        <div className="document-form-group">
                            <label>Upload Address Proof</label>
                            <input
                                type="file"
                                accept=".pdf,image/*"
                                onChange={(e) => setAddressProofFile(e.target.files[0])}
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="primary-btn document-submit-btn"
                >
                    Submit Documents
                </button>
            </form>
        </div>
    );
}

export default EmployeeDocumentUpload;