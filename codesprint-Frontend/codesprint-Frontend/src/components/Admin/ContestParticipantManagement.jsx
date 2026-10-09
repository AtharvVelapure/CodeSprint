import { useEffect, useMemo, useState } from "react";
import "./ContestParticipantManagement.css";

const API_URL = "/api/contests";

function ContestParticipantManagement({ contest, onClose }) {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (contest?.id) {
            loadParticipants();
        }
    }, [contest]);

    const loadParticipants = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await fetch(`${API_URL}/${contest.id}/participants`);
            if (!response.ok) throw new Error("Failed to load participants");
            const data = await response.json();
            setParticipants(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Unable to load contest participants.");
        } finally {
            setLoading(false);
        }
    };

    const filteredParticipants = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return participants;
        return participants.filter((p) => {
            const name = p.userName?.toLowerCase() || "";
            const email = p.email?.toLowerCase() || "";
            const userId = String(p.userId || "");
            return name.includes(query) || email.includes(query) || userId.includes(query);
        });
    }, [participants, search]);

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "-";
        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("");
    };

    const topScore =
        participants.length > 0
            ? Math.max(...participants.map((p) => p.score || 0))
            : 0;

    return (
        <div className="participant-modal-overlay">
            <div className="participant-modal">
                {/* HEADER */}
                <div className="participant-modal-header">
                    <div>
                        <span className="participant-modal-label">CONTEST PARTICIPANTS</span>
                        <h2>{contest?.title}</h2>
                        <p>Manage and view users registered for this contest.</p>
                    </div>
                    <button
                        className="participant-close-button"
                        type="button"
                        onClick={onClose}
                    >
                        &times;
                    </button>
                </div>

                {/* SUMMARY */}
                <div className="participant-summary">
                    <div className="participant-summary-card">
                        <div className="participant-summary-icon">
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <span>Total Participants</span>
                            <strong>{participants.length}</strong>
                        </div>
                    </div>

                    <div className="participant-summary-card">
                        <div className="participant-summary-icon">
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <div>
                            <span>Top Score</span>
                            <strong>{topScore}</strong>
                        </div>
                    </div>

                    <div className="participant-summary-card">
                        <div className="participant-summary-icon">
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <span>Active Rankings</span>
                            <strong>{participants.length}</strong>
                        </div>
                    </div>
                </div>

                {/* TOOLBAR */}
                <div className="participant-toolbar">
                    <div className="participant-search">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name, email or user ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        className="participant-refresh-button"
                        type="button"
                        onClick={loadParticipants}
                        disabled={loading}
                    >
                        ↻ Refresh
                    </button>
                </div>

                {error && <div className="participant-error">{error}</div>}

                {/* TABLE */}
                <div className="participant-table-wrapper">
                    {loading ? (
                        <div className="participant-loading">
                            <div className="participant-spinner"></div>
                            <p>Loading participants...</p>
                        </div>
                    ) : filteredParticipants.length === 0 ? (
                        <div className="participant-empty">
                            <div className="participant-empty-icon">👥</div>
                            <h3>{search ? "No participants found" : "No participants yet"}</h3>
                            <p>
                                {search
                                    ? "Try a different search term."
                                    : "Users registered for this contest will appear here."}
                            </p>
                        </div>
                    ) : (
                        <table className="participant-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Participant</th>
                                    <th>Email</th>
                                    <th>Registered</th>
                                    <th>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredParticipants.map((participant, index) => (
                                    <tr key={participant.id}>
                                        <td>
                                            <div
                                                className={`participant-rank ${
                                                    participant.rank === 1
                                                        ? "rank-first"
                                                        : participant.rank === 2
                                                        ? "rank-second"
                                                        : participant.rank === 3
                                                        ? "rank-third"
                                                        : ""
                                                }`}
                                            >
                                                {participant.rank || index + 1}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="participant-user">
                                                <div className="participant-avatar">
                                                    {getInitials(participant.userName)}
                                                </div>
                                                <div className="participant-user-info">
                                                    <strong>{participant.userName || "Unknown User"}</strong>
                                                    <span>ID: {participant.userId}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="participant-email">
                                                {participant.email || "-"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="participant-date">
                                                {formatDate(participant.registeredAt)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="participant-score">
                                                {participant.score || 0}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* FOOTER */}
                <div className="participant-modal-footer">
                    <span>
                        Showing <strong>{filteredParticipants.length}</strong> of{" "}
                        <strong>{participants.length}</strong> participants
                    </span>
                    <button
                        className="participant-done-button"
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

export default ContestParticipantManagement;