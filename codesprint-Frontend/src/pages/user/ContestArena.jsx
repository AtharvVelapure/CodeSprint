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

import "./ContestArena.css";

const API_URL =
    "/api/contests";

function ContestArena() {

    const { id } = useParams();

    const navigate = useNavigate();

    const getLoggedInUser = () => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return null;
        try {
            return JSON.parse(storedUser);
        } catch (error) {
            console.error("Invalid stored user:", error);
            return null;
        }
    };

    const user = getLoggedInUser();

    const [contest, setContest] = useState(null);
    const [loadingContest, setLoadingContest] = useState(true);
    const [contestError, setContestError] = useState("");

    const [contestProblems, setContestProblems] = useState([]);
    const [loadingProblems, setLoadingProblems] = useState(true);
    const [selectedProblem, setSelectedProblem] = useState(null);

    const [registered, setRegistered] = useState(false);
    const [checkingRegistration, setCheckingRegistration] = useState(true);
    const [registrationError, setRegistrationError] = useState("");

    const [language, setLanguage] = useState("java");
    const [code, setCode] = useState(`public class Main {

    public static void main(String[] args) {

    }

}`);
    const [result, setResult] = useState("");
    const [resultType, setResultType] = useState("");
    const [executing, setExecuting] = useState(false);

    const [currentTime, setCurrentTime] = useState(Date.now());
    const [personalStartTime, setPersonalStartTime] = useState(null);
    const [personalEndTime, setPersonalEndTime] = useState(null);
    const [timeExpired, setTimeExpired] = useState(false);
    const [autoSubmitting, setAutoSubmitting] = useState(false);
    const [autoSubmitted, setAutoSubmitted] = useState(false);

    useEffect(() => {
        const loadContest = async () => {
            try {
                setLoadingContest(true);
                setContestError("");
                const response = await axios.get(`${API_URL}/${id}`);
                setContest(response.data);
            } catch (error) {
                console.error("Contest loading error:", error);
                setContestError("Unable to load contest.");
            } finally {
                setLoadingContest(false);
            }
        };

        if (id) loadContest();
    }, [id]);

    useEffect(() => {
        const loadProblems = async () => {
            try {
                setLoadingProblems(true);
                const response = await axios.get(
                    `${API_URL}/${id}/play/problems`,
                    { params: { userId: user.id } }
                );

                const problems = response.data || [];
                setContestProblems(problems);

                if (problems.length > 0) {
                    setSelectedProblem(problems[0]);
                }
            } catch (error) {
                console.error("Contest problems loading error:", error);
            } finally {
                setLoadingProblems(false);
            }
        };

        if (id && user?.id && registered && personalStartTime) {
            loadProblems();
        }
    }, [id, user?.id, registered, personalStartTime]);

    useEffect(() => {
        const checkRegistration = async () => {
            if (!user || !user.id) {
                setRegistered(false);
                setRegistrationError("Please login before entering the contest.");
                setCheckingRegistration(false);
                return;
            }

            try {
                setCheckingRegistration(true);
                setRegistrationError("");

                const response = await axios.get(
                    `${API_URL}/${id}/registered/${user.id}`
                );

                setRegistered(response.data === true);
            } catch (error) {
                console.error("Registration check error:", error);
                setRegistered(false);
                setRegistrationError("Unable to verify your contest registration.");
            } finally {
                setCheckingRegistration(false);
            }
        };

        if (id) checkRegistration();
    }, [id]);

    useEffect(() => {
        if (!contest || !registered || checkingRegistration || !user?.id) {
            return;
        }

        const startContest = async () => {
            try {
                const response = await axios.post(
                    `${API_URL}/${id}/start`,
                    null,
                    { params: { userId: user.id } }
                );

                const participant = response.data;

                if (!participant?.startedAt) {
                    throw new Error("Contest start time was not returned by the server.");
                }

                const startTime = new Date(participant.startedAt).getTime();
                const endTime = participant.expiresAt
                    ? new Date(participant.expiresAt).getTime()
                    : startTime + Number(contest.durationMinutes) * 60 * 1000;

                setPersonalStartTime(startTime);
                setPersonalEndTime(endTime);

                const now = Date.now();
                setCurrentTime(now);

                if (now >= endTime) {
                    setTimeExpired(true);
                }
            } catch (error) {
                console.error("Contest start error:", error);
                setRegistrationError(
                    error.response?.data?.message ||
                    error.message ||
                    "Unable to start the contest."
                );
            }
        };

        startContest();
    }, [contest, registered, checkingRegistration, id, user?.id]);

    useEffect(() => {
        if (!personalStartTime) return;

        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => clearInterval(timer);
    }, [personalStartTime]);

    const personalDurationMs = contest?.durationMinutes
        ? Number(contest.durationMinutes) * 60 * 1000
        : 0;

    const remainingMilliseconds = personalEndTime
        ? Math.max(0, personalEndTime - currentTime)
        : personalDurationMs;

    const remainingSeconds = Math.floor(remainingMilliseconds / 1000);
    const remainingHours = Math.floor(remainingSeconds / 3600);
    const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60);
    const remainingSecondsOnly = remainingSeconds % 60;

    const formattedTime = [
        String(remainingHours).padStart(2, "0"),
        String(remainingMinutes).padStart(2, "0"),
        String(remainingSecondsOnly).padStart(2, "0")
    ].join(":");

    const calculatedStatus = useMemo(() => {
        if (!contest) return "UNKNOWN";

        const now = currentTime;
        const start = new Date(contest.startTime).getTime();
        const end = new Date(contest.endTime).getTime();

        if (now < start) return "UPCOMING";
        if (now >= start && now <= end) return "LIVE";
        return "FINISHED";
    }, [contest, currentTime]);

    const getStarterCode = (selectedLanguage) => {
        if (selectedLanguage === "java") {
            return `public class Main {

    public static void main(String[] args) {

    }

}`;
        }

        if (selectedLanguage === "c") {
            return `#include <stdio.h>

int main() {

    int n;

    scanf("%d", &n);

    printf("%d", n * n);

    return 0;
}`;
        }

        if (selectedLanguage === "cpp") {
            return `#include <iostream>

using namespace std;

int main() {

    int n;

    cin >> n;

    cout << n * n;

    return 0;
}`;
        }

        if (selectedLanguage === "python") {
            return `n = int(input())

print(n * n)`;
        }

        return `let input = "";

process.stdin.on("data", chunk => {

    input += chunk;

});

process.stdin.on("end", () => {

    const n = Number(input.trim());

    console.log(n * n);

});`;
    };

    const handleLanguageChange = (event) => {
        const selectedLanguage = event.target.value;
        setLanguage(selectedLanguage);
        setResult("");
        setResultType("");
        setCode(getStarterCode(selectedLanguage));
    };

    // SECURE CONTEST RUN
    const handleRun = async () => {
        if (executing || timeExpired || autoSubmitted) return;

        if (!selectedProblem) {
            setResult("Please select a problem first.");
            setResultType("error");
            return;
        }

        if (!user?.id) {
            setResult("Please login before running your solution.");
            setResultType("error");
            return;
        }

        if (!registered) {
            setResult("You are not registered for this contest.");
            setResultType("error");
            return;
        }

        try {
            setExecuting(true);
            setResult("Running your code...");
            setResultType("loading");

            const response = await axios.post(
                `${API_URL}/${id}/run`,
                code,
                {
                    params: {
                        userId: user.id,
                        problemId: Number(selectedProblem.problemId),
                        language: language
                    },
                    headers: {
                        "Content-Type": "text/plain"
                    }
                }
            );

            const data = response.data;

            if (data?.success) {
                setResult(`✓ ${data.status}\n\n${data.output || "All test cases passed"}`);
                setResultType("success");
            } else {
                setResult(
                    `✗ ${data?.status || "Execution Failed"}\n\n${
                        data?.error || "Execution failed"
                    }`
                );
                setResultType("error");
            }
        } catch (error) {
            console.error("Contest run error:", error);

            setResult(
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Unable to run contest solution."
            );

            setResultType("error");
        } finally {
            setExecuting(false);
        }
    };

    const submitContestSolution = async (isAutomatic = false) => {
        if (executing || !selectedProblem) return;

        if (!user || !user.id) {
            setResult("Please login before submitting your solution.");
            setResultType("error");
            return;
        }

        if (!registered) {
            setResult("You are not registered for this contest.");
            setResultType("error");
            return;
        }

        try {
            if (isAutomatic) {
                setAutoSubmitting(true);
                setResult("⏰ Your contest time has ended. Automatically submitting your solution...");
            } else {
                setResult("Submitting your solution...");
            }

            setResultType("loading");
            setExecuting(true);

            const contestResponse = await axios.post(
                `${API_URL}/${id}/submit`,
                code,
                {
                    params: {
                        userId: user.id,
                        problemId: Number(selectedProblem.problemId),
                        language: language
                    },
                    headers: {
                        "Content-Type": "text/plain"
                    }
                }
            );

            const submissionData = contestResponse.data;

            const submissionStatus =
                submissionData?.status ||
                (submissionData?.success ? "Accepted" : "Failed");

            if (submissionData?.success) {
                setResult(
                    `${isAutomatic ? "⏰ Automatic Submission\n\n" : ""}✓ ${submissionStatus}\n\n${
                        submissionData.output || "All test cases passed"
                    }`
                );
                setResultType("success");
            } else {
                setResult(
                    `${isAutomatic ? "⏰ Automatic Submission\n\n" : ""}✗ ${submissionStatus}\n\n${
                        submissionData?.error || "Submission failed"
                    }`
                );
                setResultType("error");
            }
        } catch (error) {
            console.error("Contest submission error:", error);

            setResult(
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Unable to submit contest solution."
            );

            setResultType("error");
        } finally {
            setExecuting(false);

            if (isAutomatic) {
                setAutoSubmitting(false);
                setAutoSubmitted(true);
            }
        }
    };

    const handleSubmit = async () => {
        if (timeExpired || autoSubmitted) return;
        await submitContestSolution(false);
    };

    useEffect(() => {
        if (
            !personalEndTime ||
            !registered ||
            timeExpired ||
            autoSubmitted ||
            autoSubmitting
        ) {
            return;
        }

        if (currentTime >= personalEndTime) {
            setTimeExpired(true);
            submitContestSolution(true);
        }
    }, [
        currentTime,
        personalEndTime,
        registered,
        timeExpired,
        autoSubmitted,
        autoSubmitting
    ]);

    const getDifficultyClass = (value) => {
        if (!value) return "";
        return value.toLowerCase();
    };

    const handleProblemSelect = (contestProblem) => {
        if (timeExpired || autoSubmitted) return;

        setSelectedProblem(contestProblem);
        setResult("");
        setResultType("");
        setCode(getStarterCode(language));
    };

    if (loadingContest) {
        return (
            <div className="contest-arena-page">
                <div className="contest-arena-loading">
                    <div className="contest-loading-spinner"></div>
                    <p>Loading contest...</p>
                </div>
            </div>
        );
    }

    if (contestError || !contest) {
        return (
            <div className="contest-arena-page">
                <div className="contest-arena-message">
                    <h2>Contest not found</h2>
                    <p>{contestError || "The requested contest does not exist."}</p>
                    <button type="button" onClick={() => navigate("/user/contests")}>
                        ← Back to Contests
                    </button>
                </div>
            </div>
        );
    }

    if (
        !checkingRegistration &&
        registrationError &&
        calculatedStatus === "LIVE"
    ) {
        return (
            <div className="contest-arena-page">
                <div className="contest-arena-message">
                    <div className="contest-message-icon">⚠️</div>
                    <h2>Unable to Verify Registration</h2>
                    <p>{registrationError}</p>
                    <button type="button" onClick={() => window.location.reload()}>
                        ↻ Try Again
                    </button>
                    <button
                        type="button"
                        className="secondary-message-button"
                        onClick={() => navigate("/user/contests")}
                    >
                        ← Back to Contests
                    </button>
                </div>
            </div>
        );
    }

    if (
        !checkingRegistration &&
        !registrationError &&
        !registered &&
        calculatedStatus === "LIVE"
    ) {
        return (
            <div className="contest-arena-page">
                <div className="contest-arena-message">
                    <div className="contest-message-icon">🔒</div>
                    <h2>Not Registered</h2>
                    <p>You are not registered for this contest.</p>
                    <button type="button" onClick={() => navigate("/user/contests")}>
                        ← Back to Contests
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="contest-arena-page">
            <header className="contest-arena-header">
                <div className="contest-header-left">
                    <button
                        type="button"
                        className="contest-back-button"
                        onClick={() => navigate("/user/contests")}
                    >
                        ← Contests
                    </button>

                    <div className="contest-header-title">
                        <span>CONTEST</span>
                        <h1>{contest.title}</h1>
                    </div>
                </div>

                <div className="contest-header-center">
                    <div className={`contest-status-badge ${calculatedStatus.toLowerCase()}`}>
                        <span className="status-dot"></span>
                        {calculatedStatus}
                    </div>

                    <div
                        className={`contest-timer ${
                            remainingSeconds <= 300 ? "danger" : ""
                        }`}
                    >
                        <span>⏱</span>
                        <strong>{formattedTime}</strong>
                        <small>{timeExpired ? "Time finished" : "Your time left"}</small>
                    </div>
                </div>

                <div className="contest-header-right">
                    <div className="contest-duration">
                        <span>Your Duration</span>
                        <strong>{contest.durationMinutes} min</strong>
                    </div>
                </div>
            </header>

            {timeExpired && (
                <div className="contest-time-expired-banner">
                    <strong>⏰ Your contest time has ended.</strong>
                    <span>
                        {autoSubmitted
                            ? "Your current solution was automatically submitted."
                            : "Your solution submission is being processed."}
                    </span>
                </div>
            )}

            <main className="contest-arena-main">
                {!selectedProblem ? (
                    <section className="contest-empty-workspace contest-empty-workspace-full">
                        <div>📝</div>
                        <h2>{loadingProblems ? "Loading problems..." : "No problem selected"}</h2>
                        <p>
                            {loadingProblems
                                ? "Please wait while contest problems are loaded."
                                : "Select a contest problem to start solving."}
                        </p>
                    </section>
                ) : (
                    <div className="contest-split-workspace">
                        <section className="contest-problem-panel">
                            <div className="contest-problem-tabs">
                                {contestProblems.map((contestProblem, index) => {
                                    const isSelected =
                                        selectedProblem?.problemId === contestProblem?.problemId;

                                    return (
                                        <button
                                            type="button"
                                            key={contestProblem.contestProblemId}
                                            className={`contest-problem-tab ${
                                                isSelected ? "selected" : ""
                                            }`}
                                            onClick={() => handleProblemSelect(contestProblem)}
                                            disabled={timeExpired || autoSubmitted}
                                        >
                                            <span className="contest-problem-tab-number">
                                                {contestProblem.problemOrder || index + 1}
                                            </span>
                                            <span className="contest-problem-tab-title">
                                                {contestProblem.title}
                                            </span>
                                            <span className="contest-problem-tab-points">
                                                {contestProblem.points} pts
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="contest-problem-panel-body">
                                <div className="contest-problem-heading">
                                    <div>
                                        <span className="contest-question-label">PROBLEM</span>
                                        <h2>{selectedProblem.title}</h2>
                                    </div>
                                    <span
                                        className={`difficulty-badge ${getDifficultyClass(
                                            selectedProblem.difficulty
                                        )}`}
                                    >
                                        {selectedProblem.difficulty}
                                    </span>
                                </div>

                                <div className="contest-description-body">
                                    <p>{selectedProblem.description}</p>

                                    {selectedProblem.inputFormat && (
                                        <div className="contest-format-section">
                                            <h3>Input Format</h3>
                                            <div className="contest-format-box">
                                                {selectedProblem.inputFormat}
                                            </div>
                                        </div>
                                    )}

                                    {selectedProblem.outputFormat && (
                                        <div className="contest-format-section">
                                            <h3>Output Format</h3>
                                            <div className="contest-format-box">
                                                {selectedProblem.outputFormat}
                                            </div>
                                        </div>
                                    )}

                                    {selectedProblem.constraints && (
                                        <div className="contest-format-section">
                                            <h3>Constraints</h3>
                                            <div className="contest-format-box">
                                                {selectedProblem.constraints}
                                            </div>
                                        </div>
                                    )}

                                    <div className="contest-problem-meta-grid">
                                        <div>
                                            <span>Points</span>
                                            <strong>{selectedProblem.points} pts</strong>
                                        </div>
                                        <div>
                                            <span>Category</span>
                                            <strong>{selectedProblem.category || "-"}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="contest-solution-panel">
                            <div
                                className={`contest-code-card ${
                                    timeExpired ? "contest-code-locked" : ""
                                }`}
                            >
                                <div className="contest-code-header">
                                    <div>
                                        <span>CODE EDITOR</span>
                                        <h3>
                                            {timeExpired
                                                ? "Contest time finished"
                                                : "Write your solution"}
                                        </h3>
                                    </div>

                                    <div className="contest-language-selector">
                                        <label htmlFor="contest-language">Language</label>
                                        <select
                                            id="contest-language"
                                            value={language}
                                            onChange={handleLanguageChange}
                                            disabled={executing || timeExpired || autoSubmitted}
                                        >
                                            <option value="java">Java</option>
                                            <option value="c">C</option>
                                            <option value="cpp">C++</option>
                                            <option value="python">Python</option>
                                            <option value="javascript">JavaScript</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="contest-editor-wrapper">
                                    <div className="contest-editor-label">
                                        {language === "java"
                                            ? "Java"
                                            : language === "c"
                                            ? "C"
                                            : language === "cpp"
                                            ? "C++"
                                            : language === "python"
                                            ? "Python"
                                            : "JavaScript"}
                                    </div>

                                    <textarea
                                        className="contest-code-editor"
                                        value={code}
                                        onChange={(event) => setCode(event.target.value)}
                                        spellCheck="false"
                                        disabled={executing || timeExpired || autoSubmitted}
                                        placeholder="Write your code here..."
                                    />
                                </div>

                                <div className="contest-code-actions">
                                    <button
                                        type="button"
                                        className="contest-run-button"
                                        onClick={handleRun}
                                        disabled={executing || timeExpired || autoSubmitted}
                                    >
                                        {executing ? "Running..." : "▶ Run"}
                                    </button>

                                    <button
                                        type="button"
                                        className="contest-submit-button"
                                        onClick={handleSubmit}
                                        disabled={executing || timeExpired || autoSubmitted}
                                    >
                                        {executing ? "Submitting..." : "Submit Solution"}
                                    </button>
                                </div>
                            </div>

                            <div className="contest-result-card">
                                <div className="contest-result-header">
                                    <span>OUTPUT</span>
                                    <h3>Result</h3>
                                </div>

                                <pre className={`contest-result-box ${resultType}`}>
                                    {result || "Run or submit your code to see the result."}
                                </pre>
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}

export default ContestArena;
