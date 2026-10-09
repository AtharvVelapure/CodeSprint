import React, {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import "./AssessmentCandidateEntry.css";

const API_BASE_URL = "";

const AssessmentCandidateEntry = () => {

    const navigate = useNavigate();

    const {
        invitationToken
    } = useParams();

    const [
        assessment,
        setAssessment
    ] = useState(null);

    const [
        candidateName,
        setCandidateName
    ] = useState("");

    const [
        candidateEmail,
        setCandidateEmail
    ] = useState("");

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        starting,
        setStarting
    ] = useState(false);

    const [
        errorMessage,
        setErrorMessage
    ] = useState("");

    // =====================================================
    // LOAD ASSESSMENT
    // =====================================================

    useEffect(() => {

        const loadAssessment = async () => {

            if (!invitationToken) {

                setErrorMessage(
                    "Assessment invitation link is invalid."
                );

                setLoading(false);

                return;
            }

            try {

                setLoading(true);

                setErrorMessage("");

                const response = await fetch(
                    `${API_BASE_URL}/api/assessment-candidates/${invitationToken}`
                );

                const text =
                    await response.text();

                if (!response.ok) {

                    throw new Error(
                        text ||
                        "Unable to load assessment."
                    );
                }

                let data;

                try {

                    data = JSON.parse(text);

                } catch {

                    throw new Error(
                        "Invalid assessment response received from the server."
                    );
                }

                setAssessment(data);

                // =============================================
                // EXISTING CODESPRINT USER
                // =============================================

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

                console.error(
                    "Failed to load assessment:",
                    error
                );

                setAssessment(null);

                setErrorMessage(
                    error.message ||
                    "Unable to load assessment."
                );

            } finally {

                setLoading(false);
            }
        };

        loadAssessment();

    }, [invitationToken]);

    // =====================================================
    // CONTINUE TO INSTRUCTIONS
    // =====================================================

    const handleContinue = (
        event
    ) => {

        event.preventDefault();

        setErrorMessage("");

        const name =
            candidateName.trim();

        const email =
            candidateEmail.trim();

        if (!name) {

            setErrorMessage(
                "Please enter your full name."
            );

            return;
        }

        if (!email) {

            setErrorMessage(
                "Please enter your email address."
            );

            return;
        }

        if (!assessment) {

            setErrorMessage(
                "Assessment information is unavailable."
            );

            return;
        }

        setStarting(true);

        // =============================================
        // MOVE TO ASSESSMENT INSTRUCTIONS
        // =============================================

        navigate(
            `/assessment/invite/${invitationToken}/instructions`,
            {
                state: {
                    candidateName: name,
                    candidateEmail: email,
                    assessment: assessment
                }
            }
        );
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="candidate-entry-page">

                <div className="candidate-entry-loading">

                    <div className="candidate-entry-spinner">
                    </div>

                    <p>
                        Loading assessment...
                    </p>

                </div>

            </div>
        );
    }

    // =====================================================
    // ERROR
    // =====================================================

    if (
        errorMessage &&
        !assessment
    ) {

        return (
            <div className="candidate-entry-page">

                <div className="candidate-entry-error-card">

                    <div className="candidate-entry-logo">
                        CodeSprint
                    </div>

                    <div className="candidate-error-icon">
                        ⚠
                    </div>

                    <h1>
                        Assessment Unavailable
                    </h1>

                    <p>
                        {errorMessage}
                    </p>

                    <button
                        type="button"
                        className="candidate-secondary-button"
                        onClick={() =>
                            navigate("/")
                        }
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
        <div className="candidate-entry-page">

            <div className="candidate-entry-container">

                {/* ============================================= */}
                {/* LOGO */}
                {/* ============================================= */}

                <div className="candidate-entry-brand">

                    <div className="candidate-entry-brand-mark">
                        C
                    </div>

                    <span>
                        CodeSprint
                    </span>

                </div>

                {/* ============================================= */}
                {/* ASSESSMENT CARD */}
                {/* ============================================= */}

                <div className="candidate-entry-card">

                    {/* COMPANY */}

                    <div className="candidate-company-section">

                        <div className="candidate-company-icon">
                            💼
                        </div>

                        <div>

                            <h1>
                                {assessment?.companyName}
                            </h1>

                            <p>
                                Coding Assessment
                            </p>

                        </div>

                    </div>

                    {/* POSITION */}

                    <div className="candidate-position">

                        <span className="candidate-label">
                            Position
                        </span>

                        <strong>
                            {assessment?.position}
                        </strong>

                    </div>

                    {/* ============================================= */}
                    {/* ASSESSMENT DETAILS */}
                    {/* ============================================= */}

                    <div className="candidate-assessment-details">

                        <div className="candidate-detail">

                            <span className="candidate-detail-icon">
                                ⏱
                            </span>

                            <div>

                                <span>
                                    Duration
                                </span>

                                <strong>
                                    {assessment?.durationMinutes} minutes
                                </strong>

                            </div>

                        </div>

                        <div className="candidate-detail">

                            <span className="candidate-detail-icon">
                                📝
                            </span>

                            <div>

                                <span>
                                    Questions
                                </span>

                                <strong>
                                    {assessment?.numberOfQuestions ?? 0}
                                </strong>

                            </div>

                        </div>

                        <div className="candidate-detail">

                            <span className="candidate-detail-icon">
                                🔒
                            </span>

                            <div>

                                <span>
                                    Secure Test
                                </span>

                                <strong>
                                    {assessment?.fullscreenRequired
                                        ? "Fullscreen"
                                        : "Standard"}
                                </strong>

                            </div>

                        </div>

                    </div>

                    {/* ============================================= */}
                    {/* CANDIDATE FORM */}
                    {/* ============================================= */}

                    <div className="candidate-form-section">

                        <div className="candidate-form-heading">

                            <h2>
                                Candidate Information
                            </h2>

                            <p>
                                Enter your details to continue
                                to the assessment.
                            </p>

                        </div>

                        {errorMessage && (

                            <div className="candidate-entry-error">

                                <span>
                                    ⚠
                                </span>

                                <span>
                                    {errorMessage}
                                </span>

                            </div>

                        )}

                        <form
                            onSubmit={
                                handleContinue
                            }
                        >

                            {/* NAME */}

                            <div className="candidate-input-group">

                                <label htmlFor="candidateName">
                                    Full Name
                                </label>

                                <input
                                    id="candidateName"
                                    type="text"
                                    value={
                                        candidateName
                                    }
                                    onChange={(event) =>
                                        setCandidateName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your full name"
                                    disabled={
                                        !!assessment?.candidateName
                                    }
                                    autoComplete="name"
                                />

                            </div>

                            {/* EMAIL */}

                            <div className="candidate-input-group">

                                <label htmlFor="candidateEmail">
                                    Email Address
                                </label>

                                <input
                                    id="candidateEmail"
                                    type="email"
                                    value={
                                        candidateEmail
                                    }
                                    onChange={(event) =>
                                        setCandidateEmail(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your email address"
                                    disabled={
                                        !!assessment?.candidateEmail
                                    }
                                    autoComplete="email"
                                />

                            </div>

                            {/* ACCOUNT NOTE */}

                            <div className="candidate-account-note">

                                <span>
                                    ℹ
                                </span>

                                <p>
                                    You do not need a CodeSprint
                                    account to take this assessment.
                                </p>

                            </div>

                            {/* CONTINUE */}

                            <button
                                type="submit"
                                className="candidate-continue-button"
                                disabled={
                                    starting
                                }
                            >
                                {starting
                                    ? "Loading..."
                                    : "Continue to Assessment →"}
                            </button>

                        </form>

                    </div>

                </div>

                {/* ============================================= */}
                {/* FOOTER */}
                {/* ============================================= */}

                <p className="candidate-entry-footer">
                    Powered by CodeSprint
                </p>

            </div>

        </div>
    );
};

export default AssessmentCandidateEntry;