import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Problems.css";

function Problems() {
    const navigate = useNavigate();

    const [problems, setProblems] = useState([]);
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState("All");
    const [category, setCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProblems = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await axios.get("/api/problems");
                setProblems(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error("Problems loading error:", err);
                setError("Unable to load problems. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        loadProblems();
    }, []);

    const categories = useMemo(() => {
        const uniqueCategories = [
            ...new Set(problems.map((problem) => problem.category).filter(Boolean))
        ];
        return uniqueCategories.sort();
    }, [problems]);

    const filteredProblems = useMemo(() => {
        return problems.filter((problem) => {
            const searchText = search.trim().toLowerCase();
            const matchesSearch =
                !searchText ||
                problem.title?.toLowerCase().includes(searchText) ||
                problem.description?.toLowerCase().includes(searchText);

            const matchesDifficulty =
                difficulty === "All" || problem.difficulty === difficulty;

            const matchesCategory =
                category === "All" || problem.category === category;

            return matchesSearch && matchesDifficulty && matchesCategory;
        });
    }, [problems, search, difficulty, category]);

    const getDifficultyClass = (value) => {
        if (!value) return "";
        return value.toLowerCase();
    };

    const handleSolve = (problemId) => {
        navigate(`/user/problems/${problemId}`);
    };

    const handleBackToDashboard = () => {
        navigate("/dashboard");
    };

    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div className="user-problems-page">
            {/* BACK BUTTON */}
            <div className="problems-navigation">
                <button
                    type="button"
                    className="back-dashboard-button"
                    onClick={handleBackToDashboard}
                >
                    ← Dashboard
                </button>
            </div>

            {/* HEADER */}
            <div className="problems-header">
                <div>
                    <h1>Problems</h1>
                    <p>Practice coding problems and improve your programming skills.</p>
                </div>

                <div className="problem-count">
                    <strong>{filteredProblems.length}</strong>
                    <span>Problems</span>
                </div>
            </div>

            {/* FILTERS */}
            <div className="problem-filters">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search problems..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                >
                    <option value="All">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="All">All Categories</option>
                    {categories.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>
            </div>

            {/* LOADING */}
            {loading && (
                <div className="problems-message">
                    <div className="loading-spinner"></div>
                    <p>Loading problems...</p>
                </div>
            )}

            {/* ERROR */}
            {!loading && error && (
                <div className="problems-message error-message">
                    <p>{error}</p>
                    <button type="button" onClick={handleRetry}>
                        Try Again
                    </button>
                </div>
            )}

            {/* EMPTY STATE */}
            {!loading && !error && filteredProblems.length === 0 && (
                <div className="problems-message">
                    <div className="empty-icon">📭</div>
                    <h3>No problems found</h3>
                    <p>Try changing your search or filters.</p>
                </div>
            )}

            {/* PROBLEMS LIST */}
            {!loading && !error && filteredProblems.length > 0 && (
                <div className="problems-list">
                    {filteredProblems.map((problem, index) => (
                        <div className="problem-card" key={problem.id}>
                            <div className="problem-number">{index + 1}</div>

                            <div className="problem-info">
                                <h3>{problem.title}</h3>
                                <p>{problem.description}</p>

                                <div className="problem-meta">
                                    <span className="category-badge">
                                        {problem.category}
                                    </span>
                                    <span
                                        className={`difficulty-badge ${getDifficultyClass(
                                            problem.difficulty
                                        )}`}
                                    >
                                        {problem.difficulty}
                                    </span>
                                </div>
                            </div>

                            <div className="problem-action">
                                <button
                                    type="button"
                                    onClick={() => handleSolve(problem.id)}
                                >
                                    Solve <span>→</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Problems;