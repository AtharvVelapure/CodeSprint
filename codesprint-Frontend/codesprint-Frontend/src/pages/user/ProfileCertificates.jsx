import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ProfileCertificates.css";

function ProfileCertificates() {
    const navigate = useNavigate();

    const storedUser = localStorage.getItem("user");

    let user = null;

    try {
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error("Invalid user data:", error);
    }

    const userId = user?.id;

    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!userId) {
            navigate("/login");
            return;
        }

        const loadCertificates = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axios.get(
                    `/api/certificates/user/${userId}`
                );

                setCertificates(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );
            } catch (err) {
                console.error(
                    "Certificate loading error:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    "Unable to load your certificates."
                );
            } finally {
                setLoading(false);
            }
        };

        loadCertificates();
    }, [userId, navigate]);

    const formatDate = (value) => {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    if (loading) {
        return (
            <div className="profile-certificates-page">
                <div className="profile-certificates-loading">
                    Loading your certificates...
                </div>
            </div>
        );
    }

    return (
        <div className="profile-certificates-page">
            <div className="profile-certificates-header">
                <div>
                    <button
                        type="button"
                        className="profile-certificates-back"
                        onClick={() =>
                            navigate("/user/profile")
                        }
                    >
                        ← Back to Profile
                    </button>

                    <span className="profile-certificates-eyebrow">
                        ACHIEVEMENTS
                    </span>

                    <h1>My Certificates</h1>

                    <p>
                        View the certificates you have earned through CodeSprint.
                    </p>
                </div>

                <div className="profile-certificates-count">
                    <span>Certificates Earned</span>
                    <strong>{certificates.length}</strong>
                </div>
            </div>

            {error && (
                <div className="profile-certificates-error">
                    {error}
                </div>
            )}

            {!error && certificates.length === 0 && (
                <section className="profile-certificates-empty-card">
                    <div className="profile-certificates-empty-icon">
                        🎓
                    </div>

                    <h2>No certificates yet</h2>

                    <p>
                        Complete a CodeSprint certification to earn your first certificate.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/user/certifications")
                        }
                    >
                        Browse Certifications →
                    </button>
                </section>
            )}

            {!error && certificates.length > 0 && (
                <section className="profile-certificates-grid">
                    {certificates.map((certificate) => (
                        <article
                            className="profile-certificate-card"
                            key={certificate.id}
                        >
                            <div className="profile-certificate-top">
                                <div className="profile-certificate-icon">
                                    🎓
                                </div>

                                <span
                                    className={`profile-certificate-verified ${
                                        certificate.verified === true
                                            ? "verified"
                                            : ""
                                    }`}
                                >
                                    {certificate.verified === true
                                        ? "Verified"
                                        : "Certificate"}
                                </span>
                            </div>

                            <div className="profile-certificate-content">
                                <span className="profile-certificate-label">
                                    CERTIFICATION
                                </span>

                                <h2>
                                    {certificate.certificationTitle ||
                                        "CodeSprint Certification"}
                                </h2>

                                <div className="profile-certificate-meta">
                                    <div>
                                        <span>Certificate Number</span>
                                        <strong>
                                            {certificate.certificateNumber ||
                                                "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Issued On</span>
                                        <strong>
                                            {formatDate(
                                                certificate.issuedAt
                                            )}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="profile-certificate-view-button"
                                onClick={() =>
                                    navigate(
                                        `/user/certificates/${certificate.id}`
                                    )
                                }
                            >
                                View Certificate →
                            </button>
                        </article>
                    ))}
                </section>
            )}
        </div>
    );
}

export default ProfileCertificates;
