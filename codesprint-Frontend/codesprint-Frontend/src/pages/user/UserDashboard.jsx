import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";

function UserDashboard() {
    const navigate = useNavigate();

    // LOGGED-IN USER
    const storedUser = localStorage.getItem("user");
    let user = null;
    try {
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch (err) {
        console.error("Invalid user data:", err);
        user = null;
    }
    const userName = user?.name || "User";

    // STATE
    const [dashboardData, setDashboardData] = useState(null);
    const [problems, setProblems] = useState([]);
    const [myRanking, setMyRanking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // LOAD PROBLEMS
    useEffect(() => {
        const loadProblems = async () => {
            try {
                const response = await axios.get("/api/problems");
                setProblems(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error("Problem loading error:", err);
            }
        };
        loadProblems();
    }, []);

    // LOAD DASHBOARD DATA + CURRENT RANK
    useEffect(() => {
        if (!user?.id) {
            setError("Please login to view your dashboard.");
            setLoading(false);
            return;
        }

        const loadDashboardData = async () => {
            try {
                setError("");

                const [dashboardResponse, rankingResponse] =
                    await Promise.all([
                        axios.get(
                            `/api/submissions/user/${user.id}/dashboard`
                        ),
                        axios.get(
                            `/api/leaderboards/user/${user.id}`
                        )
                    ]);

                setDashboardData(dashboardResponse.data);
                setMyRanking(rankingResponse.data || null);
            } catch (err) {
                console.error("Dashboard loading error:", err);

                // Keep dashboard working even if the ranking endpoint
                // is temporarily unavailable.
                try {
                    const dashboardResponse = await axios.get(
                        `/api/submissions/user/${user.id}/dashboard`
                    );

                    setDashboardData(dashboardResponse.data);
                } catch (dashboardErr) {
                    console.error(
                        "Dashboard data loading error:",
                        dashboardErr
                    );
                    setError("Unable to load dashboard data.");
                }

                try {
                    const rankingResponse = await axios.get(
                        `/api/leaderboards/user/${user.id}`
                    );

                    setMyRanking(rankingResponse.data || null);
                } catch (rankingErr) {
                    console.error(
                        "Ranking loading error:",
                        rankingErr
                    );
                    setMyRanking(null);
                }
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
        const interval = setInterval(loadDashboardData, 5000);

        return () => clearInterval(interval);
    }, [user?.id]);

    // METRICS
    const problemsSolved = dashboardData?.problemsSolved || 0;
    const acceptanceRate = dashboardData?.acceptanceRate || 0;
    const codingStreak = dashboardData?.codingStreak || 0;

    const easySolved = dashboardData?.easySolved || 0;
    const mediumSolved = dashboardData?.mediumSolved || 0;
    const hardSolved = dashboardData?.hardSolved || 0;

    const totalEasy = dashboardData?.totalEasy || 0;
    const totalMedium = dashboardData?.totalMedium || 0;
    const totalHard = dashboardData?.totalHard || 0;

    const languageUsage = dashboardData?.languageUsage || {};
    const recentSubmissions = dashboardData?.recentSubmissions || [];
    const heatmap = dashboardData?.heatmap || {};

    // CURRENT PLATFORM RANK
    const currentRank = myRanking?.rank;

    // PROBLEM LOOKUP
    const problemMap = useMemo(() => {
        const map = {};
        problems.forEach((problem) => {
            map[Number(problem.id)] = problem;
        });
        return map;
    }, [problems]);

    const getDifficultyPercentage = (solved, total) => {
        if (total === 0) return 0;
        return Math.min(100, Math.round((solved / total) * 100));
    };

    // HEATMAP DATA (91 DAYS)
    const heatmapData = useMemo(() => {
        const result = [];
        for (let i = 90; i >= 0; i--) {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() - i);

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const dateString = `${year}-${month}-${day}`;

            result.push({
                date: dateString,
                count: heatmap[dateString] || 0
            });
        }
        return result;
    }, [heatmap]);

    const getHeatmapLevel = (count) => {
        if (count === 0) return "level-0";
        if (count === 1) return "level-1";
        if (count === 2) return "level-2";
        if (count <= 4) return "level-3";
        return "level-4";
    };

    const getProblemTitle = (problemId) => {
        const problem = problemMap[Number(problemId)];
        return problem ? problem.title : `Problem #${problemId}`;
    };

    const getStatusClass = (status) => {
        if (!status) return "other";
        const val = status.toLowerCase();
        if (val.includes("accepted") || val.includes("success")) return "accepted";
        if (val.includes("wrong") || val.includes("failed") || val.includes("error")) return "failed";
        return "other";
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
            <div className="user-dashboard">
                <main className="dashboard-content">
                    <section className="welcome-section">
                        <h1>Loading Dashboard...</h1>
                        <p>Loading your coding progress.</p>
                    </section>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="user-dashboard">
                <main className="dashboard-content">
                    <section className="welcome-section">
                        <h1>Dashboard</h1>
                        <p style={{ color: "#f87171" }}>{error}</p>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="user-dashboard">
            <main className="dashboard-content">
                {/* WELCOME */}
                <section className="welcome-section">
                    <h1>Welcome, {userName}</h1>
                    <p>Track your coding progress and continue improving your skills.</p>
                </section>

                {/* STATISTICS CARDS */}
                <section className="stats-section">
                    <div className="stat-box">
                        <span className="stat-label">Problems Solved</span>
                        <strong className="stat-value">{problemsSolved}</strong>
                    </div>

                    <div className="stat-box">
                        <span className="stat-label">Current Rank</span>
                        <strong className="stat-value">
                            {currentRank ? `#${currentRank}` : "-"}
                        </strong>
                    </div>

                    <div className="stat-box">
                        <span className="stat-label">Acceptance Rate</span>
                        <strong className="stat-value">{acceptanceRate}%</strong>
                    </div>

                    <div className="stat-box">
                        <span className="stat-label">Coding Streak</span>
                        <strong className="stat-value">{codingStreak} days</strong>
                    </div>
                </section>

                {/* SOLVED BY DIFFICULTY */}
                <section className="dashboard-card">
                    <div className="section-heading">
                        <h2>
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Solved by Difficulty
                        </h2>
                        <p>Your solved problems by difficulty level.</p>
                    </div>

                    <div className="difficulty-content">
                        {/* EASY */}
                        <div className="difficulty-item">
                            <div className="difficulty-top">
                                <span className="difficulty-name easy">Easy</span>
                                <span>{easySolved} / {totalEasy} solved</span>
                            </div>
                            <div className="difficulty-bar">
                                <div
                                    className="difficulty-progress easy-progress"
                                    style={{ width: `${getDifficultyPercentage(easySolved, totalEasy)}%` }}
                                />
                            </div>
                        </div>

                        {/* MEDIUM */}
                        <div className="difficulty-item">
                            <div className="difficulty-top">
                                <span className="difficulty-name medium">Medium</span>
                                <span>{mediumSolved} / {totalMedium} solved</span>
                            </div>
                            <div className="difficulty-bar">
                                <div
                                    className="difficulty-progress medium-progress"
                                    style={{ width: `${getDifficultyPercentage(mediumSolved, totalMedium)}%` }}
                                />
                            </div>
                        </div>

                        {/* HARD */}
                        <div className="difficulty-item">
                            <div className="difficulty-top">
                                <span className="difficulty-name hard">Hard</span>
                                <span>{hardSolved} / {totalHard} solved</span>
                            </div>
                            <div className="difficulty-bar">
                                <div
                                    className="difficulty-progress hard-progress"
                                    style={{ width: `${getDifficultyPercentage(hardSolved, totalHard)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* HEATMAP */}
                <section className="dashboard-card">
                    <div className="section-heading">
                        <h2>
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                            </svg>
                            Coding Heatmap Calendar
                        </h2>
                        <p>Your coding activity over time.</p>
                    </div>

                    <div className="heatmap-container">
                        <div className="heatmap-grid">
                            {heatmapData.map((item) => (
                                <span
                                    key={item.date}
                                    className={`heatmap-cell ${getHeatmapLevel(item.count)}`}
                                    title={`${item.date}: ${item.count} submission${item.count === 1 ? "" : "s"}`}
                                />
                            ))}
                        </div>

                        <div className="heatmap-legend">
                            <span>Less</span>
                            <span className="legend-cell level-0" />
                            <span className="legend-cell level-1" />
                            <span className="legend-cell level-2" />
                            <span className="legend-cell level-3" />
                            <span className="legend-cell level-4" />
                            <span>More</span>
                        </div>
                    </div>
                </section>

                {/* LANGUAGE USAGE */}
                <section className="dashboard-card">
                    <div className="section-heading">
                        <h2>
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Language Usage
                        </h2>
                        <p>Programming languages used across all your submissions.</p>
                    </div>

                    <div className="language-list">
                        <div className="language-item">
                            <span className="language-info">
                                <i className="language-dot java-dot" /> Java
                            </span>
                            <strong>{languageUsage.Java || 0}</strong>
                        </div>

                        <div className="language-item">
                            <span className="language-info">
                                <i className="language-dot python-dot" /> Python
                            </span>
                            <strong>{languageUsage.Python || 0}</strong>
                        </div>

                        <div className="language-item">
                            <span className="language-info">
                                <i className="language-dot c-dot" /> C
                            </span>
                            <strong>{languageUsage.C || 0}</strong>
                        </div>

                        <div className="language-item">
                            <span className="language-info">
                                <i className="language-dot cpp-dot" /> C++
                            </span>
                            <strong>{languageUsage["C++"] || 0}</strong>
                        </div>

                        <div className="language-item">
                            <span className="language-info">
                                <i className="language-dot javascript-dot" /> JavaScript
                            </span>
                            <strong>{languageUsage.JavaScript || 0}</strong>
                        </div>
                    </div>
                </section>

                {/* RECENT SUBMISSIONS */}
                <section className="dashboard-card recent-submissions">
                    <div className="section-heading">
                        <h2>
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Recent Submissions
                        </h2>
                        <p>Your latest 5 coding submissions.</p>
                    </div>

                    <div className="submission-table-wrapper">
                        <table className="submission-table">
                            <thead>
                                <tr>
                                    <th>Problem</th>
                                    <th>Verdict</th>
                                    <th>Language</th>
                                    <th>Time</th>
                                    <th>Date</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentSubmissions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="no-submissions">
                                            No submissions yet.
                                        </td>
                                    </tr>
                                ) : (
                                    recentSubmissions.map((submission) => (
                                        <tr key={submission.id}>
                                            <td>
                                                <strong>
                                                    {getProblemTitle(submission.problemId)}
                                                </strong>
                                            </td>
                                            <td>
                                                <span
                                                    className={`status-badge ${getStatusClass(
                                                        submission.status
                                                    )}`}
                                                >
                                                    {submission.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="language-badge">
                                                    {submission.language}
                                                </span>
                                            </td>
                                            <td>{formatTime(submission.submittedAt)}</td>
                                            <td>{formatDate(submission.submittedAt)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {recentSubmissions.length > 0 && (
                            <div style={{ textAlign: "right", marginTop: "16px" }}>
                                <button
                                    type="button"
                                    onClick={() => navigate("/user/submissions")}
                                    style={{
                                        border: "none",
                                        background: "none",
                                        color: "#38bdf8",
                                        fontSize: "13.5px",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        padding: "4px 8px"
                                    }}
                                >
                                    View All Submissions →
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default UserDashboard;
