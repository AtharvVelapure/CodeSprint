import {
    NavLink,
    useNavigate
} from "react-router-dom";

import {
    useTranslation
} from "react-i18next";

import "./UserSidebar.css";


function UserSidebar() {

    const navigate = useNavigate();

    const { t } = useTranslation();


    // ========================================
    // LOGOUT
    // ========================================

    const handleLogout = () => {

        localStorage.removeItem("user");

        localStorage.removeItem("token");

        navigate("/login");
    };


    return (

        <aside className="user-sidebar">


            {/* =================================================
                LOGO
            ================================================= */}

            <div
                className="user-sidebar-logo"
                onClick={() =>
                    navigate("/dashboard")
                }
            >

                <img
                    src="/codesprint-logo.png"
                    alt="CodeSprint"
                />

            </div>


            {/* =================================================
                MAIN MENU
            ================================================= */}

            <nav className="user-sidebar-menu">


                {/* ============================================
                    DASHBOARD
                ============================================ */}

                <NavLink
                    to="/dashboard"
                    end
                    className={({ isActive }) =>
                        isActive
                            ? "user-sidebar-item active"
                            : "user-sidebar-item"
                    }
                >

                    <span className="user-sidebar-icon">
                        ▦
                    </span>

                    <span>
                        {t("sidebar.dashboard")}
                    </span>

                </NavLink>


                {/* ============================================
                    PROBLEMS
                ============================================ */}

                <NavLink
                    to="/user/problems"
                    className={({ isActive }) =>
                        isActive
                            ? "user-sidebar-item active"
                            : "user-sidebar-item"
                    }
                >

                    <span className="user-sidebar-icon">
                        ▤
                    </span>

                    <span>
                        {t("Problems")}
                    </span>

                </NavLink>


                {/* ============================================
                    MY SUBMISSIONS
                ============================================ */}

                <NavLink
                    to="/user/submissions"
                    className={({ isActive }) =>
                        isActive
                            ? "user-sidebar-item active"
                            : "user-sidebar-item"
                    }
                >

                    <span className="user-sidebar-icon">
                        ▥
                    </span>

                    <span>
                        {t("My Submissions")}
                    </span>

                </NavLink>


                {/* ============================================
                    PROGRESS DASHBOARD
                ============================================ */}

                
                <NavLink
                    to="/user/progress"
                    className={({ isActive }) =>
                        isActive
                            ? "user-sidebar-item active"
                            : "user-sidebar-item"
                    }
                >

                    <span className="user-sidebar-icon">
                        ♜
                    </span>

                    <span>
                        {t("Progress Dashboard")}
                    </span>

                </NavLink>


                {/* ============================================
                    LEADERBOARD
                ============================================ */}

                <NavLink
                    to="/user/leaderboard"
                    className={({ isActive }) =>
                        isActive
                            ? "user-sidebar-item active"
                            : "user-sidebar-item"
                    }
                >

                    <span className="user-sidebar-icon">
                        ♜
                    </span>

                    <span>
                        {t("leaderboard")}
                    </span>

                </NavLink>


                {/* ============================================
                    CONTESTS
                ============================================ */}

                <NavLink
                    to="/user/contests"
                    className={({ isActive }) =>
                        isActive
                            ? "user-sidebar-item active"
                            : "user-sidebar-item"
                    }
                >

                    <span className="user-sidebar-icon">
                        🏆
                    </span>

                    <span>
                        {t("contests")}
                    </span>

                </NavLink>


                {/* ============================================
                    ASSESSMENTS
                ============================================ */}

                <NavLink
                    to="/user/assessments"
                    className={({ isActive }) =>
                        isActive
                            ? "user-sidebar-item active"
                            : "user-sidebar-item"
                    }
                >

                    <span className="user-sidebar-icon">
                        📝
                    </span>

                    <span>
                        Assessments
                    </span>

                </NavLink>


                {/* ============================================
                    CERTIFICATIONS
                ============================================ */}

                <NavLink
                    to="/user/certifications"
                    className={({ isActive }) =>
                        isActive
                            ? "user-sidebar-item active"
                            : "user-sidebar-item"
                    }
                >

                    <span className="user-sidebar-icon">
                        🎓
                    </span>

                    <span>
                        {t("sidebar.certifications")}
                    </span>

                </NavLink>


                {/* ============================================
                    PROFILE
                ============================================ */}

                <NavLink
                    to="/user/profile"
                    className={({ isActive }) =>
                        isActive
                            ? "user-sidebar-item active"
                            : "user-sidebar-item"
                    }
                >

                    <span className="user-sidebar-icon">
                        ♙
                    </span>

                    <span>
                        {t("Profile")}
                    </span>

                </NavLink>


                {/* ============================================
                    SUPPORT
                ============================================ */}

                <NavLink
                    to="/user/support"
                    className={({ isActive }) =>
                        isActive
                            ? "user-sidebar-item active"
                            : "user-sidebar-item"
                    }
                >

                    <span className="user-sidebar-icon">
                        🎧
                    </span>

                    <span>
                        Support
                    </span>

                </NavLink>

            </nav>


            {/* =================================================
                BOTTOM MENU
            ================================================= */}

            <div className="user-sidebar-bottom">


                {/* ============================================
                    LOGOUT
                ============================================ */}

                <button
                    type="button"
                    className="user-sidebar-item user-logout-item"
                    onClick={handleLogout}
                >

                    <span className="user-sidebar-icon">
                        ↪
                    </span>

                    <span>
                        {t("sidebar.logout")}
                    </span>

                </button>

            </div>

        </aside>
    );
}


export default UserSidebar;