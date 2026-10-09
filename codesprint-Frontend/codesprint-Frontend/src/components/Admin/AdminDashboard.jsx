import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [problems, setProblems] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                setError("");

                const [usersRes, problemsRes, submissionsRes] = await Promise.all([
                    axios.get("/api/admin/users"),
                    axios.get("/api/problems"),
                    axios.get("/api/submissions")
                ]);

                setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
                setProblems(Array.isArray(problemsRes.data) ? problemsRes.data : []);
                setSubmissions(Array.isArray(submissionsRes.data) ? submissionsRes.data : []);
            } catch (err) {
                console.error("Admin dashboard error:", err);
                setError("Unable to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const stats = useMemo(() => {
        const totalUsers = users.length;
        const totalProblems = problems.length;
        const activeUsers = users.filter((u) => u.active === true).length;
        const totalSubmissions = submissions.length;

        const acceptedSolutions = submissions.filter((sub) => {
            const status = sub.status?.toLowerCase().trim();
            return status === "accepted" || status?.includes("accepted");
        }).length;

        const todayString = new Date().toLocaleDateString("en-CA");
        const todaySubmissions = submissions.filter((sub) => {
            if (!sub.submittedAt) return false;
            const date = new Date(sub.submittedAt);
            if (Number.isNaN(date.getTime())) return false;
            return date.toLocaleDateString("en-CA") === todayString;
        }).length;

        return {
            totalUsers,
            totalProblems,
            activeUsers,
            totalSubmissions,
            acceptedSolutions,
            todaySubmissions
        };
    }, [users, problems, submissions]);

    const problemMap = useMemo(() => {
        const map = {};
        problems.forEach((p) => {
            map[Number(p.id)] = p;
        });
        return map;
    }, [problems]);

    const submissionStats = useMemo(() => {
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() - i);
            const dateString = date.toLocaleDateString("en-CA");

            const count = submissions.filter((sub) => {
                if (!sub.submittedAt) return false;
                const d = new Date(sub.submittedAt);
                if (Number.isNaN(d.getTime())) return false;
                return d.toLocaleDateString("en-CA") === dateString;
            }).length;

            result.push({
                date: dateString,
                label: date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short"
                }),
                count
            });
        }
        return result;
    }, [submissions]);

    const maxSubmissionCount = useMemo(() => {
        return Math.max(...submissionStats.map((item) => item.count), 1);
    }, [submissionStats]);

    const languageUsage = useMemo(() => {
        const usage = {
            Java: 0,
            Python: 0,
            "C++": 0,
            JavaScript: 0
        };

        submissions.forEach((sub) => {
            const lang = sub.language?.toLowerCase().trim();
            if (lang === "java") usage.Java++;
            else if (lang === "python") usage.Python++;
            else if (lang === "cpp" || lang === "c++") usage["C++"]++;
            else if (lang === "javascript" || lang === "js") usage.JavaScript++;
        });

        return usage;
    }, [submissions]);

    const languageTotal = Object.values(languageUsage).reduce(
        (sum, val) => sum + val,
        0
    );

    const donutStyle = useMemo(() => {
        if (languageTotal === 0) {
            return { background: "#142238" };
        }

        const colors = ["#38bdf8", "#fbbf24", "#818cf8", "#34d399"];
        let currentDegree = 0;

        const segments = Object.values(languageUsage).map((value, index) => {
            const degree = (value / languageTotal) * 360;
            const start = currentDegree;
            const end = currentDegree + degree;
            currentDegree = end;
            return `${colors[index]} ${start}deg ${end}deg`;
        });

        return {
            background: `conic-gradient(${segments.join(",")})`
        };
    }, [languageUsage, languageTotal]);

    const recentSubmissions = useMemo(() => {
        return [...submissions]
            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
            .slice(0, 5);
    }, [submissions]);

    const getProblemTitle = (problemId) => {
        const problem = problemMap[Number(problemId)];
        return problem ? problem.title : `Problem #${problemId}`;
    };

    const getStatusClass = (status) => {
        if (!status) return "status-other";
        const val = status.toLowerCase().trim();
        if (val.includes("accepted") || val.includes("success")) return "status-accepted";
        if (val.includes("wrong") || val.includes("failed") || val.includes("error")) return "status-failed";
        return "status-other";
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return "-";
        const d = new Date(dateValue);
        if (Number.isNaN(d.getTime())) return "-";
        return d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const formatTime = (dateValue) => {
        if (!dateValue) return "-";
        const d = new Date(dateValue);
        if (Number.isNaN(d.getTime())) return "-";
        return d.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1>Dashboard Overview</h1>
                    <p>Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1>Dashboard Overview</h1>
                    <p className="dashboard-error-text">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            {/* HEADER */}
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard Overview</h1>
                    <p>Monitor and manage your CodeSprint platform.</p>
                </div>
            </div>

            {/* METRICS CARDS */}
            <div className="dashboard-cards">
                <div className="dashboard-card">
                    <div className="card-icon users">
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div className="card-content">
                        <span>Total Users</span>
                        <strong>{stats.totalUsers}</strong>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-icon problems">
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className="card-content">
                        <span>Total Problems</span>
                        <strong>{stats.totalProblems}</strong>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-icon active">
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="card-content">
                        <span>Active Users</span>
                        <strong>{stats.activeUsers}</strong>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-icon submissions">
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </div>
                    <div className="card-content">
                        <span>Total Submissions</span>
                        <strong>{stats.totalSubmissions}</strong>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-icon accepted">
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div className="card-content">
                        <span>Accepted Solutions</span>
                        <strong>{stats.acceptedSolutions}</strong>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-icon today">
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                    <div className="card-content">
                        <span>Today's Submissions</span>
                        <strong>{stats.todaySubmissions}</strong>
                    </div>
                </div>
            </div>

            {/* SUBMISSION STATISTICS BAR CHART */}
            <section className="dashboard-section chart-section">
                <div className="section-header">
                    <h2>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="20" x2="18" y2="10"></line>
                            <line x1="12" y1="20" x2="12" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="14"></line>
                        </svg>
                        Submission Statistics
                    </h2>
                    <p>Coding submissions during the last 7 days.</p>
                </div>

                <div className="bar-chart">
                    {submissionStats.map((item) => {
                        const height =
                            item.count === 0
                                ? 4
                                : Math.max(12, (item.count / maxSubmissionCount) * 100);

                        return (
                            <div className="bar-column" key={item.date}>
                                <div className="bar-value">{item.count}</div>
                                <div className="bar-wrapper">
                                    <div className="bar-fill" style={{ height: `${height}%` }} />
                                </div>
                                <span className="bar-label">{item.label}</span>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* LANGUAGE USAGE */}
            <section className="dashboard-section language-section">
                <div className="section-header">
                    <h2>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="16 18 22 12 16 6"></polyline>
                            <polyline points="8 6 2 12 8 18"></polyline>
                        </svg>
                        Language Usage
                    </h2>
                    <p>Programming languages used across submissions.</p>
                </div>

                <div className="language-chart-container">
                    <div className="language-donut" style={donutStyle}>
                        <div className="donut-inner">
                            <strong>{languageTotal}</strong>
                            <span>Submissions</span>
                        </div>
                    </div>

                    <div className="language-legend">
                        {Object.entries(languageUsage).map(([language, count], index) => {
                            const percentage =
                                languageTotal === 0
                                    ? 0
                                    : Math.round((count / languageTotal) * 100);

                            return (
                                <div className="language-legend-item" key={language}>
                                    <div className="language-legend-name">
                                        <span className={`language-color language-color-${index}`} />
                                        <span>{language}</span>
                                    </div>
                                    <strong>{count}</strong>
                                    <small>{percentage}%</small>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* RECENT SUBMISSIONS */}
            <section className="dashboard-section recent-submissions">
                <div className="section-header">
                    <h2>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Recent Submissions
                    </h2>
                    <p>Latest coding submissions recorded on CodeSprint.</p>
                </div>

                <div className="submission-table-wrapper">
                    <table className="submission-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Problem</th>
                                <th>Language</th>
                                <th>Verdict</th>
                                <th>Time</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentSubmissions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="no-submissions">
                                        No submissions yet.
                                    </td>
                                </tr>
                            ) : (
                                recentSubmissions.map((sub) => (
                                    <tr key={sub.id}>
                                        <td>
                                            <span className="user-id-badge">
                                                User #{sub.userId}
                                            </span>
                                        </td>
                                        <td>
                                            <strong style={{ color: "#f8fafc" }}>
                                                {getProblemTitle(sub.problemId)}
                                            </strong>
                                        </td>
                                        <td>
                                            <span className="language-badge">
                                                {sub.language}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(sub.status)}`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td>{formatTime(sub.submittedAt)}</td>
                                        <td>{formatDate(sub.submittedAt)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

export default AdminDashboard;