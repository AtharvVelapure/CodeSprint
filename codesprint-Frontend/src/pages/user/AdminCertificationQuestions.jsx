import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AdminCertificationQuestions.css";

const API_BASE_URL = "/api";

function AdminCertificationQuestions() {
    const { certificationId } = useParams();
    const navigate = useNavigate();

    const [certification, setCertification] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [problems, setProblems] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);

    const [formData, setFormData] = useState({
        problemId: "",
        questionOrder: "",
        percentageWeight: ""
    });

    // ============================================================
    // LOAD DATA
    // ============================================================

    useEffect(() => {
        loadData();
    }, [certificationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                certificationResponse,
                questionsResponse,
                problemsResponse
            ] = await Promise.all([
                fetch(
                    `${API_BASE_URL}/admin/certifications/${certificationId}`
                ),
                fetch(
                    `${API_BASE_URL}/admin/certifications/${certificationId}/questions`
                ),
                fetch(`${API_BASE_URL}/problems`)
            ]);

            if (!certificationResponse.ok) {
                throw new Error("Failed to load certification.");
            }

            if (!questionsResponse.ok) {
                throw new Error(
                    "Failed to load certification questions."
                );
            }

            if (!problemsResponse.ok) {
                throw new Error("Failed to load coding problems.");
            }

            const certificationData =
                await certificationResponse.json();

            const questionsData =
                await questionsResponse.json();

            const problemsData =
                await problemsResponse.json();

            setCertification(certificationData);

            setQuestions(
                Array.isArray(questionsData)
                    ? questionsData
                    : []
            );

            if (Array.isArray(problemsData)) {
                setProblems(problemsData);
            } else if (Array.isArray(problemsData.content)) {
                setProblems(problemsData.content);
            } else if (Array.isArray(problemsData.problems)) {
                setProblems(problemsData.problems);
            } else {
                setProblems([]);
            }

        } catch (err) {
            console.error(
                "Error loading certification questions:",
                err
            );

            setError(
                err.message ||
                "Failed to load certification questions."
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // FORM
    // ============================================================

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            problemId: "",
            questionOrder: "",
            percentageWeight: ""
        });

        setEditingQuestion(null);
        setShowForm(false);
    };

    const openAddForm = () => {
        setError("");
        setSuccess("");

        setEditingQuestion(null);

        setFormData({
            problemId: "",
            questionOrder: String(questions.length + 1),
            percentageWeight: ""
        });

        setShowForm(true);
    };

    const openEditForm = (question) => {
        setError("");
        setSuccess("");

        setEditingQuestion(question);

        setFormData({
            problemId: String(question.problemId),
            questionOrder: String(question.questionOrder),
            percentageWeight: String(
                question.percentageWeight
            )
        });

        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // ============================================================
    // VALIDATION
    // ============================================================

    const validateForm = () => {
        if (!formData.problemId) {
            setError("Please select a coding problem.");
            return false;
        }

        const order = Number(formData.questionOrder);
        const weight = Number(formData.percentageWeight);

        if (!Number.isInteger(order) || order <= 0) {
            setError(
                "Question order must be a positive number."
            );
            return false;
        }

        if (
            !Number.isFinite(weight) ||
            weight <= 0 ||
            weight > 100
        ) {
            setError(
                "Percentage weight must be greater than 0 and at most 100."
            );
            return false;
        }

        if (
            !editingQuestion &&
            certification &&
            questions.length >= certification.totalQuestions
        ) {
            setError(
                `This certification already has ${certification.totalQuestions} questions.`
            );
            return false;
        }

        const duplicateProblem = questions.some(
            (question) =>
                question.problemId === Number(formData.problemId) &&
                (!editingQuestion ||
                    question.id !== editingQuestion.id)
        );

        if (duplicateProblem) {
            setError(
                "This problem is already assigned to this certification."
            );
            return false;
        }

        const duplicateOrder = questions.some(
            (question) =>
                question.questionOrder === Number(
                    formData.questionOrder
                ) &&
                (!editingQuestion ||
                    question.id !== editingQuestion.id)
        );

        if (duplicateOrder) {
            setError(
                "This question order is already being used."
            );
            return false;
        }

        return true;
    };

    // ============================================================
    // ADD QUESTION
    // ============================================================

    const addQuestion = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                problem: {
                    id: Number(formData.problemId)
                },
                questionOrder: Number(
                    formData.questionOrder
                ),
                percentageWeight: Number(
                    formData.percentageWeight
                )
            };

            const response = await fetch(
                `${API_BASE_URL}/admin/certifications/${certificationId}/questions`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            const data = await response
                .json()
                .catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    "Failed to add coding question."
                );
            }

            setSuccess(
                "Coding question added successfully."
            );

            resetForm();

            await loadData();

        } catch (err) {
            console.error(
                "Error adding certification question:",
                err
            );

            setError(
                err.message ||
                "Failed to add coding question."
            );
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // UPDATE QUESTION
    // ============================================================

    const updateQuestion = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                problem: {
                    id: Number(formData.problemId)
                },
                questionOrder: Number(
                    formData.questionOrder
                ),
                percentageWeight: Number(
                    formData.percentageWeight
                )
            };

            const response = await fetch(
                `${API_BASE_URL}/admin/certifications/questions/${editingQuestion.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            const data = await response
                .json()
                .catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    "Failed to update coding question."
                );
            }

            setSuccess(
                "Coding question updated successfully."
            );

            resetForm();

            await loadData();

        } catch (err) {
            console.error(
                "Error updating certification question:",
                err
            );

            setError(
                err.message ||
                "Failed to update coding question."
            );
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // SAVE QUESTION
    // ============================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (editingQuestion) {
            await updateQuestion();
        } else {
            await addQuestion();
        }
    };

    // ============================================================
    // DELETE QUESTION
    // ============================================================

    const deleteQuestion = async (questionId) => {
        const confirmed = window.confirm(
            "Are you sure you want to remove this coding question from the certification?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API_BASE_URL}/admin/certifications/questions/${questionId}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.text();

            if (!response.ok) {
                throw new Error(
                    data ||
                    "Failed to delete coding question."
                );
            }

            setSuccess(
                "Coding question removed successfully."
            );

            await loadData();

        } catch (err) {
            console.error(
                "Error deleting certification question:",
                err
            );

            setError(
                err.message ||
                "Failed to delete coding question."
            );
        }
    };

    // ============================================================
    // CALCULATIONS
    // ============================================================

    const assignedCount = questions.length;

    const totalWeight = questions.reduce(
        (total, question) =>
            total +
            Number(question.percentageWeight || 0),
        0
    );

    const roundedTotalWeight =
        Math.round(totalWeight * 100) / 100;

    const questionCountCorrect =
        certification &&
        assignedCount === certification.totalQuestions;

    const weightCorrect =
        roundedTotalWeight === 100;

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="admin-cert-questions-page">
                <div className="admin-cert-questions-loading">
                    Loading certification questions...
                </div>
            </div>
        );
    }

    // ============================================================
    // PAGE
    // ============================================================

    return (
        <div className="admin-cert-questions-page">

            {/* HEADER */}

            <div className="admin-cert-questions-header">

                <div>

                    <button
                        className="admin-cert-back-button"
                        onClick={() =>
                            navigate(
                                "/admin/certifications"
                            )
                        }
                    >
                        ← Back to Certifications
                    </button>

                    <h1>
                        Manage Certification Questions
                    </h1>

                    {certification && (
                        <p>
                            {certification.title}
                        </p>
                    )}

                </div>

                <button
                    className="admin-cert-add-button"
                    onClick={openAddForm}
                    disabled={
                        !certification ||
                        assignedCount >=
                            certification.totalQuestions
                    }
                >
                    + Add Coding Question
                </button>

            </div>

            {/* MESSAGES */}

            {error && (
                <div className="admin-cert-message error">
                    {error}
                </div>
            )}

            {success && (
                <div className="admin-cert-message success">
                    {success}
                </div>
            )}

            {/* SUMMARY */}

            {certification && (
                <div className="admin-cert-summary">

                    <div className="admin-cert-summary-card">
                        <span>
                            Configured Questions
                        </span>

                        <strong>
                            {certification.totalQuestions}
                        </strong>
                    </div>

                    <div className="admin-cert-summary-card">
                        <span>
                            Assigned Questions
                        </span>

                        <strong>
                            {assignedCount}
                        </strong>
                    </div>

                    <div className="admin-cert-summary-card">
                        <span>
                            Total Weight
                        </span>

                        <strong>
                            {roundedTotalWeight}%
                        </strong>
                    </div>

                    <div className="admin-cert-summary-card">
                        <span>
                            Passing Percentage
                        </span>

                        <strong>
                            {certification.passingPercentage}%
                        </strong>
                    </div>

                </div>
            )}

            {/* VALIDATION */}

            <div className="admin-cert-validation">

                <div
                    className={
                        questionCountCorrect
                            ? "validation-item valid"
                            : "validation-item invalid"
                    }
                >

                    <span>
                        {questionCountCorrect
                            ? "✓"
                            : "!"}
                    </span>

                    <div>

                        <strong>
                            Question Count
                        </strong>

                        <p>
                            {assignedCount} of{" "}
                            {certification?.totalQuestions ||
                                0}{" "}
                            questions assigned
                        </p>

                    </div>

                </div>

                <div
                    className={
                        weightCorrect
                            ? "validation-item valid"
                            : "validation-item invalid"
                    }
                >

                    <span>
                        {weightCorrect
                            ? "✓"
                            : "!"}
                    </span>

                    <div>

                        <strong>
                            Percentage Weight
                        </strong>

                        <p>
                            Total weight is{" "}
                            {roundedTotalWeight}%
                            {weightCorrect
                                ? " — correct"
                                : " — must equal 100%"}
                        </p>

                    </div>

                </div>

            </div>

            {/* ADD / EDIT FORM */}

            {showForm && (
                <div className="admin-cert-question-form-card">

                    <div className="admin-cert-form-header">

                        <div>

                            <h2>
                                {editingQuestion
                                    ? "Edit Coding Question"
                                    : "Add Coding Question"}
                            </h2>

                            <p>
                                Select an existing CodeSprint
                                problem for this certification.
                            </p>

                        </div>

                        <button
                            type="button"
                            className="admin-cert-close-button"
                            onClick={resetForm}
                        >
                            ×
                        </button>

                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="admin-cert-form-grid">

                            <div className="admin-cert-form-group full-width">

                                <label>
                                    Coding Problem
                                </label>

                                <select
                                    name="problemId"
                                    value={
                                        formData.problemId
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select a coding problem
                                    </option>

                                    {problems.map(
                                        (problem) => (
                                            <option
                                                key={
                                                    problem.id
                                                }
                                                value={
                                                    problem.id
                                                }
                                            >
                                                {problem.id} —{" "}
                                                {problem.title ||
                                                    problem.problemTitle ||
                                                    problem.name ||
                                                    "Untitled Problem"}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                            <div className="admin-cert-form-group">

                                <label>
                                    Question Order
                                </label>

                                <input
                                    type="number"
                                    name="questionOrder"
                                    min="1"
                                    value={
                                        formData.questionOrder
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                />

                            </div>

                            <div className="admin-cert-form-group">

                                <label>
                                    Percentage Weight
                                </label>

                                <div className="admin-cert-input-with-suffix">

                                    <input
                                        type="number"
                                        name="percentageWeight"
                                        min="0.01"
                                        max="100"
                                        step="0.01"
                                        value={
                                            formData.percentageWeight
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                    />

                                    <span>
                                        %
                                    </span>

                                </div>

                            </div>

                        </div>

                        <div className="admin-cert-form-actions">

                            <button
                                type="button"
                                className="admin-cert-cancel-button"
                                onClick={resetForm}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="admin-cert-save-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingQuestion
                                        ? "Update Question"
                                        : "Add Question"}
                            </button>

                        </div>

                    </form>

                </div>
            )}

            {/* QUESTIONS */}

            <div className="admin-cert-questions-card">

                <div className="admin-cert-table-header">

                    <div>

                        <h2>
                            Coding Questions
                        </h2>

                        <p>
                            Existing CodeSprint problems
                            assigned to this certification.
                        </p>

                    </div>

                    <span className="admin-cert-question-count">
                        {assignedCount} Question
                        {assignedCount !== 1
                            ? "s"
                            : ""}
                    </span>

                </div>

                {questions.length === 0 ? (

                    <div className="admin-cert-empty">

                        <div className="admin-cert-empty-icon">
                            📝
                        </div>

                        <h3>
                            No coding questions assigned
                        </h3>

                        <p>
                            Add existing CodeSprint problems
                            to create the certification exam.
                        </p>

                        <button
                            className="admin-cert-add-button"
                            onClick={openAddForm}
                        >
                            + Add First Question
                        </button>

                    </div>

                ) : (

                    <div className="admin-cert-table-wrapper">

                        <table className="admin-cert-questions-table">

                            <thead>

                                <tr>
                                    <th>Order</th>
                                    <th>Problem</th>
                                    <th>Difficulty</th>
                                    <th>Category</th>
                                    <th>Weight</th>
                                    <th>Actions</th>
                                </tr>

                            </thead>

                            <tbody>

                                {questions
                                    .slice()
                                    .sort(
                                        (a, b) =>
                                            a.questionOrder -
                                            b.questionOrder
                                    )
                                    .map(
                                        (question) => (
                                            <tr
                                                key={
                                                    question.id
                                                }
                                            >

                                                <td>
                                                    <span className="order-badge">
                                                        {
                                                            question.questionOrder
                                                        }
                                                    </span>
                                                </td>

                                                <td>

                                                    <div className="problem-cell">

                                                        <strong>
                                                            {question.problemTitle ||
                                                                question.question ||
                                                                "Untitled Problem"}
                                                        </strong>

                                                        <small>
                                                            Problem
                                                            ID:{" "}
                                                            {
                                                                question.problemId
                                                            }
                                                        </small>

                                                    </div>

                                                </td>

                                                <td>

                                                    <span
                                                        className={`difficulty-badge ${
                                                            (
                                                                question.difficulty ||
                                                                ""
                                                            ).toLowerCase()
                                                        }`}
                                                    >
                                                        {
                                                            question.difficulty ||
                                                            "N/A"
                                                        }
                                                    </span>

                                                </td>

                                                <td>
                                                    {
                                                        question.category ||
                                                        "N/A"
                                                    }
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            question.percentageWeight
                                                        }
                                                        %
                                                    </strong>
                                                </td>

                                                <td>

                                                    <div className="question-actions">

                                                        <button
                                                            className="edit-question-button"
                                                            onClick={() =>
                                                                openEditForm(
                                                                    question
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            className="delete-question-button"
                                                            onClick={() =>
                                                                deleteQuestion(
                                                                    question.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>
                                        )
                                    )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}

export default AdminCertificationQuestions;