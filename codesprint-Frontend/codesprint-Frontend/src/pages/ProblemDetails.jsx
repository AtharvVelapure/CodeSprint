import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./ProblemDetails.css";

function ProblemDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    // ========================================
    // PROBLEM
    // ========================================

    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ========================================
    // CODE EDITOR
    // ========================================

    const [language, setLanguage] = useState("java");

    const [code, setCode] = useState(
`public class Main {

    public static void main(String[] args) {

    }

}`
    );

    const [result, setResult] = useState("");
    const [executing, setExecuting] = useState(false);
    const [resultType, setResultType] = useState("");

    // ========================================
    // HINTS
    // ========================================

    const [hints, setHints] = useState([]);
    const [hintsLoading, setHintsLoading] = useState(false);
    const [hintsError, setHintsError] = useState("");
    const [revealedHints, setRevealedHints] = useState([]);

    // ========================================
    // EDITORIAL
    // ========================================

    const [editorial, setEditorial] = useState(null);
    const [editorialLoading, setEditorialLoading] = useState(false);
    const [editorialLocked, setEditorialLocked] = useState(true);
    const [editorialError, setEditorialError] = useState("");
    const [unsuccessfulAttempts, setUnsuccessfulAttempts] = useState(0);
    const [requiredAttempts, setRequiredAttempts] = useState(3);

    // ========================================
    // LOAD PROBLEM
    // ========================================

    useEffect(() => {

        const loadProblem = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await axios.get(
                    `/api/problems/${id}`
                );

                setProblem(response.data);

            } catch (error) {

                console.error(
                    "Problem loading error:",
                    error
                );

                setError("Unable to load problem.");

            } finally {

                setLoading(false);
            }
        };

        loadProblem();

    }, [id]);

    // ========================================
    // LOAD HINTS
    // ========================================

    useEffect(() => {

        const loadHints = async () => {

            try {

                setHintsLoading(true);
                setHintsError("");
                setRevealedHints([]);

                const response = await axios.get(
                    `/api/problem-hints/problem/${id}`
                );

                setHints(response.data || []);

            } catch (error) {

                console.error(
                    "Hints loading error:",
                    error
                );

                setHintsError(
                    "Unable to load hints."
                );

            } finally {

                setHintsLoading(false);
            }
        };

        if (id) {
            loadHints();
        }

    }, [id]);

    // ========================================
    // GET LOGGED-IN USER
    // ========================================

    const getLoggedInUser = () => {

        const storedUser =
            localStorage.getItem("user");

        if (!storedUser) {
            return null;
        }

        try {

            return JSON.parse(storedUser);

        } catch (error) {

            console.error(
                "Invalid stored user:",
                error
            );

            return null;
        }
    };

    // ========================================
    // LOAD EDITORIAL
    // ========================================

   const loadEditorial = async () => {

    const user = getLoggedInUser();

    if (!user || !user.id) {

        setEditorial(null);
        setEditorialLocked(true);
        setUnsuccessfulAttempts(0);
        setRequiredAttempts(3);
        setEditorialError("");

        return;
    }

    try {

        setEditorialLoading(true);
        setEditorialError("");

        const response = await axios.get(
            `/api/problem-editorials/problem/${id}/user/${user.id}`
        );

        console.log("EDITORIAL API RESPONSE:", response.data);

        const data = response.data;

        // ====================================
        // ATTEMPT COUNT
        // ====================================

        setUnsuccessfulAttempts(
            Number(data.unsuccessfulAttempts) || 0
        );

        setRequiredAttempts(
            Number(data.requiredAttempts) || 3
        );

        // ====================================
        // EDITORIAL ACCESS
        // ====================================

        setEditorialLocked(
            data.unlocked !== true
        );

        // ====================================
        // EDITORIAL DATA
        // ====================================

        if (data.unlocked === true && data.editorial) {

            setEditorial(data.editorial);

        } else {

            setEditorial(null);
        }

    } catch (error) {

        console.error(
            "Editorial loading error:",
            error
        );

        setEditorial(null);
        setEditorialLocked(true);

        setUnsuccessfulAttempts(0);
        setRequiredAttempts(3);

        setEditorialError(
            "Unable to load editorial."
        );

    } finally {

        setEditorialLoading(false);
    }
};

    // ========================================
    // LOAD EDITORIAL WHEN PAGE LOADS
    // ========================================

    useEffect(() => {

        if (!loading && problem) {
            loadEditorial();
        }

    }, [id, loading, problem]);

    // ========================================
    // REVEAL HINT
    // ========================================

    const toggleHint = (hintId) => {

        setRevealedHints((previous) => {

            if (previous.includes(hintId)) {

                return previous.filter(
                    (id) => id !== hintId
                );
            }

            return [...previous, hintId];
        });
    };

    // ========================================
    // LANGUAGE CHANGE
    // ========================================

    const handleLanguageChange = (e) => {

        const selectedLanguage = e.target.value;

        setLanguage(selectedLanguage);
        setResult("");
        setResultType("");

        if (selectedLanguage === "java") {

            setCode(
`public class Main {

    public static void main(String[] args) {

    }

}`
            );

        } else if (selectedLanguage === "c") {

            setCode(
`#include <stdio.h>

int main() {

    int n;

    scanf("%d", &n);

    printf("%d", n * n);

    return 0;
}`
            );

        } else if (selectedLanguage === "cpp") {

            setCode(
`#include <iostream>
using namespace std;

int main() {

    int n;

    cin >> n;

    cout << n * n;

    return 0;
}`
            );

        } else if (selectedLanguage === "python") {

            setCode(
`n = int(input())

print(n * n)`
            );

        } else if (selectedLanguage === "javascript") {

            setCode(
`let input = "";

process.stdin.on("data", chunk => {
    input += chunk;
});

process.stdin.on("end", () => {

    const n = Number(input.trim());

    console.log(n * n);
});`
            );
        }
    };

    // ========================================
    // RUN CODE
    // ========================================

    const handleRun = async () => {

        if (executing) {
            return;
        }

        try {

            setExecuting(true);

            setResult("Running your code...");
            setResultType("loading");

            const response = await axios.post(
                "/api/code/run",
                {
                    problemId: Number(id),
                    language: language,
                    code: code
                }
            );

            const data = response.data;

            if (data.success) {

                setResult(
                    `✓ ${data.status}\n\n${data.output || ""}`
                );

                setResultType("success");

            } else {

                setResult(
                    `✗ ${data.status}\n\n${data.error || "Execution failed"}`
                );

                setResultType("error");
            }

        } catch (error) {

            console.error(
                "Code execution error:",
                error
            );

            setResult(
                "Unable to execute code. Please check whether the backend is running."
            );

            setResultType("error");

        } finally {

            setExecuting(false);
        }
    };

    // ========================================
    // SUBMIT CODE
    // ========================================

    const handleSubmit = async () => {

        if (executing) {
            return;
        }

        // ====================================
        // GET LOGGED-IN USER
        // ====================================

        const storedUser =
            localStorage.getItem("user");

        if (!storedUser) {

            setResult(
                "Please login before submitting your solution."
            );

            setResultType("error");

            return;
        }

        // ====================================
        // PARSE USER
        // ====================================

        let user;

        try {

            user = JSON.parse(storedUser);

        } catch (error) {

            console.error(
                "Invalid stored user:",
                error
            );

            localStorage.removeItem("user");

            setResult(
                "Invalid login session. Please login again."
            );

            setResultType("error");

            return;
        }

        // ====================================
        // CHECK USER ID
        // ====================================

        if (!user.id) {

            setResult(
                "User information is missing. Please login again."
            );

            setResultType("error");

            return;
        }

        try {

            setExecuting(true);

            setResult(
                "Submitting your solution..."
            );

            setResultType("loading");

            // ====================================
            // SUBMIT CODE
            // ====================================

            const response = await axios.post(
                "/api/code/submit",
                {
                    userId: user.id,
                    problemId: Number(id),
                    language: language,
                    code: code
                }
            );

            const data = response.data;

            // ====================================
            // SUCCESS
            // ====================================

            if (data.success) {

                setResult(
                    `✓ ${data.status}\n\n${data.output || ""}`
                );

                setResultType("success");

            }

            // ====================================
            // FAILED
            // ====================================

            else {

                setResult(
                    `✗ ${data.status}\n\n${data.error || "Submission failed"}`
                );

                setResultType("error");
            }

        } catch (error) {

            console.error(
                "Code submission error:",
                error
            );

            if (error.response) {

                console.error(
                    "Backend response:",
                    error.response.data
                );

                console.error(
                    "Status:",
                    error.response.status
                );
            }

            setResult(
                "Unable to submit code. Please check whether the backend is running."
            );

            setResultType("error");

        } finally {

            setExecuting(false);

            // ====================================
            // CHECK EDITORIAL AFTER SUBMISSION
            // ====================================

            setTimeout(() => {
                loadEditorial();
            }, 300);
        }
    };

    // ========================================
    // DIFFICULTY
    // ========================================

    const getDifficultyClass = (value) => {

        if (!value) {
            return "";
        }

        return value.toLowerCase();
    };

    // ========================================
    // LOADING
    // ========================================

    if (loading) {

        return (
            <div className="problem-details-page">

                <div className="problem-details-message">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading problem...
                    </p>

                </div>

            </div>
        );
    }

    // ========================================
    // ERROR
    // ========================================

    if (error || !problem) {

        return (
            <div className="problem-details-page">

                <div className="problem-details-message">

                    <h3>
                        Problem not found
                    </h3>

                    <p>
                        {error ||
                            "The requested problem does not exist."}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/user/problems")
                        }
                    >
                        ← Back to Problems
                    </button>

                </div>

            </div>
        );
    }

    // ========================================
    // MAIN PAGE
    // ========================================

    return (

        <div className="problem-details-page">

            {/* ========================================
                HEADER
            ======================================== */}

            <div className="problem-details-header">

                <button
                    type="button"
                    className="back-problems-button"
                    onClick={() =>
                        navigate("/user/problems")
                    }
                >
                    ← Problems
                </button>

            </div>


            {/* ========================================
                MAIN CONTENT
            ======================================== */}

            <div className="problem-layout">


                {/* ====================================
                    LEFT SIDE
                ==================================== */}

                <div className="problem-content">

                    {/* ====================================
                        PROBLEM HEADER
                    ==================================== */}

                    <section className="problem-details-card">

                        <div className="problem-title-row">

                            <div>

                                <h1>
                                    {problem.title}
                                </h1>

                                <div className="problem-details-meta">

                                    <span className="category-badge">
                                        {problem.category}
                                    </span>

                                    <span
                                        className={`difficulty-badge ${getDifficultyClass(
                                            problem.difficulty
                                        )}`}
                                    >
                                        {problem.difficulty}
                                    </span>

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* ====================================
                        DESCRIPTION
                    ==================================== */}

                    <section className="problem-details-card">

                        <h2>
                            Description
                        </h2>

                        <p className="problem-description">
                            {problem.description}
                        </p>

                    </section>


                    {/* ====================================
                        INPUT FORMAT
                    ==================================== */}

                    {problem.inputFormat && (

                        <section className="problem-details-card">

                            <h2>
                                Input Format
                            </h2>

                            <p className="problem-description">
                                {problem.inputFormat}
                            </p>

                        </section>

                    )}


                    {/* ====================================
                        OUTPUT FORMAT
                    ==================================== */}

                    {problem.outputFormat && (

                        <section className="problem-details-card">

                            <h2>
                                Output Format
                            </h2>

                            <p className="problem-description">
                                {problem.outputFormat}
                            </p>

                        </section>

                    )}


                    {/* ====================================
                        CONSTRAINTS
                    ==================================== */}

                    {problem.constraints && (

                        <section className="problem-details-card">

                            <h2>
                                Constraints
                            </h2>

                            <p className="problem-description">
                                {problem.constraints}
                            </p>

                        </section>

                    )}


                    {/* ====================================
                        HINTS
                    ==================================== */}

                    <section className="problem-details-card hints-card">

                        <div className="problem-extra-header">

                            <div>

                                <h2>
                                    💡 Hints
                                </h2>

                                <p>
                                    Need some guidance? Reveal hints one at a time.
                                </p>

                            </div>

                            {hints.length > 0 && (
                                <span className="extra-count-badge">
                                    {hints.length}{" "}
                                    {hints.length === 1
                                        ? "Hint"
                                        : "Hints"}
                                </span>
                            )}

                        </div>


                        {hintsLoading && (

                            <div className="extra-loading">
                                Loading hints...
                            </div>

                        )}


                        {hintsError && (

                            <div className="extra-error">
                                {hintsError}
                            </div>

                        )}


                        {!hintsLoading &&
                            !hintsError &&
                            hints.length === 0 && (

                                <div className="extra-empty">
                                    No hints are available for this problem yet.
                                </div>

                            )}


                        {!hintsLoading &&
                            hints.length > 0 && (

                                <div className="hints-list">

                                    {hints.map((hint, index) => {

                                        const hintId =
                                            hint.id;

                                        const isRevealed =
                                            revealedHints.includes(
                                                hintId
                                            );

                                        return (

                                            <div
                                                className={`hint-user-item ${
                                                    isRevealed
                                                        ? "revealed"
                                                        : ""
                                                }`}
                                                key={hintId}
                                            >

                                                <div className="hint-user-header">

                                                    <div className="hint-user-title">

                                                        <span className="hint-number">
                                                            Hint{" "}
                                                            {hint.hintOrder ||
                                                                index + 1}
                                                        </span>

                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="hint-reveal-button"
                                                        onClick={() =>
                                                            toggleHint(
                                                                hintId
                                                            )
                                                        }
                                                    >
                                                        {isRevealed
                                                            ? "Hide Hint"
                                                            : "Reveal Hint"}
                                                    </button>

                                                </div>


                                                {isRevealed && (

                                                    <div className="hint-user-text">
                                                        {hint.hintText}
                                                    </div>

                                                )}

                                            </div>

                                        );
                                    })}

                                </div>

                            )}

                    </section>


                    {/* ====================================
                        EDITORIAL
                    ==================================== */}

                    <section className="problem-details-card editorial-user-card">

                        <div className="problem-extra-header">

                            <div>

                                <h2>
                                    📖 Editorial
                                </h2>

                                <p>
                                    Complete the required unsuccessful attempts to unlock the editorial.
                                </p>

                            </div>

                            <span
                                className={`editorial-user-status ${
                                    editorialLocked
                                        ? "locked"
                                        : "unlocked"
                                }`}
                            >
                                {editorialLocked
                                    ? "🔒 Locked"
                                    : "🔓 Unlocked"}
                            </span>

                        </div>


                        {/* ====================================
                            EDITORIAL LOADING
                        ==================================== */}

                        {editorialLoading && (

                            <div className="extra-loading">
                                Checking editorial access...
                            </div>

                        )}


                        {/* ====================================
                            EDITORIAL ERROR
                        ==================================== */}

                        {!editorialLoading &&
                            editorialError && (

                                <div className="extra-error">
                                    {editorialError}
                                </div>

                            )}


                        {/* ====================================
                            EDITORIAL LOCKED
                        ==================================== */}

                        {!editorialLoading &&
                            editorialLocked &&
                            !editorialError && (

                                <div className="editorial-locked-box">

                                    <div className="editorial-lock-icon">
                                        🔒
                                    </div>

                                    <h3>
                                        Editorial Locked
                                    </h3>

                                    <p>
                                        The editorial will become available after
                                        <strong>
                                            {" "}3 unsuccessful submissions
                                        </strong>
                                        {" "}for this problem.
                                    </p>

                                    <span>
                                        Accepted submissions do not count as unsuccessful attempts.
                                    </span>

                                </div>

                            )}


                        {/* ====================================
                            EDITORIAL UNLOCKED
                        ==================================== */}

                        {!editorialLoading &&
                            !editorialLocked &&
                            editorial && (

                                <div className="editorial-content">

                                    {/* APPROACH */}

                                    {editorial.approach && (

                                        <div className="editorial-section">

                                            <h3>
                                                Approach
                                            </h3>

                                            <p>
                                                {editorial.approach}
                                            </p>

                                        </div>

                                    )}


                                    {/* ALGORITHM */}

                                    {editorial.algorithm && (

                                        <div className="editorial-section">

                                            <h3>
                                                Algorithm
                                            </h3>

                                            <p>
                                                {editorial.algorithm}
                                            </p>

                                        </div>

                                    )}


                                    {/* EXPLANATION */}

                                    {editorial.explanation && (

                                        <div className="editorial-section">

                                            <h3>
                                                Explanation
                                            </h3>

                                            <p>
                                                {editorial.explanation}
                                            </p>

                                        </div>

                                    )}


                                    {/* COMPLEXITY */}

                                    <div className="editorial-complexity">

                                        {editorial.timeComplexity && (

                                            <div className="complexity-box">

                                                <span>
                                                    Time Complexity
                                                </span>

                                                <strong>
                                                    {editorial.timeComplexity}
                                                </strong>

                                            </div>

                                        )}

                                        {editorial.spaceComplexity && (

                                            <div className="complexity-box">

                                                <span>
                                                    Space Complexity
                                                </span>

                                                <strong>
                                                    {editorial.spaceComplexity}
                                                </strong>

                                            </div>

                                        )}

                                    </div>

                                </div>

                            )}

                    </section>

                </div>


                {/* ====================================
                    RIGHT SIDE - CODE EDITOR
                ==================================== */}

                <div className="code-section">

                    <section className="code-editor-card">

                        {/* ====================================
                            CODE HEADER
                        ==================================== */}

                        <div className="code-editor-header">

                            <div>

                                <h2>
                                    Code
                                </h2>

                                <p>
                                    Write your solution below.
                                </p>

                            </div>


                            {/* LANGUAGE SELECTOR */}

                            <div className="language-selector">

                                <label htmlFor="language">
                                    Language
                                </label>

                                <select
                                    id="language"
                                    value={language}
                                    onChange={
                                        handleLanguageChange
                                    }
                                    disabled={executing}
                                >

                                    <option value="java">
                                        Java
                                    </option>

                                    <option value="c">
                                        C
                                    </option>

                                    <option value="cpp">
                                        C++
                                    </option>

                                    <option value="python">
                                        Python
                                    </option>

                                    <option value="javascript">
                                        JavaScript
                                    </option>

                                </select>

                            </div>

                        </div>


                        {/* ====================================
                            EDITOR
                        ==================================== */}

                        <div className="code-editor-wrapper">

                            <div className="editor-label">

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
                                className="code-editor"
                                value={code}
                                onChange={(e) =>
                                    setCode(e.target.value)
                                }
                                spellCheck="false"
                                placeholder="Write your code here..."
                                disabled={executing}
                            />

                        </div>


                        {/* ====================================
                            ACTIONS
                        ==================================== */}

                        <div className="code-actions">

                            <button
                                type="button"
                                className="run-button"
                                onClick={handleRun}
                                disabled={executing}
                            >

                                {executing
                                    ? "Running..."
                                    : "▶ Run"}

                            </button>


                            <button
                                type="button"
                                className="submit-button"
                                onClick={handleSubmit}
                                disabled={executing}
                            >

                                {executing
                                    ? "Submitting..."
                                    : "Submit"}

                            </button>

                        </div>


                        {/* ====================================
                            RESULT
                        ==================================== */}

                        <div className="execution-result">

                            <div className="result-header">

                                <h3>
                                    Result
                                </h3>

                            </div>

                            <div
                                className={`result-box ${resultType}`}
                            >

                                {result
                                    ? result
                                    : "Run or submit your code to see the result."}

                            </div>

                        </div>

                    </section>

                </div>

            </div>

        </div>
    );
}

export default ProblemDetails;