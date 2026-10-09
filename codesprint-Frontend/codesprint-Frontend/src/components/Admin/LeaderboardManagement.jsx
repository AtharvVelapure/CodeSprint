import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./LeaderboardManagement.css";

const API_URL = "/api/leaderboards";

function LeaderboardManagement() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.get(API_URL);
            setLeaderboard(response.data || []);
        } catch (err) {
            console.error("Error loading leaderboard:", err);
            setError("Failed to load leaderboard data.");
        } finally {
            setLoading(false);
        }
    };

    const getSuccessRate = (user) => {
        if (!user.totalSubmissions || user.totalSubmissions === 0) {
            return 0;
        }
        return ((user.acceptedSubmissions / user.totalSubmissions) * 100).toFixed(1);
    };

    const filteredLeaderboard = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) return leaderboard;
        return leaderboard.filter((user) => {
            const name = user.name?.toLowerCase() || "";
            const email = user.email?.toLowerCase() || "";
            return name.includes(search) || email.includes(search);
        });
    }, [leaderboard, searchTerm]);

    const topThree = leaderboard.slice(0, 3);

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word.charAt(0).toUpperCase())
            .join("");
    };

    const getRankClass = (rank) => {
        if (rank === 1) return "rank-first";
        if (rank === 2) return "rank-second";
        if (rank === 3) return "rank-third";
        return "";
    };

    const getDifficultyClass = (difficulty) => {
        if (difficulty === "easy") return "difficulty-easy";
        if (difficulty === "medium") return "difficulty-medium";
        return "difficulty-hard";
    };

    if (loading) {
        return (
            <div className="leaderboard-page">
                <div className="leaderboard-header">
                    <div>
                        <span className="page-eyebrow">ADMINISTRATION</span>
                        <h1>Leaderboards</h1>
                        <p>Track user performance and coding achievements.</p>
                    </div>
                </div>
                <div className="leaderboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading leaderboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="leaderboard-page">
                <div className="leaderboard-header">
                    <div>
                        <span className="page-eyebrow">ADMINISTRATION</span>
                        <h1>Leaderboards</h1>
                        <p>Track user performance and coding achievements.</p>
                    </div>
                </div>
                <div className="leaderboard-error">
                    <div className="error-icon">!</div>
                    <h3>Unable to load leaderboard</h3>
                    <p>{error}</p>
                    <button className="retry-button" onClick={loadLeaderboard}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="leaderboard-page">
            {/* PAGE HEADER */}
            <div className="leaderboard-header">
                <div>
                    <span className="page-eyebrow">ADMINISTRATION</span>
                    <h1>Leaderboards</h1>
                    <p>Track user performance and coding achievements.</p>
                </div>
                <button className="refresh-button" type="button" onClick={loadLeaderboard}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                    </svg>
                    Refresh
                </button>
            </div>

            {/* SUMMARY CARDS */}
            <div className="leaderboard-summary">
                <div className="summary-card">
                    <div className="summary-details">
                        <span>Ranked Users</span>
                        <strong>{leaderboard.length}</strong>
                    </div>
                    <div className="summary-icon users-icon">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-details">
                        <span>Total Problems Solved</span>
                        <strong>
                            {leaderboard.reduce((total, user) => total + (user.problemsSolved || 0), 0)}
                        </strong>
                    </div>
                    <div className="summary-icon problem-icon">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-details">
                        <span>Total Points</span>
                        <strong>
                            {leaderboard.reduce((total, user) => total + (user.points || 0), 0)}
                        </strong>
                    </div>
                    <div className="summary-icon points-icon">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-details">
                        <span>Accepted Submissions</span>
                        <strong>
                            {leaderboard.reduce((total, user) => total + (user.acceptedSubmissions || 0), 0)}
                        </strong>
                    </div>
                    <div className="summary-icon accepted-icon">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                </div>
            </div>

            {/* TOP 3 PODIUM */}
            {topThree.length > 0 && (
                <section className="podium-section">
                    <div className="section-heading">
                        <h2>Top Performers</h2>
                        <p>Highest scoring developers on the CodeSprint platform.</p>
                    </div>

                    <div className="podium-container">
                        {/* SECOND PLACE */}
                        {topThree[1] && (
                            <div className="podium-card second-place">
                                <div className="podium-medal">2</div>
                                <div className="podium-avatar">
                                    {getInitials(topThree[1].name)}
                                </div>
                                <h3>{topThree[1].name || "Unknown User"}</h3>
                                <p>{topThree[1].email}</p>
                                <div className="podium-points">
                                    <strong>{topThree[1].points}</strong>
                                    <span>points</span>
                                </div>
                                <div className="podium-stats">
                                    <span>{topThree[1].problemsSolved} <small>Solved</small></span>
                                    <span>{topThree[1].acceptedSubmissions} <small>Accepted</small></span>
                                </div>
                            </div>
                        )}

                        {/* FIRST PLACE */}
                        {topThree[0] && (
                            <div className="podium-card first-place">
                                <div className="crown">
                                    <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
                                    </svg>
                                </div>
                                <div className="podium-medal">1</div>
                                <div className="podium-avatar">
                                    {getInitials(topThree[0].name)}
                                </div>
                                <h3>{topThree[0].name || "Unknown User"}</h3>
                                <p>{topThree[0].email}</p>
                                <div className="podium-points">
                                    <strong>{topThree[0].points}</strong>
                                    <span>points</span>
                                </div>
                                <div className="podium-stats">
                                    <span>{topThree[0].problemsSolved} <small>Solved</small></span>
                                    <span>{topThree[0].acceptedSubmissions} <small>Accepted</small></span>
                                </div>
                            </div>
                        )}

                        {/* THIRD PLACE */}
                        {topThree[2] && (
                            <div className="podium-card third-place">
                                <div className="podium-medal">3</div>
                                <div className="podium-avatar">
                                    {getInitials(topThree[2].name)}
                                </div>
                                <h3>{topThree[2].name || "Unknown User"}</h3>
                                <p>{topThree[2].email}</p>
                                <div className="podium-points">
                                    <strong>{topThree[2].points}</strong>
                                    <span>points</span>
                                </div>
                                <div className="podium-stats">
                                    <span>{topThree[2].problemsSolved} <small>Solved</small></span>
                                    <span>{topThree[2].acceptedSubmissions} <small>Accepted</small></span>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* COMPLETE LEADERBOARD TABLE */}
            <section className="leaderboard-table-section">
                <div className="table-header">
                    <div>
                        <h2>Complete Leaderboard</h2>
                        <p>Detailed performance statistics for all users.</p>
                    </div>

                    <div className="leaderboard-search">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search user or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {filteredLeaderboard.length === 0 ? (
                    <div className="empty-leaderboard">
                        <div className="empty-icon">⌕</div>
                        <h3>No users found</h3>
                        <p>Try searching with a different name or email.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>User</th>
                                    <th>Problems Solved</th>
                                    <th>Easy</th>
                                    <th>Medium</th>
                                    <th>Hard</th>
                                    <th>Accepted</th>
                                    <th>Total</th>
                                    <th>Success Rate</th>
                                    <th>Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeaderboard.map((user) => (
                                    <tr key={user.userId}>
                                        <td>
                                            <div className={`table-rank ${getRankClass(user.rank)}`}>
                                                {user.rank}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar">
                                                    {getInitials(user.name)}
                                                </div>
                                                <div className="user-information">
                                                    <strong>{user.name || "Unknown User"}</strong>
                                                    <span>{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <strong className="solved-value">{user.problemsSolved}</strong>
                                        </td>
                                        <td>
                                            <span className={getDifficultyClass("easy")}>{user.easySolved}</span>
                                        </td>
                                        <td>
                                            <span className={getDifficultyClass("medium")}>{user.mediumSolved}</span>
                                        </td>
                                        <td>
                                            <span className={getDifficultyClass("hard")}>{user.hardSolved}</span>
                                        </td>
                                        <td>
                                            <span className="accepted-value">{user.acceptedSubmissions}</span>
                                        </td>
                                        <td>{user.totalSubmissions}</td>
                                        <td>
                                            <div className="success-rate">
                                                <div className="success-rate-bar">
                                                    <span style={{ width: `${getSuccessRate(user)}%` }}></span>
                                                </div>
                                                <strong>{getSuccessRate(user)}%</strong>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="points-value">{user.points}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default LeaderboardManagement;