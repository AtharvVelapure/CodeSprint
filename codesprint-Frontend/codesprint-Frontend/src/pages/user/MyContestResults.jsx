import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MyContestResults.css";

const API_URL = "/api/contests";

function MyContestResults() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [results, setResults] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Selected contest
    const [selectedContest, setSelectedContest] = useState(null);

    // Problem results
    const [problemResults, setProblemResults] = useState([]);
    const [problemLoading, setProblemLoading] = useState(false);
    const [problemError, setProblemError] = useState("");

    // Code viewer
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    const [submissionsError, setSubmissionsError] = useState("");

    // Open submission
    const [openSubmissionId, setOpenSubmissionId] = useState(null);

    // =========================================
    // LOAD USER
    // =========================================

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            navigate("/login");
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
        } catch (err) {
            console.error("Invalid user data:", err);
            localStorage.removeItem("user");
            navigate("/login");
        }
    }, [navigate]);

    // =========================================
    // LOAD CONTEST RESULTS
    // =========================================

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        const fetchResults = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axios.get(
                    `${API_URL}/user/${user.id}/results`
                );

                setResults(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );
            } catch (err) {
                console.error(
                    "Error loading contest results:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    "Unable to load contest results."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [user]);

    // =========================================
    // LOAD PROBLEM RESULTS
    // =========================================

    const loadProblemResults = async (contestId) => {
        if (!user?.id || !contestId) {
            return;
        }

        try {
            setProblemLoading(true);
            setProblemError("");
            setProblemResults([]);

            const response = await axios.get(
                `${API_URL}/${contestId}/user/${user.id}/problem-results`
            );

            setProblemResults(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (err) {
            console.error(
                "Error loading problem results:",
                err
            );

            setProblemError(
                err.response?.data?.message ||
                "Unable to load problem results."
            );
        } finally {
            setProblemLoading(false);
        }
    };

    // =========================================
    // OPEN CONTEST DETAILS
    // =========================================

    const handleViewDetails = (contest) => {
        setSelectedContest(contest);

        setSelectedProblem(null);
        setSubmissions([]);
        setSubmissionsError("");
        setOpenSubmissionId(null);

        loadProblemResults(contest.contestId);

        setTimeout(() => {
            document
                .querySelector(".contest-detail-section")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
        }, 100);
    };

    // =========================================
    // CLOSE CONTEST DETAILS
    // =========================================

    const handleCloseDetails = () => {
        setSelectedContest(null);
        setProblemResults([]);

        setSelectedProblem(null);
        setSubmissions([]);
        setSubmissionsError("");
        setOpenSubmissionId(null);
    };

    // =========================================
    // VIEW PROBLEM
    // =========================================

    const handleViewProblem = (problemId) => {
        if (!problemId) {
            return;
        }

        navigate(`/user/problems/${problemId}`);
    };

    // =========================================
    // LOAD SUBMISSIONS
    // =========================================

    const loadSubmissions = async (problem) => {
        if (
            !selectedContest ||
            !user?.id ||
            !problem?.problemId
        ) {
            return;
        }

        try {
            setSelectedProblem(problem);
            setSubmissionsLoading(true);
            setSubmissionsError("");
            setSubmissions([]);
            setOpenSubmissionId(null);

            const response = await axios.get(
                `${API_URL}/${selectedContest.contestId}/user/${user.id}/problem/${problem.problemId}/submissions`
            );

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            setSubmissions(data);

            // Automatically open latest submission
            if (data.length > 0) {
                setOpenSubmissionId(data[0].id);
            }
        } catch (err) {
            console.error(
                "Error loading submissions:",
                err
            );

            setSubmissionsError(
                err.response?.data?.message ||
                "Unable to load submitted code."
            );
        } finally {
            setSubmissionsLoading(false);
        }
    };

    // =========================================
    // CLOSE CODE VIEWER
    // =========================================

    const closeCodeViewer = () => {
        setSelectedProblem(null);
        setSubmissions([]);
        setSubmissionsError("");
        setOpenSubmissionId(null);
    };

    // =========================================
    // FILTER RESULTS
    // =========================================

    const filteredResults = useMemo(() => {
        return results.filter((result) => {
            const contestTitle =
                result.contestTitle || "";

            const status =
                result.status || "";

            const matchesSearch =
                contestTitle
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "ALL" ||
                status.toUpperCase() === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [results, search, statusFilter]);

    // =========================================
    // STATISTICS
    // =========================================

    const statistics = useMemo(() => {
        const totalContests = results.length;

        const completedContests =
            results.filter(
                (result) =>
                    (result.status || "")
                        .toUpperCase() === "FINISHED"
            ).length;

        const totalSolved =
            results.reduce(
                (total, result) =>
                    total +
                    Number(
                        result.problemsSolved || 0
                    ),
                0
            );

        const totalSubmissions =
            results.reduce(
                (total, result) =>
                    total +
                    Number(
                        result.totalSubmissions || 0
                    ),
                0
            );

        const totalScore =
            results.reduce(
                (total, result) =>
                    total +
                    Number(result.score || 0),
                0
            );

        return {
            totalContests,
            completedContests,
            totalSolved,
            totalSubmissions,
            totalScore
        };
    }, [results]);

    // =========================================
    // CONTEST STATUS CLASS
    // =========================================

    const getStatusClass = (status) => {
        switch ((status || "").toUpperCase()) {
            case "FINISHED":
                return "status-completed";

            case "LIVE":
                return "status-active";

            case "UPCOMING":
                return "status-upcoming";

            default:
                return "status-default";
        }
    };

    // =========================================
    // PROBLEM STATUS
    // =========================================

    const getProblemStatus = (problem) => {
        if (problem.solved) {
            return {
                text: "Solved",
                className: "problem-solved",
                icon: "✓"
            };
        }

        const status =
            (problem.status || "").toLowerCase();

        if (
            status.includes("wrong") ||
            status.includes("error") ||
            status.includes("failed")
        ) {
            return {
                text: "Not Solved",
                className: "problem-failed",
                icon: "✕"
            };
        }

        if (
            problem.submissionCount &&
            problem.submissionCount > 0
        ) {
            return {
                text: "Attempted",
                className: "problem-attempted",
                icon: "!"
            };
        }

        return {
            text: "Not Attempted",
            className: "problem-not-attempted",
            icon: "○"
        };
    };

    // =========================================
    // SUBMISSION STATUS CLASS
    // =========================================

    const getSubmissionStatusClass = (status) => {
        const value =
            (status || "").toLowerCase();

        if (
            value.includes("accepted") ||
            value.includes("success")
        ) {
            return "submission-accepted";
        }

        if (value.includes("wrong")) {
            return "submission-wrong";
        }

        if (
            value.includes("runtime") ||
            value.includes("error")
        ) {
            return "submission-error";
        }

        return "submission-default";
    };

    // =========================================
    // FORMAT DATE
    // =========================================

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        try {
            return new Date(date).toLocaleString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );
        } catch (err) {
            return date;
        }
    };

    // =========================================
    // LOGOUT
    // =========================================

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    // =========================================
    // LOADING
    // =========================================

    if (loading) {
        return (
            <div className="contest-results-page">
                <div className="results-loading">
                    <div className="loading-spinner"></div>

                    <p>
                        Loading your contest results...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="contest-results-page">

            {/* =========================================
                NAVBAR
            ========================================= */}

            <nav className="results-navbar">

                <div
                    className="results-logo"
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    <span className="logo-icon">
                        ⚡
                    </span>

                    <span>
                        CodeSprint
                    </span>
                </div>

                <div className="results-nav-right">

                    <button
                        type="button"
                        className="nav-profile-button"
                        onClick={() =>
                            navigate("/user/profile")
                        }
                    >
                        👤 {user?.name || "Profile"}
                    </button>

                    <button
                        type="button"
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </nav>

            {/* =========================================
                MAIN
            ========================================= */}

            <main className="results-main">

                {/* HEADER */}

                <div className="results-header">

                    <button
                        type="button"
                        className="back-button"
                        onClick={() =>
                            navigate("/user/contests")
                        }
                    >
                        ← Back to Contests
                    </button>

                    <h1>
                        🏆 My Contest Results
                    </h1>

                    <p>
                        View your performance
                        across all contests.
                    </p>

                </div>

                {/* ERROR */}

                {error && (
                    <div className="results-error">

                        <span>⚠️</span>

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

                {/* =========================================
                    STATISTICS
                ========================================= */}

                <div className="results-stats">

                    <div className="stat-card">
                        <div className="stat-icon">
                            🏆
                        </div>

                        <div>
                            <span className="stat-label">
                                Contests
                            </span>

                            <strong>
                                {statistics.totalContests}
                            </strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            ✅
                        </div>

                        <div>
                            <span className="stat-label">
                                Completed
                            </span>

                            <strong>
                                {statistics.completedContests}
                            </strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            🎯
                        </div>

                        <div>
                            <span className="stat-label">
                                Problems Solved
                            </span>

                            <strong>
                                {statistics.totalSolved}
                            </strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            ⭐
                        </div>

                        <div>
                            <span className="stat-label">
                                Total Score
                            </span>

                            <strong>
                                {statistics.totalScore}
                            </strong>
                        </div>
                    </div>

                </div>

                {/* =========================================
                    FILTERS
                ========================================= */}

                <div className="results-toolbar">

                    <div className="search-box">

                        <span>🔍</span>

                        <input
                            type="text"
                            placeholder="Search contests..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>

                    <div className="status-filters">

                        <button
                            type="button"
                            className={
                                statusFilter === "ALL"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setStatusFilter("ALL")
                            }
                        >
                            All
                        </button>

                        <button
                            type="button"
                            className={
                                statusFilter === "FINISHED"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setStatusFilter(
                                    "FINISHED"
                                )
                            }
                        >
                            Finished
                        </button>

                        <button
                            type="button"
                            className={
                                statusFilter === "LIVE"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setStatusFilter(
                                    "LIVE"
                                )
                            }
                        >
                            Live
                        </button>

                    </div>

                </div>

                {/* =========================================
                    CONTEST HISTORY
                ========================================= */}

                <div className="results-section">

                    <div className="results-section-header">

                        <div>
                            <h2>
                                Contest History
                            </h2>

                            <span>
                                {filteredResults.length}{" "}
                                result
                                {filteredResults.length !== 1
                                    ? "s"
                                    : ""}
                            </span>
                        </div>

                    </div>

                    {filteredResults.length === 0 ? (

                        <div className="results-empty">

                            <div className="empty-icon">
                                🏆
                            </div>

                            <h3>
                                No contest results found
                            </h3>

                            <p>
                                {results.length === 0
                                    ? "You haven't participated in any contests yet."
                                    : "No contests match your current search or filter."}
                            </p>

                            {results.length === 0 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/user/contests"
                                        )
                                    }
                                >
                                    Browse Contests
                                </button>
                            )}

                        </div>

                    ) : (

                        <div className="results-table-wrapper">

                            <table className="results-table">

                                <thead>
                                    <tr>
                                        <th>Contest</th>
                                        <th>Status</th>
                                        <th>Score</th>
                                        <th>Rank</th>
                                        <th>Solved</th>
                                        <th>Submissions</th>
                                        <th>Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {filteredResults.map(
                                        (result, index) => (

                                            <tr
                                                key={
                                                    result.contestId ??
                                                    index
                                                }
                                            >

                                                <td>
                                                    <div className="contest-name">

                                                        <div className="contest-icon">
                                                            🏆
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    result.contestTitle ||
                                                                    "Untitled Contest"
                                                                }
                                                            </strong>

                                                            <span>
                                                                Contest #
                                                                {
                                                                    result.contestId
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`status-badge ${getStatusClass(
                                                            result.status
                                                        )}`}
                                                    >
                                                        {
                                                            result.status ||
                                                            "-"
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="score-value">
                                                        {
                                                            result.score ??
                                                            0
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="rank-value">
                                                        {result.rank &&
                                                        result.rank > 0
                                                            ? `#${result.rank}`
                                                            : "-"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="solved-value">
                                                        {
                                                            result.problemsSolved ??
                                                            0
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {
                                                        result.totalSubmissions ??
                                                        0
                                                    }
                                                </td>

                                                <td>
                                                    <span className="date-value">
                                                        {formatDate(
                                                            result.startTime
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="view-details-button"
                                                        onClick={() =>
                                                            handleViewDetails(
                                                                result
                                                            )
                                                        }
                                                    >
                                                        View Details
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

                {/* =========================================
                    CONTEST DETAIL
                ========================================= */}

                {selectedContest && (

                    <div className="contest-detail-section">

                        {/* DETAIL HEADER */}

                        <div className="detail-header">

                            <div className="detail-title-row">

                                <div className="detail-contest-icon">
                                    🏆
                                </div>

                                <div>
                                    <h2>
                                        {
                                            selectedContest.contestTitle
                                        }
                                    </h2>

                                    <span>
                                        Contest #
                                        {
                                            selectedContest.contestId
                                        }
                                    </span>
                                </div>

                            </div>

                            <div className="detail-header-actions">

                                <button
                                    type="button"
                                    className="view-details-button"
                                    onClick={() =>
                                        navigate(
                                            `/user/contests/${selectedContest.contestId}/leaderboard`
                                        )
                                    }
                                >
                                    🏆 Leaderboard
                                </button>

                                <button
                                    type="button"
                                    className="close-details-button"
                                    onClick={handleCloseDetails}
                                >
                                    ✕
                                </button>

                            </div>

                        </div>

                        {/* DETAIL SUMMARY */}

                        <div className="detail-summary">

                            <div className="detail-summary-card">
                                <span>Score</span>

                                <strong>
                                    {
                                        selectedContest.score ??
                                        0
                                    }
                                </strong>
                            </div>

                            <div className="detail-summary-card">
                                <span>Rank</span>

                                <strong>
                                    {selectedContest.rank &&
                                    selectedContest.rank > 0
                                        ? `#${selectedContest.rank}`
                                        : "-"}
                                </strong>
                            </div>

                            <div className="detail-summary-card">
                                <span>Problems Solved</span>

                                <strong>
                                    {
                                        selectedContest.problemsSolved ??
                                        0
                                    }
                                </strong>
                            </div>

                            <div className="detail-summary-card">
                                <span>Submissions</span>

                                <strong>
                                    {
                                        selectedContest.totalSubmissions ??
                                        0
                                    }
                                </strong>
                            </div>

                        </div>

                        {/* =========================================
                            PROBLEM RESULTS
                        ========================================= */}

                        <div className="problem-results-container">

                            <div className="problem-results-header">

                                <div>
                                    <h3>
                                        Problem Results
                                    </h3>

                                    <p>
                                        Your performance on
                                        each contest problem.
                                    </p>
                                </div>

                            </div>

                            {problemLoading ? (

                                <div className="problem-loading">

                                    <div className="loading-spinner"></div>

                                    <p>
                                        Loading problem results...
                                    </p>

                                </div>

                            ) : problemError ? (

                                <div className="problem-error">

                                    <span>⚠️</span>

                                    <p>
                                        {problemError}
                                    </p>

                                </div>

                            ) : problemResults.length === 0 ? (

                                <div className="no-problem-results">

                                    <div>📋</div>

                                    <h4>
                                        No problem results
                                    </h4>

                                    <p>
                                        No problems were found
                                        for this contest.
                                    </p>

                                </div>

                            ) : (

                                <div className="problem-list">

                                    {problemResults.map(
                                        (problem, index) => {

                                            const problemStatus =
                                                getProblemStatus(
                                                    problem
                                                );

                                            return (

                                                <div
                                                    className="problem-result-card"
                                                    key={
                                                        problem.problemId ??
                                                        index
                                                    }
                                                >

                                                    <div className="problem-number">
                                                        {
                                                            problem.problemOrder ||
                                                            index + 1
                                                        }
                                                    </div>

                                                    <div className="problem-info">

                                                        <h4>
                                                            {
                                                                problem.problemTitle ||
                                                                "Untitled Problem"
                                                            }
                                                        </h4>

                                                        <div className="problem-meta">

                                                            <span>
                                                                {
                                                                    problem.points ??
                                                                    0
                                                                }{" "}
                                                                points
                                                            </span>

                                                            <span>
                                                                {
                                                                    problem.submissionCount ??
                                                                    0
                                                                }{" "}
                                                                submission
                                                                {
                                                                    problem.submissionCount !==
                                                                    1
                                                                        ? "s"
                                                                        : ""
                                                                }
                                                            </span>

                                                            {problem.timeTaken && (
                                                                <span>
                                                                    ⏱{" "}
                                                                    {
                                                                        problem.timeTaken
                                                                    }
                                                                </span>
                                                            )}

                                                        </div>

                                                    </div>

                                                    {/* PROBLEM ACTIONS */}

                                                    <div className="problem-actions">

                                                        <div
                                                            className={`problem-status ${problemStatus.className}`}
                                                        >
                                                            <span>
                                                                {
                                                                    problemStatus.icon
                                                                }
                                                            </span>

                                                            {
                                                                problemStatus.text
                                                            }
                                                        </div>

                                                        {/* VIEW PROBLEM */}

                                                        <button
                                                            type="button"
                                                            className="view-problem-button"
                                                            onClick={() =>
                                                                handleViewProblem(
                                                                    problem.problemId
                                                                )
                                                            }
                                                        >
                                                            📖 View Problem
                                                        </button>

                                                        {/* VIEW CODE */}

                                                        {problem.submissionCount >
                                                            0 && (

                                                            <button
                                                                type="button"
                                                                className="view-code-button"
                                                                onClick={() =>
                                                                    loadSubmissions(
                                                                        problem
                                                                    )
                                                                }
                                                            >
                                                                💻 View Code
                                                            </button>

                                                        )}

                                                    </div>

                                                </div>

                                            );
                                        }
                                    )}

                                </div>

                            )}

                        </div>

                        {/* =========================================
                            CODE VIEWER
                        ========================================= */}

                        {selectedProblem && (

                            <div className="code-viewer-section">

                                <div className="code-viewer-header">

                                    <div className="code-title-row">

                                        <span className="code-icon">
                                            💻
                                        </span>

                                        <div>
                                            <h3>
                                                {
                                                    selectedProblem.problemTitle
                                                }
                                            </h3>

                                            <p>
                                                Submitted Code
                                            </p>
                                        </div>

                                    </div>

                                    <button
                                        type="button"
                                        className="close-code-button"
                                        onClick={
                                            closeCodeViewer
                                        }
                                    >
                                        ✕
                                    </button>

                                </div>

                                {submissionsLoading ? (

                                    <div className="code-loading">

                                        <div className="loading-spinner"></div>

                                        <p>
                                            Loading submitted
                                            code...
                                        </p>

                                    </div>

                                ) : submissionsError ? (

                                    <div className="code-error">

                                        <span>⚠️</span>

                                        <p>
                                            {
                                                submissionsError
                                            }
                                        </p>

                                    </div>

                                ) : submissions.length === 0 ? (

                                    <div className="no-submissions">

                                        <div>📝</div>

                                        <h4>
                                            No submissions found
                                        </h4>

                                        <p>
                                            No code submissions
                                            were found for this
                                            problem.
                                        </p>

                                    </div>

                                ) : (

                                    <div className="submissions-list">

                                        <div className="submissions-count">
                                            {
                                                submissions.length
                                            }{" "}
                                            submission
                                            {
                                                submissions.length !==
                                                1
                                                    ? "s"
                                                    : ""}
                                        </div>

                                        {submissions.map(
                                            (
                                                submission,
                                                index
                                            ) => {

                                                const isOpen =
                                                    openSubmissionId ===
                                                    submission.id;

                                                return (

                                                    <div
                                                        className="submission-item"
                                                        key={
                                                            submission.id ??
                                                            index
                                                        }
                                                    >

                                                        <button
                                                            type="button"
                                                            className="submission-header"
                                                            onClick={() =>
                                                                setOpenSubmissionId(
                                                                    isOpen
                                                                        ? null
                                                                        : submission.id
                                                                )
                                                            }
                                                        >

                                                            <div className="submission-left">

                                                                <span className="submission-number">
                                                                    #
                                                                    {
                                                                        submissions.length -
                                                                        index
                                                                    }
                                                                </span>

                                                                <div>

                                                                    <strong>
                                                                        {
                                                                            submission.language ||
                                                                            "Unknown"
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            formatDate(
                                                                                submission.submittedAt
                                                                            )
                                                                        }
                                                                    </span>

                                                                </div>

                                                            </div>

                                                            <div className="submission-right">

                                                                <span
                                                                    className={`submission-status ${getSubmissionStatusClass(
                                                                        submission.status
                                                                    )}`}
                                                                >
                                                                    {
                                                                        submission.status ||
                                                                        "-"
                                                                    }
                                                                </span>

                                                                <span className="submission-chevron">
                                                                    {isOpen
                                                                        ? "▲"
                                                                        : "▼"}
                                                                </span>

                                                            </div>

                                                        </button>

                                                        {isOpen && (

                                                            <div className="code-container">

                                                                <div className="code-toolbar">

                                                                    <span>
                                                                        {
                                                                            submission.language ||
                                                                            "Code"
                                                                        }
                                                                    </span>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            navigator.clipboard
                                                                                ?.writeText(
                                                                                    submission.code ||
                                                                                    ""
                                                                                )
                                                                        }
                                                                    >
                                                                        📋 Copy
                                                                    </button>

                                                                </div>

                                                                <pre>
                                                                    <code>
                                                                        {
                                                                            submission.code ||
                                                                            "// No code available"
                                                                        }
                                                                    </code>
                                                                </pre>

                                                            </div>

                                                        )}

                                                    </div>

                                                );
                                            }
                                        )}

                                    </div>

                                )}

                            </div>

                        )}

                    </div>

                )}

            </main>

        </div>
    );
}

export default MyContestResults;