import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import Loader from "../Loader";

import {
    getEmployeeDocumentViewUrl,
    updateEmployeeProfilePhoto
} from "../../services/api";

import PdfViewer from "../../components/common/PdfViewer";


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

    const [updatingProfilePhoto, setUpdatingProfilePhoto] =
        useState(false);

    const profilePhotoInputRef =
        useRef(null);


    // =========================================================
    // DOCUMENT VIEWER
    // =========================================================

    const [selectedDocument, setSelectedDocument] =
        useState(null);


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
    // SAVE DETAILS
    // =========================================================

    const handleSaveDetails = async () => {

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


        if (
            !firstName ||
            !lastName ||
            !mobile
        ) {
            return;
        }


        setSavingDetails(true);


        try {

            await handleSaveOwnProfile({
                firstName,
                lastName,
                mobile
            });


            setIsEditingDetails(false);

            setEditedFirstName("");
            setEditedLastName("");
            setEditedMobile("");

        } catch (error) {

            // Parent handles notification.

        } finally {

            setSavingDetails(false);

        }
    };


    // =========================================================
    // PROFILE PHOTO SELECT
    // =========================================================

    const handleProfilePhotoSelect = () => {

        if (
            updatingProfilePhoto ||
            !profilePhotoInputRef.current
        ) {
            return;
        }


        profilePhotoInputRef.current.click();
    };


    // =========================================================
    // PROFILE PHOTO CHANGE
    // =========================================================

    const handleProfilePhotoChange = async (
        event
    ) => {

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
        // UPDATE PHOTO
        // =====================================================

        if (
            !profile?.id ||
            role !== "EMPLOYEE"
        ) {
            return;
        }


        setUpdatingProfilePhoto(true);


        try {

            await updateEmployeeProfilePhoto(
                profile.id,
                file
            );


            /*
             * The Dashboard already refreshes the employee
             * profile using getEmployeeById().
             *
             * Wait briefly for that refresh cycle so the
             * new signed MinIO URL appears.
             */
            setShowProfilePhoto(false);


            window.alert(
                "Profile photo updated successfully."
            );


        } catch (error) {

            console.error(
                "Profile photo update error:",
                error
            );


            window.alert(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Unable to update profile photo."
            );

        } finally {

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
        profile.profilePhotoUrl
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
                                profile.profilePhotoUrl
                            }
                            alt="Profile"
                            className="profile-photo-large"
                        />


                        {/* Replace Photo */}

                        <button
                            type="button"
                            className="profile-photo-replace-btn"
                            onClick={
                                handleProfilePhotoSelect
                            }
                            disabled={
                                updatingProfilePhoto
                            }
                            title="Replace Photo"
                            aria-label="Replace Photo"
                        >

                            {updatingProfilePhoto
                                ? "..."
                                : "✎"}

                        </button>


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
                    PROFILE HEADER
                ================================================= */}

                <div className="profile-header">


                    {/* Profile Photo */}

                    <div className="profile-photo-container">

                        <div className="profile-photo-wrapper">

                            {profile.profilePhotoUrl ? (

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


                            {profile.profilePhotoUrl && (

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
                                    👁️
                                </button>

                            )}

                        </div>

                    </div>


                    {/* Name / Role */}

                    <div className="profile-header-info">

                        <h3>
                            {fullName ||
                                "Employee"}
                        </h3>

                        <p>
                            {profile.role ||
                                "Employee"}
                        </p>

                    </div>

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
                                onClick={
                                    handleEdit
                                }
                                title="Edit Employee Details"
                                aria-label="Edit Employee Details"
                            >
                                ✏️
                            </button>

                        ) : (

                            <div className="profile-edit-actions">

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


                                <button
                                    type="button"
                                    className="profile-save-btn"
                                    onClick={
                                        handleSaveDetails
                                    }
                                    disabled={
                                        savingDetails
                                    }
                                >

                                    {savingDetails
                                        ? "Saving..."
                                        : "Save Changes"}

                                </button>

                            </div>

                        )}

                    </div>


                    <div className="profile-details-grid">


                        {/* Employee ID */}

                        <div className="profile-field">

                            <span>
                                Employee ID
                            </span>

                            <strong>
                                {profile.empId ||
                                    "-"}
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
                                    {fullName ||
                                        "-"}
                                </strong>

                            )}

                        </div>


                        {/* Email */}

                        <div className="profile-field">

                            <span>
                                Email
                            </span>

                            <strong>
                                {profile.email ||
                                    "-"}
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
                                    {profile.mobile ||
                                        "-"}
                                </strong>

                            )}

                        </div>


                        {/* Role */}

                        <div className="profile-field">

                            <span>
                                Role
                            </span>

                            <strong>
                                {profile.role ||
                                    "-"}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    UPLOADED DOCUMENTS
                ================================================= */}

                {documents.length > 0 && (

                    <div className="profile-section uploaded-documents-section">

                        <h3>
                            Uploaded Documents
                        </h3>


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


                                            <button
                                                type="button"
                                                className="document-view-btn"
                                                onClick={() => {

                                                    if (
                                                        selectedDocument?.type ===
                                                        document.type
                                                    ) {

                                                        setSelectedDocument(
                                                            null
                                                        );

                                                    } else {

                                                        setSelectedDocument(
                                                            document
                                                        );

                                                    }

                                                }}
                                            >

                                                {
                                                    selectedDocument?.type ===
                                                    document.type
                                                        ? "✕ Close"
                                                        : "👁 View"
                                                }

                                            </button>

                                        </div>


                                        {selectedDocument?.type ===
                                            document.type && (

                                            <div className="document-inline-viewer">

                                                <div className="document-inline-header">

                                                    <h3>
                                                        {
                                                            getDocumentName(
                                                                document.type
                                                            )
                                                        }
                                                    </h3>


                                                    <button
                                                        type="button"
                                                        className="document-inline-close"
                                                        onClick={() =>
                                                            setSelectedDocument(
                                                                null
                                                            )
                                                        }
                                                        title="Close"
                                                        aria-label="Close"
                                                    >
                                                        ✕
                                                    </button>

                                                </div>


                                                <div className="document-inline-content">

                                                    <div className="document-inline-content">

                                                        <PdfViewer
                                                            url={document.url}
                                                        />

                                                    </div>

                                                </div>

                                            </div>

                                        )}

                                    </div>

                                )
                            )}

                        </div>

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