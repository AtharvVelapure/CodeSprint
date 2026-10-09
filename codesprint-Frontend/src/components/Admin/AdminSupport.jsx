import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./AdminSupport.css";

function AdminSupport() {

    // ========================================
    // STATE
    // ========================================

    const [tickets, setTickets] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [categoryFilter, setCategoryFilter] =
        useState("ALL");

    const [selectedTicket, setSelectedTicket] =
        useState(null);

    const [resolutionMessage, setResolutionMessage] =
        useState("");

    const [updating, setUpdating] =
        useState(false);

    const [actionError, setActionError] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");


    // ========================================
    // LOGGED-IN ADMIN
    // ========================================

    const admin = useMemo(() => {

        try {

            const storedUser =
                localStorage.getItem("user");

            return storedUser
                ? JSON.parse(storedUser)
                : null;

        } catch (error) {

            console.error(
                "Unable to read admin from localStorage:",
                error
            );

            return null;
        }

    }, []);


    // ========================================
    // LOAD TICKETS
    // ========================================

    const loadTickets = useCallback(async () => {

        try {

            setLoading(true);

            setError("");

            const response =
                await axios.get(
                    "/api/support/admin/tickets"
                );

            const data =
                Array.isArray(response.data)
                    ? response.data
                    : [];

            setTickets(data);

        } catch (error) {

            console.error(
                "Unable to load support tickets:",
                error
            );

            setError(
                error.response?.data ||
                "Unable to load support tickets."
            );

        } finally {

            setLoading(false);
        }

    }, []);


    // ========================================
    // INITIAL LOAD
    // ========================================

    useEffect(() => {

        loadTickets();

    }, [loadTickets]);


    // ========================================
    // STATISTICS
    // ========================================

    const statistics = useMemo(() => {

        const total =
            tickets.length;

        const open =
            tickets.filter(
                ticket =>
                    ticket.status === "OPEN"
            ).length;

        const inProgress =
            tickets.filter(
                ticket =>
                    ticket.status ===
                    "IN_PROGRESS"
            ).length;

        const resolved =
            tickets.filter(
                ticket =>
                    ticket.status ===
                    "RESOLVED"
            ).length;

        return {
            total,
            open,
            inProgress,
            resolved
        };

    }, [tickets]);


    // ========================================
    // CATEGORIES
    // ========================================

    const categories = useMemo(() => {

        return [
            ...new Set(
                tickets
                    .map(
                        ticket =>
                            ticket.category
                    )
                    .filter(Boolean)
            )
        ].sort();

    }, [tickets]);


    // ========================================
    // FILTER TICKETS
    // ========================================

    const filteredTickets = useMemo(() => {

        const searchValue =
            search
                .trim()
                .toLowerCase();

        return tickets.filter(ticket => {

            const matchesStatus =
                statusFilter === "ALL" ||
                ticket.status === statusFilter;

            const matchesCategory =
                categoryFilter === "ALL" ||
                ticket.category ===
                    categoryFilter;

            const matchesSearch =
                !searchValue ||
                [
                    ticket.ticketNumber,
                    ticket.userName,
                    ticket.userEmail,
                    ticket.subject,
                    ticket.category
                ]
                    .filter(Boolean)
                    .some(
                        value =>
                            String(value)
                                .toLowerCase()
                                .includes(
                                    searchValue
                                )
                    );

            return (
                matchesStatus &&
                matchesCategory &&
                matchesSearch
            );

        });

    }, [
        tickets,
        search,
        statusFilter,
        categoryFilter
    ]);


    // ========================================
    // FORMAT CATEGORY
    // ========================================

    const formatCategory = value => {

        if (!value) {
            return "-";
        }

        return value
            .toLowerCase()
            .split("_")
            .map(
                word =>
                    word.charAt(0)
                        .toUpperCase() +
                    word.slice(1)
            )
            .join(" ");
    };


    // ========================================
    // FORMAT STATUS
    // ========================================

    const formatStatus = value => {

        if (!value) {
            return "-";
        }

        if (value === "IN_PROGRESS") {
            return "In Progress";
        }

        if (value === "RESOLVED") {
            return "Resolved";
        }

        return "Open";
    };


    // ========================================
    // FORMAT DATE
    // ========================================

    const formatDateTime = value => {

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
    // OPEN DETAILS
    // ========================================

    const openTicket = ticket => {

        setSelectedTicket(ticket);

        setResolutionMessage(
            ticket.resolutionMessage || ""
        );

        setActionError("");

        setSuccessMessage("");
    };


    // ========================================
    // CLOSE DETAILS
    // ========================================

    const closeTicket = () => {

        if (updating) {
            return;
        }

        setSelectedTicket(null);

        setResolutionMessage("");

        setActionError("");

        setSuccessMessage("");
    };


    // ========================================
    // UPDATE STATUS
    // ========================================

    const updateTicketStatus =
        async (newStatus) => {

            if (!selectedTicket) {
                return;
            }

            if (!admin?.id) {

                setActionError(
                    "Logged-in admin information is not available."
                );

                return;
            }

            if (
                newStatus === "RESOLVED" &&
                !resolutionMessage.trim()
            ) {

                setActionError(
                    "Resolution message is required before resolving the ticket."
                );

                return;
            }

            try {

                setUpdating(true);

                setActionError("");

                setSuccessMessage("");

                const response =
                    await axios.put(
                        `/api/support/admin/tickets/${selectedTicket.id}/status`,
                        {
                            adminUserId:
                                admin.id,

                            status:
                                newStatus,

                            resolutionMessage:
                                newStatus ===
                                "RESOLVED"
                                    ? resolutionMessage.trim()
                                    : null
                        }
                    );

                const updatedTicket =
                    response.data;

                setTickets(
                    previousTickets =>
                        previousTickets.map(
                            ticket =>
                                ticket.id ===
                                updatedTicket.id
                                    ? updatedTicket
                                    : ticket
                        )
                );

                setSelectedTicket(
                    updatedTicket
                );

                if (
                    newStatus ===
                    "IN_PROGRESS"
                ) {

                    setSuccessMessage(
                        "Ticket marked as In Progress."
                    );
                }

                if (
                    newStatus ===
                    "RESOLVED"
                ) {

                    setSuccessMessage(
                        "Ticket resolved successfully. The user has been notified by email."
                    );
                }

            } catch (error) {

                console.error(
                    "Unable to update ticket:",
                    error
                );

                setActionError(
                    error.response?.data ||
                    "Unable to update support ticket."
                );

            } finally {

                setUpdating(false);
            }
        };


    // ========================================
    // LOADING
    // ========================================

    if (loading) {

        return (
            <div className="admin-support">

                <div className="admin-support-header">

                    <div>
                        <h1>
                            Support Management
                        </h1>

                        <p>
                            Loading support tickets...
                        </p>
                    </div>

                </div>

            </div>
        );
    }


    // ========================================
    // ERROR
    // ========================================

    if (error) {

        return (
            <div className="admin-support">

                <div className="admin-support-header">

                    <div>
                        <h1>
                            Support Management
                        </h1>

                        <p className="admin-support-error">
                            {String(error)}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-support-refresh"
                        onClick={loadTickets}
                    >
                        Retry
                    </button>

                </div>

            </div>
        );
    }


    // ========================================
    // MAIN PAGE
    // ========================================

    return (
        <div className="admin-support">

            {/* HEADER */}

            <div className="admin-support-header">

                <div>

                    <h1>
                        Support Management
                    </h1>

                    <p>
                        Review and resolve CodeSprint user support requests.
                    </p>

                </div>

                <button
                    type="button"
                    className="admin-support-refresh"
                    onClick={loadTickets}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* STATISTICS */}

            <div className="admin-support-stats">

                <div className="admin-support-stat-card">

                    <span>
                        Total Tickets
                    </span>

                    <strong>
                        {statistics.total}
                    </strong>

                </div>


                <div className="admin-support-stat-card">

                    <span>
                        Open
                    </span>

                    <strong>
                        {statistics.open}
                    </strong>

                </div>


                <div className="admin-support-stat-card">

                    <span>
                        In Progress
                    </span>

                    <strong>
                        {statistics.inProgress}
                    </strong>

                </div>


                <div className="admin-support-stat-card">

                    <span>
                        Resolved
                    </span>

                    <strong>
                        {statistics.resolved}
                    </strong>

                </div>

            </div>


            {/* FILTERS */}

            <section className="admin-support-panel">

                <div className="admin-support-filters">

                    <div className="admin-support-search">

                        <span>
                            ⌕
                        </span>

                        <input
                            type="text"
                            placeholder="Search ticket number, user, email or subject..."
                            value={search}
                            onChange={
                                event =>
                                    setSearch(
                                        event.target.value
                                    )
                            }
                        />

                    </div>


                    <select
                        value={statusFilter}
                        onChange={
                            event =>
                                setStatusFilter(
                                    event.target.value
                                )
                        }
                    >
                        <option value="ALL">
                            All Statuses
                        </option>

                        <option value="OPEN">
                            Open
                        </option>

                        <option value="IN_PROGRESS">
                            In Progress
                        </option>

                        <option value="RESOLVED">
                            Resolved
                        </option>
                    </select>


                    <select
                        value={categoryFilter}
                        onChange={
                            event =>
                                setCategoryFilter(
                                    event.target.value
                                )
                        }
                    >
                        <option value="ALL">
                            All Categories
                        </option>

                        {categories.map(
                            category => (
                                <option
                                    key={category}
                                    value={category}
                                >
                                    {formatCategory(
                                        category
                                    )}
                                </option>
                            )
                        )}

                    </select>

                </div>


                {/* TABLE */}

                <div className="admin-support-table-wrapper">

                    <table className="admin-support-table">

                        <thead>

                            <tr>
                                <th>Ticket</th>
                                <th>User</th>
                                <th>Category</th>
                                <th>Subject</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Action</th>
                            </tr>

                        </thead>

                        <tbody>

                            {filteredTickets.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="7"
                                        className="admin-support-empty"
                                    >
                                        No support tickets found.
                                    </td>

                                </tr>

                            ) : (

                                filteredTickets.map(
                                    ticket => (

                                        <tr key={ticket.id}>

                                            <td>

                                                <strong className="ticket-number">
                                                    {ticket.ticketNumber}
                                                </strong>

                                            </td>


                                            <td>

                                                <div className="admin-ticket-user">

                                                    <strong>
                                                        {ticket.userName}
                                                    </strong>

                                                    <span>
                                                        {ticket.userEmail}
                                                    </span>

                                                </div>

                                            </td>


                                            <td>

                                                {formatCategory(
                                                    ticket.category
                                                )}

                                            </td>


                                            <td>

                                                <span className="admin-ticket-subject">
                                                    {ticket.subject}
                                                </span>

                                            </td>


                                            <td>

                                                <span
                                                    className={`admin-ticket-status status-${ticket.status?.toLowerCase()}`}
                                                >
                                                    {formatStatus(
                                                        ticket.status
                                                    )}
                                                </span>

                                            </td>


                                            <td>

                                                {formatDateTime(
                                                    ticket.createdAt
                                                )}

                                            </td>


                                            <td>

                                                <button
                                                    type="button"
                                                    className="admin-ticket-view"
                                                    onClick={
                                                        () =>
                                                            openTicket(
                                                                ticket
                                                            )
                                                    }
                                                >
                                                    View
                                                </button>

                                            </td>

                                        </tr>
                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </section>


            {/* ========================================
                TICKET DETAILS MODAL
            ======================================== */}

            {selectedTicket && (

                <div
                    className="admin-ticket-modal-overlay"
                    onMouseDown={
                        event => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeTicket();
                            }
                        }
                    }
                >

                    <div className="admin-ticket-modal">

                        <div className="admin-ticket-modal-header">

                            <div>

                                <span className="admin-ticket-modal-label">
                                    Support Ticket
                                </span>

                                <h2>
                                    {selectedTicket.ticketNumber}
                                </h2>

                            </div>

                            <button
                                type="button"
                                className="admin-ticket-modal-close"
                                onClick={closeTicket}
                                disabled={updating}
                            >
                                ×
                            </button>

                        </div>


                        <div className="admin-ticket-modal-content">


                            {/* STATUS */}

                            <div className="admin-ticket-detail-row">

                                <span>
                                    Status
                                </span>

                                <strong>
                                    <span
                                        className={`admin-ticket-status status-${selectedTicket.status?.toLowerCase()}`}
                                    >
                                        {formatStatus(
                                            selectedTicket.status
                                        )}
                                    </span>
                                </strong>

                            </div>


                            {/* USER */}

                            <div className="admin-ticket-detail-grid">

                                <div>

                                    <span className="admin-ticket-detail-label">
                                        User
                                    </span>

                                    <strong>
                                        {selectedTicket.userName}
                                    </strong>

                                </div>


                                <div>

                                    <span className="admin-ticket-detail-label">
                                        Email
                                    </span>

                                    <strong>
                                        {selectedTicket.userEmail}
                                    </strong>

                                </div>


                                <div>

                                    <span className="admin-ticket-detail-label">
                                        Category
                                    </span>

                                    <strong>
                                        {formatCategory(
                                            selectedTicket.category
                                        )}
                                    </strong>

                                </div>


                                <div>

                                    <span className="admin-ticket-detail-label">
                                        Created
                                    </span>

                                    <strong>
                                        {formatDateTime(
                                            selectedTicket.createdAt
                                        )}
                                    </strong>

                                </div>

                            </div>


                            {/* SUBJECT */}

                            <div className="admin-ticket-message-block">

                                <span className="admin-ticket-detail-label">
                                    Subject
                                </span>

                                <strong>
                                    {selectedTicket.subject}
                                </strong>

                            </div>


                            {/* DESCRIPTION */}

                            <div className="admin-ticket-message-block">

                                <span className="admin-ticket-detail-label">
                                    User Description
                                </span>

                                <p>
                                    {selectedTicket.description}
                                </p>

                            </div>


                            {/* RESOLUTION */}

                            {selectedTicket.status ===
                                "RESOLVED" ? (

                                <div className="admin-ticket-resolution">

                                    <span className="admin-ticket-detail-label">
                                        Resolution
                                    </span>

                                    <p>
                                        {selectedTicket.resolutionMessage}
                                    </p>

                                    <small>
                                        Resolved{" "}
                                        {formatDateTime(
                                            selectedTicket.resolvedAt
                                        )}
                                    </small>

                                </div>

                            ) : (

                                <div className="admin-ticket-resolution-form">

                                    <label htmlFor="resolutionMessage">
                                        Resolution Message
                                    </label>

                                    <textarea
                                        id="resolutionMessage"
                                        rows="6"
                                        placeholder="Explain how this issue was resolved..."
                                        value={resolutionMessage}
                                        onChange={
                                            event =>
                                                setResolutionMessage(
                                                    event.target.value
                                                )
                                        }
                                    />

                                    <small>
                                        A resolution message is required when resolving the ticket.
                                    </small>

                                </div>

                            )}


                            {/* ERRORS */}

                            {actionError && (

                                <div className="admin-ticket-action-error">
                                    {String(actionError)}
                                </div>

                            )}


                            {successMessage && (

                                <div className="admin-ticket-action-success">
                                    {successMessage}
                                </div>

                            )}

                        </div>


                        {/* ACTIONS */}

                        <div className="admin-ticket-modal-actions">

                            <button
                                type="button"
                                className="admin-ticket-secondary-button"
                                onClick={closeTicket}
                                disabled={updating}
                            >
                                Close
                            </button>


                            {selectedTicket.status ===
                                "OPEN" && (

                                <button
                                    type="button"
                                    className="admin-ticket-progress-button"
                                    onClick={
                                        () =>
                                            updateTicketStatus(
                                                "IN_PROGRESS"
                                            )
                                    }
                                    disabled={updating}
                                >
                                    {updating
                                        ? "Updating..."
                                        : "Mark In Progress"}
                                </button>

                            )}


                            {selectedTicket.status !==
                                "RESOLVED" && (

                                <button
                                    type="button"
                                    className="admin-ticket-resolve-button"
                                    onClick={
                                        () =>
                                            updateTicketStatus(
                                                "RESOLVED"
                                            )
                                    }
                                    disabled={updating}
                                >
                                    {updating
                                        ? "Updating..."
                                        : "Resolve Ticket"}
                                </button>

                            )}

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AdminSupport;