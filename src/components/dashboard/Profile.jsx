import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import Loader from "../Loader";

import {
    getEmployeeDocumentViewUrl,
    updateEmployeeProfilePhoto
} from "../../services/api";

import PdfViewer from "../../components/common/PdfViewer";
import EmployeeIdCard from "../../components/common/EmployeeIdCard";

import { FiEdit2, FiEye } from "react-icons/fi";


function Profile({
    role,
    employee,
    adminProfile,
    loadingProfile,
    handleSaveOwnProfile
}) {

    const profile =
        role === "ADMIN"
            ? adminProfile
            : employee;


    // =========================================================
    // DOCUMENT STATES
    // =========================================================

    const [documents, setDocuments] =
        useState([]);

    const [loadingDocuments, setLoadingDocuments] =
        useState(false);


    // =========================================================
    // PROFILE PHOTO STATES
    // =========================================================

    const [showProfilePhoto, setShowProfilePhoto] =
        useState(false);

    const [selectedPhoto, setSelectedPhoto] =
        useState(null);

    const [previewPhotoUrl, setPreviewPhotoUrl] =
        useState(null);

    const [updatingProfilePhoto, setUpdatingProfilePhoto] =
        useState(false);

    const profilePhotoInputRef =
        useRef(null);


    // =========================================================
    // ID CARD
    // =========================================================

    const [showIdCard, setShowIdCard] =
        useState(false);


    // =========================================================
    // PROFILE DETAILS EDIT
    // =========================================================

    const [isEditingDetails, setIsEditingDetails] =
        useState(false);

    const [editedFirstName, setEditedFirstName] =
        useState("");

    const [editedLastName, setEditedLastName] =
        useState("");

    const [editedMobile, setEditedMobile] =
        useState("");

    const [savingDetails, setSavingDetails] =
        useState(false);


    // =========================================================
    // LOAD EMPLOYEE DOCUMENTS
    // =========================================================

    useEffect(() => {

        if (
            role !== "EMPLOYEE" ||
            !profile?.id
        ) {
            return;
        }


        const loadDocuments = async () => {

            setLoadingDocuments(true);

            try {

                const documentTypes = [
                    "ID_PROOF",
                    "ADDRESS_PROOF"
                ];

                const loadedDocuments = [];


                for (
                    const documentType
                    of documentTypes
                ) {

                    try {

                        const response =
                            await getEmployeeDocumentViewUrl(
                                profile.id,
                                documentType
                            );


                        if (response.data) {

                            loadedDocuments.push({
                                type: documentType,
                                url: response.data
                            });

                        }

                    } catch (error) {

                        // Document may not exist yet.

                    }
                }


                setDocuments(
                    loadedDocuments
                );

            } catch (error) {

                console.error(
                    "Unable to load employee documents:",
                    error
                );

            } finally {

                setLoadingDocuments(false);

            }
        };


        loadDocuments();

    }, [role, profile?.id]);


    // =========================================================
    // CLEAN PREVIEW URL
    // =========================================================

    useEffect(() => {

        return () => {

            if (previewPhotoUrl) {

                URL.revokeObjectURL(
                    previewPhotoUrl
                );

            }

        };

    }, [previewPhotoUrl]);


    // =========================================================
    // LOADING
    // =========================================================

    if (
        role === "ADMIN" &&
        loadingProfile
    ) {

        return (

            <div className="content-card">

                <h2>
                    My Profile
                </h2>

                <Loader />

            </div>

        );

    }


    if (!profile) {

        return (

            <div className="content-card">

                <h2>
                    My Profile
                </h2>

                <p>
                    Profile information not available.
                </p>

            </div>

        );

    }


    // =========================================================
    // FULL NAME
    // =========================================================

    const fullName =
        `${profile.firstName || ""} ${profile.lastName || ""}`
            .trim();


    // =========================================================
    // EDIT DETAILS
    // =========================================================

    const handleEdit = () => {

        if (!profile) {
            return;
        }


        setEditedFirstName(
            profile.firstName || ""
        );

        setEditedLastName(
            profile.lastName || ""
        );

        setEditedMobile(
            profile.mobile || ""
        );

        setIsEditingDetails(true);

    };


    // =========================================================
    // CANCEL DETAILS EDIT
    // =========================================================

    const handleCancelEdit = () => {

        setIsEditingDetails(false);

        setEditedFirstName("");
        setEditedLastName("");
        setEditedMobile("");

    };


    // =========================================================
    // PROFILE PHOTO SELECT
    // =========================================================

    const handleProfilePhotoSelect = () => {

        if (
            updatingProfilePhoto ||
            savingDetails ||
            !profilePhotoInputRef.current
        ) {

            return;

        }


        profilePhotoInputRef.current.click();

    };


    // =========================================================
    // PROFILE PHOTO CHANGE
    // =========================================================

    const handleProfilePhotoChange = (event) => {

        const file =
            event.target.files?.[0];


        // Reset input so the same file
        // can be selected again later.

        event.target.value = "";


        if (!file) {
            return;
        }


        // =====================================================
        // FILE TYPE VALIDATION
        // =====================================================

        const allowedTypes = [
            "image/jpeg",
            "image/png"
        ];


        if (
            !allowedTypes.includes(
                file.type
            )
        ) {

            window.alert(
                "Only JPG, JPEG and PNG images are allowed."
            );

            return;

        }


        // =====================================================
        // FILE SIZE VALIDATION
        // =====================================================

        const maxSize =
            2 * 1024 * 1024;


        if (
            file.size > maxSize
        ) {

            window.alert(
                "Profile photo must not exceed 2 MB."
            );

            return;

        }


        // =====================================================
        // STORE PHOTO LOCALLY
        // =====================================================

        if (previewPhotoUrl) {

            URL.revokeObjectURL(
                previewPhotoUrl
            );

        }


        const previewUrl =
            URL.createObjectURL(file);


        setSelectedPhoto(file);
        setPreviewPhotoUrl(previewUrl);

    };


    // =========================================================
    // SAVE DETAILS + PHOTO
    // =========================================================

    const handleSaveChanges = async () => {

        if (
            !profile ||
            role !== "EMPLOYEE"
        ) {

            return;

        }


        const firstName =
            editedFirstName.trim();

        const lastName =
            editedLastName.trim();

        const mobile =
            editedMobile.trim();


        // =====================================================
        // VALIDATION
        // =====================================================

        if (
            isEditingDetails &&
            (
                !firstName ||
                !lastName ||
                !mobile
            )
        ) {

            window.alert(
                "First name, last name and mobile number are required."
            );

            return;

        }


        // If no details are currently being edited,
        // retain the existing profile values.

        const finalFirstName =
            isEditingDetails
                ? firstName
                : profile.firstName;

        const finalLastName =
            isEditingDetails
                ? lastName
                : profile.lastName;

        const finalMobile =
            isEditingDetails
                ? mobile
                : profile.mobile;


        setSavingDetails(true);


        try {

            // =================================================
            // SAVE EMPLOYEE DETAILS
            // =================================================

            if (isEditingDetails) {

                await handleSaveOwnProfile({

                    firstName:
                        finalFirstName,

                    lastName:
                        finalLastName,

                    mobile:
                        finalMobile

                });

            }


            // =================================================
            // SAVE PROFILE PHOTO
            // =================================================

            if (selectedPhoto) {

                setUpdatingProfilePhoto(true);


                await updateEmployeeProfilePhoto(
                    profile.id,
                    selectedPhoto
                );

            }


            // =================================================
            // RESET LOCAL PHOTO STATE
            // =================================================

            if (previewPhotoUrl) {

                URL.revokeObjectURL(
                    previewPhotoUrl
                );

            }


            setSelectedPhoto(null);
            setPreviewPhotoUrl(null);

            setIsEditingDetails(false);

            setEditedFirstName("");
            setEditedLastName("");
            setEditedMobile("");


            window.alert(
                "Profile changes saved successfully."
            );

        } catch (error) {

            console.error(
                "Profile save error:",
                error
            );


            window.alert(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Unable to save profile changes."
            );

        } finally {

            setSavingDetails(false);
            setUpdatingProfilePhoto(false);

        }

    };


    // =========================================================
    // DOCUMENT NAME
    // =========================================================

    const getDocumentName = (
        type
    ) => {

        if (
            type === "ID_PROOF"
        ) {

            return "Identity Proof";

        }


        if (
            type === "ADDRESS_PROOF"
        ) {

            return "Address Proof";

        }


        return "Document";

    };


    // =========================================================
    // PROFILE PHOTO VIEWER
    // =========================================================

    const profilePhotoViewer =
        showProfilePhoto &&
        (
            previewPhotoUrl ||
            profile.profilePhotoUrl
        )
            ? createPortal(

                <div
                    className="profile-photo-overlay"
                    onClick={() =>
                        setShowProfilePhoto(false)
                    }
                >

                    <div
                        className="profile-photo-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* Close */}

                        <button
                            type="button"
                            className="profile-photo-close"
                            onClick={() =>
                                setShowProfilePhoto(false)
                            }
                            title="Close"
                            aria-label="Close"
                        >
                            ✕
                        </button>


                        {/* Large Photo */}

                        <img
                            src={
                                previewPhotoUrl ||
                                profile.profilePhotoUrl
                            }
                            alt="Profile"
                            className="profile-photo-large"
                        />


                        {/* Replace Photo */}

                        {role === "EMPLOYEE" && (

                            <button
                                type="button"
                                className="profile-photo-replace-btn"
                                onClick={
                                    handleProfilePhotoSelect
                                }
                                disabled={
                                    updatingProfilePhoto ||
                                    savingDetails
                                }
                                title="Replace Photo"
                                aria-label="Replace Photo"
                            >

                                {savingDetails
                                    ? "..."
                                    : <FiEdit2 size={20} />}

                            </button>

                        )}


                        {/* Hidden File Input */}

                        <input
                            ref={
                                profilePhotoInputRef
                            }
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={
                                handleProfilePhotoChange
                            }
                            hidden
                        />

                    </div>

                </div>,

                document.body

            )
            : null;


    // =========================================================
    // RETURN
    // =========================================================

    return (

        <>

            <div className="content-card profile-page">

                <h2>
                    My Profile
                </h2>


                {/* =================================================
                    ID CARD MODAL
                ================================================= */}

                {showIdCard && (

                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            background:
                                "rgba(0, 0, 0, 0.55)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 9999,
                            overflowY: "auto",
                            padding: "30px"
                        }}
                        onClick={() =>
                            setShowIdCard(false)
                        }
                    >

                        <div
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                            style={{
                                position: "relative"
                            }}
                        >

                            {/* CLOSE BUTTON */}

                            <button
                                type="button"
                                onClick={() =>
                                    setShowIdCard(false)
                                }
                                style={{
                                    position: "absolute",
                                    top: "-5px",
                                    right: "-5px",
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    border: "none",
                                    background: "#ffffff",
                                    color: "#333333",
                                    fontSize: "22px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    boxShadow:
                                        "0 3px 10px rgba(0,0,0,0.25)",
                                    zIndex: 10
                                }}
                                title="Close"
                                aria-label="Close ID Card"
                            >
                                ×
                            </button>


                            <EmployeeIdCard
                                employee={profile}
                            />

                        </div>

                    </div>

                )}


                {/* =================================================
                    PROFILE HEADER
                ================================================= */}

                <div className="profile-header">


                    {/* Profile Photo */}

                    <div className="profile-photo-container">

                        <div className="profile-photo-wrapper">

                            {previewPhotoUrl ? (

                                <img
                                    src={previewPhotoUrl}
                                    alt="Selected Profile"
                                    className="profile-photo"
                                />

                            ) : profile.profilePhotoUrl ? (

                                <img
                                    src={
                                        profile.profilePhotoUrl
                                    }
                                    alt="Profile"
                                    className="profile-photo"
                                />

                            ) : (

                                <div className="profile-photo-placeholder">

                                    {fullName
                                        .charAt(0)
                                        .toUpperCase()
                                        || "U"}

                                </div>

                            )}


                            {(profile.profilePhotoUrl ||
                                previewPhotoUrl) && (

                                <button
                                    type="button"
                                    className="profile-photo-view-btn"
                                    onClick={() =>
                                        setShowProfilePhoto(
                                            true
                                        )
                                    }
                                    title="View Photo"
                                    aria-label="View Photo"
                                >
                                    <FiEye size={16} />
                                </button>

                            )}

                        </div>

                    </div>


                    {/* Name / Role */}

                    <div className="profile-header-info">

                        <h3>
                            {fullName || "Employee"}
                        </h3>

                        <p>
                            {profile.role || "Employee"}
                        </p>

                    </div>


                    {/* ID CARD */}

                    {role === "EMPLOYEE" && (

                        <div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowIdCard(true)
                                }
                                style={{
                                    padding: "10px 18px",
                                    border: "1px solid #1f2937",
                                    borderRadius: "8px",
                                    background: "#ffffff",
                                    color: "#1f2937",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    transition:
                                        "all 0.2s ease"
                                }}
                            >
                                View ID Card
                            </button>

                        </div>

                    )}

                </div>


                {/* =================================================
                    EMPLOYEE DETAILS
                ================================================= */}

                <div className="profile-section">

                    <div className="profile-section-header">

                        <h3>
                            Employee Details
                        </h3>


                        {!isEditingDetails ? (

                            <button
                                type="button"
                                className="profile-edit-btn"
                                onClick={handleEdit}
                                title="Edit Employee Details"
                                aria-label="Edit Employee Details"
                            >
                                <FiEdit2 size={16} />
                            </button>

                        ) : (

                            <button
                                type="button"
                                className="profile-cancel-btn"
                                onClick={
                                    handleCancelEdit
                                }
                                disabled={
                                    savingDetails
                                }
                            >
                                Cancel
                            </button>

                        )}

                    </div>


                    <div className="profile-details-grid">


                        {/* Employee ID */}

                        <div className="profile-field">

                            <span>
                                Employee ID
                            </span>

                            <strong>
                                {profile.empId || "-"}
                            </strong>

                        </div>


                        {/* Name */}

                        <div className="profile-field">

                            <span>
                                Name
                            </span>


                            {isEditingDetails ? (

                                <div className="profile-name-inputs">

                                    <input
                                        type="text"
                                        value={
                                            editedFirstName
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setEditedFirstName(
                                                event.target.value
                                            )
                                        }
                                        placeholder="First Name"
                                        required
                                    />


                                    <input
                                        type="text"
                                        value={
                                            editedLastName
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setEditedLastName(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Last Name"
                                        required
                                    />

                                </div>

                            ) : (

                                <strong>
                                    {fullName || "-"}
                                </strong>

                            )}

                        </div>


                        {/* Email */}

                        <div className="profile-field">

                            <span>
                                Email
                            </span>

                            <strong>
                                {profile.email || "-"}
                            </strong>

                        </div>


                        {/* Mobile */}

                        <div className="profile-field">

                            <span>
                                Mobile
                            </span>


                            {isEditingDetails ? (

                                <input
                                    type="text"
                                    value={
                                        editedMobile
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setEditedMobile(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Mobile Number"
                                    maxLength="10"
                                    required
                                />

                            ) : (

                                <strong>
                                    {profile.mobile || "-"}
                                </strong>

                            )}

                        </div>


                        {/* Role */}

                        <div className="profile-field">

                            <span>
                                Role
                            </span>

                            <strong>
                                {profile.role || "-"}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    SAVE CHANGES
                ================================================= */}

                {role === "EMPLOYEE" && (

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            marginTop: "20px",
                            marginBottom: "20px"
                        }}
                    >

                        <button
                            type="button"
                            className="profile-save-btn"
                            onClick={
                                handleSaveChanges
                            }
                            disabled={
                                savingDetails ||
                                updatingProfilePhoto
                            }
                        >

                            {savingDetails ||
                            updatingProfilePhoto
                                ? "Saving..."
                                : "Save Changes"}

                        </button>

                    </div>

                )}


                {/* =================================================
                    UPLOADED DOCUMENTS
                ================================================= */}

                {role === "EMPLOYEE" && (

                    <div className="profile-section uploaded-documents-section">

                        <h3>
                            Uploaded Documents
                        </h3>


                        {documents.length > 0 ? (

                            <div className="uploaded-documents-list">

                                {documents.map(
                                    (document) => (

                                        <div
                                            className="uploaded-document-wrapper"
                                            key={
                                                document.type
                                            }
                                        >

                                            <div className="uploaded-document-card">

                                                <div className="document-icon">
                                                    📄
                                                </div>


                                                <div className="uploaded-document-info">

                                                    <span>
                                                        Uploaded Document
                                                    </span>

                                                    <strong>
                                                        {
                                                            getDocumentName(
                                                                document.type
                                                            )
                                                        }
                                                    </strong>

                                                </div>

                                            </div>


                                            {/* DIRECT DOCUMENT VIEW */}

                                            <div
                                                className="document-inline-viewer"
                                                style={{
                                                    marginTop:
                                                        "15px"
                                                }}
                                            >

                                                <div className="document-inline-content">

                                                    <PdfViewer
                                                        url={
                                                            document.url
                                                        }
                                                    />

                                                </div>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        ) : !loadingDocuments ? (

                            <p>
                                No documents uploaded.
                            </p>

                        ) : null}

                    </div>

                )}


                {/* =================================================
                    DOCUMENT LOADING
                ================================================= */}

                {loadingDocuments && (

                    <div className="profile-section">

                        <Loader />

                    </div>

                )}

            </div>


            {/* =================================================
                PROFILE PHOTO OVERLAY
            ================================================= */}

            {profilePhotoViewer}

        </>

    );

}


export default Profile;