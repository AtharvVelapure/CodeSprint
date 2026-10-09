import { useEffect, useState } from "react";
import "./AssessmentHostVerification.css";

function AssessmentHostVerification() {

    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState("PENDING");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedRequest, setSelectedRequest] = useState(null);

    const [remarks, setRemarks] = useState("");
    const [processingId, setProcessingId] = useState(null);

    const [documentUrl, setDocumentUrl] = useState("");
    const [documentLoading, setDocumentLoading] = useState(false);

    // =====================================================
    // LOAD REQUESTS
    // =====================================================

    const loadRequests = async () => {

        try {

            setLoading(true);
            setError("");

            const endpoint =
                filter === "PENDING"
                    ? "/api/assessment-host/admin/pending"
                    : "/api/assessment-host/admin/all";

            const response = await fetch(endpoint);

            if (!response.ok) {
                throw new Error(
                    "Failed to load verification requests"
                );
            }

            const data = await response.json();

            setRequests(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            setError(
                err.message ||
                "Unable to load verification requests"
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, [filter]);


    // =====================================================
    // APPROVE
    // =====================================================

    const handleApprove = async (request) => {

        const confirmed =
            window.confirm(
                `Approve ${request.userName}'s assessment host verification?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setProcessingId(request.id);
            setError("");

            const query =
                remarks.trim()
                    ? `?adminRemarks=${encodeURIComponent(
                        remarks.trim()
                    )}`
                    : "";

            const response = await fetch(
                `/api/assessment-host/admin/${request.id}/approve${query}`,
                {
                    method: "PUT"
                }
            );

            const responseText =
                await response.text();

            if (!response.ok) {
                throw new Error(
                    responseText ||
                    "Failed to approve request"
                );
            }

            setRemarks("");
            setSelectedRequest(null);

            await loadRequests();

        } catch (err) {

            setError(
                err.message ||
                "Failed to approve request"
            );

        } finally {

            setProcessingId(null);
        }
    };


    // =====================================================
    // REJECT
    // =====================================================

    const handleReject = async (request) => {

        if (!remarks.trim()) {

            setError(
                "Please enter remarks before rejecting the request."
            );

            return;
        }

        const confirmed =
            window.confirm(
                `Reject ${request.userName}'s assessment host verification?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setProcessingId(request.id);
            setError("");

            const response = await fetch(
                `/api/assessment-host/admin/${request.id}/reject?adminRemarks=${encodeURIComponent(
                    remarks.trim()
                )}`,
                {
                    method: "PUT"
                }
            );

            const responseText =
                await response.text();

            if (!response.ok) {
                throw new Error(
                    responseText ||
                    "Failed to reject request"
                );
            }

            setRemarks("");
            setSelectedRequest(null);

            await loadRequests();

        } catch (err) {

            setError(
                err.message ||
                "Failed to reject request"
            );

        } finally {

            setProcessingId(null);
        }
    };


    // =====================================================
    // VIEW DOCUMENT
    // =====================================================

    const handleViewDocument = async (request) => {

        try {

            setDocumentLoading(true);
            setError("");

            const response = await fetch(
                `/api/assessment-host/admin/${request.id}/document`
            );

            if (!response.ok) {

                const message =
                    await response.text();

                throw new Error(
                    message ||
                    "Unable to open document"
                );
            }

            const blob =
                await response.blob();

            const url =
                URL.createObjectURL(blob);

            setDocumentUrl(url);

            setSelectedRequest(request);

        } catch (err) {

            setError(
                err.message ||
                "Unable to open document"
            );

        } finally {

            setDocumentLoading(false);
        }
    };


    // =====================================================
    // CLOSE DOCUMENT
    // =====================================================

    const closeDocument = () => {

        if (documentUrl) {
            URL.revokeObjectURL(documentUrl);
        }

        setDocumentUrl("");
    };


    // =====================================================
    // CLEANUP OBJECT URL
    // =====================================================

    useEffect(() => {

        return () => {

            if (documentUrl) {
                URL.revokeObjectURL(documentUrl);
            }

        };

    }, [documentUrl]);


    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (status) => {

        switch (status) {

            case "APPROVED":
                return "verification-status approved";

            case "REJECTED":
                return "verification-status rejected";

            default:
                return "verification-status pending";
        }
    };


    // =====================================================
    // DATE FORMAT
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString();
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="assessment-verification-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="verification-header">

                <div>

                    <h1>
                        Assessment Host Verification
                    </h1>

                    <p>
                        Review users who requested permission
                        to host coding assessments.
                    </p>

                </div>

                <button
                    className="verification-refresh-button"
                    onClick={loadRequests}
                    disabled={loading}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="verification-filters">

                <button
                    className={
                        filter === "PENDING"
                            ? "verification-filter active"
                            : "verification-filter"
                    }
                    onClick={() => setFilter("PENDING")}
                >
                    Pending
                </button>

                <button
                    className={
                        filter === "ALL"
                            ? "verification-filter active"
                            : "verification-filter"
                    }
                    onClick={() => setFilter("ALL")}
                >
                    All Requests
                </button>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="verification-error">
                    {error}
                </div>

            )}


            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

                <div className="verification-empty">
                    Loading verification requests...
                </div>

            ) : requests.length === 0 ? (

                <div className="verification-empty">

                    <div className="verification-empty-icon">
                        ✓
                    </div>

                    <h3>
                        No verification requests
                    </h3>

                    <p>
                        There are currently no requests
                        in this section.
                    </p>

                </div>

            ) : (

                /* =================================================
                    REQUEST TABLE
                ================================================= */

                <div className="verification-table-wrapper">

                    <table className="verification-table">

                        <thead>

                            <tr>

                                <th>
                                    User
                                </th>

                                <th>
                                    Business
                                </th>

                                <th>
                                    Business Email
                                </th>

                                <th>
                                    Requested
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Document
                                </th>

                                <th>
                                    Action
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {requests.map((request) => (

                                <tr key={request.id}>

                                    <td>

                                        <div className="verification-user">

                                            <strong>
                                                {request.userName || "-"}
                                            </strong>

                                            <span>
                                                {request.userEmail || "-"}
                                            </span>

                                        </div>

                                    </td>


                                    <td>

                                        <strong>
                                            {request.businessName || "-"}
                                        </strong>

                                    </td>


                                    <td>

                                        {request.businessEmail || "-"}

                                    </td>


                                    <td>

                                        {formatDate(
                                            request.requestedAt
                                        )}

                                    </td>


                                    <td>

                                        <span
                                            className={getStatusClass(
                                                request.status
                                            )}
                                        >
                                            {request.status}
                                        </span>

                                    </td>


                                    <td>

                                        <button
                                            className="document-button"
                                            onClick={() =>
                                                handleViewDocument(
                                                    request
                                                )
                                            }
                                            disabled={
                                                documentLoading
                                            }
                                        >
                                            {documentLoading &&
                                            selectedRequest?.id === request.id
                                                ? "Opening..."
                                                : "View Document"}
                                        </button>

                                    </td>


                                    <td>

                                        {request.status ===
                                        "PENDING" ? (

                                            <div className="verification-actions">

                                                <button
                                                    className="approve-button"
                                                    onClick={() =>
                                                        handleApprove(
                                                            request
                                                        )
                                                    }
                                                    disabled={
                                                        processingId ===
                                                        request.id
                                                    }
                                                >
                                                    {processingId ===
                                                    request.id
                                                        ? "Processing..."
                                                        : "Approve"}
                                                </button>

                                                <button
                                                    className="reject-button"
                                                    onClick={() =>
                                                        setSelectedRequest(
                                                            request
                                                        )
                                                    }
                                                    disabled={
                                                        processingId ===
                                                        request.id
                                                    }
                                                >
                                                    Reject
                                                </button>

                                            </div>

                                        ) : (

                                            <span className="reviewed-text">
                                                Reviewed
                                            </span>

                                        )}

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}


            {/* =================================================
                REJECTION / REMARK MODAL
            ================================================= */}

            {selectedRequest &&
            !documentUrl &&
            selectedRequest.status === "PENDING" && (

                <div
                    className="verification-modal-overlay"
                    onClick={() =>
                        setSelectedRequest(null)
                    }
                >

                    <div
                        className="verification-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="verification-modal-header">

                            <div>

                                <h2>
                                    Review Request
                                </h2>

                                <p>
                                    {selectedRequest.userName}
                                </p>

                            </div>

                            <button
                                className="modal-close-button"
                                onClick={() =>
                                    setSelectedRequest(null)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="verification-modal-body">

                            <div className="review-info">

                                <div>
                                    <span>
                                        Business
                                    </span>

                                    <strong>
                                        {selectedRequest.businessName}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Business Email
                                    </span>

                                    <strong>
                                        {selectedRequest.businessEmail}
                                    </strong>
                                </div>

                            </div>


                            <label>
                                Admin Remarks
                            </label>

                            <textarea
                                value={remarks}
                                onChange={(event) =>
                                    setRemarks(
                                        event.target.value
                                    )
                                }
                                placeholder={
                                    "Enter rejection reason or additional remarks..."
                                }
                                rows={5}
                            />


                            <div className="verification-modal-actions">

                                <button
                                    className="cancel-button"
                                    onClick={() =>
                                        setSelectedRequest(
                                            null
                                        )
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    className="reject-button large"
                                    onClick={() =>
                                        handleReject(
                                            selectedRequest
                                        )
                                    }
                                    disabled={
                                        processingId ===
                                        selectedRequest.id
                                    }
                                >
                                    {processingId ===
                                    selectedRequest.id
                                        ? "Rejecting..."
                                        : "Reject Request"}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                DOCUMENT MODAL
            ================================================= */}

            {documentUrl && selectedRequest && (

                <div
                    className="verification-modal-overlay"
                    onClick={closeDocument}
                >

                    <div
                        className="document-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="verification-modal-header">

                            <div>

                                <h2>
                                    Verification Document
                                </h2>

                                <p>
                                    {selectedRequest.businessName}
                                </p>

                            </div>

                            <button
                                className="modal-close-button"
                                onClick={closeDocument}
                            >
                                ×
                            </button>

                        </div>

                        <div className="document-preview">

                            {documentUrl && (
                                <iframe
                                    src={documentUrl}
                                    title="Verification Document"
                                />
                            )}

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AssessmentHostVerification;