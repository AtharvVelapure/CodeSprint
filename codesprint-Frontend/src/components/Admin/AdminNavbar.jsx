import { useNavigate } from "react-router-dom";

function AdminNavbar() {

    const navigate = useNavigate();


    // ========================================
    // LOGOUT
    // ========================================

    const handleLogout = () => {

        localStorage.removeItem("user");

        navigate("/login");
    };


    // ========================================
    // ADMIN PROFILE
    // ========================================

    const handleProfile = () => {

        navigate("/admin/profile");
    };


    return (

        <header className="admin-navbar">


            {/* ========================================
                LOGO
            ======================================== */}

            <div className="admin-brand">

                <img
                    src="/codesprint-logo.png"
                    alt="CodeSprint"
                    className="admin-logo"
                />

            </div>


            {/* ========================================
                RIGHT SIDE
            ======================================== */}

            <div className="admin-nav-right">


                {/* ========================================
                    SEARCH
                ======================================== */}

                <div className="admin-search">

                    <span>
                        ⌕
                    </span>

                    <input
                        type="text"
                        placeholder="Search..."
                    />

                </div>


                {/* ========================================
                    NOTIFICATIONS
                ======================================== */}

                <button
                    className="notification-btn"
                    type="button"
                >

                    🔔

                    <span className="notification-dot"></span>

                </button>


                {/* ========================================
                    ADMIN PROFILE
                ======================================== */}

                <button
                    type="button"
                    className="admin-profile"
                    onClick={handleProfile}
                >

                    <div className="admin-avatar">
                        A
                    </div>

                    <div className="admin-info">

                        <span className="admin-name">
                            Admin
                        </span>

                        <span className="admin-role">
                            Administrator
                        </span>

                    </div>

                </button>


                {/* ========================================
                    LOGOUT
                ======================================== */}

                <button
                    type="button"
                    className="admin-logout"
                    onClick={handleLogout}
                >
                    Logout
                </button>


            </div>

        </header>
    );
}

export default AdminNavbar;