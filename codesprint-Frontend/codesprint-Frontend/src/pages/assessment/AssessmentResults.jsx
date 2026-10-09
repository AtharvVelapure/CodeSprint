import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AssessmentResults.css";

const API_BASE = "";

function AssessmentResults() {
    const { assessmentId } = useParams();
    const navigate = useNavigate();

    const [results, setResults] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);

    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);

    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    useEffect(() => {
        loadResults();
    }, [assessmentId]);

    const loadResults = async () => {
        try {
            setLoading(true);
            setError("");

            if (!userId) {
                setError(
                    "User information not found. Please login again."
                );
                return;
            }

            const response = await fetch(
                `${API_BASE}/api/assessment-results/${assessmentId}?userId=${userId}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    typeof data === "string"
                        ? data
                        : data?.message || "Failed to load assessment results."
                );
            }

            setResults(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error loading assessment results:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const viewCandidateResult = async (invitationId) => {
        try {
            setDetailLoading(true);
            setError("");

            const response = await fetch(
                `${API_BASE}/api/assessment-results/${assessmentId}/candidate/${invitationId}?userId=${userId}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    typeof data === "string"
                        ? data
                        : data?.message || "Failed to load candidate result."
                );
            }

            setSelectedResult(data);

            setTimeout(() => {
                document
                    .getElementById("candidate-result-detail")
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
            }, 100);
        } catch (err) {
            console.error(
                "Error loading candidate result:",
                err
            );

            setError(err.message);
        } finally {
            setDetailLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    const getStatusClass = (status) => {
        if (status === "SUBMITTED") {
            return "status-submitted";
        }

        if (status === "IN_PROGRESS") {
            return "status-progress";
        }

        if (status === "TIME_EXPIRED") {
            return "status-expired";
        }

        if (status === "INVITED") {
            return "status-invited";
        }

        if (status === "COMPLETED") {
            return "status-completed";
        }

        return "status-default";
    };

    const getQuestionStatusClass = (status) => {
        if (status === "Accepted") {
            return "question-accepted";
        }

        if (status === "Wrong Answer") {
            return "question-wrong";
        }

        if (status === "Compilation Error") {
            return "question-error";
        }

        if (status === "Not Attempted") {
            return "question-not-attempted";
        }

        return "question-default";
    };

    const filteredResults = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return results.filter((result) => {
            const candidateName =
                result.candidateName?.toLowerCase() || "";

            const candidateEmail =
                result.candidateEmail?.toLowerCase() || "";

            const matchesSearch =
                !search ||
                candidateName.includes(search) ||
                candidateEmail.includes(search);

            const matchesStatus =
                statusFilter === "ALL" ||
                result.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [results, searchTerm, statusFilter]);

    const totalCandidates = results.length;

    const submittedCandidates = results.filter(
        (result) =>
            result.status === "SUBMITTED"
    ).length;

    const inProgressCandidates = results.filter(
        (result) =>
            result.status === "IN_PROGRESS"
    ).length;

    const expiredCandidates = results.filter(
        (result) =>
            result.status === "TIME_EXPIRED"
    ).length;

    const averagePercentage = useMemo(() => {
        const submitted = results.filter(
            (result) =>
                result.status === "SUBMITTED" ||
                result.status === "TIME_EXPIRED"
        );

        if (submitted.length === 0) {
            return 0;
        }

        const total = submitted.reduce(
            (sum, result) =>
                sum + Number(result.percentage || 0),
            0
        );

        return (total / submitted.length).toFixed(1);
    }, [results]);

    const totalQuestions =
        results.length > 0
            ? results[0].totalQuestions || 0
            : 0;

    if (loading) {
        return (
            <div className="assessment-results-page">
                <div className="assessment-results-loading">
                    <div className="results-spinner"></div>

                    <p>
                        Loading assessment results...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="assessment-results-page">

            {/* =====================================================
                PAGE HEADER
            ===================================================== */}

            <div className="assessment-results-header">

                <div className="results-header-left">

                    <button
                        className="results-back-button"
                        onClick={() =>
                            navigate(
                                `/user/assessments/${assessmentId}/manage`
                            )
                        }
                    >
                        <span>←</span>
                        Back to Assessment
                    </button>

                    <div className="results-title-row">

                        <div className="results-title-icon">
                            ✓
                        </div>

                        <div>
                            <h1>
                                Assessment Results
                            </h1>

                            <p>
                                Review candidate performance
                                and individual submissions.
                            </p>
                        </div>

                    </div>

                </div>

                <button
                    className="results-refresh-button"
                    onClick={loadResults}
                >
                    <span>↻</span>
                    Refresh
                </button>

            </div>

            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (
                <div className="results-error">

                    <span className="results-error-icon">
                        !
                    </span>

                    <div>
                        <strong>
                            Unable to load results
                        </strong>

                        <p>
                            {error}
                        </p>
                    </div>

                </div>
            )}

            {/* =====================================================
                SUMMARY
            ===================================================== */}

            <div className="results-summary-grid">

                <div className="results-summary-card">

                    <div className="summary-card-icon candidates">
                        👥
                    </div>

                    <div className="summary-card-content">

                        <span className="summary-label">
                            Candidates
                        </span>

                        <strong>
                            {totalCandidates}
                        </strong>

                    </div>

                </div>

                <div className="results-summary-card">

                    <div className="summary-card-icon submitted">
                        ✓
                    </div>

                    <div className="summary-card-content">

                        <span className="summary-label">
                            Submitted
                        </span>

                        <strong>
                            {submittedCandidates}
                        </strong>

                    </div>

                </div>

                <div className="results-summary-card">

                    <div className="summary-card-icon progress">
                        ◷
                    </div>

                    <div className="summary-card-content">

                        <span className="summary-label">
                            In Progress
                        </span>

                        <strong>
                            {inProgressCandidates}
                        </strong>

                    </div>

                </div>

                <div className="results-summary-card">

                    <div className="summary-card-icon expired">
                        !
                    </div>

                    <div className="summary-card-content">

                        <span className="summary-label">
                            Time Expired
                        </span>

                        <strong>
                            {expiredCandidates}
                        </strong>

                    </div>

                </div>

                <div className="results-summary-card">

                    <div className="summary-card-icon percentage">
                        %
                    </div>

                    <div className="summary-card-content">

                        <span className="summary-label">
                            Average Percentage
                        </span>

                        <strong>
                            {averagePercentage}%
                        </strong>

                    </div>

                </div>

                <div className="results-summary-card">

                    <div className="summary-card-icon questions">
                        📝
                    </div>

                    <div className="summary-card-content">

                        <span className="summary-label">
                            Questions
                        </span>

                        <strong>
                            {totalQuestions}
                        </strong>

                    </div>

                </div>

            </div>

            {/* =====================================================
                CANDIDATE RESULTS
            ===================================================== */}

            <div className="results-table-card">

                <div className="results-table-header">

                    <div>

                        <h2>
                            Candidate Results
                        </h2>

                        <p>
                            Select a candidate to view
                            detailed assessment results.
                        </p>

                    </div>

                    <div className="results-count">
                        {filteredResults.length} of{" "}
                        {results.length}
                    </div>

                </div>

                <div className="results-filter-bar">

                    <div className="results-search-box">

                        <span className="search-icon">
                            🔍
                        </span>

                        <input
                            type="text"
                            placeholder="Search candidate or email..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                        />

                        {searchTerm && (
                            <button
                                type="button"
                                className="clear-search"
                                onClick={() =>
                                    setSearchTerm("")
                                }
                            >
                                ×
                            </button>
                        )}

                    </div>

                    <select
                        className="results-status-filter"
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            All Status
                        </option>

                        <option value="SUBMITTED">
                            Submitted
                        </option>

                        <option value="IN_PROGRESS">
                            In Progress
                        </option>

                        <option value="TIME_EXPIRED">
                            Time Expired
                        </option>

                        <option value="INVITED">
                            Invited
                        </option>
                    </select>

                </div>

                {results.length === 0 ? (

                    <div className="results-empty">

                        <div className="empty-icon">
                            📋
                        </div>

                        <h3>
                            No candidate results yet
                        </h3>

                        <p>
                            Candidate results will
                            appear here after candidates
                            start or complete the
                            assessment.
                        </p>

                    </div>

                ) : filteredResults.length === 0 ? (

                    <div className="results-empty results-no-match">

                        <div className="empty-icon">
                            🔍
                        </div>

                        <h3>
                            No matching candidates
                        </h3>

                        <p>
                            Try changing your search or
                            status filter.
                        </p>

                        <button
                            className="clear-filters-button"
                            onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("ALL");
                            }}
                        >
                            Clear Filters
                        </button>

                    </div>

                ) : (

                    <div className="results-table-wrapper">

                        <table className="results-table">

                            <thead>

                                <tr>

                                    <th>
                                        Candidate
                                    </th>

                                    <th>
                                        Score
                                    </th>

                                    <th>
                                        Attempted
                                    </th>

                                    <th>
                                        Solved
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Submitted
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredResults.map(
                                    (result) => (

                                        <tr
                                            key={
                                                result.invitationId
                                            }
                                        >

                                            <td>

                                                <div className="candidate-cell">

                                                    <div className="candidate-avatar">

                                                        {result.candidateName
                                                            ?.charAt(
                                                                0
                                                            )
                                                            ?.toUpperCase() ||
                                                            "C"}

                                                    </div>

                                                    <div className="candidate-info">

                                                        <strong>
                                                            {result.candidateName ||
                                                                "Candidate"}
                                                        </strong>

                                                        <span>
                                                            {
                                                                result.candidateEmail
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>

                                            <td>

                                                <div className="score-cell">

                                                    <strong>
                                                        {
                                                            result.marksObtained
                                                        }
                                                    </strong>

                                                    <span>
                                                        {" "}
                                                        /{" "}
                                                        {
                                                            result.totalMarks
                                                        }
                                                    </span>

                                                </div>

                                                <div className="percentage-text">
                                                    {
                                                        result.percentage
                                                    }%
                                                </div>

                                            </td>

                                            <td>

                                                <div className="progress-value">

                                                    <strong>
                                                        {
                                                            result.attemptedQuestions
                                                        }
                                                    </strong>

                                                    <span>
                                                        {" / "}
                                                        {
                                                            result.totalQuestions
                                                        }
                                                    </span>

                                                </div>

                                            </td>

                                            <td>

                                                <div className="progress-value solved">

                                                    <strong>
                                                        {
                                                            result.solvedQuestions
                                                        }
                                                    </strong>

                                                    <span>
                                                        {" / "}
                                                        {
                                                            result.totalQuestions
                                                        }
                                                    </span>

                                                </div>

                                            </td>

                                            <td>

                                                <span
                                                    className={`result-status ${getStatusClass(
                                                        result.status
                                                    )}`}
                                                >
                                                    {
                                                        result.status
                                                    }
                                                </span>

                                            </td>

                                            <td>
                                                {formatDate(
                                                    result.submittedAt
                                                )}
                                            </td>

                                            <td>

                                                <button
                                                    className="view-result-button"
                                                    onClick={() =>
                                                        viewCandidateResult(
                                                            result.invitationId
                                                        )
                                                    }
                                                >
                                                    View Result
                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {/* =====================================================
                CANDIDATE DETAIL
            ===================================================== */}

            {selectedResult && (

                <div
                    id="candidate-result-detail"
                    className="candidate-detail-section"
                >

                    <div className="candidate-detail-header">

                        <div>

                            <button
                                className="detail-back-button"
                                onClick={() =>
                                    setSelectedResult(null)
                                }
                            >
                                ← Back to Results
                            </button>

                            <div className="detail-candidate-heading">

                                <div className="detail-candidate-avatar">
                                    {selectedResult.candidateName
                                        ?.charAt(0)
                                        ?.toUpperCase() || "C"}
                                </div>

                                <div>

                                    <h2>
                                        {selectedResult.candidateName ||
                                            "Candidate"}
                                    </h2>

                                    <p>
                                        {
                                            selectedResult.candidateEmail
                                        }
                                    </p>

                                </div>

                            </div>

                        </div>

                        <span
                            className={`result-status ${getStatusClass(
                                selectedResult.status
                            )}`}
                        >
                            {selectedResult.status}
                        </span>

                    </div>

                    {/* Candidate Summary */}

                    <div className="candidate-stat-grid">

                        <div className="candidate-stat-card">

                            <span>
                                Score
                            </span>

                            <strong>
                                {
                                    selectedResult.marksObtained
                                }{" "}
                                /{" "}
                                {
                                    selectedResult.totalMarks
                                }
                            </strong>

                        </div>

                        <div className="candidate-stat-card">

                            <span>
                                Percentage
                            </span>

                            <strong>
                                {
                                    selectedResult.percentage
                                }%
                            </strong>

                        </div>

                        <div className="candidate-stat-card">

                            <span>
                                Attempted
                            </span>

                            <strong>
                                {
                                    selectedResult.attemptedQuestions
                                }{" "}
                                /{" "}
                                {
                                    selectedResult.totalQuestions
                                }
                            </strong>

                        </div>

                        <div className="candidate-stat-card">

                            <span>
                                Solved
                            </span>

                            <strong>
                                {
                                    selectedResult.solvedQuestions
                                }{" "}
                                /{" "}
                                {
                                    selectedResult.totalQuestions
                                }
                            </strong>

                        </div>

                    </div>

                    {/* Assessment Information */}

                    <div className="detail-card">

                        <div className="detail-card-heading">

                            <div>

                                <span className="detail-section-icon">
                                    ◈
                                </span>

                                <div>
                                    <h3>
                                        Assessment Information
                                    </h3>

                                    <p>
                                        Basic assessment and
                                        candidate timeline.
                                    </p>
                                </div>

                            </div>

                        </div>

                        <div className="detail-info-grid">

                            <div>

                                <span>
                                    Company
                                </span>

                                <strong>
                                    {
                                        selectedResult.companyName
                                    }
                                </strong>

                            </div>

                            <div>

                                <span>
                                    Company Email
                                </span>

                                <strong>
                                    {
                                        selectedResult.companyEmail
                                    }
                                </strong>

                            </div>

                            <div>

                                <span>
                                    Position
                                </span>

                                <strong>
                                    {
                                        selectedResult.position
                                    }
                                </strong>

                            </div>

                            <div>

                                <span>
                                    Invited At
                                </span>

                                <strong>
                                    {formatDate(
                                        selectedResult.invitedAt
                                    )}
                                </strong>

                            </div>

                            <div>

                                <span>
                                    Started At
                                </span>

                                <strong>
                                    {formatDate(
                                        selectedResult.startedAt
                                    )}
                                </strong>

                            </div>

                            <div>

                                <span>
                                    Submitted At
                                </span>

                                <strong>
                                    {formatDate(
                                        selectedResult.submittedAt
                                    )}
                                </strong>

                            </div>

                        </div>

                    </div>

                    {/* =====================================================
                        PROCTORING INFORMATION
                    ===================================================== */}

                    <div className="detail-card">

                        <div className="detail-card-heading">

                            <div>

                                <span className="detail-section-icon warning">
                                    ⚠
                                </span>

                                <div>

                                    <h3>
                                        Proctoring Information
                                    </h3>

                                    <p>
                                        Security configuration and
                                        recorded assessment warnings.
                                    </p>

                                </div>

                            </div>

                        </div>

                        <div className="proctoring-grid">

                            {/* WARNINGS */}

                            <div className="proctoring-item">

                                <span className="proctoring-icon warning">
                                    ⚠️
                                </span>

                                <div>

                                    <small>
                                        Warnings
                                    </small>

                                    <strong>
                                        {
                                            selectedResult.warningCount ??
                                            0
                                        }
                                    </strong>

                                </div>

                            </div>

                            {/* CAMERA */}

                            <div className="proctoring-item">

                                <span className="proctoring-icon">
                                    📷
                                </span>

                                <div>

                                    <small>
                                        Camera
                                    </small>

                                    <strong>
                                        {
                                            selectedResult.cameraRequired
                                                ? "Enabled"
                                                : "Not Required"
                                        }
                                    </strong>

                                </div>

                            </div>

                            {/* MICROPHONE */}

                            <div className="proctoring-item">

                                <span className="proctoring-icon">
                                    🎤
                                </span>

                                <div>

                                    <small>
                                        Microphone
                                    </small>

                                    <strong>
                                        {
                                            selectedResult.microphoneRequired
                                                ? "Enabled"
                                                : "Not Required"
                                        }
                                    </strong>

                                </div>

                            </div>

                            {/* FULLSCREEN */}

                            <div className="proctoring-item">

                                <span className="proctoring-icon">
                                    ⛶
                                </span>

                                <div>

                                    <small>
                                        Fullscreen
                                    </small>

                                    <strong>
                                        {
                                            selectedResult.fullscreenRequired
                                                ? "Enabled"
                                                : "Not Required"
                                        }
                                    </strong>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* =====================================================
                        QUESTION RESULTS
                    ===================================================== */}

                    <div className="detail-card">

                        <div className="questions-heading">

                            <div>

                                <h3>
                                    Question Results
                                </h3>

                                <p>
                                    Detailed evaluation of
                                    each coding problem.
                                </p>

                            </div>

                            <span className="question-total-badge">
                                {
                                    selectedResult.questions?.length ||
                                    0
                                }{" "}
                                Questions
                            </span>

                        </div>

                        <div className="host-question-list">

                            {selectedResult.questions?.length ? (

                                selectedResult.questions.map(
                                    (question) => (

                                        <div
                                            className="host-question-card"
                                            key={
                                                question.assignmentProblemId
                                            }
                                        >

                                            <div className="question-card-header">

                                                <div className="question-title-area">

                                                    <span className="question-number">
                                                        Question{" "}
                                                        {
                                                            question.questionOrder
                                                        }
                                                    </span>

                                                    <h4>
                                                        {
                                                            question.title
                                                        }
                                                    </h4>

                                                    <div className="question-meta">

                                                        <span>
                                                            {
                                                                question.difficulty
                                                            }
                                                        </span>

                                                        <span>
                                                            {
                                                                question.category
                                                            }
                                                        </span>

                                                        <span>
                                                            {
                                                                question.language ||
                                                                "Not submitted"
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                                <div className="question-score">

                                                    <strong>
                                                        {
                                                            question.marksObtained
                                                        }
                                                    </strong>

                                                    <span>
                                                        {" / "}
                                                        {
                                                            question.totalMarks
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                            <div className="question-result-row">

                                                <span
                                                    className={`question-status ${getQuestionStatusClass(
                                                        question.status
                                                    )}`}
                                                >
                                                    {
                                                        question.status
                                                    }
                                                </span>

                                                <span className="testcase-count">

                                                    Tests Passed:{" "}

                                                    <strong>
                                                        {
                                                            question.passedTestCases ??
                                                            0
                                                        }
                                                    </strong>

                                                    {" / "}

                                                    {
                                                        question.totalTestCases ??
                                                        0
                                                    }

                                                </span>

                                            </div>

                                            {question.code && (

                                                <div className="submitted-code-section">

                                                    <div className="code-header">

                                                        <span>
                                                            Submitted Code
                                                        </span>

                                                        <span>
                                                            {
                                                                question.language
                                                            }
                                                        </span>

                                                    </div>

                                                    <pre>
                                                        <code>
                                                            {
                                                                question.code
                                                            }
                                                        </code>
                                                    </pre>

                                                </div>

                                            )}

                                        </div>

                                    )
                                )

                            ) : (

                                <div className="no-question-results">

                                    <div>
                                        📝
                                    </div>

                                    <h4>
                                        No question results available
                                    </h4>

                                    <p>
                                        No question-level submission
                                        data is available for this
                                        candidate.
                                    </p>

                                </div>

                            )}

                        </div>

                    </div>

                </div>
            )}

            {/* =====================================================
                DETAIL LOADING
            ===================================================== */}

            {detailLoading && (

                <div className="detail-loading-overlay">

                    <div className="detail-loading-box">

                        <div className="results-spinner"></div>

                        <p>
                            Loading candidate result...
                        </p>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AssessmentResults;