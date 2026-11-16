import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// 1. Use the reliable CDN for the PDF Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfViewer = ({ url }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0); // Reset to 1.0 for better fit
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        setPageNumber(1);
        setNumPages(null);
        setLoading(true);
        setError(false);
    }, [url]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setLoading(false);
    };

    const onDocumentLoadError = (error) => {
        console.error("PDF loading error:", error);
        setLoading(false);
        setError(true);
    };

    const previousPage = () => setPageNumber((curr) => Math.max(curr - 1, 1));
    const nextPage = () => setPageNumber((curr) => Math.min(curr + 1, numPages || curr));
    const zoomIn = () => setScale((curr) => Math.min(curr + 0.2, 2.5));
    const zoomOut = () => setScale((curr) => Math.max(curr - 0.2, 0.6));
    const resetZoom = () => setScale(1.0);

    if (!url) return <div className="pdf-viewer-empty">No document available.</div>;

    return (
        <div className="pdf-viewer" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            
            {/* Toolbar */}
            <div className="pdf-viewer-toolbar" style={{ flexShrink: 0 }}>
                <div className="pdf-page-controls">
                    <button type="button" onClick={previousPage} disabled={pageNumber <= 1}>‹</button>
                    <span>Page {pageNumber} {numPages ? `/ ${numPages}` : ""}</span>
                    <button type="button" onClick={nextPage} disabled={!numPages || pageNumber >= numPages}>›</button>
                </div>

                <div className="pdf-zoom-controls">
                    <button type="button" onClick={zoomOut} disabled={scale <= 0.6}>−</button>
                    <button type="button" onClick={resetZoom}>{Math.round(scale * 100)}%</button>
                    <button type="button" onClick={zoomIn} disabled={scale >= 2.5}>+</button>
                </div>
            </div>

            {/* PDF Content */}
            <div className="pdf-viewer-content" style={{ flex: 1, overflow: "auto", background: "#525659", padding: "20px" }}>
                {loading && <div className="pdf-viewer-status">Loading document...</div>}
                {error && <div className="pdf-viewer-status">Unable to display this document.</div>}

                {!error && (
                    <Document
                        file={url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading="" // Disable default document loader (we use our own)
                        options={{ cMapUrl: 'https://unpkg.com/pdfjs-dist/cmaps/', cMapPacked: true }}
                    >
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                                loading="" // Disable default page loader
                                className="shadow-md" // Optional: adds a nice shadow to the page
                            />
                        </div>
                    </Document>
                )}
            </div>
        </div>
    );
};

export default PdfViewer;