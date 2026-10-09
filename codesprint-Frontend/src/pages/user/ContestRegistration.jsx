import React, {
    useEffect,
    useState
} from "react";

import {
    useParams,
    useNavigate
} from "react-router-dom";

import axios from "axios";

import "./ContestRegistration.css";


const ContestRegistration = () => {

    const { contestId } = useParams();

    const navigate = useNavigate();


    // ========================================
    // STATE
    // ========================================

    const [contest, setContest] =
        useState(null);

    const [registration, setRegistration] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [
        registrationLoading,
        setRegistrationLoading
    ] = useState(false);

    const [registering, setRegistering] =
        useState(false);

    const [enteringContest, setEnteringContest] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [timeLeft, setTimeLeft] =
        useState({
            hours: 0,
            minutes: 0,
            seconds: 0
        });


    // ========================================
    // LOGGED-IN USER
    // ========================================

    const storedUser =
        localStorage.getItem("user");

    let user = null;

    try {

        if (storedUser) {

            user =
                JSON.parse(storedUser);
        }

    } catch (error) {

        console.error(
            "Invalid stored user:",
            error
        );

        localStorage.removeItem(
            "user"
        );
    }


    // ========================================
    // LOAD CONTEST
    // ========================================

    const fetchContest = async (
        showLoader = false
    ) => {

        try {

            if (showLoader) {

                setLoading(true);
            }

            setError("");


            const response =
                await axios.get(
                    `/api/contests/${contestId}`
                );


            setContest(
                response.data
            );


            return response.data;


        } catch (error) {

            console.error(
                "Error loading contest:",
                error
            );


            if (showLoader) {

                setError(
                    "Unable to load contest details."
                );
            }


            return null;


        } finally {

            if (showLoader) {

                setLoading(false);
            }
        }
    };


    // ========================================
    // INITIAL CONTEST LOAD
    // ========================================

    useEffect(() => {

        fetchContest(true);

        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, [contestId]);


    // ========================================
    // AUTO REFRESH CONTEST STATUS
    // ========================================

    useEffect(() => {

        if (!contest) {

            return;
        }


        if (
            contest.status !== "UPCOMING" &&
            contest.status !== "LIVE"
        ) {

            return;
        }


        const interval =
            setInterval(() => {

                fetchContest(false);

            }, 5000);


        return () => {

            clearInterval(interval);
        };


        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, [
        contestId,
        contest?.status
    ]);


    // ========================================
    // LOAD REGISTRATION STATUS
    // ========================================

    useEffect(() => {

        if (!user?.id) {

            setRegistration(null);

            return;
        }


        const fetchRegistration =
            async () => {

                try {

                    setRegistrationLoading(
                        true
                    );


                    const response =
                        await axios.get(
                            `/api/contests/${contestId}/registration/${user.id}`
                        );


                    setRegistration(
                        response.data
                    );


                } catch (error) {

                    console.error(
                        "Error loading registration:",
                        error
                    );


                    setMessage(
                        "Unable to check registration status."
                    );


                } finally {

                    setRegistrationLoading(
                        false
                    );
                }
            };


        fetchRegistration();


    }, [
        contestId,
        user?.id
    ]);


    // ========================================
    // COUNTDOWN
    // ========================================

    useEffect(() => {

        if (
            !contest ||
            contest.status !== "UPCOMING" ||
            !contest.startTime
        ) {

            return;
        }


        const calculateTimeLeft = () => {

            const start =
                new Date(
                    contest.startTime
                ).getTime();

            const now =
                new Date().getTime();

            const difference =
                start - now;


            if (difference <= 0) {

                setTimeLeft({
                    hours: 0,
                    minutes: 0,
                    seconds: 0
                });


                // Ask backend to refresh lifecycle

                fetchContest(false);

                return;
            }


            const totalSeconds =
                Math.floor(
                    difference / 1000
                );


            const hours =
                Math.floor(
                    totalSeconds / 3600
                );


            const minutes =
                Math.floor(
                    (totalSeconds % 3600) / 60
                );


            const seconds =
                totalSeconds % 60;


            setTimeLeft({
                hours,
                minutes,
                seconds
            });
        };


        calculateTimeLeft();


        const interval =
            setInterval(
                calculateTimeLeft,
                1000
            );


        return () => {

            clearInterval(interval);
        };


        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, [
        contest?.status,
        contest?.startTime
    ]);


    // ========================================
    // LOGIN
    // ========================================

    const handleLogin = () => {

        navigate(
            "/login",
            {
                state: {

                    returnTo:
                        `/contests/${contestId}/register`
                }
            }
        );
    };


    // ========================================
    // REGISTER
    // ========================================

    const handleRegister = async () => {

        if (!user?.id) {

            handleLogin();

            return;
        }


        try {

            setRegistering(true);
            setMessage("");


            const response =
                await axios.post(
                    `/api/contests/${contestId}/register`,
                    null,
                    {
                        params: {

                            userId:
                                user.id
                        }
                    }
                );


            const data =
                response.data;


            setRegistration({

                registered: true,

                registeredAt:
                    data.registeredAt,

                started: false,

                startedAt: null,

                expiresAt: null
            });


            setMessage(
                "Registration successful. You are registered for this contest."
            );


        } catch (error) {

            console.error(
                "Contest registration error:",
                error
            );


            if (
                typeof error.response?.data
                === "string"
            ) {

                setMessage(
                    error.response.data
                );


            } else if (
                error.response?.data?.message
            ) {

                setMessage(
                    error.response.data.message
                );


            } else if (
                error.response?.data?.error
            ) {

                setMessage(
                    error.response.data.error
                );


            } else {

                setMessage(
                    "Unable to register for this contest."
                );
            }


        } finally {

            setRegistering(false);
        }
    };


    // ========================================
    // ENTER CONTEST
    // ========================================

    const handleEnterContest = async () => {

        if (
            !user?.id ||
            !registration?.registered
        ) {

            return;
        }


        try {

            setEnteringContest(true);
            setMessage("");


            // ========================================
            // USE EXISTING START API
            // ========================================

            const response =
                await axios.post(
                    `/api/contests/${contestId}/start`,
                    null,
                    {
                        params: {

                            userId:
                                user.id
                        }
                    }
                );


            const startData =
                response.data;


            // ========================================
            // SAVE SESSION INFORMATION
            // ========================================

            sessionStorage.setItem(
                `contestSession_${contestId}`,
                JSON.stringify(
                    startData
                )
            );


            // ========================================
            // ENTER CONTEST ARENA
            // ========================================

            navigate(
                `/user/contests/${contestId}`,
                {
                    state: {

                        contestSession:
                            startData
                    }
                }
            );


        } catch (error) {

            console.error(
                "Unable to enter contest:",
                error
            );


            if (
                typeof error.response?.data
                === "string"
            ) {

                setMessage(
                    error.response.data
                );


            } else if (
                error.response?.data?.message
            ) {

                setMessage(
                    error.response.data.message
                );


            } else if (
                error.response?.data?.error
            ) {

                setMessage(
                    error.response.data.error
                );


            } else {

                setMessage(
                    "Unable to enter the contest."
                );
            }


            // Contest could have changed status.

            fetchContest(false);


        } finally {

            setEnteringContest(false);
        }
    };


    // ========================================
    // DATE FORMAT
    // ========================================

    const formatDateTime = (dateTime) => {

        if (!dateTime) {

            return "Not specified";
        }


        return new Date(
            dateTime
        ).toLocaleString();
    };


    // ========================================
    // COUNTDOWN FORMAT
    // ========================================

    const formatNumber = (value) => {

        return String(
            value
        ).padStart(
            2,
            "0"
        );
    };


    // ========================================
    // REGISTRATION WINDOW
    // ========================================

    const now =
        new Date();


    const registrationStart =
        contest?.registrationStartTime
            ? new Date(
                contest.registrationStartTime
            )
            : null;


    const registrationEnd =
        contest?.registrationEndTime
            ? new Date(
                contest.registrationEndTime
            )
            : null;


    const registrationNotStarted =

        contest?.status === "UPCOMING" &&

        registrationStart &&

        now < registrationStart;


    const registrationOpen =

        contest?.status === "UPCOMING" &&

        (
            !registrationStart ||
            now >= registrationStart
        ) &&

        (
            !registrationEnd ||
            now < registrationEnd
        );


    const registrationClosed =

        contest?.status === "UPCOMING" &&

        registrationEnd &&

        now >= registrationEnd;


    // ========================================
    // LOADING
    // ========================================

    if (loading) {

        return (

            <div className="contest-registration-page">

                <div className="contest-registration-card">

                    <div className="contest-loading">

                        Loading contest...

                    </div>

                </div>

            </div>
        );
    }


    // ========================================
    // ERROR
    // ========================================

    if (
        error ||
        !contest
    ) {

        return (

            <div className="contest-registration-page">

                <div className="contest-registration-card">

                    <h2>
                        Something went wrong
                    </h2>

                    <p>

                        {
                            error ||
                            "Contest not found."
                        }

                    </p>

                </div>

            </div>
        );
    }


    // ========================================
    // PAGE
    // ========================================

    return (

        <div className="contest-registration-page">

            <div className="contest-registration-card">


                {/* ========================================
                    HEADER
                ======================================== */}

                <div className="contest-registration-header">

                    <div>

                        <span className="contest-platform-name">

                            CodeSprint Contest

                        </span>


                        <h1>

                            {contest.title}

                        </h1>


                        <p>

                            {contest.description}

                        </p>

                    </div>


                    <span
                        className={
                            `contest-status-badge status-${contest.status.toLowerCase()}`
                        }
                    >

                        {contest.status}

                    </span>

                </div>


                {/* ========================================
                    DETAILS
                ======================================== */}

                <div className="contest-details-grid">


                    <div className="contest-detail-item">

                        <span>
                            Start Time
                        </span>

                        <strong>

                            {
                                formatDateTime(
                                    contest.startTime
                                )
                            }

                        </strong>

                    </div>


                    <div className="contest-detail-item">

                        <span>
                            Duration
                        </span>

                        <strong>

                            {
                                contest.durationMinutes
                            } minutes

                        </strong>

                    </div>


                    <div className="contest-detail-item">

                        <span>
                            Registration Deadline
                        </span>

                        <strong>

                            {
                                formatDateTime(
                                    contest.registrationEndTime
                                )
                            }

                        </strong>

                    </div>


                    <div className="contest-detail-item">

                        <span>
                            Contest Ends
                        </span>

                        <strong>

                            {
                                formatDateTime(
                                    contest.endTime
                                )
                            }

                        </strong>

                    </div>

                </div>


                {/* ========================================
                    MESSAGE
                ======================================== */}

                {message && (

                    <div className="contest-message">

                        {message}

                    </div>

                )}


                {/* ========================================
                    NOT LOGGED IN
                ======================================== */}

                {!user && (

                    <div className="contest-action-panel">

                        <h2>
                            Sign in to continue
                        </h2>

                        <p>

                            Sign in to your CodeSprint
                            account to register for this
                            contest.

                        </p>


                        <button
                            type="button"
                            className="contest-primary-button"
                            onClick={handleLogin}
                        >

                            Login to Register

                        </button>

                    </div>

                )}


                {/* ========================================
                    LOGGED IN
                ======================================== */}

                {user && (

                    <>


                        {/* ACCOUNT */}

                        <div className="contest-account-bar">

                            <div>

                                <span>
                                    Signed in as
                                </span>

                                <strong>

                                    {user.name}

                                </strong>

                            </div>

                        </div>


                        {/* CHECKING */}

                        {registrationLoading && (

                            <div className="contest-action-panel">

                                <p>
                                    Checking registration...
                                </p>

                            </div>

                        )}


                        {/* ========================================
                            REGISTERED + UPCOMING
                            CONTEST LOBBY
                        ======================================== */}

                        {
                            !registrationLoading &&
                            registration?.registered &&
                            contest.status ===
                            "UPCOMING" &&
                            (

                                <div className="contest-lobby">


                                    <div className="contest-success-badge">

                                        ✓ Registration Confirmed

                                    </div>


                                    <h2>
                                        You're registered and ready
                                    </h2>


                                    <p className="contest-lobby-text">

                                        Keep this page open.
                                        The contest will become
                                        available automatically
                                        when it starts.

                                    </p>


                                    {/* COUNTDOWN */}

                                    <div className="contest-countdown-wrapper">

                                        <span className="contest-countdown-title">

                                            Contest starts in

                                        </span>


                                        <div className="contest-countdown">


                                            <div className="countdown-box">

                                                <strong>

                                                    {
                                                        formatNumber(
                                                            timeLeft.hours
                                                        )
                                                    }

                                                </strong>

                                                <span>
                                                    HOURS
                                                </span>

                                            </div>


                                            <div className="countdown-separator">
                                                :
                                            </div>


                                            <div className="countdown-box">

                                                <strong>

                                                    {
                                                        formatNumber(
                                                            timeLeft.minutes
                                                        )
                                                    }

                                                </strong>

                                                <span>
                                                    MINUTES
                                                </span>

                                            </div>


                                            <div className="countdown-separator">
                                                :
                                            </div>


                                            <div className="countdown-box">

                                                <strong>

                                                    {
                                                        formatNumber(
                                                            timeLeft.seconds
                                                        )
                                                    }

                                                </strong>

                                                <span>
                                                    SECONDS
                                                </span>

                                            </div>

                                        </div>

                                    </div>


                                    <button
                                        type="button"
                                        className="contest-primary-button contest-disabled-button"
                                        disabled
                                    >

                                        Enter Contest

                                    </button>


                                    <p className="contest-button-help">

                                        Enter Contest will become
                                        available when the contest
                                        goes live.

                                    </p>

                                </div>

                            )
                        }


                        {/* ========================================
                            REGISTERED + LIVE
                        ======================================== */}

                        {
                            !registrationLoading &&
                            registration?.registered &&
                            contest.status ===
                            "LIVE" &&
                            (

                                <div className="contest-lobby contest-live-lobby">


                                    <div className="contest-live-indicator">

                                        <span></span>

                                        Contest is LIVE

                                    </div>


                                    <h2>
                                        The contest has started
                                    </h2>


                                    <p className="contest-lobby-text">

                                        You're registered.
                                        Enter the contest when
                                        you're ready.

                                    </p>


                                    <div className="contest-warning-box">

                                        Your individual contest
                                        timer begins when you enter.
                                        Your session cannot continue
                                        beyond the global contest
                                        end time.

                                    </div>


                                    <button
                                        type="button"
                                        className="contest-primary-button"
                                        onClick={
                                            handleEnterContest
                                        }
                                        disabled={
                                            enteringContest
                                        }
                                    >

                                        {
                                            enteringContest
                                                ? "Entering Contest..."
                                                : "Enter Contest"
                                        }

                                    </button>

                                </div>

                            )
                        }


                        {/* ========================================
                            REGISTERED + FINISHED
                        ======================================== */}

                        {
                            !registrationLoading &&
                            registration?.registered &&
                            contest.status ===
                            "FINISHED" &&
                            (

                                <div className="contest-action-panel">

                                    <div className="contest-success-badge">

                                        ✓ You were registered

                                    </div>

                                    <h2>
                                        Contest Ended
                                    </h2>

                                    <p>

                                        This contest has finished.

                                    </p>

                                </div>

                            )
                        }


                        {/* ========================================
                            REGISTERED + CANCELLED
                        ======================================== */}

                        {
                            !registrationLoading &&
                            registration?.registered &&
                            contest.status ===
                            "CANCELLED" &&
                            (

                                <div className="contest-action-panel">

                                    <h2>
                                        Contest Cancelled
                                    </h2>

                                    <p>

                                        This contest was cancelled
                                        by the organizer.

                                    </p>

                                </div>

                            )
                        }


                        {/* ========================================
                            NOT REGISTERED
                            REGISTRATION NOT STARTED
                        ======================================== */}

                        {
                            !registrationLoading &&
                            registration &&
                            !registration.registered &&
                            registrationNotStarted &&
                            (

                                <div className="contest-action-panel">

                                    <h2>
                                        Registration Opens Soon
                                    </h2>

                                    <p>

                                        Registration for this
                                        contest has not opened yet.

                                    </p>

                                    <p>

                                        Opens:{" "}

                                        <strong>

                                            {
                                                formatDateTime(
                                                    contest.registrationStartTime
                                                )
                                            }

                                        </strong>

                                    </p>

                                </div>

                            )
                        }


                        {/* ========================================
                            NOT REGISTERED
                            REGISTRATION OPEN
                        ======================================== */}

                        {
                            !registrationLoading &&
                            registration &&
                            !registration.registered &&
                            registrationOpen &&
                            (

                                <div className="contest-action-panel">

                                    <h2>
                                        Register for this contest
                                    </h2>

                                    <p>

                                        Registration is currently
                                        open. Confirm your
                                        participation below.

                                    </p>


                                    <p>

                                        Registration closes:{" "}

                                        <strong>

                                            {
                                                formatDateTime(
                                                    contest.registrationEndTime
                                                )
                                            }

                                        </strong>

                                    </p>


                                    <button
                                        type="button"
                                        className="contest-primary-button"
                                        onClick={
                                            handleRegister
                                        }
                                        disabled={
                                            registering
                                        }
                                    >

                                        {
                                            registering
                                                ? "Registering..."
                                                : "Register Now"
                                        }

                                    </button>

                                </div>

                            )
                        }


                        {/* ========================================
                            NOT REGISTERED
                            DEADLINE PASSED
                        ======================================== */}

                        {
                            !registrationLoading &&
                            registration &&
                            !registration.registered &&
                            registrationClosed &&
                            (

                                <div className="contest-action-panel">

                                    <h2>
                                        Registration Closed
                                    </h2>

                                    <p>

                                        The registration deadline
                                        for this contest has passed.

                                    </p>

                                </div>

                            )
                        }


                        {/* ========================================
                            NOT REGISTERED + LIVE
                        ======================================== */}

                        {
                            !registrationLoading &&
                            registration &&
                            !registration.registered &&
                            contest.status ===
                            "LIVE" &&
                            (

                                <div className="contest-action-panel">

                                    <h2>
                                        Registration Closed
                                    </h2>

                                    <p>

                                        This contest has already
                                        started and you are not
                                        registered.

                                    </p>

                                </div>

                            )
                        }


                        {/* ========================================
                            NOT REGISTERED + FINISHED
                        ======================================== */}

                        {
                            !registrationLoading &&
                            registration &&
                            !registration.registered &&
                            contest.status ===
                            "FINISHED" &&
                            (

                                <div className="contest-action-panel">

                                    <h2>
                                        Contest Ended
                                    </h2>

                                    <p>

                                        This contest has finished.
                                        Registration is no longer
                                        available.

                                    </p>

                                </div>

                            )
                        }


                        {/* ========================================
                            CANCELLED
                        ======================================== */}

                        {
                            !registrationLoading &&
                            registration &&
                            contest.status ===
                            "CANCELLED" &&
                            (

                                <div className="contest-action-panel">

                                    <h2>
                                        Contest Cancelled
                                    </h2>

                                    <p>

                                        Registration is unavailable
                                        because this contest was
                                        cancelled.

                                    </p>

                                </div>

                            )
                        }


                        {/* ========================================
                            DRAFT
                        ======================================== */}

                        {
                            !registrationLoading &&
                            registration &&
                            contest.status ===
                            "DRAFT" &&
                            (

                                <div className="contest-action-panel">

                                    <h2>
                                        Contest Not Published
                                    </h2>

                                    <p>

                                        This contest is not currently
                                        open for registration.

                                    </p>

                                </div>

                            )
                        }

                    </>

                )}

            </div>

        </div>
    );
};


export default ContestRegistration;