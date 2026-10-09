import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ProgressDashboard.css";

const API_BASE = "";

function ProgressDashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [submissions, setSubmissions] = useState([]);
    const [problems, setProblems] = useState([]);

    const [leaderboard, setLeaderboard] = useState(null);
    const [contestResults, setContestResults] = useState([]);
    const [certificationAttempts, setCertificationAttempts] = useState([]);
    const [certificates, setCertificates] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    // =========================================================
    // LOAD USER
    // =========================================================

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            navigate("/login");
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);

            if (!parsedUser?.id) {
                throw new Error("User information is missing.");
            }

            setUser(parsedUser);
        } catch (loadError) {
            console.error(
                "Invalid logged-in user:",
                loadError
            );

            localStorage.removeItem("user");
            localStorage.removeItem("token");

            navigate("/login");
        }
    }, [navigate]);

    // =========================================================
    // LOAD PROGRESS DATA
    // =========================================================

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        loadProgress();
    }, [user?.id]);

    const loadProgress = async () => {
        try {
            setError("");

            if (!loading) {
                setRefreshing(true);
            }

            const [
                submissionsResponse,
                problemsResponse,
                leaderboardResponse,
                contestResponse,
                certificationResponse,
                certificateResponse
            ] = await Promise.all([
                axios.get(
                    `${API_BASE}/api/submissions/user/${user.id}`
                ),

                axios.get(
                    `${API_BASE}/api/problems`
                ),

                // Optional analytics sources.
                // A failure in one of these should not break
                // the main coding-progress dashboard.
                axios.get(
                    `${API_BASE}/api/leaderboards/user/${user.id}`
                ).catch(() => ({
                    data: null
                })),

                axios.get(
                    `${API_BASE}/api/contests/user/${user.id}/results`
                ).catch(() => ({
                    data: []
                })),

                axios.get(
                    `${API_BASE}/api/certifications/user/${user.id}/attempts`
                ).catch(() => ({
                    data: []
                })),

                axios.get(
                    `${API_BASE}/api/certificates/user/${user.id}`
                ).catch(() => ({
                    data: []
                }))
            ]);

            setSubmissions(
                Array.isArray(submissionsResponse.data)
                    ? submissionsResponse.data
                    : []
            );

            setProblems(
                Array.isArray(problemsResponse.data)
                    ? problemsResponse.data
                    : []
            );

            setLeaderboard(
                leaderboardResponse.data || null
            );

            setContestResults(
                Array.isArray(contestResponse.data)
                    ? contestResponse.data
                    : []
            );

            setCertificationAttempts(
                Array.isArray(certificationResponse.data)
                    ? certificationResponse.data
                    : []
            );

            setCertificates(
                Array.isArray(certificateResponse.data)
                    ? certificateResponse.data
                    : []
            );
        } catch (loadError) {
            console.error(
                "Progress dashboard loading error:",
                loadError
            );

            setError(
                loadError.response?.data?.message ||
                "Unable to load your progress dashboard."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // =========================================================
    // STATUS HELPERS
    // =========================================================

    const isAccepted = (status) => {
        const value = String(status || "")
            .toLowerCase()
            .trim();

        return (
            value === "accepted" ||
            value.includes("accepted") ||
            value.includes("success")
        );
    };

    const getStatusClass = (status) => {
        const value = String(status || "")
            .toLowerCase()
            .trim();

        if (isAccepted(value)) {
            return "progress-status accepted";
        }

        if (
            value.includes("wrong") ||
            value.includes("failed")
        ) {
            return "progress-status wrong";
        }

        if (
            value.includes("runtime") ||
            value.includes("compile") ||
            value.includes("error")
        ) {
            return "progress-status error";
        }

        return "progress-status other";
    };

    // =========================================================
    // UNIQUE SOLVED PROBLEMS
    // =========================================================

    const solvedProblemIds = useMemo(() => {
        return new Set(
            submissions
                .filter((submission) =>
                    isAccepted(submission.status)
                )
                .map((submission) =>
                    Number(submission.problemId)
                )
                .filter((id) =>
                    Number.isFinite(id)
                )
        );
    }, [submissions]);

    const problemsSolved = solvedProblemIds.size;

    // =========================================================
    // ACCEPTANCE RATE
    // =========================================================

    const acceptanceRate = useMemo(() => {
        if (submissions.length === 0) {
            return 0;
        }

        const acceptedCount = submissions.filter(
            (submission) =>
                isAccepted(submission.status)
        ).length;

        return Math.round(
            (acceptedCount / submissions.length) * 100
        );
    }, [submissions]);

    // =========================================================
    // PROBLEM MAP
    // =========================================================

    const problemMap = useMemo(() => {
        const map = {};

        problems.forEach((problem) => {
            map[Number(problem.id)] = problem;
        });

        return map;
    }, [problems]);

    // =========================================================
    // DIFFICULTY STATS
    // =========================================================

    const difficultyStats = useMemo(() => {
        const result = {
            easy: {
                solved: 0,
                total: 0
            },
            medium: {
                solved: 0,
                total: 0
            },
            hard: {
                solved: 0,
                total: 0
            }
        };

        problems.forEach((problem) => {
            const difficulty = String(
                problem.difficulty || ""
            )
                .toLowerCase()
                .trim();

            if (
                difficulty !== "easy" &&
                difficulty !== "medium" &&
                difficulty !== "hard"
            ) {
                return;
            }

            result[difficulty].total += 1;

            if (
                solvedProblemIds.has(
                    Number(problem.id)
                )
            ) {
                result[difficulty].solved += 1;
            }
        });

        return result;
    }, [problems, solvedProblemIds]);

    const getProgressPercent = (
        solved,
        total
    ) => {
        if (!total) {
            return 0;
        }

        return Math.min(
            100,
            Math.round((solved / total) * 100)
        );
    };

    // =========================================================
    // CATEGORY / TOPIC PROGRESS
    // =========================================================

    const categoryStats = useMemo(() => {
        const categories = {};

        problems.forEach((problem) => {
            const category =
                String(
                    problem.category || "General"
                ).trim() || "General";

            if (!categories[category]) {
                categories[category] = {
                    name: category,
                    total: 0,
                    solved: 0
                };
            }

            categories[category].total += 1;

            if (
                solvedProblemIds.has(
                    Number(problem.id)
                )
            ) {
                categories[category].solved += 1;
            }
        });

        return Object.values(categories)
            .sort(
                (a, b) =>
                    b.total - a.total ||
                    a.name.localeCompare(b.name)
            )
            .slice(0, 8);
    }, [problems, solvedProblemIds]);

    // =========================================================
    // CODING STREAK
    // =========================================================

    const activityDates = useMemo(() => {
        const dates = new Set();

        submissions.forEach((submission) => {
            if (!submission.submittedAt) {
                return;
            }

            const date =
                new Date(submission.submittedAt);

            if (Number.isNaN(date.getTime())) {
                return;
            }

            dates.add(
                date.toLocaleDateString(
                    "en-CA"
                )
            );
        });

        return dates;
    }, [submissions]);

    const currentStreak = useMemo(() => {
        if (activityDates.size === 0) {
            return 0;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayString =
            today.toLocaleDateString(
                "en-CA"
            );

        const yesterday = new Date(today);
        yesterday.setDate(
            yesterday.getDate() - 1
        );

        const yesterdayString =
            yesterday.toLocaleDateString(
                "en-CA"
            );

        if (
            !activityDates.has(todayString) &&
            !activityDates.has(yesterdayString)
        ) {
            return 0;
        }

        let cursor = activityDates.has(todayString)
            ? today
            : yesterday;

        let streak = 0;

        while (true) {
            const currentString =
                cursor.toLocaleDateString(
                    "en-CA"
                );

            if (
                !activityDates.has(
                    currentString
                )
            ) {
                break;
            }

            streak += 1;

            cursor = new Date(cursor);
            cursor.setDate(
                cursor.getDate() - 1
            );
        }

        return streak;
    }, [activityDates]);

    // =========================================================
    // LONGEST STREAK
    // =========================================================

    const longestStreak = useMemo(() => {
        if (activityDates.size === 0) {
            return 0;
        }

        const sorted = Array.from(
            activityDates
        ).sort();

        let longest = 1;
        let current = 1;

        for (
            let index = 1;
            index < sorted.length;
            index += 1
        ) {
            const previous =
                new Date(sorted[index - 1]);

            const currentDate =
                new Date(sorted[index]);

            const diff =
                Math.round(
                    (
                        currentDate -
                        previous
                    ) /
                    86400000
                );

            if (diff === 1) {
                current += 1;
                longest = Math.max(
                    longest,
                    current
                );
            } else {
                current = 1;
            }
        }

        return longest;
    }, [activityDates]);

    // =========================================================
    // HEATMAP - LAST 12 WEEKS
    // =========================================================

    const heatmapData = useMemo(() => {
        const activity = {};

        submissions.forEach((submission) => {
            if (!submission.submittedAt) {
                return;
            }

            const date =
                new Date(
                    submission.submittedAt
                );

            if (Number.isNaN(date.getTime())) {
                return;
            }

            const dateString =
                date.toLocaleDateString(
                    "en-CA"
                );

            activity[dateString] =
                (activity[dateString] || 0) + 1;
        });

        const result = [];

        for (
            let index = 83;
            index >= 0;
            index -= 1
        ) {
            const date = new Date();
            date.setHours(
                0,
                0,
                0,
                0
            );

            date.setDate(
                date.getDate() - index
            );

            const dateString =
                date.toLocaleDateString(
                    "en-CA"
                );

            result.push({
                date: dateString,
                count:
                    activity[dateString] ||
                    0
            });
        }

        return result;
    }, [submissions]);

    const getHeatmapLevel = (count) => {
        if (count === 0) {
            return "level-0";
        }

        if (count === 1) {
            return "level-1";
        }

        if (count === 2) {
            return "level-2";
        }

        if (count <= 4) {
            return "level-3";
        }

        return "level-4";
    };

    // =========================================================
    // THIS WEEK
    // =========================================================

    const weeklyStats = useMemo(() => {
        const today = new Date();
        today.setHours(
            0,
            0,
            0,
            0
        );

        const day =
            today.getDay();

        const mondayOffset =
            day === 0 ? 6 : day - 1;

        const weekStart =
            new Date(today);

        weekStart.setDate(
            today.getDate() -
            mondayOffset
        );

        let submissionsThisWeek = 0;
        let acceptedThisWeek = 0;
        const solvedThisWeek = new Set();
        const codingDays = new Set();

        submissions.forEach((submission) => {
            if (!submission.submittedAt) {
                return;
            }

            const submitted =
                new Date(
                    submission.submittedAt
                );

            if (
                Number.isNaN(
                    submitted.getTime()
                )
            ) {
                return;
            }

            submitted.setHours(
                0,
                0,
                0,
                0
            );

            if (
                submitted < weekStart ||
                submitted > today
            ) {
                return;
            }

            submissionsThisWeek += 1;

            const dayString =
                submitted.toLocaleDateString(
                    "en-CA"
                );

            codingDays.add(
                dayString
            );

            if (
                isAccepted(
                    submission.status
                )
            ) {
                acceptedThisWeek += 1;

                solvedThisWeek.add(
                    Number(
                        submission.problemId
                    )
                );
            }
        });

        return {
            submissions: submissionsThisWeek,
            accepted: acceptedThisWeek,
            solved:
                Array.from(
                    solvedThisWeek
                ).filter(Number.isFinite).length,
            codingDays: codingDays.size
        };
    }, [submissions]);

    // =========================================================
    // LANGUAGE USAGE
    // =========================================================

    const languageStats = useMemo(() => {
        const counts = {};

        submissions.forEach((submission) => {
            const raw =
                String(
                    submission.language ||
                    "Unknown"
                )
                    .trim();

            if (!raw) {
                return;
            }

            const normalized =
                raw.toLowerCase();

            let display = raw;

            if (normalized === "c++" ||
                normalized === "cpp") {
                display = "C++";
            } else if (
                normalized === "javascript" ||
                normalized === "js"
            ) {
                display = "JavaScript";
            } else if (
                normalized === "python"
            ) {
                display = "Python";
            } else if (
                normalized === "java"
            ) {
                display = "Java";
            } else if (
                normalized === "c"
            ) {
                display = "C";
            }

            counts[display] =
                (counts[display] || 0) + 1;
        });

        const total =
            Object.values(counts)
                .reduce(
                    (sum, value) =>
                        sum + value,
                    0
                );

        return Object.entries(counts)
            .map(([name, count]) => ({
                name,
                count,
                percentage:
                    total > 0
                        ? Math.round(
                              (
                                  count /
                                  total
                              ) * 100
                          )
                        : 0
            }))
            .sort(
                (a, b) =>
                    b.count - a.count
            )
            .slice(0, 5);
    }, [submissions]);

    // =========================================================
    // RECENT SUBMISSIONS
    // =========================================================

    const recentSubmissions = useMemo(() => {
        return [...submissions]
            .sort((a, b) => {
                const aTime =
                    new Date(
                        a.submittedAt
                    ).getTime();

                const bTime =
                    new Date(
                        b.submittedAt
                    ).getTime();

                return bTime - aTime;
            })
            .slice(0, 7);
    }, [submissions]);

    const getProblemTitle = (
        problemId
    ) => {
        const problem =
            problemMap[
                Number(problemId)
            ];

        return (
            problem?.title ||
            `Problem #${problemId}`
        );
    };

    // =========================================================
    // CONTEST STATS
    // =========================================================

    const contestStats = useMemo(() => {
        const completed =
            contestResults.filter(
                (result) =>
                    String(
                        result.status || ""
                    ).toUpperCase() ===
                    "FINISHED"
            );

        return {
            participated:
                contestResults.length,
            completed:
                completed.length,
            solved:
                contestResults.reduce(
                    (
                        total,
                        result
                    ) =>
                        total +
                        Number(
                            result.problemsSolved ||
                            0
                        ),
                    0
                ),
            score:
                contestResults.reduce(
                    (
                        total,
                        result
                    ) =>
                        total +
                        Number(
                            result.score ||
                            0
                        ),
                    0
                )
        };
    }, [contestResults]);

    // =========================================================
    // CERTIFICATION STATS
    // =========================================================

    const certificationStats = useMemo(() => {
        const attempts =
            certificationAttempts;

        const passed =
            attempts.filter(
                (attempt) =>
                    attempt.passed === true ||
                    String(
                        attempt.status ||
                        ""
                    ).toUpperCase() ===
                        "PASS"
            );

        const inProgress =
            attempts.filter(
                (attempt) =>
                    String(
                        attempt.status ||
                        ""
                    ).toUpperCase() ===
                    "IN_PROGRESS"
            );

        const failed =
            attempts.filter(
                (attempt) => {
                    const status =
                        String(
                            attempt.status ||
                            ""
                        ).toUpperCase();

                    return (
                        status === "FAIL" ||
                        status === "FAILED" ||
                        status ===
                            "TIME_EXPIRED"
                    );
                }
            );

        return {
            attempts:
                attempts.length,
            passed:
                passed.length,
            inProgress:
                inProgress.length,
            failed:
                failed.length,
            certificates:
                certificates.length
        };
    }, [
        certificationAttempts,
        certificates
    ]);

    // =========================================================
    // LEADERBOARD RANK
    // =========================================================

    const myRank =
        leaderboard?.rank ??
        leaderboard?.userRank ??
        leaderboard?.currentRank ??
        null;

    // =========================================================
    // BADGES
    // =========================================================

    const achievements = useMemo(() => {
        const items = [];

        if (problemsSolved >= 1) {
            items.push({
                icon: "🚀",
                title: "First Problem",
                text: "Solved your first coding problem."
            });
        }

        if (problemsSolved >= 10) {
            items.push({
                icon: "🎯",
                title: "10 Problems",
                text: "Solved 10 unique problems."
            });
        }

        if (problemsSolved >= 50) {
            items.push({
                icon: "💯",
                title: "50 Problems",
                text: "Solved 50 unique problems."
            });
        }

        if (currentStreak >= 7) {
            items.push({
                icon: "🔥",
                title: "7 Day Streak",
                text: "Coded for seven consecutive days."
            });
        }

        if (acceptanceRate >= 80) {
            items.push({
                icon: "⚡",
                title: "High Accuracy",
                text: "Reached an 80%+ acceptance rate."
            });
        }

        if (certificationStats.certificates > 0) {
            items.push({
                icon: "🎓",
                title: "Certified",
                text: "Earned a CodeSprint certificate."
            });
        }

        return items.slice(0, 6);
    }, [
        problemsSolved,
        currentStreak,
        acceptanceRate,
        certificationStats.certificates
    ]);

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "—";
        }

        const date =
            new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "—";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="progress-dashboard-page">
                <div className="progress-dashboard-state">
                    <div className="progress-spinner"></div>
                    <h2>Loading your progress...</h2>
                    <p>
                        Gathering your coding activity and
                        learning statistics.
                    </p>
                </div>
            </div>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error) {
        return (
            <div className="progress-dashboard-page">
                <section className="progress-page-header">
                    <div>
                        <span className="progress-eyebrow">
                            CODESPRINT / MY PROGRESS
                        </span>
                        <h1>Progress Dashboard</h1>
                        <p>
                            Track your coding activity, solved
                            problems and learning progress.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="progress-primary-button"
                        onClick={loadProgress}
                    >
                        Try Again
                    </button>
                </section>

                <div className="progress-error-card">
                    <div className="progress-error-icon">!</div>
                    <div>
                        <strong>
                            Unable to load your progress
                        </strong>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // MAIN UI
    // =========================================================

    return (
        <div className="progress-dashboard-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <section className="progress-page-header">

                <div>
                    <span className="progress-eyebrow">
                        CODESPRINT / MY PROGRESS
                    </span>

                    <h1>
                        {user?.name
                            ? `${user.name}'s Progress`
                            : "Progress Dashboard"}
                    </h1>

                    <p>
                        A complete view of your coding journey,
                        activity and achievements.
                    </p>
                </div>

                <button
                    type="button"
                    className="progress-refresh-button"
                    onClick={loadProgress}
                    disabled={refreshing}
                >
                    {refreshing
                        ? "Refreshing..."
                        : "↻ Refresh"}
                </button>

            </section>

            {/* =================================================
                KPI CARDS
            ================================================= */}

            <section className="progress-kpi-grid">

                <article className="progress-kpi-card">
                    <div className="progress-kpi-icon">
                        ✓
                    </div>
                    <div>
                        <span>Problems Solved</span>
                        <strong>
                            {problemsSolved}
                        </strong>
                    </div>
                </article>

                <article className="progress-kpi-card">
                    <div className="progress-kpi-icon">
                        ◎
                    </div>
                    <div>
                        <span>Total Submissions</span>
                        <strong>
                            {submissions.length}
                        </strong>
                    </div>
                </article>

                <article className="progress-kpi-card">
                    <div className="progress-kpi-icon">
                        %
                    </div>
                    <div>
                        <span>Acceptance Rate</span>
                        <strong>
                            {acceptanceRate}%
                        </strong>
                    </div>
                </article>

                <article className="progress-kpi-card">
                    <div className="progress-kpi-icon">
                        🔥
                    </div>
                    <div>
                        <span>Current Streak</span>
                        <strong>
                            {currentStreak} days
                        </strong>
                    </div>
                </article>

                <article className="progress-kpi-card">
                    <div className="progress-kpi-icon">
                        🏆
                    </div>
                    <div>
                        <span>Leaderboard Rank</span>
                        <strong>
                            {myRank
                                ? `#${myRank}`
                                : "—"}
                        </strong>
                    </div>
                </article>

            </section>

            {/* =================================================
                WEEKLY SNAPSHOT
            ================================================= */}

            <section className="progress-card weekly-card">

                <div className="progress-card-heading">
                    <div>
                        <span className="progress-section-kicker">
                            THIS WEEK
                        </span>
                        <h2>Weekly Snapshot</h2>
                        <p>
                            Your coding activity since Monday.
                        </p>
                    </div>
                </div>

                <div className="weekly-stat-grid">

                    <div className="weekly-stat">
                        <span>Problems Solved</span>
                        <strong>
                            {weeklyStats.solved}
                        </strong>
                    </div>

                    <div className="weekly-stat">
                        <span>Submissions</span>
                        <strong>
                            {weeklyStats.submissions}
                        </strong>
                    </div>

                    <div className="weekly-stat">
                        <span>Accepted</span>
                        <strong>
                            {weeklyStats.accepted}
                        </strong>
                    </div>

                    <div className="weekly-stat">
                        <span>Coding Days</span>
                        <strong>
                            {weeklyStats.codingDays} / 7
                        </strong>
                    </div>

                </div>

            </section>

            {/* =================================================
                HEATMAP
            ================================================= */}

            <section className="progress-card">

                <div className="progress-card-heading">
                    <div>
                        <span className="progress-section-kicker">
                            ACTIVITY
                        </span>
                        <h2>Coding Activity</h2>
                        <p>
                            Submission activity over the last
                            12 weeks.
                        </p>
                    </div>

                    <div className="streak-summary">
                        <div>
                            <span>Current streak</span>
                            <strong>
                                {currentStreak} days
                            </strong>
                        </div>

                        <div>
                            <span>Longest streak</span>
                            <strong>
                                {longestStreak} days
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="heatmap-scroll">

                    <div className="heatmap-grid">
                        {heatmapData.map(
                            (item) => (
                                <span
                                    key={item.date}
                                    className={`heatmap-cell ${getHeatmapLevel(
                                        item.count
                                    )}`}
                                    title={`${item.date}: ${item.count} submission${
                                        item.count === 1
                                            ? ""
                                            : "s"
                                    }`}
                                />
                            )
                        )}
                    </div>

                </div>

                <div className="heatmap-footer">
                    <span>Less</span>
                    <i className="heatmap-legend-cell level-0"></i>
                    <i className="heatmap-legend-cell level-1"></i>
                    <i className="heatmap-legend-cell level-2"></i>
                    <i className="heatmap-legend-cell level-3"></i>
                    <i className="heatmap-legend-cell level-4"></i>
                    <span>More</span>
                </div>

            </section>

            {/* =================================================
                DIFFICULTY + LANGUAGE
            ================================================= */}

            <section className="progress-two-column">

                <div className="progress-card">

                    <div className="progress-card-heading">
                        <div>
                            <span className="progress-section-kicker">
                                PRACTICE
                            </span>
                            <h2>Problems by Difficulty</h2>
                            <p>
                                Unique problems you have solved.
                            </p>
                        </div>
                    </div>

                    <div className="difficulty-list">

                        {[
                            ["Easy", "easy"],
                            ["Medium", "medium"],
                            ["Hard", "hard"]
                        ].map(
                            ([label, key]) => {
                                const stats =
                                    difficultyStats[key];

                                const percent =
                                    getProgressPercent(
                                        stats.solved,
                                        stats.total
                                    );

                                return (
                                    <div
                                        className="difficulty-row"
                                        key={key}
                                    >
                                        <div className="difficulty-row-top">
                                            <strong
                                                className={`difficulty-label ${key}`}
                                            >
                                                {label}
                                            </strong>

                                            <span>
                                                {stats.solved} solved
                                                {" / "}
                                                {stats.total}
                                            </span>
                                        </div>

                                        <div className="progress-track">
                                            <div
                                                className={`progress-fill ${key}`}
                                                style={{
                                                    width: `${percent}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            }
                        )}

                    </div>

                </div>

                <div className="progress-card">

                    <div className="progress-card-heading">
                        <div>
                            <span className="progress-section-kicker">
                                LANGUAGES
                            </span>
                            <h2>Language Usage</h2>
                            <p>
                                Languages used in your submissions.
                            </p>
                        </div>
                    </div>

                    {languageStats.length === 0 ? (
                        <div className="progress-empty-inline">
                            No language usage data yet.
                        </div>
                    ) : (
                        <div className="language-list">
                            {languageStats.map(
                                (item) => (
                                    <div
                                        className="language-row"
                                        key={item.name}
                                    >
                                        <div className="language-row-head">
                                            <span>
                                                {item.name}
                                            </span>
                                            <strong>
                                                {item.percentage}%
                                            </strong>
                                        </div>

                                        <div className="progress-track">
                                            <div
                                                className="progress-fill language"
                                                style={{
                                                    width: `${item.percentage}%`
                                                }}
                                            />
                                        </div>

                                        <small>
                                            {item.count} submission
                                            {item.count === 1
                                                ? ""
                                                : "s"}
                                        </small>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                </div>

            </section>

            {/* =================================================
                CATEGORY PROGRESS
            ================================================= */}

            <section className="progress-card">

                <div className="progress-card-heading">
                    <div>
                        <span className="progress-section-kicker">
                            TOPICS
                        </span>
                        <h2>Topic Progress</h2>
                        <p>
                            Progress across the categories used
                            by CodeSprint problems.
                        </p>
                    </div>
                </div>

                {categoryStats.length === 0 ? (
                    <div className="progress-empty-inline">
                        No problem categories available yet.
                    </div>
                ) : (
                    <div className="topic-grid">
                        {categoryStats.map(
                            (category) => {
                                const percent =
                                    getProgressPercent(
                                        category.solved,
                                        category.total
                                    );

                                return (
                                    <div
                                        className="topic-item"
                                        key={category.name}
                                    >
                                        <div className="topic-top">
                                            <strong>
                                                {category.name}
                                            </strong>

                                            <span>
                                                {category.solved}
                                                {" / "}
                                                {category.total}
                                            </span>
                                        </div>

                                        <div className="progress-track">
                                            <div
                                                className="progress-fill topic"
                                                style={{
                                                    width: `${percent}%`
                                                }}
                                            />
                                        </div>

                                        <small>
                                            {percent}% completed
                                        </small>
                                    </div>
                                );
                            }
                        )}
                    </div>
                )}

            </section>

            {/* =================================================
                SUBMISSIONS
            ================================================= */}

            <section className="progress-card">

                <div className="progress-card-heading progress-heading-with-action">
                    <div>
                        <span className="progress-section-kicker">
                            HISTORY
                        </span>
                        <h2>Recent Submissions</h2>
                        <p>
                            Your latest coding submissions.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="progress-link-button"
                        onClick={() =>
                            navigate(
                                "/user/submissions"
                            )
                        }
                    >
                        View All →
                    </button>
                </div>

                {recentSubmissions.length === 0 ? (
                    <div className="progress-empty-block">
                        <div>⌘</div>
                        <h3>No submissions yet</h3>
                        <p>
                            Solve a coding problem to start
                            building your progress history.
                        </p>
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/user/problems"
                                )
                            }
                        >
                            Browse Problems
                        </button>
                    </div>
                ) : (
                    <div className="progress-table-wrap">
                        <table className="progress-table">
                            <thead>
                                <tr>
                                    <th>Problem</th>
                                    <th>Language</th>
                                    <th>Status</th>
                                    <th>Submitted</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentSubmissions.map(
                                    (submission) => (
                                        <tr
                                            key={
                                                submission.id
                                            }
                                        >
                                            <td>
                                                <button
                                                    type="button"
                                                    className="problem-title-button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/user/problems/${submission.problemId}`
                                                        )
                                                    }
                                                >
                                                    {getProblemTitle(
                                                        submission.problemId
                                                    )}
                                                </button>
                                            </td>

                                            <td>
                                                {
                                                    submission.language ||
                                                    "—"
                                                }
                                            </td>

                                            <td>
                                                <span
                                                    className={getStatusClass(
                                                        submission.status
                                                    )}
                                                >
                                                    {submission.status ||
                                                        "—"}
                                                </span>
                                            </td>

                                            <td>
                                                {formatDate(
                                                    submission.submittedAt
                                                )}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

            </section>

            {/* =================================================
                CONTEST + CERTIFICATION
            ================================================= */}

            <section className="progress-two-column">

                <div className="progress-card">

                    <div className="progress-card-heading progress-heading-with-action">
                        <div>
                            <span className="progress-section-kicker">
                                CONTESTS
                            </span>
                            <h2>Contest Progress</h2>
                            <p>
                                Your contest participation and results.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="progress-link-button"
                            onClick={() =>
                                navigate(
                                    "/user/contests/results"
                                )
                            }
                        >
                            View Results →
                        </button>
                    </div>

                    <div className="mini-stat-grid">

                        <div>
                            <span>Participated</span>
                            <strong>
                                {contestStats.participated}
                            </strong>
                        </div>

                        <div>
                            <span>Completed</span>
                            <strong>
                                {contestStats.completed}
                            </strong>
                        </div>

                        <div>
                            <span>Problems Solved</span>
                            <strong>
                                {contestStats.solved}
                            </strong>
                        </div>

                        <div>
                            <span>Total Score</span>
                            <strong>
                                {contestStats.score}
                            </strong>
                        </div>

                    </div>

                    {contestResults.length === 0 && (
                        <div className="progress-empty-inline">
                            No contest results yet.
                        </div>
                    )}

                </div>

                <div className="progress-card">

                    <div className="progress-card-heading progress-heading-with-action">
                        <div>
                            <span className="progress-section-kicker">
                                CERTIFICATIONS
                            </span>
                            <h2>Certification Progress</h2>
                            <p>
                                Your certification attempts and certificates.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="progress-link-button"
                            onClick={() =>
                                navigate(
                                    "/user/certifications"
                                )
                            }
                        >
                            Browse →
                        </button>
                    </div>

                    <div className="mini-stat-grid">

                        <div>
                            <span>Attempts</span>
                            <strong>
                                {certificationStats.attempts}
                            </strong>
                        </div>

                        <div>
                            <span>Passed</span>
                            <strong>
                                {certificationStats.passed}
                            </strong>
                        </div>

                        <div>
                            <span>In Progress</span>
                            <strong>
                                {certificationStats.inProgress}
                            </strong>
                        </div>

                        <div>
                            <span>Certificates</span>
                            <strong>
                                {certificationStats.certificates}
                            </strong>
                        </div>

                    </div>

                    {certificationStats.failed > 0 && (
                        <div className="progress-muted-note">
                            {certificationStats.failed} failed or
                            time-expired attempt
                            {certificationStats.failed === 1
                                ? ""
                                : "s"}.
                        </div>
                    )}

                </div>

            </section>

            {/* =================================================
                ACHIEVEMENTS
            ================================================= */}

            <section className="progress-card">

                <div className="progress-card-heading">
                    <div>
                        <span className="progress-section-kicker">
                            ACHIEVEMENTS
                        </span>
                        <h2>Achievements</h2>
                        <p>
                            Milestones reached during your coding journey.
                        </p>
                    </div>
                </div>

                {achievements.length === 0 ? (
                    <div className="progress-empty-inline">
                        Keep solving problems to unlock your first
                        achievement.
                    </div>
                ) : (
                    <div className="achievement-grid">
                        {achievements.map(
                            (achievement) => (
                                <div
                                    className="achievement-card"
                                    key={achievement.title}
                                >
                                    <div className="achievement-icon">
                                        {achievement.icon}
                                    </div>

                                    <div>
                                        <strong>
                                            {achievement.title}
                                        </strong>

                                        <p>
                                            {achievement.text}
                                        </p>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}

            </section>

        </div>
    );
}

export default ProgressDashboard;
