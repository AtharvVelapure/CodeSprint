import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./UserLeaderboard.css";

const API_URL = "/api/leaderboards";

function UserLeaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [myRanking, setMyRanking] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            setLoading(true);
            setError("");

            const leaderboardResponse = await axios.get(API_URL);
            setLeaderboard(leaderboardResponse.data || []);

            if (user?.id) {
                try {
                    const userResponse = await axios.get(
                        `${API_URL}/user/${user.id}`
                    );

                    setMyRanking(userResponse.data);
                } catch (userError) {
                    console.error(
                        "Unable to load user ranking:",
                        userError
                    );
                    setMyRanking(null);
                }
            }
        } catch (err) {
            console.error("Error loading leaderboard:", err);
            setError("Unable to load leaderboard.");
        } finally {
            setLoading(false);
        }
    };

    const getSuccessRate = (item) => {
        if (!item?.totalSubmissions) {
            return 0;
        }

        return (
            (item.acceptedSubmissions / item.totalSubmissions) *
            100
        ).toFixed(1);
    };

    const getInitials = (name) => {
        if (!name) {
            return "U";
        }

        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word.charAt(0).toUpperCase())
            .join("");
    };

    const filteredLeaderboard = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        if (!search) {
            return leaderboard;
        }

        return leaderboard.filter((item) => {
            const name = item.name?.toLowerCase() || "";
            const email = item.email?.toLowerCase() || "";

            return (
                name.includes(search) ||
                email.includes(search)
            );
        });
    }, [leaderboard, searchTerm]);

    const topThree = leaderboard.slice(0, 3);

    const getRankClass = (rank) => {
        if (rank === 1) return "user-rank-first";
        if (rank === 2) return "user-rank-second";
        if (rank === 3) return "user-rank-third";

        return "";
    };

    const isCurrentUser = (item) => {
        return user?.id && Number(item.userId) === Number(user.id);
    };

    if (loading) {
        return (
            <div className="user-leaderboard-page">
                <div className="user-leaderboard-loading">
                    <div className="user-loading-spinner"></div>
                    <p>Loading leaderboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="user-leaderboard-page">
                <div className="user-leaderboard-error">
                    <div className="user-error-icon">!</div>

                    <h2>Unable to load leaderboard</h2>

                    <p>{error}</p>

                    <button onClick={loadLeaderboard}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="user-leaderboard-page">

            {/* HEADER */}
            <div className="user-leaderboard-header">
                <div>
                    <span className="user-leaderboard-eyebrow">
                        COMPETE • SOLVE • RANK
                    </span>

                    <h1>Leaderboard</h1>

                    <p>
                        See how you rank against other CodeSprint users.
                    </p>
                </div>

                <button
                    className="user-refresh-button"
                    onClick={loadLeaderboard}
                >
                    ↻ Refresh
                </button>
            </div>

            {/* MY RANKING */}
            {myRanking && (
                <section className="my-ranking-card">

                    <div className="my-ranking-left">

                        <div className="my-ranking-avatar">
                            {getInitials(myRanking.name)}
                        </div>

                        <div>
                            <span className="my-ranking-label">
                                YOUR RANK
                            </span>

                            <h2>
                                #{myRanking.rank}
                            </h2>

                            <p>
                                {myRanking.name}
                            </p>
                        </div>

                    </div>

                    <div className="my-ranking-stats">

                        <div className="my-stat">
                            <span>Points</span>
                            <strong>
                                {myRanking.points}
                            </strong>
                        </div>

                        <div className="my-stat">
                            <span>Solved</span>
                            <strong>
                                {myRanking.problemsSolved}
                            </strong>
                        </div>

                        <div className="my-stat">
                            <span>Accepted</span>
                            <strong>
                                {myRanking.acceptedSubmissions}
                            </strong>
                        </div>

                        <div className="my-stat">
                            <span>Success Rate</span>
                            <strong>
                                {getSuccessRate(myRanking)}%
                            </strong>
                        </div>

                    </div>

                </section>
            )}

            {/* TOP THREE */}
            {topThree.length > 0 && (
                <section className="user-podium-section">

                    <div className="user-section-title">
                        <h2>Top Performers</h2>
                        <p>
                            The highest ranked users on the platform.
                        </p>
                    </div>

                    <div className="user-podium">

                        {/* SECOND */}
                        {topThree[1] && (
                            <div className="user-podium-card second">

                                <div className="user-podium-avatar">
                                    {getInitials(topThree[1].name)}
                                </div>

                                <div className="user-podium-rank">
                                    2
                                </div>

                                <h3>
                                    {topThree[1].name}
                                </h3>

                                <span>
                                    {topThree[1].problemsSolved} problems
                                    solved
                                </span>

                                <strong>
                                    {topThree[1].points}
                                    <small> pts</small>
                                </strong>

                            </div>
                        )}

                        {/* FIRST */}
                        {topThree[0] && (
                            <div className="user-podium-card first">

                                <div className="user-crown">
                                    ♛
                                </div>

                                <div className="user-podium-avatar">
                                    {getInitials(topThree[0].name)}
                                </div>

                                <div className="user-podium-rank">
                                    1
                                </div>

                                <h3>
                                    {topThree[0].name}
                                </h3>

                                <span>
                                    {topThree[0].problemsSolved} problems
                                    solved
                                </span>

                                <strong>
                                    {topThree[0].points}
                                    <small> pts</small>
                                </strong>

                            </div>
                        )}

                        {/* THIRD */}
                        {topThree[2] && (
                            <div className="user-podium-card third">

                                <div className="user-podium-avatar">
                                    {getInitials(topThree[2].name)}
                                </div>

                                <div className="user-podium-rank">
                                    3
                                </div>

                                <h3>
                                    {topThree[2].name}
                                </h3>

                                <span>
                                    {topThree[2].problemsSolved} problems
                                    solved
                                </span>

                                <strong>
                                    {topThree[2].points}
                                    <small> pts</small>
                                </strong>

                            </div>
                        )}

                    </div>
                </section>
            )}

            {/* LEADERBOARD */}
            <section className="user-leaderboard-table-section">

                <div className="user-table-header">

                    <div>
                        <h2>All Rankings</h2>

                        <p>
                            Complete ranking of CodeSprint users.
                        </p>
                    </div>

                    <div className="user-search">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                        />
                    </div>

                </div>

                {filteredLeaderboard.length === 0 ? (
                    <div className="user-empty-state">
                        <div>⌕</div>

                        <h3>No users found</h3>

                        <p>
                            Try a different search term.
                        </p>
                    </div>
                ) : (
                    <div className="user-table-wrapper">

                        <table className="user-leaderboard-table">

                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>User</th>
                                    <th>Points</th>
                                    <th>Solved</th>
                                    <th>Easy</th>
                                    <th>Medium</th>
                                    <th>Hard</th>
                                    <th>Accepted</th>
                                    <th>Success Rate</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredLeaderboard.map((item) => (
                                    <tr
                                        key={item.userId}
                                        className={
                                            isCurrentUser(item)
                                                ? "current-user-row"
                                                : ""
                                        }
                                    >

                                        <td>
                                            <div
                                                className={`user-table-rank ${getRankClass(
                                                    item.rank
                                                )}`}
                                            >
                                                {item.rank}
                                            </div>
                                        </td>

                                        <td>
                                            <div className="user-table-user">

                                                <div className="user-table-avatar">
                                                    {getInitials(item.name)}
                                                </div>

                                                <div>
                                                    <strong>
                                                        {item.name}
                                                    </strong>

                                                    {isCurrentUser(item) && (
                                                        <span className="you-badge">
                                                            YOU
                                                        </span>
                                                    )}
                                                </div>

                                            </div>
                                        </td>

                                        <td>
                                            <strong className="user-points">
                                                {item.points}
                                            </strong>
                                        </td>

                                        <td>
                                            <strong>
                                                {item.problemsSolved}
                                            </strong>
                                        </td>

                                        <td>
                                            <span className="easy-number">
                                                {item.easySolved}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="medium-number">
                                                {item.mediumSolved}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="hard-number">
                                                {item.hardSolved}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="accepted-number">
                                                {item.acceptedSubmissions}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="user-success-rate">

                                                <div className="user-success-bar">
                                                    <span
                                                        style={{
                                                            width: `${getSuccessRate(
                                                                item
                                                            )}%`,
                                                        }}
                                                    ></span>
                                                </div>

                                                <strong>
                                                    {getSuccessRate(item)}%
                                                </strong>

                                            </div>
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

export default UserLeaderboard;