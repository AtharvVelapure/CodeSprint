import React, { useEffect, useState } from "react";
import {
    useLocation,
    useNavigate,
    useParams
} from "react-router-dom";

import "./AssessmentInstructions.css";

const API_BASE_URL = "";

const AssessmentInstructions = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { invitationToken } = useParams();

    const [assessment, setAssessment] = useState(
        location.state?.assessment || null
    );

    const [candidateName, setCandidateName] = useState(
        location.state?.candidateName || ""
    );

    const [candidateEmail, setCandidateEmail] = useState(
        location.state?.candidateEmail || ""
    );

    const [loading, setLoading] = useState(
        !assessment
    );

    const [starting, setStarting] = useState(false);

    const [
        cameraPermission,
        setCameraPermission
    ] = useState("NOT_CHECKED");

    const [
        microphonePermission,
        setMicrophonePermission
    ] = useState("NOT_CHECKED");

    const [
        fullscreenReady,
        setFullscreenReady
    ] = useState(false);

    const [
        errorMessage,
        setErrorMessage
    ] = useState("");

    const [
        errorType,
        setErrorType
    ] = useState("");

    // =====================================================
    // PARSE BACKEND ERROR
    // =====================================================

    const parseBackendError = (
        text,
        fallbackMessage = "Something went wrong."
    ) => {

        if (!text) {
            return fallbackMessage;
        }

        try {

            const data = JSON.parse(text);

            return (
                data.message ||
                data.error ||
                fallbackMessage
            );

        } catch {

            return text || fallbackMessage;
        }
    };

    // =====================================================
    // CONVERT BACKEND ERROR TO CANDIDATE-FRIENDLY MESSAGE
    // =====================================================

    const getCandidateFriendlyError = (
        backendMessage,
        status
    ) => {

        const message =
            backendMessage?.trim() || "";

        const lowerMessage =
            message.toLowerCase();

        // Assessment has not started yet
        if (
            status === 409 &&
            (
                lowerMessage.includes(
                    "has not started yet"
                ) ||
                lowerMessage.includes(
                    "not started"
                )
            )
        ) {

            return {
                type: "NOT_STARTED",
                message:
                    "This assessment has not started yet. Please wait until the scheduled start time and try again."
            };
        }

        // Assessment expired
        if (
            lowerMessage.includes("expired")
        ) {

            return {
                type: "EXPIRED",
                message:
                    "This assessment has expired and can no longer be started."
            };
        }

        // Assessment already completed
        if (
            lowerMessage.includes("completed") ||
            lowerMessage.includes("already submitted") ||
            lowerMessage.includes("already completed")
        ) {

            return {
                type: "COMPLETED",
                message:
                    "You have already completed this assessment. This assessment cannot be attempted again."
            };
        }

        // Invitation cancelled
        if (
            lowerMessage.includes("cancelled") ||
            lowerMessage.includes("canceled")
        ) {

            return {
                type: "CANCELLED",
                message:
                    "This assessment invitation is no longer active."
            };
        }

        // Invalid invitation
        if (
            status === 404 ||
            lowerMessage.includes(
                "invitation not found"
            ) ||
            lowerMessage.includes(
                "invalid invitation"
            )
        ) {

            return {
                type: "INVALID",
                message:
                    "This assessment invitation is invalid or no longer available."
            };
        }

        // Forbidden
        if (status === 403) {

            return {
                type: "FORBIDDEN",
                message:
                    message ||
                    "You are not allowed to start this assessment."
            };
        }

        // Other backend message
        return {
            type: "GENERAL",
            message:
                message ||
                "Unable to start assessment."
        };
    };

    // =====================================================
    // SHOW FRIENDLY BACKEND ERROR
    // =====================================================

    const handleBackendError = (
        text,
        status,
        fallbackMessage
    ) => {

        const backendMessage =
            parseBackendError(
                text,
                fallbackMessage
            );

        const friendlyError =
            getCandidateFriendlyError(
                backendMessage,
                status
            );

        setErrorType(
            friendlyError.type
        );

        setErrorMessage(
            friendlyError.message
        );

        return friendlyError;
    };

    // =====================================================
    // LOAD ASSESSMENT IF PAGE IS REFRESHED
    // =====================================================

    useEffect(() => {

        if (assessment) {
            return;
        }

        const loadAssessment = async () => {

            try {

                setLoading(true);
                setErrorMessage("");
                setErrorType("");

                const response = await fetch(
                    `${API_BASE_URL}/api/assessment-candidates/${invitationToken}`
                );

                const text =
                    await response.text();

                if (!response.ok) {

                    const friendlyError =
                        handleBackendError(
                            text,
                            response.status,
                            "Unable to load assessment."
                        );

                    throw new Error(
                        friendlyError.message
                    );
                }

                let data;

                try {

                    data = JSON.parse(text);

                } catch {

                    throw new Error(
                        "Invalid assessment response received."
                    );
                }

                setAssessment(data);

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

            } catch (error) {

                setErrorMessage(
                    (currentMessage) =>
                        currentMessage ||
                        error.message ||
                        "Unable to load assessment."
                );

            } finally {

                setLoading(false);
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
    // REQUEST CAMERA
    // =====================================================

    const requestCamera = async () => {

        try {

            setErrorMessage("");
            setErrorType("");

            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {

                throw new Error(
                    "Camera access is not supported by this browser."
                );
            }

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    video: true
                });

            stream
                .getTracks()
                .forEach((track) => {
                    track.stop();
                });

            setCameraPermission("GRANTED");

        } catch (error) {

            console.error(
                "Camera permission error:",
                error
            );

            setCameraPermission("DENIED");
            setErrorType("PERMISSION");

            setErrorMessage(
                "Camera permission was denied. Please allow camera access in your browser settings."
            );
        }
    };

    // =====================================================
    // REQUEST MICROPHONE
    // =====================================================

    const requestMicrophone = async () => {

        try {

            setErrorMessage("");
            setErrorType("");

            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {

                throw new Error(
                    "Microphone access is not supported by this browser."
                );
            }

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true
                });

            stream
                .getTracks()
                .forEach((track) => {
                    track.stop();
                });

            setMicrophonePermission("GRANTED");

        } catch (error) {

            console.error(
                "Microphone permission error:",
                error
            );

            setMicrophonePermission("DENIED");
            setErrorType("PERMISSION");

            setErrorMessage(
                "Microphone permission was denied. Please allow microphone access in your browser settings."
            );
        }
    };

    // =====================================================
    // ENTER FULLSCREEN
    // =====================================================

    const enableFullscreen = async () => {

        try {

            setErrorMessage("");
            setErrorType("");

            if (!document.fullscreenElement) {

                await document.documentElement
                    .requestFullscreen();
            }

            setFullscreenReady(true);

        } catch (error) {

            console.error(
                "Fullscreen error:",
                error
            );

            setFullscreenReady(false);
            setErrorType("PERMISSION");

            setErrorMessage(
                "Fullscreen could not be enabled. Please allow fullscreen mode."
            );
        }
    };

    // =====================================================
    // MONITOR FULLSCREEN
    // =====================================================

    useEffect(() => {

        const handleFullscreenChange = () => {

            setFullscreenReady(
                Boolean(document.fullscreenElement)
            );
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

    }, []);

    // =====================================================
    // CHECK REQUIRED PERMISSIONS
    // =====================================================

    const canStartAssessment = () => {

        if (!assessment) {
            return false;
        }

        if (
            assessment.cameraRequired &&
            cameraPermission !== "GRANTED"
        ) {
            return false;
        }

        if (
            assessment.microphoneRequired &&
            microphonePermission !== "GRANTED"
        ) {
            return false;
        }

        if (
            assessment.fullscreenRequired &&
            !fullscreenReady
        ) {
            return false;
        }

        return true;
    };

    // =====================================================
    // START ASSESSMENT
    // =====================================================

    const handleStartAssessment = async () => {

        setErrorMessage("");
        setErrorType("");

        if (!canStartAssessment()) {

            setErrorType("PERMISSION");

            setErrorMessage(
                "Please complete all required permissions before starting the assessment."
            );

            return;
        }

        if (!candidateName.trim()) {

            setErrorType("VALIDATION");

            setErrorMessage(
                "Candidate name is required."
            );

            return;
        }

        if (!candidateEmail.trim()) {

            setErrorType("VALIDATION");

            setErrorMessage(
                "Candidate email is required."
            );

            return;
        }

        try {

            setStarting(true);

            const response = await fetch(
                `${API_BASE_URL}/api/assessment-candidate-sessions/${invitationToken}/start`,
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

                const friendlyError =
                    handleBackendError(
                        text,
                        response.status,
                        "Unable to start assessment."
                    );

                throw new Error(
                    friendlyError.message
                );
            }

            let session;

            try {

                session = JSON.parse(text);

            } catch {

                throw new Error(
                    "Invalid session response received."
                );
            }

            console.log(
                "START SUCCESS - NAVIGATING TO:",
                `/assessment/invite/${invitationToken}/test`
            );

            console.log(
                "SESSION:",
                session
            );

            // =================================================
            // IMPORTANT:
            // THIS MUST MATCH THE ROUTE IN App.jsx EXACTLY
            // =================================================

            navigate(
                `/assessment/invite/${invitationToken}/test`,
                {
                    state: {
                        candidateName:
                            candidateName.trim(),

                        candidateEmail:
                            candidateEmail.trim(),

                        assessment,

                        session
                    }
                }
            );

        } catch (error) {

            console.error(
                "Start assessment error:",
                error
            );

            setErrorMessage(
                (currentMessage) =>
                    currentMessage ||
                    error.message ||
                    "Unable to start assessment."
            );

        } finally {

            setStarting(false);
        }
    };

    // =====================================================
    // ERROR TITLE
    // =====================================================

    const getErrorTitle = () => {

        switch (errorType) {

            case "NOT_STARTED":
                return "Assessment Not Started Yet";

            case "EXPIRED":
                return "Assessment Has Expired";

            case "COMPLETED":
                return "Assessment Already Completed";

            case "CANCELLED":
                return "Invitation No Longer Active";

            case "INVALID":
                return "Assessment Unavailable";

            default:
                return "";
        }
    };

    // =====================================================
    // ERROR ICON
    // =====================================================

    const getErrorIcon = () => {

        switch (errorType) {

            case "NOT_STARTED":
                return "🕒";

            case "EXPIRED":
                return "⌛";

            case "COMPLETED":
                return "✓";

            case "CANCELLED":
                return "⚠";

            case "INVALID":
                return "⚠";

            default:
                return "⚠";
        }
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="assessment-instructions-page">

                <div className="instructions-loading">

                    <div className="instructions-spinner">
                    </div>

                    <p>
                        Loading assessment...
                    </p>

                </div>

            </div>
        );
    }

    // =====================================================
    // ASSESSMENT LOAD ERROR
    // =====================================================

    if (!assessment) {

        return (
            <div className="assessment-instructions-page">

                <div className="instructions-error-card">

                    <div className="instructions-brand">
                        CodeSprint
                    </div>

                    <div className="instructions-error-icon">
                        {getErrorIcon()}
                    </div>

                    <h1>
                        {getErrorTitle() ||
                            "Assessment Unavailable"}
                    </h1>

                    <p>
                        {errorMessage ||
                            "Unable to load this assessment."}
                    </p>

                    <button
                        type="button"
                        className="instructions-secondary-button"
                        onClick={() => navigate("/")}
                    >
                        Go to CodeSprint
                    </button>

                </div>

            </div>
        );
    }

    // =====================================================
    // MAIN PAGE
    // =====================================================

    return (
        <div className="assessment-instructions-page">

            <div className="assessment-instructions-container">

                {/* ============================= */}
                {/* HEADER */}
                {/* ============================= */}

                <div className="instructions-header">

                    <div className="instructions-brand">

                        <div className="instructions-brand-mark">
                            C
                        </div>

                        <span>
                            CodeSprint
                        </span>

                    </div>

                    <div className="instructions-secure-badge">
                        🔒 Secure Assessment
                    </div>

                </div>

                {/* ============================= */}
                {/* TITLE */}
                {/* ============================= */}

                <div className="instructions-title-section">

                    <span className="instructions-step">
                        STEP 2 OF 3
                    </span>

                    <h1>
                        Assessment Instructions
                    </h1>

                    <p>
                        Please read the instructions carefully
                        and complete the required permissions
                        before starting.
                    </p>

                </div>

                {/* ============================= */}
                {/* SUMMARY */}
                {/* ============================= */}

                <div className="instructions-summary-card">

                    <div>

                        <span>
                            Company
                        </span>

                        <strong>
                            {assessment.companyName}
                        </strong>

                    </div>

                    <div>

                        <span>
                            Position
                        </span>

                        <strong>
                            {assessment.position}
                        </strong>

                    </div>

                    <div>

                        <span>
                            Duration
                        </span>

                        <strong>
                            {assessment.durationMinutes} minutes
                        </strong>

                    </div>

                    <div>

                        <span>
                            Questions
                        </span>

                        <strong>
                            {assessment.numberOfQuestions ?? "—"}
                        </strong>

                    </div>

                </div>

                {/* ============================= */}
                {/* TEST INSTRUCTIONS */}
                {/* ============================= */}

                <section className="instructions-card">

                    <div className="instructions-card-heading">

                        <div className="instructions-heading-icon">
                            📋
                        </div>

                        <div>

                            <h2>
                                Test Instructions
                            </h2>

                            <p>
                                Please follow these rules during
                                the assessment.
                            </p>

                        </div>

                    </div>

                    <div className="instructions-list">

                        <div className="instruction-item">

                            <span>
                                1
                            </span>

                            <p>
                                Complete the coding questions
                                within the allotted assessment time.
                            </p>

                        </div>

                        <div className="instruction-item">

                            <span>
                                2
                            </span>

                            <p>
                                Your assessment timer will start
                                when you begin the test.
                            </p>

                        </div>

                        <div className="instruction-item">

                            <span>
                                3
                            </span>

                            <p>
                                Do not leave the assessment
                                environment during the test.
                            </p>

                        </div>

                        {assessment.fullscreenRequired && (

                            <div className="instruction-item">

                                <span>
                                    4
                                </span>

                                <p>
                                    Fullscreen mode is required
                                    for this assessment.
                                </p>

                            </div>
                        )}

                        {assessment.cameraRequired && (

                            <div className="instruction-item">

                                <span>
                                    5
                                </span>

                                <p>
                                    Your camera must remain
                                    enabled during the assessment.
                                </p>

                            </div>
                        )}

                        {assessment.microphoneRequired && (

                            <div className="instruction-item">

                                <span>
                                    6
                                </span>

                                <p>
                                    Your microphone must remain
                                    enabled during the assessment.
                                </p>

                            </div>
                        )}

                    </div>

                    {assessment.instructions && (

                        <div className="host-instructions">

                            <h3>
                                Additional Instructions
                            </h3>

                            <p>
                                {assessment.instructions}
                            </p>

                        </div>
                    )}

                </section>

                {/* ============================= */}
                {/* PERMISSIONS */}
                {/* ============================= */}

                <section className="instructions-card">

                    <div className="instructions-card-heading">

                        <div className="instructions-heading-icon">
                            🛡️
                        </div>

                        <div>

                            <h2>
                                Required Permissions
                            </h2>

                            <p>
                                Check the permissions required for
                                this assessment.
                            </p>

                        </div>

                    </div>

                    {/* CAMERA */}

                    <div className="permission-row">

                        <div className="permission-info">

                            <div className="permission-icon">
                                📷
                            </div>

                            <div>

                                <strong>
                                    Camera
                                </strong>

                                <span>
                                    {assessment.cameraRequired
                                        ? "Camera access is required."
                                        : "Camera is not required."}
                                </span>

                            </div>

                        </div>

                        {assessment.cameraRequired ? (

                            cameraPermission === "GRANTED" ? (

                                <span className="permission-granted">
                                    ✓ Allowed
                                </span>

                            ) : (

                                <button
                                    type="button"
                                    className="permission-button"
                                    onClick={requestCamera}
                                >
                                    Allow Camera
                                </button>
                            )

                        ) : (

                            <span className="permission-not-required">
                                Not Required
                            </span>
                        )}

                    </div>

                    {/* MICROPHONE */}

                    <div className="permission-row">

                        <div className="permission-info">

                            <div className="permission-icon">
                                🎤
                            </div>

                            <div>

                                <strong>
                                    Microphone
                                </strong>

                                <span>
                                    {assessment.microphoneRequired
                                        ? "Microphone access is required."
                                        : "Microphone is not required."}
                                </span>

                            </div>

                        </div>

                        {assessment.microphoneRequired ? (

                            microphonePermission === "GRANTED" ? (

                                <span className="permission-granted">
                                    ✓ Allowed
                                </span>

                            ) : (

                                <button
                                    type="button"
                                    className="permission-button"
                                    onClick={requestMicrophone}
                                >
                                    Allow Microphone
                                </button>
                            )

                        ) : (

                            <span className="permission-not-required">
                                Not Required
                            </span>
                        )}

                    </div>

                    {/* FULLSCREEN */}

                    <div className="permission-row">

                        <div className="permission-info">

                            <div className="permission-icon">
                                ⛶
                            </div>

                            <div>

                                <strong>
                                    Fullscreen
                                </strong>

                                <span>
                                    {assessment.fullscreenRequired
                                        ? "Fullscreen mode is required."
                                        : "Fullscreen is not required."}
                                </span>

                            </div>

                        </div>

                        {assessment.fullscreenRequired ? (

                            fullscreenReady ? (

                                <span className="permission-granted">
                                    ✓ Ready
                                </span>

                            ) : (

                                <button
                                    type="button"
                                    className="permission-button"
                                    onClick={enableFullscreen}
                                >
                                    Enable Fullscreen
                                </button>
                            )

                        ) : (

                            <span className="permission-not-required">
                                Not Required
                            </span>
                        )}

                    </div>

                </section>

                {/* ============================= */}
                {/* FRIENDLY STATUS / ERROR */}
                {/* ============================= */}

                {errorMessage && (

                    <div className="instructions-error-message">

                        <span>
                            {getErrorIcon()}
                        </span>

                        <div>

                            {getErrorTitle() && (

                                <strong>
                                    {getErrorTitle()}
                                </strong>
                            )}

                            <span>
                                {errorMessage}
                            </span>

                        </div>

                        <button
                            type="button"
                            onClick={() => {

                                setErrorMessage("");
                                setErrorType("");
                            }}
                            aria-label="Close error"
                        >
                            ×
                        </button>

                    </div>
                )}

                {/* ============================= */}
                {/* START */}
                {/* ============================= */}

                <div className="instructions-start-section">

                    <div>

                        <strong>
                            Ready to begin?
                        </strong>

                        <p>
                            Make sure all required permissions
                            are enabled before starting.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="start-assessment-button"
                        onClick={handleStartAssessment}
                        disabled={
                            !canStartAssessment() ||
                            starting
                        }
                    >
                        {starting
                            ? "Starting Assessment..."
                            : "Start Assessment →"}
                    </button>

                </div>

                <p className="instructions-footer">
                    Powered by CodeSprint
                </p>

            </div>

        </div>
    );
};

export default AssessmentInstructions;