import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX, FiDownload } from "react-icons/fi";
import PdfViewer from "./PdfViewer";

function AttachmentViewer({ file, url, onClose }) {
    
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    const isVideo = file.contentType.includes("video");
    const isImage = file.contentType.startsWith("image/");
    const isPdf = file.contentType === "application/pdf";
    const isDocx = file.contentType.includes("wordprocessingml");

       const handleDownload = async () => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();

            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = file.fileName; 
            
            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);
            window.open(url, "_blank");
        }
    };
    
        return createPortal(
        <div className="employee-document-viewer-overlay" onClick={onClose}>
            <div 
                className="employee-document-viewer" 
                onClick={(e) => e.stopPropagation()} 
                style={{ width: "90vw", height: "90vh", maxWidth: "1200px", background: "#111" }}
            >
                {/* HEADER WITH DOWNLOAD & CLOSE */}
                <div className="employee-document-viewer-header" style={{ background: "#1f1f23", borderBottom: "none", display: "flex", justifyContent: "space-between", padding: "12px 20px" }}>
                    <h3 style={{ color: "white", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: "20px" }}>
                        {file.fileName}
                    </h3>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <button
                            type="button"
                            onClick={handleDownload}
                            style={{
                                display: "flex", alignItems: "center", gap: "6px",
                                padding: "6px 12px", borderRadius: "6px",
                                background: "rgba(255,255,255,0.1)", color: "white",
                                border: "1px solid rgba(255,255,255,0.2)", fontSize: "13px",
                                fontWeight: "600", cursor: "pointer"
                            }}
                        >
                            <FiDownload size={14} /> Download
                        </button>

                        <button
                            type="button"
                            className="employee-document-viewer-close"
                            onClick={onClose}
                            aria-label="Close viewer"
                            style={{ color: "white", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
                        >
                            <FiX size={24} />
                        </button>
                    </div>
                </div>
                
                {/* CONTENT */}
                <div className="employee-document-viewer-content" style={{ padding: isVideo || isImage ? "0" : "20px", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", flex: 1, overflow: "hidden" }}>
                    
                    {isVideo && (
                        <video 
                            src={url} 
                            controls 
                            autoPlay 
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                    )}

                    {isImage && (
                        <img 
                            src={url} 
                            alt={file.fileName}
                            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                        />
                    )}

                    {isPdf && (
                        <div style={{ width: "100%", height: "100%", background: "#f1f5f9", borderRadius: "8px", overflow: "auto" }}>
                            <PdfViewer url={url} />
                        </div>
                    )}

                    {/* DOCX or Unsupported */}
                    {!isVideo && !isImage && !isPdf && (
                        <div style={{ textAlign: "center", padding: "40px" }}>
                            <div style={{ fontSize: "48px", marginBottom: "20px" }}>📄</div>
                            <h2 style={{ color: "white", marginBottom: "10px" }}>Preview not available</h2>
                            <p style={{ color: "#94a3b8", marginBottom: "30px", maxWidth: "400px" }}>
                                Browsers cannot natively preview {isDocx ? "Microsoft Word" : "this type of"} document. Please download the file to view it.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

export default AttachmentViewer;