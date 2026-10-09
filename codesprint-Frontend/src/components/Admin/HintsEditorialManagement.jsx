import { useEffect, useState } from "react";
import axios from "axios";
import "./HintsEditorialManagement.css";

const PROBLEM_API = "/api/problems";
const HINT_API = "/api/problem-hints";
const EDITORIAL_API = "/api/problem-editorials";

function HintsEditorialManagement() {
    const [problems, setProblems] = useState([]);
    const [selectedProblemId, setSelectedProblemId] = useState("");

    const [hints, setHints] = useState([]);
    const [newHint, setNewHint] = useState("");

    const [editorial, setEditorial] = useState({
        approach: "",
        algorithm: "",
        explanation: "",
        timeComplexity: "",
        spaceComplexity: ""
    });

    const [editorialId, setEditorialId] = useState(null);

    const [loadingProblems, setLoadingProblems] = useState(true);
    const [loadingContent, setLoadingContent] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProblems();
    }, []);

    const emptyEditorial = () => ({
        approach: "",
        algorithm: "",
        explanation: "",
        timeComplexity: "",
        spaceComplexity: ""
    });

    const fetchProblems = async () => {
        try {
            setLoadingProblems(true);

            const response = await axios.get(PROBLEM_API);

            setProblems(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (error) {
            console.error("Error loading problems:", error);
            alert("Unable to load problems.");
        } finally {
            setLoadingProblems(false);
        }
    };

    const handleProblemChange = (event) => {
        const problemId = event.target.value;

        setSelectedProblemId(problemId);

        if (problemId) {
            loadProblemContent(problemId);
        } else {
            resetContent();
        }
    };

    const loadProblemContent = async (problemId) => {
        try {
            setLoadingContent(true);

            // -----------------------------
            // LOAD HINTS
            // -----------------------------
            const hintsResponse = await axios.get(
                `${HINT_API}/problem/${problemId}`
            );

            setHints(
                Array.isArray(hintsResponse.data)
                    ? hintsResponse.data
                    : []
            );

            // -----------------------------
            // LOAD EDITORIAL
            // -----------------------------
            const editorialResponse = await axios.get(
                `${EDITORIAL_API}/problem/${problemId}`
            );

            /*
             * Backend behavior:
             *
             * 200 -> Editorial exists
             * 204 -> Problem exists but no editorial exists yet
             * 404 -> Problem itself does not exist
             */

            if (
                editorialResponse.status === 204 ||
                !editorialResponse.data
            ) {
                setEditorialId(null);
                setEditorial(emptyEditorial());
            } else {
                const data = editorialResponse.data;

                setEditorialId(data.id);

                setEditorial({
                    approach: data.approach || "",
                    algorithm: data.algorithm || "",
                    explanation: data.explanation || "",
                    timeComplexity: data.timeComplexity || "",
                    spaceComplexity: data.spaceComplexity || ""
                });
            }

        } catch (error) {
            console.error(
                "Error loading problem content:",
                error
            );

            const message =
                error.response?.data?.message ||
                "Unable to load hints or editorial.";

            alert(message);

        } finally {
            setLoadingContent(false);
        }
    };

    const resetContent = () => {
        setHints([]);
        setNewHint("");
        setEditorialId(null);
        setEditorial(emptyEditorial());
    };

    // ============================================================
    // HINTS
    // ============================================================

    const handleAddHint = async () => {
        if (!selectedProblemId) {
            alert("Please select a problem first.");
            return;
        }

        if (!newHint.trim()) {
            alert("Please enter a hint.");
            return;
        }

        try {
            const response = await axios.post(
                `${HINT_API}/problem/${selectedProblemId}`,
                {
                    hintOrder: hints.length + 1,
                    hintText: newHint.trim()
                }
            );

            setHints((currentHints) => [
                ...currentHints,
                response.data
            ]);

            setNewHint("");

        } catch (error) {
            console.error("Error adding hint:", error);

            const message =
                error.response?.data?.message ||
                "Failed to add hint.";

            alert(message);
        }
    };

    const handleDeleteHint = async (hintId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this hint?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await axios.delete(
                `${HINT_API}/${hintId}`
            );

            const remainingHints = hints.filter(
                (hint) => hint.id !== hintId
            );

            const reorderedHints = remainingHints.map(
                (hint, index) => ({
                    ...hint,
                    hintOrder: index + 1
                })
            );

            setHints(reorderedHints);

        } catch (error) {
            console.error(
                "Error deleting hint:",
                error
            );

            const message =
                error.response?.data?.message ||
                "Failed to delete hint.";

            alert(message);
        }
    };

    const handleHintChange = (hintId, value) => {
        setHints(
            hints.map((hint) =>
                hint.id === hintId
                    ? {
                        ...hint,
                        hintText: value
                    }
                    : hint
            )
        );
    };

    const handleSaveHint = async (hint) => {
        if (!hint.hintText?.trim()) {
            alert("Hint cannot be empty.");
            return;
        }

        try {
            const response = await axios.put(
                `${HINT_API}/${hint.id}`,
                {
                    hintOrder: hint.hintOrder,
                    hintText: hint.hintText.trim()
                }
            );

            setHints(
                hints.map((currentHint) =>
                    currentHint.id === hint.id
                        ? response.data
                        : currentHint
                )
            );

            alert("Hint updated successfully.");

        } catch (error) {
            console.error(
                "Error updating hint:",
                error
            );

            const message =
                error.response?.data?.message ||
                "Failed to update hint.";

            alert(message);
        }
    };

    // ============================================================
    // EDITORIAL
    // ============================================================

    const handleEditorialChange = (event) => {
        const { name, value } = event.target;

        setEditorial((currentEditorial) => ({
            ...currentEditorial,
            [name]: value
        }));
    };

    const handleSaveEditorial = async () => {
        if (!selectedProblemId) {
            alert("Please select a problem first.");
            return;
        }

        const hasContent =
            editorial.approach.trim() ||
            editorial.algorithm.trim() ||
            editorial.explanation.trim() ||
            editorial.timeComplexity.trim() ||
            editorial.spaceComplexity.trim();

        if (!hasContent) {
            alert("Please enter editorial content.");
            return;
        }

        try {
            setSaving(true);

            /*
             * Backend save endpoint handles both:
             *
             * Create new editorial
             * Update existing editorial
             */
            const response = await axios.post(
                `${EDITORIAL_API}/problem/${selectedProblemId}`,
                editorial
            );

            setEditorialId(response.data.id);

            setEditorial({
                approach: response.data.approach || "",
                algorithm: response.data.algorithm || "",
                explanation: response.data.explanation || "",
                timeComplexity: response.data.timeComplexity || "",
                spaceComplexity: response.data.spaceComplexity || ""
            });

            alert(
                editorialId
                    ? "Editorial updated successfully."
                    : "Editorial saved successfully."
            );

        } catch (error) {
            console.error(
                "Error saving editorial:",
                error
            );

            const message =
                error.response?.data?.message ||
                "Failed to save editorial.";

            alert(message);

        } finally {
            setSaving(false);
        }
    };

    const handleDeleteEditorial = async () => {
        if (!editorialId) {
            return;
        }

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this editorial?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await axios.delete(
                `${EDITORIAL_API}/${editorialId}`
            );

            setEditorialId(null);
            setEditorial(emptyEditorial());

            alert("Editorial deleted successfully.");

        } catch (error) {
            console.error(
                "Error deleting editorial:",
                error
            );

            const message =
                error.response?.data?.message ||
                "Failed to delete editorial.";

            alert(message);
        }
    };

    const selectedProblem = problems.find(
        (problem) =>
            String(problem.id) ===
            String(selectedProblemId)
    );

    return (
        <div className="hints-editorials-page">

            {/* HEADER */}
            <div className="he-page-header">
                <div className="he-title-row">

                    <span className="he-title-icon">
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <line
                                x1="12"
                                y1="1"
                                x2="12"
                                y2="3"
                            />

                            <path d="M12 17v4" />

                            <path d="M9.88 9.88a3 3 0 1 0 4.24 0 5 5 0 0 0-4.24 0z" />
                        </svg>
                    </span>

                    <div>
                        <h1>Hints & Editorials</h1>

                        <p>
                            Manage hints and solution editorials
                            for coding problems.
                        </p>
                    </div>

                </div>
            </div>

            {/* PROBLEM SELECTOR */}
            <div className="he-card problem-selector-card">

                <div className="he-section-header">

                    <div>
                        <h2>Select Problem</h2>

                        <p>
                            Choose a problem to manage its hints
                            and editorial.
                        </p>
                    </div>

                </div>

                <div className="problem-selector">

                    <label>Problem</label>

                    <select
                        value={selectedProblemId}
                        onChange={handleProblemChange}
                        disabled={loadingProblems}
                    >

                        <option value="">
                            {loadingProblems
                                ? "Loading problems..."
                                : "Select a problem"}
                        </option>

                        {problems.map((problem) => (
                            <option
                                key={problem.id}
                                value={problem.id}
                            >
                                #{problem.id} - {problem.title}
                            </option>
                        ))}

                    </select>

                </div>
            </div>

            {/* SELECTED PROBLEM */}
            {selectedProblem && (

                <div className="selected-problem-card">

                    <div>
                        <span className="problem-id">
                            Problem #{selectedProblem.id}
                        </span>

                        <h2>
                            {selectedProblem.title}
                        </h2>
                    </div>

                    <span
                        className={
                            `difficulty-badge ${selectedProblem.difficulty?.toLowerCase()}`
                        }
                    >
                        {selectedProblem.difficulty}
                    </span>

                </div>
            )}

            {/* LOADING */}
            {loadingContent && (
                <div className="he-loading">
                    Loading hints and editorial...
                </div>
            )}

            {selectedProblemId && !loadingContent && (
                <>

                    {/* ================================================= */}
                    {/* HINTS */}
                    {/* ================================================= */}

                    <div className="he-card">

                        <div className="he-section-header">

                            <div>

                                <div className="section-title-row">

                                    <span className="section-icon">
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <line
                                                x1="12"
                                                y1="1"
                                                x2="12"
                                                y2="3"
                                            />

                                            <path d="M12 17v4" />

                                            <path d="M9.88 9.88a3 3 0 1 0 4.24 0 5 5 0 0 0-4.24 0z" />
                                        </svg>
                                    </span>

                                    <h2>Hints</h2>

                                </div>

                                <p>
                                    Provide progressive hints without
                                    revealing the complete solution.
                                </p>

                            </div>

                            <span className="count-badge">
                                {hints.length}{" "}
                                {hints.length === 1
                                    ? "Hint"
                                    : "Hints"}
                            </span>

                        </div>

                        <div className="hints-list">

                            {hints.length === 0 && (

                                <div className="empty-state">

                                    <div className="empty-icon">
                                        💡
                                    </div>

                                    <h3>No hints yet</h3>

                                    <p>
                                        Add the first hint for this
                                        problem below.
                                    </p>

                                </div>
                            )}

                            {hints.map((hint, index) => (

                                <div
                                    className="hint-card"
                                    key={hint.id}
                                >

                                    <div className="hint-card-header">

                                        <span className="hint-number">
                                            Hint {index + 1}
                                        </span>

                                        <button
                                            type="button"
                                            className="danger-button"
                                            onClick={() =>
                                                handleDeleteHint(
                                                    hint.id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                    <textarea
                                        value={hint.hintText}
                                        onChange={(e) =>
                                            handleHintChange(
                                                hint.id,
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter hint..."
                                    />

                                    <div className="hint-actions">

                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={() =>
                                                handleSaveHint(
                                                    hint
                                                )
                                            }
                                        >
                                            Save Hint
                                        </button>

                                    </div>

                                </div>
                            ))}

                        </div>

                        {/* ADD HINT */}
                        <div className="add-hint-box">

                            <label>
                                Add New Hint
                            </label>

                            <textarea
                                value={newHint}
                                onChange={(e) =>
                                    setNewHint(e.target.value)
                                }
                                placeholder="Enter a helpful hint..."
                            />

                            <div className="add-hint-actions">

                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={handleAddHint}
                                >
                                    + Add Hint
                                </button>

                            </div>

                        </div>

                    </div>

                    {/* ================================================= */}
                    {/* EDITORIAL */}
                    {/* ================================================= */}

                    <div className="he-card editorial-card">

                        <div className="he-section-header">

                            <div>

                                <div className="section-title-row">

                                    <span className="section-icon">

                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />

                                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                        </svg>

                                    </span>

                                    <h2>Editorial</h2>

                                </div>

                                <p>
                                    The editorial is shown to users
                                    after 3 unsuccessful attempts.
                                </p>

                            </div>

                            <span className="unlock-badge">

                                <svg
                                    width="13"
                                    height="13"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <rect
                                        x="3"
                                        y="11"
                                        width="18"
                                        height="11"
                                        rx="2"
                                        ry="2"
                                    />

                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>

                                3 Attempts Rule

                            </span>

                        </div>

                        <div className="editorial-rule">

                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                />

                                <line
                                    x1="12"
                                    y1="8"
                                    x2="12"
                                    y2="12"
                                />

                                <line
                                    x1="12"
                                    y1="16"
                                    x2="12.01"
                                    y2="16"
                                />
                            </svg>

                            <div>

                                <strong>
                                    Editorial Access Rule
                                </strong>

                                <p>
                                    Users can view this editorial only
                                    after making 3 unsuccessful
                                    submissions for this problem.
                                </p>

                            </div>

                        </div>

                        <div className="editorial-form">

                            <div className="form-group">

                                <label>
                                    Approach
                                </label>

                                <textarea
                                    name="approach"
                                    value={editorial.approach}
                                    onChange={handleEditorialChange}
                                    placeholder="Explain the overall approach..."
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Algorithm
                                </label>

                                <textarea
                                    name="algorithm"
                                    value={editorial.algorithm}
                                    onChange={handleEditorialChange}
                                    placeholder="Describe the algorithm step by step..."
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Detailed Explanation
                                </label>

                                <textarea
                                    name="explanation"
                                    value={editorial.explanation}
                                    onChange={handleEditorialChange}
                                    placeholder="Provide a detailed explanation of the solution..."
                                />

                            </div>

                            <div className="complexity-grid">

                                <div className="form-group">

                                    <label>
                                        Time Complexity
                                    </label>

                                    <input
                                        type="text"
                                        name="timeComplexity"
                                        value={editorial.timeComplexity}
                                        onChange={handleEditorialChange}
                                        placeholder="Example: O(n)"
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Space Complexity
                                    </label>

                                    <input
                                        type="text"
                                        name="spaceComplexity"
                                        value={editorial.spaceComplexity}
                                        onChange={handleEditorialChange}
                                        placeholder="Example: O(1)"
                                    />

                                </div>

                            </div>

                        </div>

                        <div className="editorial-actions">

                            {editorialId && (

                                <button
                                    type="button"
                                    className="danger-outline-button"
                                    onClick={handleDeleteEditorial}
                                >
                                    Delete Editorial
                                </button>

                            )}

                            <button
                                type="button"
                                className="primary-button"
                                onClick={handleSaveEditorial}
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editorialId
                                        ? "Update Editorial"
                                        : "Save Editorial"}
                            </button>

                        </div>

                    </div>

                </>
            )}

        </div>
    );
}

export default HintsEditorialManagement;