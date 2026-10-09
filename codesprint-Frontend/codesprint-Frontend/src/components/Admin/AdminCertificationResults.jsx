import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import axios from "axios";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import "./AdminCertificationResults.css";

const API_URL =
    "/api/admin/certifications";

function AdminCertificationResults() {

    const {
        certificationId
    } = useParams();

    const navigate =
        useNavigate();

    // ============================================================
    // STATE
    // ============================================================

    const [results, setResults] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    // ============================================================
    // ERROR MESSAGE
    // ============================================================

    const getErrorMessage = (
        err,
        fallbackMessage
    ) => {

        const data =
            err.response?.data;

        if (
            typeof data === "string"
        ) {
            return data;
        }

        if (data?.message) {
            return data.message;
        }

        if (data?.error) {
            return data.error;
        }

        return fallbackMessage;
    };

    // ============================================================
    // LOAD RESULTS
    // ============================================================

    const loadResults =
        useCallback(async () => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await axios.get(
                        `${API_URL}/${certificationId}/results`
                    );

                setResults(
                    response.data
                );

            } catch (err) {

                console.error(
                    "Error loading certification results:",
                    err
                );

                setError(
                    getErrorMessage(
                        err,
                        "Unable to load certification results."
                    )
                );

            } finally {

                setLoading(false);
            }

        }, [certificationId]);

    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        loadResults();

    }, [loadResults]);

    // ============================================================
    // ATTEMPTS
    // ============================================================

    const attempts =
        useMemo(() => {

            return Array.isArray(
                results?.attempts
            )
                ? results.attempts
                : [];

        }, [results]);

    // ============================================================
    // FILTERED ATTEMPTS
    // ============================================================

    const filteredAttempts =
        useMemo(() => {

            const searchValue =
                search
                    .trim()
                    .toLowerCase();

            return attempts.filter(
                attempt => {

                    // --------------------------------------------
                    // SEARCH
                    // --------------------------------------------

                    const matchesSearch =
                        !searchValue ||
                        attempt.candidateName
                            ?.toLowerCase()
                            .includes(
                                searchValue
                            ) ||
                        attempt.candidateEmail
                            ?.toLowerCase()
                            .includes(
                                searchValue
                            ) ||
                        String(
                            attempt.attemptId ?? ""
                        ).includes(
                            searchValue
                        );

                    if (!matchesSearch) {
                        return false;
                    }

                    // --------------------------------------------
                    // ALL
                    // --------------------------------------------

                    if (
                        statusFilter === "ALL"
                    ) {
                        return true;
                    }

                    // --------------------------------------------
                    // PASSED
                    // --------------------------------------------

                    if (
                        statusFilter === "PASSED"
                    ) {

                        return (
                            attempt.status ===
                                "COMPLETED" &&
                            attempt.passed ===
                                true
                        );
                    }

                    // --------------------------------------------
                    // FAILED
                    // --------------------------------------------

                    if (
                        statusFilter === "FAILED"
                    ) {

                        return (
                            attempt.status ===
                                "COMPLETED" &&
                            attempt.passed ===
                                false
                        );
                    }

                    // --------------------------------------------
                    // EXPIRED
                    // --------------------------------------------

                    if (
                        statusFilter ===
                        "TIME_EXPIRED"
                    ) {

                        return (
                            attempt.status ===
                            "TIME_EXPIRED"
                        );
                    }

                    // --------------------------------------------
                    // IN PROGRESS
                    // --------------------------------------------

                    if (
                        statusFilter ===
                        "IN_PROGRESS"
                    ) {

                        return (
                            attempt.status ===
                            "IN_PROGRESS"
                        );
                    }

                    return true;
                }
            );

        }, [
            attempts,
            search,
            statusFilter
        ]);

    // ============================================================
    // FORMAT DATE
    // ============================================================

    const formatDateTime = (
        value
    ) => {

        if (!value) {
            return "—";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return value;
        }

        return date.toLocaleString(
            undefined,
            {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };

    // ============================================================
    // RESULT
    // ============================================================

    const getResult = (
        attempt
    ) => {

        if (
            attempt.status !==
            "COMPLETED"
        ) {
            return "—";
        }

        return attempt.passed
            ? "PASS"
            : "FAIL";
    };

    // ============================================================
    // STATUS LABEL
    // ============================================================

    const getStatusLabel = (
        status
    ) => {

        if (
            status === "IN_PROGRESS"
        ) {
            return "In Progress";
        }

        if (
            status === "TIME_EXPIRED"
        ) {
            return "Time Expired";
        }

        if (
            status === "COMPLETED"
        ) {
            return "Completed";
        }

        return status || "Unknown";
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <div className="admin-cert-results-page">

                <div className="cert-results-loading">

                    <div className="cert-results-spinner"></div>

                    <h2>
                        Loading Results...
                    </h2>

                    <p>
                        Please wait while certification attempts are loaded.
                    </p>

                </div>

            </div>
        );
    }

    // ============================================================
    // LOAD ERROR
    // ============================================================

    if (
        error &&
        !results
    ) {

        return (

            <div className="admin-cert-results-page">

                <div className="cert-results-error-state">

                    <div className="cert-results-error-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to Load Results
                    </h2>

                    <p>
                        {error}
                    </p>

                    <div className="error-state-actions">

                        <button
                            type="button"
                            onClick={
                                loadResults
                            }
                        >
                            Try Again
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/admin/certifications"
                                )
                            }
                        >
                            Back to Certifications
                        </button>

                    </div>

                </div>

            </div>
        );
    }

    // ============================================================
    // PAGE
    // ============================================================

    return (

        <div className="admin-cert-results-page">

            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="cert-results-header">

                <div>

                    <div className="cert-results-breadcrumb">

                        Admin / Certifications / Results

                    </div>

                    <h1>
                        Certification Results
                    </h1>

                    <p>
                        Review candidate attempts and certification performance.
                    </p>

                </div>

                <div className="cert-results-header-actions">

                    <button
                        type="button"
                        className="results-back-button"
                        onClick={() =>
                            navigate(
                                "/admin/certifications"
                            )
                        }
                    >
                        ← Back
                    </button>

                    <button
                        type="button"
                        className="results-refresh-button"
                        onClick={
                            loadResults
                        }
                    >
                        ↻ Refresh
                    </button>

                </div>

            </div>

            {/* ====================================================
                ERROR
            ==================================================== */}

            {error && (

                <div className="cert-results-alert">

                    <span>
                        ⚠️
                    </span>

                    <span>
                        {error}
                    </span>

                </div>
            )}

            {/* ====================================================
                CERTIFICATION
            ==================================================== */}

            <section className="cert-results-certification">

                <div className="cert-results-cert-icon">

                    <svg
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>

                </div>

                <div>

                    <span>
                        CERTIFICATION
                    </span>

                    <h2>
                        {results?.certificationTitle}
                    </h2>

                    <p>
                        Certification ID: #
                        {results?.certificationId}
                    </p>

                </div>

            </section>

            {/* ====================================================
                SUMMARY
            ==================================================== */}

            <section className="cert-results-summary">

                <div className="cert-summary-card">

                    <span className="summary-label">
                        Total Attempts
                    </span>

                    <strong>
                        {results?.totalAttempts ?? 0}
                    </strong>

                    <small>
                        All recorded attempts
                    </small>

                </div>

                <div className="cert-summary-card">

                    <span className="summary-label">
                        Candidates
                    </span>

                    <strong>
                        {results?.uniqueCandidates ?? 0}
                    </strong>

                    <small>
                        Unique candidates
                    </small>

                </div>

                <div className="cert-summary-card passed">

                    <span className="summary-label">
                        Passed
                    </span>

                    <strong>
                        {results?.passedAttempts ?? 0}
                    </strong>

                    <small>
                        Completed and passed
                    </small>

                </div>

                <div className="cert-summary-card failed">

                    <span className="summary-label">
                        Failed
                    </span>

                    <strong>
                        {results?.failedAttempts ?? 0}
                    </strong>

                    <small>
                        Completed but failed
                    </small>

                </div>

                <div className="cert-summary-card expired">

                    <span className="summary-label">
                        Expired
                    </span>

                    <strong>
                        {results?.expiredAttempts ?? 0}
                    </strong>

                    <small>
                        Time limit reached
                    </small>

                </div>

                <div className="cert-summary-card progress">

                    <span className="summary-label">
                        In Progress
                    </span>

                    <strong>
                        {results?.inProgressAttempts ?? 0}
                    </strong>

                    <small>
                        Active attempts
                    </small>

                </div>

            </section>

            {/* ====================================================
                RESULTS
            ==================================================== */}

            <section className="cert-results-section">

                <div className="cert-results-section-header">

                    <div>

                        <h2>
                            Candidate Attempts
                        </h2>

                        <p>
                            {filteredAttempts.length} of{" "}
                            {attempts.length} attempt
                            {attempts.length !== 1
                                ? "s"
                                : ""}
                        </p>

                    </div>

                </div>

                {/* ================================================
                    FILTERS
                ================================================ */}

                <div className="cert-results-filters">

                    <div className="results-search-box">

                        <span>
                            ⌕
                        </span>

                        <input
                            type="text"
                            value={search}
                            onChange={event =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search candidate name, email or attempt ID..."
                        />

                    </div>

                    <select
                        className="results-status-filter"
                        value={
                            statusFilter
                        }
                        onChange={event =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            All Results
                        </option>

                        <option value="PASSED">
                            Passed
                        </option>

                        <option value="FAILED">
                            Failed
                        </option>

                        <option value="TIME_EXPIRED">
                            Time Expired
                        </option>

                        <option value="IN_PROGRESS">
                            In Progress
                        </option>

                    </select>

                </div>

                {/* ================================================
                    EMPTY
                ================================================ */}

                {attempts.length === 0 ? (

                    <div className="cert-results-empty">

                        <div>
                            📊
                        </div>

                        <h3>
                            No Attempts Yet
                        </h3>

                        <p>
                            No candidate has attempted this certification yet.
                        </p>

                    </div>

                ) : filteredAttempts.length === 0 ? (

                    <div className="cert-results-empty">

                        <div>
                            🔎
                        </div>

                        <h3>
                            No Matching Results
                        </h3>

                        <p>
                            Try changing your search or status filter.
                        </p>

                    </div>

                ) : (

                    /* =============================================
                        TABLE
                    ============================================= */

                    <div className="cert-results-table-wrapper">

                        <table className="cert-results-table">

                            <thead>

                                <tr>

                                    <th>
                                        Candidate
                                    </th>

                                    <th>
                                        Attempt
                                    </th>

                                    <th>
                                        Questions
                                    </th>

                                    <th>
                                        Score
                                    </th>

                                    <th>
                                        Result
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Started
                                    </th>

                                    <th>
                                        Submitted
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredAttempts.map(
                                    attempt => {

                                        const result =
                                            getResult(
                                                attempt
                                            );

                                        return (

                                            <tr
                                                key={
                                                    attempt.attemptId
                                                }
                                            >

                                                {/* CANDIDATE */}

                                                <td>

                                                    <div className="candidate-cell">

                                                        <div className="candidate-avatar">

                                                            {attempt
                                                                .candidateName
                                                                ?.trim()
                                                                ?.charAt(0)
                                                                ?.toUpperCase() ||
                                                                "U"}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {attempt.candidateName ||
                                                                    "Unknown User"}
                                                            </strong>

                                                            <span>
                                                                {attempt.candidateEmail ||
                                                                    "No email"}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* ATTEMPT */}

                                                <td>

                                                    <div className="attempt-number">

                                                        Attempt{" "}
                                                        {attempt.attemptNumber}

                                                    </div>

                                                    <small>
                                                        ID #{attempt.attemptId}
                                                    </small>

                                                </td>

                                                {/* QUESTIONS */}

                                                <td>

                                                    <strong>

                                                        {attempt.correctAnswers ??
                                                            0}

                                                    </strong>

                                                    <span className="questions-divider">
                                                        /
                                                    </span>

                                                    {attempt.totalQuestions ??
                                                        0}

                                                </td>

                                                {/* SCORE */}

                                                <td>

                                                    {attempt.status ===
                                                    "IN_PROGRESS" ? (

                                                        <span className="score-pending">
                                                            —
                                                        </span>

                                                    ) : (

                                                        <strong className="attempt-score">

                                                            {Number(
                                                                attempt.percentage ??
                                                                attempt.score ??
                                                                0
                                                            ).toFixed(1)}%

                                                        </strong>
                                                    )}

                                                </td>

                                                {/* RESULT */}

                                                <td>

                                                    {result ===
                                                    "PASS" ? (

                                                        <span className="result-badge passed">
                                                            ✓ Pass
                                                        </span>

                                                    ) : result ===
                                                      "FAIL" ? (

                                                        <span className="result-badge failed">
                                                            ✕ Fail
                                                        </span>

                                                    ) : (

                                                        <span className="result-badge pending">
                                                            —
                                                        </span>
                                                    )}

                                                </td>

                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={
                                                            `attempt-status-badge ${
                                                                attempt.status
                                                                    ?.toLowerCase()
                                                                    .replace(
                                                                        /_/g,
                                                                        "-"
                                                                    ) ||
                                                                "unknown"
                                                            }`
                                                        }
                                                    >
                                                        {getStatusLabel(
                                                            attempt.status
                                                        )}
                                                    </span>

                                                </td>

                                                {/* STARTED */}

                                                <td className="date-cell">

                                                    {formatDateTime(
                                                        attempt.startedAt
                                                    )}

                                                </td>

                                                {/* SUBMITTED */}

                                                <td className="date-cell">

                                                    {formatDateTime(
                                                        attempt.submittedAt
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
    );
}

export default AdminCertificationResults;