import {
    useEffect,
    useMemo,
    useState
} from "react";

import axios from "axios";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import "./ContestLeaderboard.css";

const API_URL = "/api/contests";

function ContestLeaderboard() {

    const navigate = useNavigate();
    const { contestId } = useParams();

    const [contest, setContest] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadLeaderboard();
    }, [contestId]);

    const loadLeaderboard = async () => {

        try {
            setLoading(true);
            setError("");

            const [contestResponse, leaderboardResponse] =
                await Promise.all([
                    axios.get(`${API_URL}/${contestId}`),
                    axios.get(`${API_URL}/${contestId}/leaderboard`)
                ]);

            setContest(contestResponse.data);

            setLeaderboard(
                Array.isArray(leaderboardResponse.data)
                    ? leaderboardResponse.data
                    : []
            );

        } catch (loadError) {

            console.error(
                "Leaderboard loading error:",
                loadError
            );

            setError(
                loadError.response?.data?.message ||
                "Unable to load contest leaderboard."
            );

        } finally {
            setLoading(false);
        }
    };

    const filteredLeaderboard =
        useMemo(() => {

            const query =
                search.trim().toLowerCase();

            if (!query) {
                return leaderboard;
            }

            return leaderboard.filter(
                (participant) =>
                    participant.userName
                        ?.toLowerCase()
                        .includes(query)
            );

        }, [leaderboard, search]);

    const getRankDisplay = (rank) => {

        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";

        return `#${rank}`;
    };

    if (loading) {
        return (
            <div className="contest-leaderboard-page">
                <div className="contest-leaderboard-loading">
                    <div className="contest-leaderboard-spinner"></div>
                    <h2>Loading Leaderboard...</h2>
                    <p>Fetching the latest contest standings.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="contest-leaderboard-page">

            <section className="contest-leaderboard-header">

                <div>
                    <button
                        type="button"
                        className="contest-leaderboard-back"
                        onClick={() =>
                            navigate("/user/contests")
                        }
                    >
                        ← Back to Contests
                    </button>

                    <span className="contest-leaderboard-eyebrow">
                        CONTEST STANDINGS
                    </span>

                    <h1>
                        {contest?.title || "Contest"} Leaderboard
                    </h1>

                    <p>
                        Live ranking based on contest score,
                        solved problems and submissions.
                    </p>
                </div>

                <button
                    type="button"
                    className="contest-leaderboard-refresh"
                    onClick={loadLeaderboard}
                >
                    ↻ Refresh
                </button>

            </section>

            {error && (
                <div className="contest-leaderboard-error">
                    <span>!</span>
                    {error}
                </div>
            )}

            {!error && (
                <>
                    <section className="contest-leaderboard-summary">

                        <div className="contest-leaderboard-summary-card">
                            <span>Participants</span>
                            <strong>{leaderboard.length}</strong>
                        </div>

                        <div className="contest-leaderboard-summary-card">
                            <span>Top Score</span>
                            <strong>
                                {leaderboard.length > 0
                                    ? leaderboard[0].score
                                    : 0}
                            </strong>
                        </div>

                        <div className="contest-leaderboard-summary-card">
                            <span>Status</span>
                            <strong>
                                {contest?.status || "-"}
                            </strong>
                        </div>

                    </section>

                    <section className="contest-leaderboard-card">

                        <div className="contest-leaderboard-toolbar">

                            <div>
                                <h2>Leaderboard</h2>
                                <p>
                                    Participant emails are hidden
                                    from the public standings.
                                </p>
                            </div>

                            <div className="contest-leaderboard-search">
                                <span>🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search participant..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                />
                            </div>

                        </div>

                        {filteredLeaderboard.length === 0 ? (

                            <div className="contest-leaderboard-empty">
                                <div>🏆</div>
                                <h3>No participants found</h3>
                                <p>
                                    There are no leaderboard entries
                                    matching your search.
                                </p>
                            </div>

                        ) : (

                            <div className="contest-leaderboard-table-wrap">

                                <table className="contest-leaderboard-table">

                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Participant</th>
                                            <th>Problems Solved</th>
                                            <th>Score</th>
                                            <th>Submissions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredLeaderboard.map(
                                            (participant) => (

                                                <tr key={participant.userId}>

                                                    <td>
                                                        <span
                                                            className={`contest-rank contest-rank-${participant.rank}`}
                                                        >
                                                            {getRankDisplay(
                                                                participant.rank
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="contest-participant">
                                                            <div className="contest-participant-avatar">
                                                                {participant.userName
                                                                    ?.charAt(0)
                                                                    ?.toUpperCase() || "U"}
                                                            </div>

                                                            <div>
                                                                <strong>
                                                                    {participant.userName}
                                                                </strong>
                                                                <span>
                                                                    Participant
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span className="contest-solved-value">
                                                            {participant.problemsSolved}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <strong className="contest-score-value">
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

                            </div>
                        )}

                    </section>
                </>
            )}

        </div>
    );
}

export default ContestLeaderboard;
