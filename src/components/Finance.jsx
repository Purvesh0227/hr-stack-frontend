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
import {
    getMonthName,
    formatCurrency,
    sortSlipsNewestFirst
} from "../utils/salaryUtils";
import { useNotification } from "../contexts/NotificationContext";
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
    const { showNotification } = useNotification();

    const [salarySlips, setSalarySlips] = useState([]);
    const [showMySalary, setShowMySalary] = useState(false);
    const [loading, setLoading] = useState(false);

    const [selectedSlip, setSelectedSlip] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const [replacingId, setReplacingId] = useState(null);

    const [showStructureModal, setShowStructureModal] = useState(false);
    const [structureForm, setStructureForm] = useState(
        EMPTY_STRUCTURE_FORM
    );
    const [savingStructure, setSavingStructure] = useState(false);

    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generateForm, setGenerateForm] = useState(
        EMPTY_GENERATE_FORM
    );
    const [generating, setGenerating] = useState(false);

    /* =========================================
       LOAD SALARY SLIPS
       ========================================= */

    const loadSalarySlips = async (scope) => {
        try {
            setLoading(true);

            const response = await viewSalarySlips(scope);

            setSalarySlips(
                sortSlipsNewestFirst(response.data)
            );

            setShowMySalary(scope === "MY");
        } catch (error) {
            showNotification(
                error.response?.data?.error ||
                    "Unable to fetch salary slips",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (role === "ADMIN") {
            loadSalarySlips("ALL");
        } else {
            loadSalarySlips("MY");
        }
    }, [role]);

    /* =========================================
       SALARY VIEW ACTIONS
       ========================================= */

    const handleViewAllSalarySlips = () => {
        loadSalarySlips("ALL");
    };

    const handleMySalarySlip = () => {
        loadSalarySlips("MY");
    };

    /* =========================================
       VIEW SALARY SLIP
       ========================================= */

    const handleView = (slip) => {
        setSelectedSlip(slip);
    };

    const handleCloseView = () => {
        setSelectedSlip(null);
    };

    /* =========================================
       DOWNLOAD SALARY SLIP
       ========================================= */

    const handleDownload = async (slip) => {
        try {
            setDownloadingId(slip.id);

            const response = await downloadSalarySlip(
                slip.empId,
                slip.month,
                slip.year
            );

            const blobUrl = window.URL.createObjectURL(
                new Blob([response.data], {
                    type: "application/pdf"
                })
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
            showNotification(
                error.response?.data?.error ||
                    "Unable to download salary slip",
                "error"
            );
        } finally {
            setDownloadingId(null);
        }
    };

    /* =========================================
       REPLACE SALARY SLIP
       ========================================= */

    const handleReplace = async (slip) => {
        const fileInput = document.createElement("input");

        fileInput.type = "file";
        fileInput.accept = "application/pdf";

        fileInput.onchange = async (event) => {
            const file = event.target.files?.[0];

            if (!file) {
                return;
            }

            if (file.type !== "application/pdf") {
                showNotification(
                    "Please select a PDF file",
                    "error"
                );
                return;
            }

            try {
                setReplacingId(slip.id);

                /* 1. Get temporary upload URL */
                const response = await getTempUploadUrl(
                    slip.empId,
                    slip.month,
                    slip.year
                );

                const uploadUrl = response.data;

                /* 2. Upload directly to MinIO */
                await uploadFileDirectlyToMinio(
                    uploadUrl,
                    file
                );

                /* 3. Temporary object key */
                const tempObjectKey =
                    `salary-slips/${slip.year}/${slip.month}/${slip.empId}.pdf`;

                /* 4. Replace existing salary slip */
                await replaceSalarySlip(
                    slip.empId,
                    slip.month,
                    slip.year,
                    tempObjectKey
                );

                showNotification(
                    "Salary slip replaced successfully",
                    "success"
                );

                await loadSalarySlips(
                    showMySalary ? "MY" : "ALL"
                );
            } catch (error) {
                console.error(
                    "Replace salary slip error:",
                    error
                );

                showNotification(
                    error.response?.data?.error ||
                        error.response?.data?.message ||
                        "Unable to replace salary slip",
                    "error"
                );
            } finally {
                setReplacingId(null);
            }
        };

        fileInput.click();
    };

    /* =========================================
       SALARY STRUCTURE
       ========================================= */

    const handleOpenStructureModal = () => {
        setStructureForm(EMPTY_STRUCTURE_FORM);
        setShowStructureModal(true);
    };

    const handleCloseStructureModal = () => {
        setShowStructureModal(false);
        setStructureForm(EMPTY_STRUCTURE_FORM);
    };

    const handleStructureChange = (event) => {
        const {
            name,
            value,
            type,
            checked
        } = event.target;

        setStructureForm({
            ...structureForm,
            [name]:
                type === "checkbox"
                    ? checked
                    : value
        });
    };

    const isStructureFormValid =
        structureForm.empId.trim() !== "" &&
        Number(structureForm.basic) > 0 &&
        Number(structureForm.hra) >= 0 &&
        Number(structureForm.allowances) >= 0;

    const handleSubmitStructure = async (event) => {
        event.preventDefault();

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

            showNotification(
                "Salary structure saved successfully",
                "success"
            );

            handleCloseStructureModal();
        } catch (error) {
            showNotification(
                error.response?.data?.error ||
                    error.response?.data?.message ||
                    "Unable to save salary structure",
                "error"
            );
        } finally {
            setSavingStructure(false);
        }
    };

    /* =========================================
       GENERATE SALARY SLIP
       ========================================= */

    const handleOpenGenerateModal = () => {
        setGenerateForm(EMPTY_GENERATE_FORM);
        setShowGenerateModal(true);
    };

    const handleCloseGenerateModal = () => {
        setShowGenerateModal(false);
        setGenerateForm(EMPTY_GENERATE_FORM);
    };

    const handleGenerateChange = (event) => {
        const {
            name,
            value
        } = event.target;

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

    const handleSubmitGenerate = async (event) => {
        event.preventDefault();

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

            showNotification(
                "Salary slip generated successfully",
                "success"
            );

            handleCloseGenerateModal();

            await loadSalarySlips(
                showMySalary ? "MY" : "ALL"
            );
        } catch (error) {
            showNotification(
                error.response?.data?.error ||
                    error.response?.data?.message ||
                    "Unable to generate salary slip",
                "error"
            );
        } finally {
            setGenerating(false);
        }
    };

    /* =========================================
       PAGE
       ========================================= */

    return (
        <div className="finance-page">

            {/* =====================================
                PAGE HEADER
                ===================================== */}

            <div className="finance-page-header">
                <div>
                    <p className="dashboard-eyebrow">
                        {role === "ADMIN"
                            ? "Admin Dashboard"
                            : "Employee Dashboard"}
                    </p>

                    <h1>Finance</h1>

                    <p className="finance-page-subtitle">
                        Manage salary slips, salary structures,
                        and employee payroll information.
                    </p>
                </div>

                {role === "ADMIN" && (
                    <div className="finance-header-actions">
                        <button
                            className="secondary-btn"
                            onClick={handleOpenGenerateModal}
                        >
                            Generate Salary Slip
                        </button>

                        <button
                            className="primary-btn"
                            onClick={handleOpenStructureModal}
                        >
                            Create Salary Structure
                        </button>
                    </div>
                )}
            </div>

            {/* =====================================
                MAIN FINANCE CARD
                ===================================== */}

            <div className="finance-card">

                <div className="finance-card-header">
                    <div>
                        <h2>
                            {showMySalary
                                ? "My Salary Slip"
                                : role === "ADMIN"
                                    ? "All Salary Slips"
                                    : "My Salary Slip"}
                        </h2>

                        <p>
                            {salarySlips.length} salary{" "}
                            {salarySlips.length === 1
                                ? "slip"
                                : "slips"}
                        </p>
                    </div>

                    <div className="finance-view-actions">
                        {role === "ADMIN" && (
                            <button
                                className="secondary-btn"
                                onClick={handleViewAllSalarySlips}
                                disabled={loading}
                            >
                                All Salary Slips
                            </button>
                        )}

                        <button
                            className="primary-btn"
                            onClick={handleMySalarySlip}
                            disabled={loading}
                        >
                            My Salary Slip
                        </button>
                    </div>
                </div>

                {/* =================================
                    SALARY TABLE
                    ================================= */}

                <div className="finance-table-container">

                    <div className="finance-table-header">
                        <div>
                            <h3>
                                {showMySalary
                                    ? "My Salary Slip"
                                    : role === "ADMIN"
                                        ? "All Salary Slips"
                                        : "My Salary Slip"}
                            </h3>

                            <p>
                                Review salary information and
                                download available salary slips.
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="finance-empty-state">
                            <span className="finance-loading-spinner" />
                            <p>Loading salary slips...</p>
                        </div>
                    ) : salarySlips.length === 0 ? (
                        <div className="finance-empty-state">
                            <p>No salary slips found.</p>
                        </div>
                    ) : (
                        <div className="finance-table-wrapper">
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
                                            <td>
                                                <strong>
                                                    {slip.empId}
                                                </strong>
                                            </td>

                                            <td>
                                                {getMonthName(
                                                    slip.month
                                                )}
                                            </td>

                                            <td>
                                                {slip.year}
                                            </td>

                                            <td>
                                                <strong className="finance-net-value">
                                                    {formatCurrency(
                                                        slip.netSalary
                                                    )}
                                                </strong>
                                            </td>

                                            <td>
                                                <div className="finance-actions-cell">

                                                    <button
                                                        className="secondary-btn finance-table-btn"
                                                        onClick={() =>
                                                            handleView(
                                                                slip
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        className="primary-btn finance-table-btn"
                                                        onClick={() =>
                                                            handleDownload(
                                                                slip
                                                            )
                                                        }
                                                        disabled={
                                                            downloadingId ===
                                                            slip.id
                                                        }
                                                    >
                                                        {downloadingId ===
                                                        slip.id
                                                            ? "Downloading..."
                                                            : "Download"}
                                                    </button>

                                                    {slip.replaceAllowed && (
                                                        <button
                                                            className="replace-btn finance-table-btn"
                                                            onClick={() =>
                                                                handleReplace(
                                                                    slip
                                                                )
                                                            }
                                                            disabled={
                                                                replacingId ===
                                                                slip.id
                                                            }
                                                        >
                                                            {replacingId ===
                                                            slip.id
                                                                ? "Replacing..."
                                                                : "Replace"}
                                                        </button>
                                                    )}

                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* =====================================
                VIEW SALARY SLIP MODAL
                ===================================== */}

            {selectedSlip && (
                <div className="finance-modal-overlay">
                    <div className="finance-slip-modal">

                        <div className="finance-slip-modal-header">
                            <div>
                                <p className="finance-modal-eyebrow">
                                    Salary Details
                                </p>

                                <h2 className="modal-title">
                                    Salary Slip
                                </h2>
                            </div>

                            <button
                                className="finance-modal-close"
                                onClick={handleCloseView}
                                aria-label="Close salary slip"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="finance-slip-details">

                            <div className="finance-detail-row">
                                <span>Employee ID</span>
                                <strong>
                                    {selectedSlip.empId}
                                </strong>
                            </div>

                            <div className="finance-detail-row">
                                <span>Salary Period</span>
                                <strong>
                                    {getMonthName(
                                        selectedSlip.month
                                    )}{" "}
                                    {selectedSlip.year}
                                </strong>
                            </div>

                            <div className="finance-detail-row">
                                <span>Working Days</span>
                                <strong>
                                    {selectedSlip.workingDays}
                                </strong>
                            </div>

                            <div className="finance-detail-row">
                                <span>Present Days</span>
                                <strong>
                                    {selectedSlip.presentDays}
                                </strong>
                            </div>

                            <div className="finance-detail-row">
                                <span>Absent Days</span>
                                <strong>
                                    {selectedSlip.absentDays}
                                </strong>
                            </div>

                            <div className="finance-detail-row">
                                <span>Gross Salary</span>
                                <strong>
                                    {formatCurrency(
                                        selectedSlip.grossSalary
                                    )}
                                </strong>
                            </div>

                            <div className="finance-detail-row">
                                <span>Deductions</span>
                                <strong>
                                    {formatCurrency(
                                        selectedSlip.deduction
                                    )}
                                </strong>
                            </div>

                            <div className="finance-detail-row finance-detail-net">
                                <span>Net Salary</span>
                                <strong>
                                    {formatCurrency(
                                        selectedSlip.netSalary
                                    )}
                                </strong>
                            </div>

                        </div>

                        <div className="finance-modal-footer">
                            <button
                                className="primary-btn"
                                onClick={() =>
                                    handleDownload(
                                        selectedSlip
                                    )
                                }
                                disabled={
                                    downloadingId ===
                                    selectedSlip.id
                                }
                            >
                                {downloadingId ===
                                selectedSlip.id
                                    ? "Downloading..."
                                    : "Download"}
                            </button>

                            <button
                                className="cancel-btn"
                                onClick={handleCloseView}
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* =====================================
                GENERATE SALARY SLIP MODAL
                ===================================== */}

            {role === "ADMIN" && showGenerateModal && (
                <div className="finance-modal-overlay">
                    <div className="finance-form-modal">

                        <div className="finance-form-modal-header">
                            <div>
                                <p className="finance-modal-eyebrow">
                                    Admin Action
                                </p>

                                <h2>
                                    Generate Salary Slip
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="finance-modal-close"
                                onClick={
                                    handleCloseGenerateModal
                                }
                                aria-label="Close generate salary modal"
                            >
                                &times;
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmitGenerate}
                            className="finance-form"
                        >
                            <div className="finance-form-group">
                                <label htmlFor="generate-emp-id">
                                    Employee ID
                                </label>

                                <input
                                    id="generate-emp-id"
                                    type="text"
                                    name="empId"
                                    placeholder="Enter Employee ID"
                                    value={generateForm.empId}
                                    onChange={
                                        handleGenerateChange
                                    }
                                    required
                                />
                            </div>

                            <div className="finance-form-group">
                                <label htmlFor="generate-month">
                                    Month
                                </label>

                                <select
                                    id="generate-month"
                                    name="month"
                                    value={generateForm.month}
                                    onChange={
                                        handleGenerateChange
                                    }
                                    required
                                >
                                    <option
                                        value=""
                                        disabled
                                    >
                                        Select Month
                                    </option>

                                    {Array.from(
                                        { length: 12 },
                                        (_, index) => index + 1
                                    ).map((month) => (
                                        <option
                                            key={month}
                                            value={month}
                                        >
                                            {getMonthName(month)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="finance-form-group">
                                <label htmlFor="generate-year">
                                    Year
                                </label>

                                <input
                                    id="generate-year"
                                    type="number"
                                    name="year"
                                    placeholder="Enter Year"
                                    value={generateForm.year}
                                    onChange={
                                        handleGenerateChange
                                    }
                                    min="2000"
                                    max="2100"
                                    required
                                />
                            </div>

                            <p className="finance-generate-hint">
                                Salary can only be generated for a
                                completed month, and the employee
                                must already have a salary structure.
                            </p>

                            <div className="finance-modal-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={
                                        handleCloseGenerateModal
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={
                                        !isGenerateFormValid ||
                                        generating
                                    }
                                >
                                    {generating
                                        ? "Generating..."
                                        : "Generate"}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

            {/* =====================================
                CREATE SALARY STRUCTURE MODAL
                ===================================== */}

            {role === "ADMIN" && showStructureModal && (
                <div className="finance-modal-overlay">
                    <div className="finance-form-modal">

                        <div className="finance-form-modal-header">
                            <div>
                                <p className="finance-modal-eyebrow">
                                    Admin Action
                                </p>

                                <h2>
                                    Create Salary Structure
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="finance-modal-close"
                                onClick={
                                    handleCloseStructureModal
                                }
                                aria-label="Close salary structure modal"
                            >
                                &times;
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmitStructure}
                            className="finance-form"
                        >
                            <div className="finance-form-group">
                                <label htmlFor="structure-emp-id">
                                    Employee ID
                                </label>

                                <input
                                    id="structure-emp-id"
                                    type="text"
                                    name="empId"
                                    placeholder="Enter Employee ID"
                                    value={structureForm.empId}
                                    onChange={
                                        handleStructureChange
                                    }
                                    required
                                />
                            </div>

                            <div className="finance-form-group">
                                <label htmlFor="structure-basic">
                                    Basic Salary
                                </label>

                                <input
                                    id="structure-basic"
                                    type="number"
                                    name="basic"
                                    placeholder="Enter Basic Salary"
                                    value={structureForm.basic}
                                    onChange={
                                        handleStructureChange
                                    }
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="finance-form-group">
                                <label htmlFor="structure-hra">
                                    HRA
                                </label>

                                <input
                                    id="structure-hra"
                                    type="number"
                                    name="hra"
                                    placeholder="Enter HRA"
                                    value={structureForm.hra}
                                    onChange={
                                        handleStructureChange
                                    }
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="finance-form-group">
                                <label htmlFor="structure-allowances">
                                    Allowances
                                </label>

                                <input
                                    id="structure-allowances"
                                    type="number"
                                    name="allowances"
                                    placeholder="Enter Allowances"
                                    value={structureForm.allowances}
                                    onChange={
                                        handleStructureChange
                                    }
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <label className="finance-checkbox-label">
                                <input
                                    type="checkbox"
                                    name="pfApplicable"
                                    checked={
                                        structureForm.pfApplicable
                                    }
                                    onChange={
                                        handleStructureChange
                                    }
                                />

                                <span>
                                    PF Applicable
                                </span>
                            </label>

                            <div className="finance-modal-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={
                                        handleCloseStructureModal
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={
                                        !isStructureFormValid ||
                                        savingStructure
                                    }
                                >
                                    {savingStructure
                                        ? "Saving..."
                                        : "Save"}
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