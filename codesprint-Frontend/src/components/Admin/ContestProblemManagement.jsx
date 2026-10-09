import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ContestProblemManagement.css";

const PROBLEM_API = "/api/problems";
const CONTEST_API = "/api/contests";

function ContestProblemManagement() {

    const navigate = useNavigate();
    const { contestId } = useParams();

    const [contest, setContest] = useState(null);
    const [problems, setProblems] = useState([]);
    const [contestProblems, setContestProblems] = useState([]);

    const [selectedProblem, setSelectedProblem] = useState("");
    const [problemOrder, setProblemOrder] = useState("");
    const [points, setPoints] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    /* =========================================================
       LOAD PAGE DATA
    ========================================================= */

    useEffect(() => {

        if (!contestId) {
            navigate("/admin/contests");
            return;
        }

        loadData();

    }, [contestId, navigate]);


    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                contestResponse,
                problemsResponse,
                contestProblemsResponse
            ] = await Promise.all([
                fetch(`${CONTEST_API}/${contestId}`),
                fetch(PROBLEM_API),
                fetch(`${CONTEST_API}/${contestId}/problems`)
            ]);

            if (!contestResponse.ok) {
                throw new Error(
                    "Failed to load contest details."
                );
            }

            if (!problemsResponse.ok) {
                throw new Error(
                    "Failed to load problems."
                );
            }

            if (!contestProblemsResponse.ok) {
                throw new Error(
                    "Failed to load contest problems."
                );
            }

            const contestData =
                await contestResponse.json();

            const problemsData =
                await problemsResponse.json();

            const contestProblemsData =
                await contestProblemsResponse.json();

            setContest(contestData);

            setProblems(
                Array.isArray(problemsData)
                    ? problemsData
                    : []
            );

            setContestProblems(
                Array.isArray(contestProblemsData)
                    ? contestProblemsData
                    : []
            );

        } catch (err) {

            console.error(
                "Contest problem management load error:",
                err
            );

            setError(
                err.message ||
                "Unable to load contest problem data."
            );

        } finally {

            setLoading(false);
        }
    };


    /* =========================================================
       AVAILABLE PROBLEMS
    ========================================================= */

    const assignedProblemIds = useMemo(() => {

        return new Set(
            contestProblems
                .map(
                    item =>
                        item.problem?.id ??
                        item.problemId
                )
                .filter(
                    value =>
                        value !== null &&
                        value !== undefined
                )
                .map(Number)
        );

    }, [contestProblems]);


    const availableProblems =
        problems.filter(
            problem =>
                !assignedProblemIds.has(
                    Number(problem.id)
                )
        );


    /* =========================================================
       HELPERS
    ========================================================= */

    const getNextOrder = () => {

        if (contestProblems.length === 0) {
            return 1;
        }

        const orders =
            contestProblems
                .map(
                    item =>
                        Number(item.problemOrder)
                )
                .filter(
                    order =>
                        Number.isFinite(order) &&
                        order > 0
                );

        if (orders.length === 0) {
            return 1;
        }

        return Math.max(...orders) + 1;
    };


    const getProblemTitle = (contestProblem) => {

        return (
            contestProblem.problem?.title ||
            contestProblem.problemTitle ||
            `Problem #${
                contestProblem.problem?.id ??
                contestProblem.problemId ??
                "—"
            }`
        );
    };


    const getProblemDifficulty = (
        contestProblem
    ) => {

        return (
            contestProblem.problem?.difficulty ||
            contestProblem.difficulty ||
            "Unknown"
        );
    };


    const getProblemCategory = (
        contestProblem
    ) => {

        return (
            contestProblem.problem?.category ||
            contestProblem.category ||
            "General"
        );
    };


    const getDifficultyClass = (
        difficulty
    ) => {

        switch (
            String(difficulty || "")
                .toLowerCase()
        ) {

            case "easy":
                return "difficulty easy";

            case "medium":
                return "difficulty medium";

            case "hard":
                return "difficulty hard";

            default:
                return "difficulty";
        }
    };


    const formatDate = (value) => {

        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "—";
        }

        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };


    const getStatusClass = (status) => {

        switch (status) {

            case "DRAFT":
                return "contest-status draft";

            case "UPCOMING":
                return "contest-status upcoming";

            case "LIVE":
                return "contest-status live";

            case "FINISHED":
                return "contest-status finished";

            case "CANCELLED":
                return "contest-status cancelled";

            default:
                return "contest-status";
        }
    };


    const totalPoints =
        contestProblems.reduce(
            (total, item) =>
                total +
                Number(item.points || 0),
            0
        );


    /* =========================================================
       PROBLEM CHANGE
    ========================================================= */

    const handleProblemChange = (event) => {

        const problemId =
            event.target.value;

        setSelectedProblem(problemId);
        setMessage("");
        setError("");

        const problem =
            problems.find(
                item =>
                    String(item.id) ===
                    String(problemId)
            );

        if (problem) {

            if (
                problem.difficulty
                    ?.toLowerCase() ===
                "easy"
            ) {

                setPoints("100");

            } else if (
                problem.difficulty
                    ?.toLowerCase() ===
                "medium"
            ) {

                setPoints("200");

            } else if (
                problem.difficulty
                    ?.toLowerCase() ===
                "hard"
            ) {

                setPoints("300");

            } else {

                setPoints("100");
            }
        }
    };


    /* =========================================================
       ADD PROBLEM
    ========================================================= */

    const handleAddProblem = async (
        event
    ) => {

        event.preventDefault();

        setMessage("");
        setError("");

        if (!selectedProblem) {

            setError(
                "Please select a problem."
            );

            return;
        }

        if (
            !problemOrder ||
            Number(problemOrder) <= 0
        ) {

            setError(
                "Problem order must be greater than 0."
            );

            return;
        }

        if (
            !points ||
            Number(points) <= 0
        ) {

            setError(
                "Points must be greater than 0."
            );

            return;
        }

        const duplicate =
            contestProblems.some(
                item =>
                    Number(
                        item.problem?.id ??
                        item.problemId
                    ) ===
                    Number(selectedProblem)
            );

        if (duplicate) {

            setError(
                "This problem is already added to the contest."
            );

            return;
        }

        try {

            setSaving(true);

            const response =
                await fetch(
                    `${CONTEST_API}/${contestId}/problems` +
                    `?problemId=${selectedProblem}` +
                    `&problemOrder=${problemOrder}` +
                    `&points=${points}`,
                    {
                        method: "POST"
                    }
                );

            if (!response.ok) {

                const responseText =
                    await response.text();

                throw new Error(
                    responseText ||
                    "Failed to add problem."
                );
            }

            setMessage(
                "Problem added successfully."
            );

            setSelectedProblem("");
            setProblemOrder("");
            setPoints("");

            await loadData();

        } catch (err) {

            console.error(
                "Add contest problem error:",
                err
            );

            setError(
                err.message ||
                "Unable to add the problem."
            );

        } finally {

            setSaving(false);
        }
    };


    /* =========================================================
       REMOVE PROBLEM
    ========================================================= */

    const handleRemoveProblem = async (
        contestProblem
    ) => {

        const problemTitle =
            getProblemTitle(
                contestProblem
            );

        const confirmed =
            window.confirm(
                `Remove "${problemTitle}" from this contest?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setMessage("");
            setError("");

            const response =
                await fetch(
                    `${CONTEST_API}/problems/${contestProblem.id}`,
                    {
                        method: "DELETE"
                    }
                );

            if (!response.ok) {

                const responseText =
                    await response.text();

                throw new Error(
                    responseText ||
                    "Failed to remove problem."
                );
            }

            setMessage(
                "Problem removed successfully."
            );

            await loadData();

        } catch (err) {

            console.error(
                "Remove contest problem error:",
                err
            );

            setError(
                err.message ||
                "Unable to remove the problem."
            );
        }
    };


    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {

        return (

            <div className="contest-problem-page">

                <div className="contest-problem-loading">

                    <div className="contest-problem-spinner"></div>

                    <span className="contest-problem-loading-kicker">
                        CONTEST MANAGEMENT
                    </span>

                    <h2>
                        Loading Problem Set
                    </h2>

                    <p>
                        Preparing the contest workspace...
                    </p>

                </div>

            </div>

        );
    }


    /* =========================================================
       ERROR WITHOUT CONTEST
    ========================================================= */

    if (!contest) {

        return (

            <div className="contest-problem-page">

                <button
                    type="button"
                    className="contest-problem-back"
                    onClick={() =>
                        navigate("/admin/contests")
                    }
                >
                    ← Back to Contests
                </button>

                <div className="contest-problem-error-panel">

                    <span className="contest-problem-error-icon">
                        !
                    </span>

                    <div>

                        <strong>
                            Unable to open this contest
                        </strong>

                        <p>
                            {error ||
                                "Contest details could not be loaded."}
                        </p>

                    </div>

                </div>

            </div>

        );
    }


    /* =========================================================
       PAGE
    ========================================================= */

    return (

        <div className="contest-problem-page">

            {/* PAGE HEADER */}

            <header className="contest-problem-page-header">

                <div>

                    <button
                        type="button"
                        className="contest-problem-back"
                        onClick={() =>
                            navigate("/admin/contests")
                        }
                    >
                        ← Back to Contests
                    </button>

                    <span className="contest-problem-eyebrow">
                        CONTEST BUILDER
                    </span>

                    <h1>
                        Manage Contest Problems
                    </h1>

                    <p>
                        Configure the coding problems candidates will solve
                        in this contest.
                    </p>

                </div>


                <div className="contest-problem-header-card">

                    <span>
                        CURRENT CONTEST
                    </span>

                    <strong>
                        {contest.title}
                    </strong>

                    <small>
                        Contest #{contest.id}
                    </small>

                </div>

            </header>


            {/* OVERVIEW */}

            <section className="contest-problem-overview">

                <div className="contest-overview-main">

                    <div className="contest-overview-icon">
                        🏆
                    </div>

                    <div>

                        <span>
                            {contest.description
                                ? "CODING CONTEST"
                                : "CONTEST"}
                        </span>

                        <h2>
                            {contest.title}
                        </h2>

                        <p>
                            {contest.description ||
                                "No contest description provided."}
                        </p>

                    </div>

                </div>


                <div className="contest-overview-stats">

                    <div>
                        <span>Status</span>

                        <strong
                            className={getStatusClass(
                                contest.status
                            )}
                        >
                            {contest.status}
                        </strong>
                    </div>

                    <div>
                        <span>Starts</span>

                        <strong>
                            {formatDate(
                                contest.startTime
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Duration</span>

                        <strong>
                            {contest.durationMinutes
                                ? `${contest.durationMinutes} min`
                                : "—"}
                        </strong>
                    </div>

                </div>

            </section>


            {/* ALERTS */}

            {message && (

                <div className="contest-problem-alert success">

                    <span>✓</span>

                    {message}

                </div>

            )}

            {error && (

                <div className="contest-problem-alert error">

                    <span>!</span>

                    {String(error)}

                </div>

            )}


            {/* SUMMARY STRIP */}

            <section className="contest-problem-summary">

                <div>

                    <span>
                        PROBLEMS
                    </span>

                    <strong>
                        {contestProblems.length}
                    </strong>

                    <small>
                        In this contest
                    </small>

                </div>


                <div>

                    <span>
                        TOTAL POINTS
                    </span>

                    <strong>
                        {totalPoints}
                    </strong>

                    <small>
                        Available score
                    </small>

                </div>


                <div>

                    <span>
                        NEXT ORDER
                    </span>

                    <strong>
                        {getNextOrder()}
                    </strong>

                    <small>
                        Next problem position
                    </small>

                </div>


                <div>

                    <span>
                        AVAILABLE
                    </span>

                    <strong>
                        {availableProblems.length}
                    </strong>

                    <small>
                        Problems to choose
                    </small>

                </div>

            </section>


            {/* CURRENT PROBLEMS */}

            <section className="contest-problem-section">

                <div className="contest-problem-section-header">

                    <div>

                        <span>
                            PROBLEM SET
                        </span>

                        <h2>
                            Contest Problems
                        </h2>

                        <p>
                            These problems will be presented to candidates
                            in the configured order.
                        </p>

                    </div>

                    <span className="problem-count-badge">
                        {contestProblems.length}{" "}
                        {contestProblems.length === 1
                            ? "Problem"
                            : "Problems"}
                    </span>

                </div>


                {contestProblems.length === 0 ? (

                    <div className="contest-problem-empty">

                        <div className="contest-problem-empty-icon">
                            +
                        </div>

                        <h3>
                            No problems added yet
                        </h3>

                        <p>
                            Start building the contest by selecting a coding
                            problem from the section below.
                        </p>

                    </div>

                ) : (

                    <div className="contest-problem-list">

                        {contestProblems
                            .slice()
                            .sort(
                                (a, b) =>
                                    (a.problemOrder || 0) -
                                    (b.problemOrder || 0)
                            )
                            .map(
                                (
                                    contestProblem,
                                    index
                                ) => {

                                    const difficulty =
                                        getProblemDifficulty(
                                            contestProblem
                                        );

                                    return (

                                        <article
                                            className="contest-problem-row"
                                            key={
                                                contestProblem.id
                                            }
                                        >

                                            <div className="problem-order-badge">

                                                <span>
                                                    Q
                                                </span>

                                                <strong>
                                                    {
                                                        contestProblem.problemOrder ||
                                                        index + 1
                                                    }
                                                </strong>

                                            </div>


                                            <div className="problem-row-content">

                                                <div className="problem-row-title">

                                                    <h3>
                                                        {
                                                            getProblemTitle(
                                                                contestProblem
                                                            )
                                                        }
                                                    </h3>

                                                    <span
                                                        className={
                                                            getDifficultyClass(
                                                                difficulty
                                                            )
                                                        }
                                                    >
                                                        {
                                                            difficulty
                                                        }
                                                    </span>

                                                </div>


                                                <div className="problem-row-subtitle">

                                                    {
                                                        getProblemCategory(
                                                            contestProblem
                                                        )
                                                    }

                                                    <span>
                                                        ·
                                                    </span>

                                                    Problem #
                                                    {
                                                        contestProblem.problem?.id ??
                                                        contestProblem.problemId ??
                                                        "—"
                                                    }

                                                </div>


                                                <div className="problem-row-meta">

                                                    <span>
                                                        Order{" "}
                                                        {
                                                            contestProblem.problemOrder ||
                                                            index + 1
                                                        }
                                                    </span>

                                                    <span>
                                                        {
                                                            contestProblem.points ||
                                                            0
                                                        }{" "}
                                                        points
                                                    </span>

                                                </div>

                                            </div>


                                            <div className="problem-row-score">

                                                <strong>
                                                    {
                                                        contestProblem.points ||
                                                        0
                                                    }
                                                </strong>

                                                <span>
                                                    POINTS
                                                </span>

                                            </div>


                                            <button
                                                type="button"
                                                className="remove-problem-btn"
                                                onClick={() =>
                                                    handleRemoveProblem(
                                                        contestProblem
                                                    )
                                                }
                                            >
                                                Remove
                                            </button>

                                        </article>

                                    );
                                }
                            )}

                    </div>

                )}

            </section>


            {/* ADD PROBLEM */}

            <section className="contest-problem-add-section">

                <div className="contest-problem-section-header">

                    <div>

                        <span>
                            BUILD YOUR CONTEST
                        </span>

                        <h2>
                            Add Problem
                        </h2>

                        <p>
                            Select a problem and configure its position and score.
                        </p>

                    </div>

                    <div className="next-problem-chip">
                        NEXT #{getNextOrder()}
                    </div>

                </div>


                <form
                    className="contest-problem-form"
                    onSubmit={handleAddProblem}
                >

                    <div className="contest-problem-form-group full">

                        <label htmlFor="contest-problem-select">
                            Problem
                        </label>

                        <select
                            id="contest-problem-select"
                            value={selectedProblem}
                            onChange={
                                handleProblemChange
                            }
                            disabled={
                                saving ||
                                availableProblems.length === 0
                            }
                        >

                            <option value="">
                                {availableProblems.length === 0
                                    ? "All available problems have been added"
                                    : "Select a coding problem"}
                            </option>

                            {availableProblems.map(
                                problem => (

                                    <option
                                        key={problem.id}
                                        value={problem.id}
                                    >
                                        {problem.title}
                                        {" — "}
                                        {problem.difficulty}
                                    </option>

                                )
                            )}

                        </select>

                        {availableProblems.length === 0 &&
                            !loading && (

                            <small className="contest-problem-field-help">
                                There are no unassigned problems left for this contest.
                            </small>

                        )}

                    </div>


                    <div className="contest-problem-form-row">

                        <div className="contest-problem-form-group">

                            <label htmlFor="problem-order">
                                Problem Order
                            </label>

                            <input
                                id="problem-order"
                                type="number"
                                min="1"
                                value={
                                    problemOrder
                                }
                                placeholder={String(
                                    getNextOrder()
                                )}
                                onChange={event =>
                                    setProblemOrder(
                                        event.target.value
                                    )
                                }
                                disabled={saving}
                            />

                            <small className="contest-problem-field-help">
                                Controls the order candidates see.
                            </small>

                        </div>


                        <div className="contest-problem-form-group">

                            <label htmlFor="problem-points">
                                Points
                            </label>

                            <input
                                id="problem-points"
                                type="number"
                                min="1"
                                value={points}
                                placeholder="100"
                                onChange={event =>
                                    setPoints(
                                        event.target.value
                                    )
                                }
                                disabled={saving}
                            />

                            <small className="contest-problem-field-help">
                                Suggested from problem difficulty.
                            </small>

                        </div>

                    </div>


                    <div className="contest-problem-form-footer">

                        <div className="contest-problem-form-note">

                            <span>
                                i
                            </span>

                            <p>
                                Use a unique order for a clean candidate question sequence.
                            </p>

                        </div>


                        <button
                            type="submit"
                            className="add-problem-btn"
                            disabled={
                                saving ||
                                availableProblems.length === 0
                            }
                        >
                            {saving
                                ? "Adding..."
                                : "+ Add Problem"}
                        </button>

                    </div>

                </form>

            </section>


            {/* BACK */}

            <div className="contest-problem-bottom-nav">

                <button
                    type="button"
                    onClick={() =>
                        navigate("/admin/contests")
                    }
                >
                    ← Back to Contest Management
                </button>

            </div>

        </div>
    );
}

export default ContestProblemManagement;
