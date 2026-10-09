import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ProfileContestActivity.css";

function ProfileContestActivity() {
    const navigate = useNavigate();

    const storedUser = localStorage.getItem("user");

    let user = null;

    try {
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error("Invalid user data:", error);
    }

    const userId = user?.id;

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!userId) {
            navigate("/login");
            return;
        }

        const loadResults = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axios.get(
                    `/api/contests/user/${userId}/results`
                );

                setResults(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );
            } catch (err) {
                console.error(
                    "Contest activity loading error:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    "Unable to load contest activity."
                );
            } finally {
                setLoading(false);
            }
        };

        loadResults();
    }, [userId, navigate]);

    const statistics = useMemo(() => {
        const finished = results.filter(
            (item) => item.status === "FINISHED"
        ).length;

        const solved = results.reduce(
            (total, item) =>
                total + Number(item.problemsSolved || 0),
            0
        );

        const score = results.reduce(
            (total, item) =>
                total + Number(item.score || 0),
            0
        );

        return {
            participated: results.length,
            finished,
            solved,
            score
        };
    }, [results]);

    const formatDate = (value) => {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const getContestTitle = (item) =>
        item.contestTitle ||
        item.title ||
        `Contest #${item.contestId}`;

    if (loading) {
        return (
            <div className="profile-contest-page">
                <div className="profile-contest-loading">
                    Loading your contest activity...
                </div>
            </div>
        );
    }

    return (
        <div className="profile-contest-page">
            <div className="profile-contest-header">
                <div>
                    <button
                        type="button"
                        className="profile-contest-back"
                        onClick={() =>
                            navigate("/user/profile")
                        }
                    >
                        ← Back to Profile
                    </button>

                    <span className="profile-contest-eyebrow">
                        CONTESTS
                    </span>

                    <h1>My Contest Activity</h1>

                    <p>
                        View your participation, performance, scores, and rankings.
                    </p>
                </div>

                <button
                    type="button"
                    className="profile-contest-results-button"
                    onClick={() =>
                        navigate("/user/contests/results")
                    }
                >
                    View All Results →
                </button>
            </div>

            {error && (
                <div className="profile-contest-error">
                    {error}
                </div>
            )}

            {!error && (
                <>
                    <section className="profile-contest-stats">
                        <div className="profile-contest-stat-card">
                            <span>Participated</span>
                            <strong>{statistics.participated}</strong>
                        </div>

                        <div className="profile-contest-stat-card">
                            <span>Finished</span>
                            <strong>{statistics.finished}</strong>
                        </div>

                        <div className="profile-contest-stat-card">
                            <span>Problems Solved</span>
                            <strong>{statistics.solved}</strong>
                        </div>

                        <div className="profile-contest-stat-card">
                            <span>Total Score</span>
                            <strong>{statistics.score}</strong>
                        </div>
                    </section>

                    <section className="profile-contest-table-card">
                        <div className="profile-contest-section-heading">
                            <div>
                                <h2>Recent Contests</h2>
                                <p>Your latest contest results.</p>
                            </div>
                        </div>

                        {results.length === 0 ? (
                            <div className="profile-contest-empty">
                                <div>🏆</div>
                                <h3>No contest history yet</h3>
                                <p>
                                    Your contest results will appear here after you participate.
                                </p>
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/user/contests")
                                    }
                                >
                                    Browse Contests
                                </button>
                            </div>
                        ) : (
                            <div className="profile-contest-table-wrapper">
                                <table className="profile-contest-table">
                                    <thead>
                                        <tr>
                                            <th>Contest</th>
                                            <th>Status</th>
                                            <th>Solved</th>
                                            <th>Score</th>
                                            <th>Rank</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {results.slice(0, 8).map(
                                            (item) => (
                                                <tr
                                                    key={
                                                        item.contestId
                                                    }
                                                >
                                                    <td>
                                                        <strong>
                                                            {getContestTitle(
                                                                item
                                                            )}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`profile-contest-status ${
                                                                item.status ===
                                                                "FINISHED"
                                                                    ? "finished"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {item.status ||
                                                                "—"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {item.problemsSolved ||
                                                            0}
                                                    </td>

                                                    <td>
                                                        {item.score || 0}
                                                    </td>

                                                    <td>
                                                        {item.rank
                                                            ? `#${item.rank}`
                                                            : "—"}
                                                    </td>

                                                    <td>
                                                        {formatDate(
                                                            item.endTime ||
                                                                item.startTime ||
                                                                item.registeredAt
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
                </>
            )}
        </div>
    );
}

export default ProfileContestActivity;
