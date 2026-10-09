import { useState } from "react";
import axios from "axios";
import {
    useNavigate,
    useLocation
} from "react-router-dom";

import "./Auth.css";


function Login() {

    const navigate = useNavigate();
    const location = useLocation();

    // ========================================
    // RETURN URL
    // ========================================

    const returnTo =
        location.state?.returnTo ||
        sessionStorage.getItem("authReturnTo") ||
        null;


    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [message, setMessage] =
        useState("");


    // ========================================
    // INPUT CHANGE
    // ========================================

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        setMessage("");
    };


    // ========================================
    // LOGIN
    // ========================================

    const handleLogin = async (e) => {

        e.preventDefault();

        if (
            !formData.email ||
            !formData.password
        ) {

            setMessage(
                "Please enter your email and password."
            );

            return;
        }


        try {

            setLoading(true);
            setMessage("");


            const response = await axios.post(
                "/api/auth/login",
                formData
            );


            const user = response.data;

            if (!user?.token) {
                setMessage(
                    "Login succeeded but no authentication token was returned."
                );
                return;
            }

            sessionStorage.removeItem("authReturnTo");


            // ========================================
            // SAVE USER
            // ========================================

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );


            // ========================================
            // REDIRECT BASED ON ROLE
            // ========================================

            if (user.role === "ADMIN") {

                navigate(
                    "/admin/dashboard",
                    {
                        replace: true
                    }
                );

            } else if (user.role === "USER") {

                if (returnTo) {

                    navigate(
                        returnTo,
                        {
                            replace: true
                        }
                    );

                } else {

                    navigate(
                        "/dashboard",
                        {
                            replace: true
                        }
                    );
                }

            } else {

                setMessage(
                    "Invalid user role."
                );

                localStorage.removeItem(
                    "user"
                );
            }


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            if (error.response) {

                const data =
                    error.response.data;


                if (
                    typeof data === "string"
                ) {

                    setMessage(data);

                } else if (
                    data?.message
                ) {

                    setMessage(
                        data.message
                    );

                } else if (
                    data?.error
                ) {

                    setMessage(
                        data.error
                    );

                } else {

                    setMessage(
                        "Invalid email or password."
                    );
                }

            } else {

                setMessage(
                    "Unable to connect to server."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="auth-page auth-login-page">

            {/* Decorative background */}
            <div className="login-deco login-deco-one"></div>
            <div className="login-deco login-deco-two"></div>
            <div className="login-grid-glow"></div>

            <main className="login-full-layout">

                {/* ========================================
                    LEFT SIDE — CODESPRINT WORLD
                ======================================== */}

                <section className="login-showcase">

                    <div className="showcase-background-lines"></div>


                    {/* BRAND */}
                    <div className="showcase-header">

                        <button
                            type="button"
                            className="showcase-logo"
                            onClick={() => navigate("/")}
                            aria-label="Go to CodeSprint home"
                        >
                            <img
                                src="/codesprint-logo.png"
                                alt="CodeSprint"
                            />
                        </button>

                        <div className="showcase-online">
                            <span></span>
                            CODESPRINT PLATFORM
                        </div>

                    </div>


                    {/* MAIN COPY */}
                    <div className="showcase-copy">

                        <span className="showcase-kicker">
                            THE CODING WORKSPACE
                        </span>

                        <h1>
                            Write code.
                            <span>Build your edge.</span>
                        </h1>

                        <p>
                            Practice problems, compete in contests,
                            complete assessments, and earn certifications
                            from one focused coding platform.
                        </p>


                        {/* PLATFORM AREAS */}
                        <div className="showcase-products">

                            <div className="showcase-product active">

                                <span className="product-icon">
                                    &lt;/&gt;
                                </span>

                                <div>
                                    <strong>
                                        Practice
                                    </strong>

                                    <small>
                                        Solve & improve
                                    </small>
                                </div>

                            </div>


                            <div className="showcase-product">

                                <span className="product-icon orange">
                                    •••
                                </span>

                                <div>
                                    <strong>
                                        Contests
                                    </strong>

                                    <small>
                                        Compete & rank
                                    </small>
                                </div>

                            </div>


                            <div className="showcase-product">

                                <span className="product-icon purple">
                                    ◇
                                </span>

                                <div>
                                    <strong>
                                        Assessments
                                    </strong>

                                    <small>
                                        Prove your skills
                                    </small>
                                </div>

                            </div>


                            <div className="showcase-product">

                                <span className="product-icon green">
                                    ✓
                                </span>

                                <div>
                                    <strong>
                                        Certifications
                                    </strong>

                                    <small>
                                        Showcase progress
                                    </small>
                                </div>

                            </div>

                        </div>

                    </div>


                    {/* LOWER PRODUCT VISUAL */}
                    <div className="showcase-visual">

                        {/* Terminal */}
                        <div className="terminal-window">

                            <div className="terminal-header">

                                <div className="terminal-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>

                                <span className="terminal-title">
                                    solution.java
                                </span>

                                <span className="terminal-language">
                                    JAVA
                                </span>

                            </div>


                            <div className="terminal-body">

                                <div className="terminal-line">
                                    <span className="line-no">
                                        01
                                    </span>

                                    <span>
                                        <em className="syntax-purple">
                                            public class
                                        </em>{" "}
                                        <b>
                                            Solution
                                        </b>{" "}
                                        {"{"}
                                    </span>
                                </div>


                                <div className="terminal-line">
                                    <span className="line-no">
                                        02
                                    </span>

                                    <span className="indent-one">
                                        <em className="syntax-blue">
                                            public static
                                        </em>{" "}
                                        <em className="syntax-purple">
                                            void
                                        </em>{" "}
                                        main(String[] args) {"{"}
                                    </span>
                                </div>


                                <div className="terminal-line">
                                    <span className="line-no">
                                        03
                                    </span>

                                    <span className="indent-two">
                                        solve();
                                    </span>
                                </div>


                                <div className="terminal-line">
                                    <span className="line-no">
                                        04
                                    </span>

                                    <span className="indent-one">
                                        {"}"}
                                    </span>
                                </div>


                                <div className="terminal-line">
                                    <span className="line-no">
                                        05
                                    </span>

                                    <span>
                                        {"}"}
                                    </span>
                                </div>

                            </div>


                            <div className="terminal-footer">

                                <span className="accepted">
                                    <i></i>
                                    Ready to run
                                </span>

                                <span>
                                    CodeSprint Editor
                                </span>

                            </div>

                        </div>


                        {/* Floating platform card */}
                        <div className="showcase-floating-card">

                            <span className="floating-label">
                                YOUR JOURNEY
                            </span>

                            <strong>
                                Learn → Practice → Compete
                            </strong>

                            <div className="journey-bar">
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>

                            <small>
                                One platform for every step.
                            </small>

                        </div>

                    </div>


                    <div className="showcase-footer">
                        Built for focused practice · CodeSprint
                    </div>

                </section>


                {/* ========================================
                    RIGHT SIDE — LOGIN
                ======================================== */}

                <section className="login-panel">

                    <div className="login-panel-inner">

                        <div className="mobile-logo">

                            <button
                                type="button"
                                onClick={() => navigate("/")}
                            >
                                <img
                                    src="/codesprint-logo.png"
                                    alt="CodeSprint"
                                />
                            </button>

                        </div>


                        <div className="login-heading">

                            <span>
                                WELCOME BACK
                            </span>

                            <h2>
                                Sign in to your account
                            </h2>

                            <p>
                                Continue your CodeSprint journey.
                            </p>

                        </div>


                        {/* LOGIN FORM */}

                        <form
                            onSubmit={handleLogin}
                            className="login-form"
                        >

                            {/* EMAIL */}

                            <div className="login-field">

                                <label htmlFor="login-email">
                                    Email address
                                </label>

                                <div className="login-input">

                                    <span>
                                        @
                                    </span>

                                    <input
                                        id="login-email"
                                        type="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                    />

                                </div>

                            </div>


                            {/* PASSWORD */}

                            <div className="login-field">

                                <label htmlFor="login-password">
                                    Password
                                </label>

                                <div className="login-input">

                                    <span className="password-symbol">
                                        ●
                                    </span>

                                    <input
                                        id="login-password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        autoComplete="current-password"
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                    >
                                        {
                                            showPassword
                                                ? "Hide"
                                                : "Show"
                                        }
                                    </button>

                                </div>

                            </div>


                            {/* MESSAGE */}

                            {message && (

                                <p
                                    className="auth-message login-error"
                                    role="alert"
                                    aria-live="polite"
                                >
                                    {message}
                                </p>

                            )}


                            {/* BUTTON */}

                            <button
                                type="submit"
                                className="login-submit"
                                disabled={loading}
                            >

                                <span>
                                    {
                                        loading
                                            ? "Signing in..."
                                            : "Sign in"
                                    }
                                </span>

                                {!loading && (
                                    <span className="login-arrow">
                                        →
                                    </span>
                                )}

                            </button>

                        </form>


                        {/* REGISTER */}

                        <div className="login-register">

                            <span>
                                Don't have an account?
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/register")
                                }
                            >
                                Create account
                            </button>

                        </div>


                        {/* BOTTOM INFO */}

                        <div className="login-trust">

                            <span className="trust-check">
                                ✓
                            </span>

                            <span>
                                Secure authentication
                            </span>

                            <span className="trust-divider">
                                |
                            </span>

                            <span>
                                CodeSprint
                            </span>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}


export default Login;
