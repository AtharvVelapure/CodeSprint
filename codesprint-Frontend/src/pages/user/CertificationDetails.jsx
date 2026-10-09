import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./CertificationDetails.css";

const API_URL = "/api/certifications";

function CertificationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [certification, setCertification] = useState(null);
    const [attempts, setAttempts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [starting, setStarting] = useState(false);

    // ============================================================
    // GET LOGGED-IN USER
    // ============================================================

    const getStoredUser = () => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            return null;
        }

        try {
            return JSON.parse(storedUser);
        } catch (error) {
            console.error(
                "Invalid user data in localStorage:",
                error
            );

            return null;
        }
    };

    // ============================================================
    // ERROR MESSAGE
    // ============================================================

    const getErrorMessage = (
        err,
        fallbackMessage
    ) => {
        const data = err.response?.data;

        if (typeof data === "string") {
            return data;
        }

        if (data?.message) {
            return data.message;
        }

        if (data?.error) {
            return data.error;
        }

        return fallbackMessage;
    };

    // ============================================================
    // LOAD PAGE
    // ============================================================

    useEffect(() => {
        loadPage();
    }, [id]);

    const loadPage = async () => {
        try {
            setLoading(true);
            setError("");

            const user = getStoredUser();

            if (!user?.id) {
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            const [
                certificationResponse,
                attemptsResponse
            ] = await Promise.all([
                axios.get(
                    `${API_URL}/${id}`
                ),

                axios.get(
                    `${API_URL}/user/${user.id}/attempts`
                )
            ]);

            setCertification(
                certificationResponse.data
            );

            setAttempts(
                Array.isArray(attemptsResponse.data)
                    ? attemptsResponse.data
                    : []
            );

        } catch (err) {

            console.error(
                "Error loading certification:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Failed to load certification."
                )
            );

        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // ATTEMPTS FOR CURRENT CERTIFICATION
    // ============================================================

    const certificationAttempts =
        attempts.filter(
            (attempt) =>
                Number(attempt.certificationId) ===
                Number(id)
        );

    /*
     * Backend repository returns attempts ordered by
     * startedAt DESC.
     */
    const latestAttempt =
        certificationAttempts.length > 0
            ? certificationAttempts[0]
            : null;

    /*
     * There should normally only be one IN_PROGRESS
     * attempt for a certification.
     */
    const inProgressAttempt =
        certificationAttempts.find(
            (attempt) =>
                String(
                    attempt.status || ""
                ).toUpperCase() === "IN_PROGRESS"
        );

    /*
     * Latest finished attempt.
     *
     * Both COMPLETED and TIME_EXPIRED are considered
     * finished attempts.
     */
    const completedAttempt =
        certificationAttempts.find(
            (attempt) => {
                const status =
                    String(
                        attempt.status || ""
                    ).toUpperCase();

                return (
                    status === "COMPLETED" ||
                    status === "TIME_EXPIRED"
                );
            }
        );

    // ============================================================
    // RETAKE POLICY
    // ============================================================

    const allowRetake =
        certification?.allowRetake === true;

    /*
     * When retake is disabled, backend effectively
     * allows only one attempt.
     */
    const maxAttempts =
        allowRetake
            ? Number(
                certification?.maxAttempts || 1
            )
            : 1;

    const attemptCount =
        certificationAttempts.length;

    const remainingAttempts =
        Math.max(
            maxAttempts - attemptCount,
            0
        );

    /*
     * IMPORTANT:
     *
     * Retake permission does NOT depend on whether the
     * previous attempt was passed, failed or expired.
     *
     * It depends only on:
     *
     * 1. Retake is enabled.
     * 2. User has attempts remaining.
     * 3. There is no active attempt to resume.
     */
    const canRetake =
        allowRetake &&
        attemptCount > 0 &&
        attemptCount < maxAttempts &&
        !inProgressAttempt;

    const hasReachedAttemptLimit =
        attemptCount >= maxAttempts &&
        !inProgressAttempt;

    const retakeNotAllowed =
        !allowRetake &&
        attemptCount > 0 &&
        !inProgressAttempt;

    const hasPreviousAttempt =
        attemptCount > 0;

    // ============================================================
    // START / RETAKE CERTIFICATION
    // ============================================================

    const handleStartCertification = async () => {
        try {
            const user = getStoredUser();

            if (!user?.id) {
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            /*
             * Never create another attempt when an active
             * attempt already exists.
             */
            if (inProgressAttempt?.id) {

                navigate(
                    `/user/certifications/${id}/exam/${inProgressAttempt.id}`
                );

                return;
            }

            /*
             * Frontend guards only.
             *
             * Backend remains the final authority.
             */
            if (retakeNotAllowed) {
                setError(
                    "You have already attempted this certification. Retake is not allowed."
                );

                return;
            }

            if (
                hasPreviousAttempt &&
                !canRetake
            ) {
                setError(
                    `Maximum attempts reached for this certification. Maximum allowed attempts: ${maxAttempts}`
                );

                return;
            }

            setStarting(true);
            setError("");

            const response =
                await axios.post(
                    `${API_URL}/${id}/start`,
                    null,
                    {
                        params: {
                            userId: user.id
                        }
                    }
                );

            const attempt =
                response.data;

            if (!attempt?.id) {
                setError(
                    "Certification started, but the attempt ID was not returned."
                );

                return;
            }

            /*
             * Store returned attempt locally.
             */
            setAttempts(
                (currentAttempts) => [
                    attempt,
                    ...currentAttempts
                ]
            );

            navigate(
                `/user/certifications/${id}/exam/${attempt.id}`
            );

        } catch (err) {

            console.error(
                "Error starting certification:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to start certification."
                )
            );

            /*
             * Refresh attempts because backend is the
             * authoritative source.
             */
            try {
                const user = getStoredUser();

                if (user?.id) {
                    const response =
                        await axios.get(
                            `${API_URL}/user/${user.id}/attempts`
                        );

                    setAttempts(
                        Array.isArray(response.data)
                            ? response.data
                            : []
                    );
                }

            } catch (refreshError) {

                console.error(
                    "Failed to refresh certification attempts:",
                    refreshError
                );
            }

        } finally {
            setStarting(false);
        }
    };

    // ============================================================
    // RESUME ATTEMPT
    // ============================================================

    const handleResumeCertification = () => {

        if (!inProgressAttempt?.id) {
            return;
        }

        navigate(
            `/user/certifications/${id}/exam/${inProgressAttempt.id}`
        );
    };

    // ============================================================
    // VIEW RESULT
    // ============================================================

    const handleViewResult = () => {

        const attempt =
            completedAttempt ||
            latestAttempt;

        if (!attempt?.id) {
            return;
        }

        navigate(
            `/user/certifications/${id}/result/${attempt.id}`
        );
    };

    // ============================================================
    // BACK
    // ============================================================

    const handleBack = () => {
        navigate("/user/certifications");
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="certification-details-page">

                <div className="details-loading">

                    <div className="details-spinner"></div>

                    <p>
                        Loading certification...
                    </p>

                </div>

            </div>
        );
    }

    // ============================================================
    // LOAD ERROR
    // ============================================================

    if (error && !certification) {
        return (
            <div className="certification-details-page">

                <div className="details-error">

                    <div className="details-error-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to Load Certification
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        className="back-certifications-button"
                        onClick={handleBack}
                    >
                        ← Back to Certifications
                    </button>

                </div>

            </div>
        );
    }

    if (!certification) {
        return null;
    }

    // ============================================================
    // START CARD STATE
    // ============================================================

    let startCardTitle =
        "Ready to Start?";

    let startCardNote =
        "Make sure you are ready before starting. The timer begins immediately.";

    if (inProgressAttempt) {

        startCardTitle =
            "Certification In Progress";

        startCardNote =
            "You already have an active attempt. Continue your certification from where you left off.";

    } else if (retakeNotAllowed) {

        startCardTitle =
            "Certification Already Attempted";

        startCardNote =
            "You have already attempted this certification. Retake is not allowed.";

    } else if (hasReachedAttemptLimit) {

        startCardTitle =
            "Maximum Attempts Reached";

        startCardNote =
            `You have used all ${maxAttempts} allowed attempts for this certification.`;

    } else if (canRetake) {

        startCardTitle =
            "Ready for Another Attempt?";

        startCardNote =
            `You have ${remainingAttempts} attempt${
                remainingAttempts !== 1
                    ? "s"
                    : ""
            } remaining.`;
    }

    // ============================================================
    // PAGE
    // ============================================================

    return (
        <div className="certification-details-page">

            {/* NAVBAR */}

            <nav className="certification-details-navbar">

                <div
                    className="details-logo"
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    <span className="details-logo-icon">
                        ⚡
                    </span>

                    <span>
                        CodeSprint
                    </span>
                </div>

                <div className="details-nav-actions">

                    <button
                        className="details-nav-button"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        Dashboard
                    </button>

                    <button
                        className="details-nav-button"
                        onClick={() =>
                            navigate("/user/problems")
                        }
                    >
                        Problems
                    </button>

                    <button
                        className="details-nav-button active"
                        onClick={() =>
                            navigate("/user/certifications")
                        }
                    >
                        Certifications
                    </button>

                    <button
                        className="details-profile-button"
                        onClick={() =>
                            navigate("/user/profile")
                        }
                    >
                        Profile
                    </button>

                </div>
            </nav>

            {/* MAIN */}

            <main className="certification-details-main">

                <button
                    className="details-back-button"
                    onClick={handleBack}
                >
                    ← Back to Certifications
                </button>

                {/* INLINE ERROR */}

                {error && (
                    <div className="details-inline-error">

                        <span>
                            ⚠️
                        </span>

                        <span>
                            {error}
                        </span>

                    </div>
                )}

                {/* CERTIFICATION HERO */}

                <section className="certification-hero">

                    <div className="hero-icon">
                        🎓
                    </div>

                    <div className="hero-content">

                        <div className="hero-badges">

                            <span className="hero-category">
                                {certification.category}
                            </span>

                            <span
                                className={`hero-difficulty ${
                                    certification.difficulty
                                        ?.toLowerCase()
                                        .replace(/\s+/g, "-")
                                }`}
                            >
                                {certification.difficulty}
                            </span>

                            <span className="hero-status">
                                {certification.status}
                            </span>

                        </div>

                        <h1>
                            {certification.title}
                        </h1>

                        <p>
                            {certification.description}
                        </p>

                    </div>
                </section>

                {/* INFORMATION CARDS */}

                <section className="certification-stats">

                    <div className="detail-stat-card">

                        <div className="stat-icon">
                            📚
                        </div>

                        <div>
                            <span>
                                Coding Questions
                            </span>

                            <strong>
                                {certification.totalQuestions}
                            </strong>
                        </div>

                    </div>

                    <div className="detail-stat-card">

                        <div className="stat-icon">
                            ⏱️
                        </div>

                        <div>
                            <span>
                                Duration
                            </span>

                            <strong>
                                {certification.durationMinutes} Minutes
                            </strong>
                        </div>

                    </div>

                    <div className="detail-stat-card">

                        <div className="stat-icon">
                            🎯
                        </div>

                        <div>
                            <span>
                                Passing Score
                            </span>

                            <strong>
                                {certification.passingPercentage}%
                            </strong>
                        </div>

                    </div>

                </section>

                {/* CONTENT */}

                <section className="certification-content">

                    {/* INSTRUCTIONS */}

                    <div className="instructions-card">

                        <h2>
                            📋 Certification Instructions
                        </h2>

                        <div className="instruction-list">

                            <div className="instruction-item">
                                <span>1</span>

                                <p>
                                    Read each coding problem carefully before writing your solution.
                                </p>
                            </div>

                            <div className="instruction-item">
                                <span>2</span>

                                <p>
                                    Write your solution in the programming language selected during the certification.
                                </p>
                            </div>

                            <div className="instruction-item">
                                <span>3</span>

                                <p>
                                    Your submitted code will be executed against the available test cases.
                                </p>
                            </div>

                            <div className="instruction-item">
                                <span>4</span>

                                <p>
                                    Complete all coding questions within the allotted{" "}
                                    <strong>
                                        {certification.durationMinutes} minutes
                                    </strong>.
                                </p>
                            </div>

                            <div className="instruction-item">
                                <span>5</span>

                                <p>
                                    You must achieve at least{" "}
                                    <strong>
                                        {certification.passingPercentage}%
                                    </strong>{" "}
                                    to pass the certification.
                                </p>
                            </div>

                            <div className="instruction-item">
                                <span>6</span>

                                <p>
                                    A certificate will be generated automatically when you pass for the first time.
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* START / RESUME / RESULT CARD */}

                    <div className="start-certification-card">

                        <div className="start-card-icon">
                            💻
                        </div>

                        <div className="start-card-content">

                            <h2>
                                {startCardTitle}
                            </h2>

                            <p>
                                This certification contains{" "}
                                <strong>
                                    {certification.totalQuestions}
                                </strong>{" "}
                                coding question
                                {certification.totalQuestions !== 1
                                    ? "s"
                                    : ""}
                                {" "}and you will have{" "}
                                <strong>
                                    {certification.durationMinutes} minutes
                                </strong>{" "}
                                to complete it.
                            </p>

                            <p className="start-card-note">
                                {startCardNote}
                            </p>

                            <p className="start-card-note">
                                Attempts:{" "}
                                <strong>
                                    {attemptCount}
                                </strong>
                                {" / "}
                                <strong>
                                    {maxAttempts}
                                </strong>
                            </p>

                            {allowRetake &&
                                !inProgressAttempt &&
                                remainingAttempts > 0 && (
                                    <p className="start-card-note">
                                        Remaining:{" "}
                                        <strong>
                                            {remainingAttempts}
                                        </strong>
                                    </p>
                                )}

                        </div>

                        {/* ACTIVE ATTEMPT */}

                        {inProgressAttempt ? (

                            <button
                                className="start-certification-button"
                                onClick={handleResumeCertification}
                            >
                                Resume Certification
                                <span>→</span>
                            </button>

                        ) : retakeNotAllowed ||
                            hasReachedAttemptLimit ? (

                            completedAttempt ? (

                                <button
                                    className="start-certification-button"
                                    onClick={handleViewResult}
                                >
                                    View Result
                                    <span>→</span>
                                </button>

                            ) : (

                                <button
                                    className="start-certification-button"
                                    disabled
                                >
                                    No Attempts Available
                                </button>

                            )

                        ) : (

                            <button
                                className="start-certification-button"
                                onClick={handleStartCertification}
                                disabled={starting}
                            >
                                {starting ? (
                                    <>
                                        <span className="button-spinner"></span>
                                        Starting...
                                    </>
                                ) : (
                                    <>
                                        {hasPreviousAttempt
                                            ? "Retake Certification"
                                            : "Start Certification"}

                                        <span>→</span>
                                    </>
                                )}
                            </button>

                        )}

                    </div>

                </section>

            </main>

        </div>
    );
}

export default CertificationDetails;