import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-page">

            {/* ================================
                NAVBAR
            ================================ */}
            <nav className="landing-navbar">
                <div className="landing-navbar-inner">

                    <button
                        type="button"
                        className="landing-brand"
                        onClick={() => navigate("/")}
                        aria-label="CodeSprint home"
                    >
                        <img
                            src="/codesprint-logo.png"
                            alt="CodeSprint"
                            className="landing-logo"
                        />
                    </button>

                    <div className="landing-nav-links">
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                        >
                            Practice
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                        >
                            Contests
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                        >
                            Assessments
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                        >
                            Certifications
                        </button>
                    </div>

                    <div className="landing-nav-actions">
                        <button
                            type="button"
                            className="landing-login-button"
                            onClick={() => navigate("/login")}
                        >
                            Log in
                        </button>

                        <button
                            type="button"
                            className="landing-nav-primary"
                            onClick={() => navigate("/register")}
                        >
                            Get started
                            <span>→</span>
                        </button>
                    </div>
                </div>
            </nav>


            {/* ================================
                HERO
            ================================ */}
            <main className="landing-main">

                <section className="landing-hero">
                    <div className="landing-hero-copy">

                        <div className="landing-status-pill">
                            <span className="landing-status-dot"></span>
                            Built for developers who keep improving
                        </div>

                        <h1>
                            Practice code.
                            <span>Build confidence.</span>
                            <strong>Become better.</strong>
                        </h1>

                        <p className="landing-hero-description">
                            Solve real coding problems, compete in contests,
                            complete assessments, and earn certifications —
                            all in one focused developer platform.
                        </p>

                        <div className="landing-hero-actions">
                            <button
                                type="button"
                                className="landing-primary-button"
                                onClick={() => navigate("/register")}
                            >
                                Start coding free
                                <span>→</span>
                            </button>

                            <button
                                type="button"
                                className="landing-secondary-button"
                                onClick={() => navigate("/login")}
                            >
                                I already have an account
                            </button>
                        </div>

                        <div className="landing-hero-meta">
                            <span>
                                <i>✓</i>
                                Free to get started
                            </span>

                            <span>
                                <i>✓</i>
                                Practice at your own pace
                            </span>

                            <span>
                                <i>✓</i>
                                Track your progress
                            </span>
                        </div>
                    </div>


                    {/* ================================
                        CODE VISUAL
                    ================================ */}
                    <div className="landing-hero-visual">

                        <div className="landing-orbit landing-orbit-one"></div>
                        <div className="landing-orbit landing-orbit-two"></div>
                        <div className="landing-visual-glow"></div>

                        <div className="landing-editor-card">

                            <div className="landing-editor-topbar">
                                <div className="landing-window-controls">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>

                                <div className="landing-editor-file">
                                    <span className="landing-java-icon">J</span>
                                    solution.java
                                </div>

                                <span className="landing-editor-menu">•••</span>
                            </div>

                            <div className="landing-editor-body">

                                <div className="landing-line">
                                    <span className="line-number">01</span>
                                    <span>
                                        <em className="syntax-purple">public</em>{" "}
                                        <em className="syntax-blue">class</em>{" "}
                                        Solution {"{"}
                                    </span>
                                </div>

                                <div className="landing-line">
                                    <span className="line-number">02</span>
                                    <span className="landing-indent">
                                        <em className="syntax-purple">public</em>{" "}
                                        <em className="syntax-blue">int</em>{" "}
                                        solve(int[] nums) {"{"}
                                    </span>
                                </div>

                                <div className="landing-line">
                                    <span className="line-number">03</span>
                                    <span className="landing-indent-two">
                                        <em className="syntax-purple">return</em>{" "}
                                        <em className="syntax-orange">42</em>;
                                    </span>
                                </div>

                                <div className="landing-line">
                                    <span className="line-number">04</span>
                                    <span className="landing-indent">{"}"}</span>
                                </div>

                                <div className="landing-line">
                                    <span className="line-number">05</span>
                                    <span>{"}"}</span>
                                </div>

                                <div className="landing-line landing-line-muted">
                                    <span className="line-number">06</span>
                                    <span></span>
                                </div>

                            </div>

                            <div className="landing-editor-footer">
                                <span className="landing-ready">
                                    <i></i>
                                    Ready
                                </span>

                                <span>Java · 1 test case</span>
                            </div>
                        </div>


                        <div className="landing-floating-card landing-result-card">
                            <span className="landing-floating-icon landing-success-icon">
                                ✓
                            </span>

                            <div>
                                <strong>Accepted</strong>
                                <span>18 ms · 12.4 MB</span>
                            </div>
                        </div>


                        <div className="landing-floating-card landing-progress-card">
                            <div className="landing-progress-heading">
                                <span>Weekly progress</span>
                                <strong>72%</strong>
                            </div>

                            <div className="landing-progress-track">
                                <div></div>
                            </div>

                            <span className="landing-progress-caption">
                                18 of 25 practice goals completed
                            </span>
                        </div>


                        <div className="landing-floating-chip landing-rank-chip">
                            <span>↗</span>
                            Improving rank
                        </div>
                    </div>
                </section>


                {/* ================================
                    METRICS STRIP
                ================================ */}
                <section className="landing-metrics">

                    <div className="landing-metric">
                        <strong>Practice</strong>
                        <span>Structured coding challenges</span>
                    </div>

                    <div className="landing-metric-divider"></div>

                    <div className="landing-metric">
                        <strong>Compete</strong>
                        <span>Contests and live rankings</span>
                    </div>

                    <div className="landing-metric-divider"></div>

                    <div className="landing-metric">
                        <strong>Assess</strong>
                        <span>Real coding assessments</span>
                    </div>

                    <div className="landing-metric-divider"></div>

                    <div className="landing-metric">
                        <strong>Certify</strong>
                        <span>Verifiable achievements</span>
                    </div>
                </section>


                {/* ================================
                    FEATURES
                ================================ */}
                <section className="landing-features-section">

                    <div className="landing-section-heading">
                        <span>ONE PLATFORM, FOUR WAYS TO GROW</span>

                        <h2>
                            Everything you need to
                            <span> keep moving forward.</span>
                        </h2>

                        <p>
                            CodeSprint brings daily practice, competition,
                            assessment, and certification into one connected
                            coding experience.
                        </p>
                    </div>

                    <div className="landing-feature-grid">

                        <article className="landing-feature-card feature-blue">
                            <div className="landing-feature-icon">⌘</div>

                            <span className="landing-feature-number">
                                01
                            </span>

                            <h3>Practice Problems</h3>

                            <p>
                                Work through algorithmic challenges and
                                strengthen your problem-solving fundamentals.
                            </p>

                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                            >
                                Explore practice
                                <span>→</span>
                            </button>
                        </article>

                        <article className="landing-feature-card feature-purple">
                            <div className="landing-feature-icon">♟</div>

                            <span className="landing-feature-number">
                                02
                            </span>

                            <h3>Contests</h3>

                            <p>
                                Test yourself against the clock and follow
                                your performance on competitive rankings.
                            </p>

                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                            >
                                View contests
                                <span>→</span>
                            </button>
                        </article>

                        <article className="landing-feature-card feature-cyan">
                            <div className="landing-feature-icon">◈</div>

                            <span className="landing-feature-number">
                                03
                            </span>

                            <h3>Assessments</h3>

                            <p>
                                Take structured coding assessments designed
                                around practical evaluation workflows.
                            </p>

                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                            >
                                View assessments
                                <span>→</span>
                            </button>
                        </article>

                        <article className="landing-feature-card feature-orange">
                            <div className="landing-feature-icon">✦</div>

                            <span className="landing-feature-number">
                                04
                            </span>

                            <h3>Certifications</h3>

                            <p>
                                Turn successful certification attempts into
                                achievements you can keep and verify.
                            </p>

                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                            >
                                Explore certifications
                                <span>→</span>
                            </button>
                        </article>
                    </div>
                </section>


                {/* ================================
                    CTA
                ================================ */}
                <section className="landing-cta">

                    <div className="landing-cta-grid"></div>

                    <div className="landing-cta-copy">
                        <span>YOUR NEXT SOLUTION STARTS HERE</span>

                        <h2>
                            Ready to write
                            <br />
                            better code?
                        </h2>

                        <p>
                            Create your CodeSprint account and start building
                            your problem-solving skills today.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                        >
                            Create free account
                            <span>→</span>
                        </button>
                    </div>

                    <div className="landing-cta-terminal">
                        <div className="terminal-header">
                            <div>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <small>codesprint</small>
                        </div>

                        <div className="terminal-body">
                            <p>
                                <span className="terminal-green">$</span>{" "}
                                codesprint start
                            </p>
                            <p className="terminal-muted">
                                Loading your coding journey...
                            </p>
                            <p>
                                <span className="terminal-green">✓</span>{" "}
                                Workspace ready
                            </p>
                            <p>
                                <span className="terminal-green">✓</span>{" "}
                                Problems unlocked
                            </p>
                            <p className="terminal-cursor">
                                <span className="terminal-green">$</span>{" "}
                                _
                            </p>
                        </div>
                    </div>
                </section>
            </main>


            {/* ================================
                FOOTER
            ================================ */}
            <footer className="landing-footer">

                <div className="landing-footer-inner">

                    <div className="landing-footer-brand">
                        <img
                            src="/codesprint-logo.png"
                            alt="CodeSprint"
                        />

                        <p>
                            A focused platform for developers to practice,
                            compete, and grow.
                        </p>
                    </div>

                    <div className="landing-footer-links">

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                        >
                            Practice
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                        >
                            Contests
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                        >
                            Assessments
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                        >
                            Certifications
                        </button>

                    </div>

                    <div className="landing-footer-bottom">
                        <span>© 2026 CodeSprint</span>
                        <span>Built for continuous improvement.</span>
                    </div>

                </div>
            </footer>

        </div>
    );
}

export default LandingPage;
