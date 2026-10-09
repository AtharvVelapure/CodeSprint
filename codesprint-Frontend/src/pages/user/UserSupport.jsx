import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import axios from "axios";

import "./UserSupport.css";


const SUPPORT_CATEGORIES = [

    {
        value: "ACCOUNT_LOGIN",
        label: "Account / Login"
    },

    {
        value: "CODING_PROBLEM",
        label: "Coding Problem"
    },

    {
        value: "CODE_EXECUTION",
        label: "Code Execution"
    },

    {
        value: "SUBMISSION",
        label: "Submission"
    },

    {
        value: "CONTEST",
        label: "Contest"
    },

    {
        value: "CERTIFICATION",
        label: "Certification"
    },

    {
        value: "ASSESSMENT",
        label: "Assessment"
    },

    {
        value: "TECHNICAL_ISSUE",
        label: "Technical Issue"
    },

    {
        value: "OTHER",
        label: "Other"
    }

];


function UserSupport() {


    // ========================================
    // LOGGED-IN USER
    // ========================================

    const storedUser =
        localStorage.getItem("user");

    let user = null;

    try {

        user = storedUser
            ? JSON.parse(storedUser)
            : null;

    } catch (error) {

        console.error(
            "Invalid user data:",
            error
        );

        user = null;
    }


    // ========================================
    // STATE
    // ========================================

    const [
        activeTab,
        setActiveTab
    ] = useState("create");


    const [
        category,
        setCategory
    ] = useState("");


    const [
        subject,
        setSubject
    ] = useState("");


    const [
        description,
        setDescription
    ] = useState("");


    const [
        submitting,
        setSubmitting
    ] = useState(false);


    const [
        loadingTickets,
        setLoadingTickets
    ] = useState(false);


    const [
        tickets,
        setTickets
    ] = useState([]);


    const [
        error,
        setError
    ] = useState("");


    const [
        successTicket,
        setSuccessTicket
    ] = useState(null);


    // ========================================
    // CATEGORY MAP
    // ========================================

    const categoryMap = useMemo(() => {

        const map = {};

        SUPPORT_CATEGORIES.forEach(
            item => {

                map[item.value] =
                    item.label;
            }
        );

        return map;

    }, []);


    // ========================================
    // LOAD USER TICKETS
    // ========================================

    const loadTickets = useCallback(
        async () => {

            if (!user?.id) {

                setTickets([]);

                return;
            }

            try {

                setLoadingTickets(true);

                setError("");

                const response =
                    await axios.get(
                        `/api/support/tickets/user/${user.id}`
                    );

                setTickets(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );

            } catch (error) {

                console.error(
                    "Support ticket loading error:",
                    error
                );

                setError(
                    error?.response?.data ||
                    "Unable to load your support tickets."
                );

            } finally {

                setLoadingTickets(false);
            }
        },
        [user?.id]
    );


    // ========================================
    // INITIAL LOAD
    // ========================================

    useEffect(() => {

        loadTickets();

    }, [loadTickets]);


    // ========================================
    // CREATE TICKET
    // ========================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

        setSuccessTicket(null);


        if (!user?.id) {

            setError(
                "Please login to create a support ticket."
            );

            return;
        }


        if (!category) {

            setError(
                "Please select a support category."
            );

            return;
        }


        if (!subject.trim()) {

            setError(
                "Please enter a subject."
            );

            return;
        }


        if (!description.trim()) {

            setError(
                "Please describe the issue."
            );

            return;
        }


        try {

            setSubmitting(true);


            const response =
                await axios.post(
                    "/api/support/tickets",
                    {
                        userId: user.id,
                        category: category,
                        subject: subject.trim(),
                        description:
                            description.trim()
                    }
                );


            setSuccessTicket(
                response.data
            );


            setCategory("");

            setSubject("");

            setDescription("");


            await loadTickets();


        } catch (error) {

            console.error(
                "Support ticket creation error:",
                error
            );

            setError(
                error?.response?.data ||
                "Unable to create support ticket."
            );

        } finally {

            setSubmitting(false);
        }
    };


    // ========================================
    // FORMAT DATE
    // ========================================

    const formatDateTime = (value) => {

        if (!value) {
            return "-";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "-";
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


    // ========================================
    // FORMAT CATEGORY
    // ========================================

    const formatCategory = (value) => {

        if (!value) {
            return "-";
        }

        return categoryMap[value] || value;
    };


    // ========================================
    // STATUS CLASS
    // ========================================

    const getStatusClass = (status) => {

        if (!status) {
            return "";
        }

        return status
            .toLowerCase()
            .replaceAll("_", "-");
    };


    // ========================================
    // STATUS LABEL
    // ========================================

    const getStatusLabel = (status) => {

        if (!status) {
            return "-";
        }

        if (status === "IN_PROGRESS") {
            return "In Progress";
        }

        if (status === "RESOLVED") {
            return "Resolved";
        }

        return "Open";
    };


    // ========================================
    // OPEN MY TICKETS
    // ========================================

    const openMyTickets = async () => {

        setActiveTab("tickets");

        setError("");

        await loadTickets();
    };


    // ========================================
    // UI
    // ========================================

    return (

        <div className="user-support-page">


            {/* ========================================
                PAGE HEADER
            ======================================== */}

            <section className="user-support-header">

                <div>

                    <span className="user-support-eyebrow">
                        Help Center
                    </span>

                    <h1>
                        CodeSprint Support
                    </h1>

                    <p>
                        Need help with CodeSprint?
                        Create a support ticket and
                        track its progress here.
                    </p>

                </div>


                <div className="user-support-header-icon">
                    🎧
                </div>

            </section>


            {/* ========================================
                SUPPORT STATS
            ======================================== */}

            <section className="user-support-stats">

                <div className="user-support-stat-card">

                    <span>
                        Total Tickets
                    </span>

                    <strong>
                        {tickets.length}
                    </strong>

                </div>


                <div className="user-support-stat-card">

                    <span>
                        Open
                    </span>

                    <strong>
                        {
                            tickets.filter(
                                ticket =>
                                    ticket.status ===
                                    "OPEN"
                            ).length
                        }
                    </strong>

                </div>


                <div className="user-support-stat-card">

                    <span>
                        In Progress
                    </span>

                    <strong>
                        {
                            tickets.filter(
                                ticket =>
                                    ticket.status ===
                                    "IN_PROGRESS"
                            ).length
                        }
                    </strong>

                </div>


                <div className="user-support-stat-card">

                    <span>
                        Resolved
                    </span>

                    <strong>
                        {
                            tickets.filter(
                                ticket =>
                                    ticket.status ===
                                    "RESOLVED"
                            ).length
                        }
                    </strong>

                </div>

            </section>


            {/* ========================================
                TAB NAVIGATION
            ======================================== */}

            <div className="user-support-tabs">

                <button
                    type="button"
                    className={
                        activeTab === "create"
                            ? "user-support-tab active"
                            : "user-support-tab"
                    }
                    onClick={() => {

                        setActiveTab("create");

                        setError("");
                    }}
                >
                    <span>
                        ＋
                    </span>

                    Create Ticket
                </button>


                <button
                    type="button"
                    className={
                        activeTab === "tickets"
                            ? "user-support-tab active"
                            : "user-support-tab"
                    }
                    onClick={openMyTickets}
                >
                    <span>
                        ☷
                    </span>

                    My Tickets

                    <span className="user-support-tab-count">
                        {tickets.length}
                    </span>

                </button>

            </div>


            {/* ========================================
                ERROR
            ======================================== */}

            {error && (

                <div className="user-support-alert error">

                    <span>
                        !
                    </span>

                    <div>

                        <strong>
                            Something went wrong
                        </strong>

                        <p>
                            {error}
                        </p>

                    </div>

                </div>

            )}


            {/* ========================================
                CREATE TICKET
            ======================================== */}

            {activeTab === "create" && (

                <section className="user-support-create-layout">


                    {/* FORM */}

                    <div className="user-support-card">

                        <div className="user-support-card-header">

                            <div>

                                <h2>
                                    Create a Support Ticket
                                </h2>

                                <p>
                                    Tell us about the issue
                                    you're experiencing.
                                </p>

                            </div>

                        </div>


                        {successTicket && (

                            <div className="user-support-success">

                                <div className="user-support-success-icon">
                                    ✓
                                </div>

                                <div>

                                    <strong>
                                        Ticket created successfully
                                    </strong>

                                    <p>
                                        Your ticket number is
                                        {" "}
                                        <b>
                                            {
                                                successTicket.ticketNumber
                                            }
                                        </b>
                                        .
                                        A confirmation email
                                        has been sent to
                                        {" "}
                                        {
                                            successTicket.userEmail
                                        }
                                        .
                                    </p>

                                </div>

                            </div>

                        )}


                        <form
                            className="user-support-form"
                            onSubmit={handleSubmit}
                        >


                            {/* CATEGORY */}

                            <div className="user-support-field">

                                <label htmlFor="support-category">
                                    Category
                                    <span>
                                        *
                                    </span>
                                </label>

                                <select
                                    id="support-category"
                                    value={category}
                                    onChange={
                                        event =>
                                            setCategory(
                                                event.target.value
                                            )
                                    }
                                    disabled={submitting}
                                >

                                    <option value="">
                                        Select a category
                                    </option>

                                    {
                                        SUPPORT_CATEGORIES.map(
                                            item => (

                                                <option
                                                    key={item.value}
                                                    value={item.value}
                                                >
                                                    {item.label}
                                                </option>

                                            )
                                        )
                                    }

                                </select>

                            </div>


                            {/* SUBJECT */}

                            <div className="user-support-field">

                                <div className="user-support-label-row">

                                    <label htmlFor="support-subject">
                                        Subject
                                        <span>
                                            *
                                        </span>
                                    </label>

                                    <small>
                                        {subject.length} / 200
                                    </small>

                                </div>

                                <input
                                    id="support-subject"
                                    type="text"
                                    value={subject}
                                    maxLength={200}
                                    placeholder="Briefly describe your issue"
                                    onChange={
                                        event =>
                                            setSubject(
                                                event.target.value
                                            )
                                    }
                                    disabled={submitting}
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="user-support-field">

                                <label htmlFor="support-description">
                                    Description
                                    <span>
                                        *
                                    </span>
                                </label>

                                <textarea
                                    id="support-description"
                                    value={description}
                                    rows={8}
                                    placeholder="Describe what happened, what you expected, and any error message you received..."
                                    onChange={
                                        event =>
                                            setDescription(
                                                event.target.value
                                            )
                                    }
                                    disabled={submitting}
                                />

                                <small className="user-support-field-help">
                                    Please provide enough information
                                    for our support team to understand
                                    the issue.
                                </small>

                            </div>


                            {/* SUBMIT */}

                            <div className="user-support-form-actions">

                                <button
                                    type="button"
                                    className="user-support-secondary-button"
                                    disabled={submitting}
                                    onClick={() => {

                                        setCategory("");

                                        setSubject("");

                                        setDescription("");

                                        setError("");
                                    }}
                                >
                                    Clear
                                </button>


                                <button
                                    type="submit"
                                    className="user-support-primary-button"
                                    disabled={submitting}
                                >

                                    {
                                        submitting
                                            ? "Submitting..."
                                            : "Submit Ticket"
                                    }

                                </button>

                            </div>

                        </form>

                    </div>


                    {/* HELP PANEL */}

                    <aside className="user-support-help-card">

                        <div className="user-support-help-icon">
                            💡
                        </div>

                        <h3>
                            Before submitting
                        </h3>

                        <p>
                            Providing clear details helps
                            the support team understand and
                            resolve your issue faster.
                        </p>


                        <div className="user-support-help-list">

                            <div>

                                <span>
                                    1
                                </span>

                                <p>
                                    Choose the category that
                                    best matches your issue.
                                </p>

                            </div>


                            <div>

                                <span>
                                    2
                                </span>

                                <p>
                                    Use a short and clear
                                    subject.
                                </p>

                            </div>


                            <div>

                                <span>
                                    3
                                </span>

                                <p>
                                    Include error messages or
                                    the steps that caused the
                                    problem.
                                </p>

                            </div>


                            <div>

                                <span>
                                    4
                                </span>

                                <p>
                                    Keep your ticket number
                                    for future reference.
                                </p>

                            </div>

                        </div>


                        <div className="user-support-email-note">

                            <span>
                                ✉
                            </span>

                            <p>
                                You'll receive an email when
                                your ticket is created and
                                another email when it is
                                resolved.
                            </p>

                        </div>

                    </aside>

                </section>

            )}


            {/* ========================================
                MY TICKETS
            ======================================== */}

            {activeTab === "tickets" && (

                <section className="user-support-card">


                    <div className="user-support-card-header user-support-ticket-header">

                        <div>

                            <h2>
                                My Support Tickets
                            </h2>

                            <p>
                                Track all support requests
                                you've submitted.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="user-support-refresh-button"
                            onClick={loadTickets}
                            disabled={loadingTickets}
                        >
                            ↻
                            {" "}
                            {
                                loadingTickets
                                    ? "Refreshing..."
                                    : "Refresh"
                            }
                        </button>

                    </div>


                    {loadingTickets ? (

                        <div className="user-support-empty">

                            <div className="user-support-loader" />

                            <h3>
                                Loading tickets...
                            </h3>

                            <p>
                                Please wait while we load
                                your support requests.
                            </p>

                        </div>

                    ) : tickets.length === 0 ? (

                        <div className="user-support-empty">

                            <div className="user-support-empty-icon">
                                🎫
                            </div>

                            <h3>
                                No support tickets yet
                            </h3>

                            <p>
                                If you need help, create your
                                first support ticket.
                            </p>

                            <button
                                type="button"
                                className="user-support-primary-button"
                                onClick={() =>
                                    setActiveTab("create")
                                }
                            >
                                Create Ticket
                            </button>

                        </div>

                    ) : (

                        <div className="user-support-ticket-list">

                            {
                                tickets.map(
                                    ticket => (

                                        <article
                                            key={ticket.id}
                                            className="user-support-ticket"
                                        >

                                            <div className="user-support-ticket-top">

                                                <div>

                                                    <div className="user-support-ticket-number-row">

                                                        <strong className="user-support-ticket-number">
                                                            {
                                                                ticket.ticketNumber
                                                            }
                                                        </strong>

                                                        <span
                                                            className={
                                                                `user-support-status ${getStatusClass(
                                                                    ticket.status
                                                                )}`
                                                            }
                                                        >
                                                            {
                                                                getStatusLabel(
                                                                    ticket.status
                                                                )
                                                            }
                                                        </span>

                                                    </div>


                                                    <h3>
                                                        {
                                                            ticket.subject
                                                        }
                                                    </h3>

                                                </div>


                                                <div className="user-support-ticket-date">

                                                    <span>
                                                        Created
                                                    </span>

                                                    <strong>
                                                        {
                                                            formatDateTime(
                                                                ticket.createdAt
                                                            )
                                                        }
                                                    </strong>

                                                </div>

                                            </div>


                                            <div className="user-support-ticket-meta">

                                                <span>
                                                    <b>
                                                        Category:
                                                    </b>

                                                    {
                                                        formatCategory(
                                                            ticket.category
                                                        )
                                                    }
                                                </span>


                                                <span>
                                                    <b>
                                                        Last Updated:
                                                    </b>

                                                    {
                                                        formatDateTime(
                                                            ticket.updatedAt
                                                        )
                                                    }
                                                </span>

                                            </div>


                                            <div className="user-support-ticket-description">

                                                <span>
                                                    Issue Description
                                                </span>

                                                <p>
                                                    {
                                                        ticket.description
                                                    }
                                                </p>

                                            </div>


                                            {
                                                ticket.status ===
                                                "RESOLVED" &&
                                                ticket.resolutionMessage && (

                                                    <div className="user-support-resolution">

                                                        <div className="user-support-resolution-title">

                                                            <span>
                                                                ✓
                                                            </span>

                                                            <strong>
                                                                Resolution
                                                            </strong>

                                                        </div>

                                                        <p>
                                                            {
                                                                ticket.resolutionMessage
                                                            }
                                                        </p>

                                                        {
                                                            ticket.resolvedAt && (

                                                                <small>
                                                                    Resolved on
                                                                    {" "}
                                                                    {
                                                                        formatDateTime(
                                                                            ticket.resolvedAt
                                                                        )
                                                                    }
                                                                </small>

                                                            )
                                                        }

                                                    </div>

                                                )
                                            }

                                        </article>

                                    )
                                )
                            }

                        </div>

                    )}

                </section>

            )}

        </div>
    );
}


export default UserSupport;