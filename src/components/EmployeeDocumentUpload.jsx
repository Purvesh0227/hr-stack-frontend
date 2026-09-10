import { useState } from "react";
import {
    getEmployeeDocumentUploadUrl,
    uploadDocumentDirectlyToMinio,
    saveEmployeeDocuments
} from "../services/api";
import { useNotification } from "../contexts/NotificationContext";

function EmployeeDocumentUpload({ employee }) {
    const { showNotification } = useNotification();

    const [idProofType, setIdProofType] = useState("");
    const [idProofNumber, setIdProofNumber] = useState("");
    const [addressProofType, setAddressProofType] = useState("");
    const [addressProofNumber, setAddressProofNumber] = useState("");

    const [idProofFile, setIdProofFile] = useState(null);
    const [addressProofFile, setAddressProofFile] = useState(null);


    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!idProofFile || !addressProofFile) {
            showNotification("Please select both documents", "error");
            return;
        }

        if (!idProofType || !idProofNumber) {
            showNotification("Please enter ID proof details", "error");
            return;
        }

        if (!addressProofType || !addressProofNumber) {
            showNotification("Please enter address proof details", "error");
            return;
        }

        try {

            // ID PROOF
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


            // ADDRESS PROOF
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


            // SAVE DOCUMENT DETAILS
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

            showNotification("Documents submitted successfully", "success");

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


    return (
        <div className="content-card employee-document-upload">

            <h2>Upload Required Documents</h2>

            <form onSubmit={handleSubmit}>

                <div className="document-upload-grid">

                    {/* ================= ID PROOF ================= */}

                    <div className="document-card">

                        <h3>ID Proof</h3>

                        <div className="document-form-group">

                            <label>
                                Proof Type
                            </label>

                            <select
                                value={idProofType}
                                onChange={(e) =>
                                    setIdProofType(e.target.value)
                                }
                            >

                                <option value="">
                                    Select ID Proof
                                </option>

                                <option value="AADHAAR">
                                    Aadhaar
                                </option>

                                <option value="PAN">
                                    PAN
                                </option>

                            </select>

                        </div>


                        <div className="document-form-group">

                            <label>
                                Document Number
                            </label>

                            <input
                                type="text"
                                value={idProofNumber}
                                onChange={(e) =>
                                    setIdProofNumber(e.target.value)
                                }
                                placeholder="Enter ID proof number"
                            />

                        </div>


                        <div className="document-form-group">

                            <label>
                                Upload ID Proof
                            </label>

                            <input
                                type="file"
                                accept=".pdf,image/*"
                                onChange={(e) =>
                                    setIdProofFile(e.target.files[0])
                                }
                            />

                        </div>

                    </div>


                    {/* ================= ADDRESS PROOF ================= */}

                    <div className="document-card">

                        <h3>Address Proof</h3>

                        <div className="document-form-group">

                            <label>
                                Proof Type
                            </label>

                            <select
                                value={addressProofType}
                                onChange={(e) =>
                                    setAddressProofType(e.target.value)
                                }
                            >

                                <option value="">
                                    Select Address Proof
                                </option>

                                <option value="AADHAAR">
                                    Aadhaar
                                </option>

                                <option value="LIGHT_BILL">
                                    Light Bill
                                </option>

                            </select>

                        </div>


                        <div className="document-form-group">

                            <label>
                                Document Number
                            </label>

                            <input
                                type="text"
                                value={addressProofNumber}
                                onChange={(e) =>
                                    setAddressProofNumber(e.target.value)
                                }
                                placeholder="Enter address proof number"
                            />

                        </div>


                        <div className="document-form-group">

                            <label>
                                Upload Address Proof
                            </label>

                            <input
                                type="file"
                                accept=".pdf,image/*"
                                onChange={(e) =>
                                    setAddressProofFile(e.target.files[0])
                                }
                            />

                        </div>

                    </div>

                </div>


                {/* SUBMIT */}

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