import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./CertificateView.css";

const API_URL = "/api/certificates";

function CertificateView() {
    const { certificateId } = useParams();
    const navigate = useNavigate();

    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCertificate();

        document.body.classList.add(
            "codesprint-certificate-page"
        );

        return () => {
            document.body.classList.remove(
                "codesprint-certificate-page"
            );
        };
    }, [certificateId]);

    const fetchCertificate = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API_URL}/${certificateId}`
            );

            setCertificate(response.data);
        } catch (err) {
            console.error("Error fetching certificate:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to load certificate."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) {
            return "-";
        }

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleBack = () => {
        navigate("/user/certificates");
    };

    if (loading) {
        return (
            <div className="certificate-view-page">
                <div className="certificate-view-loading">
                    <div className="certificate-view-spinner"></div>
                    <p>Loading certificate...</p>
                </div>
            </div>
        );
    }

    if (error || !certificate) {
        return (
            <div className="certificate-view-page">
                <div className="certificate-view-error">

                    <div className="certificate-view-error-icon">
                        !
                    </div>

                    <h2>
                        Certificate Not Found
                    </h2>

                    <p>
                        {error ||
                            "The requested certificate could not be found."}
                    </p>

                    <button onClick={handleBack}>
                        ← Back to My Certificates
                    </button>

                </div>
            </div>
        );
    }

    return (
        <div className="certificate-view-page">

            {/* =====================================================
                PAGE NAVIGATION
            ===================================================== */}

            <nav className="certificate-view-navbar no-print">

                <div
                    className="certificate-view-logo"
                    onClick={() => navigate("/dashboard")}
                >
                    <img
                        src="/codesprint-logo.png"
                        alt="CodeSprint"
                    />
                </div>

                <div className="certificate-view-actions">

                    <button
                        className="certificate-back-button"
                        onClick={handleBack}
                    >
                        ← My Certificates
                    </button>

                    <button
                        className="certificate-print-button"
                        onClick={handlePrint}
                    >
                        Print / Save PDF
                    </button>

                </div>

            </nav>


            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="certificate-view-main">

                <div className="certificate-page-heading no-print">

                    <span className="certificate-page-eyebrow">
                        VERIFIED ACHIEVEMENT
                    </span>

                    <h1>
                        Certificate
                    </h1>

                    <p>
                        Your verified CodeSprint certification achievement.
                    </p>

                </div>


                {/* =================================================
                    CERTIFICATE
                ================================================= */}

                <section className="certificate-paper">

                    <div className="certificate-outer-border">

                        <div className="certificate-inner-border">

                            {/* Decorative corners */}

                            <div className="certificate-corner certificate-corner-tl"></div>
                            <div className="certificate-corner certificate-corner-tr"></div>
                            <div className="certificate-corner certificate-corner-bl"></div>
                            <div className="certificate-corner certificate-corner-br"></div>


                            {/* =================================================
                                HEADER
                            ================================================= */}

                            <header className="certificate-paper-header">

                                <div className="certificate-brand">

                                    <img
                                        src="/codesprint-logo.png"
                                        alt="CodeSprint"
                                        className="certificate-logo"
                                    />

                                    <div className="certificate-brand-text">

                                        <strong>
                                            CODESPRINT
                                        </strong>

                                        <span>
                                            ONLINE CODING PLATFORM
                                        </span>

                                    </div>

                                </div>


                                <div className="certificate-verified">

                                    <div className="verified-check">
                                        ✓
                                    </div>

                                    <div>
                                        <strong>
                                            VERIFIED
                                        </strong>

                                        <span>
                                            Authentic Certificate
                                        </span>
                                    </div>

                                </div>

                            </header>


                            {/* =================================================
                                TITLE
                            ================================================= */}

                            <div className="certificate-title">

                                <span className="title-small">
                                    CERTIFICATE
                                </span>

                                <h1>
                                    OF ACHIEVEMENT
                                </h1>

                                <div className="title-decoration">

                                    <span></span>

                                    <div className="title-diamond">
                                        ◆
                                    </div>

                                    <span></span>

                                </div>

                            </div>


                            {/* =================================================
                                RECIPIENT
                            ================================================= */}

                            <div className="certificate-recipient">

                                <p className="presented-text">
                                    This certificate is proudly presented to
                                </p>

                                <h2>
                                    {certificate.userName}
                                </h2>

                                <div className="recipient-line"></div>

                                <p className="completion-text">
                                    for successfully completing the
                                </p>

                                <h3>
                                    {certificate.certificationTitle}
                                </h3>

                                <p className="achievement-description">
                                    Demonstrating the required knowledge,
                                    skills and proficiency in the
                                    certification assessment.
                                </p>

                            </div>


                            {/* =================================================
                                CERTIFICATE FOOTER
                            ================================================= */}

                            <footer className="certificate-paper-footer">

                                <div className="certificate-footer-detail">

                                    <span>
                                        ISSUED ON
                                    </span>

                                    <strong>
                                        {formatDate(
                                            certificate.issuedAt
                                        )}
                                    </strong>

                                </div>


                                <div className="certificate-seal">

                                    <div className="seal-inner">

                                        <span>
                                            ✓
                                        </span>

                                        <strong>
                                            VERIFIED
                                        </strong>

                                        <small>
                                            AUTHENTIC
                                        </small>

                                    </div>

                                </div>


                                <div className="certificate-footer-detail certificate-footer-number">

                                    <span>
                                        CERTIFICATE NUMBER
                                    </span>

                                    <strong>
                                        {certificate.certificateNumber}
                                    </strong>

                                </div>

                            </footer>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    INFORMATION CARDS
                ================================================= */}

                <section className="certificate-view-info no-print">

                    <div className="certificate-info-card">

                        <span>
                            Certification
                        </span>

                        <strong>
                            {certificate.certificationTitle}
                        </strong>

                    </div>


                    <div className="certificate-info-card">

                        <span>
                            Certificate Number
                        </span>

                        <strong>
                            {certificate.certificateNumber}
                        </strong>

                    </div>


                    <div className="certificate-info-card">

                        <span>
                            Verification
                        </span>

                        <strong className="verified-info">
                            {certificate.verified
                                ? "✓ Certificate Verified"
                                : "Certificate Unverified"}
                        </strong>

                    </div>

                </section>


                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="certificate-bottom-actions no-print">

                    <button
                        className="certificate-secondary-action"
                        onClick={handleBack}
                    >
                        ← Back to Certificates
                    </button>

                    <button
                        className="certificate-primary-action"
                        onClick={handlePrint}
                    >
                        Print / Save as PDF
                    </button>

                </div>

            </main>

        </div>
    );
}

export default CertificateView;
