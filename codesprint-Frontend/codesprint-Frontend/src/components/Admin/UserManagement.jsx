import { useEffect, useState } from "react";
import axios from "axios";
import "./UserManagement.css";

function UserManagement() {
    const [activeTab, setActiveTab] = useState("all");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.get("/api/admin/users");
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Unable to load users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const blockUser = async (id) => {
        try {
            setMessage("");
            setError("");
            const response = await axios.post(`/api/admin/users/${id}/block`);
            setMessage(response.data);
            fetchUsers();
        } catch (err) {
            console.error("Error blocking user:", err);
            setError("Unable to block user.");
        }
    };

    const unblockUser = async (id) => {
        try {
            setMessage("");
            setError("");
            const response = await axios.post(`/api/admin/users/${id}/unblock`);
            setMessage(response.data);
            fetchUsers();
        } catch (err) {
            console.error("Error unblocking user:", err);
            setError("Unable to unblock user.");
        }
    };

    const filteredUsers = users.filter((user) => {
        if (activeTab === "active") {
            return user.active === true;
        }
        if (activeTab === "blocked") {
            return user.active === false;
        }
        return true;
    });

    const getTitle = () => {
        if (activeTab === "all") {
            return "All Users";
        }
        if (activeTab === "active") {
            return "Active Users";
        }
        return "Blocked Users";
    };

    return (
        <div className="management-page">
            {/* PAGE TITLE */}
            <div className="page-title">
                <h1>User Management</h1>
                <p>Manage all registered CodeSprint users.</p>
            </div>

            {/* NOTIFICATIONS */}
            {message && (
                <div className="management-message success">
                    <span>✓</span>
                    {message}
                </div>
            )}

            {error && (
                <div className="management-message error">
                    <span>⚠️</span>
                    {error}
                </div>
            )}

            {/* TABS */}
            <div className="management-tabs">
                <button
                    type="button"
                    className={activeTab === "all" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("all")}
                >
                    All Users
                </button>

                <button
                    type="button"
                    className={activeTab === "active" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("active")}
                >
                    Active Users
                </button>

                <button
                    type="button"
                    className={activeTab === "blocked" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("blocked")}
                >
                    Blocked Users
                </button>
            </div>

            {/* MANAGEMENT CARD */}
            <div className="management-card">
                <div className="table-header">
                    <h2>{getTitle()}</h2>
                    <span>{filteredUsers.length} users</span>
                </div>

                <div className="table-wrapper">
                    {loading ? (
                        <div className="loading-message">Loading users...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="empty-message">No users found.</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <strong>{user.name}</strong>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span
                                                className={`role-badge ${
                                                    user.role?.toLowerCase() === "admin"
                                                        ? "role-admin"
                                                        : "role-user"
                                                }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={
                                                    user.active
                                                        ? "status-badge active"
                                                        : "status-badge blocked"
                                                }
                                            >
                                                {user.active ? "Active" : "Blocked"}
                                            </span>
                                        </td>
                                        <td>
                                            {user.active ? (
                                                <button
                                                    type="button"
                                                    className="table-action block"
                                                    onClick={() => blockUser(user.id)}
                                                >
                                                    Block
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="table-action unblock"
                                                    onClick={() => unblockUser(user.id)}
                                                >
                                                    Unblock
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserManagement;