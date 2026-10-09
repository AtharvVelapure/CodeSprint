import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Assessments.css";

const API_BASE_URL = "";

function Assessments() {
    const navigate = useNavigate();

    // =====================================================
    // USER / VERIFICATION
    // =====================================================
    const [user, setUser] = useState(null);
    const [verification, setVerification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =====================================================
    // OTP
    // =====================================================
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpVerifying, setOtpVerifying] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

    // =====================================================
    // ASSESSMENTS
    // =====================================================
    const [assessments, setAssessments] = useState([]);
    const [assessmentsLoading, setAssessmentsLoading] = useState(false);
    const [assessmentSearch, setAssessmentSearch] = useState("");
    const [assessmentStatusFilter, setAssessmentStatusFilter] = useState("ALL");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [assessmentCreated, setAssessmentCreated] = useState(false);
    const [createdAssessment, setCreatedAssessment] = useState(null);

    // =====================================================
    // CREATE ASSESSMENT FORM
    // =====================================================
    const [assessmentForm, setAssessmentForm] = useState({
        companyName: "",
        companyEmail: "",
        position: "",
        testDate: "",
        startTime: "",
        durationMinutes: 60,
        instructions: "",
        cameraRequired: false,
        microphoneRequired: false,
        fullscreenRequired: true,
        warningLimit: 3
    });

    // =====================================================
    // VERIFICATION FORM
    // =====================================================
    const [formData, setFormData] = useState({
        businessName: "",
        businessEmail: "",
        document: null
    });

    useEffect(() => {
        loadUserAndVerification();
    }, []);

    const loadUserAndVerification = async () => {
        try {
            setLoading(true);
            setError("");

            const storedUser = localStorage.getItem("user");
            if (!storedUser) {
                setError("Please login to access assessments.");
                setLoading(false);
                return;
            }

            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            if (!parsedUser.id) {
                setError("User information is missing.");
                setLoading(false);
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/api/assessment-host/verification/${parsedUser.id}`
            );

            if (response.status === 404) {
                setVerification(null);
                setOtpVerified(false);
                setAssessments([]);
                setLoading(false);
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to load assessment host verification.");
            }

            const data = await response.json();
            setVerification(data);
            setOtpVerified(data.otpVerified === true);

            if (data.status?.toUpperCase() === "APPROVED" && data.otpVerified === true) {
                setAssessmentForm((prev) => ({
                    ...prev,
                    companyName: data.businessName || "",
                    companyEmail: data.businessEmail || ""
                }));
                await loadAssessments(parsedUser.id);
            } else {
                setAssessments([]);
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const loadAssessments = async (currentUserId = user?.id) => {
        if (!currentUserId) return;
        try {
            setAssessmentsLoading(true);
            const response = await fetch(
                `${API_BASE_URL}/api/assessment-assignments?userId=${currentUserId}`
            );
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    typeof data === "string" ? data : data?.message || "Failed to load assessments."
                );
            }
            setAssessments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load assessments:", err);
            setError(err.message || "Failed to load assessments.");
        } finally {
            setAssessmentsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setFormData((prev) => ({ ...prev, document: null }));
            return;
        }

        const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            setError("Only PDF, JPG, JPEG and PNG files are allowed.");
            e.target.value = "";
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError("File size must not exceed 10 MB.");
            e.target.value = "";
            return;
        }

        setError("");
        setFormData((prev) => ({ ...prev, document: file }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!user?.id) return setError("Please login again.");
        if (!formData.businessName.trim()) return setError("Please enter your business name.");
        if (!formData.businessEmail.trim()) return setError("Please enter your business email.");
        if (!formData.document) return setError("Please upload your business verification document.");

        try {
            setSubmitting(true);
            const multipartData = new FormData();
            multipartData.append("userId", user.id);
            multipartData.append("businessName", formData.businessName.trim());
            multipartData.append("businessEmail", formData.businessEmail.trim());
            multipartData.append("document", formData.document);

            const response = await fetch(`${API_BASE_URL}/api/assessment-host/verification-request`, {
                method: "POST",
                body: multipartData
            });

            const data = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(data?.message || "Failed to submit verification request.");
            }

            setSuccess("Your assessment host verification request has been submitted successfully.");
            setFormData({ businessName: "", businessEmail: "", document: null });
            const fileInput = document.getElementById("assessment-business-document");
            if (fileInput) fileInput.value = "";

            await loadUserAndVerification();
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to submit request.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleApplyAgain = () => {
        const prev = verification;
        setVerification(null);
        setOtpVerified(false);
        setOtpSent(false);
        setOtp("");
        setError("");
        setSuccess("");
        if (prev) {
            setFormData({
                businessName: prev.businessName || "",
                businessEmail: prev.businessEmail || "",
                document: null
            });
        }
    };

    const handleSendOtp = async () => {
        setError("");
        setSuccess("");
        if (!user?.id) return setError("Please login again.");

        try {
            setSubmitting(true);
            const response = await fetch(`${API_BASE_URL}/api/assessment-host/otp/send?userId=${user.id}`, {
                method: "POST"
            });
            const data = await response.json().catch(() => null);
            if (!response.ok) throw new Error(data?.message || "Failed to send OTP.");

            setOtpSent(true);
            setOtp("");
            setSuccess("OTP has been sent to your verified business email.");
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to send OTP.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerifyOtp = async () => {
        setError("");
        setSuccess("");
        if (!otp.trim()) return setError("Please enter the OTP.");
        if (!/^\d{6}$/.test(otp.trim())) return setError("OTP must contain exactly 6 digits.");
        if (!user?.id) return setError("Please login again.");

        try {
            setOtpVerifying(true);
            const response = await fetch(
                `${API_BASE_URL}/api/assessment-host/otp/verify?userId=${user.id}&otp=${encodeURIComponent(otp.trim())}`,
                { method: "POST" }
            );
            const data = await response.json().catch(() => null);
            if (!response.ok) throw new Error(data?.message || "OTP verification failed.");

            setOtpVerified(true);
            setOtpSent(false);
            setOtp("");
            setSuccess("Business email verified successfully.");
            setAssessmentForm((prev) => ({
                ...prev,
                companyName: verification?.businessName || "",
                companyEmail: verification?.businessEmail || ""
            }));

            await loadUserAndVerification();
            await loadAssessments(user.id);
        } catch (err) {
            console.error(err);
            setError(err.message || "Invalid OTP.");
        } finally {
            setOtpVerifying(false);
        }
    };

    const handleAssessmentChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAssessmentForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const resetCreateForm = () => {
        setAssessmentForm({
            companyName: verification?.businessName || "",
            companyEmail: verification?.businessEmail || "",
            position: "",
            testDate: "",
            startTime: "",
            durationMinutes: 60,
            instructions: "",
            cameraRequired: false,
            microphoneRequired: false,
            fullscreenRequired: true,
            warningLimit: 3
        });
        setAssessmentCreated(false);
        setCreatedAssessment(null);
        setError("");
        setSuccess("");
    };

    const handleOpenCreate = () => {
        resetCreateForm();
        setShowCreateForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCloseCreate = () => {
        setShowCreateForm(false);
        setAssessmentCreated(false);
        setCreatedAssessment(null);
        setError("");
        setSuccess("");
    };

    const handleCreateAssessment = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!user?.id) return setError("Please login again.");
        if (!otpVerified) return setError("Please verify your business email first.");
        if (!assessmentForm.companyName.trim()) return setError("Company name is required.");
        if (!assessmentForm.companyEmail.trim()) return setError("Company email is required.");
        if (!assessmentForm.position.trim()) return setError("Position is required.");
        if (!assessmentForm.testDate) return setError("Please select the assessment date.");
        if (!assessmentForm.startTime) return setError("Please select the assessment start time.");
        if (!assessmentForm.durationMinutes || Number(assessmentForm.durationMinutes) <= 0) {
            return setError("Assessment duration must be greater than zero.");
        }
        if (!assessmentForm.warningLimit || Number(assessmentForm.warningLimit) <= 0) {
            return setError("Warning limit must be greater than zero.");
        }

        try {
            setSubmitting(true);
            const startDateTime = `${assessmentForm.testDate}T${assessmentForm.startTime}`;
            const params = new URLSearchParams();
            params.append("userId", user.id);
            params.append("companyName", assessmentForm.companyName.trim());
            params.append("companyEmail", assessmentForm.companyEmail.trim());
            params.append("position", assessmentForm.position.trim());
            params.append("startDateTime", startDateTime);
            params.append("durationMinutes", assessmentForm.durationMinutes);
            params.append("instructions", assessmentForm.instructions.trim());
            params.append("cameraRequired", assessmentForm.cameraRequired);
            params.append("microphoneRequired", assessmentForm.microphoneRequired);
            params.append("fullscreenRequired", assessmentForm.fullscreenRequired);
            params.append("warningLimit", assessmentForm.warningLimit);

            const response = await fetch(`${API_BASE_URL}/api/assessment-assignments`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params.toString()
            });

            const data = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(
                    typeof data === "string" ? data : data?.message || "Failed to create assessment."
                );
            }

            setCreatedAssessment(data);
            setAssessmentCreated(true);
            setSuccess("Assessment created successfully.");
            await loadAssessments(user.id);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to create assessment.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSelectProblems = () => {
        if (!createdAssessment?.id) return setError("Assessment ID is missing.");
        navigate(`/user/assessments/${createdAssessment.id}/problems`);
    };

    const handleManageAssessment = (item) => {
        if (!item?.id) return;
        navigate(`/user/assessments/${item.id}/manage`);
    };

    const handleInvitations = (item) => {
        if (!item?.id) return;
        navigate(`/user/assessments/${item.id}/invitations`);
    };

    const handleResults = (item) => {
        if (!item?.id) return;
        navigate(`/user/assessments/${item.id}/results`);
    };

    const handleFeedback = (item) => {
        if (!item?.id) return;
        navigate(`/user/assessments/${item.id}/feedback`);
    };

    const formatDate = (val) => {
        if (!val) return "Not scheduled";
        try {
            return new Date(val).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short"
            });
        } catch {
            return val;
        }
    };

    const normalizedSearch = assessmentSearch.trim().toLowerCase();
    const visibleAssessments = assessments.filter((item) => {
        const matchesSearch =
            !normalizedSearch ||
            String(item.position || "").toLowerCase().includes(normalizedSearch) ||
            String(item.companyName || "").toLowerCase().includes(normalizedSearch);

        const st = String(item.status || "DRAFT").toUpperCase();
        const matchesStatus = assessmentStatusFilter === "ALL" || st === assessmentStatusFilter;
        return matchesSearch && matchesStatus;
    });

    const assessmentStats = {
        total: assessments.length,
        draft: assessments.filter((i) => String(i.status || "").toUpperCase() === "DRAFT").length,
        published: assessments.filter((i) => String(i.status || "").toUpperCase() === "PUBLISHED").length,
        live: assessments.filter((i) => String(i.status || "").toUpperCase() === "LIVE").length,
        expired: assessments.filter((i) => String(i.status || "").toUpperCase() === "EXPIRED").length
    };

    if (loading) {
        return (
            <div className="assessments-page">
                <div className="assessment-loading">
                    <div className="assessment-spinner"></div>
                    <p>Loading assessments...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="assessments-page">
                <div className="assessment-alert assessment-alert-error">
                    {error || "Please login to continue."}
                </div>
                <button
                    className="assessment-primary-button"
                    onClick={() => navigate("/login")}
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="assessments-page">
            {/* HEADER */}
            <div className="assessments-header">
                <div>
                    <span className="assessments-badge">CodeSprint Assessments</span>
                    <h1>Assessments</h1>
                    <p>Create and manage coding assessments for candidates.</p>
                </div>
            </div>

            {/* ALERTS */}
            {error && (
                <div className="assessment-alert assessment-alert-error">
                    <span>{error}</span>
                    <button type="button" className="assessment-alert-close" onClick={() => setError("")}>
                        ×
                    </button>
                </div>
            )}

            {success && (
                <div className="assessment-alert assessment-alert-success">
                    <span>{success}</span>
                    <button type="button" className="assessment-alert-close" onClick={() => setSuccess("")}>
                        ×
                    </button>
                </div>
            )}

            {/* NOT REGISTERED */}
            {!verification && (
                <div className="assessment-host-card">
                    <div className="assessment-card-icon">🏢</div>
                    <h2>Become an Assessment Host</h2>
                    <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
                        To create coding assessments for candidates, your business needs to be verified first.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="assessment-form-group">
                            <label htmlFor="businessName">Business / Company Name</label>
                            <input
                                id="businessName"
                                name="businessName"
                                type="text"
                                placeholder="Enter your business name"
                                value={formData.businessName}
                                onChange={handleChange}
                                disabled={submitting}
                            />
                        </div>

                        <div className="assessment-form-group">
                            <label htmlFor="businessEmail">Business Email</label>
                            <input
                                id="businessEmail"
                                name="businessEmail"
                                type="email"
                                placeholder="company@example.com"
                                value={formData.businessEmail}
                                onChange={handleChange}
                                disabled={submitting}
                            />
                            <small>OTP verification will use this business email after admin approval.</small>
                        </div>

                        <div className="assessment-form-group">
                            <label htmlFor="assessment-business-document">Business Verification Document</label>
                            <input
                                id="assessment-business-document"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                disabled={submitting}
                            />
                        </div>

                        <button
                            type="submit"
                            className="assessment-primary-button"
                            disabled={submitting}
                        >
                            {submitting ? "Submitting..." : "Submit Verification Request"}
                        </button>
                    </form>
                </div>
            )}

            {/* PENDING */}
            {verification && verification.status?.toUpperCase() === "PENDING" && (
                <div className="assessment-status-card">
                    <div className="assessment-status-icon">⏳</div>
                    <h2>Verification Pending</h2>
                    <p style={{ color: "#94a3b8" }}>
                        Your assessment host registration has been submitted and is waiting for admin review.
                    </p>

                    <div className="assessment-business-summary">
                        <div>
                            <span>Business</span>
                            <strong>{verification.businessName}</strong>
                        </div>
                        <div>
                            <span>Business Email</span>
                            <strong>{verification.businessEmail}</strong>
                        </div>
                        <div>
                            <span>Status</span>
                            <strong style={{ color: "#fbbf24" }}>Pending Review</strong>
                        </div>
                    </div>
                </div>
            )}

            {/* REJECTED */}
            {verification && verification.status?.toUpperCase() === "REJECTED" && (
                <div className="assessment-status-card">
                    <div className="assessment-status-icon">❌</div>
                    <h2>Verification Rejected</h2>
                    <p style={{ color: "#94a3b8" }}>
                        Your assessment host verification request was rejected by the admin.
                    </p>
                    {verification.adminRemarks && (
                        <p style={{ color: "#f87171", margin: "14px 0" }}>
                            Remarks: {verification.adminRemarks}
                        </p>
                    )}
                    <button className="assessment-primary-button" onClick={handleApplyAgain}>
                        Apply Again
                    </button>
                </div>
            )}

            {/* APPROVED */}
            {verification && verification.status?.toUpperCase() === "APPROVED" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* HOST PORTAL OVERVIEW CARD */}
                    <div className="assessment-status-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "4px 10px",
                                    borderRadius: "999px",
                                    background: "rgba(34,197,94,0.1)",
                                    border: "1px solid rgba(34,197,94,0.25)",
                                    color: "#4ade80",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    textTransform: "uppercase"
                                }}
                            >
                                ✓ Host Approved
                            </span>
                        </div>

                        <h2 style={{ margin: "0 0 6px 0", color: "#f8fafc", fontSize: "20px", fontWeight: 700 }}>
                            Assessment Host Portal
                        </h2>
                        <p style={{ margin: 0, color: "#94a3b8", fontSize: "13.5px" }}>
                            Manage and conduct technical assessments under your verified business profile.
                        </p>

                        <div className="assessment-business-summary">
                            <div>
                                <span>Business</span>
                                <strong>{verification.businessName}</strong>
                            </div>
                            <div>
                                <span>Business Email</span>
                                <strong>{verification.businessEmail}</strong>
                            </div>
                            <div>
                                <span>Verification</span>
                                <strong style={{ color: otpVerified ? "#4ade80" : "#fbbf24" }}>
                                    {otpVerified ? "Verified (Ready)" : "Email OTP Required"}
                                </strong>
                            </div>
                        </div>

                        {/* OTP SECTION */}
                        {!otpVerified && (
                            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #142238" }}>
                                <h3 style={{ margin: "0 0 6px 0", color: "#f8fafc", fontSize: "16px" }}>Verify Business Email</h3>
                                <p style={{ margin: "0 0 14px 0", color: "#94a3b8", fontSize: "13px" }}>
                                    An OTP will be sent to your approved business email address.
                                </p>

                                {!otpSent ? (
                                    <button
                                        className="assessment-primary-button"
                                        onClick={handleSendOtp}
                                        disabled={submitting}
                                    >
                                        {submitting ? "Sending OTP..." : "Send OTP"}
                                    </button>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "300px" }}>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength="6"
                                            placeholder="Enter 6 digits"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                            disabled={otpVerifying}
                                            style={{
                                                padding: "10px 14px",
                                                border: "1px solid #1e2e46",
                                                borderRadius: "8px",
                                                background: "#040913",
                                                color: "#f8fafc",
                                                outline: "none"
                                            }}
                                        />
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <button
                                                className="assessment-primary-button"
                                                onClick={handleVerifyOtp}
                                                disabled={otpVerifying}
                                            >
                                                {otpVerifying ? "Verifying..." : "Verify OTP"}
                                            </button>
                                            <button
                                                type="button"
                                                className="assessment-secondary-button"
                                                onClick={handleSendOtp}
                                                disabled={submitting}
                                            >
                                                Resend
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* DASHBOARD (WHEN VERIFIED) */}
                    {otpVerified && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {/* TOP HEADER */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                                <div>
                                    <h2 style={{ margin: "0 0 4px 0", fontSize: "24px", color: "#f8fafc", fontWeight: 700 }}>
                                        Assessments
                                    </h2>
                                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>
                                        Create, manage, invite candidates and review coding assessments.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleOpenCreate}
                                    className="assessment-primary-button"
                                >
                                    + Create Assessment
                                </button>
                            </div>

                            {/* BUSINESS SUMMARY STATS */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                                {[
                                    { label: "Business", value: verification?.businessName || "Verified Business" },
                                    { label: "Business Email", value: verification?.businessEmail || "Verified" },
                                    { label: "Verification", value: "Approved & Verified" },
                                    { label: "Total Assessments", value: assessmentStats.total }
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        style={{
                                            background: "#081120",
                                            border: "1px solid #142238",
                                            borderRadius: "12px",
                                            padding: "16px 20px"
                                        }}
                                    >
                                        <div style={{ color: "#64748b", fontSize: "11.5px", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>
                                            {item.label}
                                        </div>
                                        <div style={{ color: "#f8fafc", fontSize: "15px", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* STATUS FILTER PILLS */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
                                {[
                                    { key: "ALL", label: "All Assessments", value: assessmentStats.total },
                                    { key: "DRAFT", label: "Draft", value: assessmentStats.draft },
                                    { key: "PUBLISHED", label: "Published", value: assessmentStats.published },
                                    { key: "LIVE", label: "Live", value: assessmentStats.live },
                                    { key: "EXPIRED", label: "Expired", value: assessmentStats.expired }
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setAssessmentStatusFilter(item.key)}
                                        style={{
                                            textAlign: "left",
                                            border: assessmentStatusFilter === item.key ? "1px solid #3b82f6" : "1px solid #142238",
                                            background: assessmentStatusFilter === item.key ? "rgba(37,99,235,0.12)" : "#081120",
                                            borderRadius: "10px",
                                            padding: "14px 16px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <div style={{ color: "#94a3b8", fontSize: "11.5px", fontWeight: 600, marginBottom: "4px" }}>
                                            {item.label}
                                        </div>
                                        <div style={{ color: "#f8fafc", fontSize: "22px", fontWeight: 700 }}>
                                            {item.value}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* LIST CONTAINER */}
                            <div style={{ background: "#081120", border: "1px solid #142238", borderRadius: "12px", overflow: "hidden" }}>
                                <div style={{ padding: "18px 24px", borderBottom: "1px solid #142238", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                                    <div>
                                        <h3 style={{ margin: "0 0 2px 0", color: "#f8fafc", fontSize: "17px", fontWeight: 700 }}>
                                            Your Assessments
                                        </h3>
                                        <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>
                                            Manage and monitor your candidate tests.
                                        </p>
                                    </div>

                                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                                        <input
                                            type="text"
                                            value={assessmentSearch}
                                            onChange={(e) => setAssessmentSearch(e.target.value)}
                                            placeholder="Search assessments..."
                                            style={{
                                                border: "1px solid #1e2e46",
                                                borderRadius: "8px",
                                                padding: "9px 14px",
                                                background: "#040913",
                                                color: "#f8fafc",
                                                fontSize: "13px",
                                                outline: "none"
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => loadAssessments(user.id)}
                                            disabled={assessmentsLoading}
                                            className="assessment-secondary-button"
                                        >
                                            ↻ Refresh
                                        </button>
                                    </div>
                                </div>

                                {assessmentsLoading ? (
                                    <div className="assessment-loading">
                                        <div className="assessment-spinner"></div>
                                        <p>Loading assessments...</p>
                                    </div>
                                ) : visibleAssessments.length === 0 ? (
                                    <div className="assessment-empty-state">
                                        <div className="assessment-empty-icon">📝</div>
                                        <h3 style={{ color: "#f8fafc", margin: "0 0 4px 0" }}>No assessments found</h3>
                                        <p style={{ color: "#64748b", margin: 0 }}>
                                            {assessments.length === 0 ? "Create your first coding assessment to get started." : "Try changing your search term."}
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        {visibleAssessments.map((assessment) => {
                                            const status = String(assessment.status || "DRAFT").toUpperCase();
                                            const statusColors = {
                                                DRAFT: { bg: "rgba(148,163,184,0.1)", text: "#94a3b8", border: "rgba(148,163,184,0.25)" },
                                                PUBLISHED: { bg: "rgba(59,130,246,0.1)", text: "#60a5fa", border: "rgba(59,130,246,0.25)" },
                                                LIVE: { bg: "rgba(34,197,94,0.1)", text: "#4ade80", border: "rgba(34,197,94,0.25)" },
                                                EXPIRED: { bg: "rgba(239,68,68,0.1)", text: "#f87171", border: "rgba(239,68,68,0.25)" }
                                            };
                                            const badgeStyle = statusColors[status] || statusColors.DRAFT;

                                            return (
                                                <div
                                                    key={assessment.id}
                                                    style={{
                                                        padding: "18px 24px",
                                                        borderBottom: "1px solid #0e1a2c",
                                                        display: "grid",
                                                        gridTemplateColumns: "minmax(240px, 1.8fr) minmax(160px, 1fr) minmax(120px, 0.8fr) auto",
                                                        gap: "18px",
                                                        alignItems: "center"
                                                    }}
                                                >
                                                    <div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                                            <h4 style={{ margin: 0, color: "#f8fafc", fontSize: "15px", fontWeight: 700 }}>
                                                                {assessment.position || "Untitled Assessment"}
                                                            </h4>
                                                            <span
                                                                style={{
                                                                    background: badgeStyle.bg,
                                                                    color: badgeStyle.text,
                                                                    border: `1px solid ${badgeStyle.border}`,
                                                                    borderRadius: "999px",
                                                                    padding: "2px 8px",
                                                                    fontSize: "10.5px",
                                                                    fontWeight: 700
                                                                }}
                                                            >
                                                                {status}
                                                            </span>
                                                        </div>
                                                        <div style={{ color: "#94a3b8", fontSize: "12.5px" }}>
                                                            {assessment.companyName} • Assessment #{assessment.id}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div style={{ color: "#64748b", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>START DATE</div>
                                                        <div style={{ color: "#cbd5e1", fontSize: "13px", fontWeight: 500, marginTop: "2px" }}>
                                                            {formatDate(assessment.startDateTime)}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div style={{ color: "#64748b", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>DURATION</div>
                                                        <div style={{ color: "#cbd5e1", fontSize: "13px", fontWeight: 500, marginTop: "2px" }}>
                                                            {assessment.durationMinutes || 60} mins
                                                        </div>
                                                    </div>

                                                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleManageAssessment(assessment)}
                                                            className="assessment-secondary-button"
                                                            style={{ background: "#2563eb", color: "#ffffff", border: "none" }}
                                                        >
                                                            Manage
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleInvitations(assessment)}
                                                            className="assessment-secondary-button"
                                                        >
                                                            Invitations
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleResults(assessment)}
                                                            className="assessment-secondary-button"
                                                        >
                                                            Results
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleFeedback(assessment)}
                                                            className="assessment-secondary-button"
                                                        >
                                                            View Feedback
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* CREATE MODAL / INLINE FORM */}
                            {showCreateForm && (
                                <div style={{ background: "#081120", border: "1px solid #142238", borderRadius: "12px", overflow: "hidden" }}>
                                    <div style={{ padding: "18px 24px", borderBottom: "1px solid #142238", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <h3 style={{ margin: "0 0 2px 0", color: "#f8fafc", fontSize: "18px", fontWeight: 700 }}>
                                                Create New Assessment
                                            </h3>
                                            <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>
                                                Configure track details before selecting coding questions.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleCloseCreate}
                                            style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "20px", cursor: "pointer" }}
                                        >
                                            ×
                                        </button>
                                    </div>

                                    {!assessmentCreated ? (
                                        <form onSubmit={handleCreateAssessment} style={{ padding: "24px" }}>
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                                                <div className="assessment-form-group">
                                                    <label>Company Name</label>
                                                    <input
                                                        type="text"
                                                        name="companyName"
                                                        value={assessmentForm.companyName}
                                                        onChange={handleAssessmentChange}
                                                    />
                                                </div>

                                                <div className="assessment-form-group">
                                                    <label>Company Email</label>
                                                    <input
                                                        type="email"
                                                        name="companyEmail"
                                                        value={assessmentForm.companyEmail}
                                                        onChange={handleAssessmentChange}
                                                    />
                                                </div>

                                                <div className="assessment-form-group" style={{ gridColumn: "1 / -1" }}>
                                                    <label>Job Position / Title</label>
                                                    <input
                                                        type="text"
                                                        name="position"
                                                        placeholder="e.g. Senior Java Engineer"
                                                        value={assessmentForm.position}
                                                        onChange={handleAssessmentChange}
                                                    />
                                                </div>

                                                <div className="assessment-form-group">
                                                    <label>Assessment Date</label>
                                                    <input
                                                        type="date"
                                                        name="testDate"
                                                        value={assessmentForm.testDate}
                                                        onChange={handleAssessmentChange}
                                                    />
                                                </div>

                                                <div className="assessment-form-group">
                                                    <label>Start Time</label>
                                                    <input
                                                        type="time"
                                                        name="startTime"
                                                        value={assessmentForm.startTime}
                                                        onChange={handleAssessmentChange}
                                                    />
                                                </div>

                                                <div className="assessment-form-group">
                                                    <label>Duration (Minutes)</label>
                                                    <input
                                                        type="number"
                                                        name="durationMinutes"
                                                        min="1"
                                                        value={assessmentForm.durationMinutes}
                                                        onChange={handleAssessmentChange}
                                                    />
                                                </div>

                                                <div className="assessment-form-group">
                                                    <label>Warning Limit</label>
                                                    <input
                                                        type="number"
                                                        name="warningLimit"
                                                        min="1"
                                                        value={assessmentForm.warningLimit}
                                                        onChange={handleAssessmentChange}
                                                    />
                                                </div>

                                                <div className="assessment-form-group" style={{ gridColumn: "1 / -1" }}>
                                                    <label>Candidate Instructions</label>
                                                    <textarea
                                                        name="instructions"
                                                        rows="3"
                                                        placeholder="Describe assessment rules, constraints and setup instructions..."
                                                        value={assessmentForm.instructions}
                                                        onChange={handleAssessmentChange}
                                                    />
                                                </div>
                                            </div>

                                            {/* PROCTORING */}
                                            <div style={{ marginTop: "16px", padding: "16px", borderRadius: "8px", background: "#040913", border: "1px solid #142238" }}>
                                                <h4 style={{ margin: "0 0 12px 0", color: "#f8fafc", fontSize: "14px", fontWeight: 600 }}>Security & Proctoring</h4>
                                                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                                                    {[
                                                        ["cameraRequired", "Require Camera Access"],
                                                        ["microphoneRequired", "Require Microphone Access"],
                                                        ["fullscreenRequired", "Enforce Fullscreen Mode"]
                                                    ].map(([name, label]) => (
                                                        <label key={name} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#cbd5e1", fontSize: "13px", cursor: "pointer" }}>
                                                            <input
                                                                type="checkbox"
                                                                name={name}
                                                                checked={assessmentForm[name]}
                                                                onChange={handleAssessmentChange}
                                                            />
                                                            {label}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                                                <button type="button" onClick={handleCloseCreate} className="assessment-secondary-button">
                                                    Cancel
                                                </button>
                                                <button type="submit" disabled={submitting} className="assessment-primary-button">
                                                    {submitting ? "Saving..." : "Save Assessment"}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div style={{ padding: "40px 24px", textAlign: "center" }}>
                                            <div style={{ fontSize: "28px", marginBottom: "8px" }}>✓</div>
                                            <h3 style={{ margin: "0 0 6px 0", color: "#f8fafc", fontSize: "18px" }}>Assessment Created Successfully</h3>
                                            <p style={{ margin: "0 0 20px 0", color: "#94a3b8", fontSize: "13px" }}>
                                                The assessment was saved as a draft. Select coding problems to continue.
                                            </p>
                                            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                                                <button type="button" onClick={handleCloseCreate} className="assessment-secondary-button">
                                                    Back to List
                                                </button>
                                                <button type="button" onClick={handleSelectProblems} className="assessment-primary-button">
                                                    Select Coding Problems →
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Assessments;