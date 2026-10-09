import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ProfilePersonalDetails.css";

function ProfilePersonalDetails() {
    const navigate = useNavigate();

    const storedUser = localStorage.getItem("user");

    let user = null;

    try {
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error("Invalid user data:", error);
    }

    const userId = user?.id;
    const isAdmin = user?.role === "ADMIN";

    const profileHomePath = isAdmin
        ? "/admin/dashboard"
        : "/user/profile";

    useEffect(() => {
        if (!userId) {
            navigate("/login");
            return;
        }

        const loadProfile = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axios.get(
                    `/api/users/${userId}/profile`
                );

                setProfile({
                    name: response.data?.name || "",
                    email: response.data?.email || "",
                    currentPassword: "",
                    newPassword: ""
                });
            } catch (err) {
                console.error("Profile loading error:", err);

                setError(
                    "Unable to load your profile information."
                );
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [userId, navigate]);

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        currentPassword: "",
        newPassword: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setProfile((previous) => ({
            ...previous,
            [name]: value
        }));

        setMessage("");
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!profile.name.trim()) {
            setError("Name cannot be empty.");
            return;
        }

        if (!profile.email.trim()) {
            setError("Email cannot be empty.");
            return;
        }

        const hasCurrentPassword =
            profile.currentPassword.trim() !== "";

        const hasNewPassword =
            profile.newPassword.trim() !== "";

        if (hasCurrentPassword && !hasNewPassword) {
            setError("Please enter your new password.");
            return;
        }

        if (!hasCurrentPassword && hasNewPassword) {
            setError("Please enter your current password.");
            return;
        }

        try {
            setSaving(true);

            const response = await axios.put(
                `/api/users/${userId}/profile`,
                {
                    name: profile.name,
                    email: profile.email,
                    currentPassword: profile.currentPassword,
                    newPassword: profile.newPassword
                }
            );

            const responseMessage =
                typeof response.data === "string"
                    ? response.data
                    : "Profile updated successfully";

            setMessage(responseMessage);

            if (
                responseMessage ===
                "Profile updated successfully"
            ) {
                const updatedUser = {
                    ...user,
                    name: profile.name,
                    email: profile.email
                };

                localStorage.setItem(
                    "user",
                    JSON.stringify(updatedUser)
                );

                setProfile((previous) => ({
                    ...previous,
                    currentPassword: "",
                    newPassword: ""
                }));
            }
        } catch (err) {
            console.error("Profile update error:", err);

            const backendMessage =
                typeof err.response?.data === "string"
                    ? err.response.data
                    : err.response?.data?.message;

            setError(
                backendMessage ||
                "Unable to update your profile."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-details-page">
                <div className="profile-details-loading">
                    Loading your profile...
                </div>
            </div>
        );
    }

    return (
        <div className="profile-details-page">
            <div className="profile-details-header">
                <div>
                    <button
                        type="button"
                        className="profile-details-back"
                        onClick={() =>
                            navigate(profileHomePath)
                        }
                    >
                        {isAdmin
                            ? "← Back to Dashboard"
                            : "← Back to Profile"}
                    </button>

                    <span className="profile-details-eyebrow">
                        PROFILE
                    </span>

                    <h1>Personal Details</h1>

                    <p>
                        Update your personal information and account security.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <section className="profile-details-card">
                    <div className="profile-details-card-header">
                        <div className="profile-details-avatar">
                            {profile.name
                                ? profile.name
                                    .charAt(0)
                                    .toUpperCase()
                                : "U"}
                        </div>

                        <div>
                            <h2>Personal Information</h2>
                            <p>
                                Keep your CodeSprint account information up to date.
                            </p>
                        </div>
                    </div>

                    <div className="profile-details-grid">
                        <div className="profile-details-field">
                            <label htmlFor="profile-name">
                                Full Name
                            </label>

                            <input
                                id="profile-name"
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="profile-details-field">
                            <label htmlFor="profile-email">
                                Email Address
                            </label>

                            <input
                                id="profile-email"
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleChange}
                                placeholder="Enter your email address"
                            />
                        </div>
                    </div>
                </section>

                <section className="profile-details-card">
                    <div className="profile-details-card-header">
                        <div className="profile-details-security-icon">
                            🔒
                        </div>

                        <div>
                            <h2>Change Password</h2>
                            <p>
                                Leave these fields empty when you do not want to change your password.
                            </p>
                        </div>
                    </div>

                    <div className="profile-details-grid">
                        <div className="profile-details-field">
                            <label htmlFor="current-password">
                                Current Password
                            </label>

                            <input
                                id="current-password"
                                type="password"
                                name="currentPassword"
                                value={profile.currentPassword}
                                onChange={handleChange}
                                placeholder="Enter current password"
                            />
                        </div>

                        <div className="profile-details-field">
                            <label htmlFor="new-password">
                                New Password
                            </label>

                            <input
                                id="new-password"
                                type="password"
                                name="newPassword"
                                value={profile.newPassword}
                                onChange={handleChange}
                                placeholder="Enter new password"
                            />
                        </div>
                    </div>
                </section>

                {(error || message) && (
                    <div
                        className={
                            error
                                ? "profile-details-message error"
                                : "profile-details-message success"
                        }
                    >
                        {error || message}
                    </div>
                )}

                <div className="profile-details-actions">
                    <button
                        type="button"
                        className="profile-details-secondary-button"
                        onClick={() =>
                            navigate(profileHomePath)
                        }
                        disabled={saving}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="profile-details-primary-button"
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProfilePersonalDetails;
