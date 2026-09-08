import { useEffect, useState } from "react";
import {
    viewSalarySlips,
    downloadSalarySlip,
    createOrUpdateSalaryStructure,
    generateSalary,
    replaceSalarySlip,
    getTempUploadUrl,
    uploadFileDirectlyToMinio
} from "../services/api";
import { getMonthName, formatCurrency, sortSlipsNewestFirst } from "../utils/salaryUtils";
import "../styles/finance.css";

const EMPTY_STRUCTURE_FORM = {
    empId: "",
    basic: "",
    hra: "",
    allowances: "",
    pfApplicable: false
};

const EMPTY_GENERATE_FORM = {
    empId: "",
    month: "",
    year: ""
};

function Finance({ role }) {
    const [salarySlips, setSalarySlips] = useState([]);
    const [showMySalary, setShowMySalary] = useState(false);
    const [loading, setLoading] = useState(false);

    const [selectedSlip, setSelectedSlip] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const [replacingId, setReplacingId] = useState(null);

    const [showStructureModal, setShowStructureModal] = useState(false);
    const [structureForm, setStructureForm] = useState(EMPTY_STRUCTURE_FORM);
    const [savingStructure, setSavingStructure] = useState(false);

    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generateForm, setGenerateForm] = useState(EMPTY_GENERATE_FORM);
    const [generating, setGenerating] = useState(false);

    // Load salary slips for a given scope ("MY" or "ALL")
    const loadSalarySlips = async (scope) => {
        try {
            setLoading(true);
            const response = await viewSalarySlips(scope);
            setSalarySlips(sortSlipsNewestFirst(response.data));
            setShowMySalary(scope === "MY");
        } catch (error) {
            alert(error.response?.data?.error || "Unable to fetch salary slips");
        } finally {
            setLoading(false);
        }
    };

    // Initial load — Admin sees all slips by default, Employee sees their own
    useEffect(() => {
        if (role === "ADMIN") {
            loadSalarySlips("ALL");
        } else {
            loadSalarySlips("MY");
        }
    }, [role]);

    const handleViewAllSalarySlips = () => {
        loadSalarySlips("ALL");
    };

    const handleMySalarySlip = () => {
        loadSalarySlips("MY");
    };

    // View slip details in modal
    const handleView = (slip) => {
        setSelectedSlip(slip);
    };

    const handleCloseView = () => {
        setSelectedSlip(null);
    };

    // Download slip PDF as a blob
    const handleDownload = async (slip) => {
        try {
            setDownloadingId(slip.id);

            const response = await downloadSalarySlip(
                slip.empId,
                slip.month,
                slip.year
            );

            const blobUrl = window.URL.createObjectURL(
                new Blob([response.data], { type: "application/pdf" })
            );

            const link = document.createElement("a");
            link.href = blobUrl;
            link.setAttribute(
                "download",
                `salary-slip-${slip.empId}-${slip.month}-${slip.year}.pdf`
            );

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            alert(error.response?.data?.error || "Unable to download salary slip");
        } finally {
            setDownloadingId(null);
        }
    };

    // Replace salary slip PDF (Admin only)
const handleReplace = async (slip) => {
    const fileInput = document.createElement("input");

    fileInput.type = "file";
    fileInput.accept = "application/pdf";

    fileInput.onchange = async (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (file.type !== "application/pdf") {
            alert("Please select a PDF file");
            return;
        }

        try {
            setReplacingId(slip.id);

            // 1. Get presigned upload URL from backend
            const response = await getTempUploadUrl(
                slip.empId,
                slip.month,
                slip.year
            );

            const uploadUrl = response.data;

            // 2. Upload PDF directly to MinIO
            await uploadFileDirectlyToMinio(
                uploadUrl,
                file
            );

            // 3. Create the object key
            const tempObjectKey =
                `salary-slips/${slip.year}/${slip.month}/${slip.empId}.pdf`;

            // 4. Tell backend which MinIO object to replace
            await replaceSalarySlip(
                slip.empId,
                slip.month,
                slip.year,
                tempObjectKey
            );

            alert("Salary slip replaced successfully");

            await loadSalarySlips(
                showMySalary ? "MY" : "ALL"
            );

        } catch (error) {
            console.error("Replace salary slip error:", error);

            alert(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Unable to replace salary slip"
            );
        } finally {
            setReplacingId(null);
        }
    };

    fileInput.click();
};

    // ---------------- Create Salary Structure (Admin) ----------------

    const handleOpenStructureModal = () => {
        setStructureForm(EMPTY_STRUCTURE_FORM);
        setShowStructureModal(true);
    };

    const handleCloseStructureModal = () => {
        setShowStructureModal(false);
        setStructureForm(EMPTY_STRUCTURE_FORM);
    };

    const handleStructureChange = (e) => {
        const { name, value, type, checked } = e.target;
        setStructureForm({
            ...structureForm,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const isStructureFormValid =
        structureForm.empId.trim() !== "" &&
        Number(structureForm.basic) > 0 &&
        Number(structureForm.hra) >= 0 &&
        Number(structureForm.allowances) >= 0;

    const handleSubmitStructure = async (e) => {
        e.preventDefault();

        if (!isStructureFormValid) {
            return;
        }

        try {
            setSavingStructure(true);

            await createOrUpdateSalaryStructure({
                empId: structureForm.empId.trim(),
                basic: Number(structureForm.basic),
                hra: Number(structureForm.hra),
                allowances: Number(structureForm.allowances),
                pfApplicable: structureForm.pfApplicable
            });

            alert("Salary structure saved successfully");
            handleCloseStructureModal();
        } catch (error) {
            alert(error.response?.data?.error || error.response?.data?.message || "Unable to save salary structure");
        } finally {
            setSavingStructure(false);
        }
    };

    // ---------------- Generate Salary Slip (Admin) ----------------

    const handleOpenGenerateModal = () => {
        setGenerateForm(EMPTY_GENERATE_FORM);
        setShowGenerateModal(true);
    };

    const handleCloseGenerateModal = () => {
        setShowGenerateModal(false);
        setGenerateForm(EMPTY_GENERATE_FORM);
    };

    const handleGenerateChange = (e) => {
        const { name, value } = e.target;
        setGenerateForm({
            ...generateForm,
            [name]: value
        });
    };

    const isGenerateFormValid =
        generateForm.empId.trim() !== "" &&
        Number(generateForm.month) >= 1 &&
        Number(generateForm.month) <= 12 &&
        Number(generateForm.year) > 2000;

    const handleSubmitGenerate = async (e) => {
        e.preventDefault();

        if (!isGenerateFormValid) {
            return;
        }

        try {
            setGenerating(true);

            await generateSalary(
                generateForm.empId.trim(),
                Number(generateForm.month),
                Number(generateForm.year)
            );

            alert("Salary slip generated successfully");
            handleCloseGenerateModal();

            // Refresh whichever view is currently active
            loadSalarySlips(showMySalary ? "MY" : "ALL");
        } catch (error) {
            alert(error.response?.data?.error || error.response?.data?.message || "Unable to generate salary slip");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="finance-page">
            <div className="content-card">

                {/* Header */}
                <div className="card-header">
                    <h2>Finance</h2>

                    {role === "ADMIN" && (
                        <div className="finance-header-actions">
                            <button className="secondary-btn" onClick={handleOpenGenerateModal}>
                                Generate Salary Slip
                            </button>
                            <button className="primary-btn" onClick={handleOpenStructureModal}>
                                Create Salary Structure
                            </button>
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                <div className="finance-actions">
                    {role === "ADMIN" && (
                        <button className="primary-btn" onClick={handleViewAllSalarySlips}>
                            All Salary Slips
                        </button>
                    )}

                    <button className="primary-btn" onClick={handleMySalarySlip}>
                        My Salary Slip
                    </button>
                </div>

                {/* Salary slip table */}
                <div className="finance-table-container">
                    <div className="finance-table-header">
                        <h3>
                            {showMySalary
                                ? "My Salary Slip"
                                : role === "ADMIN"
                                    ? "All Salary Slips"
                                    : "My Salary Slip"}
                        </h3>
                    </div>

                    {loading ? (
                        <p className="no-salary-slips">Loading salary slips...</p>
                    ) : salarySlips.length === 0 ? (
                        <p className="no-salary-slips">No salary slips found.</p>
                    ) : (
                        <table className="employee-table">
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Month</th>
                                    <th>Year</th>
                                    <th>Net Salary</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salarySlips.map((slip) => (
                                    <tr key={slip.id}>
                                        <td>{slip.empId}</td>
                                        <td>{getMonthName(slip.month)}</td>
                                        <td>{slip.year}</td>
                                        <td>{formatCurrency(slip.netSalary)}</td>
                                        <td className="finance-actions-cell">
                                            <button
                                                className="secondary-btn"
                                                onClick={() => handleView(slip)}
                                            >
                                                View
                                            </button>
                                            <button
                                                className="primary-btn"
                                                onClick={() => handleDownload(slip)}
                                                disabled={downloadingId === slip.id}
                                            >
                                                {downloadingId === slip.id ? "Downloading..." : "Download"}
                                            </button>
                                            {slip.replaceAllowed && (
                                                    <button
                                                    className="replace-btn"
                                                        onClick={() => handleReplace(slip)}
                                                        disabled={replacingId === slip.id}
                                                    >
                                                        {replacingId === slip.id ? "Replacing..." : "Replace"}
                                                    </button>
                                                )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Salary slip view modal */}
            {selectedSlip && (
                <div className="finance-modal-overlay">
                    <div className="finance-slip-modal">
                        <div className="finance-slip-modal-header">
                            <h2 className="modal-title">Salary Slip</h2>
                            <button className="finance-modal-close" onClick={handleCloseView}>
                                &times;
                            </button>
                        </div>

                        <div className="finance-slip-details">
                            <p><strong>Employee ID:</strong> {selectedSlip.empId}</p>
                            <p><strong>Month:</strong> {getMonthName(selectedSlip.month)} {selectedSlip.year}</p>
                            <p><strong>Working Days:</strong> {selectedSlip.workingDays}</p>
                            <p><strong>Present Days:</strong> {selectedSlip.presentDays}</p>
                            <p><strong>Absent Days:</strong> {selectedSlip.absentDays}</p>
                            <p><strong>Gross Salary:</strong> {formatCurrency(selectedSlip.grossSalary)}</p>
                            <p><strong>Deductions:</strong> {formatCurrency(selectedSlip.deduction)}</p>
                            <p className="finance-net-salary"><strong>Net Salary:</strong> {formatCurrency(selectedSlip.netSalary)}</p>
                        </div>

                        <div className="finance-modal-footer">
                            <button
                                className="primary-btn"
                                onClick={() => handleDownload(selectedSlip)}
                                disabled={downloadingId === selectedSlip.id}
                            >
                                {downloadingId === selectedSlip.id ? "Downloading..." : "Download"}
                            </button>
                            <button className="cancel-btn" onClick={handleCloseView}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Generate Salary Slip modal (Admin only) */}
            {role === "ADMIN" && showGenerateModal && (
                <div className="finance-modal-overlay">
                    <div className="modal">
                        <h2>Generate Salary Slip</h2>

                        <form onSubmit={handleSubmitGenerate}>
                            <input
                                type="text"
                                name="empId"
                                placeholder="Employee ID"
                                value={generateForm.empId}
                                onChange={handleGenerateChange}
                                required
                            />

                            <select
                                name="month"
                                value={generateForm.month}
                                onChange={handleGenerateChange}
                                required
                            >
                                <option value="" disabled>Select Month</option>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                    <option key={m} value={m}>{getMonthName(m)}</option>
                                ))}
                            </select>

                            <input
                                type="number"
                                name="year"
                                placeholder="Year"
                                value={generateForm.year}
                                onChange={handleGenerateChange}
                                min="2000"
                                max="2100"
                                required
                            />

                            <p className="finance-generate-hint">
                                Salary can only be generated for a completed month, and the employee must already have a salary structure.
                            </p>

                            <div className="modal-buttons">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={handleCloseGenerateModal}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-btn"
                                    disabled={!isGenerateFormValid || generating}
                                >
                                    {generating ? "Generating..." : "Generate"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Salary Structure modal (Admin only) */}
            {role === "ADMIN" && showStructureModal && (
                <div className="finance-modal-overlay">
                    <div className="modal">
                        <h2>Create Salary Structure</h2>

                        <form onSubmit={handleSubmitStructure}>
                            <input
                                type="text"
                                name="empId"
                                placeholder="Employee ID"
                                value={structureForm.empId}
                                onChange={handleStructureChange}
                                required
                            />

                            <input
                                type="number"
                                name="basic"
                                placeholder="Basic Salary"
                                value={structureForm.basic}
                                onChange={handleStructureChange}
                                min="0"
                                step="0.01"
                                required
                            />

                            <input
                                type="number"
                                name="hra"
                                placeholder="HRA"
                                value={structureForm.hra}
                                onChange={handleStructureChange}
                                min="0"
                                step="0.01"
                                required
                            />

                            <input
                                type="number"
                                name="allowances"
                                placeholder="Allowances"
                                value={structureForm.allowances}
                                onChange={handleStructureChange}
                                min="0"
                                step="0.01"
                                required
                            />

                            <label className="finance-checkbox-label">
                                <input
                                    type="checkbox"
                                    name="pfApplicable"
                                    checked={structureForm.pfApplicable}
                                    onChange={handleStructureChange}
                                />
                                PF Applicable
                            </label>

                            <div className="modal-buttons">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={handleCloseStructureModal}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-btn"
                                    disabled={!isStructureFormValid || savingStructure}
                                >
                                    {savingStructure ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Finance;