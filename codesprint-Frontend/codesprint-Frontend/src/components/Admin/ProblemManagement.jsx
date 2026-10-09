import { useEffect, useState } from "react";
import axios from "axios";
import "./ProblemManagement.css";

const API_URL = "/api/problems";
const ADMIN_PROBLEMS_API_URL = "/api/problems/admin/all";
const CATEGORY_API_URL = "/api/problems/categories";

function ProblemManagement() {
    const [activeTab, setActiveTab] = useState("all");
    const [problems, setProblems] = useState([]);
    const [categories, setCategories] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState(null);

    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        difficulty: "Easy",
        category: "",
        inputFormat: "",
        outputFormat: "",
        constraints: ""
    });

    const difficulties = ["Easy", "Medium", "Hard"];

    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {
        fetchProblems();
        fetchCategories();
    }, []);

    // ============================================================
    // FETCH ALL PROBLEMS FOR ADMIN
    // ============================================================

    const fetchProblems = async () => {
        try {
            const response = await axios.get(
                ADMIN_PROBLEMS_API_URL
            );

            setProblems(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.error(
                "Error loading problems:",
                error
            );

            const message =
                error.response?.data?.message ||
                "Failed to load problems";

            alert(message);
        }
    };

    // ============================================================
    // FETCH CATEGORIES
    // ============================================================

    const fetchCategories = async () => {
        try {
            const response = await axios.get(
                CATEGORY_API_URL
            );

            setCategories(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.error(
                "Error loading categories:",
                error
            );
        }
    };

    // ============================================================
    // FORM CHANGE
    // ============================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value
        }));
    };

    // ============================================================
    // ADD / UPDATE PROBLEM
    // ============================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            if (editingId) {

                const response = await axios.put(
                    `${API_URL}/${editingId}`,
                    formData
                );

                setProblems((currentProblems) =>
                    currentProblems.map((problem) =>
                        problem.id === editingId
                            ? response.data
                            : problem
                    )
                );

                alert(
                    "Problem updated successfully"
                );

            } else {

                const response = await axios.post(
                    API_URL,
                    formData
                );

                setProblems((currentProblems) => [
                    ...currentProblems,
                    response.data
                ]);

                alert(
                    "Problem added successfully"
                );
            }

            resetForm();

            setActiveTab("all");

            await fetchProblems();
            await fetchCategories();

        } catch (error) {

            console.error(
                "Error saving problem:",
                error
            );

            const message =
                error.response?.data?.message ||
                error.response?.data ||
                "Failed to save problem";

            alert(message);
        }
    };
// ============================================================
// DELETE PROBLEM
// ============================================================

const handleDelete = async (id) => {

    const problem = problems.find(
        (item) => item.id === id
    );

    const problemTitle =
        problem?.title || "this problem";

    const confirmDelete = window.confirm(
        `Are you sure you want to permanently delete "${problemTitle}"?`
    );

    if (!confirmDelete) {
        return;
    }

    try {

        /*
         * Treat 409 as a normal business response.
         *
         * 409 is expected when the problem is being used
         * by an assessment, contest, certification, or
         * has submission history.
         */
        const response = await axios.delete(
            `${API_URL}/${id}`,
            {
                validateStatus: (status) =>
                    (status >= 200 && status < 300) ||
                    status === 409
            }
        );

        // ========================================================
        // SUCCESSFUL PERMANENT DELETE
        // ========================================================

        if (response.status >= 200 && response.status < 300) {

            setProblems((currentProblems) =>
                currentProblems.filter(
                    (problem) => problem.id !== id
                )
            );

            await fetchCategories();

            alert(
                "Problem deleted successfully"
            );

            return;
        }


        // ========================================================
        // 409 CONFLICT
        // ========================================================

        if (response.status === 409) {

            const backendMessage =
                response.data?.message ||
                response.data ||
                "This problem cannot be permanently deleted because it is currently being used.";

            const shouldDeactivate =
                window.confirm(
                    `${backendMessage}\n\n` +
                    `Would you like to deactivate "${problemTitle}" instead?`
                );

            if (!shouldDeactivate) {
                return;
            }


            // ====================================================
            // DEACTIVATE INSTEAD
            // ====================================================

            try {

                const deactivateResponse =
                    await axios.put(
                        `${API_URL}/${id}/deactivate`
                    );

                await fetchProblems();

                alert(
                    deactivateResponse.data ||
                    "Problem deactivated successfully"
                );

            } catch (deactivateError) {

                console.error(
                    "Error deactivating problem:",
                    deactivateError
                );

                const deactivateMessage =
                    deactivateError.response?.data?.message ||
                    deactivateError.response?.data ||
                    "Failed to deactivate problem";

                alert(
                    deactivateMessage
                );
            }
        }

    } catch (error) {

        /*
         * Only unexpected errors reach here.
         * A 409 is already handled above as a normal business response.
         */

        console.error(
            "Unexpected error deleting problem:",
            error
        );

        const message =
            error.response?.data?.message ||
            error.response?.data ||
            "Failed to delete problem";

        alert(message);
    }
};

    // ============================================================
    // DEACTIVATE PROBLEM
    // ============================================================

    const handleDeactivate = async (id) => {

        const problem = problems.find(
            (item) => item.id === id
        );

        const problemTitle =
            problem?.title || "this problem";

        const confirmDeactivate = window.confirm(
            `Deactivate "${problemTitle}"?\n\n` +
            `The problem will no longer be available to normal users, but its data and history will be preserved.`
        );

        if (!confirmDeactivate) {
            return;
        }

        try {

            const response = await axios.put(
                `${API_URL}/${id}/deactivate`
            );

            await fetchProblems();

            alert(
                response.data ||
                "Problem deactivated successfully"
            );

        } catch (error) {

            console.error(
                "Error deactivating problem:",
                error
            );

            const message =
                error.response?.data?.message ||
                error.response?.data ||
                "Failed to deactivate problem";

            alert(message);
        }
    };

    // ============================================================
    // ACTIVATE PROBLEM
    // ============================================================

    const handleActivate = async (id) => {

        const problem = problems.find(
            (item) => item.id === id
        );

        const problemTitle =
            problem?.title || "this problem";

        const confirmActivate =
            window.confirm(
                `Activate "${problemTitle}"?\n\n` +
                `The problem will become available to normal users again.`
            );

        if (!confirmActivate) {
            return;
        }

        try {

            const response = await axios.put(
                `${API_URL}/${id}/activate`
            );

            await fetchProblems();

            alert(
                response.data ||
                "Problem activated successfully"
            );

        } catch (error) {

            console.error(
                "Error activating problem:",
                error
            );

            const message =
                error.response?.data?.message ||
                error.response?.data ||
                "Failed to activate problem";

            alert(message);
        }
    };

    // ============================================================
    // EDIT PROBLEM
    // ============================================================

    const handleEdit = (problem) => {

        setEditingId(problem.id);

        setFormData({
            title: problem.title || "",
            description: problem.description || "",
            difficulty: problem.difficulty || "Easy",
            category: problem.category || "",
            inputFormat: problem.inputFormat || "",
            outputFormat: problem.outputFormat || "",
            constraints: problem.constraints || ""
        });

        setActiveTab("add");
    };

    // ============================================================
    // RESET FORM
    // ============================================================

    const resetForm = () => {

        setEditingId(null);

        setFormData({
            title: "",
            description: "",
            difficulty: "Easy",
            category: "",
            inputFormat: "",
            outputFormat: "",
            constraints: ""
        });
    };

    // ============================================================
    // CATEGORY CLICK
    // ============================================================

    const handleCategoryClick = (category) => {

        setSelectedCategory(category);
        setSelectedDifficulty(null);
    };

    // ============================================================
    // DIFFICULTY CLICK
    // ============================================================

    const handleDifficultyClick = (difficulty) => {

        setSelectedDifficulty(difficulty);
        setSelectedCategory(null);
    };

    // ============================================================
    // FILTER PROBLEMS
    // ============================================================

    const getDisplayedProblems = () => {

        if (selectedCategory) {

            return problems.filter(
                (problem) =>
                    problem.category?.toLowerCase() ===
                    selectedCategory.toLowerCase()
            );
        }

        if (selectedDifficulty) {

            return problems.filter(
                (problem) =>
                    problem.difficulty?.toLowerCase() ===
                    selectedDifficulty.toLowerCase()
            );
        }

        return problems;
    };

    const displayedProblems =
        getDisplayedProblems();

    // ============================================================
    // TABLE TITLE
    // ============================================================

    const getTableTitle = () => {

        if (selectedCategory) {
            return `${selectedCategory} Problems`;
        }

        if (selectedDifficulty) {
            return `${selectedDifficulty} Problems`;
        }

        return "All Problems";
    };

    // ============================================================
    // UI
    // ============================================================

    return (
        <div className="management-page">

            {/* ================================================== */}
            {/* PAGE TITLE */}
            {/* ================================================== */}

            <div className="page-title">

                <h1>
                    Problem Management
                </h1>

                <p>
                    Manage coding problems, categories and difficulty levels.
                </p>

            </div>


            {/* ================================================== */}
            {/* MAIN TABS */}
            {/* ================================================== */}

            <div className="management-tabs">

                <button
                    type="button"
                    className={
                        activeTab === "all"
                            ? "tab active"
                            : "tab"
                    }
                    onClick={() => {

                        setActiveTab("all");
                        setSelectedCategory(null);
                        setSelectedDifficulty(null);

                    }}
                >
                    All Problems
                </button>


                <button
                    type="button"
                    className={
                        activeTab === "add"
                            ? "tab active"
                            : "tab"
                    }
                    onClick={() => {

                        setActiveTab("add");

                        if (!editingId) {
                            resetForm();
                        }

                    }}
                >
                    {editingId
                        ? "Edit Problem"
                        : "Add Problem"}
                </button>


                <button
                    type="button"
                    className={
                        activeTab === "categories"
                            ? "tab active"
                            : "tab"
                    }
                    onClick={() => {

                        setActiveTab("categories");
                        setSelectedCategory(null);
                        setSelectedDifficulty(null);

                        fetchCategories();

                    }}
                >
                    Categories
                </button>


                <button
                    type="button"
                    className={
                        activeTab === "difficulty"
                            ? "tab active"
                            : "tab"
                    }
                    onClick={() => {

                        setActiveTab("difficulty");
                        setSelectedCategory(null);
                        setSelectedDifficulty(null);

                    }}
                >
                    Difficulty Levels
                </button>

            </div>


            {/* ================================================== */}
            {/* ALL PROBLEMS */}
            {/* ================================================== */}

            {activeTab === "all" && (

                <div className="management-card">

                    <div className="table-header">

                        <div>

                            <h2>
                                {getTableTitle()}
                            </h2>

                            <p className="table-subtitle">

                                {displayedProblems.length} problem
                                {displayedProblems.length !== 1
                                    ? "s"
                                    : ""}

                            </p>

                        </div>


                        <button
                            type="button"
                            className="add-button"
                            onClick={() => {

                                resetForm();
                                setActiveTab("add");

                            }}
                        >
                            + Add Problem
                        </button>

                    </div>


                    <ProblemTable
                        problems={displayedProblems}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onDeactivate={handleDeactivate}
                        onActivate={handleActivate}
                    />

                </div>

            )}


            {/* ================================================== */}
            {/* ADD / EDIT PROBLEM */}
            {/* ================================================== */}

            {activeTab === "add" && (

                <div className="management-card">

                    <div className="form-header">

                        <h2>
                            {editingId
                                ? "Edit Problem"
                                : "Add Problem"}
                        </h2>

                        <p>
                            {editingId
                                ? "Update the coding problem details."
                                : "Create a new coding problem."}
                        </p>

                    </div>


                    <form
                        className="problem-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="form-row">

                            <div className="form-group">

                                <label>
                                    Problem Title
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter problem title"
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Category
                                </label>

                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    placeholder="Enter category"
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Difficulty
                                </label>

                                <select
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleChange}
                                    required
                                >

                                    {difficulties.map(
                                        (difficulty) => (

                                            <option
                                                key={difficulty}
                                                value={difficulty}
                                            >
                                                {difficulty}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                        </div>


                        <div className="form-group">

                            <label>
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the problem"
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Input Format
                            </label>

                            <textarea
                                name="inputFormat"
                                value={formData.inputFormat}
                                onChange={handleChange}
                                placeholder="Describe the input format"
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Output Format
                            </label>

                            <textarea
                                name="outputFormat"
                                value={formData.outputFormat}
                                onChange={handleChange}
                                placeholder="Describe the output format"
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Constraints
                            </label>

                            <textarea
                                name="constraints"
                                value={formData.constraints}
                                onChange={handleChange}
                                placeholder="Enter problem constraints"
                            />

                        </div>


                        <div className="form-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => {

                                    resetForm();
                                    setActiveTab("all");

                                }}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="save-button"
                            >
                                {editingId
                                    ? "Update Problem"
                                    : "Save Problem"}
                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* ================================================== */}
            {/* CATEGORIES */}
            {/* ================================================== */}

            {activeTab === "categories" && (

                <div className="management-card">

                    <div className="category-section">

                        <h2>
                            Categories
                        </h2>

                        <p>
                            Select a category to view its problems.
                        </p>


                        <div className="category-list">

                            {categories.length === 0 ? (

                                <p
                                    style={{
                                        color: "#64748b"
                                    }}
                                >
                                    No categories found.
                                </p>

                            ) : (

                                categories.map(
                                    (category) => (

                                        <button
                                            key={category}
                                            type="button"
                                            className={
                                                selectedCategory === category
                                                    ? "category-item selected"
                                                    : "category-item"
                                            }
                                            onClick={() =>
                                                handleCategoryClick(
                                                    category
                                                )
                                            }
                                        >
                                            {category}
                                        </button>

                                    )
                                )

                            )}

                        </div>


                        {selectedCategory && (

                            <div className="category-results">

                                <div className="table-header">

                                    <div>

                                        <h2>
                                            {selectedCategory} Problems
                                        </h2>

                                        <p className="table-subtitle">

                                            {displayedProblems.length} problem
                                            {displayedProblems.length !== 1
                                                ? "s"
                                                : ""} found

                                        </p>

                                    </div>

                                </div>


                                <ProblemTable
                                    problems={displayedProblems}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onDeactivate={handleDeactivate}
                                    onActivate={handleActivate}
                                />

                            </div>

                        )}

                    </div>

                </div>

            )}


            {/* ================================================== */}
            {/* DIFFICULTY LEVELS */}
            {/* ================================================== */}

            {activeTab === "difficulty" && (

                <div className="management-card">

                    <div className="category-section">

                        <h2>
                            Difficulty Levels
                        </h2>

                        <p>
                            Select a difficulty to view its problems.
                        </p>


                        <div className="difficulty-list">

                            {difficulties.map(
                                (difficulty) => (

                                    <button
                                        key={difficulty}
                                        type="button"
                                        className={
                                            selectedDifficulty === difficulty
                                                ? `difficulty ${difficulty.toLowerCase()} selected`
                                                : `difficulty ${difficulty.toLowerCase()}`
                                        }
                                        onClick={() =>
                                            handleDifficultyClick(
                                                difficulty
                                            )
                                        }
                                    >
                                        {difficulty}
                                    </button>

                                )
                            )}

                        </div>


                        {selectedDifficulty && (

                            <div className="category-results">

                                <div className="table-header">

                                    <div>

                                        <h2>
                                            {selectedDifficulty} Problems
                                        </h2>

                                        <p className="table-subtitle">

                                            {displayedProblems.length} problem
                                            {displayedProblems.length !== 1
                                                ? "s"
                                                : ""} found

                                        </p>

                                    </div>

                                </div>


                                <ProblemTable
                                    problems={displayedProblems}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onDeactivate={handleDeactivate}
                                    onActivate={handleActivate}
                                />

                            </div>

                        )}

                    </div>

                </div>

            )}

        </div>
    );
}


// ================================================================
// PROBLEM TABLE
// ================================================================

function ProblemTable({
    problems,
    onEdit,
    onDelete,
    onDeactivate,
    onActivate
}) {

    if (problems.length === 0) {

        return (
            <div
                style={{
                    padding: "45px 20px",
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: "14px"
                }}
            >
                No problems found.
            </div>
        );
    }

    return (

        <div className="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>
                            Title
                        </th>

                        <th>
                            Category
                        </th>

                        <th>
                            Difficulty
                        </th>

                        <th>
                            Status
                        </th>

                        <th>
                            Action
                        </th>

                    </tr>

                </thead>


                <tbody>

                    {problems.map(
                        (problem) => (

                            <tr
                                key={problem.id}
                                className={
                                    problem.active === false
                                        ? "inactive-problem"
                                        : ""
                                }
                            >

                                {/* TITLE */}

                                <td>

                                    <strong>
                                        {problem.title}
                                    </strong>

                                </td>


                                {/* CATEGORY */}

                                <td>
                                    {problem.category}
                                </td>


                                {/* DIFFICULTY */}

                                <td>

                                    <span
                                        className={
                                            `difficulty ${problem.difficulty?.toLowerCase()}`
                                        }
                                    >
                                        {problem.difficulty}
                                    </span>

                                </td>


                                {/* STATUS */}

                                <td>

                                    {problem.active === false ? (

                                        <span className="problem-status inactive">
                                            Inactive
                                        </span>

                                    ) : (

                                        <span className="problem-status active">
                                            Active
                                        </span>

                                    )}

                                </td>


                                {/* ACTIONS */}

                                <td>

                                    <button
                                        type="button"
                                        className="edit-button"
                                        onClick={() =>
                                            onEdit(problem)
                                        }
                                    >
                                        Edit
                                    </button>


                                    {problem.active === false ? (

                                        <button
                                            type="button"
                                            className="activate-button"
                                            onClick={() =>
                                                onActivate(
                                                    problem.id
                                                )
                                            }
                                        >
                                            Activate
                                        </button>

                                    ) : (

                                        <button
                                            type="button"
                                            className="deactivate-button"
                                            onClick={() =>
                                                onDeactivate(
                                                    problem.id
                                                )
                                            }
                                        >
                                            Deactivate
                                        </button>

                                    )}


                                    <button
                                        type="button"
                                        className="delete-button"
                                        onClick={() =>
                                            onDelete(
                                                problem.id
                                            )
                                        }
                                    >
                                        Delete
                                    </button>

                                </td>

                            </tr>

                        )
                    )}

                </tbody>

            </table>

        </div>
    );
}

export default ProblemManagement;