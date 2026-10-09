import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CertificationList.css";

const API_URL = "/api";

const CertificationList = () => {

    const navigate = useNavigate();

    // ========================================
    // STATE
    // ========================================

    const [activeTab, setActiveTab] = useState("certifications");

    const [certifications, setCertifications] = useState([]);
    const [certificates, setCertificates] = useState([]);

    const [loading, setLoading] = useState(true);
    const [certificatesLoading, setCertificatesLoading] = useState(false);

    const [error, setError] = useState("");
    const [certificateError, setCertificateError] = useState("");

    const [user, setUser] = useState(null);


    // ========================================
    // LOAD USER + CERTIFICATIONS
    // ========================================

    useEffect(() => {

        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            navigate("/login");
            return;
        }

        try {

            const parsedUser = JSON.parse(storedUser);

            setUser(parsedUser);

        } catch (error) {

            console.error(
                "Invalid user data:",
                error
            );

            navigate("/login");

            return;
        }

        fetchCertifications();

    }, [navigate]);


    // ========================================
    // FETCH CERTIFICATIONS
    // ========================================

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
                error.response?.data?.message ||
                "Unable to load certifications."
            );

        } finally {

            setLoading(false);

        }
    };


    // ========================================
    // FETCH USER CERTIFICATES
    // ========================================

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
                error.response?.data?.message ||
                "Unable to load your certificates."
            );

        } finally {

            setCertificatesLoading(false);

        }
    };


    // ========================================
    // TAB CHANGE
    // ========================================

    const handleTabChange = (tab) => {

        setActiveTab(tab);

        if (
            tab === "certificates" &&
            certificates.length === 0
        ) {
            fetchCertificates();
        }
    };


    // ========================================
    // FORMAT DATE
    // ========================================

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


    // ========================================
    // MAIN UI
    // ========================================

    return (

        <div className="certification-page">

            <main className="certification-main">

                {/* ========================================
                    HEADER
                ======================================== */}

                <div className="certification-header">

                    <div>

                        <div className="page-breadcrumb">
                            Dashboard / Certifications
                        </div>

                        <h1>
                            Certifications
                        </h1>

                        <p>
                            Test your knowledge, earn certifications,
                            and showcase your skills.
                        </p>

                    </div>

                </div>


                {/* ========================================
                    TABS
                ======================================== */}

                <div className="certification-tabs">

                    <button
                        type="button"
                        className={
                            activeTab === "certifications"
                                ? "certification-tab active"
                                : "certification-tab"
                        }
                        onClick={() =>
                            handleTabChange("certifications")
                        }
                    >

                        <span className="tab-icon">
                            🎓
                        </span>

                        Available Certifications

                    </button>


                    <button
                        type="button"
                        className={
                            activeTab === "certificates"
                                ? "certification-tab active"
                                : "certification-tab"
                        }
                        onClick={() =>
                            handleTabChange("certificates")
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


                {/* =====================================================
                    AVAILABLE CERTIFICATIONS
                ===================================================== */}

                {activeTab === "certifications" && (

                    <section className="certification-section">

                        {/* LOADING */}

                        {loading && (

                            <div className="certification-loading">

                                <div className="loading-spinner"></div>

                                <p>
                                    Loading certifications...
                                </p>

                            </div>

                        )}


                        {/* ERROR */}

                        {error && !loading && (

                            <div className="certification-error">

                                <span>
                                    ⚠️
                                </span>

                                <p>
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={fetchCertifications}
                                >
                                    Try Again
                                </button>

                            </div>

                        )}


                        {/* EMPTY */}

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
                                        There are currently no active
                                        certifications available.
                                    </p>

                                </div>

                            )}


                        {/* CERTIFICATION CARDS */}

                        {!loading &&
                            !error &&
                            certifications.length > 0 && (

                                <div className="certification-grid">

                                    {certifications.map(
                                        (certification) => (

                                            <div
                                                className="certification-card"
                                                key={certification.id}
                                            >

                                                {/* CARD TOP */}

                                                <div className="card-top">

                                                    <div className="certification-icon">
                                                        🎓
                                                    </div>

                                                    <span
                                                        className={`difficulty-badge ${
                                                            certification.difficulty
                                                                ?.toLowerCase()
                                                        }`}
                                                    >
                                                        {
                                                            certification.difficulty
                                                        }
                                                    </span>

                                                </div>


                                                {/* CARD CONTENT */}

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


                                                    {/* INFORMATION */}

                                                    <div className="certification-info">

                                                        <div className="info-item">

                                                            <span className="info-icon">
                                                                📝
                                                            </span>

                                                            <div>

                                                                <small>
                                                                    Questions
                                                                </small>

                                                                <strong>
                                                                    {
                                                                        certification.totalQuestions
                                                                    }
                                                                </strong>

                                                            </div>

                                                        </div>


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
                                                                    }
                                                                    %
                                                                </strong>

                                                            </div>

                                                        </div>

                                                    </div>


                                                    {/* VIEW BUTTON */}

                                                    <button
                                                        type="button"
                                                        className="view-certification-button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/user/certifications/${certification.id}`
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


                {/* =====================================================
                    MY CERTIFICATES
                ===================================================== */}

                {activeTab === "certificates" && (

                    <section className="certificate-section">

                        {/* SECTION HEADER */}

                        <div className="certificate-section-header">

                            <div>

                                <h2>
                                    My Certificates
                                </h2>

                                <p>
                                    View and showcase the certifications
                                    you have successfully completed.
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


                        {/* LOADING */}

                        {certificatesLoading && (

                            <div className="certification-loading">

                                <div className="loading-spinner"></div>

                                <p>
                                    Loading your certificates...
                                </p>

                            </div>

                        )}


                        {/* ERROR */}

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
                                        type="button"
                                        onClick={fetchCertificates}
                                    >
                                        Try Again
                                    </button>

                                </div>

                            )}


                        {/* EMPTY */}

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
                                        Complete a certification and
                                        pass the required score to earn
                                        your first certificate.
                                    </p>

                                    <button
                                        type="button"
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


                        {/* CERTIFICATE CARDS */}

                        {!certificatesLoading &&
                            !certificateError &&
                            certificates.length > 0 && (

                                <div className="certificate-grid">

                                    {certificates.map(
                                        (certificate) => (

                                            <div
                                                className="certificate-card"
                                                key={certificate.id}
                                            >

                                                {/* CARD TOP */}

                                                <div className="certificate-card-top">

                                                    <div className="certificate-emblem">
                                                        🏆
                                                    </div>

                                                    <span className="verified-badge">
                                                        ✓ Verified
                                                    </span>

                                                </div>


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


                                                    {/* RECIPIENT */}

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


                                                    {/* CERTIFICATE DETAILS */}

                                                    <div className="certificate-details">

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


                                                    {/* CERTIFICATE NUMBER */}

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


                                                    {/* VIEW CERTIFICATE */}

                                                    <button
                                                        type="button"
                                                        className="view-certificate-button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/user/certificates/${certificate.id}`
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