import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.password) {
            setMessage("Please fill in all fields.");
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const response = await axios.post(
                "/api/auth/register",
                formData
            );

            setMessage(response.data);

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {

            console.error(error);

            if (error.response) {
                setMessage(error.response.data);
            } else {
                setMessage("Unable to connect to server.");
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page auth-register-page">

            <div className="register-bg-orb register-bg-orb-one"></div>
            <div className="register-bg-orb register-bg-orb-two"></div>
            <div className="register-bg-line"></div>

            <main className="register-full-layout">

                {/* =================================================
                    LEFT — CODE SPRINT INTRO
                ================================================= */}

                <section className="register-showcase">

                    <div className="register-grid-pattern"></div>


                    {/* BRAND */}

                    <div className="register-showcase-header">

                        <button
                            type="button"
                            className="register-brand"
                            onClick={() => navigate("/")}
                            aria-label="Go to CodeSprint home"
                        >
                            <img
                                src="/codesprint-logo.png"
                                alt="CodeSprint"
                            />
                        </button>

                        <div className="register-platform-status">
                            <span></span>
                            JOIN THE PLATFORM
                        </div>

                    </div>


                    {/* MAIN INTRO */}

                    <div className="register-showcase-content">

                        <span className="register-kicker">
                            START HERE
                        </span>

                        <h1>
                            Build your
                            <span>coding journey.</span>
                        </h1>

                        <p>
                            Create your CodeSprint account and get one
                            workspace for practice, contests, assessments,
                            and certifications.
                        </p>


                        {/* JOURNEY STEPS */}

                        <div className="register-journey">

                            <div className="register-journey-step active">

                                <span className="journey-step-number">
                                    01
                                </span>

                                <div>
                                    <strong>
                                        Create your profile
                                    </strong>

                                    <small>
                                        Set up your CodeSprint account.
                                    </small>
                                </div>

                                <span className="journey-step-check">
                                    ✓
                                </span>

                            </div>


                            <div className="register-journey-step">

                                <span className="journey-step-number">
                                    02
                                </span>

                                <div>
                                    <strong>
                                        Practice & learn
                                    </strong>

                                    <small>
                                        Solve coding problems at your pace.
                                    </small>
                                </div>

                            </div>


                            <div className="register-journey-step">

                                <span className="journey-step-number">
                                    03
                                </span>

                                <div>
                                    <strong>
                                        Compete & grow
                                    </strong>

                                    <small>
                                        Join contests and earn certifications.
                                    </small>
                                </div>

                            </div>

                        </div>

                    </div>


                    {/* LOWER VISUAL */}

                    <div className="register-showcase-visual">

                        <div className="register-code-window">

                            <div className="register-code-header">

                                <div className="register-code-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>

                                <span>
                                    welcome.java
                                </span>

                                <small>
                                    CODESPRINT
                                </small>

                            </div>


                            <div className="register-code-body">

                                <div>
                                    <span>01</span>
                                    <code>
                                        <em>public class</em>{" "}
                                        <b>Developer</b> {"{"}
                                    </code>
                                </div>

                                <div>
                                    <span>02</span>
                                    <code className="register-indent-one">
                                        <em>String</em> goal =
                                        <i>"keep building"</i>;
                                    </code>
                                </div>

                                <div>
                                    <span>03</span>
                                    <code>
                                        {"}"}
                                    </code>
                                </div>

                            </div>

                            <div className="register-code-footer">

                                <span>
                                    <i></i>
                                    Ready when you are
                                </span>

                                <span>
                                    CodeSprint Editor
                                </span>

                            </div>

                        </div>


                        <div className="register-float-card">

                            <span>
                                YOUR NEXT STEP
                            </span>

                            <strong>
                                Create. Code. Improve.
                            </strong>

                            <div className="register-progress">
                                <i></i>
                                <i></i>
                                <i></i>
                                <i></i>
                                <i></i>
                            </div>

                        </div>

                    </div>


                    <div className="register-showcase-footer">
                        One account · One coding workspace · CodeSprint
                    </div>

                </section>


                {/* =================================================
                    RIGHT — REGISTRATION FORM
                ================================================= */}

                <section className="register-panel">

                    <div className="register-form-wrap">

                        <div className="register-mobile-logo">

                            <button
                                type="button"
                                onClick={() => navigate("/")}
                                aria-label="Go to CodeSprint home"
                            >
                                <img
                                    src="/codesprint-logo.png"
                                    alt="CodeSprint"
                                />
                            </button>

                        </div>


                        <div className="register-heading">

                            <span>
                                CREATE YOUR ACCOUNT
                            </span>

                            <h2>
                                Join CodeSprint
                            </h2>

                            <p>
                                Set up your account and start coding.
                            </p>

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={handleRegister}
                            className="register-form"
                        >

                            {/* NAME */}

                            <div className="register-field">

                                <label htmlFor="register-name">
                                    Full name
                                </label>

                                <div className="register-input">

                                    <span>
                                        Aa
                                    </span>

                                    <input
                                        id="register-name"
                                        type="text"
                                        name="name"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        autoComplete="name"
                                    />

                                </div>

                            </div>


                            {/* EMAIL */}

                            <div className="register-field">

                                <label htmlFor="register-email">
                                    Email address
                                </label>

                                <div className="register-input">

                                    <span>
                                        @
                                    </span>

                                    <input
                                        id="register-email"
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

                            <div className="register-field">

                                <label htmlFor="register-password">
                                    Password
                                </label>

                                <div className="register-input">

                                    <span className="register-password-symbol">
                                        ●
                                    </span>

                                    <input
                                        id="register-password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="button"
                                        className="register-password-toggle"
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
                                    className="auth-message register-message"
                                    role="alert"
                                    aria-live="polite"
                                >
                                    {message}
                                </p>

                            )}


                            {/* CREATE ACCOUNT */}

                            <button
                                type="submit"
                                className="register-submit"
                                disabled={loading}
                            >

                                <span>
                                    {
                                        loading
                                            ? "Creating account..."
                                            : "Create account"
                                    }
                                </span>

                                {!loading && (
                                    <span className="register-arrow">
                                        →
                                    </span>
                                )}

                            </button>

                        </form>


                        {/* LOGIN */}

                        <div className="register-login-row">

                            <span>
                                Already have an account?
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/login")
                                }
                            >
                                Sign in
                            </button>

                        </div>


                        {/* TRUST */}

                        <div className="register-trust">

                            <span>
                                ✓
                            </span>

                            <span>
                                Secure account creation
                            </span>

                            <i></i>

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

export default Register;
