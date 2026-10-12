import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import EmployeeIdCard from "./EmployeeIdCard";

function IdCardModal({ profile, onClose }) {
    const idCardRef = useRef(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === "Escape") onClose();
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [onClose]);

    const handleDownload = async () => {
        if (!idCardRef.current || downloading) return;

        const frontElement = idCardRef.current.getFrontElement();
        const backElement = idCardRef.current.getBackElement();

        if (!frontElement || !backElement) {
            window.alert("Unable to generate ID card.");
            return;
        }

        setDownloading(true);

        try {
            // loaded only when the user clicks Download
            const [{ default: html2canvas }, { default: jsPDF }] =
                await Promise.all([import("html2canvas"), import("jspdf")]);

            const options = {
                scale: 3,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false
            };

            const frontCanvas = await html2canvas(frontElement, options);
            const backCanvas = await html2canvas(backElement, options);

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const cardWidth = 85;
            const cardHeight = 130;
            const x = (pageWidth - cardWidth) / 2;
            const y = (pageHeight - cardHeight) / 2;

            pdf.addImage(
                frontCanvas.toDataURL("image/png"),
                "PNG", x, y, cardWidth, cardHeight
            );
            pdf.addPage();
            pdf.addImage(
                backCanvas.toDataURL("image/png"),
                "PNG", x, y, cardWidth, cardHeight
            );

            const employeeId = profile.empId || profile.id || "EMPLOYEE";
            pdf.save(`HR-STACK-ID-CARD-${employeeId}.pdf`);
        } catch (error) {
            console.error("ID card download error:", error);
            window.alert("Unable to download ID card.");
        } finally {
            setDownloading(false);
        }
    };

    // Portal: renders on <body>, so it is never trapped under the navbar
    return createPortal(
        <div className="id-card-overlay" onClick={onClose}>
            <div
                className="id-card-panel"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    className="id-card-close-btn"
                    onClick={onClose}
                    title="Close"
                    aria-label="Close ID Card"
                >
                    ×
                </button>

                <EmployeeIdCard ref={idCardRef} employee={profile} />

                <button
                    type="button"
                    className="id-card-download-btn"
                    onClick={handleDownload}
                    disabled={downloading}
                >
                    {downloading ? "Generating PDF..." : "Download ID Card"}
                </button>
            </div>
        </div>,
        document.body
    );
}

export default IdCardModal;