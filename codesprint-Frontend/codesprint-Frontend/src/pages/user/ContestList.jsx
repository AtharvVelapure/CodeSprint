import {
    useEffect,
    useMemo,
    useState
} from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ContestList.css";

const API_URL = "/api/contests";

function ContestList() {
    const navigate = useNavigate();

    const storedUser = localStorage.getItem("user");
    let user = null;

    try {
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error("Unable to read user:", error);
        user = null;
    }

    const [contests, setContests] = useState([]);
    const [registrationStatus, setRegistrationStatus] = useState({});
    const [loading, setLoading] = useState(true);
    const [registeringId, setRegisteringId] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadContests();
    }, []);

    const loadContests = async () => {
        try {
            setLoading(true);
            setError("");
            setMessage("");

            const response = await axios.get(API_URL);
            const data = Array.isArray(response.data) ? response.data : [];
            setContests(data);

            if (user?.id && data.length > 0) {
                const registrationResults = await Promise.all(
                    data.map(async (contest) => {
                        try {
                            const registrationResponse = await axios.get(
                                `${API_URL}/${contest.id}/registered/${user.id}`
                            );

                            return {
                                id: contest.id,
                                registered: registrationResponse.data === true
                            };
                        } catch (registrationError) {
                            console.error(
                                `Registration check failed for contest ${contest.id}:`,
                                registrationError
                            );

                            return {
                                id: contest.id,
                                registered: false
                            };
                        }
                    })
                );

                const statusMap = {};

                registrationResults.forEach((item) => {
                    statusMap[item.id] = item.registered;
                });

                setRegistrationStatus(statusMap);
            } else {
                setRegistrationStatus({});
            }
        } catch (loadError) {
            console.error("Contest loading error:", loadError);
            setError(
                "Unable to load contests. Please make sure the backend is running."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (contest) => {
        if (!user?.id) {
            setError("Please login to register for a contest.");
            return;
        }

        try {
            setRegisteringId(contest.id);
            setMessage("");
            setError("");

            await axios.post(
                `${API_URL}/${contest.id}/register`,
                null,
                {
                    params: {
                        userId: user.id
                    }
                }
            );

            setRegistrationStatus((previous) => ({
                ...previous,
                [contest.id]: true
            }));

            setMessage(
                `You have successfully registered for "${contest.title}".`
            );
        } catch (registerError) {
            console.error("Contest registration error:", registerError);

            let errorMessage = "Unable to register for the contest.";

            if (registerError.response?.data?.message) {
                errorMessage = registerError.response.data.message;
            } else if (typeof registerError.response?.data === "string") {
                errorMessage = registerError.response.data;
            }

            setError(errorMessage);
        } finally {
            setRegisteringId(null);
        }
    };

    const handleOpenLobby = (contest) => {
        navigate(`/contests/${contest.id}/register`);
    };

    const handleEnterContest = (contest) => {
        setMessage("");
        setError("");

        if (!user?.id) {
            setError("Please login before entering a contest.");
            return;
        }

        if (registrationStatus[contest.id] !== true) {
            setError("You must register for this contest before entering.");
            return;
        }

        if (contest.status !== "LIVE") {
            setError("This contest is not currently live.");
            return;
        }

        navigate(`/contests/${contest.id}/register`);
    };

    const handleViewResults = (contest) => {
        navigate("/user/contests/results", {
            state: {
                contestId: contest?.id
            }
        });
    };

    const handleViewLeaderboard = (contest) => {
        navigate(`/user/contests/${contest.id}/leaderboard`);
    };

    const filteredContests = useMemo(() => {
        const query = search.trim().toLowerCase();

        return contests.filter((contest) => {
            const matchesSearch =
                !query ||
                contest.title?.toLowerCase().includes(query) ||
                contest.description?.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "ALL" ||
                contest.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [contests, search, statusFilter]);

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "-";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "UPCOMING":
                return "user-contest-status upcoming";
            case "LIVE":
                return "user-contest-status active";
            case "FINISHED":
                return "user-contest-status completed";
            case "CANCELLED":
                return "user-contest-status cancelled";
            default:
                return "user-contest-status";
        }
    };

    const totalContests = contests.length;

    const upcomingContests = contests.filter(
        (contest) => contest.status === "UPCOMING"
    ).length;

    const liveContests = contests.filter(
        (contest) => contest.status === "LIVE"
    ).length;

    const finishedContests = contests.filter(
        (contest) => contest.status === "FINISHED"
    ).length;

    if (loading) {
        return (
            <div className="user-contest-page">
                <div className="user-contest-loading">
                    <div className="user-contest-spinner"></div>
                    <h2>Loading Contests...</h2>
                    <p>Fetching available coding contests.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="user-contest-page">
            <main className="user-contest-content">

                <section className="user-contest-header">
                    <div>
                        <span>CODESPRINT CONTESTS</span>
                        <h1>Coding Contests</h1>
                        <p>
                            Compete with other developers, solve challenging
                            problems and climb the leaderboard.
                        </p>
                    </div>

                    <button
                        className="my-results-button"
                        type="button"
                        onClick={() => navigate("/user/contests/results")}
                    >
                        <span>🏆</span>
                        My Results
                    </button>
                </section>

                {message && (
                    <div className="user-contest-success">
                        <span>✓</span>
                        {message}
                    </div>
                )}

                {error && (
                    <div className="user-contest-error">
                        <span>!</span>
                        {error}
                    </div>
                )}

                <section className="user-contest-stats">
                    <div className="user-contest-stat-card">
                        <div className="stat-icon">🏆</div>
                        <div>
                            <span>Total Contests</span>
                            <strong>{totalContests}</strong>
                        </div>
                    </div>

                    <div className="user-contest-stat-card">
                        <div className="stat-icon">📅</div>
                        <div>
                            <span>Upcoming</span>
                            <strong>{upcomingContests}</strong>
                        </div>
                    </div>

                    <div className="user-contest-stat-card">
                        <div className="stat-icon">🔴</div>
                        <div>
                            <span>Live</span>
                            <strong>{liveContests}</strong>
                        </div>
                    </div>

                    <div className="user-contest-stat-card">
                        <div className="stat-icon">✓</div>
                        <div>
                            <span>Finished</span>
                            <strong>{finishedContests}</strong>
                        </div>
                    </div>
                </section>

                <section className="user-contest-filter-bar">
                    <div className="user-contest-search">
                        <span>🔍</span>

                        <input
                            type="text"
                            placeholder="Search contests..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                    >
                        <option value="ALL">All Contests</option>
                        <option value="UPCOMING">Upcoming</option>
                        <option value="LIVE">Live</option>
                        <option value="FINISHED">Finished</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>

                    <button
                        type="button"
                        onClick={loadContests}
                        disabled={loading}
                    >
                        ↻ Refresh
                    </button>
                </section>

                <section className="user-contest-list">
                    {filteredContests.length === 0 ? (
                        <div className="user-contest-empty">
                            <div>🏆</div>
                            <h2>No contests found</h2>

                            <p>
                                {search || statusFilter !== "ALL"
                                    ? "Try changing your search or filter."
                                    : "There are no contests available right now."}
                            </p>
                        </div>
                    ) : (
                        filteredContests.map((contest) => {
                            const isRegistered =
                                registrationStatus[contest.id] === true;

                            return (
                                <article
                                    className="user-contest-card"
                                    key={contest.id}
                                >
                                    <div className="user-contest-card-top">
                                        <div className="user-contest-card-icon">
                                            🏆
                                        </div>

                                        <span
                                            className={getStatusClass(
                                                contest.status
                                            )}
                                        >
                                            {contest.status}
                                        </span>
                                    </div>

                                    <h2>{contest.title}</h2>

                                    <p className="user-contest-description">
                                        {contest.description ||
                                            "Join this coding contest and test your programming skills."}
                                    </p>

                                    <div className="user-contest-details">
                                        <div>
                                            <span>📅 Start</span>
                                            <strong>
                                                {formatDate(contest.startTime)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>⏰ End</span>
                                            <strong>
                                                {formatDate(contest.endTime)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>⏱ Duration</span>
                                            <strong>
                                                {contest.durationMinutes
                                                    ? `${contest.durationMinutes} minutes`
                                                    : "-"}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="user-contest-card-actions">

                                        {contest.status === "UPCOMING" &&
                                            !isRegistered && (
                                                <button
                                                    className="register-button"
                                                    type="button"
                                                    disabled={
                                                        registeringId ===
                                                        contest.id
                                                    }
                                                    onClick={() =>
                                                        handleRegister(contest)
                                                    }
                                                >
                                                    {registeringId === contest.id
                                                        ? "Registering..."
                                                        : "Register Now"}
                                                </button>
                                            )}

                                        {contest.status === "UPCOMING" &&
                                            isRegistered && (
                                                <button
                                                    className="registered-button"
                                                    type="button"
                                                    onClick={() =>
                                                        handleOpenLobby(contest)
                                                    }
                                                >
                                                    ✓ Registered — View Lobby
                                                </button>
                                            )}

                                        {contest.status === "LIVE" &&
                                            isRegistered && (
                                                <>
                                                    <button
                                                        className="enter-contest-button"
                                                        type="button"
                                                        onClick={() =>
                                                            handleEnterContest(
                                                                contest
                                                            )
                                                        }
                                                    >
                                                        Enter Contest →
                                                    </button>

                                                    <button
                                                        className="view-contest-button"
                                                        type="button"
                                                        onClick={() =>
                                                            handleViewLeaderboard(
                                                                contest
                                                            )
                                                        }
                                                    >
                                                        🏆 Leaderboard
                                                    </button>
                                                </>
                                            )}

                                        {contest.status === "LIVE" &&
                                            !isRegistered && (
                                                <button
                                                    className="contest-not-registered-button"
                                                    type="button"
                                                    disabled
                                                >
                                                    🔒 Registration Closed
                                                </button>
                                            )}

                                        {contest.status === "FINISHED" && (
                                            <>
                                                <button
                                                    className="view-contest-button"
                                                    type="button"
                                                    onClick={() =>
                                                        handleViewResults(
                                                            contest
                                                        )
                                                    }
                                                >
                                                    View Results →
                                                </button>

                                                <button
                                                    className="view-contest-button"
                                                    type="button"
                                                    onClick={() =>
                                                        handleViewLeaderboard(
                                                            contest
                                                        )
                                                    }
                                                >
                                                    🏆 Leaderboard
                                                </button>
                                            </>
                                        )}

                                        {contest.status === "CANCELLED" && (
                                            <button
                                                className="contest-not-registered-button"
                                                type="button"
                                                disabled
                                            >
                                                Contest Cancelled
                                            </button>
                                        )}

                                        {contest.status === "DRAFT" && (
                                            <button
                                                className="contest-not-registered-button"
                                                type="button"
                                                disabled
                                            >
                                                Not Published
                                            </button>
                                        )}

                                    </div>
                                </article>
                            );
                        })
                    )}
                </section>

            </main>
        </div>
    );
}

export default ContestList;
