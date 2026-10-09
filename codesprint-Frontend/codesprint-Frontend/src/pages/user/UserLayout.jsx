import {
    useEffect,
    useState
} from "react";

import {
    Navigate,
    useNavigate
} from "react-router-dom";

import {
    useTranslation
} from "react-i18next";

import UserSidebar from "./UserSidebar";

import "./UserLayout.css";

import languages from "../../i18n/languages.js";


function UserLayout({ children }) {

    const navigate = useNavigate();

    const {
        t,
        i18n
    } = useTranslation();


    // ========================================
    // SELECTED LANGUAGE
    // ========================================

    const [
        selectedLanguage,
        setSelectedLanguage
    ] = useState(
        localStorage.getItem(
            "codesprint-language"
        ) || "en"
    );


    // ========================================
    // LOGGED-IN USER
    // ========================================

    const storedUser =
        localStorage.getItem("user");

    let user = null;

    try {

        user = storedUser
            ? JSON.parse(storedUser)
            : null;

    } catch (error) {

        console.error(
            "Invalid user data:",
            error
        );

        user = null;
    }


    const userName =
        user?.name ||
        t("common.user");


    // ========================================
    // INITIALIZE LANGUAGE
    // ========================================

    useEffect(() => {

        const savedLanguage =
            localStorage.getItem(
                "codesprint-language"
            ) || "en";


        // Check if saved language exists
        const languageExists =
            languages.some(
                (language) =>
                    language.code === savedLanguage
            );


        const languageToUse =
            languageExists
                ? savedLanguage
                : "en";


        setSelectedLanguage(
            languageToUse
        );


        // Change i18next language
        if (
            i18n.language !==
            languageToUse
        ) {

            i18n.changeLanguage(
                languageToUse
            );
        }


        // Find language configuration
        const languageData =
            languages.find(
                (language) =>
                    language.code ===
                    languageToUse
            );


        // Set HTML language
        document.documentElement.lang =
            languageToUse;


        // Set text direction
        document.documentElement.dir =
            languageData?.direction ||
            "ltr";


    }, [i18n]);


    // ========================================
    // CHANGE LANGUAGE
    // ========================================

    const handleLanguageChange =
        async (event) => {

            const languageCode =
                event.target.value;


            try {

                // Change i18next language
                await i18n.changeLanguage(
                    languageCode
                );


                // Update state
                setSelectedLanguage(
                    languageCode
                );


                // Save language
                localStorage.setItem(
                    "codesprint-language",
                    languageCode
                );


                // Find language information
                const languageData =
                    languages.find(
                        (language) =>
                            language.code ===
                            languageCode
                    );


                // Update HTML language
                document.documentElement.lang =
                    languageCode;


                // Update RTL/LTR
                document.documentElement.dir =
                    languageData?.direction ||
                    "ltr";


            } catch (error) {

                console.error(
                    "Failed to change language:",
                    error
                );

            }
        };


    // ========================================
    // LOGOUT
    // ========================================

    const handleLogout = () => {

        localStorage.removeItem(
            "user"
        );

        localStorage.removeItem(
            "token"
        );

        navigate("/login");
    };


    // ========================================
    // UI
    // ========================================

    if (!user?.token) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "USER") {
        return <Navigate to="/admin/dashboard" replace />;
    }


    return (

        <div className="user-layout">


            {/* ========================================
                SIDEBAR
            ======================================== */}

            <UserSidebar />


            {/* ========================================
                MAIN AREA
            ======================================== */}

            <div className="user-layout-main">


                {/* ========================================
                    USER NAVBAR
                ======================================== */}

                <nav className="user-navbar">


                    {/* ====================================
                        SEARCH
                    ==================================== */}

                    <div className="user-navbar-search">

                        <span className="user-navbar-search-icon">
                            ⌕
                        </span>


                        <input
                            type="text"
                            placeholder={
                                t(
                                    "navbar.searchProblems"
                                )
                            }
                        />

                    </div>


                    {/* ====================================
                        ACTIONS
                    ==================================== */}

                    <div className="user-navbar-actions">


                        {/* ==================================
                            LANGUAGE SELECTOR
                        ================================== */}

                        <div className="user-language-selector">

                            <span
                                className="user-language-icon"
                                aria-hidden="true"
                            >
                                🌐
                            </span>


                            <select
                                value={
                                    selectedLanguage
                                }
                                onChange={
                                    handleLanguageChange
                                }
                                className="user-language-select"
                                aria-label="Select language"
                            >

                                {languages.map(
                                    (language) => (

                                        <option
                                            key={
                                                language.code
                                            }
                                            value={
                                                language.code
                                            }
                                        >
                                            {
                                                language.nativeName
                                            }
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* ==================================
                            NOTIFICATION
                        ================================== */}

                        <button
                            type="button"
                            className="user-notification-button"
                            aria-label={
                                t(
                                    "navbar.notifications"
                                )
                            }
                            title={
                                t(
                                    "navbar.notifications"
                                )
                            }
                        >
                            🔔
                        </button>


                        {/* ==================================
                            PROFILE
                        ================================== */}

                        <button
                            type="button"
                            className="user-profile-button"
                            onClick={() =>
                                navigate(
                                    "/user/profile"
                                )
                            }
                        >

                            <span className="user-profile-circle">

                                {
                                    userName
                                        .charAt(0)
                                        .toUpperCase()
                                }

                            </span>


                            <span className="user-profile-name">

                                {userName}

                            </span>

                        </button>


                        {/* ==================================
                            LOGOUT
                        ================================== */}

                        <button
                            type="button"
                            className="user-navbar-logout"
                            onClick={
                                handleLogout
                            }
                        >
                            {
                                t(
                                    "common.logout"
                                )
                            }
                        </button>

                    </div>

                </nav>


                {/* ========================================
                    PAGE CONTENT
                ======================================== */}

                <main className="user-layout-content">

                    {children}

                </main>

            </div>

        </div>
    );
}


export default UserLayout;