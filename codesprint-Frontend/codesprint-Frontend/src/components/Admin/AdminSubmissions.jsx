import { useEffect, useState } from "react";
import "./AdminSubmissions.css";

function AdminSubmissions() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/submissions");
            if (!response.ok) {
                throw new Error("Failed to fetch submissions");
            }
            const data = await response.json();
            setSubmissions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Unable to load submissions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this submission?"
        );
        if (!confirmDelete) return;

        try {
            const response = await fetch(`/api/submissions/${id}`, {
                method: "DELETE"
            });
            if (!response.ok) {
                throw new Error("Failed to delete submission");
            }

            setSubmissions((prev) =>
                prev.filter((submission) => submission.id !== id)
            );
        } catch (err) {
            console.error(err);
            alert("Failed to delete submission");
        }
    };

    const filteredSubmissions = submissions.filter((submission) => {
        const q = search.toLowerCase();
        const matchesSearch =
            !q ||
            String(submission.id || "").toLowerCase().includes(q) ||
            String(submission.userId || "").toLowerCase().includes(q) ||
            String(submission.problemId || "").toLowerCase().includes(q) ||
            String(submission.language || "").toLowerCase().includes(q) ||
            String(submission.status || "").toLowerCase().includes(q);

        const matchesStatus =
            statusFilter === "All" ||
            (submission.status || "").toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const formatDate = (date) => {
        if (!date) return "-";
        const d = new Date(date);
        if (Number.isNaN(d.getTime())) return "-";
        return d.toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    };

    const getStatusClass = (status) => {
        if (!status) return "status-default";
        const val = status.toLowerCase();
        if (val.includes("accepted") || val.includes("success")) {
            return "status-accepted";
        }
        if (val.includes("wrong")) {
            return "status-wrong";
        }
        if (val.includes("runtime")) {
            return "status-runtime";
        }
        return "status-default";
    };

    if (loading) {
        return (
            <div className="admin-submissions-page">
                <div className="submissions-loading">
                    Loading submissions...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-submissions-page">
                <div className="submissions-error">{error}</div>
            </div>
        );
    }

    return (
        <div className="admin-submissions-page">
            {/* PAGE HEADER */}
            <div className="submissions-header">
                <div className="submissions-header-info">
                    <h1>All Submissions</h1>
                    <p>Monitor and manage all user code submissions.</p>
                </div>

                <div className="submission-count">
                    Total: <strong>{submissions.length}</strong>
                </div>
            </div>

            {/* TOOLBAR */}
            <div className="submissions-toolbar">
                <div className="submissions-search-wrapper">
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by ID, user, problem, language..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    className="submissions-status-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Wrong Answer">Wrong Answer</option>
                    <option value="Runtime Error">Runtime Error</option>
                </select>
            </div>

            {/* TABLE */}
            <div className="submissions-table-container">
                <table className="submissions-table">
                    <thead>
                        <tr>
                            <th>Submission ID</th>
                            <th>User ID</th>
                            <th>Problem ID</th>
                            <th>Language</th>
                            <th>Status</th>
                            <th>Submitted At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredSubmissions.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-submissions">
                                    No submissions found.
                                </td>
                            </tr>
                        ) : (
                            filteredSubmissions.map((submission) => (
                                <tr key={submission.id}>
                                    <td>
                                        <span className="submission-id-text">
                                            #{submission.id}
                                        </span>
                                    </td>
                                    <td>{submission.userId}</td>
                                    <td>{submission.problemId}</td>
                                    <td>
                                        <span className="language-badge">
                                            {submission.language}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            className={`submission-status ${getStatusClass(
                                                submission.status
                                            )}`}
                                        >
                                            {submission.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="submission-date-text">
                                            {formatDate(submission.submittedAt)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="submission-actions">
                                            <button
                                                className="view-btn"
                                                type="button"
                                                onClick={() =>
                                                    alert(
                                                        `Submission ID: ${submission.id}`
                                                    )
                                                }
                                            >
                                                View
                                            </button>
                                            <button
                                                className="delete-btn"
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(submission.id)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminSubmissions;