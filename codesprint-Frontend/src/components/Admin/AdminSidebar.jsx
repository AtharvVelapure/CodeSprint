import { NavLink } from "react-router-dom";
import "./AdminSidebar.css";

function AdminSidebar() {

    return (
        <aside className="admin-sidebar">

            <div className="sidebar-menu">

                {/* ========================================
                    DASHBOARD
                ======================================== */}

                <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-item active"
                            : "sidebar-item"
                    }
                >
                    <span className="sidebar-icon">▦</span>
                    <span>Dashboard</span>
                </NavLink>


                {/* ========================================
                    USER MANAGEMENT
                ======================================== */}

                <NavLink
                    to="/admin/users"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-item active"
                            : "sidebar-item"
                    }
                >
                    <span className="sidebar-icon">♙</span>
                    <span>User Management</span>
                </NavLink>


                {/* ========================================
                    PROBLEM MANAGEMENT
                ======================================== */}

                <NavLink
                    to="/admin/problems"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-item active"
                            : "sidebar-item"
                    }
                >
                    <span className="sidebar-icon">▤</span>
                    <span>Problem Management</span>
                </NavLink>


                {/* ========================================
                    TEST CASE MANAGEMENT
                ======================================== */}

                <NavLink
                    to="/admin/test-cases"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-item active"
                            : "sidebar-item"
                    }
                >
                    <span className="sidebar-icon">□</span>
                    <span>Test Case Management</span>
                </NavLink>


                {/* ========================================
                    SUBMISSIONS
                ======================================== */}

                <NavLink
                    to="/admin/submissions"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-item active"
                            : "sidebar-item"
                    }
                >
                    <span className="sidebar-icon">⌁</span>
                    <span>Submissions</span>
                </NavLink>


                {/* ========================================
                    LEADERBOARDS
                ======================================== */}

                <NavLink
                    to="/admin/leaderboards"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-item active"
                            : "sidebar-item"
                    }
                >
                    <span className="sidebar-icon">♜</span>
                    <span>Leaderboards</span>
                </NavLink>


                {/* ========================================
                    HINTS & EDITORIALS
                ======================================== */}

                <NavLink
                    to="/admin/hints-editorials"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-item active"
                            : "sidebar-item"
                    }
                >
                    <span className="sidebar-icon">💡</span>
                    <span>Hints &amp; Editorials</span>
                </NavLink>


                {/* ========================================
                    CONTESTS
                ======================================== */}

                <NavLink
                    to="/admin/contests"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-item active"
                            : "sidebar-item"
                    }
                >
                    <span className="sidebar-icon">🏆</span>
                    <span>Contests</span>
                </NavLink>


                {/* ========================================
                    CERTIFICATIONS
                ======================================== */}

                <NavLink
                    to="/admin/certifications"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-item active"
                            : "sidebar-item"
                    }
                >
                    <span className="sidebar-icon">🎓</span>
                    <span>Certifications</span>
                </NavLink>


                {/* ========================================
                    ASSESSMENT HOST VERIFICATION
                ======================================== */}

                <NavLink
                    to="/admin/assessment-host-verification"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-item active"
                            : "sidebar-item"
                    }
                >
                    <span className="sidebar-icon">✓</span>
                    <span>Assessment Verification</span>
                </NavLink>


                {/* ========================================
                    SUPPORT
                ======================================== */}

                <NavLink
                    to="/admin/support"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-item active"
                            : "sidebar-item"
                    }
                >
                    <span className="sidebar-icon">🎧</span>
                    <span>Support</span>
                </NavLink>


                {/* ========================================
                    REPORTS & ANALYTICS
                ======================================== */}

                <NavLink
                    to="/admin/reports"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-item active"
                            : "sidebar-item"
                    }
                >
                    <span className="sidebar-icon">▥</span>
                    <span>Reports &amp; Analytics</span>
                </NavLink>

                {/* ========================================
                    LOGOUT
                ======================================== */}

                <NavLink
                    to="/"
                    className="sidebar-item logout-item"
                >
                    <span className="sidebar-icon">↪</span>
                    <span>Logout</span>
                </NavLink>

            </div>

        </aside>
    );
}

export default AdminSidebar;