import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import "./ContestManagement.css";



import ContestParticipantManagement from "./ContestParticipantManagement";

import AdminContestLiveMonitor from "./AdminContestLiveMonitor";





const API_URL = "/api/contests";



function ContestManagement() {



    const navigate = useNavigate();



    const [contests, setContests] = useState([]);

    const [loading, setLoading] = useState(true);



    const [message, setMessage] = useState("");

    const [error, setError] = useState("");



    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("ALL");



    const [showForm, setShowForm] = useState(false);

    const [editingContest, setEditingContest] = useState(null);





    const [selectedParticipantsContest,setSelectedParticipantsContest] = useState(null);



    const [ processingContestId, setProcessingContestId ] = useState(null);



    const [selectedMonitorContest,setSelectedMonitorContest] = useState(null);



    const [form, setForm] = useState({

        title: "",

        description: "",

        registrationStartTime: "",

        registrationEndTime: "",

        startTime: "",

        durationMinutes: ""

    });



    // =========================================================

    // CURRENT ADMIN

    // =========================================================



    const getCurrentUser = () => {



        try {



            const storedUser =

                localStorage.getItem("user");



            return storedUser

                ? JSON.parse(storedUser)

                : null;



        } catch (err) {



            console.error(

                "Unable to read logged-in user:",

                err

            );



            return null;

        }

    };



    // =========================================================

    // LOAD

    // =========================================================



    useEffect(() => {



        loadContests();



    }, []);



    const loadContests = async () => {



        try {



            setLoading(true);

            setError("");



            const response =

                await fetch(API_URL);



            if (!response.ok) {



                throw new Error(

                    "Failed to load contests"

                );

            }



            const data =

                await response.json();



            setContests(

                Array.isArray(data)

                    ? data

                    : []

            );



        } catch (err) {



            console.error(err);



            setError(

                "Unable to load contests. Please make sure the backend is running."

            );



        } finally {



            setLoading(false);

        }

    };



    // =========================================================

    // FORM

    // =========================================================



    const handleInputChange = (

        event

    ) => {



        const {

            name,

            value

        } = event.target;



        setForm(

            (previous) => ({

                ...previous,

                [name]: value

            })

        );

    };



    const resetForm = () => {



        setForm({

            title: "",

            description: "",

            registrationStartTime: "",

            registrationEndTime: "",

            startTime: "",

            durationMinutes: ""

        });



        setEditingContest(null);

        setShowForm(false);

    };



    const handleCreate = () => {



        setEditingContest(null);



        setForm({

            title: "",

            description: "",

            registrationStartTime: "",

            registrationEndTime: "",

            startTime: "",

            durationMinutes: ""

        });



        setMessage("");

        setError("");

        setShowForm(true);

    };



    const handleEdit = (

        contest

    ) => {



        if (

            contest.status !== "DRAFT" &&

            contest.status !== "UPCOMING"

        ) {



            setError(

                "Only DRAFT or UPCOMING contests can be edited."

            );



            return;

        }



        setEditingContest(

            contest

        );



        setForm({

            title:

                contest.title || "",



            description:

                contest.description || "",



            registrationStartTime:

                contest.registrationStartTime

                    ? contest.registrationStartTime.substring(0, 16)

                    : "",



            registrationEndTime:

                contest.registrationEndTime

                    ? contest.registrationEndTime.substring(0, 16)

                    : "",



            startTime:

                contest.startTime

                    ? contest.startTime.substring(0, 16)

                    : "",



            durationMinutes:

                contest.durationMinutes || ""

        });



        setMessage("");

        setError("");

        setShowForm(true);

    };



    // =========================================================

    // SAVE CONTEST

    // =========================================================



    const handleSubmit = async (

        event

    ) => {



        event.preventDefault();



        setMessage("");

        setError("");



        if (!form.title.trim()) {



            setError(

                "Contest title is required."

            );



            return;

        }



        if (!form.startTime) {



            setError(

                "Contest start time is required."

            );



            return;

        }



        if (

            !form.durationMinutes ||

            Number(form.durationMinutes) <= 0

        ) {



            setError(

                "Duration must be greater than 0 minutes."

            );



            return;

        }



        if (

            form.registrationStartTime &&

            form.registrationEndTime &&

            new Date(

                form.registrationEndTime

            ).getTime() <

            new Date(

                form.registrationStartTime

            ).getTime()

        ) {



            setError(

                "Registration end time cannot be before registration start time."

            );



            return;

        }



        if (

            form.registrationEndTime &&

            new Date(

                form.registrationEndTime

            ).getTime() >

            new Date(

                form.startTime

            ).getTime()

        ) {



            setError(

                "Registration deadline cannot be after the contest start time."

            );



            return;

        }



        try {



            let response;



            const requestBody = {



                title:

                    form.title.trim(),



                description:

                    form.description.trim(),



                registrationStartTime:

                    form.registrationStartTime || null,



                registrationEndTime:

                    form.registrationEndTime || null,



                startTime:

                    form.startTime,



                durationMinutes:

                    Number(

                        form.durationMinutes

                    )

            };



            if (editingContest) {



                response =

                    await fetch(

                        `${API_URL}/${editingContest.id}`,

                        {

                            method: "PUT",



                            headers: {

                                "Content-Type":

                                    "application/json"

                            },



                            body:

                                JSON.stringify(

                                    requestBody

                                )

                        }

                    );



            } else {



                const user =

                    getCurrentUser();



                if (

                    !user ||

                    !user.id

                ) {



                    setError(

                        "Unable to identify the logged-in admin."

                    );



                    return;

                }



                response =

                    await fetch(

                        `${API_URL}?createdByUserId=${user.id}`,

                        {

                            method: "POST",



                            headers: {

                                "Content-Type":

                                    "application/json"

                            },



                            body:

                                JSON.stringify(

                                    requestBody

                                )

                        }

                    );

            }



            if (!response.ok) {



                throw new Error(

                    await getResponseError(

                        response,

                        "Unable to save contest."

                    )

                );

            }



            setMessage(

                editingContest

                    ? "Contest updated successfully."

                    : "Contest created successfully as DRAFT."

            );



            resetForm();



            await loadContests();



        } catch (err) {



            console.error(err);



            setError(

                err.message ||

                "Unable to save contest."

            );

        }

    };



    // =========================================================

    // RESPONSE ERROR

    // =========================================================



    const getResponseError = async (

        response,

        fallback

    ) => {



        try {



            const data =

                await response.json();



            if (data?.message) {



                return data.message;

            }



            if (

                typeof data === "string"

            ) {



                return data;

            }



        } catch {



            try {



                const text =

                    await response.text();



                if (text) {



                    return text;

                }



            } catch {

                // Ignore

            }

        }



        return fallback;

    };



    // =========================================================

    // PUBLISH

    // =========================================================



    const handlePublish = async (

        contest

    ) => {



        const confirmed =

            window.confirm(

                `Publish "${contest.title}"?\n\n` +

                "The contest will become UPCOMING and invitation emails will be sent to users."

            );



        if (!confirmed) {



            return;

        }



        try {



            setProcessingContestId(

                contest.id

            );



            setMessage("");

            setError("");



            const response =

                await fetch(

                    `${API_URL}/${contest.id}/publish`,

                    {

                        method: "POST"

                    }

                );



            if (!response.ok) {



                throw new Error(

                    await getResponseError(

                        response,

                        "Unable to publish contest."

                    )

                );

            }



            setMessage(

                `"${contest.title}" published successfully.`

            );



            await loadContests();



        } catch (err) {



            console.error(err);



            setError(

                err.message ||

                "Unable to publish contest."

            );



        } finally {



            setProcessingContestId(

                null

            );

        }

    };



    // =========================================================

    // CANCEL

    // =========================================================



    const handleCancelContest = async (

        contest

    ) => {



        const confirmed =

            window.confirm(

                `Cancel "${contest.title}"?\n\n` +

                "The contest will no longer be available to participants."

            );



        if (!confirmed) {



            return;

        }



        try {



            setProcessingContestId(

                contest.id

            );



            setMessage("");

            setError("");



            const response =

                await fetch(

                    `${API_URL}/${contest.id}/cancel`,

                    {

                        method: "POST"

                    }

                );



            if (!response.ok) {



                throw new Error(

                    await getResponseError(

                        response,

                        "Unable to cancel contest."

                    )

                );

            }



            setMessage(

                `"${contest.title}" cancelled successfully.`

            );



            await loadContests();



        } catch (err) {



            console.error(err);



            setError(

                err.message ||

                "Unable to cancel contest."

            );



        } finally {



            setProcessingContestId(

                null

            );

        }

    };



    // =========================================================

    // END LIVE CONTEST

    // =========================================================



    const handleEndContest = async (

        contest

    ) => {



        const confirmed =

            window.confirm(

                `End "${contest.title}" now?\n\n` +

                "Participants will no longer be able to submit solutions."

            );



        if (!confirmed) {



            return;

        }



        try {



            setProcessingContestId(

                contest.id

            );



            setMessage("");

            setError("");



            const response =

                await fetch(

                    `${API_URL}/${contest.id}/end`,

                    {

                        method: "POST"

                    }

                );



            if (!response.ok) {



                throw new Error(

                    await getResponseError(

                        response,

                        "Unable to end contest."

                    )

                );

            }



            setMessage(

                `"${contest.title}" ended successfully.`

            );



            await loadContests();



        } catch (err) {



            console.error(err);



            setError(

                err.message ||

                "Unable to end contest."

            );



        } finally {



            setProcessingContestId(

                null

            );

        }

    };



    // =========================================================

    // DELETE

    // =========================================================



    const handleDelete = async (

        contestId

    ) => {



        const confirmed =

            window.confirm(

                "Are you sure you want to delete this contest?\n\n" +

                "This will also remove its problems and participants."

            );



        if (!confirmed) {



            return;

        }



        try {



            setProcessingContestId(

                contestId

            );



            setMessage("");

            setError("");



            const response =

                await fetch(

                    `${API_URL}/${contestId}`,

                    {

                        method: "DELETE"

                    }

                );



            if (!response.ok) {



                throw new Error(

                    "Unable to delete contest."

                );

            }



            setMessage(

                "Contest deleted successfully."

            );



            if (

                selectedParticipantsContest?.id ===

                contestId

            ) {



                setSelectedParticipantsContest(

                    null

                );

            }



            await loadContests();



        } catch (err) {



            console.error(err);



            setError(

                err.message ||

                "Unable to delete contest."

            );



        } finally {



            setProcessingContestId(

                null

            );

        }

    };



    // =========================================================

    // FILTER

    // =========================================================



    const filteredContests =

        useMemo(() => {



            const query =

                search

                    .trim()

                    .toLowerCase();



            return contests.filter(

                (contest) => {



                    const matchesSearch =

                        !query ||

                        contest.title

                            ?.toLowerCase()

                            .includes(query) ||

                        contest.description

                            ?.toLowerCase()

                            .includes(query);



                    const matchesStatus =

                        statusFilter ===

                            "ALL" ||

                        contest.status ===

                            statusFilter;



                    return (

                        matchesSearch &&

                        matchesStatus

                    );

                }

            );



        }, [

            contests,

            search,

            statusFilter

        ]);



    // =========================================================

    // STATS

    // =========================================================



    const totalContests =

        contests.length;



    const draftContests =

        contests.filter(

            (contest) =>

                contest.status === "DRAFT"

        ).length;



    const upcomingContests =

        contests.filter(

            (contest) =>

                contest.status === "UPCOMING"

        ).length;



    const liveContests =

        contests.filter(

            (contest) =>

                contest.status === "LIVE"

        ).length;



    const finishedContests =

        contests.filter(

            (contest) =>

                contest.status === "FINISHED"

        ).length;



    // =========================================================

    // FORMAT DATE

    // =========================================================



    const formatDate = (

        dateString

    ) => {



        if (!dateString) {



            return "-";

        }



        const date =

            new Date(

                dateString

            );



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



    // =========================================================

    // STATUS CLASS

    // =========================================================



    const getStatusClass = (

        status

    ) => {



        switch (status) {



            case "DRAFT":

                return "status-pill draft";



            case "UPCOMING":

                return "status-pill upcoming";



            case "LIVE":

                return "status-pill active";



            case "FINISHED":

                return "status-pill completed";



            case "CANCELLED":

                return "status-pill cancelled";



            default:

                return "status-pill";

        }

    };



    // =========================================================

    // UI

    // =========================================================



    return (



        <div className="contest-management">



            {/* HEADER */}



            <div className="contest-page-header">



                <div>



                    <span className="contest-page-label">

                        ADMINISTRATION

                    </span>



                    <h1>

                        Contest Management

                    </h1>



                    <p>

                        Create, publish and monitor coding contests.

                    </p>



                </div>



                <button

                    className="create-contest-button"

                    type="button"

                    onClick={handleCreate}

                >

                    <span>

                        +

                    </span>



                    Create Contest

                </button>



            </div>



            {/* ALERTS */}



            {message && (



                <div className="contest-success-message">



                    <span>

                        ✓

                    </span>



                    {message}



                </div>



            )}



            {error && !showForm && (

                <div className="contest-error-message">

                    <span>
                        ⚠️
                    </span>

                    {error}

                </div>

            )}



            {/* STATS */}



            <div className="contest-stats-grid">



                <div className="contest-stat-card">



                    <div className="stat-info">



                        <span>

                            Total Contests

                        </span>



                        <strong>

                            {totalContests}

                        </strong>



                    </div>



                    <div className="contest-stat-icon total">

                        🏆

                    </div>



                </div>



                <div className="contest-stat-card">



                    <div className="stat-info">



                        <span>

                            Draft

                        </span>



                        <strong>

                            {draftContests}

                        </strong>



                    </div>



                    <div className="contest-stat-icon draft">

                        📝

                    </div>



                </div>



                <div className="contest-stat-card">



                    <div className="stat-info">



                        <span>

                            Upcoming

                        </span>



                        <strong>

                            {upcomingContests}

                        </strong>



                    </div>



                    <div className="contest-stat-icon upcoming">

                        📅

                    </div>



                </div>



                <div className="contest-stat-card">



                    <div className="stat-info">



                        <span>

                            Live

                        </span>



                        <strong>

                            {liveContests}

                        </strong>



                    </div>



                    <div className="contest-stat-icon active">

                        🔴

                    </div>



                </div>



                <div className="contest-stat-card">



                    <div className="stat-info">



                        <span>

                            Finished

                        </span>



                        <strong>

                            {finishedContests}

                        </strong>



                    </div>



                    <div className="contest-stat-icon completed">

                        ✓

                    </div>



                </div>



            </div>



            {/* FILTER */}



            <div className="contest-filter-bar">



                <div className="contest-search-box">



                    <svg

                        width="15"

                        height="15"

                        viewBox="0 0 24 24"

                        fill="none"

                        stroke="currentColor"

                        strokeWidth="2.5"

                    >

                        <circle

                            cx="11"

                            cy="11"

                            r="8"

                        />



                        <line

                            x1="21"

                            y1="21"

                            x2="16.65"

                            y2="16.65"

                        />

                    </svg>



                    <input

                        type="text"

                        placeholder="Search contests..."

                        value={search}

                        onChange={(event) =>

                            setSearch(

                                event.target.value

                            )

                        }

                    />



                </div>



                <select

                    className="contest-status-filter"

                    value={statusFilter}

                    onChange={(event) =>

                        setStatusFilter(

                            event.target.value

                        )

                    }

                >



                    <option value="ALL">

                        All Status

                    </option>



                    <option value="DRAFT">

                        Draft

                    </option>



                    <option value="UPCOMING">

                        Upcoming

                    </option>



                    <option value="LIVE">

                        Live

                    </option>



                    <option value="FINISHED">

                        Finished

                    </option>



                    <option value="CANCELLED">

                        Cancelled

                    </option>



                </select>



                <button

                    className="contest-refresh-button"

                    type="button"

                    onClick={loadContests}

                    disabled={loading}

                >

                    ↻ Refresh

                </button>



            </div>



            {/* TABLE */}



            <div className="contest-table-card">



                <div className="contest-table-header">



                    <div>



                        <h2>

                            All Contests

                        </h2>



                        <p>

                            {filteredContests.length} contest

                            {filteredContests.length !== 1

                                ? "s"

                                : ""} found

                        </p>



                    </div>



                </div>



                {loading ? (



                    <div className="contest-loading">



                        <div className="contest-spinner"></div>



                        <p>

                            Loading contests...

                        </p>



                    </div>



                ) : filteredContests.length === 0 ? (



                    <div className="contest-empty">



                        <div className="contest-empty-icon">

                            🏆

                        </div>



                        <h3>

                            No contests found

                        </h3>



                        <p>



                            {search ||

                            statusFilter !== "ALL"

                                ? "Try changing your search or filter."

                                : "Create your first contest to get started."}



                        </p>



                    </div>



                ) : (



                    <div className="contest-table-wrapper">



                        <table className="contest-table">



                            <thead>



                                <tr>



                                    <th>

                                        Contest

                                    </th>



                                    <th>

                                        Start

                                    </th>



                                    <th>

                                        End

                                    </th>



                                    <th>

                                        Duration

                                    </th>



                                    <th>

                                        Status

                                    </th>



                                    <th>

                                        Created By

                                    </th>



                                    <th>

                                        Actions

                                    </th>



                                </tr>



                            </thead>



                            <tbody>



                                {filteredContests.map(

                                    (contest) => {



                                        const processing =

                                            processingContestId ===

                                            contest.id;



                                        const editable =

                                            contest.status ===

                                                "DRAFT" ||

                                            contest.status ===

                                                "UPCOMING";



                                        const cancellable =

                                            contest.status ===

                                                "DRAFT" ||

                                            contest.status ===

                                                "UPCOMING";



                                        return (



                                            <tr key={contest.id}>



                                                <td>



                                                    <div className="contest-title-cell">



                                                        <div className="contest-title-icon">

                                                            🏆

                                                        </div>



                                                        <div>



                                                            <strong>

                                                                {contest.title}

                                                            </strong>



                                                            <span>



                                                                {contest.description

                                                                    ? contest.description.length > 70

                                                                        ? `${contest.description.substring(0, 70)}...`

                                                                        : contest.description

                                                                    : "No description"}



                                                            </span>



                                                        </div>



                                                    </div>



                                                </td>



                                                <td>



                                                    <span className="contest-date">



                                                        {formatDate(

                                                            contest.startTime

                                                        )}



                                                    </span>



                                                </td>



                                                <td>



                                                    <span className="contest-date">



                                                        {formatDate(

                                                            contest.endTime

                                                        )}



                                                    </span>



                                                </td>



                                                <td>



                                                    <span className="contest-duration">



                                                        {contest.durationMinutes

                                                            ? `${contest.durationMinutes} min`

                                                            : "-"}



                                                    </span>



                                                </td>



                                                <td>



                                                    <span

                                                        className={

                                                            getStatusClass(

                                                                contest.status

                                                            )

                                                        }

                                                    >

                                                        {contest.status}

                                                    </span>



                                                </td>



                                                <td>



                                                    <div className="contest-created-by">



                                                        <strong>

                                                            {contest.createdByName ||

                                                                "Admin"}

                                                        </strong>



                                                        {contest.createdById && (



                                                            <span>

                                                                ID: {contest.createdById}

                                                            </span>



                                                        )}



                                                    </div>



                                                </td>



                                                <td>



                                                    <div className="contest-actions">



                                                        {/* EDIT */}



                                                        {editable && (



                                                            <button

                                                                className="action-button edit"

                                                                type="button"

                                                                disabled={processing}

                                                                onClick={() =>

                                                                    handleEdit(

                                                                        contest

                                                                    )

                                                                }

                                                            >

                                                                Edit

                                                            </button>



                                                        )}



                                                        {/* PROBLEMS */}



                                                        <button

                                                            className="action-button problems"

                                                            type="button"

                                                            disabled={processing}

                                                            onClick={() =>

                                                                navigate(

                                                                    `/admin/contests/${contest.id}/problems`

                                                                )

                                                            }

                                                        >

                                                            Problems

                                                        </button>



                                                        {/* PARTICIPANTS */}



                                                        <button

                                                            className="action-button participants"

                                                            type="button"

                                                            disabled={processing}

                                                            onClick={() =>

                                                                setSelectedParticipantsContest(

                                                                    contest

                                                                )

                                                            }

                                                        >

                                                            Participants

                                                        </button>



                                                        {/* PUBLISH */}



                                                        {contest.status ===

                                                            "DRAFT" && (



                                                            <button

                                                                className="action-button publish"

                                                                type="button"

                                                                disabled={processing}

                                                                onClick={() =>

                                                                    handlePublish(

                                                                        contest

                                                                    )

                                                                }

                                                            >

                                                                {processing

                                                                    ? "Publishing..."

                                                                    : "Publish"}

                                                            </button>



                                                        )}



                                                        {/* CANCEL */}



                                                        {cancellable && (



                                                            <button

                                                                className="action-button cancel"

                                                                type="button"

                                                                disabled={processing}

                                                                onClick={() =>

                                                                    handleCancelContest(

                                                                        contest

                                                                    )

                                                                }

                                                            >

                                                                Cancel

                                                            </button>



                                                        )}



                                                        {/* LIVE MONITOR */}



                                                        {contest.status ===

                                                            "LIVE" && (



                                                            <button

                                                                className="action-button participants"

                                                                type="button"

                                                                disabled={processing}

                                                                onClick={() =>

                                                                    setSelectedMonitorContest(

                                                                        contest

                                                                    )

                                                                }

                                                            >

                                                                🔴 Monitor Live

                                                            </button>



                                                        )}



                                                        {/* END LIVE CONTEST */}



                                                        {contest.status ===

                                                            "LIVE" && (



                                                            <button

                                                                className="action-button end"

                                                                type="button"

                                                                disabled={processing}

                                                                onClick={() =>

                                                                    handleEndContest(

                                                                        contest

                                                                    )

                                                                }

                                                            >

                                                                {processing

                                                                    ? "Ending..."

                                                                    : "End Contest"}

                                                            </button>



                                                        )}



                                                        {/* DELETE */}



                                                        <button

                                                            className="action-button delete"

                                                            type="button"

                                                            disabled={processing}

                                                            onClick={() =>

                                                                handleDelete(

                                                                    contest.id

                                                                )

                                                            }

                                                        >

                                                            Delete

                                                        </button>



                                                    </div>



                                                </td>



                                            </tr>

                                        );

                                    }

                                )}



                            </tbody>



                        </table>



                    </div>

                )}



            </div>



            {/* CREATE / EDIT MODAL */}



            {showForm && (



                <div className="contest-modal-overlay">



                    <div className="contest-modal">



                        <div className="contest-modal-header">



                            <div>



                                <span className="contest-modal-label">



                                    {editingContest

                                        ? "EDIT CONTEST"

                                        : "NEW CONTEST"}



                                </span>



                                <h2>



                                    {editingContest

                                        ? "Edit Contest"

                                        : "Create Contest"}



                                </h2>



                                <p>

                                    Configure the contest schedule and registration window.

                                </p>



                            </div>



                            <button

                                className="contest-close-button"

                                type="button"

                                onClick={resetForm}

                            >

                                &times;

                            </button>



                        </div>



                        <form
                            className="contest-form"
                            onSubmit={handleSubmit}
                        >

                            {/* FORM ERROR */}

                            {error && (

                                <div className="contest-error-message contest-form-error">

                                    <span>
                                        ⚠️
                                    </span>

                                    <div>
                                        {error}
                                    </div>

                                </div>

                            )}



                            <div className="contest-form-group">



                                <label htmlFor="title">

                                    Contest Title

                                    <span>*</span>

                                </label>



                                <input

                                    id="title"

                                    name="title"

                                    type="text"

                                    placeholder="Enter contest title"

                                    value={form.title}

                                    onChange={handleInputChange}

                                    maxLength={150}

                                />



                            </div>



                            <div className="contest-form-group">



                                <label htmlFor="description">

                                    Description

                                </label>



                                <textarea

                                    id="description"

                                    name="description"

                                    placeholder="Describe the contest..."

                                    value={form.description}

                                    onChange={handleInputChange}

                                    rows="3"

                                />



                            </div>



                            {/* REGISTRATION */}



                            <div className="contest-form-row">



                                <div className="contest-form-group">



                                    <label htmlFor="registrationStartTime">

                                        Registration Opens

                                    </label>



                                    <input

                                        id="registrationStartTime"

                                        name="registrationStartTime"

                                        type="datetime-local"

                                        value={

                                            form.registrationStartTime

                                        }

                                        onChange={handleInputChange}

                                    />



                                </div>



                                <div className="contest-form-group">



                                    <label htmlFor="registrationEndTime">

                                        Registration Deadline

                                    </label>



                                    <input

                                        id="registrationEndTime"

                                        name="registrationEndTime"

                                        type="datetime-local"

                                        value={

                                            form.registrationEndTime

                                        }

                                        onChange={handleInputChange}

                                    />



                                </div>



                            </div>



                            {/* CONTEST START */}



                            <div className="contest-form-group">



                                <label htmlFor="startTime">

                                    Contest Start Time

                                    <span>*</span>

                                </label>



                                <input

                                    id="startTime"

                                    name="startTime"

                                    type="datetime-local"

                                    value={form.startTime}

                                    onChange={handleInputChange}

                                />



                            </div>



                            {/* DURATION */}



                            <div className="contest-form-group">



                                <label htmlFor="durationMinutes">

                                    Duration

                                    <span>*</span>

                                </label>



                                <div className="contest-duration-input">



                                    <input

                                        id="durationMinutes"

                                        name="durationMinutes"

                                        type="number"

                                        min="1"

                                        placeholder="120"

                                        value={

                                            form.durationMinutes

                                        }

                                        onChange={

                                            handleInputChange

                                        }

                                    />



                                    <span>

                                        minutes

                                    </span>



                                </div>



                                {form.startTime &&

                                    Number(

                                        form.durationMinutes

                                    ) > 0 && (



                                    <div className="contest-calculated-end">



                                        Calculated end:



                                        <strong>



                                            {formatDate(

                                                new Date(

                                                    new Date(

                                                        form.startTime

                                                    ).getTime() +

                                                    Number(

                                                        form.durationMinutes

                                                    ) *

                                                    60 *

                                                    1000

                                                ).toISOString()

                                            )}



                                        </strong>



                                    </div>



                                )}



                            </div>



                            <div className="contest-form-actions">



                                <button

                                    type="button"

                                    className="contest-cancel-button"

                                    onClick={resetForm}

                                >

                                    Close

                                </button>



                                <button

                                    type="submit"

                                    className="contest-save-button"

                                >



                                    {editingContest

                                        ? "Update Contest"

                                        : "Create Draft"}



                                </button>



                            </div>



                        </form>



                    </div>



                </div>

            )}



            {/* PARTICIPANTS */}



            {selectedParticipantsContest && (



                <ContestParticipantManagement

                    contest={

                        selectedParticipantsContest

                    }

                    onClose={() =>

                        setSelectedParticipantsContest(

                            null

                        )

                    }

                />



            )}



            {/* LIVE CONTEST MONITOR */}



            {selectedMonitorContest && (



                <AdminContestLiveMonitor

                    contest={

                        selectedMonitorContest

                    }

                    onClose={() =>

                        setSelectedMonitorContest(

                            null

                        )

                    }

                />



            )}



        </div>

    );

}



export default ContestManagement;