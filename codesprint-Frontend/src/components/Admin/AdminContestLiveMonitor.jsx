import { useEffect, useMemo, useState } from "react";
import "./AdminContestLiveMonitor.css";

const API_URL = "/api/contests";

function AdminContestLiveMonitor({ contest, onClose }) {
    const [participants, setParticipants] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [now, setNow] = useState(Date.now());

    const loadMonitorData = async (silent = false) => {
        if (!contest?.id) return;

        try {
            if (silent) setRefreshing(true);
            else setLoading(true);

            setError("");

            const [participantsResponse, leaderboardResponse] =
                await Promise.all([
                    fetch(`${API_URL}/${contest.id}/participants`),
                    fetch(`${API_URL}/${contest.id}/leaderboard`)
                ]);

            if (!participantsResponse.ok) {
                throw new Error("Unable to load contest participants.");
            }

            if (!leaderboardResponse.ok) {
                throw new Error("Unable to load contest leaderboard.");
            }

            const participantsData =
                await participantsResponse.json();

            const leaderboardData =
                await leaderboardResponse.json();

            setParticipants(
                Array.isArray(participantsData)
                    ? participantsData
                    : []
            );

            setLeaderboard(
                Array.isArray(leaderboardData)
                    ? leaderboardData
                    : []
            );
        } catch (err) {
            console.error("Live monitor error:", err);
            setError(
                err.message ||
                "Unable to load live contest information."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadMonitorData(false);

        const refreshInterval = window.setInterval(() => {
            loadMonitorData(true);
        }, 15000);

        return () => {
            window.clearInterval(refreshInterval);
        };
    }, [contest?.id]);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, []);

    const startedCount =
        participants.filter(
            (participant) => participant.startedAt
        ).length;

    const registeredCount =
        participants.length;

    const notStartedCount =
        Math.max(registeredCount - startedCount, 0);

    const totalSubmissions =
        leaderboard.reduce(
            (total, participant) =>
                total +
                Number(
                    participant.totalSubmissions || 0
                ),
            0
        );

    const topScore =
        leaderboard.length > 0
            ? Math.max(
                  ...leaderboard.map(
                      (participant) =>
                          Number(participant.score || 0)
                  )
              )
            : 0;

    const leaderboardByUserId =
        useMemo(() => {
            const map = new Map();

            leaderboard.forEach((entry) => {
                map.set(
                    Number(entry.userId),
                    entry
                );
            });

            return map;
        }, [leaderboard]);

    const rows =
        useMemo(() => {
            return participants
                .map((participant) => {
                    const standing =
                        leaderboardByUserId.get(
                            Number(participant.userId)
                        );

                    return {
                        ...participant,
                        rank:
                            standing?.rank ??
                            participant.rank ??
                            0,
                        problemsSolved:
                            standing?.problemsSolved ??
                            0,
                        score:
                            standing?.score ??
                            participant.score ??
                            0,
                        totalSubmissions:
                            standing?.totalSubmissions ??
                            0
                    };
                })
                .sort((a, b) => {
                    const rankA =
                        Number(a.rank || 999999);
                    const rankB =
                        Number(b.rank || 999999);

                    if (rankA !== rankB) {
                        return rankA - rankB;
                    }

                    return (
                        Number(b.score || 0) -
                        Number(a.score || 0)
                    );
                });
        }, [participants, leaderboardByUserId]);

    const filteredRows =
        useMemo(() => {
            const query =
                search.trim().toLowerCase();

            if (!query) {
                return rows;
            }

            return rows.filter((participant) => {
                const name =
                    participant.userName
                        ?.toLowerCase() || "";

                const email =
                    participant.email
                        ?.toLowerCase() || "";

                const id =
                    String(
                        participant.userId || ""
                    );

                return (
                    name.includes(query) ||
                    email.includes(query) ||
                    id.includes(query)
                );
            });
        }, [rows, search]);

    const getRemainingTime = () => {
        if (!contest?.endTime) {
            return "--:--:--";
        }

        const end =
            new Date(contest.endTime).getTime();

        if (Number.isNaN(end)) {
            return "--:--:--";
        }

        const difference =
            Math.max(end - now, 0);

        const totalSeconds =
            Math.floor(
                difference / 1000
            );

        const hours =
            Math.floor(
                totalSeconds / 3600
            );

        const minutes =
            Math.floor(
                (totalSeconds % 3600) / 60
            );

        const seconds =
            totalSeconds % 60;

        return [
            hours,
            minutes,
            seconds
        ]
            .map((value) =>
                String(value).padStart(2, "0")
            )
            .join(":");
    };

    const formatDate = (value) => {
        if (!value) return "-";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };

    const getInitials = (name) => {
        if (!name) return "U";

        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) =>
                part.charAt(0).toUpperCase()
            )
            .join("");
    };

    return (
        <div className="live-monitor-overlay">
            <div className="live-monitor-modal">

                <div className="live-monitor-header">
                    <div>
                        <div className="live-monitor-heading-row">
                            <span className="live-monitor-live-dot"></span>
                            <span className="live-monitor-label">
                                LIVE CONTEST MONITOR
                            </span>
                        </div>

                        <h2>{contest?.title}</h2>

                        <p>
                            Real-time contest activity and
                            participant standings.
                        </p>
                    </div>

                    <div className="live-monitor-header-right">
                        <div className="live-monitor-timer">
                            <span>Remaining</span>
                            <strong>
                                {getRemainingTime()}
                            </strong>
                        </div>

                        <button
                            type="button"
                            className="live-monitor-close"
                            onClick={onClose}
                        >
                            &times;
                        </button>
                    </div>
                </div>

                <div className="live-monitor-summary">

                    <div className="live-monitor-stat">
                        <span>Registered</span>
                        <strong>
                            {registeredCount}
                        </strong>
                    </div>

                    <div className="live-monitor-stat">
                        <span>Started</span>
                        <strong>
                            {startedCount}
                        </strong>
                    </div>

                    <div className="live-monitor-stat">
                        <span>Not Started</span>
                        <strong>
                            {notStartedCount}
                        </strong>
                    </div>

                    <div className="live-monitor-stat">
                        <span>Submissions</span>
                        <strong>
                            {totalSubmissions}
                        </strong>
                    </div>

                    <div className="live-monitor-stat">
                        <span>Top Score</span>
                        <strong>
                            {topScore}
                        </strong>
                    </div>

                </div>

                <div className="live-monitor-toolbar">

                    <div className="live-monitor-search">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search participant..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    <div className="live-monitor-refresh-area">
                        <span>
                            Auto refresh: 15s
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                loadMonitorData(true)
                            }
                            disabled={refreshing}
                        >
                            {refreshing
                                ? "Refreshing..."
                                : "↻ Refresh"}
                        </button>
                    </div>

                </div>

                {error && (
                    <div className="live-monitor-error">
                        ⚠️ {error}
                    </div>
                )}

                <div className="live-monitor-table-wrap">

                    {loading ? (
                        <div className="live-monitor-loading">
                            <div className="live-monitor-spinner"></div>
                            <p>
                                Loading live contest data...
                            </p>
                        </div>
                    ) : filteredRows.length === 0 ? (
                        <div className="live-monitor-empty">
                            <div>👥</div>
                            <h3>
                                No participants found
                            </h3>
                            <p>
                                Registered participants will
                                appear here.
                            </p>
                        </div>
                    ) : (
                        <table className="live-monitor-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Participant</th>
                                    <th>Started</th>
                                    <th>Solved</th>
                                    <th>Score</th>
                                    <th>Submissions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredRows.map(
                                    (participant, index) => (
                                        <tr
                                            key={
                                                participant.id ??
                                                participant.userId
                                            }
                                        >
                                            <td>
                                                <span className="live-monitor-rank">
                                                    {participant.rank > 0
                                                        ? `#${participant.rank}`
                                                        : `#${index + 1}`}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="live-monitor-user">
                                                    <div className="live-monitor-avatar">
                                                        {getInitials(
                                                            participant.userName
                                                        )}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {participant.userName ||
                                                                "Unknown User"}
                                                        </strong>

                                                        <span>
                                                            {participant.email ||
                                                                `User #${participant.userId}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                {participant.startedAt ? (
                                                    <div className="live-monitor-started">
                                                        <strong>
                                                            ✓ Started
                                                        </strong>
                                                        <span>
                                                            {formatDate(
                                                                participant.startedAt
                                                            )}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="live-monitor-not-started">
                                                        Not Started
                                                    </span>
                                                )}
                                            </td>

                                            <td>
                                                <strong>
                                                    {participant.problemsSolved}
                                                </strong>
                                            </td>

                                            <td>
                                                <strong className="live-monitor-score">
                                                    {participant.score}
                                                </strong>
                                            </td>

                                            <td>
                                                {participant.totalSubmissions}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    )}

                </div>

                <div className="live-monitor-footer">
                    <span>
                        Showing{" "}
                        <strong>
                            {filteredRows.length}
                        </strong>{" "}
                        of{" "}
                        <strong>
                            {registeredCount}
                        </strong>{" "}
                        registered participants
                    </span>

                    <button
                        type="button"
                        onClick={onClose}
                    >
                        Done
                    </button>
                </div>

            </div>
        </div>
    );
}

export default AdminContestLiveMonitor;
