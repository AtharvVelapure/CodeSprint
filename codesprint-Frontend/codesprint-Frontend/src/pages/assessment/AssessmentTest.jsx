import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    useLocation,
    useNavigate,
    useParams
} from "react-router-dom";

import "./AssessmentTest.css";

const API_BASE = "";

const defaultCode = {
    Java:
`public class Main {
    public static void main(String[] args) {

    }
}`,
    "C++":
`#include <iostream>
using namespace std;

int main() {

    return 0;
}`,
    C:
`#include <stdio.h>

int main() {

    return 0;
}`,
    Python:
`def main():
    pass

if __name__ == "__main__":
    main()`,
    JavaScript:
`function main() {

}

main();`
};

function AssessmentTest() {

    const { invitationToken } = useParams();

    const location = useLocation();
    const navigate = useNavigate();

    const state = location.state || {};

    // =====================================================
    // BASIC DATA
    // =====================================================

    const [assessment, setAssessment] = useState(
        state.assessment || null
    );

    const [session, setSession] = useState(
        state.session || null
    );

    const [candidateName, setCandidateName] = useState(
        state.candidateName || ""
    );

    const [candidateEmail, setCandidateEmail] = useState(
        state.candidateEmail || ""
    );

    // =====================================================
    // QUESTIONS
    // =====================================================

    const [problems, setProblems] = useState([]);

    const [currentIndex, setCurrentIndex] = useState(0);

    const currentProblem =
        problems[currentIndex] || null;

    const totalQuestions =
        problems.length;

    // =====================================================
    // CODE
    // =====================================================

    const [language, setLanguage] =
        useState("Java");

    const [code, setCode] =
        useState(defaultCode.Java);

    const [draftAnswers, setDraftAnswers] =
        useState({});

    const [savedQuestions, setSavedQuestions] =
        useState({});

    const [questionResults, setQuestionResults] =
        useState({});

    const [codeResult, setCodeResult] =
        useState(null);

    // =====================================================
    // UI STATE
    // =====================================================

    const [loading, setLoading] =
        useState(true);

    // Backend-confirmed gate for the active assessment workspace.
    // Security devices/listeners must never start before this becomes true.
    const [attemptReady, setAttemptReady] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [running, setRunning] =
        useState(false);

    const [submittingCode, setSubmittingCode] =
        useState(false);

    const [
        submittingAssessment,
        setSubmittingAssessment
    ] = useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    const [finalResult, setFinalResult] =
        useState(null);

    const [submissionTime, setSubmissionTime] =
        useState(null);

    // Feedback shown after the assessment is finalized.
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
    const [feedbackError, setFeedbackError] = useState("");
    const [feedback, setFeedback] = useState({
        overallRating: 0,
        questionQualityRating: 0,
        platformRating: 0,
        difficulty: "MEDIUM",
        technicalIssue: false,
        comments: ""
    });

    // =====================================================
    // TIMER
    // =====================================================

    const [timeLeft, setTimeLeft] =
        useState(null);

    // =====================================================
    // SECURITY
    // =====================================================

    const [warningCount, setWarningCount] =
        useState(
            Number(state.session?.warningCount || 0)
        );

    const [isFullscreen, setIsFullscreen] =
        useState(
            Boolean(document.fullscreenElement)
        );

    const [showFullscreenWarning, setShowFullscreenWarning] =
        useState(false);

    const [returningToFullscreen, setReturningToFullscreen] =
        useState(false);

    const [cameraActive, setCameraActive] =
        useState(false);

    const [microphoneActive, setMicrophoneActive] =
        useState(false);

    const mediaStreamRef = useRef(null);

    const finishingRef = useRef(false);

    const autoSubmittingRef = useRef(false);

    const securityReadyRef = useRef(false);

    const finalSubmitRef = useRef(null);

    const [securityWarningLimit, setSecurityWarningLimit] =
        useState(
            Number(
                state.session?.warningLimit ||
                state.assessment?.warningLimit ||
                3
            )
        );

    const warningLimit =
        securityWarningLimit;

    // =====================================================
    // TIMER FORMAT
    // =====================================================

    const formattedTime = useMemo(() => {

        if (timeLeft === null) {
            return "--:--";
        }

        const hours =
            Math.floor(timeLeft / 3600);

        const minutes =
            Math.floor(
                (timeLeft % 3600) / 60
            );

        const seconds =
            timeLeft % 60;

        if (hours > 0) {

            return (
                `${String(hours).padStart(2, "0")}:` +
                `${String(minutes).padStart(2, "0")}:` +
                `${String(seconds).padStart(2, "0")}`
            );
        }

        return (
            `${String(minutes).padStart(2, "0")}:` +
            `${String(seconds).padStart(2, "0")}`
        );

    }, [timeLeft]);

    // =====================================================
    // STOP CAMERA / MICROPHONE
    // =====================================================

    const stopMediaDevices = useCallback(() => {

        const stream =
            mediaStreamRef.current;

        if (stream) {

            stream
                .getTracks()
                .forEach((track) => {

                    try {
                        track.stop();
                    } catch {
                        // Ignore cleanup errors
                    }
                });

            mediaStreamRef.current = null;
        }

        setCameraActive(false);
        setMicrophoneActive(false);

    }, []);

    // =====================================================
    // REPORT SECURITY EVENT TO BACKEND
    // =====================================================

    const reportSecurityEvent =
        useCallback(
            async (
                eventType,
                details
            ) => {

                if (
                    !invitationToken ||
                    !attemptReady ||
                    finishingRef.current ||
                    finalResult
                ) {
                    return null;
                }

                try {

                    const response = await fetch(
                        `${API_BASE}/api/assessment/security/event`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                invitationToken,
                                eventType,
                                details
                            })
                        }
                    );

                    const text =
                        await response.text();

                    let data = {};

                    try {

                        data = text
                            ? JSON.parse(text)
                            : {};

                    } catch {

                        data = {
                            message: text
                        };
                    }

                    if (!response.ok) {

                        throw new Error(
                            data?.message ||
                            text ||
                            "Unable to record assessment security event."
                        );
                    }

                    if (
                        Number.isFinite(
                            Number(data.warningCount)
                        )
                    ) {

                        setWarningCount(
                            Number(data.warningCount)
                        );
                    }

                    if (
                        Number.isFinite(
                            Number(data.warningLimit)
                        ) &&
                        Number(data.warningLimit) > 0
                    ) {

                        setSecurityWarningLimit(
                            Number(data.warningLimit)
                        );
                    }

                    if (data.message) {
                        setMessage(data.message);
                    }

                    if (data.autoSubmitted) {

                        finishingRef.current = true;
                        autoSubmittingRef.current = true;

                        setSubmissionTime(
                            new Date()
                        );

                        /*
                         * The backend has already finalized the assessment.
                         * Do not call submit-assessment again from React.
                         */
                        setFinalResult({
                            securityAutoSubmitted: true,
                            attemptedQuestions:
                                new Set([
                                    ...Object.keys(
                                        savedQuestions
                                    ),
                                    ...Object.keys(
                                        questionResults
                                    )
                                ]).size,
                            totalQuestions:
                                problems.length,
                            message:
                                data.message ||
                                "Assessment submitted automatically."
                        });

                        setShowFeedback(false);
                        stopMediaDevices();

                        if (
                            document.fullscreenElement
                        ) {

                            try {

                                await document
                                    .exitFullscreen();

                            } catch (fullscreenError) {

                                console.log(
                                    "Unable to exit fullscreen:",
                                    fullscreenError
                                );
                            }
                        }
                    }

                    return data;

                } catch (err) {

                    console.error(
                        "Assessment security event error:",
                        err
                    );

                    /*
                     * A frontend/network failure must never create a local
                     * warning count. The server remains authoritative.
                     */
                    setError(
                        err.message ||
                        "Unable to record assessment security event."
                    );

                    return null;
                }
            },
            [
                invitationToken,
                attemptReady,
                finalResult,
                savedQuestions,
                questionResults,
                problems.length,
                stopMediaDevices
            ]
        );

    // =====================================================
    // LOAD ASSESSMENT
    // =====================================================

    useEffect(() => {

        if (assessment) {
            return;
        }

        const loadAssessment = async () => {

            try {

                setError("");

                const response = await fetch(
                    `${API_BASE}/api/assessment-candidates/${invitationToken}`
                );

                const text =
                    await response.text();

                if (!response.ok) {

                    throw new Error(
                        text ||
                        "Unable to load assessment."
                    );
                }

                const data =
                    JSON.parse(text);

                const assessmentData =
                    data.assessment || data;

                setAssessment(
                    assessmentData
                );

                if (
                    Number(
                        assessmentData.warningLimit
                    ) > 0
                ) {

                    setSecurityWarningLimit(
                        Number(
                            assessmentData.warningLimit
                        )
                    );
                }

                if (data.candidateName) {

                    setCandidateName(
                        data.candidateName
                    );
                }

                if (data.candidateEmail) {

                    setCandidateEmail(
                        data.candidateEmail
                    );
                }

            } catch (err) {

                setError(
                    err.message ||
                    "Unable to load assessment."
                );
            }
        };

        if (invitationToken) {
            loadAssessment();
        }

    }, [
        invitationToken,
        assessment
    ]);

    // =====================================================
    // RESUME SESSION AFTER REFRESH
    // =====================================================

    useEffect(() => {

        if (
            session ||
            !assessment ||
            !candidateName.trim() ||
            !invitationToken
        ) {
            return;
        }

        const resumeSession = async () => {

            try {

                const response = await fetch(
                    `${API_BASE}/api/assessment-candidate-sessions/${invitationToken}/start`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            candidateName:
                                candidateName.trim(),

                            candidateEmail:
                                candidateEmail.trim()
                        })
                    }
                );

                const text =
                    await response.text();

                if (!response.ok) {

                    throw new Error(
                        text ||
                        "Unable to resume assessment session."
                    );
                }

                const sessionData =
                    JSON.parse(text);

                setSession(sessionData);

                setWarningCount(
                    Number(
                        sessionData.warningCount || 0
                    )
                );

                if (
                    Number(
                        sessionData.warningLimit
                    ) > 0
                ) {

                    setSecurityWarningLimit(
                        Number(
                            sessionData.warningLimit
                        )
                    );
                }

            } catch (err) {

                setError(
                    err.message ||
                    "Unable to resume assessment session."
                );
            }
        };

        resumeSession();

    }, [
        session,
        assessment,
        candidateName,
        candidateEmail,
        invitationToken
    ]);

    // =====================================================
    // LOAD PROBLEMS
    // =====================================================

    useEffect(() => {

        const loadProblems = async () => {

            try {

                setLoading(true);
                setError("");
                setAttemptReady(false);
                securityReadyRef.current = false;
                stopMediaDevices();

                const response = await fetch(
                    `${API_BASE}/api/assessment-candidates/${invitationToken}/problems`
                );

                const text =
                    await response.text();

                if (!response.ok) {

                    throw new Error(
                        text ||
                        "Unable to load assessment problems."
                    );
                }

                const data =
                    JSON.parse(text);

                setProblems(
                    Array.isArray(data)
                        ? data
                        : []
                );

                // The protected problems endpoint succeeded, so the backend
                // has confirmed that this attempt is currently accessible.
                setAttemptReady(true);

            } catch (err) {

                setAttemptReady(false);
                securityReadyRef.current = false;
                stopMediaDevices();
                setProblems([]);

                setError(
                    err.message ||
                    "Unable to load assessment problems."
                );

            } finally {

                setLoading(false);
            }
        };

        if (invitationToken) {
            loadProblems();
        }

    }, [invitationToken, stopMediaDevices]);

    // =====================================================
    // LOAD QUESTION CODE
    // =====================================================

    useEffect(() => {

        if (!currentProblem) {
            return;
        }

        const id =
            currentProblem.assignmentProblemId;

        const draft =
            draftAnswers[id];

        const submitted =
            questionResults[id];

        if (draft) {

            const selectedLanguage =
                draft.language || "Java";

            setLanguage(
                selectedLanguage
            );

            setCode(
                draft.code ||
                defaultCode[selectedLanguage] ||
                ""
            );

            return;
        }

        if (submitted?.code) {

            setLanguage(
                submitted.language || "Java"
            );

            setCode(
                submitted.code
            );

            return;
        }

        setLanguage("Java");
        setCode(defaultCode.Java);

    }, [
        currentProblem?.assignmentProblemId
    ]);

    // =====================================================
    // STORE DRAFT
    // =====================================================

    useEffect(() => {

        if (!currentProblem) {
            return;
        }

        const id =
            currentProblem.assignmentProblemId;

        setDraftAnswers(
            (previous) => ({
                ...previous,

                [id]: {
                    language,
                    code
                }
            })
        );

    }, [
        code,
        language,
        currentProblem?.assignmentProblemId
    ]);

    // =====================================================
    // CAMERA / MICROPHONE
    // =====================================================

    useEffect(() => {

        if (
            !attemptReady ||
            !assessment ||
            !session ||
            finalResult
        ) {
            securityReadyRef.current = false;
            stopMediaDevices();
            return;
        }

        if (
            !assessment.cameraRequired &&
            !assessment.microphoneRequired
        ) {

            securityReadyRef.current = true;

            return;
        }

        let cancelled = false;

        const startMediaDevices = async () => {

            try {

                const stream =
                    await navigator.mediaDevices.getUserMedia({
                        video:
                            Boolean(
                                assessment.cameraRequired
                            ),

                        audio:
                            Boolean(
                                assessment.microphoneRequired
                            )
                    });

                if (cancelled) {

                    stream
                        .getTracks()
                        .forEach(
                            (track) =>
                                track.stop()
                        );

                    return;
                }

                mediaStreamRef.current =
                    stream;

                const videoTracks =
                    stream.getVideoTracks();

                const audioTracks =
                    stream.getAudioTracks();

                setCameraActive(
                    !assessment.cameraRequired ||
                    videoTracks.some(
                        (track) =>
                            track.readyState === "live"
                    )
                );

                setMicrophoneActive(
                    !assessment.microphoneRequired ||
                    audioTracks.some(
                        (track) =>
                            track.readyState === "live"
                    )
                );

                videoTracks.forEach(
                    (track) => {

                        track.onended = () => {

                            if (
                                !finishingRef.current
                            ) {

                                setCameraActive(false);

                                void reportSecurityEvent(
                                    "CAMERA_INACTIVE",
                                    "Camera access was interrupted during the assessment."
                                );
                            }
                        };
                    }
                );

                audioTracks.forEach(
                    (track) => {

                        track.onended = () => {

                            if (
                                !finishingRef.current
                            ) {

                                setMicrophoneActive(false);

                                void reportSecurityEvent(
                                    "MICROPHONE_INACTIVE",
                                    "Microphone access was interrupted during the assessment."
                                );
                            }
                        };
                    }
                );

                securityReadyRef.current =
                    true;

            } catch (err) {

                console.error(
                    "Media error:",
                    err
                );

                if (assessment.cameraRequired) {
                    setCameraActive(false);
                }

                if (assessment.microphoneRequired) {
                    setMicrophoneActive(false);
                }

                setError(
                    "Camera or microphone access is required for this assessment."
                );

                if (assessment.cameraRequired) {

                    void reportSecurityEvent(
                        "CAMERA_INACTIVE",
                        "Required camera access could not be started."
                    );
                }

                if (assessment.microphoneRequired) {

                    void reportSecurityEvent(
                        "MICROPHONE_INACTIVE",
                        "Required microphone access could not be started."
                    );
                }

                securityReadyRef.current =
                    true;
            }
        };

        startMediaDevices();

        return () => {
            cancelled = true;
            securityReadyRef.current = false;
            stopMediaDevices();
        };

    }, [
        attemptReady,
        assessment,
        session,
        finalResult,
        reportSecurityEvent,
        stopMediaDevices
    ]);

    // =====================================================
    // UNMOUNT MEDIA CLEANUP
    // =====================================================

    useEffect(() => {

        return () => {

            const stream =
                mediaStreamRef.current;

            if (stream) {

                stream
                    .getTracks()
                    .forEach((track) => {

                        try {
                            track.stop();
                        } catch {
                            // Ignore
                        }
                    });
            }
        };

    }, []);

    // =====================================================
    // TIMER
    // =====================================================

    useEffect(() => {

        if (
            !session?.expiresAt ||
            finalResult
        ) {
            return;
        }

        const calculateTime = () => {

            const expiry =
                new Date(
                    session.expiresAt
                ).getTime();

            const remaining =
                Math.max(
                    0,
                    Math.floor(
                        (expiry - Date.now()) /
                        1000
                    )
                );

            setTimeLeft(
                remaining
            );

            return remaining;
        };

        const initial =
            calculateTime();

        if (
            initial <= 0 &&
            finalSubmitRef.current
        ) {

            finalSubmitRef.current(true);

            return;
        }

        const interval =
            setInterval(() => {

                const remaining =
                    calculateTime();

                if (remaining <= 0) {

                    clearInterval(interval);

                    if (
                        finalSubmitRef.current
                    ) {

                        finalSubmitRef.current(
                            true
                        );
                    }
                }

            }, 1000);

        return () =>
            clearInterval(interval);

    }, [
        session?.expiresAt,
        finalResult
    ]);

    // =====================================================
    // FULLSCREEN MONITOR
    // =====================================================

    useEffect(() => {

        const handleFullscreenChange =
            () => {

                const active =
                    Boolean(
                        document.fullscreenElement
                    );

                setIsFullscreen(
                    active
                );

                if (
                    attemptReady &&
                    assessment?.fullscreenRequired &&
                    !active &&
                    !finalResult &&
                    !finishingRef.current &&
                    securityReadyRef.current
                ) {

                    setShowFullscreenWarning(true);

                    void reportSecurityEvent(
                        "FULLSCREEN_EXIT",
                        "Candidate exited fullscreen mode."
                    );
                }
            };

        document.addEventListener(
            "fullscreenchange",
            handleFullscreenChange
        );

        return () => {

            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
        };

    }, [
        attemptReady,
        assessment,
        finalResult,
        reportSecurityEvent
    ]);

    // =====================================================
    // TAB SWITCH MONITOR
    // =====================================================

    useEffect(() => {

        const handleVisibilityChange =
            () => {

                if (
                    attemptReady &&
                    document.hidden &&
                    !finalResult &&
                    !finishingRef.current
                ) {

                    void reportSecurityEvent(
                        "TAB_SWITCH",
                        "Candidate switched away from the assessment window."
                    );
                }
            };

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        return () => {

            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };

    }, [
        attemptReady,
        finalResult,
        reportSecurityEvent
    ]);

    // =====================================================
    // REQUEST FULLSCREEN
    // =====================================================

    const requestFullscreen = async () => {

        try {

            setError("");

            if (!document.fullscreenElement) {

                await document.documentElement
                    .requestFullscreen();
            }

            setIsFullscreen(true);

        } catch (err) {

            console.error(
                "Fullscreen request failed:",
                err
            );

            setError(
                "Unable to enter fullscreen mode."
            );
        }
    };

    // =====================================================
    // RETURN TO FULLSCREEN AFTER WARNING
    // =====================================================

    const handleReturnToFullscreen = async () => {

        if (
            finishingRef.current ||
            finalResult
        ) {
            return;
        }

        try {

            setReturningToFullscreen(true);
            setError("");

            if (!document.fullscreenElement) {

                await document.documentElement
                    .requestFullscreen();
            }

            setIsFullscreen(true);
            setShowFullscreenWarning(false);

        } catch (err) {

            console.error(
                "Unable to restore fullscreen:",
                err
            );

            setError(
                "Fullscreen is required. Please click Return to Fullscreen again."
            );

        } finally {

            setReturningToFullscreen(false);
        }
    };

    // =====================================================
    // SAVE ANSWER
    // =====================================================

    const saveAnswer = async () => {

        if (
            !currentProblem ||
            !session
        ) {
            return false;
        }

        try {

            setSaving(true);
            setError("");

            const response = await fetch(
                `${API_BASE}/api/assessment-candidates/${invitationToken}/save-answer`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        assignmentProblemId:
                            currentProblem.assignmentProblemId,

                        language,
                        code
                    })
                }
            );

            const text =
                await response.text();

            if (!response.ok) {

                throw new Error(
                    text ||
                    "Unable to save answer."
                );
            }

            setSavedQuestions(
                (previous) => ({
                    ...previous,

                    [currentProblem.assignmentProblemId]:
                        true
                })
            );

            setDraftAnswers(
                (previous) => ({
                    ...previous,

                    [currentProblem.assignmentProblemId]:
                    {
                        language,
                        code
                    }
                })
            );

            setMessage(
                "Answer saved."
            );

            return true;

        } catch (err) {

            setError(
                err.message ||
                "Unable to save answer."
            );

            return false;

        } finally {

            setSaving(false);
        }
    };

    // =====================================================
    // CHANGE QUESTION
    // =====================================================

    const changeQuestion = async (
        index
    ) => {

        if (index === currentIndex) {
            return;
        }

        const saved =
            await saveAnswer();

        if (!saved && session) {
            return;
        }

        setCurrentIndex(index);

        setCodeResult(null);
        setMessage("");
        setError("");
    };

    // =====================================================
    // LANGUAGE CHANGE
    // =====================================================

    const handleLanguageChange = (
        event
    ) => {

        const newLanguage =
            event.target.value;

        setLanguage(
            newLanguage
        );

        const id =
            currentProblem?.assignmentProblemId;

        const existing =
            id
                ? draftAnswers[id]
                : null;

        if (
            existing &&
            existing.language === newLanguage
        ) {

            setCode(
                existing.code
            );

        } else {

            setCode(
                defaultCode[newLanguage] || ""
            );
        }

        setCodeResult(null);
    };

    // =====================================================
    // RUN CODE
    // =====================================================

    const runCode = async () => {

        if (!currentProblem) {
            return;
        }

        try {

            setRunning(true);

            setCodeResult(null);
            setError("");
            setMessage("");

            const response = await fetch(
                `${API_BASE}/api/code/run`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        problemId:
                            currentProblem.problemId,

                        language,
                        code
                    })
                }
            );

            const text =
                await response.text();

            let data = {};

            try {

                data =
                    JSON.parse(text);

            } catch {

                data = {
                    message: text
                };
            }

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    text ||
                    "Code execution failed."
                );
            }

            setCodeResult({
                type: "run",
                ...data
            });

        } catch (err) {

            setError(
                err.message ||
                "Code execution failed."
            );

        } finally {

            setRunning(false);
        }
    };

    // =====================================================
    // SUBMIT CODE
    // =====================================================

    const submitCode = async () => {

        if (!currentProblem) {
            return;
        }

        try {

            setSubmittingCode(true);

            setCodeResult(null);
            setError("");
            setMessage("");

            const response = await fetch(
                `${API_BASE}/api/assessment-candidates/${invitationToken}/submit-code`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        assignmentProblemId:
                            currentProblem.assignmentProblemId,

                        language,
                        code
                    })
                }
            );

            const text =
                await response.text();

            let data = {};

            try {

                data =
                    JSON.parse(text);

            } catch {

                data = {
                    message: text
                };
            }

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    text ||
                    "Unable to submit code."
                );
            }

            /*
             * Backend result is stored internally.
             *
             * We intentionally DO NOT show:
             * - Accepted / Wrong Answer
             * - Marks
             * - Score
             * - Percentage
             *
             * to the candidate.
             */

            setQuestionResults(
                (previous) => ({
                    ...previous,

                    [currentProblem.assignmentProblemId]:
                    {
                        success: Boolean(data.success),
                        status: data.status || "",
                        passedTestCases: Number(data.passedTestCases || 0),
                        failedTestCases: Number(data.failedTestCases || 0),
                        totalTestCases: Number(data.totalTestCases || 0),
                        message: data.message || "",
                        code,
                        language,
                        attempted: true
                    }
                })
            );

            setSavedQuestions(
                (previous) => ({
                    ...previous,

                    [currentProblem.assignmentProblemId]:
                        true
                })
            );

            setDraftAnswers(
                (previous) => ({
                    ...previous,

                    [currentProblem.assignmentProblemId]:
                    {
                        language,
                        code
                    }
                })
            );

            setCodeResult({
                type: "submitted",
                message:
                    "Code submitted successfully. Your response has been recorded.",
                success: Boolean(data.success),
                status: data.status || "",
                passedTestCases: Number(data.passedTestCases || 0),
                failedTestCases: Number(data.failedTestCases || 0),
                totalTestCases: Number(data.totalTestCases || 0)
            });

        } catch (err) {

            setError(
                err.message ||
                "Unable to submit code."
            );

        } finally {

            setSubmittingCode(false);
        }
    };

    // =====================================================
    // PREVIOUS
    // =====================================================

    const handlePrevious = async () => {

        if (currentIndex <= 0) {
            return;
        }

        const saved =
            await saveAnswer();

        if (!saved && session) {
            return;
        }

        setCurrentIndex(
            (previous) =>
                previous - 1
        );

        setCodeResult(null);
        setMessage("");
        setError("");
    };

    // =====================================================
    // NEXT
    // =====================================================

    const handleNext = async () => {

        if (
            currentIndex >=
            problems.length - 1
        ) {
            return;
        }

        const saved =
            await saveAnswer();

        if (!saved && session) {
            return;
        }

        setCurrentIndex(
            (previous) =>
                previous + 1
        );

        setCodeResult(null);
        setMessage("");
        setError("");
    };

    // =====================================================
    // FINAL SUBMIT
    // =====================================================

    const handleFinalSubmit =
        useCallback(
            async (
                automatic = false
            ) => {

                if (
                    autoSubmittingRef.current ||
                    finalResult
                ) {
                    return;
                }

                autoSubmittingRef.current =
                    true;

                try {

                    setSubmittingAssessment(
                        true
                    );

                    setError("");

                    // Save current answer first

                    if (
                        currentProblem &&
                        session
                    ) {

                        try {

                            const saveResponse =
                                await fetch(
                                    `${API_BASE}/api/assessment-candidates/${invitationToken}/save-answer`,
                                    {
                                        method: "POST",

                                        headers: {
                                            "Content-Type":
                                                "application/json"
                                        },

                                        body:
                                            JSON.stringify({
                                                assignmentProblemId:
                                                    currentProblem.assignmentProblemId,

                                                language,
                                                code
                                            })
                                    }
                                );

                            if (
                                !saveResponse.ok &&
                                !automatic
                            ) {

                                const saveText =
                                    await saveResponse.text();

                                throw new Error(
                                    saveText ||
                                    "Unable to save current answer."
                                );
                            }

                        } catch (saveError) {

                            if (!automatic) {
                                throw saveError;
                            }
                        }
                    }

                    const response =
                        await fetch(
                            `${API_BASE}/api/assessment-candidates/${invitationToken}/submit-assessment`,
                            {
                                method: "POST"
                            }
                        );

                    const text =
                        await response.text();

                    let data;

                    try {

                        data =
                            JSON.parse(text);

                    } catch {

                        if (!response.ok) {

                            throw new Error(
                                text ||
                                "Unable to submit assessment."
                            );
                        }

                        data = {
                            message: text
                        };
                    }

                    if (!response.ok) {

                        throw new Error(
                            data?.message ||
                            text ||
                            "Unable to submit assessment."
                        );
                    }

                    finishingRef.current =
                        true;

                    setSubmissionTime(
                        new Date()
                    );

                    setFinalResult(
                        data
                    );
                    setShowFeedback(false);

                    stopMediaDevices();

                    if (
                        document.fullscreenElement
                    ) {

                        try {

                            await document
                                .exitFullscreen();

                        } catch (fullscreenError) {

                            console.log(
                                "Unable to exit fullscreen:",
                                fullscreenError
                            );
                        }
                    }

                } catch (err) {

                    autoSubmittingRef.current =
                        false;

                    setError(
                        err.message ||
                        "Unable to submit assessment."
                    );

                } finally {

                    setSubmittingAssessment(
                        false
                    );
                }
            },
            [
                finalResult,
                currentProblem,
                session,
                invitationToken,
                language,
                code,
                stopMediaDevices
            ]
        );

    useEffect(() => {

        finalSubmitRef.current =
            handleFinalSubmit;

    }, [handleFinalSubmit]);

    // =====================================================
    // FEEDBACK
    // =====================================================

    const updateFeedbackRating = (field, value) => {
        setFeedback((previous) => ({
            ...previous,
            [field]: value
        }));
        setFeedbackError("");
    };

    const submitFeedback = async () => {
        if (!invitationToken) {
            return;
        }

        if (
            !feedback.overallRating ||
            !feedback.questionQualityRating ||
            !feedback.platformRating
        ) {
            setFeedbackError("Please provide all three ratings before submitting.");
            return;
        }

        try {
            setFeedbackSubmitting(true);
            setFeedbackError("");

            const response = await fetch(
                `${API_BASE}/api/assessment-candidates/${invitationToken}/feedback`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(feedback)
                }
            );

            const text = await response.text();
            let data = {};

            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                data = { message: text };
            }

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    text ||
                    "Unable to submit feedback."
                );
            }

            setShowFeedback(false);

        } catch (err) {
            setFeedbackError(
                err.message ||
                "Unable to submit feedback."
            );
        } finally {
            setFeedbackSubmitting(false);
        }
    };

    const skipFeedback = () => {
        setFeedbackError("");
        setShowFeedback(false);
    };

    // =====================================================
    // ATTEMPTED COUNT
    // =====================================================

    const attemptedCount =
        useMemo(() => {

            const ids =
                new Set([
                    ...Object.keys(
                        savedQuestions
                    ),

                    ...Object.keys(
                        questionResults
                    )
                ]);

            return ids.size;

        }, [
            savedQuestions,
            questionResults
        ]);

    // =====================================================
    // TIME TAKEN
    // =====================================================

    const getTimeTaken = () => {

        if (!session?.startedAt) {
            return "—";
        }

        const start =
            new Date(
                session.startedAt
            ).getTime();

        const end =
            submissionTime
                ? submissionTime.getTime()
                : Date.now();

        const seconds =
            Math.max(
                0,
                Math.floor(
                    (end - start) / 1000
                )
            );

        const hours =
            Math.floor(
                seconds / 3600
            );

        const minutes =
            Math.floor(
                (seconds % 3600) / 60
            );

        const remainingSeconds =
            seconds % 60;

        if (hours > 0) {

            return (
                `${hours} hr ` +
                `${minutes} min ` +
                `${remainingSeconds} sec`
            );
        }

        return (
            `${minutes} min ` +
            `${remainingSeconds} sec`
        );
    };

    // =====================================================
    // FEEDBACK PAGE
    // =====================================================

    if (finalResult && showFeedback) {
        const Rating = ({ field }) => (
            <div className="assessment-feedback-rating">
                {[1, 2, 3, 4, 5].map((value) => (
                    <button
                        key={value}
                        type="button"
                        className={
                            `feedback-rating-button ${
                                feedback[field] >= value ? "selected" : ""
                            }`
                        }
                        onClick={() => updateFeedbackRating(field, value)}
                        aria-label={`${value} out of 5`}
                    >
                        {value}
                    </button>
                ))}
            </div>
        );

        return (
            <div className="assessment-result-page">
                <div className="assessment-result-card assessment-feedback-card">
                    <img
                        src="/codesprint-logo.png"
                        alt="CodeSprint"
                        className="result-logo"
                    />

                    <div className="result-success-icon">✓</div>

                    <h1>Assessment Submitted</h1>
                    <p className="result-subtitle">
                        Thank you. Your assessment has been recorded.
                        Please share your feedback about the experience.
                    </p>

                    <div className="assessment-feedback-form">
                        <div className="feedback-field">
                            <label>Overall Experience</label>
                            <Rating field="overallRating" />
                        </div>

                        <div className="feedback-field">
                            <label>Question Quality</label>
                            <Rating field="questionQualityRating" />
                        </div>

                        <div className="feedback-field">
                            <label>Platform Experience</label>
                            <Rating field="platformRating" />
                        </div>

                        <div className="feedback-field">
                            <label>Difficulty</label>
                            <select
                                value={feedback.difficulty}
                                onChange={(event) =>
                                    setFeedback((previous) => ({
                                        ...previous,
                                        difficulty: event.target.value
                                    }))
                                }
                            >
                                <option value="EASY">Easy</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HARD">Hard</option>
                            </select>
                        </div>

                        <div className="feedback-field feedback-checkbox-field">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={feedback.technicalIssue}
                                    onChange={(event) =>
                                        setFeedback((previous) => ({
                                            ...previous,
                                            technicalIssue: event.target.checked
                                        }))
                                    }
                                />
                                I experienced a technical issue
                            </label>
                        </div>

                        <div className="feedback-field">
                            <label htmlFor="assessment-feedback-comments">Comments (optional)</label>
                            <textarea
                                id="assessment-feedback-comments"
                                value={feedback.comments}
                                maxLength={2000}
                                onChange={(event) =>
                                    setFeedback((previous) => ({
                                        ...previous,
                                        comments: event.target.value
                                    }))
                                }
                                placeholder="Tell us about your assessment experience..."
                                rows={4}
                            />
                        </div>

                        {feedbackError && (
                            <div className="assessment-editor-message error">
                                {feedbackError}
                            </div>
                        )}

                        <div className="feedback-actions">
                            <button
                                type="button"
                                className="feedback-skip-button"
                                onClick={skipFeedback}
                                disabled={feedbackSubmitting}
                            >
                                Skip
                            </button>
                            <button
                                type="button"
                                className="feedback-submit-button"
                                onClick={submitFeedback}
                                disabled={feedbackSubmitting}
                            >
                                {feedbackSubmitting ? "Submitting..." : "Submit Feedback"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // =====================================================
    // FINAL SUBMISSION PAGE
    // =====================================================

    if (finalResult) {

        return (
            <div className="assessment-result-page">

                <div className="assessment-result-card">

                    <img
                        src="/codesprint-logo.png"
                        alt="CodeSprint"
                        className="result-logo"
                    />

                    <div className="result-success-icon">
                        ✓
                    </div>

                    <h1>
                        Assessment Submitted
                    </h1>

                    <p className="result-subtitle">
                        {finalResult.securityAutoSubmitted
                            ? (
                                finalResult.message ||
                                "Your assessment was submitted automatically because of a security event."
                            )
                            : "Your assessment has been submitted successfully."}
                    </p>

                    <div className="submission-summary">

                        <div className="submission-summary-row">

                            <span>
                                Questions Attempted
                            </span>

                            <strong>
                                {finalResult.attemptedQuestions ??
                                    attemptedCount}
                                {" / "}
                                {finalResult.totalQuestions ??
                                    totalQuestions}
                            </strong>

                        </div>

                        <div className="submission-summary-row">

                            <span>
                                Time Taken
                            </span>

                            <strong>
                                {getTimeTaken()}
                            </strong>

                        </div>

                        <div className="submission-summary-row">

                            <span>
                                Submitted At
                            </span>

                            <strong>
                                {(submissionTime || new Date())
                                    .toLocaleString()}
                            </strong>

                        </div>

                    </div>

                    <div className="submission-recorded-message">
                        ✓ Your responses have been recorded.
                    </div>

                    <div className="result-feedback-actions">

                        <button
                            type="button"
                            className="give-feedback-button"
                            onClick={() => {
                                setFeedbackError("");
                                setShowFeedback(true);
                            }}
                        >
                            Give Feedback
                        </button>

                        <button
                            type="button"
                            className="skip-feedback-result-button"
                            onClick={() => {
                                setFeedbackError("");
                                setShowFeedback(false);
                            }}
                        >
                            Skip
                        </button>

                    </div>

                    <p className="result-note">
                        You may close this window now.
                    </p>

                </div>

            </div>
        );
    }

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="assessment-loading">

                <div className="assessment-loader">
                </div>

                <h2>
                    Loading Assessment...
                </h2>

                <p>
                    Preparing your coding environment.
                </p>

            </div>
        );
    }

    // =====================================================
    // ERROR
    // =====================================================

    if (
        error &&
        problems.length === 0
    ) {

        return (
            <div className="assessment-error-page">

                <div className="assessment-error-card">

                    <img
                        src="/codesprint-logo.png"
                        alt="CodeSprint"
                        className="error-logo"
                    />

                    <h2>
                        Unable to Load Assessment
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        className="assessment-back-button"
                        onClick={() =>
                            navigate(
                                `/assessment/invite/${invitationToken}`
                            )
                        }
                    >
                        Back
                    </button>

                </div>

            </div>
        );
    }

    // =====================================================
    // MAIN ASSESSMENT
    // =====================================================

    return (
        <div className="assessment-page">

            {/* =============================================
                FULLSCREEN WARNING MODAL
            ============================================= */}

            {showFullscreenWarning &&
                !finalResult &&
                !finishingRef.current && (

                <div className="fullscreen-warning-overlay">

                    <div
                        className="fullscreen-warning-modal"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="fullscreen-warning-title"
                    >

                        <div className="fullscreen-warning-icon">
                            !
                        </div>

                        <h2 id="fullscreen-warning-title">
                            Fullscreen Required
                        </h2>

                        <p className="fullscreen-warning-description">
                            You exited fullscreen mode. Fullscreen is
                            required during this assessment.
                        </p>

                        <div className="fullscreen-warning-count">
                            Warning{" "}
                            <strong>
                                {warningCount}/{warningLimit}
                            </strong>
                        </div>

                        <div className="fullscreen-warning-notice">
                            Further violations may automatically
                            submit your assessment.
                        </div>

                        <button
                            type="button"
                            className="fullscreen-return-button"
                            onClick={handleReturnToFullscreen}
                            disabled={returningToFullscreen}
                            autoFocus
                        >
                            {returningToFullscreen
                                ? "Returning..."
                                : "Return to Fullscreen"}
                        </button>

                    </div>

                </div>
            )}


            {/* =============================================
                TOP HEADER
            ============================================= */}

            <header className="assessment-topbar">

                <div className="assessment-brand">

                    <img
                        src="/codesprint-logo.png"
                        alt="CodeSprint"
                        className="assessment-brand-image"
                    />

                </div>

                <div className="assessment-topbar-center">

                    <div
                        className={
                            timeLeft !== null &&
                            timeLeft <= 300
                                ? "assessment-timer timer-danger"
                                : "assessment-timer"
                        }
                    >
                        <span className="timer-icon">
                            ◷
                        </span>

                        <strong>
                            {formattedTime}
                        </strong>
                    </div>

                </div>

                <div className="assessment-topbar-actions">

                    <div className="assessment-candidate-info">

                        <strong>
                            {candidateName}
                        </strong>

                        <span>
                            {candidateEmail}
                        </span>

                    </div>

                    {currentIndex <
                    problems.length - 1 ? (

                        <button
                            type="button"
                            className="save-proceed-button"
                            onClick={handleNext}
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save & Proceed"}
                        </button>

                    ) : (

                        <button
                            type="button"
                            className="save-proceed-button final-submit"
                            onClick={() =>
                                handleFinalSubmit(false)
                            }
                            disabled={
                                submittingAssessment
                            }
                        >
                            {submittingAssessment
                                ? "Submitting..."
                                : "Submit Assessment"}
                        </button>
                    )}

                </div>

            </header>

            {/* =============================================
                SECURITY STRIP
            ============================================= */}

            <div className="assessment-security-strip">

                <div className="security-items">

                    {assessment?.fullscreenRequired && (

                        <span
                            className={
                                isFullscreen
                                    ? "security-item secure"
                                    : "security-item danger"
                            }
                        >
                            {isFullscreen
                                ? "✓ Fullscreen"
                                : "⚠ Fullscreen"}
                        </span>
                    )}

                    {assessment?.cameraRequired && (

                        <span
                            className={
                                cameraActive
                                    ? "security-item secure"
                                    : "security-item danger"
                            }
                        >
                            {cameraActive
                                ? "● Camera Active"
                                : "⚠ Camera Inactive"}
                        </span>
                    )}

                    {assessment?.microphoneRequired && (

                        <span
                            className={
                                microphoneActive
                                    ? "security-item secure"
                                    : "security-item danger"
                            }
                        >
                            {microphoneActive
                                ? "● Microphone Active"
                                : "⚠ Microphone Inactive"}
                        </span>
                    )}

                    <span
                        className={
                            warningCount > 0
                                ? "security-item warning"
                                : "security-item"
                        }
                    >
                        Warnings {warningCount}/{warningLimit}
                    </span>

                </div>

                {assessment?.fullscreenRequired &&
                    !isFullscreen && (

                        <button
                            type="button"
                            className="enter-fullscreen-button"
                            onClick={
                                requestFullscreen
                            }
                        >
                            Enter Fullscreen
                        </button>
                    )}

            </div>

            {/* =============================================
                WORKSPACE
            ============================================= */}

            <main className="assessment-workspace">

                {/* =========================================
                    QUESTION NAVIGATION
                ========================================= */}

                <aside className="assessment-question-rail">

                    <div className="question-rail-title">
                        Q
                    </div>

                    <div className="question-rail-list">

                        {problems.map(
                            (problem, index) => {

                                const id =
                                    problem.assignmentProblemId;

                                const attempted =
                                    Boolean(
                                        savedQuestions[id] ||
                                        questionResults[id]
                                    );

                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        className={
                                            `question-rail-button ${
                                                currentIndex === index
                                                    ? "active"
                                                    : ""
                                            } ${
                                                attempted
                                                    ? "attempted"
                                                    : ""
                                            }`
                                        }
                                        onClick={() =>
                                            changeQuestion(index)
                                        }
                                        title={
                                            `Question ${index + 1}`
                                        }
                                    >
                                        {index + 1}

                                        {attempted && (
                                            <span className="attempted-dot">
                                            </span>
                                        )}

                                    </button>
                                );
                            }
                        )}

                    </div>

                </aside>

                {/* =========================================
                    PROBLEM PANEL
                ========================================= */}

                <section className="assessment-problem-panel">

                    {currentProblem && (

                        <>
                            <div className="problem-heading">

                                <div>

                                    <span className="problem-question-label">
                                        Question {currentIndex + 1}
                                        {" of "}
                                        {totalQuestions}
                                    </span>

                                    <h1>
                                        {currentProblem.title}
                                    </h1>

                                </div>

                                <button
                                    type="button"
                                    className="bookmark-button"
                                    title="Question"
                                >
                                    ♧
                                </button>

                            </div>

                            <div className="problem-meta">

                                <span>
                                    Difficulty:
                                    {" "}
                                    <strong>
                                        {currentProblem.difficulty}
                                    </strong>
                                </span>

                                <span>
                                    Category:
                                    {" "}
                                    <strong>
                                        {currentProblem.category}
                                    </strong>
                                </span>

                            </div>

                            <div className="problem-content">

                                <section>

                                    <h3>
                                        Problem Description
                                    </h3>

                                    <p className="problem-description">
                                        {currentProblem.description}
                                    </p>

                                </section>

                                {currentProblem.inputFormat && (

                                    <section>

                                        <h3>
                                            Input Format
                                        </h3>

                                        <div className="problem-text-block">
                                            {currentProblem.inputFormat}
                                        </div>

                                    </section>
                                )}

                                {currentProblem.outputFormat && (

                                    <section>

                                        <h3>
                                            Output Format
                                        </h3>

                                        <div className="problem-text-block">
                                            {currentProblem.outputFormat}
                                        </div>

                                    </section>
                                )}

                                {currentProblem.constraints && (

                                    <section>

                                        <h3>
                                            Constraints
                                        </h3>

                                        <div className="problem-text-block">
                                            {currentProblem.constraints}
                                        </div>

                                    </section>
                                )}

                            </div>

                        </>
                    )}

                </section>

                {/* =========================================
                    EDITOR
                ========================================= */}

                <section className="assessment-code-panel">

                    <div className="code-toolbar">

                        <div className="language-control">

                            <span>
                                Language
                            </span>

                            <select
                                value={language}
                                onChange={
                                    handleLanguageChange
                                }
                            >
                                <option value="Java">
                                    Java
                                </option>

                                <option value="C++">
                                    C++
                                </option>

                                <option value="C">
                                    C
                                </option>

                                <option value="Python">
                                    Python
                                </option>

                                <option value="JavaScript">
                                    JavaScript
                                </option>

                            </select>

                        </div>

                        <div className="editor-toolbar-actions">

                            <span
                                className="editor-info"
                                title="Write and test your solution"
                            >
                                ⓘ
                            </span>

                            <button
                                type="button"
                                className="save-answer-button"
                                onClick={saveAnswer}
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save"}
                            </button>

                        </div>

                    </div>

                    <div className="editor-wrapper">

                        <div className="editor-line-numbers">

                            {Array.from(
                                {
                                    length:
                                        Math.max(
                                            code.split("\n").length,
                                            20
                                        )
                                },

                                (_, index) => (

                                    <span key={index}>
                                        {index + 1}
                                    </span>
                                )
                            )}

                        </div>

                        <textarea
                            className="assessment-code-editor"
                            value={code}
                            onChange={(event) =>
                                setCode(
                                    event.target.value
                                )
                            }
                            spellCheck="false"
                        />

                    </div>

                    {/* =====================================
                        RUN/SUBMIT MESSAGE
                    ===================================== */}

                    {(message || error) && (

                        <div
                            className={
                                error
                                    ? "assessment-editor-message error"
                                    : "assessment-editor-message"
                            }
                        >
                            {error || message}
                        </div>
                    )}

                    {codeResult && (

                        <div className="candidate-code-result">

                            <div className="candidate-result-header">

                                <strong>
                                    {codeResult.type === "run"
                                        ? "Run Result"
                                        : "Submission Recorded"}
                                </strong>

                            </div>

                            {Number(codeResult.totalTestCases || 0) > 0 && (

                                <div className="candidate-test-case-summary">

                                    <div className="candidate-test-case-title">
                                        TEST CASES
                                    </div>

                                    <div className="candidate-test-case-stats">

                                        <div className="candidate-test-stat passed">
                                            <span>✓ Passed</span>
                                            <strong>
                                                {Number(codeResult.passedTestCases || 0)}
                                            </strong>
                                        </div>

                                        <div className="candidate-test-stat failed">
                                            <span>✕ Failed</span>
                                            <strong>
                                                {Number(codeResult.failedTestCases || 0)}
                                            </strong>
                                        </div>

                                        <div className="candidate-test-stat total">
                                            <span>Total</span>
                                            <strong>
                                                {Number(codeResult.totalTestCases || 0)}
                                            </strong>
                                        </div>

                                    </div>

                                    <div className="candidate-test-case-progress">

                                        {Number(codeResult.failedTestCases || 0) === 0 ? (

                                            <>
                                                <strong className="all-passed">
                                                    ✓ All Test Cases Passed
                                                </strong>

                                                <span>
                                                    {Number(codeResult.passedTestCases || 0)}
                                                    {" / "}
                                                    {Number(codeResult.totalTestCases || 0)}
                                                    {" Test Cases Passed"}
                                                </span>
                                            </>

                                        ) : (

                                            <strong>
                                                {Number(codeResult.passedTestCases || 0)}
                                                {" / "}
                                                {Number(codeResult.totalTestCases || 0)}
                                                {" Test Cases Passed"}
                                            </strong>
                                        )}

                                    </div>

                                </div>
                            )}

                            {codeResult.type === "submitted" ? (

                                <div className="candidate-submit-message">

                                    <span>
                                        ✓
                                    </span>

                                    <p>
                                        {codeResult.message}
                                    </p>

                                </div>

                            ) : (

                                <div className="candidate-run-output">

                                    {codeResult.output && (

                                        <>
                                            <span>
                                                Output
                                            </span>

                                            <pre>
                                                {String(codeResult.output)}
                                            </pre>
                                        </>
                                    )}

                                    {codeResult.error && (

                                        <>
                                            <span>
                                                Error
                                            </span>

                                            <pre>
                                                {String(codeResult.error)}
                                            </pre>
                                        </>
                                    )}

                                    {!codeResult.output &&
                                        !codeResult.error &&
                                        codeResult.message && (

                                            <pre>
                                                {codeResult.message}
                                            </pre>
                                        )}

                                </div>
                            )}

                        </div>
                    )}

                    {/* =====================================
                        EDITOR ACTIONS
                    ===================================== */}

                    <div className="code-actions">

                        <button
                            type="button"
                            className="run-code-button"
                            onClick={runCode}
                            disabled={
                                running ||
                                submittingCode
                            }
                        >
                            {running
                                ? "Running..."
                                : "▷ Run Code"}
                        </button>

                        <button
                            type="button"
                            className="submit-code-button"
                            onClick={submitCode}
                            disabled={
                                submittingCode ||
                                running
                            }
                        >
                            {submittingCode
                                ? "Submitting..."
                                : "Submit Code"}
                        </button>

                    </div>

                </section>

            </main>

            {/* =============================================
                BOTTOM NAVIGATION
            ============================================= */}

            <footer className="assessment-bottom-bar">

                <button
                    type="button"
                    className="navigation-button previous"
                    onClick={handlePrevious}
                    disabled={
                        currentIndex === 0 ||
                        saving
                    }
                >
                    ← Previous
                </button>

                <div className="bottom-question-status">

                    <span>
                        Question
                    </span>

                    <strong>
                        {totalQuestions > 0
                            ? currentIndex + 1
                            : 0}
                        {" / "}
                        {totalQuestions}
                    </strong>

                </div>

                {currentIndex <
                problems.length - 1 ? (

                    <button
                        type="button"
                        className="navigation-button next"
                        onClick={handleNext}
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : "Save & Next →"}
                    </button>

                ) : (

                    <button
                        type="button"
                        className="navigation-button finish"
                        onClick={() =>
                            handleFinalSubmit(false)
                        }
                        disabled={
                            submittingAssessment
                        }
                    >
                        {submittingAssessment
                            ? "Submitting..."
                            : "Submit Assessment"}
                    </button>
                )}

            </footer>

        </div>
    );
}

export default AssessmentTest;