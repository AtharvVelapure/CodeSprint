import { Navigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import "./AdminLayout.css";

function AdminLayout({ children }) {

    let user = null;

    try {
        const storedUser = localStorage.getItem("user");
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch {
        user = null;
    }

    if (!user?.token) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "ADMIN") {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="admin-layout">

            <AdminNavbar />

            <div className="admin-body">

                <AdminSidebar />

                <main className="admin-content">
                    {children}
                </main>

            </div>

        </div>
    );
}

export default AdminLayout;