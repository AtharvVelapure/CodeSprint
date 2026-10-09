import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import "./TestCaseManagement.css";

const PROBLEM_API_URL = "/api/problems";
const TEST_CASE_API_URL = "/api/test-cases";

function TestCaseManagement() {
    const [searchParams, setSearchParams] = useSearchParams();
    const problemIdFromUrl = searchParams.get("problemId");
    const problemTitleFromUrl = searchParams.get("problemTitle");

    const [problems, setProblems] = useState([]);
    const [selectedProblemId, setSelectedProblemId] = useState(problemIdFromUrl || "");
    const [selectedProblemTitle, setSelectedProblemTitle] = useState(problemTitleFromUrl || "");

    const [testCases, setTestCases] = useState([]);
    const [loadingTestCases, setLoadingTestCases] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        input: "",
        expectedOutput: "",
        hidden: false
    });

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        try {
            const response = await axios.get(PROBLEM_API_URL);
            const data = Array.isArray(response.data) ? response.data : [];
            const normalProblems = data.filter(
                (problem) => !problem.source || problem.source === "NORMAL"
            );
            setProblems(normalProblems);
        } catch (error) {
            console.error("Error loading problems:", error);
            alert("Failed to load problems.");
        }
    };

    useEffect(() => {
        if (!problemIdFromUrl) return;

        setSelectedProblemId(String(problemIdFromUrl));

        if (problemTitleFromUrl) {
            setSelectedProblemTitle(problemTitleFromUrl);
        } else {
            const normalProblem = problems.find(
                (problem) => String(problem.id) === String(problemIdFromUrl)
            );
            if (normalProblem) {
                setSelectedProblemTitle(normalProblem.title);
            }
        }
    }, [problemIdFromUrl, problemTitleFromUrl, problems]);

    useEffect(() => {
        if (!selectedProblemId) {
            setTestCases([]);
            return;
        }
        fetchTestCases(selectedProblemId);
    }, [selectedProblemId]);

    const fetchTestCases = async (problemId) => {
        try {
            setLoadingTestCases(true);
            const url = `${TEST_CASE_API_URL}/problem/${problemId}`;
            const response = await axios.get(url);
            setTestCases(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error loading test cases:", error);
            setTestCases([]);
        } finally {
            setLoadingTestCases(false);
        }
    };

    const handleProblemChange = (event) => {
        const problemId = event.target.value;
        const problem = problems.find((item) => String(item.id) === String(problemId));

        setSelectedProblemId(problemId);
        setSelectedProblemTitle(problem?.title || "");
        setShowForm(false);
        setEditingId(null);
        resetForm();

        if (problemId) {
            setSearchParams({
                problemId: String(problemId),
                problemTitle: problem?.title || ""
            });
        } else {
            setSearchParams({});
        }
    };

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const resetForm = () => {
        setFormData({
            input: "",
            expectedOutput: "",
            hidden: false
        });
        setEditingId(null);
    };

    const handleAdd = () => {
        if (!selectedProblemId) {
            alert("Please select a problem first.");
            return;
        }
        resetForm();
        setShowForm(true);
    };

    const handleEdit = (testCase) => {
        setEditingId(testCase.id);
        setFormData({
            input: testCase.input || "",
            expectedOutput: testCase.expectedOutput || "",
            hidden: testCase.hidden === true
        });
        setShowForm(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedProblemId) {
            alert("Please select a problem.");
            return;
        }
        if (!formData.input.trim()) {
            alert("Please enter test case input.");
            return;
        }
        if (!formData.expectedOutput.trim()) {
            alert("Please enter expected output.");
            return;
        }

        try {
            if (editingId) {
                const response = await axios.put(`${TEST_CASE_API_URL}/${editingId}`, {
                    input: formData.input,
                    expectedOutput: formData.expectedOutput,
                    hidden: formData.hidden
                });

                setTestCases((prev) =>
                    prev.map((tc) => (tc.id === editingId ? response.data : tc))
                );
                alert("Test case updated successfully.");
            } else {
                const url = `${TEST_CASE_API_URL}/problem/${selectedProblemId}`;
                const response = await axios.post(url, {
                    input: formData.input,
                    expectedOutput: formData.expectedOutput,
                    hidden: formData.hidden
                });

                setTestCases((prev) => [...prev, response.data]);
                alert("Test case added successfully.");
            }

            resetForm();
            setShowForm(false);
        } catch (error) {
            console.error("Error saving test case:", error);
            alert(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to save test case."
            );
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this test case?")) return;

        try {
            await axios.delete(`${TEST_CASE_API_URL}/${id}`);
            setTestCases((prev) => prev.filter((tc) => tc.id !== id));
            alert("Test case deleted successfully.");
        } catch (error) {
            console.error("Error deleting test case:", error);
            alert(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to delete test case."
            );
        }
    };

    const selectedProblem = problems.find(
        (problem) => String(problem.id) === String(selectedProblemId)
    );

    const displayProblemTitle =
        selectedProblem?.title ||
        selectedProblemTitle ||
        (problemIdFromUrl ? `Certification Problem #${problemIdFromUrl}` : "");

    const isCertificationProblem = Boolean(problemIdFromUrl && !selectedProblem);

    return (
        <div className="testcase-management-page">
            {/* PAGE TITLE */}
            <div className="page-title">
                <h1>Test Case Management</h1>
                <p>Manage test cases for coding problems.</p>
            </div>

            {/* PROBLEM SELECTOR */}
            <div className="management-card">
                <div className="problem-selector">
                    <div>
                        <h2>Select Problem</h2>
                        <p>Select a problem to manage its test cases.</p>
                    </div>

                    <select value={selectedProblemId} onChange={handleProblemChange}>
                        <option value="">-- Select Problem --</option>
                        {problems.map((problem) => (
                            <option key={problem.id} value={problem.id}>
                                {problem.title} — {problem.difficulty}
                            </option>
                        ))}
                        {isCertificationProblem && (
                            <option value={problemIdFromUrl}>
                                {displayProblemTitle} — Certification Only
                            </option>
                        )}
                    </select>
                </div>
            </div>

            {/* SELECTED CERTIFICATION PROBLEM NOTICE */}
            {selectedProblemId && isCertificationProblem && (
                <div
                    className="management-card"
                    style={{ padding: "18px 24px", borderLeft: "3px solid #38bdf8" }}
                >
                    <strong style={{ color: "#f8fafc", fontSize: "14px" }}>
                        Certification-Only Problem
                    </strong>
                    <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "13px" }}>
                        Problem ID: {selectedProblemId} — {displayProblemTitle}
                    </p>
                </div>
            )}

            {/* TEST CASE SECTION */}
            {selectedProblemId && (
                <div className="management-card testcase-card">
                    {/* HEADER */}
                    <div className="table-header">
                        <div>
                            <h2>{displayProblemTitle}</h2>
                            <p className="table-subtitle">
                                {loadingTestCases
                                    ? "Loading test cases..."
                                    : `${testCases.length} test case${testCases.length === 1 ? "" : "s"}`}
                            </p>
                        </div>

                        <button type="button" className="add-button" onClick={handleAdd}>
                            + Add Test Case
                        </button>
                    </div>

                    {/* FORM */}
                    {showForm && (
                        <form className="testcase-form" onSubmit={handleSubmit}>
                            <div className="form-header">
                                <h2>{editingId ? "Edit Test Case" : "Add Test Case"}</h2>
                                <p>
                                    {editingId
                                        ? "Update the test case details."
                                        : `Create a test case for ${displayProblemTitle}.`}
                                </p>
                            </div>

                            <div className="form-group">
                                <label>Input</label>
                                <textarea
                                    name="input"
                                    value={formData.input}
                                    onChange={handleChange}
                                    placeholder="Enter complete test case input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Expected Output</label>
                                <textarea
                                    name="expectedOutput"
                                    value={formData.expectedOutput}
                                    onChange={handleChange}
                                    placeholder="Enter expected output"
                                    required
                                />
                            </div>

                            <div className="hidden-checkbox">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="hidden"
                                        checked={formData.hidden}
                                        onChange={handleChange}
                                    />
                                    Hidden Test Case
                                </label>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => {
                                        resetForm();
                                        setShowForm(false);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="save-button">
                                    {editingId ? "Update Test Case" : "Save Test Case"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* TABLE */}
                    {!showForm &&
                        (loadingTestCases ? (
                            <div className="empty-state">
                                <h3>Loading test cases...</h3>
                            </div>
                        ) : testCases.length === 0 ? (
                            <div className="empty-state">
                                <h3>No test cases yet</h3>
                                <p>Add the first test case for this problem.</p>
                            </div>
                        ) : (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Input</th>
                                            <th>Expected Output</th>
                                            <th>Type</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {testCases.map((testCase, index) => (
                                            <tr key={testCase.id}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <pre>{testCase.input}</pre>
                                                </td>
                                                <td>
                                                    <pre>{testCase.expectedOutput}</pre>
                                                </td>
                                                <td>
                                                    <span
                                                        className={
                                                            testCase.hidden
                                                                ? "testcase-badge hidden"
                                                                : "testcase-badge visible"
                                                        }
                                                    >
                                                        {testCase.hidden ? "Hidden" : "Visible"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="edit-button"
                                                        onClick={() => handleEdit(testCase)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="delete-button"
                                                        onClick={() => handleDelete(testCase.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}

export default TestCaseManagement;