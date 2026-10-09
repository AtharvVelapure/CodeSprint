import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AssessmentFeedback.css";

const API_BASE_URL = "";

function AssessmentFeedback() {
    const { assessmentId } = useParams();
    const navigate = useNavigate();

    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadFeedback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assessmentId]);

    const loadFeedback = async () => {
        try {
            setLoading(true);
            setError("");

            const storedUser = localStorage.getItem("user");

            if (!storedUser) {
                throw new Error("Please login to view assessment feedback.");
            }

            const user = JSON.parse(storedUser);

            if (!user?.id) {
                throw new Error("User information is missing.");
            }

            const response = await fetch(
                `${API_BASE_URL}/api/assessment-candidates/assessment/${assessmentId}/feedback?userId=${user.id}`
            );

            const text = await response.text();

            let data = [];

            try {
                data = text ? JSON.parse(text) : [];
            } catch {
                data = [];
            }

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    text ||
                    "Unable to load assessment feedback."
                );
            }

            setFeedback(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load assessment feedback:", err);
            setError(
                err.message ||
                "Unable to load assessment feedback."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (value) => {
        if (!value) {
            return "—";
        }

        try {
            return new Date(value).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short"
            });
        } catch {
            return value;
        }
    };

    const renderStars = (value) => {
        const rating = Number(value || 0);

        return (
            <span className="feedback-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={
                            star <= rating
                                ? "feedback-star filled"
                                : "feedback-star"
                        }
                    >
                        ★
                    </span>
                ))}
            </span>
        );
    };

    const average = (field) => {
        if (!feedback.length) {
            return "0.0";
        }

        const total = feedback.reduce(
            (sum, item) => sum + Number(item?.[field] || 0),
            0
        );

        return (total / feedback.length).toFixed(1);
    };

    const technicalIssues = feedback.filter(
        (item) => item?.technicalIssue === true
    ).length;

    return (
        <div className="assessment-feedback-page">

            <div className="assessment-feedback-header">

                <div>
                    <span className="assessment-feedback-badge">
                        CodeSprint Assessments
                    </span>

                    <h1>Assessment Feedback</h1>

                    <p>
                        Review feedback submitted by candidates for this assessment.
                    </p>
                </div>

                <button
                    type="button"
                    className="feedback-back-button"
                    onClick={() =>
                        navigate("/user/assessments")
                    }
                >
                    ← Back to Assessments
                </button>

            </div>

            {error && (
                <div className="feedback-alert">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <>
                    <div className="feedback-summary-grid">

                        <div className="feedback-summary-card">
                            <span>Total Feedback</span>
                            <strong>{feedback.length}</strong>
                        </div>

                        <div className="feedback-summary-card">
                            <span>Overall Rating</span>
                            <strong>
                                {average("overallRating")} / 5
                            </strong>
                        </div>

                        <div className="feedback-summary-card">
                            <span>Question Quality</span>
                            <strong>
                                {average("questionQualityRating")} / 5
                            </strong>
                        </div>

                        <div className="feedback-summary-card">
                            <span>Platform Rating</span>
                            <strong>
                                {average("platformRating")} / 5
                            </strong>
                        </div>

                        <div className="feedback-summary-card issue-card">
                            <span>Technical Issues</span>
                            <strong>{technicalIssues}</strong>
                        </div>

                    </div>

                    {feedback.length === 0 ? (
                        <div className="feedback-empty-state">
                            <div className="feedback-empty-icon">
                                💬
                            </div>

                            <h2>No Feedback Yet</h2>

                            <p>
                                Candidates have not submitted feedback for this assessment yet.
                            </p>
                        </div>
                    ) : (
                        <div className="feedback-list-card">

                            <div className="feedback-list-header">
                                <div>
                                    <h2>Candidate Feedback</h2>
                                    <p>
                                        {feedback.length} feedback submission
                                        {feedback.length === 1 ? "" : "s"}
                                    </p>
                                </div>
                            </div>

                            <div className="feedback-table-wrapper">
                                <table className="feedback-table">
                                    <thead>
                                        <tr>
                                            <th>Candidate</th>
                                            <th>Overall</th>
                                            <th>Questions</th>
                                            <th>Platform</th>
                                            <th>Difficulty</th>
                                            <th>Technical Issue</th>
                                            <th>Submitted</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {feedback.map((item) => (
                                            <tr key={item.feedbackId}>

                                                <td>
                                                    <div className="candidate-cell">
                                                        <strong>
                                                            {item.candidateName || "Unknown Candidate"}
                                                        </strong>

                                                        <span>
                                                            {item.candidateEmail || "—"}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    {renderStars(item.overallRating)}
                                                </td>

                                                <td>
                                                    {renderStars(
                                                        item.questionQualityRating
                                                    )}
                                                </td>

                                                <td>
                                                    {renderStars(
                                                        item.platformRating
                                                    )}
                                                </td>

                                                <td>
                                                    <span className="difficulty-badge">
                                                        {item.difficulty || "—"}
                                                    </span>
                                                </td>

                                                <td>
                                                    {item.technicalIssue ? (
                                                        <span className="issue-badge yes">
                                                            Yes
                                                        </span>
                                                    ) : (
                                                        <span className="issue-badge no">
                                                            No
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    {formatDate(item.submittedAt)}
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="feedback-comments-section">

                                <h2>Candidate Comments</h2>

                                {feedback.map((item) => (
                                    <div
                                        className="feedback-comment-card"
                                        key={`comment-${item.feedbackId}`}
                                    >
                                        <div className="feedback-comment-header">
                                            <div>
                                                <strong>
                                                    {item.candidateName || "Unknown Candidate"}
                                                </strong>

                                                <span>
                                                    {formatDate(item.submittedAt)}
                                                </span>
                                            </div>
                                        </div>

                                        <p>
                                            {item.comments
                                                ? item.comments
                                                : "No additional comments provided."}
                                        </p>
                                    </div>
                                ))}

                            </div>

                        </div>
                    )}
                </>
            )}

            {loading && (
                <div className="feedback-loading">
                    <div className="feedback-spinner"></div>
                    <p>Loading candidate feedback...</p>
                </div>
            )}

        </div>
    );
}

export default AssessmentFeedback;
