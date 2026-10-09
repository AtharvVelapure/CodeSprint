import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./CertificationResult.css";

const CERTIFICATION_API = "/api/certifications";
const CERTIFICATE_API = "/api/certificates";

function CertificationResult() {
    const { id, attemptId } = useParams();
    const navigate = useNavigate();

    const [result, setResult] = useState(null);
    const [certification, setCertification] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [certificate, setCertificate] = useState(null);

    const [loading, setLoading] = useState(true);
    const [certificateLoading, setCertificateLoading] =
        useState(false);

    const [error, setError] = useState("");

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

        if (err.message) {
            return err.message;
        }

        return fallbackMessage;
    };

    // ============================================================
    // GET STORED USER
    // ============================================================

    const getStoredUser = () => {
        try {
            const storedUser =
                localStorage.getItem("user");

            if (!storedUser) {
                return null;
            }

            return JSON.parse(storedUser);

        } catch (error) {
            console.error(
                "Unable to read stored user:",
                error
            );

            return null;
        }
    };

    // ============================================================
    // LOAD RESULT PAGE
    // ============================================================

    useEffect(() => {
        loadResult();
    }, [id, attemptId]);

    const loadResult = async () => {
        try {
            setLoading(true);
            setError("");
            setCertificate(null);

            const user = getStoredUser();

            if (!user?.id) {
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            /*
             * Backend remains the source of truth.
             *
             * Load:
             * 1. Certification configuration
             * 2. Current attempt result
             * 3. All attempts for this user
             */
            const [
                certificationResponse,
                resultResponse,
                attemptsResponse
            ] = await Promise.all([

                axios.get(
                    `${CERTIFICATION_API}/${id}`
                ),

                axios.get(
                    `${CERTIFICATION_API}/attempts/${attemptId}`
                ),

                axios.get(
                    `${CERTIFICATION_API}/user/${user.id}/attempts`
                )

            ]);

            const certificationData =
                certificationResponse.data;

            const resultData =
                resultResponse.data;

            const allAttempts =
                Array.isArray(
                    attemptsResponse.data
                )
                    ? attemptsResponse.data
                    : [];

            /*
             * Security / consistency check on frontend.
             *
             * Backend should also enforce ownership.
             */
            if (
                Number(resultData?.certificationId) !==
                Number(id)
            ) {
                throw new Error(
                    "This attempt does not belong to the selected certification."
                );
            }

            /*
             * Only attempts belonging to this certification
             * count toward its attempt limit.
             */
            const certificationAttempts =
                allAttempts.filter(
                    (attempt) =>
                        Number(
                            attempt.certificationId
                        ) === Number(id)
                );

            setCertification(
                certificationData
            );

            setResult(
                resultData
            );

            setAttempts(
                certificationAttempts
            );

            /*
             * Keep session storage synchronized with
             * authoritative backend data.
             */
            sessionStorage.setItem(
                `certification-result-${attemptId}`,
                JSON.stringify(
                    resultData
                )
            );

            // ====================================================
            // FIND EARNED CERTIFICATE
            // ====================================================

            /*
             * Certificate is generated only once for a
             * user + certification.
             *
             * Therefore a later passing attempt may have:
             *
             * certificateId = null
             *
             * even though the user already owns a certificate.
             *
             * Search the attempt history for the attempt that
             * originally earned the certificate.
             */

            let certificateId =
                resultData?.certificateId || null;

            if (!certificateId) {

                const certificateAttempt =
                    certificationAttempts.find(
                        (attempt) =>
                            attempt.certificateId != null
                    );

                certificateId =
                    certificateAttempt?.certificateId ||
                    null;
            }

            if (certificateId) {

                await loadCertificate(
                    certificateId
                );

            } else {

                setCertificate(null);
            }

        } catch (err) {

            console.error(
                "Error loading certification result:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to load certification result."
                )
            );

        } finally {

            setLoading(false);
        }
    };

    // ============================================================
    // LOAD CERTIFICATE
    // ============================================================

    const loadCertificate = async (
        certificateId
    ) => {
        try {
            setCertificateLoading(true);

            const response =
                await axios.get(
                    `${CERTIFICATE_API}/${certificateId}`
                );

            setCertificate(
                response.data
            );

        } catch (err) {

            console.error(
                "Error loading certificate:",
                err
            );

            setCertificate(null);

        } finally {

            setCertificateLoading(false);
        }
    };

    // ============================================================
    // NAVIGATION
    // ============================================================

    const handleCertifications = () => {
        navigate(
            "/user/certifications"
        );
    };

    const handleDashboard = () => {
        navigate(
            "/dashboard"
        );
    };

    const handleCertificates = () => {
        navigate(
            "/user/certificates"
        );
    };

    const handleViewCertificate = () => {

        if (!certificate?.id) {
            return;
        }

        navigate(
            `/user/certificates/${certificate.id}`
        );
    };

    /*
     * Retake goes through CertificationDetails.
     *
     * We do NOT create an attempt directly from
     * the result page.
     */
    const handleRetake = () => {
        navigate(
            `/user/certifications/${id}`
        );
    };

    // ============================================================
    // DATE FORMAT
    // ============================================================

    const formatDate = (
        dateString
    ) => {

        if (!dateString) {
            return "-";
        }

        const date =
            new Date(dateString);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return dateString;
        }

        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="certification-result-page">

                <div className="result-loading">

                    <div className="result-spinner"></div>

                    <p>
                        Loading your result...
                    </p>

                </div>

            </div>
        );
    }

    // ============================================================
    // ERROR
    // ============================================================

    if (
        error ||
        !result
    ) {
        return (
            <div className="certification-result-page">

                <div className="result-error">

                    <div className="result-error-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to Load Result
                    </h2>

                    <p>
                        {error ||
                            "Result not found."}
                    </p>

                    <button
                        onClick={
                            handleCertifications
                        }
                    >
                        Back to Certifications
                    </button>

                </div>

            </div>
        );
    }

    // ============================================================
    // RESULT DATA
    // ============================================================

    const status =
        String(
            result.status || ""
        ).toUpperCase();

    const passed =
        result.passed === true;

    const timeExpired =
        status === "TIME_EXPIRED";

    const completed =
        status === "COMPLETED";

    const inProgress =
        status === "IN_PROGRESS";

    const percentage =
        Number(
            result.percentage || 0
        );

    const correctAnswers =
        Number(
            result.correctAnswers || 0
        );

    const totalQuestions =
        Number(
            result.totalQuestions || 0
        );

    // ============================================================
    // RETAKE RULES
    // ============================================================

    const allowRetake =
        certification?.allowRetake === true;

    /*
     * Same rule used by CertificationDetails.
     *
     * If retake is disabled, effective maximum = 1.
     */
    const maxAttempts =
        allowRetake
            ? Number(
                certification?.maxAttempts || 1
            )
            : 1;

    const attemptCount =
        attempts.length;

    const attemptsRemaining =
        Math.max(
            maxAttempts - attemptCount,
            0
        );

    /*
     * IMPORTANT:
     *
     * PASS / FAIL / TIME_EXPIRED does NOT decide
     * whether another attempt is allowed.
     *
     * Only certification policy + attempt count does.
     */
    const canRetake =
        !inProgress &&
        allowRetake &&
        attemptCount > 0 &&
        attemptCount < maxAttempts;

    const maximumAttemptsReached =
        attemptCount >= maxAttempts;

    // ============================================================
    // HERO CONTENT
    // ============================================================

    let heroLabel =
        "Certification Completed";

    let heroTitle =
        "Certification Not Passed";

    let heroMessage =
        "Review the topics and continue improving your skills.";

    let heroIcon =
        "📚";

    if (passed) {

        heroLabel =
            "Certification Completed";

        heroTitle =
            "Congratulations!";

        heroMessage =
            "You successfully passed the certification.";

        heroIcon =
            "🏆";

    } else if (timeExpired) {

        heroLabel =
            "Certification Attempt Ended";

        heroTitle =
            "Certification Time Expired";

        heroMessage =
            "The certification time limit was reached before the attempt was completed.";

        heroIcon =
            "⏱️";

    } else if (inProgress) {

        heroLabel =
            "Certification In Progress";

        heroTitle =
            "Attempt Not Completed";

        heroMessage =
            "This certification attempt is still in progress.";

        heroIcon =
            "💻";
    }

    // ============================================================
    // RESULT TEXT
    // ============================================================

    let resultText =
        "FAILED";

    if (passed) {

        resultText =
            "PASSED";

    } else if (timeExpired) {

        resultText =
            "TIME EXPIRED";

    } else if (inProgress) {

        resultText =
            "IN PROGRESS";
    }

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="certification-result-page">

            {/* ====================================================
                NAVBAR
            ==================================================== */}

            <nav className="result-navbar">

                <div
                    className="result-logo"
                    onClick={
                        handleDashboard
                    }
                >

                    <span>
                        ⚡
                    </span>

                    <span>
                        CodeSprint
                    </span>

                </div>

                <div className="result-nav-actions">

                    <button
                        className="result-nav-button"
                        onClick={
                            handleDashboard
                        }
                    >
                        Dashboard
                    </button>

                    <button
                        className="result-nav-button"
                        onClick={
                            handleCertifications
                        }
                    >
                        Certifications
                    </button>

                    <button
                        className="result-nav-button"
                        onClick={() =>
                            navigate(
                                "/user/problems"
                            )
                        }
                    >
                        Problems
                    </button>

                    <button
                        className="result-profile-button"
                        onClick={() =>
                            navigate(
                                "/user/profile"
                            )
                        }
                    >
                        Profile
                    </button>

                </div>

            </nav>

            {/* ====================================================
                MAIN
            ==================================================== */}

            <main className="result-main">

                {/* =================================================
                    RESULT HERO
                ================================================= */}

                <section
                    className={
                        `result-hero ${
                            passed
                                ? "passed"
                                : "failed"
                        }`
                    }
                >

                    <div className="result-status-icon">
                        {heroIcon}
                    </div>

                    <div className="result-status-content">

                        <span className="result-status-label">
                            {heroLabel}
                        </span>

                        <h1>
                            {heroTitle}
                        </h1>

                        <p>
                            {heroMessage}
                        </p>

                    </div>

                </section>

                {/* =================================================
                    SCORE
                ================================================= */}

                <section className="score-card">

                    <div className="score-circle">

                        <div className="score-circle-inner">

                            <strong>
                                {Math.round(
                                    percentage
                                )}
                                %
                            </strong>

                            <span>
                                Percentage
                            </span>

                        </div>

                    </div>

                    <div className="score-details">

                        <div className="score-item">

                            <span>
                                Correct Questions
                            </span>

                            <strong>
                                {correctAnswers}
                                {" / "}
                                {totalQuestions}
                            </strong>

                        </div>

                        <div className="score-item">

                            <span>
                                Passing Requirement
                            </span>

                            <strong>
                                {passed
                                    ? "Passed"
                                    : "Not Passed"}
                            </strong>

                        </div>

                        <div className="score-item">

                            <span>
                                Result
                            </span>

                            <strong
                                className={
                                    passed
                                        ? "passed-text"
                                        : "failed-text"
                                }
                            >
                                {resultText}
                            </strong>

                        </div>

                    </div>

                </section>

                {/* =================================================
                    ATTEMPT DETAILS
                ================================================= */}

                <section className="attempt-card">

                    <div className="section-heading">

                        <h2>
                            Attempt Details
                        </h2>

                    </div>

                    <div className="attempt-grid">

                        <div className="attempt-item">

                            <span>
                                Certification
                            </span>

                            <strong>
                                {
                                    result.certificationTitle
                                }
                            </strong>

                        </div>

                        <div className="attempt-item">

                            <span>
                                Total Questions
                            </span>

                            <strong>
                                {totalQuestions}
                            </strong>

                        </div>

                        <div className="attempt-item">

                            <span>
                                Correct Questions
                            </span>

                            <strong>
                                {correctAnswers}
                            </strong>

                        </div>

                        <div className="attempt-item">

                            <span>
                                Percentage
                            </span>

                            <strong>
                                {Math.round(
                                    percentage
                                )}
                                %
                            </strong>

                        </div>

                        <div className="attempt-item">

                            <span>
                                Started At
                            </span>

                            <strong>
                                {formatDate(
                                    result.startedAt
                                )}
                            </strong>

                        </div>

                        <div className="attempt-item">

                            <span>
                                Submitted At
                            </span>

                            <strong>
                                {formatDate(
                                    result.submittedAt
                                )}
                            </strong>

                        </div>

                        <div className="attempt-item">

                            <span>
                                Result
                            </span>

                            <strong
                                className={
                                    passed
                                        ? "passed-text"
                                        : "failed-text"
                                }
                            >
                                {resultText}
                            </strong>

                        </div>

                        <div className="attempt-item">

                            <span>
                                Attempts Used
                            </span>

                            <strong>
                                {attemptCount}
                                {" / "}
                                {maxAttempts}
                            </strong>

                        </div>

                    </div>

                </section>

                {/* =================================================
                    CERTIFICATE
                ================================================= */}

                {certificate && (

                    <section className="certificate-section">

                        <div className="certificate-header">

                            <div>

                                <span className="certificate-small-label">
                                    YOUR ACHIEVEMENT
                                </span>

                                <h2>
                                    🎓 Certificate Earned
                                </h2>

                                <p>
                                    You have successfully earned
                                    this certification.
                                </p>

                            </div>

                            <div className="certificate-trophy">
                                🏆
                            </div>

                        </div>

                        {certificateLoading ? (

                            <div className="certificate-loading">
                                Loading certificate...
                            </div>

                        ) : (

                            <div className="certificate-card">

                                <div className="certificate-top">

                                    <div className="certificate-emblem">
                                        ⚡
                                    </div>

                                    <div>

                                        <span>
                                            CODESPRINT
                                        </span>

                                        <h3>
                                            Certificate of Completion
                                        </h3>

                                    </div>

                                </div>

                                <div className="certificate-body">

                                    <p>
                                        This certificate is proudly
                                        presented to
                                    </p>

                                    <h2>
                                        {
                                            certificate.userName
                                        }
                                    </h2>

                                    <p>
                                        for successfully completing
                                    </p>

                                    <h3>
                                        {
                                            certificate.certificationTitle
                                        }
                                    </h3>

                                    <div className="certificate-completion-message">

                                        <span>
                                            ✓
                                        </span>

                                        <p>
                                            Successfully completed
                                            the certification requirements.
                                        </p>

                                    </div>

                                </div>

                                <div className="certificate-footer">

                                    <div>

                                        <span>
                                            Certificate Number
                                        </span>

                                        <strong>
                                            {
                                                certificate.certificateNumber
                                            }
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Issued
                                        </span>

                                        <strong>
                                            {formatDate(
                                                certificate.issuedAt
                                            )}
                                        </strong>

                                    </div>

                                    <div className="verified-badge">
                                        ✓ Verified
                                    </div>

                                </div>

                            </div>
                        )}

                        <div className="certificate-actions">

                            <button
                                className="view-certificate-button"
                                onClick={
                                    handleViewCertificate
                                }
                            >
                                View Certificate
                                <span>→</span>
                            </button>

                            <button
                                className="view-certificates-button"
                                onClick={
                                    handleCertificates
                                }
                            >
                                View My Certificates
                                <span>→</span>
                            </button>

                        </div>

                    </section>
                )}

                {/* =================================================
                    RETAKE / ATTEMPT STATUS
                ================================================= */}

                {!inProgress && (

                    <section className="retry-card">

                        <div className="retry-icon">

                            {passed
                                ? "🎯"
                                : timeExpired
                                    ? "⏱️"
                                    : "💪"}

                        </div>

                        <div className="retry-content">

                            <h2>

                                {canRetake
                                    ? passed
                                        ? "Want to Improve Your Score?"
                                        : "Ready for Another Attempt?"
                                    : passed
                                        ? "Certification Completed"
                                        : "Keep Learning!"}

                            </h2>

                            <p>

                                {canRetake
                                    ? `You have ${attemptsRemaining} ${
                                        attemptsRemaining === 1
                                            ? "attempt"
                                            : "attempts"
                                    } remaining.`
                                    : allowRetake &&
                                      maximumAttemptsReached
                                        ? "You have reached the maximum number of attempts for this certification."
                                        : allowRetake
                                            ? "No additional attempts are currently available."
                                            : "Retakes are not available for this certification."}

                            </p>

                        </div>

                        {canRetake && (

                            <button
                                onClick={
                                    handleRetake
                                }
                            >

                                {passed
                                    ? "Retake Certification"
                                    : "Try Again"}

                                <span>
                                    →
                                </span>

                            </button>
                        )}

                    </section>
                )}

                {/* =================================================
                    BOTTOM ACTIONS
                ================================================= */}

                <div className="result-bottom-actions">

                    <button
                        className="secondary-result-button"
                        onClick={
                            handleDashboard
                        }
                    >
                        ← Dashboard
                    </button>

                    <button
                        className="primary-result-button"
                        onClick={
                            handleCertifications
                        }
                    >
                        Browse Certifications

                        <span>
                            →
                        </span>

                    </button>

                </div>

            </main>

        </div>
    );
}

export default CertificationResult;