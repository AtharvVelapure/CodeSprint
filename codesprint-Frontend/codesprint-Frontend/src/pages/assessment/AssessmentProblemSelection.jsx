import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AssessmentProblemSelection.css";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function AssessmentProblemSelection() {
    const { assessmentId } = useParams();
    const navigate = useNavigate();

    const storedUser = JSON.parse(localStorage.getItem("user")) || null;
    const userId = storedUser?.id;

    // =====================================================
    // STATE
    // =====================================================
    const [assessment, setAssessment] = useState(null);
    const [problems, setProblems] = useState([]);
    const [selectedProblems, setSelectedProblems] = useState([]);

    const [categories, setCategories] = useState([]);
    const [difficulties, setDifficulties] = useState([]);

    const [searchText, setSearchText] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");

    const status = String(assessment?.status || "").toUpperCase();
    const canManageQuestions = status === "DRAFT" || status === "PUBLISHED";

    const [loading, setLoading] = useState(true);
    const [problemLoading, setProblemLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =====================================================
    // LOAD DATA
    // =====================================================
    useEffect(() => {
        if (!userId) {
            setError("User information not found. Please login again.");
            setLoading(false);
            return;
        }

        loadAssessment();
        loadProblems();
        loadCategories();
        loadDifficulties();
    }, [assessmentId, userId]);

    const loadAssessment = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/assessment-assignments/${assessmentId}?userId=${userId}`
            );

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Unable to load assessment");
            }

            const data = await response.json();
            setAssessment(data);
        } catch (err) {
            setError(err.message || "Failed to load assessment");
        } finally {
            setLoading(false);
        }
    };

    const loadProblems = async () => {
        setProblemLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/problems`);
            if (!response.ok) {
                throw new Error("Failed to load coding problems");
            }
            const data = await response.json();
            setProblems(data);
        } catch (err) {
            setError(err.message || "Failed to load problems");
        } finally {
            setProblemLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/problems/categories`);
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (err) {
            console.error("Failed to load categories", err);
        }
    };

    const loadDifficulties = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/problems/difficulties`);
            if (response.ok) {
                const data = await response.json();
                setDifficulties(data);
            }
        } catch (err) {
            console.error("Failed to load difficulties", err);
        }
    };

    const loadSelectedProblems = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/assessment-assignments/${assessmentId}/problems?userId=${userId}`
            );

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Failed to load selected problems");
            }

            const data = await response.json();
            setSelectedProblems(data);
        } catch (err) {
            setError(err.message || "Failed to load selected problems");
        }
    };

    useEffect(() => {
        if (userId && assessmentId) {
            loadSelectedProblems();
        }
    }, [assessmentId, userId]);

    // =====================================================
    // FILTER PROBLEMS
    // =====================================================
    const filteredProblems = useMemo(() => {
        return problems.filter((problem) => {
            const title = problem.title?.toLowerCase() || "";
            const category = problem.category?.toLowerCase() || "";
            const difficulty = problem.difficulty?.toLowerCase() || "";
            const search = searchText.toLowerCase().trim();

            const matchesSearch =
                !search || title.includes(search) || category.includes(search);
            const matchesCategory =
                !selectedCategory || category === selectedCategory.toLowerCase();
            const matchesDifficulty =
                !selectedDifficulty || difficulty === selectedDifficulty.toLowerCase();

            return matchesSearch && matchesCategory && matchesDifficulty;
        });
    }, [problems, searchText, selectedCategory, selectedDifficulty]);

    const isProblemSelected = (problemId) => {
        return selectedProblems.some((item) => item.problem?.id === problemId);
    };

    // =====================================================
    // ADD / REMOVE / UPDATE PROBLEM
    // =====================================================
    const addProblem = async (problem) => {
        setError("");
        setSuccess("");

        if (!canManageQuestions) {
            setError("Questions can only be changed while the assessment is DRAFT or PUBLISHED.");
            return;
        }

        const nextOrder = selectedProblems.length + 1;

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/assessment-assignments/${assessmentId}/problems`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: new URLSearchParams({
                        userId: userId,
                        problemId: problem.id,
                        questionOrder: nextOrder,
                        marks: "10"
                    })
                }
            );

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Failed to add problem");
            }

            await loadSelectedProblems();
            setSuccess(`"${problem.title}" added successfully.`);
        } catch (err) {
            setError(err.message || "Failed to add problem");
        }
    };

    const removeProblem = async (assessmentProblemId) => {
        setError("");
        setSuccess("");

        if (!canManageQuestions) {
            setError("Questions can only be changed while the assessment is DRAFT or PUBLISHED.");
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/assessment-assignments/problems/${assessmentProblemId}?userId=${userId}`,
                { method: "DELETE" }
            );

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Failed to remove problem");
            }

            await loadSelectedProblems();
            setSuccess("Problem removed successfully.");
        } catch (err) {
            setError(err.message || "Failed to remove problem");
        }
    };

    const updateSelectedProblem = async (assessmentProblemId, questionOrder, marks) => {
        setError("");
        setSuccess("");

        if (!canManageQuestions) {
            setError("Questions can only be changed while the assessment is DRAFT or PUBLISHED.");
            return;
        }

        if (!questionOrder || Number(questionOrder) <= 0) {
            setError("Question order must be greater than zero");
            return;
        }

        if (!marks || Number(marks) <= 0) {
            setError("Marks must be greater than zero");
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/assessment-assignments/problems/${assessmentProblemId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: new URLSearchParams({
                        userId: userId,
                        questionOrder: questionOrder,
                        marks: marks
                    })
                }
            );

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Failed to update problem");
            }

            await loadSelectedProblems();
            setSuccess("Problem updated successfully.");
        } catch (err) {
            setError(err.message || "Failed to update problem");
        }
    };

    const handleBackToManage = () => {
        if (!assessment?.id) {
            navigate("/user/assessments");
            return;
        }
        navigate(`/user/assessments/${assessment.id}/manage`);
    };

    const totalMarks = selectedProblems.reduce(
        (total, item) => total + Number(item.marks || 0),
        0
    );

    if (loading) {
        return (
            <div className="assessment-problem-page">
                <div className="assessment-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading assessment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="assessment-problem-page">
            {/* HEADER */}
            <div className="assessment-problem-header">
                <div className="header-left">
                    <button className="back-button" onClick={handleBackToManage}>
                        ← Back to Manage Assessment
                    </button>
                    <h1>Select Coding Problems</h1>

                    {assessment && (
                        <div className="assessment-info-bar">
                            <span className="info-chip">
                                <strong>Company:</strong> {assessment.companyName}
                            </span>
                            <span className="info-chip">
                                <strong>Position:</strong> {assessment.position}
                            </span>
                            <span className={`status-pill ${status.toLowerCase()}`}>
                                {status}
                            </span>
                        </div>
                    )}
                </div>

                <div className="selected-count-badge">
                    <span className="count-label">Selected Questions</span>
                    <span className="count-number">{selectedProblems.length}</span>
                </div>
            </div>

            {/* MESSAGES */}
            {error && (
                <div className="assessment-message error">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError("")}>×</button>
                </div>
            )}

            {success && (
                <div className="assessment-message success">
                    <span>✓ {success}</span>
                    <button onClick={() => setSuccess("")}>×</button>
                </div>
            )}

            {/* MAIN TWO COLUMN LAYOUT */}
            <div className="assessment-problem-layout">
                {/* AVAILABLE PROBLEMS */}
                <section className="available-problems-section">
                    <div className="section-heading">
                        <div>
                            <h2>Available Problems</h2>
                            <p>Select coding problems from your CodeSprint problem library.</p>
                        </div>
                        <span className="problem-count-badge">
                            {filteredProblems.length} problems
                        </span>
                    </div>

                    {/* FILTERS */}
                    <div className="problem-filters">
                        <div className="search-input-wrapper">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                className="filter-search-input"
                                placeholder="Search by title or category..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>

                        <select
                            className="filter-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>

                        <select
                            className="filter-select"
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                        >
                            <option value="">All Difficulties</option>
                            {difficulties.map((difficulty) => (
                                <option key={difficulty} value={difficulty}>
                                    {difficulty}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* PROBLEM LIST */}
                    {problemLoading ? (
                        <div className="empty-state-box">
                            <div className="loading-spinner"></div>
                            <p>Loading problems...</p>
                        </div>
                    ) : filteredProblems.length === 0 ? (
                        <div className="empty-state-box">
                            <div className="empty-icon">🔍</div>
                            <h3>No problems found</h3>
                            <p>Try modifying your search or filters.</p>
                        </div>
                    ) : (
                        <div className="problem-list">
                            {filteredProblems.map((problem) => {
                                const selected = isProblemSelected(problem.id);
                                const diff = String(problem.difficulty || "").toLowerCase();

                                return (
                                    <div className={`problem-card ${selected ? "is-selected" : ""}`} key={problem.id}>
                                        <div className="problem-card-content">
                                            <div className="problem-title-row">
                                                <h3>{problem.title}</h3>
                                                <span className={`difficulty-badge ${diff}`}>
                                                    {problem.difficulty}
                                                </span>
                                            </div>
                                            <div className="problem-meta">
                                                <span className="category-tag">{problem.category}</span>
                                            </div>
                                        </div>

                                        <button
                                            className={selected ? "problem-added-button" : "add-problem-button"}
                                            disabled={selected || !canManageQuestions}
                                            onClick={() => canManageQuestions && addProblem(problem)}
                                        >
                                            {selected ? "✓ Added" : "+ Add"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* SELECTED PROBLEMS */}
                <section className="selected-problems-section">
                    <div className="section-heading">
                        <div>
                            <h2>Selected Problems</h2>
                            <p>Configure question order and point values.</p>
                        </div>
                    </div>

                    {selectedProblems.length === 0 ? (
                        <div className="empty-state-box">
                            <div className="empty-icon">📋</div>
                            <h3>No problems selected</h3>
                            <p>Add coding problems from the left panel.</p>
                        </div>
                    ) : (
                        <div className="selected-problem-list">
                            {selectedProblems.map((item) => (
                                <SelectedProblemCard
                                    key={item.id}
                                    item={item}
                                    onRemove={removeProblem}
                                    onUpdate={updateSelectedProblem}
                                    disabled={!canManageQuestions}
                                />
                            ))}
                        </div>
                    )}

                    {/* TOTAL MARKS */}
                    <div className="total-marks-card">
                        <span>Total Assessment Marks</span>
                        <strong>{totalMarks} pts</strong>
                    </div>
                </section>
            </div>
        </div>
    );
}

// =====================================================
// SELECTED PROBLEM CARD COMPONENT
// =====================================================
function SelectedProblemCard({ item, onRemove, onUpdate, disabled }) {
    const [questionOrder, setQuestionOrder] = useState(item.questionOrder);
    const [marks, setMarks] = useState(item.marks);
    const [editing, setEditing] = useState(false);

    const saveChanges = async () => {
        await onUpdate(item.id, Number(questionOrder), Number(marks));
        setEditing(false);
    };

    const diff = String(item.problem?.difficulty || "").toLowerCase();

    return (
        <div className={`selected-problem-card ${editing ? "is-editing" : ""}`}>
            <div className="selected-problem-top">
                <div className="selected-problem-index">
                    #{item.questionOrder}
                </div>
                <div className="selected-problem-info">
                    <h3>{item.problem?.title}</h3>
                    <div className="selected-problem-meta">
                        <span>{item.problem?.category}</span>
                        <span className="meta-bullet">•</span>
                        <span className={`difficulty-text ${diff}`}>
                            {item.problem?.difficulty}
                        </span>
                    </div>
                </div>
            </div>

            <div className="selected-problem-footer">
                <div className="selected-problem-controls">
                    <label className="control-field">
                        <span>Order:</span>
                        <input
                            type="number"
                            min="1"
                            value={questionOrder}
                            disabled={disabled || !editing}
                            onChange={(e) => setQuestionOrder(e.target.value)}
                        />
                    </label>

                    <label className="control-field">
                        <span>Marks:</span>
                        <input
                            type="number"
                            min="1"
                            step="0.5"
                            value={marks}
                            disabled={disabled || !editing}
                            onChange={(e) => setMarks(e.target.value)}
                        />
                    </label>
                </div>

                <div className="selected-problem-actions">
                    {editing && !disabled ? (
                        <>
                            <button className="btn-link save" onClick={saveChanges} disabled={disabled}>
                                Save
                            </button>
                            <button
                                className="btn-link cancel"
                                onClick={() => {
                                    setQuestionOrder(item.questionOrder);
                                    setMarks(item.marks);
                                    setEditing(false);
                                }}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            className="btn-link edit"
                            onClick={() => setEditing(true)}
                            disabled={disabled}
                        >
                            Edit
                        </button>
                    )}

                    <button
                        className="btn-link remove"
                        onClick={() => onRemove(item.id)}
                        disabled={disabled}
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AssessmentProblemSelection;