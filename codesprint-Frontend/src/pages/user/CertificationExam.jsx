import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import axios from "axios";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import "./CertificationExam.css";

const API_URL = "/api/certifications";
const CODE_RUN_URL = "/api/code/run";

// ============================================================
// STARTER CODE
// ============================================================

const STARTER_CODE = {

    java:
`import java.util.*;

public class Main {
    public static void main(String[] args) {

        // Write your solution here

    }
}`,

    python:
`def main():
    # Write your solution here
    pass

if __name__ == "__main__":
    main()`,

    cpp:
`#include <bits/stdc++.h>
using namespace std;

int main() {

    // Write your solution here

    return 0;
}`,

    c:
`#include <stdio.h>

int main() {

    // Write your solution here

    return 0;
}`,

    javascript:
`function main() {

    // Write your solution here

}

main();`
};

// ============================================================
// DISPLAY LANGUAGE
// ============================================================

const LANGUAGE_LABELS = {
    java: "Java",
    python: "Python",
    cpp: "C++",
    c: "C",
    javascript: "JavaScript"
};

// ============================================================
// LANGUAGE USED BY /api/code/run
// ============================================================

const RUN_LANGUAGE = {
    java: "Java",
    python: "Python",
    cpp: "C++",
    c: "C",
    javascript: "JavaScript"
};

function CertificationExam() {

    const {
        id,
        attemptId
    } = useParams();

    const navigate = useNavigate();

    // ============================================================
    // STATE
    // ============================================================

    const [certification, setCertification] =
        useState(null);

    const [questions, setQuestions] =
        useState([]);

    /*
     * Final/current answers for the selected language.
     *
     * {
     *    questionId: "code"
     * }
     *
     * This is the structure expected by the certification
     * submission endpoint.
     */
    const [answers, setAnswers] =
        useState({});

    /*
     * Keeps code separately for every language.
     *
     * {
     *   questionId: {
     *      java: "...",
     *      python: "...",
     *      cpp: "...",
     *      c: "...",
     *      javascript: "..."
     *   }
     * }
     */
    const [languageDrafts, setLanguageDrafts] =
        useState({});

    const [currentQuestion, setCurrentQuestion] =
        useState(0);

    const [language, setLanguage] =
        useState("java");

    const [timeLeft, setTimeLeft] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [running, setRunning] =
        useState(false);

    const [error, setError] =
        useState("");

    const [confirmSubmit, setConfirmSubmit] =
        useState(false);

    /*
     * questionId -> latest Run Code result
     */
    const [runResults, setRunResults] =
        useState({});

    const autoSubmitTriggered =
        useRef(false);

    // ============================================================
    // ERROR MESSAGE
    // ============================================================

    const getErrorMessage = (
        err,
        fallbackMessage
    ) => {

        const data =
            err.response?.data;

        if (typeof data === "string") {
            return data;
        }

        if (data?.message) {
            return data.message;
        }

        if (data?.error) {
            return data.error;
        }

        if (err.message) {
            return err.message;
        }

        return fallbackMessage;
    };

    // ============================================================
    // LOAD EXAM
    // ============================================================

    const loadExam = useCallback(
        async () => {

            try {

                setLoading(true);
                setError("");

                const [
                    certificationResponse,
                    questionsResponse
                ] = await Promise.all([

                    axios.get(
                        `${API_URL}/${id}`
                    ),

                    axios.get(
                        `${API_URL}/${id}/questions`
                    )
                ]);

                const certificationData =
                    certificationResponse.data;

                const loadedQuestions =
                    Array.isArray(
                        questionsResponse.data
                    )
                        ? questionsResponse.data
                        : [];

                setCertification(
                    certificationData
                );

                setQuestions(
                    loadedQuestions
                );

                // ------------------------------------------------
                // RESTORE LANGUAGE
                // ------------------------------------------------

                const savedLanguage =
                    sessionStorage.getItem(
                        `certification-language-${attemptId}`
                    );

                const restoredLanguage =
                    STARTER_CODE[savedLanguage]
                        ? savedLanguage
                        : "java";

                setLanguage(
                    restoredLanguage
                );

                // ------------------------------------------------
                // RESTORE LANGUAGE DRAFTS
                // ------------------------------------------------

                const savedDrafts =
                    sessionStorage.getItem(
                        `certification-language-drafts-${attemptId}`
                    );

                let restoredDrafts = {};

                if (savedDrafts) {

                    try {

                        const parsed =
                            JSON.parse(
                                savedDrafts
                            );

                        if (
                            parsed &&
                            typeof parsed === "object"
                        ) {

                            restoredDrafts =
                                parsed;
                        }

                    } catch (parseError) {

                        console.error(
                            "Unable to restore language drafts:",
                            parseError
                        );
                    }
                }

                // ------------------------------------------------
                // RESTORE OLD ANSWERS
                // ------------------------------------------------

                const savedAnswers =
                    sessionStorage.getItem(
                        `certification-answers-${attemptId}`
                    );

                let restoredAnswers = {};

                if (savedAnswers) {

                    try {

                        const parsedAnswers =
                            JSON.parse(
                                savedAnswers
                            );

                        if (
                            parsedAnswers &&
                            typeof parsedAnswers ===
                                "object"
                        ) {

                            restoredAnswers =
                                parsedAnswers;
                        }

                    } catch (parseError) {

                        console.error(
                            "Unable to restore certification answers:",
                            parseError
                        );
                    }
                }

                /*
                 * Backward compatibility:
                 *
                 * Your previous CertificationExam stored:
                 *
                 * {
                 *    questionId: "code"
                 * }
                 *
                 * Move those old answers into the currently
                 * selected language draft.
                 */
                Object.entries(
                    restoredAnswers
                ).forEach(
                    ([questionId, code]) => {

                        if (
                            typeof code !== "string"
                        ) {
                            return;
                        }

                        if (
                            !restoredDrafts[
                                questionId
                            ]
                        ) {

                            restoredDrafts[
                                questionId
                            ] = {};
                        }

                        if (
                            !restoredDrafts[
                                questionId
                            ][restoredLanguage]
                        ) {

                            restoredDrafts[
                                questionId
                            ][restoredLanguage] =
                                code;
                        }
                    }
                );

                /*
                 * Give every question starter code for the
                 * currently selected language.
                 */
                loadedQuestions.forEach(
                    item => {

                        const questionId =
                            String(item.id);

                        if (
                            !restoredDrafts[
                                questionId
                            ]
                        ) {

                            restoredDrafts[
                                questionId
                            ] = {};
                        }

                        if (
                            restoredDrafts[
                                questionId
                            ][restoredLanguage] ===
                            undefined
                        ) {

                            restoredDrafts[
                                questionId
                            ][restoredLanguage] =
                                STARTER_CODE[
                                    restoredLanguage
                                ];
                        }
                    }
                );

                setLanguageDrafts(
                    restoredDrafts
                );

                /*
                 * Build current-language answers.
                 */
                const currentAnswers = {};

                loadedQuestions.forEach(
                    item => {

                        const questionId =
                            String(item.id);

                        currentAnswers[item.id] =
                            restoredDrafts[
                                questionId
                            ]?.[
                                restoredLanguage
                            ] ||
                            STARTER_CODE[
                                restoredLanguage
                            ];
                    }
                );

                setAnswers(
                    currentAnswers
                );

            } catch (err) {

                console.error(
                    "Error loading certification exam:",
                    err
                );

                setError(
                    getErrorMessage(
                        err,
                        "Unable to load certification exam."
                    )
                );

            } finally {

                setLoading(false);
            }

        },
        [
            id,
            attemptId
        ]
    );

    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        loadExam();

    }, [loadExam]);

    // ============================================================
    // SAVE ANSWERS
    // ============================================================

    useEffect(() => {

        if (!attemptId) {
            return;
        }

        try {

            sessionStorage.setItem(
                `certification-answers-${attemptId}`,
                JSON.stringify(
                    answers
                )
            );

        } catch (storageError) {

            console.error(
                "Unable to save certification answers:",
                storageError
            );
        }

    }, [
        answers,
        attemptId
    ]);

    // ============================================================
    // SAVE LANGUAGE DRAFTS
    // ============================================================

    useEffect(() => {

        if (!attemptId) {
            return;
        }

        try {

            sessionStorage.setItem(
                `certification-language-drafts-${attemptId}`,
                JSON.stringify(
                    languageDrafts
                )
            );

        } catch (storageError) {

            console.error(
                "Unable to save language drafts:",
                storageError
            );
        }

    }, [
        languageDrafts,
        attemptId
    ]);

    // ============================================================
    // SAVE LANGUAGE
    // ============================================================

    useEffect(() => {

        if (!attemptId) {
            return;
        }

        sessionStorage.setItem(
            `certification-language-${attemptId}`,
            language
        );

    }, [
        language,
        attemptId
    ]);

    // ============================================================
    // LOAD ACTUAL ATTEMPT START TIME
    // ============================================================

    useEffect(() => {

        const loadAttemptTime =
            async () => {

                try {

                    const response =
                        await axios.get(
                            `${API_URL}/attempts/${attemptId}`
                        );

                    const attempt =
                        response.data;

                    if (!attempt) {
                        return;
                    }

                    if (
                        attempt.status &&
                        attempt.status !==
                            "IN_PROGRESS"
                    ) {

                        navigate(
                            `/user/certifications/${id}/result/${attemptId}`,
                            {
                                replace: true
                            }
                        );

                        return;
                    }

                    if (
                        !attempt.startedAt ||
                        !certification
                            ?.durationMinutes
                    ) {
                        return;
                    }

                    const startedAt =
                        new Date(
                            attempt.startedAt
                        ).getTime();

                    if (
                        Number.isNaN(
                            startedAt
                        )
                    ) {

                        console.error(
                            "Invalid attempt start time:",
                            attempt.startedAt
                        );

                        return;
                    }

                    const durationMilliseconds =
                        certification
                            .durationMinutes *
                        60 *
                        1000;

                    const expiryTime =
                        startedAt +
                        durationMilliseconds;

                    const remainingMilliseconds =
                        expiryTime -
                        Date.now();

                    const remainingSeconds =
                        Math.max(
                            0,
                            Math.floor(
                                remainingMilliseconds /
                                    1000
                            )
                        );

                    setTimeLeft(
                        remainingSeconds
                    );

                } catch (err) {

                    console.error(
                        "Error loading certification attempt:",
                        err
                    );
                }
            };

        if (
            !loading &&
            certification
        ) {

            loadAttemptTime();
        }

    }, [
        attemptId,
        id,
        certification,
        loading,
        navigate
    ]);

    // ============================================================
    // SUBMIT CERTIFICATION
    // ============================================================

    const handleSubmit = useCallback(
        async (
            autoSubmit = false
        ) => {

            if (submitting) {
                return;
            }

            if (
                autoSubmit &&
                autoSubmitTriggered.current
            ) {
                return;
            }

            if (autoSubmit) {

                autoSubmitTriggered.current =
                    true;
            }

            try {

                setSubmitting(true);
                setConfirmSubmit(false);
                setError("");

                /*
                 * The certification backend expects:
                 *
                 * {
                 *    questionId: "code"
                 * }
                 *
                 * Build that structure from the
                 * currently selected language.
                 */
                const submissionAnswers = {};

                questions.forEach(
                    item => {

                        const questionId =
                            String(item.id);

                        submissionAnswers[
                            item.id
                        ] =
                            languageDrafts[
                                questionId
                            ]?.[language] ??
                            answers[
                                item.id
                            ] ??
                            STARTER_CODE[
                                language
                            ];
                    }
                );

                const response =
                    await axios.post(

                        `${API_URL}/attempts/${attemptId}/submit?language=${encodeURIComponent(
                            language
                        )}`,

                        submissionAnswers,

                        {
                            headers: {
                                "Content-Type":
                                    "application/json"
                            }
                        }
                    );

                sessionStorage.setItem(
                    `certification-result-${attemptId}`,
                    JSON.stringify(
                        response.data
                    )
                );

                sessionStorage.removeItem(
                    `certification-answers-${attemptId}`
                );

                sessionStorage.removeItem(
                    `certification-language-${attemptId}`
                );

                sessionStorage.removeItem(
                    `certification-language-drafts-${attemptId}`
                );

                navigate(
                    `/user/certifications/${id}/result/${attemptId}`,
                    {
                        replace: true
                    }
                );

            } catch (err) {

                console.error(
                    "Error submitting certification:",
                    err
                );

                const message =
                    getErrorMessage(
                        err,
                        "Unable to submit certification."
                    );

                if (
                    message
                        .toLowerCase()
                        .includes(
                            "expired"
                        )
                ) {

                    try {

                        const attemptResponse =
                            await axios.get(
                                `${API_URL}/attempts/${attemptId}`
                            );

                        sessionStorage.setItem(
                            `certification-result-${attemptId}`,
                            JSON.stringify(
                                attemptResponse.data
                            )
                        );

                    } catch (
                        loadError
                    ) {

                        console.error(
                            "Unable to load expired attempt:",
                            loadError
                        );
                    }

                    navigate(
                        `/user/certifications/${id}/result/${attemptId}`,
                        {
                            replace: true
                        }
                    );

                    return;
                }

                setError(
                    message
                );

                setSubmitting(
                    false
                );

                if (
                    autoSubmit
                ) {

                    autoSubmitTriggered.current =
                        false;
                }
            }

        },
        [
            submitting,
            id,
            attemptId,
            language,
            answers,
            languageDrafts,
            questions,
            navigate
        ]
    );

    // ============================================================
    // TIMER
    // ============================================================

    useEffect(() => {

        if (
            loading ||
            timeLeft === null ||
            submitting
        ) {
            return;
        }

        if (
            timeLeft <= 0
        ) {

            if (
                !autoSubmitTriggered.current
            ) {

                handleSubmit(
                    true
                );
            }

            return;
        }

        const timer =
            setInterval(
                () => {

                    setTimeLeft(
                        previousTime => {

                            if (
                                previousTime <= 1
                            ) {

                                return 0;
                            }

                            return (
                                previousTime -
                                1
                            );
                        }
                    );

                },
                1000
            );

        return () =>
            clearInterval(
                timer
            );

    }, [
        timeLeft,
        loading,
        submitting,
        handleSubmit
    ]);

    // ============================================================
    // FORMAT TIMER
    // ============================================================

    const formattedTime =
        useMemo(() => {

            if (
                timeLeft === null
            ) {

                return "--:--:--";
            }

            const hours =
                Math.floor(
                    timeLeft /
                        3600
                );

            const minutes =
                Math.floor(
                    (
                        timeLeft %
                        3600
                    ) /
                        60
                );

            const seconds =
                timeLeft %
                60;

            return [

                hours
                    .toString()
                    .padStart(
                        2,
                        "0"
                    ),

                minutes
                    .toString()
                    .padStart(
                        2,
                        "0"
                    ),

                seconds
                    .toString()
                    .padStart(
                        2,
                        "0"
                    )

            ].join(":");

        }, [timeLeft]);

    // ============================================================
    // CURRENT QUESTION
    // ============================================================

    const question =
        questions[
            currentQuestion
        ];

    // ============================================================
    // CURRENT CODE
    // ============================================================

    const currentCode =
        question
            ? languageDrafts[
                  String(
                      question.id
                  )
              ]?.[language] ??
              answers[
                  question.id
              ] ??
              STARTER_CODE[
                  language
              ]
            : "";

    // ============================================================
    // CODE CHANGE
    // ============================================================

    const handleCodeChange = (
        questionId,
        code
    ) => {

        const key =
            String(
                questionId
            );

        setLanguageDrafts(
            previous => ({

                ...previous,

                [key]: {

                    ...(
                        previous[
                            key
                        ] ||
                        {}
                    ),

                    [language]:
                        code
                }
            })
        );

        setAnswers(
            previous => ({

                ...previous,

                [questionId]:
                    code
            })
        );

        /*
         * Old run result is no longer valid
         * after code changes.
         */
        setRunResults(
            previous => {

                const next = {
                    ...previous
                };

                delete next[
                    questionId
                ];

                return next;
            }
        );
    };

    // ============================================================
    // CHANGE LANGUAGE
    // ============================================================

    const handleLanguageChange = (
        event
    ) => {

        const selectedLanguage =
            event.target.value;

        setLanguage(
            selectedLanguage
        );

        /*
         * Prepare starter code for any question that
         * has not yet been opened in this language.
         */
        setLanguageDrafts(
            previous => {

                const next = {
                    ...previous
                };

                questions.forEach(
                    item => {

                        const key =
                            String(
                                item.id
                            );

                        const existing = {
                            ...(
                                next[
                                    key
                                ] ||
                                {}
                            )
                        };

                        if (
                            existing[
                                selectedLanguage
                            ] === undefined
                        ) {

                            existing[
                                selectedLanguage
                            ] =
                                STARTER_CODE[
                                    selectedLanguage
                                ];
                        }

                        next[
                            key
                        ] =
                            existing;
                    }
                );

                return next;
            }
        );

        /*
         * Current-language answer map.
         */
        const newAnswers = {};

        questions.forEach(
            item => {

                const key =
                    String(
                        item.id
                    );

                newAnswers[
                    item.id
                ] =
                    languageDrafts[
                        key
                    ]?.[
                        selectedLanguage
                    ] ??
                    STARTER_CODE[
                        selectedLanguage
                    ];
            }
        );

        setAnswers(
            newAnswers
        );

        /*
         * Clear old execution results because they
         * belong to another language.
         */
        setRunResults({});
        setError("");
    };

    // ============================================================
    // RUN CODE
    // ============================================================

    const runCode =
        async () => {

            if (
                !question ||
                running ||
                submitting
            ) {
                return;
            }

            const problemId =
                question.problemId;

            if (!problemId) {

                setError(
                    "Problem ID is missing for this certification question."
                );

                return;
            }

            try {

                setRunning(true);
                setError("");

                setRunResults(
                    previous => ({

                        ...previous,

                        [question.id]:
                            null
                    })
                );

                const response =
                    await fetch(
                        CODE_RUN_URL,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    problemId:
                                        problemId,

                                    language:
                                        RUN_LANGUAGE[
                                            language
                                        ],

                                    code:
                                        currentCode
                                })
                        }
                    );

                const text =
                    await response.text();

                let data = {};

                try {

                    data =
                        text
                            ? JSON.parse(
                                  text
                              )
                            : {};

                } catch {

                    data = {
                        message:
                            text
                    };
                }

                if (
                    !response.ok
                ) {

                    throw new Error(
                        data?.message ||
                        data?.error ||
                        text ||
                        "Code execution failed."
                    );
                }

                setRunResults(
                    previous => ({

                        ...previous,

                        [question.id]: {
                            ...data,
                            language
                        }
                    })
                );

            } catch (err) {

                console.error(
                    "Run code error:",
                    err
                );

                setError(
                    err.message ||
                    "Code execution failed."
                );

            } finally {

                setRunning(
                    false
                );
            }
        };

    // ============================================================
    // NAVIGATE QUESTION
    // ============================================================

    const goToQuestion = (
        index
    ) => {

        if (
            index >= 0 &&
            index <
                questions.length
        ) {

            setCurrentQuestion(
                index
            );

            setError("");
        }
    };

    // ============================================================
    // SUBMIT CONFIRMATION
    // ============================================================

    const handleSubmitClick =
        () => {

            if (
                submitting
            ) {
                return;
            }

            setConfirmSubmit(
                true
            );
        };

    // ============================================================
    // CHECK WHETHER USER ACTUALLY CHANGED STARTER CODE
    // ============================================================

    const hasRealAnswer = (
        item
    ) => {

        const code =
            languageDrafts[
                String(
                    item.id
                )
            ]?.[language];

        if (
            typeof code !==
            "string"
        ) {
            return false;
        }

        const normalizedCode =
            code.trim();

        const normalizedStarter =
            (
                STARTER_CODE[
                    language
                ] ||
                ""
            ).trim();

        return (
            normalizedCode
                .length > 0 &&
            normalizedCode !==
                normalizedStarter
        );
    };

    // ============================================================
    // ANSWERED QUESTIONS
    // ============================================================

    const answeredCount =
        questions.filter(
            item =>
                hasRealAnswer(
                    item
                )
        ).length;

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (
            <div className="certification-exam-page">

                <div className="exam-loading">

                    <div className="exam-spinner"></div>

                    <p>
                        Loading certification...
                    </p>

                </div>

            </div>
        );
    }

    // ============================================================
    // ERROR
    // ============================================================

    if (
        error &&
        questions.length === 0
    ) {

        return (
            <div className="certification-exam-page">

                <div className="exam-error">

                    <div className="exam-error-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to Load Exam
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                "/user/certifications"
                            )
                        }
                    >
                        Back to Certifications
                    </button>

                </div>

            </div>
        );
    }

    // ============================================================
    // NO QUESTIONS
    // ============================================================

    if (!question) {

        return (
            <div className="certification-exam-page">

                <div className="exam-error">

                    <h2>
                        No Questions Available
                    </h2>

                    <p>
                        This certification does not
                        have any coding questions.
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                "/user/certifications"
                            )
                        }
                    >
                        Back to Certifications
                    </button>

                </div>

            </div>
        );
    }

    // ============================================================
    // CURRENT RUN RESULT
    // ============================================================

    const currentRunResult =
        runResults[
            question.id
        ];

    // ============================================================
    // TIMER WARNING
    // ============================================================

    const isTimerWarning =
        timeLeft !== null &&
        timeLeft <= 300;

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="certification-exam-page">

            {/* ====================================================
                NAVBAR
            ==================================================== */}

            <nav className="exam-navbar">

                <div className="exam-logo">

                    <span className="exam-logo-icon">
                        ⚡
                    </span>

                    <span>
                        CodeSprint
                    </span>

                </div>

                <div className="exam-title">
                    {certification?.title}
                </div>

                <div
                    className={
                        `exam-timer ${
                            isTimerWarning
                                ? "timer-warning"
                                : ""
                        }`
                    }
                >

                    <span>
                        ⏱️
                    </span>

                    <strong>
                        {formattedTime}
                    </strong>

                </div>

            </nav>

            {/* ====================================================
                MAIN
            ==================================================== */}

            <main className="exam-main">

                {error && (

                    <div className="exam-inline-error">

                        <span>
                            ⚠️
                        </span>

                        <span>
                            {error}
                        </span>

                    </div>
                )}

                {/* =================================================
                    QUESTION
                ================================================= */}

                <section className="question-section">

                    <div className="question-header">

                        <div>

                            <span className="question-label">
                                Coding Question
                            </span>

                            <h1>

                                {currentQuestion + 1}

                                <span>
                                    {" / "}
                                    {questions.length}
                                </span>

                            </h1>

                        </div>

                        <div className="answered-count">

                            {answeredCount}
                            {" / "}
                            {questions.length}
                            {" solved"}

                        </div>

                    </div>

                    <div className="question-card">

                        <div className="question-top-row">

                            <div className="question-number">

                                Question{" "}
                                {currentQuestion + 1}

                            </div>

                            <div className="question-weight">

                                {question.percentageWeight}%

                            </div>

                        </div>

                        <h2 className="problem-title">

                            {question.problemTitle ||
                                question.question}

                        </h2>

                        <div className="problem-description">

                            <h3>
                                Problem
                            </h3>

                            <p>
                                {question.description ||
                                    "No problem description available."}
                            </p>

                        </div>

                        {question.inputFormat && (

                            <div className="problem-information">

                                <h3>
                                    Input Format
                                </h3>

                                <p>
                                    {question.inputFormat}
                                </p>

                            </div>
                        )}

                        {question.outputFormat && (

                            <div className="problem-information">

                                <h3>
                                    Output Format
                                </h3>

                                <p>
                                    {question.outputFormat}
                                </p>

                            </div>
                        )}

                        {question.constraints && (

                            <div className="problem-information">

                                <h3>
                                    Constraints
                                </h3>

                                <p>
                                    {question.constraints}
                                </p>

                            </div>
                        )}

                        {/* =========================================
                            LANGUAGE
                        ========================================= */}

                        <div className="coding-toolbar">

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
                                    disabled={
                                        submitting ||
                                        running
                                    }
                                >

                                    <option value="java">
                                        Java
                                    </option>

                                    <option value="python">
                                        Python
                                    </option>

                                    <option value="cpp">
                                        C++
                                    </option>

                                    <option value="c">
                                        C
                                    </option>

                                    <option value="javascript">
                                        JavaScript
                                    </option>

                                </select>

                            </div>

                            <div className="question-language-info">

                                All questions will be
                                evaluated using this
                                language.

                            </div>

                        </div>

                        {/* =========================================
                            CODE EDITOR
                        ========================================= */}

                        <div className="code-editor-container">

                            <div className="code-editor-header">

                                <div className="code-editor-title">

                                    <span>
                                        💻
                                    </span>

                                    <span>
                                        Your Solution
                                    </span>

                                </div>

                                <span className="code-editor-language">

                                    {
                                        LANGUAGE_LABELS[
                                            language
                                        ]
                                    }

                                </span>

                            </div>

                            <textarea
                                className="code-editor"
                                value={
                                    currentCode
                                }
                                onChange={
                                    event =>
                                        handleCodeChange(
                                            question.id,
                                            event.target.value
                                        )
                                }
                                spellCheck="false"
                                disabled={
                                    submitting
                                }
                            />

                        </div>

                        {/* =========================================
                            RUN CODE ACTION
                        ========================================= */}

                        <div className="certification-code-actions">

                            <button
                                type="button"
                                className="run-code-button"
                                onClick={
                                    runCode
                                }
                                disabled={
                                    running ||
                                    submitting
                                }
                            >

                                {running
                                    ? "Running..."
                                    : "▶ Run Code"}

                            </button>

                        </div>

                        {/* =========================================
                            TERMINAL
                        ========================================= */}

                        <div className="certification-terminal">

                            <div className="certification-terminal-header">

                                <span>
                                    Terminal
                                </span>

                                {currentRunResult?.status && (

                                    <strong>
                                        {
                                            currentRunResult.status
                                        }
                                    </strong>
                                )}

                            </div>

                            <div className="certification-terminal-body">

                                {running ? (

                                    <div className="terminal-running">

                                        Running your code...

                                    </div>

                                ) : currentRunResult ? (

                                    <>

                                        {currentRunResult.message && (

                                            <div className="terminal-message">

                                                {
                                                    currentRunResult.message
                                                }

                                            </div>
                                        )}

                                        {currentRunResult.output !==
                                            undefined &&
                                            currentRunResult.output !==
                                                null &&
                                            String(
                                                currentRunResult.output
                                            ).length > 0 && (

                                            <div className="terminal-section">

                                                <span className="terminal-label">
                                                    Output
                                                </span>

                                                <pre>
                                                    {
                                                        String(
                                                            currentRunResult.output
                                                        )
                                                    }
                                                </pre>

                                            </div>
                                        )}

                                        {currentRunResult.error && (

                                            <div className="terminal-section">

                                                <span className="terminal-label">
                                                    Error
                                                </span>

                                                <pre>
                                                    {
                                                        String(
                                                            currentRunResult.error
                                                        )
                                                    }
                                                </pre>

                                            </div>
                                        )}

                                        {currentRunResult.totalTestCases !==
                                            undefined && (

                                            <div className="terminal-test-summary">

                                                <strong>

                                                    {
                                                        Number(
                                                            currentRunResult.passedTestCases ||
                                                                0
                                                        )
                                                    }

                                                    {" / "}

                                                    {
                                                        Number(
                                                            currentRunResult.totalTestCases ||
                                                                0
                                                        )
                                                    }

                                                    {" Test Cases Passed"}

                                                </strong>

                                            </div>
                                        )}

                                        {!currentRunResult.message &&
                                            !currentRunResult.output &&
                                            !currentRunResult.error &&
                                            currentRunResult.totalTestCases ===
                                                undefined && (

                                            <div className="terminal-empty">

                                                Code execution completed.

                                            </div>
                                        )}

                                    </>

                                ) : (

                                    <div className="terminal-empty">

                                        Run your code to see
                                        the output here.

                                    </div>
                                )}

                            </div>

                        </div>

                        {/* =========================================
                            QUESTION WEIGHT
                        ========================================= */}

                        <div className="question-scoring-info">

                            <span>
                                Question Weight
                            </span>

                            <strong>
                                {question.percentageWeight}%
                            </strong>

                        </div>

                    </div>

                    {/* =============================================
                        NAVIGATION
                    ============================================= */}

                    <div className="question-navigation">

                        <button
                            type="button"
                            className="previous-button"
                            onClick={() =>
                                goToQuestion(
                                    currentQuestion -
                                        1
                                )
                            }
                            disabled={
                                currentQuestion ===
                                    0 ||
                                submitting ||
                                running
                            }
                        >
                            ← Previous
                        </button>

                        {currentQuestion <
                        questions.length -
                            1 ? (

                            <button
                                type="button"
                                className="next-button"
                                onClick={() =>
                                    goToQuestion(
                                        currentQuestion +
                                            1
                                    )
                                }
                                disabled={
                                    submitting ||
                                    running
                                }
                            >
                                Next →
                            </button>

                        ) : (

                            <button
                                type="button"
                                className="submit-button"
                                onClick={
                                    handleSubmitClick
                                }
                                disabled={
                                    submitting ||
                                    running
                                }
                            >
                                Submit Certification
                            </button>
                        )}

                    </div>

                </section>

                {/* =================================================
                    SIDEBAR
                ================================================= */}

                <aside className="exam-sidebar">

                    <div className="sidebar-card">

                        <h3>
                            Questions
                        </h3>

                        <p className="sidebar-progress">

                            {answeredCount}
                            {" of "}
                            {questions.length}
                            {" solved"}

                        </p>

                        <div className="question-palette">

                            {questions.map(
                                (
                                    item,
                                    index
                                ) => {

                                    const answered =
                                        hasRealAnswer(
                                            item
                                        );

                                    const current =
                                        currentQuestion ===
                                        index;

                                    return (

                                        <button
                                            type="button"
                                            key={
                                                item.id
                                            }
                                            className={`
                                                palette-button
                                                ${
                                                    answered
                                                        ? "answered"
                                                        : ""
                                                }
                                                ${
                                                    current
                                                        ? "current"
                                                        : ""
                                                }
                                            `}
                                            onClick={() =>
                                                goToQuestion(
                                                    index
                                                )
                                            }
                                            disabled={
                                                submitting ||
                                                running
                                            }
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                }
                            )}

                        </div>

                        <div className="palette-legend">

                            <div>

                                <span className="legend-box current"></span>

                                Current

                            </div>

                            <div>

                                <span className="legend-box answered"></span>

                                Code Written

                            </div>

                            <div>

                                <span className="legend-box unanswered"></span>

                                Not Attempted

                            </div>

                        </div>

                    </div>

                    <div className="sidebar-info-card">

                        <h3>
                            Certification
                        </h3>

                        <div className="sidebar-info-row">

                            <span>
                                Coding Questions
                            </span>

                            <strong>
                                {questions.length}
                            </strong>

                        </div>

                        <div className="sidebar-info-row">

                            <span>
                                Passing
                            </span>

                            <strong>
                                {certification?.passingPercentage}%
                            </strong>

                        </div>

                        <div className="sidebar-info-row">

                            <span>
                                Duration
                            </span>

                            <strong>
                                {certification?.durationMinutes} min
                            </strong>

                        </div>

                    </div>

                    <div className="sidebar-warning">

                        <span>
                            ⚠️
                        </span>

                        <p>
                            Your certification will be
                            submitted automatically when
                            the timer reaches zero.
                        </p>

                    </div>

                </aside>

            </main>

            {/* ====================================================
                SUBMIT CONFIRMATION
            ==================================================== */}

            {confirmSubmit && (

                <div className="confirmation-overlay">

                    <div className="confirmation-modal">

                        <div className="confirmation-icon">
                            📝
                        </div>

                        <h2>
                            Submit Certification?
                        </h2>

                        <p>

                            You have written code for{" "}

                            <strong>
                                {answeredCount}
                            </strong>

                            {" "}out of{" "}

                            <strong>
                                {questions.length}
                            </strong>

                            {" "}questions.

                        </p>

                        {answeredCount <
                            questions.length && (

                            <div className="unanswered-warning">

                                ⚠️ You still have questions
                                without a solution.

                            </div>
                        )}

                        <div className="confirmation-actions">

                            <button
                                type="button"
                                className="cancel-submit-button"
                                onClick={() =>
                                    setConfirmSubmit(
                                        false
                                    )
                                }
                                disabled={
                                    submitting
                                }
                            >
                                Continue Exam
                            </button>

                            <button
                                type="button"
                                className="confirm-submit-button"
                                onClick={() =>
                                    handleSubmit(
                                        false
                                    )
                                }
                                disabled={
                                    submitting
                                }
                            >
                                Submit Now
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {/* ====================================================
                SUBMITTING
            ==================================================== */}

            {submitting && (

                <div className="submitting-overlay">

                    <div className="submitting-box">

                        <div className="exam-spinner"></div>

                        <h3>
                            Evaluating Certification...
                        </h3>

                        <p>
                            Your code is being tested
                            against the certification
                            test cases.
                        </p>

                        <p>
                            Please do not close this page.
                        </p>

                    </div>

                </div>
            )}

        </div>
    );
}

export default CertificationExam;