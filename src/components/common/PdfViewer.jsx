import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

const PdfViewer = ({ url }) => {

    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.1);
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

    const previousPage = () => {
        setPageNumber((current) =>
            Math.max(current - 1, 1)
        );
    };

    const nextPage = () => {
        setPageNumber((current) =>
            Math.min(
                current + 1,
                numPages || current
            )
        );
    };

    const zoomIn = () => {
        setScale((current) =>
            Math.min(current + 0.2, 2.5)
        );
    };

    const zoomOut = () => {
        setScale((current) =>
            Math.max(current - 0.2, 0.6)
        );
    };

    const resetZoom = () => {
        setScale(1.1);
    };

    if (!url) {
        return (
            <div className="pdf-viewer-empty">
                No document available.
            </div>
        );
    }

    return (
        <div className="pdf-viewer">

            {/* Toolbar */}
            <div className="pdf-viewer-toolbar">

                <div className="pdf-page-controls">

                    <button
                        type="button"
                        onClick={previousPage}
                        disabled={pageNumber <= 1}
                    >
                        ‹
                    </button>

                    <span>
                        Page {pageNumber}
                        {numPages
                            ? ` / ${numPages}`
                            : ""}
                    </span>

                    <button
                        type="button"
                        onClick={nextPage}
                        disabled={
                            !numPages ||
                            pageNumber >= numPages
                        }
                    >
                        ›
                    </button>

                </div>

                <div className="pdf-zoom-controls">

                    <button
                        type="button"
                        onClick={zoomOut}
                        disabled={scale <= 0.6}
                    >
                        −
                    </button>

                    <button
                        type="button"
                        onClick={resetZoom}
                    >
                        {Math.round(scale * 100)}%
                    </button>

                    <button
                        type="button"
                        onClick={zoomIn}
                        disabled={scale >= 2.5}
                    >
                        +
                    </button>

                </div>

            </div>

            {/* PDF */}
            <div className="pdf-viewer-content">

                {loading && (
                    <div className="pdf-viewer-status">
                        Loading document...
                    </div>
                )}

                {error && (
                    <div className="pdf-viewer-status">
                        Unable to display this document.
                    </div>
                )}

                {!error && (
                    <Document
                        file={url}
                        onLoadSuccess={
                            onDocumentLoadSuccess
                        }
                        onLoadError={
                            onDocumentLoadError
                        }
                        loading=""
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                        />
                    </Document>
                )}

            </div>

        </div>
    );
};

export default PdfViewer;