import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MySubmissions.css";

function MySubmissions() {

    const navigate = useNavigate();

    // ========================================
    // USER
    // ========================================

    const storedUser = localStorage.getItem("user");

    let user = null;

    try {
        user = storedUser
            ? JSON.parse(storedUser)
            : null;
    } catch (error) {
        console.error("Invalid user data:", error);
        user = null;
    }

    const userId = user?.id;


    // ========================================
    // STATE
    // ========================================

    const [submissions, setSubmissions] = useState([]);
    const [problems, setProblems] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // ========================================
    // LOAD SUBMISSIONS + PROBLEMS
    // ========================================

    useEffect(() => {

        if (!userId) {

            setError(
                "Please login to view your submissions."
            );

            setLoading(false);

            return;
        }


        const loadData = async () => {

            try {

                setLoading(true);
                setError("");


                // ========================================
                // LOAD USER SUBMISSIONS
                // ========================================

                const submissionsResponse =
                    await axios.get(
                        `/api/submissions/user/${userId}`
                    );


                console.log(
                    "User submissions:",
                    submissionsResponse.data
                );


                // ========================================
                // LOAD PROBLEMS
                // ========================================

                const problemsResponse =
                    await axios.get(
                        "/api/problems"
                    );


                console.log(
                    "Problems:",
                    problemsResponse.data
                );


                setSubmissions(
                    Array.isArray(submissionsResponse.data)
                        ? submissionsResponse.data
                        : []
                );


                setProblems(
                    Array.isArray(problemsResponse.data)
                        ? problemsResponse.data
                        : []
                );

            } catch (error) {

                console.error(
                    "Error loading submissions:",
                    error
                );


                if (error.response) {

                    console.error(
                        "Backend response:",
                        error.response.data
                    );

                    console.error(
                        "Status:",
                        error.response.status
                    );
                }


                setError(
                    "Unable to load your submissions."
                );

            } finally {

                setLoading(false);
            }
        };


        loadData();

    }, [userId]);


    // ========================================
    // FIND PROBLEM TITLE
    // ========================================

    const getProblemTitle = (problemId) => {

        const problem =
            problems.find(
                (item) =>
                    Number(item.id) ===
                    Number(problemId)
            );


        return problem
            ? problem.title
            : `Problem #${problemId}`;
    };


    // ========================================
    // STATUS CLASS
    // ========================================

    const getStatusClass = (status) => {

        if (!status) {
            return "other";
        }


        const value =
            status.toLowerCase();


        if (
            value.includes("accepted") ||
            value.includes("success")
        ) {
            return "accepted";
        }


        if (
            value.includes("wrong") ||
            value.includes("failed") ||
            value.includes("error") ||
            value.includes("rejected")
        ) {
            return "failed";
        }


        return "other";
    };


    // ========================================
    // FORMAT DATE
    // ========================================

    const formatDate = (dateValue) => {

        if (!dateValue) {
            return "-";
        }


        const date =
            new Date(dateValue);


        if (Number.isNaN(date.getTime())) {
            return dateValue;
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
    // STATISTICS
    // ========================================

    const statistics = useMemo(() => {

        const total =
            submissions.length;


        const accepted =
            submissions.filter(
                (submission) =>
                    submission.status
                        ?.toLowerCase()
                        .includes("accepted")
            ).length;


        const failed =
            submissions.filter(
                (submission) => {

                    const status =
                        submission.status
                            ?.toLowerCase() || "";


                    return (
                        status.includes("wrong") ||
                        status.includes("failed") ||
                        status.includes("error") ||
                        status.includes("rejected")
                    );
                }
            ).length;


        return {
            total,
            accepted,
            failed
        };

    }, [submissions]);


    // ========================================
    // BACK TO DASHBOARD
    // ========================================

    const handleBack = () => {

        navigate("/dashboard");
    };


    // ========================================
    // BROWSE PROBLEMS
    // ========================================

    const handleBrowseProblems = () => {

        navigate("/user/problems");
    };


    // ========================================
    // LOADING
    // ========================================

    if (loading) {

        return (

            <div className="my-submissions-page">

                <div className="submissions-message">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading your submissions...
                    </p>

                </div>

            </div>
        );
    }


    // ========================================
    // ERROR
    // ========================================

    if (error) {

        return (

            <div className="my-submissions-page">

                <div className="submissions-message error-message">

                    <h3>
                        Unable to load submissions
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={handleBack}
                    >
                        ← Dashboard
                    </button>

                </div>

            </div>
        );
    }


    // ========================================
    // MAIN PAGE
    // ========================================

    return (

        <div className="my-submissions-page">


            {/* ========================================
                HEADER
            ======================================== */}

            <div className="submissions-header">

                <div>

                    <button
                        type="button"
                        className="back-dashboard-button"
                        onClick={handleBack}
                    >
                        ← Dashboard
                    </button>

                    <h1>
                        My Submissions
                    </h1>

                    <p>
                        View your coding submission history.
                    </p>

                </div>

            </div>


            {/* ========================================
                STATISTICS
            ======================================== */}

            <div className="submission-stats">

                <div className="stat-card">

                    <span className="stat-label">
                        Total Submissions
                    </span>

                    <strong>
                        {statistics.total}
                    </strong>

                </div>


                <div className="stat-card">

                    <span className="stat-label">
                        Accepted
                    </span>

                    <strong>
                        {statistics.accepted}
                    </strong>

                </div>


                <div className="stat-card">

                    <span className="stat-label">
                        Failed
                    </span>

                    <strong>
                        {statistics.failed}
                    </strong>

                </div>

            </div>


            {/* ========================================
                SUBMISSION HISTORY
            ======================================== */}

            <div className="submissions-card">

                <div className="card-header">

                    <div>

                        <h2>
                            Submission History
                        </h2>

                        <p>
                            Your latest submissions are shown first.
                        </p>

                    </div>

                </div>


                {/* ========================================
                    EMPTY
                ======================================== */}

                {submissions.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            📭
                        </div>

                        <h3>
                            No submissions yet
                        </h3>

                        <p>
                            Solve a problem and submit your
                            code to see it here.
                        </p>

                        <button
                            type="button"
                            onClick={handleBrowseProblems}
                        >
                            Browse Problems
                        </button>

                    </div>

                ) : (


                    /* ========================================
                        TABLE
                    ======================================== */

                    <div className="table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        #
                                    </th>

                                    <th>
                                        Problem
                                    </th>

                                    <th>
                                        Language
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Submitted At
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {submissions.map(
                                    (submission, index) => (

                                        <tr
                                            key={
                                                submission.id
                                            }
                                        >

                                            {/* NUMBER */}

                                            <td>
                                                {index + 1}
                                            </td>


                                            {/* PROBLEM */}

                                            <td>

                                                <strong>
                                                    {
                                                        getProblemTitle(
                                                            submission.problemId
                                                        )
                                                    }
                                                </strong>

                                            </td>


                                            {/* LANGUAGE */}

                                            <td>

                                                <span className="language-badge">

                                                    {
                                                        submission.language
                                                    }

                                                </span>

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={
                                                        `status-badge ${getStatusClass(
                                                            submission.status
                                                        )}`
                                                    }
                                                >

                                                    {
                                                        submission.status ||
                                                        "Unknown"
                                                    }

                                                </span>

                                            </td>


                                            {/* DATE */}

                                            <td>

                                                {
                                                    formatDate(
                                                        submission.submittedAt
                                                    )
                                                }

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}

export default MySubmissions;