import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
    const navigate = useNavigate();

    const cards = [
        {
            icon: "👤",
            title: "Personal Details",
            description:
                "View and manage your name, email address, and account security.",
            path: "/user/profile/personal-details",
            accent: "profile-card-blue"
        },
        {
            icon: "🏆",
            title: "My Contest Activity",
            description:
                "View your contest participation, scores, solved problems, and rankings.",
            path: "/user/profile/contest-activity",
            accent: "profile-card-orange"
        },
        {
            icon: "🎓",
            title: "My Certificates",
            description:
                "View the certificates you have earned through CodeSprint.",
            path: "/user/profile/certificates",
            accent: "profile-card-purple"
        }
    ];

    return (
        <div className="profile-hub-page">
            <div className="profile-hub-header">
                <div>
                    <span className="profile-hub-eyebrow">
                        ACCOUNT
                    </span>

                    <h1>My Profile</h1>

                    <p>
                        Manage your account and view your CodeSprint achievements.
                    </p>
                </div>

                <button
                    type="button"
                    className="profile-hub-back-button"
                    onClick={() => navigate("/dashboard")}
                >
                    ← Dashboard
                </button>
            </div>

            <section className="profile-hub-grid">
                {cards.map((card) => (
                    <button
                        type="button"
                        className={`profile-hub-card ${card.accent}`}
                        key={card.path}
                        onClick={() => navigate(card.path)}
                    >
                        <div className="profile-hub-card-top">
                            <div className="profile-hub-icon">
                                {card.icon}
                            </div>

                            <span className="profile-hub-arrow">
                                →
                            </span>
                        </div>

                        <div className="profile-hub-card-content">
                            <h2>{card.title}</h2>

                            <p>{card.description}</p>
                        </div>

                        <div className="profile-hub-card-link">
                            Open section
                            <span>→</span>
                        </div>
                    </button>
                ))}
            </section>
        </div>
    );
}

export default Profile;
