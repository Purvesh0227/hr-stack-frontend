import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Loader from "../Loader";
import { getEmployeeDocumentViewUrl, updateEmployeeProfilePhoto, getAdminProfile } from "../../services/api";
import PdfViewer from "../../components/common/PdfViewer";
import EmployeeIdCard from "../../components/common/EmployeeIdCard";
import { FiEdit2, FiEye } from "react-icons/fi";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { formatDate } from "../../utils/dateUtils";


function Profile({ role, employee, adminProfile, loadingProfile, handleSaveOwnProfile, refreshAdminProfile }) {
    const profile = role === "ADMIN" ? adminProfile : employee;

    const [documents, setDocuments] = useState([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);

    const [showProfilePhoto, setShowProfilePhoto] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [previewPhotoUrl, setPreviewPhotoUrl] = useState(null);
    const [updatingProfilePhoto, setUpdatingProfilePhoto] = useState(false);
    const profilePhotoInputRef = useRef(null);

    const [savedProfilePhotoUrl, setSavedProfilePhotoUrl] = useState(profile?.profilePhotoUrl || null);
    const previousProfileIdRef = useRef(profile?.id);

    const [showIdCard, setShowIdCard] = useState(false);
    const idCardRef = useRef(null);
    const [downloadingIdCard, setDownloadingIdCard] = useState(false);

    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [editedFirstName, setEditedFirstName] = useState("");
    const [editedLastName, setEditedLastName] = useState("");
    const [editedMobile, setEditedMobile] = useState("");
    const [savingDetails, setSavingDetails] = useState(false);

    useEffect(() => {
        if (!profile?.id) return;
        const loadDocuments = async () => {
            setLoadingDocuments(true);
            try {
                const documentTypes = ["ID_PROOF", "ADDRESS_PROOF"];
                const loadedDocuments = [];
                for (const documentType of documentTypes) {
                    try {
                        const response = await getEmployeeDocumentViewUrl(profile.id, documentType);
                        if (response.data) loadedDocuments.push({ type: documentType, url: response.data });
                    } catch (error) {}
                }
                setDocuments(loadedDocuments);
            } catch (error) {
                console.error("Unable to load employee documents:", error);
            } finally {
                setLoadingDocuments(false);
            }
        };
        loadDocuments();
    }, [role, profile?.id]);

    useEffect(() => {
        if (!profile?.id) return;
        if (previousProfileIdRef.current !== profile.id) {
            previousProfileIdRef.current = profile.id;
            setSavedProfilePhotoUrl(profile.profilePhotoUrl || null);
            return;
        }
        if (profile.profilePhotoUrl) setSavedProfilePhotoUrl(profile.profilePhotoUrl);
    }, [profile?.id, profile?.profilePhotoUrl]);

    useEffect(() => {
        return () => { if (previewPhotoUrl) URL.revokeObjectURL(previewPhotoUrl); };
    }, [previewPhotoUrl]);

    if (role === "ADMIN" && loadingProfile) {
        return (
            <div className="content-card">
                <h2>My Profile</h2>
                <Loader />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="content-card">
                <h2>My Profile</h2>
                <p>Profile information not available.</p>
            </div>
        );
    }

    const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();

    const handleEdit = () => {
        if (!profile) return;
        setEditedFirstName(profile.firstName || "");
        setEditedLastName(profile.lastName || "");
        setEditedMobile(profile.mobile || "");
        setIsEditingDetails(true);
    };

    const handleCancelEdit = () => {
        setIsEditingDetails(false);
        setEditedFirstName("");
        setEditedLastName("");
        setEditedMobile("");
    };

    const handleProfilePhotoSelect = () => {
        if (updatingProfilePhoto || savingDetails || !profilePhotoInputRef.current) return;
        profilePhotoInputRef.current.click();
    };

    const handleProfilePhotoChange = (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            window.alert("Only JPG, JPEG and PNG images are allowed.");
            return;
        }

        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            window.alert("Profile photo must not exceed 2 MB.");
            return;
        }

        if (previewPhotoUrl) URL.revokeObjectURL(previewPhotoUrl);
        const previewUrl = URL.createObjectURL(file);
        setSelectedPhoto(file);
        setPreviewPhotoUrl(previewUrl);
    };

    const handleSaveChanges = async () => {
        if (!profile) return;

        const firstName = editedFirstName.trim();
        const lastName = editedLastName.trim();
        const mobile = editedMobile.trim();

        if (isEditingDetails && (!firstName || !lastName || !mobile)) {
            window.alert("First name, last name and mobile number are required.");
            return;
        }

        const finalFirstName = isEditingDetails ? firstName : profile.firstName;
        const finalLastName = isEditingDetails ? lastName : profile.lastName;
        const finalMobile = isEditingDetails ? mobile : profile.mobile;

        setSavingDetails(true);

        try {
            if (isEditingDetails) {
                await handleSaveOwnProfile({ firstName: finalFirstName, lastName: finalLastName, mobile: finalMobile });
            }

            if (selectedPhoto) {
                setUpdatingProfilePhoto(true);
                await updateEmployeeProfilePhoto(profile.id, selectedPhoto);

                if (role === "ADMIN") {
                    let latestPhotoUrl = null;

                    if (typeof refreshAdminProfile === "function") {
                        try {
                            const refreshedProfile = await refreshAdminProfile();
                            if (refreshedProfile?.profilePhotoUrl) {
                                latestPhotoUrl = refreshedProfile.profilePhotoUrl;
                            } else if (refreshedProfile?.data?.profilePhotoUrl) {
                                latestPhotoUrl = refreshedProfile.data.profilePhotoUrl;
                            }
                        } catch (refreshError) {
                            console.error("Unable to refresh Admin profile:", refreshError);
                        }
                    }

                    if (!latestPhotoUrl && profile.email) {
                        try {
                            const response = await getAdminProfile(profile.email);
                            latestPhotoUrl = response.data?.profilePhotoUrl || null;
                        } catch (fetchError) {
                            console.error("Unable to fetch updated Admin profile:", fetchError);
                        }
                    }

                    if (latestPhotoUrl) {
                        setSavedProfilePhotoUrl(latestPhotoUrl);
                    } else if (previewPhotoUrl) {
                        setSavedProfilePhotoUrl(previewPhotoUrl);
                    }
                } else {
                    if (previewPhotoUrl) setSavedProfilePhotoUrl(previewPhotoUrl);
                }
            }

            setSelectedPhoto(null);
            setPreviewPhotoUrl(null);

            setIsEditingDetails(false);
            setEditedFirstName("");
            setEditedLastName("");
            setEditedMobile("");

            window.alert("Profile changes saved successfully.");
        } catch (error) {
            console.error("Profile save error:", error);
            window.alert(error.response?.data?.error || error.response?.data?.message || "Unable to save profile changes.");
        } finally {
            setSavingDetails(false);
            setUpdatingProfilePhoto(false);
        }
    };

    const handleDownloadIdCard = async () => {
        if (!idCardRef.current || downloadingIdCard) return;

        const frontElement = idCardRef.current.getFrontElement();
        const backElement = idCardRef.current.getBackElement();

        if (!frontElement || !backElement) {
            window.alert("Unable to generate ID card.");
            return;
        }
        setDownloadingIdCard(true);
        try {
            const captureOptions = {
                scale: 3,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
            };

            const frontCanvas = await html2canvas(
                frontElement,
                captureOptions
            );

            const backCanvas = await html2canvas(
                backElement,
                captureOptions
            );

            const frontImage = frontCanvas.toDataURL("image/png");
            const backImage = backCanvas.toDataURL("image/png");

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const cardWidth = 85;
            const cardHeight = 130;

            const x = (pageWidth - cardWidth) / 2;
            const y = (pageHeight - cardHeight) / 2;

            // FRONT SIDE
            pdf.addImage(
                frontImage,
                "PNG",
                x,
                y,
                cardWidth,
                cardHeight
            );

            // BACK SIDE
            pdf.addPage();

            pdf.addImage(
                backImage,
                "PNG",
                x,
                y,
                cardWidth,
                cardHeight
            );

            const employeeId = employee.empId || employee.id || "EMPLOYEE";

            pdf.save(`HR-STACK-ID-CARD-${employeeId}.pdf`);

        } catch (error) {
            console.error("ID card download error:", error);
            window.alert("Unable to download ID card.");
        } finally {
            setDownloadingIdCard(false);
        }
    };

    const getDocumentName = (type) => {
        if (type === "ID_PROOF") return "Identity Proof";
        if (type === "ADDRESS_PROOF") return "Address Proof";
        return "Document";
    };



    const profilePhotoViewer = showProfilePhoto && (previewPhotoUrl || savedProfilePhotoUrl)
        ? createPortal(
            <div className="profile-photo-overlay" onClick={() => setShowProfilePhoto(false)}>
                <div className="profile-photo-modal" onClick={(event) => event.stopPropagation()}>
                    <button type="button" className="profile-photo-close" onClick={() => setShowProfilePhoto(false)} title="Close" aria-label="Close">✕</button>
                    <img src={previewPhotoUrl || savedProfilePhotoUrl} alt="Profile" className="profile-photo-large" />
                    <button type="button" className="profile-photo-replace-btn" onClick={handleProfilePhotoSelect} disabled={updatingProfilePhoto || savingDetails} title="Replace Photo" aria-label="Replace Photo">
                        {savingDetails ? "..." : <FiEdit2 size={20} />}
                    </button>
                </div>
            </div>,
            document.body
        )
        : null;

    return (
        <>
            <div className="content-card profile-page">
                <h2>My Profile</h2>

                {showIdCard && (
                    <div
                        style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.55)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, overflowY: "auto", padding: "30px" }}
                        onClick={() => setShowIdCard(false)}
                    >
                        <div onClick={(event) => event.stopPropagation()} style={{ position: "relative" }}>
                            <button
                                type="button"
                                onClick={() => setShowIdCard(false)}
                                style={{ position: "absolute", top: "-5px", right: "-5px", width: "36px", height: "36px", borderRadius: "50%", border: "none", background: "#ffffff", color: "#333333", fontSize: "22px", fontWeight: "600", cursor: "pointer", boxShadow: "0 3px 10px rgba(0,0,0,0.25)", zIndex: 10 }}
                                title="Close"
                                aria-label="Close ID Card"
                            >×</button>
                            <EmployeeIdCard
                                ref={idCardRef}
                                employee={profile}
                            />
                            <button
                                type="button"
                                onClick={handleDownloadIdCard}
                                disabled={downloadingIdCard}
                                style={{
                                    display: "block",
                                    margin: "10px auto 20px",
                                    padding: "11px 22px",
                                    border: "none",
                                    borderRadius: "8px",
                                    background: "#1f2937",
                                    color: "#ffffff",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    cursor: downloadingIdCard ? "not-allowed" : "pointer",
                                    opacity: downloadingIdCard ? 0.7 : 1,
                                    transition: "all 0.2s ease",
                                }}
                            >
                                {downloadingIdCard ? "Generating PDF..." : "Download ID Card"}
                            </button>
                        </div>
                    </div>
                )}

                <div className="profile-header">
                    <div className="profile-photo-container">
                        <div className="profile-photo-wrapper">
                            {previewPhotoUrl ? (
                                <div
                                    className="profile-photo-clickable"
                                    onClick={() => setShowProfilePhoto(true)}
                                    title="View Photo"
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setShowProfilePhoto(true); } }}
                                >
                                    <img src={previewPhotoUrl} alt="Selected Profile" className="profile-photo" />
                                </div>
                            ) : savedProfilePhotoUrl ? (
                                <div
                                    className="profile-photo-clickable"
                                    onClick={() => setShowProfilePhoto(true)}
                                    title="View Photo"
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setShowProfilePhoto(true); } }}
                                >
                                    <img src={savedProfilePhotoUrl} alt="Profile" className="profile-photo" />
                                </div>
                            ) : (
                                <div
                                    className="profile-photo-placeholder profile-photo-upload-clickable"
                                    onClick={handleProfilePhotoSelect}
                                    title="Upload Profile Photo"
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); handleProfilePhotoSelect(); } }}
                                >
                                    {fullName.charAt(0).toUpperCase() || "U"}
                                </div>
                            )}

                            {(savedProfilePhotoUrl || previewPhotoUrl) && (
                                <button
                                    type="button"
                                    className="profile-photo-view-btn"
                                    onClick={(event) => { event.stopPropagation(); setShowProfilePhoto(true); }}
                                    title="View Photo"
                                    aria-label="View Photo"
                                ><FiEye size={16} /></button>
                            )}

                            <input ref={profilePhotoInputRef} type="file" accept="image/jpeg,image/png" onChange={handleProfilePhotoChange} hidden />
                        </div>
                    </div>

                    <div className="profile-header-info">
                        <h3>{fullName || "Employee"}</h3>
                        <p>{profile.role || "Employee"}</p>
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={() => setShowIdCard(true)}
                            style={{ padding: "10px 18px", border: "1px solid #1f2937", borderRadius: "8px", background: "#ffffff", color: "#1f2937", fontSize: "14px", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s ease" }}
                        >View ID Card</button>
                    </div>
                </div>

                <div className="profile-section">
                    <div className="profile-section-header">
                        <h3>Employee Details</h3>
                        {!isEditingDetails ? (
                            <button type="button" className="profile-edit-btn" onClick={handleEdit} title="Edit Employee Details" aria-label="Edit Employee Details">
                                <FiEdit2 size={16} />
                            </button>
                        ) : (
                            <button type="button" className="profile-cancel-btn" onClick={handleCancelEdit} disabled={savingDetails}>Cancel</button>
                        )}
                    </div>

                    <div className="profile-details-grid">
                        <div className="profile-field">
                            <span>Employee ID</span>
                            <strong>{profile.empId || "-"}</strong>
                        </div>

                        <div className="profile-field">
                            <span>Name</span>
                            {isEditingDetails ? (
                                <div className="profile-name-inputs">
                                    <input type="text" value={editedFirstName} onChange={(event) => setEditedFirstName(event.target.value)} placeholder="First Name" required />
                                    <input type="text" value={editedLastName} onChange={(event) => setEditedLastName(event.target.value)} placeholder="Last Name" required />
                                </div>
                            ) : (
                                <strong>{fullName || "-"}</strong>
                            )}
                        </div>

                        <div className="profile-field">
                            <span>Email</span>
                            <strong>{profile.email || "-"}</strong>
                        </div>

                        <div className="profile-field">
                            <span>Mobile</span>
                            {isEditingDetails ? (
                                <input type="text" value={editedMobile} onChange={(event) => setEditedMobile(event.target.value)} placeholder="Mobile Number" maxLength="10" required />
                            ) : (
                                <strong>{profile.mobile || "-"}</strong>
                            )}
                        </div>

                        <div className="profile-field">
                            <span>Role</span>
                            <strong>{profile.role || "-"}</strong>
                        </div>

                        <div className="profile-field">
                            <span>Joining Date</span>
                            <strong>{formatDate(profile.createdOn) || "-"}</strong>
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", marginBottom: "20px" }}>
                    <button type="button" className="profile-save-btn" onClick={handleSaveChanges} disabled={savingDetails || updatingProfilePhoto}>
                        {savingDetails || updatingProfilePhoto ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                <div className="profile-section uploaded-documents-section">
                    <h3>Uploaded Documents</h3>

                    {documents.length > 0 ? (
                        <div className="uploaded-documents-list">
                            {documents.map((document) => (
                                <div className="uploaded-document-wrapper" key={document.type}>
                                    <div className="uploaded-document-card">
                                        <div className="document-icon">📄</div>
                                        <div className="uploaded-document-info">
                                            <span>Uploaded Document</span>
                                            <strong>{getDocumentName(document.type)}</strong>
                                        </div>
                                    </div>

                                    <div className="document-inline-viewer" style={{ marginTop: "15px" }}>
                                        <div className="document-inline-content">
                                            <PdfViewer url={document.url} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : !loadingDocuments ? (
                        <p>No documents uploaded.</p>
                    ) : null}
                </div>

                {loadingDocuments && (
                    <div className="profile-section">
                        <Loader />
                    </div>
                )}
            </div>

            {profilePhotoViewer}
        </>
    );
}

export default Profile;