import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AssessmentManage.css";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const AssessmentManage = () => {
    const { assessmentId } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [assessment, setAssessment] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        companyName: "",
        companyEmail: "",
        position: "",
        startDate: "",
        startTime: "",
        durationMinutes: 60,
        instructions: "",
        cameraRequired: false,
        microphoneRequired: false,
        fullscreenRequired: true,
        warningLimit: 3
    });

    // =====================================================
    // LOAD USER
    // =====================================================
    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            navigate("/login");
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);

            if (!parsedUser?.id) {
                navigate("/login");
                return;
            }

            setUser(parsedUser);
        } catch (exception) {
            console.error("Invalid user data:", exception);
            navigate("/login");
        }
    }, [navigate]);

    // =====================================================
    // LOAD ASSESSMENT
    // =====================================================
    useEffect(() => {
        if (!user?.id || !assessmentId) {
            return;
        }

        loadAssessment();
    }, [user, assessmentId]);

    const loadAssessment = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/assessment-assignments/${assessmentId}?userId=${user.id}`
            );

            const responseText = await response.text();
            let data;

            try {
                data = JSON.parse(responseText);
            } catch {
                data = responseText;
            }

            if (!response.ok) {
                throw new Error(
                    typeof data === "string"
                        ? data
                        : data?.message || "Unable to load assessment."
                );
            }

            setAssessment(data);

            const startDateTime = data.startDateTime
                ? String(data.startDateTime)
                : "";

            let startDate = "";
            let startTime = "";

            if (startDateTime) {
                const parts = startDateTime.split("T");
                startDate = parts[0] || "";
                startTime = parts[1] ? parts[1].substring(0, 5) : "";
            }

            setFormData({
                companyName: data.companyName || "",
                companyEmail: data.companyEmail || "",
                position: data.position || "",
                startDate,
                startTime,
                durationMinutes: data.durationMinutes || 60,
                instructions: data.instructions || "",
                cameraRequired: Boolean(data.cameraRequired),
                microphoneRequired: Boolean(data.microphoneRequired),
                fullscreenRequired: data.fullscreenRequired !== false,
                warningLimit: data.warningLimit || 3
            });

        } catch (exception) {
            console.error("Load assessment error:", exception);
            setError(exception.message || "Unable to load assessment.");
        } finally {
            setLoading(false);
        }
    };

    const status = assessment?.status
        ? String(assessment.status).toUpperCase()
        : "";

    const canEdit = status === "DRAFT" || status === "PUBLISHED";
    const canPublish = status === "DRAFT";
    const canManageQuestions = status === "DRAFT" || status === "PUBLISHED";
    const isDraft = status === "DRAFT";
    const isPublished = status === "PUBLISHED";
    const isLive = status === "LIVE";
    const isExpired = status === "EXPIRED";

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value
        }));
        setError("");
        setSuccess("");
    };

    const validateForm = () => {
        if (!formData.companyName.trim()) return "Company name is required.";
        if (!formData.companyEmail.trim()) return "Company email is required.";
        if (!formData.companyEmail.includes("@") || !formData.companyEmail.includes(".")) {
            return "Please enter a valid company email.";
        }
        if (!formData.position.trim()) return "Position is required.";
        if (!formData.startDate) return "Test date is required.";
        if (!formData.startTime) return "Start time is required.";
        if (!formData.durationMinutes || Number(formData.durationMinutes) <= 0) {
            return "Duration must be greater than zero.";
        }
        if (!formData.warningLimit || Number(formData.warningLimit) <= 0) {
            return "Warning limit must be greater than zero.";
        }
        return "";
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!canEdit) {
            setError("This assessment can no longer be edited.");
            return;
        }

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        if (!user?.id) {
            setError("User information is missing.");
            return;
        }

        setSaving(true);

        try {
            const startDateTime = `${formData.startDate}T${formData.startTime}`;
            const body = new URLSearchParams();

            body.append("userId", user.id);
            body.append("companyName", formData.companyName.trim());
            body.append("companyEmail", formData.companyEmail.trim());
            body.append("position", formData.position.trim());
            body.append("startDateTime", startDateTime);
            body.append("durationMinutes", Number(formData.durationMinutes));
            body.append("instructions", formData.instructions || "");
            body.append("cameraRequired", formData.cameraRequired);
            body.append("microphoneRequired", formData.microphoneRequired);
            body.append("fullscreenRequired", formData.fullscreenRequired);
            body.append("warningLimit", Number(formData.warningLimit));

            const response = await fetch(
                `${API_BASE_URL}/api/assessment-assignments/${assessmentId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body
                }
            );

            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch {
                data = responseText;
            }

            if (!response.ok) {
                throw new Error(
                    typeof data === "string"
                        ? data
                        : data?.message || "Unable to update assessment."
                );
            }

            setAssessment(data);
            setSuccess("Assessment details updated successfully.");
            window.scrollTo({ top: 0, behavior: "smooth" });

        } catch (exception) {
            console.error("Update assessment error:", exception);
            setError(exception.message || "Unable to update assessment.");
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!assessment || !user?.id) {
            setError("Assessment or user information is missing.");
            return;
        }

        if (!canPublish) {
            setError("Only draft assessments can be published.");
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to publish this assessment?\n\nMake sure all coding questions are selected before publishing."
        );

        if (!confirmed) return;

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API_BASE_URL}/api/assessment-assignments/${assessmentId}/publish?userId=${user.id}`,
                { method: "PUT" }
            );

            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch {
                data = responseText;
            }

            if (!response.ok) {
                throw new Error(
                    typeof data === "string"
                        ? data
                        : data?.message || "Unable to publish assessment."
                );
            }

            setAssessment(data);
            setSuccess("Assessment published successfully. You can now invite candidates.");
            window.scrollTo({ top: 0, behavior: "smooth" });

        } catch (exception) {
            console.error("Publish assessment error:", exception);
            setError(exception.message || "Unable to publish assessment.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        if (!assessment || !user?.id) {
            setError("Assessment or user information is missing.");
            return;
        }
        setError("");
        setSuccess("");
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!assessment || !user?.id) {
            setError("Assessment or user information is missing.");
            return;
        }

        try {
            setDeleting(true);
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API_BASE_URL}/api/assessment-assignments/${assessmentId}?userId=${user.id}`,
                { method: "DELETE" }
            );

            const responseText = await response.text();
            let data = null;
            try {
                data = responseText ? JSON.parse(responseText) : null;
            } catch {
                data = responseText;
            }

            if (!response.ok) {
                throw new Error(
                    typeof data === "string"
                        ? data
                        : data?.message || "Unable to delete assessment."
                );
            }

            setShowDeleteConfirm(false);
            navigate("/user/assessments");

        } catch (exception) {
            console.error("Delete assessment error:", exception);
            setError(exception.message || "Unable to delete assessment.");
            setShowDeleteConfirm(false);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="assessment-manage-page">
                <div className="assessment-manage-loading">
                    <div className="assessment-manage-spinner"></div>
                    <p>Loading assessment details...</p>
                </div>
            </div>
        );
    }

    if (!assessment) {
        return (
            <div className="assessment-manage-page">
                <div className="assessment-manage-container">
                    <button
                        className="assessment-back-button"
                        onClick={() => navigate("/user/assessments")}
                    >
                        ← Back to Assessments
                    </button>
                    <div className="assessment-error-card">
                        <div className="assessment-error-icon">⚠️</div>
                        <h2>Unable to Load Assessment</h2>
                        <p>{error || "The requested assessment could not be found."}</p>
                        <button
                            className="assessment-primary-button"
                            onClick={() => navigate("/user/assessments")}
                        >
                            Back to Assessments
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="assessment-manage-page">
            <div className="assessment-manage-container">

                {/* HEADER */}
                <div className="assessment-manage-header">
                    <div>
                        <button
                            className="assessment-back-button"
                            onClick={() => navigate("/user/assessments")}
                        >
                            ← Back to Assessments
                        </button>
                        <div className="assessment-manage-title-row">
                            <div>
                                <h1>Manage Assessment</h1>
                                <p>Manage assessment details, questions, candidates and results from one place.</p>
                            </div>
                            <span className={`assessment-status-badge status-${status.toLowerCase()}`}>
                                <span className="status-dot"></span>
                                {status}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="assessment-delete-button"
                        onClick={handleDelete}
                        disabled={deleting || saving}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                        Delete Assessment
                    </button>
                </div>

                {/* LIFECYCLE BANNER */}
                {isDraft && (
                    <div className="assessment-message assessment-message-warning">
                        <div className="message-icon">📝</div>
                        <div>
                            <strong>Draft Mode:</strong> Configure assessment settings, select your coding questions, and publish when ready to invite candidates.
                        </div>
                    </div>
                )}

                {isPublished && (
                    <div className="assessment-message assessment-message-success">
                        <div className="message-icon">✓</div>
                        <div>
                            <strong>Assessment Published:</strong> This test is active and will become LIVE automatically at the configured start time.
                        </div>
                    </div>
                )}

                {isLive && (
                    <div className="assessment-message assessment-message-error">
                        <div className="message-icon">🔒</div>
                        <div>
                            <strong>Assessment is LIVE:</strong> Test is currently active. Configuration and coding questions are locked against modification.
                        </div>
                    </div>
                )}

                {isExpired && (
                    <div className="assessment-message assessment-message-info">
                        <div className="message-icon">✓</div>
                        <div>
                            <strong>Assessment Concluded:</strong> The 48-hour testing window has passed. Submissions are finalized.
                        </div>
                    </div>
                )}

                {/* ALERTS */}
                {error && (
                    <div className="assessment-message assessment-message-error">
                        <div className="message-icon">⚠️</div>
                        <div>{error}</div>
                    </div>
                )}

                {success && (
                    <div className="assessment-message assessment-message-success">
                        <div className="message-icon">✓</div>
                        <div>{success}</div>
                    </div>
                )}

                {/* QUICK ACTIONS ROW */}
                <section className="assessment-management-actions">
                    <button
                        type="button"
                        className={`assessment-action-card ${!canManageQuestions ? "disabled" : ""}`}
                        disabled={!canManageQuestions}
                        onClick={() => canManageQuestions && navigate(`/user/assessments/${assessmentId}/problems`)}
                    >
                        <div className="assessment-action-icon blue">💻</div>
                        <div className="assessment-action-content">
                            <h3>Manage Questions</h3>
                            <p>{canManageQuestions ? "Add, edit, reorder or remove coding questions." : "Question editing is locked for this assessment."}</p>
                        </div>
                        <span className="assessment-action-arrow">→</span>
                    </button>

                    <button
                        type="button"
                        className="assessment-action-card"
                        onClick={() => navigate(`/user/assessments/${assessmentId}/invitations`)}
                    >
                        <div className="assessment-action-icon purple">👥</div>
                        <div className="assessment-action-content">
                            <h3>Invitations</h3>
                            <p>Invite candidates and manage invitation history.</p>
                        </div>
                        <span className="assessment-action-arrow">→</span>
                    </button>

                    <button
                        type="button"
                        className="assessment-action-card"
                        onClick={() => navigate(`/user/assessments/${assessmentId}/results`)}
                    >
                        <div className="assessment-action-icon green">📊</div>
                        <div className="assessment-action-content">
                            <h3>Assessment Results</h3>
                            <p>View candidate submissions, scores and detailed results.</p>
                        </div>
                        <span className="assessment-action-arrow">→</span>
                    </button>
                </section>

                {/* EDIT FORM */}
                <form className="assessment-manage-form" onSubmit={handleSave}>

                    {/* BASIC INFO */}
                    <section className="assessment-manage-card">
                        <div className="assessment-section-header">
                            <div className="assessment-section-icon">🏢</div>
                            <div>
                                <h2>Assessment Information</h2>
                                <p>Configure company, schedule, and assessment instructions.</p>
                            </div>
                        </div>

                        <div className="assessment-form-grid">
                            <div className="assessment-form-group">
                                <label>Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    disabled={!canEdit}
                                    placeholder="e.g. ABC Technologies"
                                />
                            </div>

                            <div className="assessment-form-group">
                                <label>Company Email</label>
                                <input
                                    type="email"
                                    name="companyEmail"
                                    value={formData.companyEmail}
                                    onChange={handleChange}
                                    disabled={!canEdit}
                                    placeholder="recruiter@example.com"
                                />
                            </div>

                            <div className="assessment-form-group">
                                <label>Target Position</label>
                                <input
                                    type="text"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    disabled={!canEdit}
                                    placeholder="e.g. Fullstack Developer"
                                />
                            </div>

                            <div className="assessment-form-group">
                                <label>Test Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    disabled={!canEdit}
                                />
                            </div>

                            <div className="assessment-form-group">
                                <label>Start Time</label>
                                <input
                                    type="time"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    disabled={!canEdit}
                                />
                            </div>

                            <div className="assessment-form-group">
                                <label>Duration</label>
                                <div className="assessment-input-with-suffix">
                                    <input
                                        type="number"
                                        name="durationMinutes"
                                        min="1"
                                        max="1440"
                                        value={formData.durationMinutes}
                                        onChange={handleChange}
                                        disabled={!canEdit}
                                    />
                                    <span>minutes</span>
                                </div>
                            </div>
                        </div>

                        <div className="assessment-form-group assessment-full-width">
                            <label>Candidate Instructions</label>
                            <textarea
                                name="instructions"
                                value={formData.instructions}
                                onChange={handleChange}
                                disabled={!canEdit}
                                placeholder="Enter specific guidelines, prohibited materials, or setup instructions..."
                                rows="5"
                            />
                        </div>
                    </section>

                    {/* SECURITY SETTINGS */}
                    <section className="assessment-manage-card">
                        <div className="assessment-section-header">
                            <div className="assessment-section-icon">🔒</div>
                            <div>
                                <h2>Security & Proctoring Settings</h2>
                                <p>Enforce environment monitoring and integrity restrictions during the test.</p>
                            </div>
                        </div>

                        <div className="assessment-security-grid">
                            <label className={`assessment-toggle-card ${formData.cameraRequired ? "selected" : ""}`}>
                                <input
                                    type="checkbox"
                                    name="cameraRequired"
                                    checked={formData.cameraRequired}
                                    onChange={handleChange}
                                    disabled={!canEdit}
                                />
                                <div className="toggle-switch-visual"></div>
                                <div className="toggle-text-block">
                                    <strong>Webcam Proctoring</strong>
                                    <span>Continuous video monitoring during test.</span>
                                </div>
                            </label>

                            <label className={`assessment-toggle-card ${formData.microphoneRequired ? "selected" : ""}`}>
                                <input
                                    type="checkbox"
                                    name="microphoneRequired"
                                    checked={formData.microphoneRequired}
                                    onChange={handleChange}
                                    disabled={!canEdit}
                                />
                                <div className="toggle-switch-visual"></div>
                                <div className="toggle-text-block">
                                    <strong>Audio Proctoring</strong>
                                    <span>Detects secondary voices & background noise.</span>
                                </div>
                            </label>

                            <label className={`assessment-toggle-card ${formData.fullscreenRequired ? "selected" : ""}`}>
                                <input
                                    type="checkbox"
                                    name="fullscreenRequired"
                                    checked={formData.fullscreenRequired}
                                    onChange={handleChange}
                                    disabled={!canEdit}
                                />
                                <div className="toggle-switch-visual"></div>
                                <div className="toggle-text-block">
                                    <strong>Fullscreen Lockdown</strong>
                                    <span>Flags window blurs & tab switches.</span>
                                </div>
                            </label>
                        </div>

                        <div className="assessment-warning-setting">
                            <div>
                                <label>Proctoring Warning Limit</label>
                                <p>Maximum infractions (tab-switch, face lost) permitted before the test auto-terminates.</p>
                            </div>
                            <div className="warning-input-box">
                                <input
                                    type="number"
                                    name="warningLimit"
                                    min="1"
                                    max="20"
                                    value={formData.warningLimit}
                                    onChange={handleChange}
                                    disabled={!canEdit}
                                />
                                <span>warnings</span>
                            </div>
                        </div>
                    </section>

                    {/* SAVE ACTIONS */}
                    {canEdit && (
                        <div className="assessment-save-area">
                            {canPublish && (
                                <button
                                    type="button"
                                    className="assessment-publish-button"
                                    onClick={handlePublish}
                                    disabled={saving}
                                >
                                    {saving ? "Publishing..." : "🚀 Publish Assessment"}
                                </button>
                            )}

                            <button
                                type="submit"
                                className="assessment-primary-button"
                                disabled={saving}
                            >
                                {saving ? "Saving Changes..." : "Save Assessment Changes"}
                            </button>
                        </div>
                    )}
                </form>

                {/* CODING QUESTIONS OVERVIEW */}
                <section className="assessment-manage-card assessment-question-management">
                    <div className="assessment-section-header">
                        <div className="assessment-section-icon">💻</div>
                        <div className="assessment-section-header-content">
                            <h2>Coding Questions</h2>
                            <p>Add and configure algorithmic challenges for candidates.</p>
                        </div>

                        <button
                            type="button"
                            className="assessment-outline-button"
                            disabled={!canManageQuestions}
                            onClick={() => canManageQuestions && navigate(`/user/assessments/${assessmentId}/problems`)}
                        >
                            {canManageQuestions ? "Manage Questions →" : "Questions Locked"}
                        </button>
                    </div>

                    <div className="assessment-question-info">
                        <div className="assessment-info-box">
                            <span className="assessment-info-icon">🧩</span>
                            <div>
                                <strong>Question Library</strong>
                                <p>Pick pre-existing algorithmic challenges with test cases.</p>
                            </div>
                        </div>

                        <div className="assessment-info-box">
                            <span className="assessment-info-icon">🛡️</span>
                            <div>
                                <strong>Live Protection</strong>
                                <p>Questions cannot be modified once the test starts.</p>
                            </div>
                        </div>

                        <div className="assessment-info-box">
                            <span className="assessment-info-icon">⏱️</span>
                            <div>
                                <strong>Availability Window</strong>
                                <p>Remains accessible for 48 hours following scheduled start.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* METADATA SUMMARY */}
                <section className="assessment-manage-card assessment-meta-card">
                    <div className="assessment-meta-item">
                        <span>Assessment ID</span>
                        <strong>#{assessment.id}</strong>
                    </div>

                    <div className="assessment-meta-item">
                        <span>Current Status</span>
                        <strong className="status-highlight">{status}</strong>
                    </div>

                    <div className="assessment-meta-item">
                        <span>Created Date</span>
                        <strong>{assessment.createdAt ? new Date(assessment.createdAt).toLocaleString() : "—"}</strong>
                    </div>

                    {assessment.liveAt && (
                        <div className="assessment-meta-item">
                            <span>Live From</span>
                            <strong>{new Date(assessment.liveAt).toLocaleString()}</strong>
                        </div>
                    )}

                    {assessment.expiresAt && (
                        <div className="assessment-meta-item">
                            <span>Expires On</span>
                            <strong>{new Date(assessment.expiresAt).toLocaleString()}</strong>
                        </div>
                    )}
                </section>

                {/* DELETE CONFIRM MODAL */}
                {showDeleteConfirm && (
                    <div className="assessment-delete-modal-overlay">
                        <div className="assessment-delete-modal">
                            <div className="assessment-delete-modal-icon">🗑️</div>
                            <h2>Delete Assessment?</h2>
                            <p className="assessment-delete-modal-summary">
                                You are about to delete <strong>{assessment.companyName}</strong> ({assessment.position}).
                            </p>
                            <p className="assessment-delete-modal-description">
                                This action marks the assessment as inactive. Previous candidate invitations and completed test records will remain safely archived.
                            </p>
                            <div className="assessment-delete-modal-actions">
                                <button
                                    type="button"
                                    className="assessment-delete-cancel-button"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={deleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="assessment-delete-confirm-button"
                                    onClick={confirmDelete}
                                    disabled={deleting}
                                >
                                    {deleting ? "Deleting..." : "Confirm & Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AssessmentManage;