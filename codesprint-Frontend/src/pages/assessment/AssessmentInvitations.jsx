import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AssessmentInvitations.css";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const AssessmentInvitations = () => {
    const navigate = useNavigate();
    const { assessmentId } = useParams();

    // =====================================================
    // GET LOGGED-IN USER
    // =====================================================
    const getLoggedInUser = () => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return null;

        try {
            return JSON.parse(storedUser);
        } catch (error) {
            console.error("Failed to parse logged-in user:", error);
            return null;
        }
    };

    const user = getLoggedInUser();
    const userId = user?.id;

    // =====================================================
    // STATE
    // =====================================================
    const [assessment, setAssessment] = useState(null);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [candidateEmail, setCandidateEmail] = useState("");
    const [invitations, setInvitations] = useState([]);

    const [loadingAssessment, setLoadingAssessment] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingInvitations, setLoadingInvitations] = useState(false);

    const [invitingUserId, setInvitingUserId] = useState(null);
    const [sendingExternal, setSendingExternal] = useState(false);
    const [resendingInvitationId, setResendingInvitationId] = useState(null);
    const [copiedInvitationId, setCopiedInvitationId] = useState(null);

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // =====================================================
    // DERIVED ASSESSMENT STATUS
    // =====================================================
    const assessmentStatus = assessment?.status
        ? String(assessment.status).toUpperCase()
        : "";

    const assessmentCanInvite =
        assessmentStatus === "PUBLISHED" ||
        assessmentStatus === "LIVE";

    const assessmentLocked =
        assessmentStatus === "LIVE" ||
        assessmentStatus === "EXPIRED";

    const assessmentExpired =
        assessmentStatus === "EXPIRED";

    // =====================================================
    // LOAD ASSESSMENT
    // =====================================================
    const loadAssessment = async () => {
        if (!userId || !assessmentId) return;

        try {
            setLoadingAssessment(true);
            setErrorMessage("");

            const response = await fetch(
                `${API_BASE_URL}/api/assessment-assignments/${assessmentId}?userId=${userId}`
            );

            const text = await response.text();

            if (!response.ok) {
                throw new Error(
                    text || "Failed to load assessment."
                );
            }

            let data;

            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(
                    "Invalid assessment response from server."
                );
            }

            setAssessment(data);
        } catch (error) {
            console.error(
                "Failed to load assessment:",
                error
            );

            setErrorMessage(
                error.message ||
                "Failed to load assessment."
            );
        } finally {
            setLoadingAssessment(false);
        }
    };

    // =====================================================
    // SEARCH CODESPRINT USERS
    // =====================================================
    const searchUsers = async (searchText = "") => {
        if (!assessmentId || !userId) return;

        try {
            setLoadingUsers(true);

            const url =
                `${API_BASE_URL}/api/assessment-invitations/${assessmentId}/users` +
                `?userId=${userId}` +
                `&search=${encodeURIComponent(searchText)}`;

            const response = await fetch(url);
            const text = await response.text();

            if (!response.ok) {
                throw new Error(
                    text ||
                    "Failed to load CodeSprint users."
                );
            }

            let data;

            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(
                    "Invalid user response from server."
                );
            }

            setUsers(
                Array.isArray(data) ? data : []
            );
        } catch (error) {
            console.error(
                "Failed to search users:",
                error
            );

            setErrorMessage(
                error.message ||
                "Failed to search users."
            );
        } finally {
            setLoadingUsers(false);
        }
    };

    // =====================================================
    // LOAD INVITATIONS
    // =====================================================
    const loadInvitations = async () => {
        if (!assessmentId || !userId) return;

        try {
            setLoadingInvitations(true);

            const response = await fetch(
                `${API_BASE_URL}/api/assessment-invitations/${assessmentId}?userId=${userId}`
            );

            const text = await response.text();

            if (!response.ok) {
                throw new Error(
                    text ||
                    "Failed to load invitations."
                );
            }

            let data;

            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(
                    "Invalid invitation response from server."
                );
            }

            setInvitations(
                Array.isArray(data) ? data : []
            );
        } catch (error) {
            console.error(
                "Failed to load invitations:",
                error
            );

            setErrorMessage(
                error.message ||
                "Failed to load invitations."
            );
        } finally {
            setLoadingInvitations(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================
    useEffect(() => {
        if (!userId) {
            setErrorMessage(
                "User information is missing. Please login again."
            );
            setLoadingAssessment(false);
            return;
        }

        if (!assessmentId) {
            setErrorMessage(
                "Assessment information is missing."
            );
            setLoadingAssessment(false);
            return;
        }

        loadAssessment();
        loadInvitations();
    }, [assessmentId, userId]);

    // =====================================================
    // DEBOUNCED USER SEARCH
    // =====================================================
    useEffect(() => {
        if (
            !assessmentId ||
            !userId ||
            !assessmentCanInvite
        ) {
            setUsers([]);
            return;
        }

        const timer = setTimeout(() => {
            searchUsers(search);
        }, 300);

        return () => clearTimeout(timer);
    }, [
        search,
        assessmentId,
        userId,
        assessmentCanInvite
    ]);

    // =====================================================
    // CANDIDATE EXTRACTION HELPERS
    // =====================================================
    const getInvitationCandidateUserId = (invitation) => {
        if (!invitation) return null;

        if (invitation.candidateUserId) {
            return invitation.candidateUserId;
        }

        if (invitation.candidateUser?.id) {
            return invitation.candidateUser.id;
        }

        return null;
    };

    const isUserInvited = (candidate) => {
        if (!candidate?.id) return false;

        return invitations.some(
            (invitation) =>
                Number(
                    getInvitationCandidateUserId(invitation)
                ) === Number(candidate.id)
        );
    };

    const getInvitationForUser = (candidate) => {
        if (!candidate?.id) return null;

        return (
            invitations.find(
                (invitation) =>
                    Number(
                        getInvitationCandidateUserId(
                            invitation
                        )
                    ) === Number(candidate.id)
            ) || null
        );
    };

    // =====================================================
    // INVITE CODESPRINT USER
    // =====================================================
    const inviteExistingUser = async (
        candidateUserId
    ) => {
        if (!userId) {
            setErrorMessage(
                "User information is missing. Please login again."
            );
            return;
        }

        if (!assessmentCanInvite) {
            setErrorMessage(
                "This assessment is read-only. Invitations cannot be sent after expiry."
            );
            return;
        }

        try {
            setInvitingUserId(candidateUserId);
            setSuccessMessage("");
            setErrorMessage("");

            const response = await fetch(
                `${API_BASE_URL}/api/assessment-invitations/${assessmentId}/users/${candidateUserId}?userId=${userId}`,
                {
                    method: "POST"
                }
            );

            const text = await response.text();

            if (!response.ok) {
                throw new Error(
                    text ||
                    "Failed to send invitation."
                );
            }

            setSuccessMessage(
                "Invitation sent successfully. Candidate received test instructions."
            );

            await loadInvitations();
        } catch (error) {
            console.error(
                "Failed to invite user:",
                error
            );

            setErrorMessage(
                error.message ||
                "Failed to send invitation."
            );
        } finally {
            setInvitingUserId(null);
        }
    };

    // =====================================================
    // INVITE EXTERNAL CANDIDATE
    // =====================================================
    const inviteExternalCandidate = async (
        event
    ) => {
        event.preventDefault();

        if (!userId) {
            setErrorMessage(
                "User information is missing. Please login again."
            );
            return;
        }

        if (!assessmentCanInvite) {
            setErrorMessage(
                "This assessment is read-only. Invitations cannot be sent after expiry."
            );
            return;
        }

        if (!candidateEmail.trim()) {
            setErrorMessage(
                "Please enter a valid candidate email."
            );
            return;
        }

        try {
            setSendingExternal(true);
            setSuccessMessage("");
            setErrorMessage("");

            const response = await fetch(
                `${API_BASE_URL}/api/assessment-invitations/${assessmentId}/external` +
                `?userId=${userId}` +
                `&candidateEmail=${encodeURIComponent(
                    candidateEmail.trim()
                )}`,
                {
                    method: "POST"
                }
            );

            const text = await response.text();

            if (!response.ok) {
                throw new Error(
                    text ||
                    "Failed to send invitation."
                );
            }

            setCandidateEmail("");

            setSuccessMessage(
                "Invitation sent successfully to the external candidate."
            );

            await loadInvitations();
        } catch (error) {
            console.error(
                "Failed to invite external candidate:",
                error
            );

            setErrorMessage(
                error.message ||
                "Failed to send invitation."
            );
        } finally {
            setSendingExternal(false);
        }
    };

    // =====================================================
    // RESEND INVITATION
    // =====================================================
    const resendInvitation = async (
        invitation
    ) => {
        if (!userId || !invitation) return;

        if (!assessmentCanInvite) {
            setErrorMessage(
                "This assessment is read-only. Invitations cannot be resent after expiry."
            );
            return;
        }

        const candidateUserId =
            getInvitationCandidateUserId(
                invitation
            );

        try {
            setResendingInvitationId(
                invitation.id
            );

            setSuccessMessage("");
            setErrorMessage("");

            let response;

            if (candidateUserId) {
                response = await fetch(
                    `${API_BASE_URL}/api/assessment-invitations/${assessmentId}/users/${candidateUserId}?userId=${userId}`,
                    {
                        method: "POST"
                    }
                );
            } else {
                response = await fetch(
                    `${API_BASE_URL}/api/assessment-invitations/${assessmentId}/external` +
                    `?userId=${userId}` +
                    `&candidateEmail=${encodeURIComponent(
                        invitation.candidateEmail
                    )}`,
                    {
                        method: "POST"
                    }
                );
            }

            const text = await response.text();

            if (!response.ok) {
                throw new Error(
                    text ||
                    "Failed to resend invitation."
                );
            }

            setSuccessMessage(
                "Invitation resent successfully."
            );

            await loadInvitations();
        } catch (error) {
            console.error(
                "Failed to resend invitation:",
                error
            );

            setErrorMessage(
                error.message ||
                "Failed to resend invitation."
            );
        } finally {
            setResendingInvitationId(null);
        }
    };

    // =====================================================
    // INVITATION LINK
    // =====================================================
    const getInvitationLink = (
        invitation
    ) => {
        const token =
            invitation?.invitationToken ||
            invitation?.token;

        if (!token) return "";

        return (
            `${window.location.origin}` +
            `/assessment/invite/${token}`
        );
    };

    const copyInvitationLink = async (
        invitation
    ) => {
        const link =
            getInvitationLink(invitation);

        if (!link) {
            setErrorMessage(
                "Invitation link is not available."
            );
            return;
        }

        try {
            await navigator.clipboard.writeText(
                link
            );

            setCopiedInvitationId(
                invitation.id
            );

            setSuccessMessage(
                "Candidate-specific invitation link copied."
            );

            setTimeout(
                () =>
                    setCopiedInvitationId(null),
                2500
            );
        } catch (error) {
            console.error(
                "Failed to copy invitation link:",
                error
            );

            setErrorMessage(
                "Unable to copy invitation link."
            );
        }
    };

    // =====================================================
    // FORMAT DATE
    // =====================================================
    const formatDate = (dateString) => {
        if (!dateString) return "-";

        const date =
            new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleString([], {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // =====================================================
    // FORMAT STATUS
    // =====================================================
    const formatStatus = (status) => {
        if (!status) return "-";

        return status
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(
                /\b\w/g,
                (char) =>
                    char.toUpperCase()
            );
    };

    // =====================================================
    // BACK
    // =====================================================
    const handleBack = () => {
        navigate(
            `/user/assessments/${assessmentId}/manage`
        );
    };

    // =====================================================
    // UI
    // =====================================================
    return (
        <div className="assessment-invitations-page">
            <div className="assessment-invitations-container">

                {/* HEADER */}
                <div className="assessment-invitations-header">
                    <div className="assessment-invitations-header-left">

                        <button
                            className="assessment-invitations-back-button"
                            onClick={handleBack}
                        >
                            ← Back to Manage Assessment
                        </button>

                        <div className="header-title-wrap">
                            <h1>
                                {assessmentExpired
                                    ? "Invitation History"
                                    : "Invite Candidates"}
                            </h1>

                            {loadingAssessment ? (
                                <p>
                                    Loading assessment...
                                </p>
                            ) : assessment ? (
                                <p>
                                    <strong>
                                        {assessment.companyName}
                                    </strong>
                                    {" • "}
                                    {assessment.position}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div
                        className={
                            `assessment-published-badge ` +
                            `status-${assessmentStatus.toLowerCase()}`
                        }
                    >
                        <span className="status-dot"></span>
                        {assessmentStatus || "ASSESSMENT"}
                    </div>
                </div>

                {/* ASSESSMENT OVERVIEW */}
                {assessment && (
                    <div className="assessment-invitation-card meta-card">

                        <div className="assessment-summary-grid">

                            <div className="summary-col">
                                <span className="summary-label">
                                    Status
                                </span>

                                <strong className="summary-val">
                                    {formatStatus(
                                        assessment.status
                                    )}
                                </strong>
                            </div>

                            <div className="summary-col">
                                <span className="summary-label">
                                    Duration
                                </span>

                                <strong className="summary-val">
                                    {assessment.durationMinutes
                                        ? `${assessment.durationMinutes} minutes`
                                        : "-"}
                                </strong>
                            </div>

                            <div className="summary-col">
                                <span className="summary-label">
                                    Start Time
                                </span>

                                <strong className="summary-val">
                                    {formatDate(
                                        assessment.startDateTime
                                    )}
                                </strong>
                            </div>

                            <div className="summary-col">
                                <span className="summary-label">
                                    Invitation Window
                                </span>

                                <strong className="summary-val">
                                    48 hours from LIVE
                                </strong>
                            </div>
                        </div>

                        {assessmentLocked && (
                            <div
                                className={
                                    `assessment-lock-message ` +
                                    `${
                                        assessmentStatus === "LIVE"
                                            ? "live"
                                            : "expired"
                                    }`
                                }
                            >
                                <span className="lock-icon">
                                    {assessmentStatus === "LIVE"
                                        ? "🟢"
                                        : "🔒"}
                                </span>

                                <div>
                                    {assessmentStatus === "LIVE"
                                        ? "This assessment is LIVE. Candidates can use their invitation links."
                                        : "This assessment has expired. New candidate attempts cannot be started."}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* SUCCESS MESSAGE */}
                {successMessage && (
                    <div className="assessment-success-message">
                        <span>✓</span>

                        <span>
                            {successMessage}
                        </span>

                        <button
                            onClick={() =>
                                setSuccessMessage("")
                            }
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* ERROR MESSAGE */}
                {errorMessage && (
                    <div className="assessment-error-message">
                        <span>⚠️</span>

                        <span>
                            {errorMessage}
                        </span>

                        <button
                            onClick={() =>
                                setErrorMessage("")
                            }
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* =====================================================
                    INVITATION MANAGEMENT
                    Hidden completely after assessment expiry
                ===================================================== */}
                {assessmentCanInvite && (
                    <div className="invitations-dispatch-grid">

                        {/* EXTERNAL CANDIDATE */}
                        <section className="assessment-invitation-card dispatch-box">

                            <div className="assessment-card-heading">
                                <div>
                                    <h2>
                                        Invite External Candidate
                                    </h2>

                                    <p>
                                        Send an assessment invitation to a candidate outside CodeSprint.
                                    </p>
                                </div>
                            </div>

                            <form
                                className="external-candidate-form"
                                onSubmit={
                                    inviteExternalCandidate
                                }
                            >
                                <div className="assessment-input-group">

                                    <label>
                                        Candidate Email Address
                                    </label>

                                    <input
                                        type="email"
                                        value={
                                            candidateEmail
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setCandidateEmail(
                                                event.target.value
                                            )
                                        }
                                        placeholder="candidate@example.com"
                                        disabled={
                                            sendingExternal
                                        }
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="assessment-primary-button"
                                    disabled={
                                        sendingExternal
                                    }
                                >
                                    {sendingExternal
                                        ? "Sending..."
                                        : "Send Invitation"}
                                </button>
                            </form>
                        </section>

                        {/* CODESPRINT USERS */}
                        <section className="assessment-invitation-card dispatch-box">

                            <div className="assessment-card-heading">
                                <div>
                                    <h2>
                                        CodeSprint Users
                                    </h2>

                                    <p>
                                        Search registered candidates and dispatch direct assessment invites.
                                    </p>
                                </div>
                            </div>

                            <div className="assessment-user-search">

                                <span className="search-icon">
                                    🔍
                                </span>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(
                                        event
                                    ) =>
                                        setSearch(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search by name or email..."
                                />

                                {search && (
                                    <button
                                        className="clear-search-button"
                                        onClick={() =>
                                            setSearch("")
                                        }
                                        type="button"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>

                            {loadingUsers ? (
                                <div className="assessment-loading">

                                    <div className="assessment-spinner"></div>

                                    <span>
                                        Searching CodeSprint users...
                                    </span>
                                </div>
                            ) : users.length === 0 ? (
                                <div className="assessment-empty-state">

                                    <div className="assessment-empty-icon">
                                        👥
                                    </div>

                                    <h3>
                                        No users found
                                    </h3>

                                    <p>
                                        Try searching with a different name or email.
                                    </p>
                                </div>
                            ) : (
                                <div className="assessment-user-list">

                                    {users.map(
                                        (candidate) => {

                                            const invited =
                                                isUserInvited(
                                                    candidate
                                                );

                                            const existingInvitation =
                                                getInvitationForUser(
                                                    candidate
                                                );

                                            const isInviting =
                                                invitingUserId ===
                                                candidate.id;

                                            return (
                                                <div
                                                    className="assessment-user-row"
                                                    key={
                                                        candidate.id
                                                    }
                                                >
                                                    <div className="assessment-user-info">

                                                        <div className="assessment-user-avatar">
                                                            {(
                                                                candidate.name ||
                                                                "U"
                                                            )
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}
                                                        </div>

                                                        <div className="assessment-user-details">

                                                            <div className="assessment-user-name">
                                                                {candidate.name ||
                                                                    "Unnamed User"}
                                                            </div>

                                                            <div className="assessment-user-email">
                                                                {
                                                                    candidate.email
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {invited ? (
                                                        <div className="assessment-invited-actions">

                                                            <span className="assessment-invited-pill">
                                                                ✓ Invited
                                                            </span>

                                                            {existingInvitation?.invitationToken && (
                                                                <button
                                                                    className="assessment-secondary-button"
                                                                    type="button"
                                                                    onClick={() =>
                                                                        copyInvitationLink(
                                                                            existingInvitation
                                                                        )
                                                                    }
                                                                >
                                                                    {copiedInvitationId ===
                                                                    existingInvitation.id
                                                                        ? "✓ Copied"
                                                                        : "Copy Link"}
                                                                </button>
                                                            )}

                                                            <button
                                                                className="assessment-secondary-button"
                                                                type="button"
                                                                onClick={() =>
                                                                    resendInvitation(
                                                                        existingInvitation
                                                                    )
                                                                }
                                                                disabled={
                                                                    resendingInvitationId ===
                                                                    existingInvitation?.id
                                                                }
                                                            >
                                                                {resendingInvitationId ===
                                                                existingInvitation?.id
                                                                    ? "Sending..."
                                                                    : "Resend"}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            className="assessment-primary-button"
                                                            type="button"
                                                            onClick={() =>
                                                                inviteExistingUser(
                                                                    candidate.id
                                                                )
                                                            }
                                                            disabled={
                                                                isInviting
                                                            }
                                                        >
                                                            {isInviting
                                                                ? "Sending..."
                                                                : "Invite"}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {/* =====================================================
                    EXPIRED READ-ONLY NOTICE
                ===================================================== */}
                {assessmentExpired && (
                    <div className="assessment-invitation-card">
                        <div className="assessment-lock-message expired">

                            <span className="lock-icon">
                                🔒
                            </span>

                            <div>
                                <strong>
                                    Invitation management is read-only.
                                </strong>

                                <div>
                                    This assessment has expired.
                                    Existing invitation history remains
                                    available, but new invitations and
                                    resends are disabled.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* =====================================================
                    INVITATION HISTORY
                ===================================================== */}
                <section className="assessment-invitation-card">

                    <div className="assessment-card-heading history-heading">

                        <div>
                            <h2>
                                Invitation History
                            </h2>

                            <p>
                                Each candidate has one unique invitation and assessment attempt.
                            </p>
                        </div>

                        <button
                            className="assessment-refresh-button"
                            onClick={
                                loadInvitations
                            }
                            disabled={
                                loadingInvitations
                            }
                        >
                            ↻ Refresh Log
                        </button>
                    </div>

                    {loadingInvitations ? (
                        <div className="assessment-loading">

                            <div className="assessment-spinner"></div>

                            <span>
                                Loading invitations...
                            </span>
                        </div>
                    ) : invitations.length === 0 ? (
                        <div className="assessment-empty-state">

                            <div className="assessment-empty-icon">
                                ✉️
                            </div>

                            <h3>
                                No invitations yet
                            </h3>

                            <p>
                                Candidates you invite will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="assessment-table-wrapper">

                            <table className="assessment-invitations-table">

                                <thead>
                                    <tr>
                                        <th>
                                            Candidate
                                        </th>

                                        <th>
                                            Email
                                        </th>

                                        <th>
                                            Type
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Invited
                                        </th>

                                        <th>
                                            Invitation
                                        </th>

                                        <th
                                            style={{
                                                textAlign:
                                                    "right"
                                            }}
                                        >
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {invitations.map(
                                        (
                                            invitation
                                        ) => {

                                            const candidateUserId =
                                                getInvitationCandidateUserId(
                                                    invitation
                                                );

                                            const invitationLink =
                                                getInvitationLink(
                                                    invitation
                                                );

                                            const isResending =
                                                resendingInvitationId ===
                                                invitation.id;

                                            const invitationStatus =
                                                invitation.status
                                                    ? String(
                                                          invitation.status
                                                      ).toUpperCase()
                                                    : "";

                                            return (
                                                <tr
                                                    key={
                                                        invitation.id
                                                    }
                                                >
                                                    <td>
                                                        <div className="history-candidate">

                                                            <div className="history-avatar">
                                                                {(
                                                                    invitation.candidateName ||
                                                                    "E"
                                                                )
                                                                    .charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase()}
                                                            </div>

                                                            <span className="candidate-name-txt">
                                                                {invitation.candidateName ||
                                                                    "External Candidate"}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span className="candidate-email-txt">
                                                            {
                                                                invitation.candidateEmail
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {candidateUserId ? (
                                                            <span className="assessment-type-badge codesprint">
                                                                CodeSprint User
                                                            </span>
                                                        ) : (
                                                            <span className="assessment-type-badge external">
                                                                External
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={
                                                                `assessment-status-badge ` +
                                                                `${String(
                                                                    invitation.status
                                                                ).toLowerCase()}`
                                                            }
                                                        >
                                                            {formatStatus(
                                                                invitation.status
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span className="date-txt">
                                                            {formatDate(
                                                                invitation.invitedAt
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {invitationLink ? (
                                                            <button
                                                                className="copy-link-btn"
                                                                type="button"
                                                                onClick={() =>
                                                                    copyInvitationLink(
                                                                        invitation
                                                                    )
                                                                }
                                                            >
                                                                {copiedInvitationId ===
                                                                invitation.id
                                                                    ? "✓ Copied"
                                                                    : "Copy Link"}
                                                            </button>
                                                        ) : (
                                                            <span className="muted-dash">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td
                                                        style={{
                                                            textAlign:
                                                                "right"
                                                        }}
                                                    >
                                                        {invitationStatus ===
                                                        "COMPLETED" ? (
                                                            <span className="action-tag completed">
                                                                Completed
                                                            </span>
                                                        ) : invitationStatus ===
                                                          "CANCELLED" ? (
                                                            <span className="action-tag cancelled">
                                                                Cancelled
                                                            </span>
                                                        ) : assessmentExpired ? (
                                                            <span className="action-tag">
                                                                Read Only
                                                            </span>
                                                        ) : (
                                                            <button
                                                                className="table-resend-btn"
                                                                type="button"
                                                                onClick={() =>
                                                                    resendInvitation(
                                                                        invitation
                                                                    )
                                                                }
                                                                disabled={
                                                                    isResending ||
                                                                    !assessmentCanInvite
                                                                }
                                                            >
                                                                {isResending
                                                                    ? "Sending..."
                                                                    : "Resend"}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default AssessmentInvitations;