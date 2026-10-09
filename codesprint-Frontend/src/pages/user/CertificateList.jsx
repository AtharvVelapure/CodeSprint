import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CertificationList.css";

const API_URL = "/api";

const CertificationList = () => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("certifications");

    const [certifications, setCertifications] = useState([]);
    const [certificates, setCertificates] = useState([]);

    const [loading, setLoading] = useState(true);
    const [certificatesLoading, setCertificatesLoading] =
        useState(false);

    const [error, setError] = useState("");
    const [certificateError, setCertificateError] =
        useState("");

    const [user, setUser] = useState(null);

    // ============================================================
    // LOAD USER
    // ============================================================

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            navigate("/login");
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);

            if (!parsedUser?.id) {
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            setUser(parsedUser);

        } catch (error) {
            console.error(
                "Invalid user data:",
                error
            );

            localStorage.removeItem("user");
            navigate("/login");
        }

        fetchCertifications();
    }, [navigate]);

    // ============================================================
    // ERROR MESSAGE
    // ============================================================

    const getErrorMessage = (
        error,
        fallbackMessage
    ) => {
        const data = error.response?.data;

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
    // FETCH CERTIFICATIONS
    // ============================================================

    const fetchCertifications = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API_URL}/certifications`
            );

            setCertifications(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {
            console.error(
                "Error fetching certifications:",
                error
            );

            setError(
                getErrorMessage(
                    error,
                    "Unable to load certifications."
                )
            );

        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // FETCH CERTIFICATES
    // ============================================================

    const fetchCertificates = async () => {
        if (!user?.id) {
            return;
        }

        try {
            setCertificatesLoading(true);
            setCertificateError("");

            const response = await axios.get(
                `${API_URL}/certificates/user/${user.id}`
            );

            setCertificates(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {
            console.error(
                "Error fetching certificates:",
                error
            );

            setCertificateError(
                getErrorMessage(
                    error,
                    "Unable to load your certificates."
                )
            );

        } finally {
            setCertificatesLoading(false);
        }
    };

    // ============================================================
    // TAB CHANGE
    // ============================================================

    const handleTabChange = (tab) => {
        setActiveTab(tab);

        if (
            tab === "certificates" &&
            certificates.length === 0
        ) {
            fetchCertificates();
        }
    };

    // ============================================================
    // LOGOUT
    // ============================================================

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        navigate("/login");
    };

    // ============================================================
    // DATE FORMAT
    // ============================================================

    const formatDate = (dateString) => {
        if (!dateString) {
            return "—";
        }

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    // ============================================================
    // OPEN CERTIFICATION
    // ============================================================

    const handleViewCertification = (
        certificationId
    ) => {
        navigate(
            `/user/certifications/${certificationId}`
        );
    };

    // ============================================================
    // OPEN CERTIFICATE
    // ============================================================

    const handleViewCertificate = (
        certificateId
    ) => {
        navigate(
            `/user/certificates/${certificateId}`
        );
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="certification-page">

            {/* ====================================================
                NAVBAR
            ==================================================== */}

            <nav className="certification-navbar">

                {/* Logo */}

                <div
                    className="certification-logo"
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    <span className="logo-icon">
                        ⚡
                    </span>

                    <span>
                        CodeSprint
                    </span>
                </div>

                {/* Navigation */}

                <div className="certification-nav-links">

                    <button
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        Dashboard
                    </button>

                    <button
                        onClick={() =>
                            navigate("/user/problems")
                        }
                    >
                        Problems
                    </button>

                    <button className="active">
                        Certifications
                    </button>

                    <button
                        onClick={() =>
                            navigate("/user/profile")
                        }
                    >
                        Profile
                    </button>

                </div>

                {/* User */}

                <div className="certification-nav-right">

                    <div className="certification-user">

                        <div className="user-avatar">
                            {user?.name
                                ? user.name
                                      .charAt(0)
                                      .toUpperCase()
                                : "U"}
                        </div>

                        <span>
                            {user?.name || "User"}
                        </span>

                    </div>

                    <button
                        className="certification-logout"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </nav>

            {/* ====================================================
                MAIN
            ==================================================== */}

            <main className="certification-main">

                {/* Header */}

                <div className="certification-header">

                    <div>

                        <div className="page-breadcrumb">
                            Dashboard / Certifications
                        </div>

                        <h1>
                            Certifications
                        </h1>

                        <p>
                            Test your coding skills,
                            earn certifications,
                            and showcase your achievements.
                        </p>

                    </div>

                </div>

                {/* =================================================
                    TABS
                ================================================= */}

                <div className="certification-tabs">

                    {/* Available Certifications */}

                    <button
                        className={
                            activeTab === "certifications"
                                ? "certification-tab active"
                                : "certification-tab"
                        }
                        onClick={() =>
                            handleTabChange(
                                "certifications"
                            )
                        }
                    >
                        <span className="tab-icon">
                            🎓
                        </span>

                        Available Certifications
                    </button>

                    {/* My Certificates */}

                    <button
                        className={
                            activeTab === "certificates"
                                ? "certification-tab active"
                                : "certification-tab"
                        }
                        onClick={() =>
                            handleTabChange(
                                "certificates"
                            )
                        }
                    >
                        <span className="tab-icon">
                            📜
                        </span>

                        My Certificates

                        {certificates.length > 0 && (
                            <span className="certificate-count">
                                {certificates.length}
                            </span>
                        )}

                    </button>

                </div>

                {/* =================================================
                    AVAILABLE CERTIFICATIONS
                ================================================= */}

                {activeTab === "certifications" && (

                    <section className="certification-section">

                        {/* Loading */}

                        {loading && (
                            <div className="certification-loading">

                                <div className="loading-spinner"></div>

                                <p>
                                    Loading certifications...
                                </p>

                            </div>
                        )}

                        {/* Error */}

                        {error && !loading && (

                            <div className="certification-error">

                                <span>
                                    ⚠️
                                </span>

                                <p>
                                    {error}
                                </p>

                                <button
                                    onClick={
                                        fetchCertifications
                                    }
                                >
                                    Try Again
                                </button>

                            </div>
                        )}

                        {/* Empty */}

                        {!loading &&
                            !error &&
                            certifications.length === 0 && (

                                <div className="certification-empty">

                                    <div className="empty-icon">
                                        🎓
                                    </div>

                                    <h2>
                                        No Certifications Available
                                    </h2>

                                    <p>
                                        There are currently no
                                        active certifications available.
                                    </p>

                                </div>
                            )}

                        {/* Certification Grid */}

                        {!loading &&
                            !error &&
                            certifications.length > 0 && (

                                <div className="certification-grid">

                                    {certifications.map(
                                        (certification) => (

                                            <div
                                                className="certification-card"
                                                key={
                                                    certification.id
                                                }
                                            >

                                                {/* Card Top */}

                                                <div className="card-top">

                                                    <div className="certification-icon">
                                                        🎓
                                                    </div>

                                                    <span
                                                        className={`difficulty-badge ${
                                                            certification.difficulty
                                                                ?.toLowerCase()
                                                                .replace(
                                                                    /\s+/g,
                                                                    "-"
                                                                )
                                                        }`}
                                                    >
                                                        {
                                                            certification.difficulty
                                                        }
                                                    </span>

                                                </div>

                                                {/* Card Content */}

                                                <div className="card-content">

                                                    <span className="category">
                                                        {
                                                            certification.category
                                                        }
                                                    </span>

                                                    <h2>
                                                        {
                                                            certification.title
                                                        }
                                                    </h2>

                                                    <p className="description">
                                                        {
                                                            certification.description
                                                        }
                                                    </p>

                                                    {/* Information */}

                                                    <div className="certification-info">

                                                        {/* Questions */}

                                                        <div className="info-item">

                                                            <span className="info-icon">
                                                                📝
                                                            </span>

                                                            <div>

                                                                <small>
                                                                    Coding Questions
                                                                </small>

                                                                <strong>
                                                                    {
                                                                        certification.totalQuestions
                                                                    }
                                                                </strong>

                                                            </div>

                                                        </div>

                                                        {/* Duration */}

                                                        <div className="info-item">

                                                            <span className="info-icon">
                                                                ⏱️
                                                            </span>

                                                            <div>

                                                                <small>
                                                                    Duration
                                                                </small>

                                                                <strong>
                                                                    {
                                                                        certification.durationMinutes
                                                                    }{" "}
                                                                    min
                                                                </strong>

                                                            </div>

                                                        </div>

                                                        {/* Passing */}

                                                        <div className="info-item">

                                                            <span className="info-icon">
                                                                🎯
                                                            </span>

                                                            <div>

                                                                <small>
                                                                    Passing
                                                                </small>

                                                                <strong>
                                                                    {
                                                                        certification.passingPercentage
                                                                    }%
                                                                </strong>

                                                            </div>

                                                        </div>

                                                    </div>

                                                    {/* View Button */}

                                                    <button
                                                        className="view-certification-button"
                                                        onClick={() =>
                                                            handleViewCertification(
                                                                certification.id
                                                            )
                                                        }
                                                    >
                                                        View Certification

                                                        <span>
                                                            →
                                                        </span>

                                                    </button>

                                                </div>

                                            </div>
                                        )
                                    )}

                                </div>
                            )}

                    </section>
                )}

                {/* =================================================
                    MY CERTIFICATES
                ================================================= */}

                {activeTab === "certificates" && (

                    <section className="certificate-section">

                        {/* Certificate Header */}

                        <div className="certificate-section-header">

                            <div>

                                <h2>
                                    My Certificates
                                </h2>

                                <p>
                                    View and showcase the
                                    certifications you have
                                    successfully completed.
                                </p>

                            </div>

                            <div className="certificate-total">

                                <span>
                                    🏆
                                </span>

                                <strong>
                                    {certificates.length}
                                </strong>

                                <small>
                                    Certificate
                                    {certificates.length !== 1
                                        ? "s"
                                        : ""}
                                </small>

                            </div>

                        </div>

                        {/* Loading */}

                        {certificatesLoading && (

                            <div className="certification-loading">

                                <div className="loading-spinner"></div>

                                <p>
                                    Loading your certificates...
                                </p>

                            </div>
                        )}

                        {/* Error */}

                        {certificateError &&
                            !certificatesLoading && (

                                <div className="certification-error">

                                    <span>
                                        ⚠️
                                    </span>

                                    <p>
                                        {certificateError}
                                    </p>

                                    <button
                                        onClick={
                                            fetchCertificates
                                        }
                                    >
                                        Try Again
                                    </button>

                                </div>
                            )}

                        {/* Empty */}

                        {!certificatesLoading &&
                            !certificateError &&
                            certificates.length === 0 && (

                                <div className="certificate-empty">

                                    <div className="empty-certificate-icon">
                                        📜
                                    </div>

                                    <h2>
                                        No Certificates Yet
                                    </h2>

                                    <p>
                                        Complete a certification
                                        and pass the required score
                                        to earn your first certificate.
                                    </p>

                                    <button
                                        className="browse-certifications-button"
                                        onClick={() =>
                                            handleTabChange(
                                                "certifications"
                                            )
                                        }
                                    >
                                        Browse Certifications
                                    </button>

                                </div>
                            )}

                        {/* Certificate Grid */}

                        {!certificatesLoading &&
                            !certificateError &&
                            certificates.length > 0 && (

                                <div className="certificate-grid">

                                    {certificates.map(
                                        (certificate) => (

                                            <div
                                                className="certificate-card"
                                                key={
                                                    certificate.id
                                                }
                                            >

                                                {/* Card Top */}

                                                <div className="certificate-card-top">

                                                    <div className="certificate-emblem">
                                                        🏆
                                                    </div>

                                                    <span className="verified-badge">
                                                        ✓ Verified
                                                    </span>

                                                </div>

                                                {/* Card Content */}

                                                <div className="certificate-card-content">

                                                    <span className="certificate-label">
                                                        CERTIFICATE OF
                                                        COMPLETION
                                                    </span>

                                                    <h2>
                                                        {
                                                            certificate.certificationTitle
                                                        }
                                                    </h2>

                                                    {/* Recipient */}

                                                    <div className="certificate-recipient">

                                                        <small>
                                                            Awarded to
                                                        </small>

                                                        <strong>
                                                            {
                                                                certificate.userName
                                                            }
                                                        </strong>

                                                    </div>

                                                    {/* Certificate Details */}

                                                    <div className="certificate-details">

                                                        {/* Certificate Type */}

                                                        <div>

                                                            <small>
                                                                Type
                                                            </small>

                                                            <strong>
                                                                Certification
                                                            </strong>

                                                        </div>

                                                        {/* Issue Date */}

                                                        <div>

                                                            <small>
                                                                Issued
                                                            </small>

                                                            <strong>
                                                                {formatDate(
                                                                    certificate.issuedAt
                                                                )}
                                                            </strong>

                                                        </div>

                                                    </div>

                                                    {/* Certificate Number */}

                                                    <div className="certificate-number">

                                                        <span>
                                                            Certificate No.
                                                        </span>

                                                        <strong>
                                                            {
                                                                certificate.certificateNumber
                                                            }
                                                        </strong>

                                                    </div>

                                                    {/* View */}

                                                    <button
                                                        className="view-certificate-button"
                                                        onClick={() =>
                                                            handleViewCertificate(
                                                                certificate.id
                                                            )
                                                        }
                                                    >
                                                        View Certificate

                                                        <span>
                                                            →
                                                        </span>

                                                    </button>

                                                </div>

                                            </div>
                                        )
                                    )}

                                </div>
                            )}

                    </section>
                )}

            </main>

        </div>
    );
};

export default CertificationList;