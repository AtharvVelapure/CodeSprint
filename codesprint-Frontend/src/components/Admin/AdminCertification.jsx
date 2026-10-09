import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminCertification.css";

const API_URL = "/api/admin/certifications";

const emptyForm = {
    title: "",
    description: "",
    category: "",
    difficulty: "Easy",
    durationMinutes: 30,
    totalQuestions: 1,
    passingPercentage: 70,
    status: "DRAFT",

    // Retake policy
    allowRetake: false,
    maxAttempts: 1
};

function AdminCertification() {

    const navigate = useNavigate();

    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        ...emptyForm
    });


    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {
        loadCertifications();
    }, []);


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
    // LOAD CERTIFICATIONS
    // ============================================================

    const loadCertifications = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await axios.get(API_URL);

            const data =
                Array.isArray(response.data)
                    ? response.data
                    : [];

            setCertifications(data);

        } catch (err) {

            console.error(
                "Error loading certifications:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to load certifications."
                )
            );

        } finally {

            setLoading(false);
        }
    };


    // ============================================================
    // FORM CHANGE
    // ============================================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };


    // ============================================================
    // RETAKE CHANGE
    // ============================================================

    const handleRetakeChange = (event) => {

        const allowRetake =
            event.target.value === "true";

        setForm(prev => ({
            ...prev,

            allowRetake,

            maxAttempts:
                allowRetake
                    ? Number(prev.maxAttempts) > 1
                        ? prev.maxAttempts
                        : 2
                    : 1
        }));
    };


    // ============================================================
    // CREATE
    // ============================================================

    const handleCreate = () => {

        setEditingId(null);

        setForm({
            ...emptyForm
        });

        setError("");
        setSuccess("");
        setShowForm(true);
    };


    // ============================================================
    // EDIT
    // ============================================================

    const handleEdit = (
        certification
    ) => {

        const allowRetake =
            certification.allowRetake === true;

        setEditingId(
            certification.id
        );

        setForm({

            title:
                certification.title || "",

            description:
                certification.description || "",

            category:
                certification.category || "",

            difficulty:
                certification.difficulty || "Easy",

            durationMinutes:
                certification.durationMinutes || 30,

            totalQuestions:
                certification.totalQuestions || 1,

            passingPercentage:
                certification.passingPercentage || 70,

            status:
                certification.status || "DRAFT",

            allowRetake,

            maxAttempts:
                allowRetake
                    ? Number(
                        certification.maxAttempts || 2
                    )
                    : 1
        });

        setError("");
        setSuccess("");
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    // ============================================================
    // CANCEL
    // ============================================================

    const handleCancel = () => {

        if (saving) {
            return;
        }

        setShowForm(false);
        setEditingId(null);

        setForm({
            ...emptyForm
        });

        setError("");
    };


    // ============================================================
    // VALIDATION
    // ============================================================

    const validateForm = () => {

        if (!form.title.trim()) {
            return "Certification title is required.";
        }

        if (!form.description.trim()) {
            return "Certification description is required.";
        }

        if (!form.category.trim()) {
            return "Certification category is required.";
        }

        const duration =
            Number(form.durationMinutes);

        if (
            !Number.isInteger(duration) ||
            duration <= 0
        ) {
            return "Duration must be greater than zero.";
        }

        const totalQuestions =
            Number(form.totalQuestions);

        if (
            !Number.isInteger(totalQuestions) ||
            totalQuestions <= 0
        ) {
            return "Total questions must be greater than zero.";
        }

        const passingPercentage =
            Number(form.passingPercentage);

        if (
            !Number.isInteger(
                passingPercentage
            ) ||
            passingPercentage <= 0 ||
            passingPercentage > 100
        ) {
            return "Passing percentage must be between 1 and 100.";
        }

        if (form.allowRetake) {

            const maxAttempts =
                Number(form.maxAttempts);

            if (
                !Number.isInteger(maxAttempts) ||
                maxAttempts < 2
            ) {
                return "Maximum attempts must be at least 2 when retakes are allowed.";
            }
        }

        return "";
    };


    // ============================================================
    // SAVE
    // ============================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        const validationError =
            validateForm();

        if (validationError) {

            setError(validationError);
            setSuccess("");

            return;
        }

        try {

            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {

                title:
                    form.title.trim(),

                description:
                    form.description.trim(),

                category:
                    form.category.trim(),

                difficulty:
                    form.difficulty,

                durationMinutes:
                    Number(
                        form.durationMinutes
                    ),

                totalQuestions:
                    Number(
                        form.totalQuestions
                    ),

                passingPercentage:
                    Number(
                        form.passingPercentage
                    ),

                status:
                    form.status,

                allowRetake:
                    form.allowRetake === true,

                maxAttempts:
                    form.allowRetake
                        ? Number(
                            form.maxAttempts
                        )
                        : 1
            };


            if (editingId) {

                await axios.put(
                    `${API_URL}/${editingId}`,
                    payload
                );

                setSuccess(
                    "Certification updated successfully."
                );

            } else {

                await axios.post(
                    API_URL,
                    payload
                );

                setSuccess(
                    "Certification created successfully."
                );
            }


            setShowForm(false);
            setEditingId(null);

            setForm({
                ...emptyForm
            });

            await loadCertifications();

        } catch (err) {

            console.error(
                "Error saving certification:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to save certification."
                )
            );

        } finally {

            setSaving(false);
        }
    };


    // ============================================================
    // ACTIVATE
    // ============================================================

    const handleActivate = async (
        certification
    ) => {

        if (
            !window.confirm(
                `Activate "${certification.title}"?`
            )
        ) {
            return;
        }

        try {

            setError("");
            setSuccess("");

            await axios.put(
                `${API_URL}/${certification.id}/activate`
            );

            setSuccess(
                "Certification activated successfully."
            );

            await loadCertifications();

        } catch (err) {

            console.error(
                "Error activating certification:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to activate certification."
                )
            );
        }
    };


    // ============================================================
    // DEACTIVATE
    // ============================================================

    const handleDeactivate = async (
        certification
    ) => {

        if (
            !window.confirm(
                `Deactivate "${certification.title}"?`
            )
        ) {
            return;
        }

        try {

            setError("");
            setSuccess("");

            await axios.put(
                `${API_URL}/${certification.id}/deactivate`
            );

            setSuccess(
                "Certification deactivated successfully."
            );

            await loadCertifications();

        } catch (err) {

            console.error(
                "Error deactivating certification:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to deactivate certification."
                )
            );
        }
    };


    // ============================================================
    // DELETE
    // ============================================================

    const handleDelete = async (
        certification
    ) => {

        if (
            !window.confirm(
                `Delete "${certification.title}"?\n\nThis will also remove its configured questions.`
            )
        ) {
            return;
        }

        try {

            setError("");
            setSuccess("");

            await axios.delete(
                `${API_URL}/${certification.id}`
            );

            setSuccess(
                "Certification deleted successfully."
            );

            await loadCertifications();

        } catch (err) {

            console.error(
                "Error deleting certification:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to delete certification."
                )
            );
        }
    };


    // ============================================================
    // MANAGE QUESTIONS
    // ============================================================

    const handleManageQuestions = (
        certificationId
    ) => {

        navigate(
            `/admin/certifications/${certificationId}/questions`
        );
    };


    // ============================================================
    // VIEW RESULTS
    // ============================================================

    const handleViewResults = (
        certificationId
    ) => {

        navigate(
            `/admin/certifications/${certificationId}/results`
        );
    };


    // ============================================================
    // UI HELPERS
    // ============================================================

    const getStatusClass = (
        status
    ) => {

        const val =
            status?.toUpperCase();

        if (val === "ACTIVE") {
            return "status-active";
        }

        if (val === "INACTIVE") {
            return "status-inactive";
        }

        return "status-draft";
    };


    const getDifficultyClass = (
        difficulty
    ) => {

        return (
            difficulty
                ?.toLowerCase()
                .replace(/\s+/g, "-") ||
            "easy"
        );
    };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <div className="admin-certification-page">

                <div className="admin-certification-loading">

                    <div className="admin-certification-spinner"></div>

                    <h2>
                        Loading Certifications...
                    </h2>

                    <p>
                        Please wait while certification data is loaded.
                    </p>

                </div>

            </div>
        );
    }


    // ============================================================
    // PAGE
    // ============================================================

    return (

        <div className="admin-certification-page">


            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="admin-certification-header">

                <div>

                    <div className="admin-page-breadcrumb">
                        Admin / Certifications
                    </div>

                    <h1>
                        Certification Management
                    </h1>

                    <p>
                        Create, edit and manage coding certifications on CodeSprint.
                    </p>

                </div>


                <button
                    type="button"
                    className="create-certification-button"
                    onClick={handleCreate}
                >
                    <span>
                        +
                    </span>

                    Create Certification
                </button>

            </div>


            {/* ====================================================
                ALERTS
            ==================================================== */}

            {success && (

                <div className="admin-certification-alert success">

                    <span>
                        ✓
                    </span>

                    <span>
                        {success}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccess("")
                        }
                    >
                        &times;
                    </button>

                </div>
            )}


            {error && (

                <div className="admin-certification-alert error">

                    <span>
                        ⚠️
                    </span>

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                    >
                        &times;
                    </button>

                </div>
            )}


            {/* ====================================================
                CREATE / EDIT FORM
            ==================================================== */}

            {showForm && (

                <section className="certification-form-section">

                    <div className="certification-form-header">

                        <div>

                            <span className="form-section-label">

                                {editingId
                                    ? "EDIT CERTIFICATION"
                                    : "NEW CERTIFICATION"}

                            </span>

                            <h2>

                                {editingId
                                    ? "Edit Certification"
                                    : "Create Certification"}

                            </h2>

                            <p>
                                Configure the certification details below.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="close-form-button"
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            &times;
                        </button>

                    </div>


                    <form
                        className="certification-form"
                        onSubmit={handleSubmit}
                    >

                        {/* TITLE */}

                        <div className="form-group full-width">

                            <label>
                                Certification Title <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Example: Java Coding Certification"
                                maxLength="150"
                            />

                        </div>


                        {/* DESCRIPTION */}

                        <div className="form-group full-width">

                            <label>
                                Description <span>*</span>
                            </label>

                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Describe what this certification evaluates..."
                                rows="3"
                                maxLength="1000"
                            />

                        </div>


                        {/* CATEGORY */}

                        <div className="form-group">

                            <label>
                                Category <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                placeholder="Example: Java"
                                maxLength="100"
                            />

                        </div>


                        {/* DIFFICULTY */}

                        <div className="form-group">

                            <label>
                                Difficulty <span>*</span>
                            </label>

                            <select
                                name="difficulty"
                                value={form.difficulty}
                                onChange={handleChange}
                            >

                                <option value="Easy">
                                    Easy
                                </option>

                                <option value="Intermediate">
                                    Intermediate
                                </option>

                                <option value="Hard">
                                    Hard
                                </option>

                            </select>

                        </div>


                        {/* DURATION */}

                        <div className="form-group">

                            <label>
                                Duration (Minutes) <span>*</span>
                            </label>

                            <input
                                type="number"
                                name="durationMinutes"
                                value={form.durationMinutes}
                                onChange={handleChange}
                                min="1"
                                step="1"
                            />

                        </div>


                        {/* QUESTIONS */}

                        <div className="form-group">

                            <label>
                                Total Questions <span>*</span>
                            </label>

                            <input
                                type="number"
                                name="totalQuestions"
                                value={form.totalQuestions}
                                onChange={handleChange}
                                min="1"
                                step="1"
                            />

                            <small>
                                Questions can be linked or created in the next step.
                            </small>

                        </div>


                        {/* PASSING PERCENTAGE */}

                        <div className="form-group">

                            <label>
                                Passing Percentage (%) <span>*</span>
                            </label>

                            <input
                                type="number"
                                name="passingPercentage"
                                value={form.passingPercentage}
                                onChange={handleChange}
                                min="1"
                                max="100"
                                step="1"
                            />

                        </div>


                        {/* STATUS */}

                        <div className="form-group">

                            <label>
                                Status
                            </label>

                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                            >

                                <option value="DRAFT">
                                    Draft
                                </option>

                                <option value="ACTIVE">
                                    Active
                                </option>

                                <option value="INACTIVE">
                                    Inactive
                                </option>

                            </select>

                            <small>
                                Only activate when all questions and test cases are ready.
                            </small>

                        </div>


                        {/* =================================================
                            RETAKE POLICY
                        ================================================= */}

                        <div className="form-group">

                            <label>
                                Allow Retake <span>*</span>
                            </label>

                            <select
                                value={
                                    form.allowRetake
                                        ? "true"
                                        : "false"
                                }
                                onChange={
                                    handleRetakeChange
                                }
                            >

                                <option value="false">
                                    No
                                </option>

                                <option value="true">
                                    Yes
                                </option>

                            </select>

                            <small>
                                Controls whether users may attempt the certification again after finishing an attempt.
                            </small>

                        </div>


                        {/* MAX ATTEMPTS */}

                        <div className="form-group">

                            <label>

                                Maximum Attempts

                                {form.allowRetake && (
                                    <span> *</span>
                                )}

                            </label>

                            <input
                                type="number"
                                name="maxAttempts"
                                value={
                                    form.maxAttempts
                                }
                                onChange={
                                    handleChange
                                }
                                min={
                                    form.allowRetake
                                        ? "2"
                                        : "1"
                                }
                                step="1"
                                disabled={
                                    !form.allowRetake
                                }
                            />

                            <small>

                                {form.allowRetake
                                    ? "This is the total number of attempts, including the first attempt."
                                    : "Retakes are disabled, so the user receives one total attempt."}

                            </small>

                        </div>


                        {/* ACTIONS */}

                        <div className="certification-form-actions">

                            <button
                                type="button"
                                className="cancel-form-button"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="save-certification-button"
                                disabled={saving}
                            >

                                {saving ? (

                                    <>

                                        <span className="button-spinner"></span>

                                        Saving...

                                    </>

                                ) : (

                                    editingId
                                        ? "Update Certification"
                                        : "Create Certification"
                                )}

                            </button>

                        </div>

                    </form>

                </section>
            )}


            {/* ====================================================
                LIST HEADER
            ==================================================== */}

            <div className="certification-list-header">

                <div>

                    <h2>
                        All Certifications
                    </h2>

                    <p>

                        {certifications.length} certification

                        {certifications.length !== 1
                            ? "s"
                            : ""} configured

                    </p>

                </div>


                <button
                    type="button"
                    className="refresh-certifications-button"
                    onClick={loadCertifications}
                >

                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    >
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                    </svg>

                    Refresh

                </button>

            </div>


            {/* ====================================================
                EMPTY
            ==================================================== */}

            {certifications.length === 0 ? (

                <div className="certification-empty-state">

                    <div className="empty-icon">
                        🎓
                    </div>

                    <h2>
                        No Certifications Yet
                    </h2>

                    <p>
                        Create your first coding certification to get started.
                    </p>

                    <button
                        type="button"
                        onClick={handleCreate}
                    >
                        + Create Certification
                    </button>

                </div>

            ) : (

                /* =================================================
                   CERTIFICATION LIST
                ================================================= */

                <div className="certification-admin-list">

                    {certifications.map(
                        cert => (

                            <article
                                className="admin-certification-card"
                                key={cert.id}
                            >

                                {/* =================================
                                    CARD HEADER
                                ================================= */}

                                <div className="admin-certification-card-header">

                                    <div className="certification-title-area">

                                        <div className="certification-card-icon">

                                            <svg
                                                width="22"
                                                height="22"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                                            </svg>

                                        </div>


                                        <div>

                                            <h3>
                                                {cert.title}
                                            </h3>

                                            <p>
                                                {cert.description}
                                            </p>

                                        </div>

                                    </div>


                                    <span
                                        className={
                                            `certification-status ${
                                                getStatusClass(
                                                    cert.status
                                                )
                                            }`
                                        }
                                    >
                                        {cert.status}
                                    </span>

                                </div>


                                {/* =================================
                                    CERTIFICATION INFORMATION
                                ================================= */}

                                <div className="admin-certification-info">

                                    <div className="certification-info-item">

                                        <span>
                                            Category
                                        </span>

                                        <strong>
                                            {cert.category}
                                        </strong>

                                    </div>


                                    <div className="certification-info-item">

                                        <span>
                                            Difficulty
                                        </span>

                                        <strong
                                            className={
                                                `difficulty-text ${
                                                    getDifficultyClass(
                                                        cert.difficulty
                                                    )
                                                }`
                                            }
                                        >
                                            {cert.difficulty}
                                        </strong>

                                    </div>


                                    <div className="certification-info-item">

                                        <span>
                                            Questions
                                        </span>

                                        <strong>
                                            {cert.totalQuestions}
                                        </strong>

                                    </div>


                                    <div className="certification-info-item">

                                        <span>
                                            Duration
                                        </span>

                                        <strong>
                                            {cert.durationMinutes} min
                                        </strong>

                                    </div>


                                    <div className="certification-info-item">

                                        <span>
                                            Passing
                                        </span>

                                        <strong>
                                            {cert.passingPercentage}%
                                        </strong>

                                    </div>


                                    <div className="certification-info-item">

                                        <span>
                                            Retake
                                        </span>

                                        <strong>

                                            {cert.allowRetake === true
                                                ? "Allowed"
                                                : "Not Allowed"}

                                        </strong>

                                    </div>


                                    <div className="certification-info-item">

                                        <span>
                                            Max Attempts
                                        </span>

                                        <strong>

                                            {cert.allowRetake === true
                                                ? Number(
                                                    cert.maxAttempts || 1
                                                )
                                                : 1}

                                        </strong>

                                    </div>

                                </div>


                                {/* =================================
                                    ACTIONS
                                ================================= */}

                                <div className="admin-certification-actions">

                                    {/* EDIT */}

                                    <button
                                        type="button"
                                        className="edit-certification-button"
                                        onClick={() =>
                                            handleEdit(cert)
                                        }
                                    >
                                        Edit
                                    </button>


                                    {/* MANAGE QUESTIONS */}

                                    <button
                                        type="button"
                                        className="manage-questions-button"
                                        onClick={() =>
                                            handleManageQuestions(
                                                cert.id
                                            )
                                        }
                                    >
                                        Manage Questions
                                    </button>


                                    {/* =================================
                                        VIEW RESULTS
                                    ================================= */}

                                    <button
                                        type="button"
                                        className="view-results-button"
                                        onClick={() =>
                                            handleViewResults(
                                                cert.id
                                            )
                                        }
                                    >
                                        View Results
                                    </button>


                                    {/* ACTIVATE / DEACTIVATE */}

                                    {cert.status === "ACTIVE" ? (

                                        <button
                                            type="button"
                                            className="deactivate-certification-button"
                                            onClick={() =>
                                                handleDeactivate(
                                                    cert
                                                )
                                            }
                                        >
                                            Deactivate
                                        </button>

                                    ) : (

                                        <button
                                            type="button"
                                            className="activate-certification-button"
                                            onClick={() =>
                                                handleActivate(
                                                    cert
                                                )
                                            }
                                        >
                                            Activate
                                        </button>
                                    )}


                                    {/* DELETE */}

                                    <button
                                        type="button"
                                        className="delete-certification-button"
                                        onClick={() =>
                                            handleDelete(cert)
                                        }
                                    >
                                        Delete
                                    </button>

                                </div>

                            </article>
                        )
                    )}

                </div>
            )}

        </div>
    );
}

export default AdminCertification;