import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./AdminReportsAnalytics.css";

const STATUS_ORDER = [
    "Accepted",
    "Wrong Answer",
    "Compilation Error",
    "Runtime Error",
    "Time Limit Exceeded",
    "Memory Limit Exceeded",
    "Unknown"
];

const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN").format(
        Number(value || 0)
    );

const formatPercent = (value) =>
    `${Number(value || 0).toFixed(1)}%`;

function AdminReportsAnalytics() {

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadReport = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await axios.get(
                    "/api/admin/reports"
                );

            setReport(response.data);

        } catch (err) {

            console.error(
                "Reports & Analytics loading error:",
                err
            );

            const message =
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to load Reports & Analytics.";

            setError(
                typeof message === "string"
                    ? message
                    : "Unable to load Reports & Analytics."
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        loadReport();
    }, []);

    const languageItems = useMemo(() => {

        const usage =
            report?.submissions?.languageUsage ||
            {};

        return Object.entries(usage)
            .sort(([, a], [, b]) => Number(b) - Number(a));

    }, [report]);

    const statusItems = useMemo(() => {

        const statusMap =
            report?.submissions?.byStatus ||
            {};

        const items = Object.entries(statusMap);

        return items.sort((a, b) => {

            const ia =
                STATUS_ORDER.indexOf(a[0]);

            const ib =
                STATUS_ORDER.indexOf(b[0]);

            if (ia !== -1 || ib !== -1) {

                const safeA =
                    ia === -1
                        ? STATUS_ORDER.length
                        : ia;

                const safeB =
                    ib === -1
                        ? STATUS_ORDER.length
                        : ib;

                if (safeA !== safeB) {
                    return safeA - safeB;
                }
            }

            return Number(b[1]) - Number(a[1]);
        });

    }, [report]);

    const maxTrend = useMemo(() => {

        const values =
            report?.submissions?.last7Days
                ?.map(item => Number(item.count || 0)) ||
            [];

        return Math.max(
            ...values,
            1
        );

    }, [report]);

    const maxStatus = useMemo(() => {

        const values =
            statusItems.map(([, value]) =>
                Number(value || 0)
            );

        return Math.max(
            ...values,
            1
        );

    }, [statusItems]);

    const maxLanguage = useMemo(() => {

        const values =
            languageItems.map(([, value]) =>
                Number(value || 0)
            );

        return Math.max(
            ...values,
            1
        );

    }, [languageItems]);

    const languageTotal = useMemo(() => {

        return languageItems.reduce(
            (sum, [, value]) =>
                sum + Number(value || 0),
            0
        );

    }, [languageItems]);

    const languageDonutStyle = useMemo(() => {

        if (languageTotal === 0) {
            return {
                background:
                    "conic-gradient(#e5e7eb 0deg 360deg)"
            };
        }

        const colors = [
            "#2563eb",
            "#10b981",
            "#8b5cf6",
            "#f59e0b",
            "#ef4444",
            "#06b6d4"
        ];

        let start = 0;

        const segments =
            languageItems.map(
                ([, value], index) => {

                    const degree =
                        Number(value || 0) /
                        languageTotal *
                        360;

                    const end =
                        start + degree;

                    const segment =
                        `${colors[index % colors.length]} ${start}deg ${end}deg`;

                    start = end;

                    return segment;
                }
            );

        return {
            background:
                `conic-gradient(${segments.join(",")})`
        };

    }, [languageItems, languageTotal]);

    const exportCsv = () => {

        if (!report) {
            return;
        }

        const rows = [];

        const addRow = (
            section,
            metric,
            value
        ) => {

            rows.push([
                section,
                metric,
                value
            ]);
        };

        addRow(
            "Platform",
            "Generated At",
            report.generatedAt || ""
        );

        addRow(
            "Users",
            "Total",
            report.users?.total || 0
        );

        addRow(
            "Users",
            "Active",
            report.users?.active || 0
        );

        addRow(
            "Users",
            "Inactive",
            report.users?.inactive || 0
        );

        addRow(
            "Problems",
            "Total",
            report.problems?.total || 0
        );

        addRow(
            "Problems",
            "Easy",
            report.problems?.easy || 0
        );

        addRow(
            "Problems",
            "Medium",
            report.problems?.medium || 0
        );

        addRow(
            "Problems",
            "Hard",
            report.problems?.hard || 0
        );

        addRow(
            "Submissions",
            "Total",
            report.submissions?.total || 0
        );

        addRow(
            "Submissions",
            "Accepted",
            report.submissions?.accepted || 0
        );

        addRow(
            "Submissions",
            "Acceptance Rate",
            formatPercent(
                report.submissions?.acceptanceRate
            )
        );

        Object.entries(
            report.submissions?.byStatus || {}
        ).forEach(([status, count]) => {

            addRow(
                "Submission Status",
                status,
                count
            );
        });

        Object.entries(
            report.submissions?.languageUsage || {}
        ).forEach(([language, count]) => {

            addRow(
                "Language Usage",
                language,
                count
            );
        });

        addRow(
            "Contests",
            "Total",
            report.contests?.total || 0
        );

        addRow(
            "Contests",
            "Participants",
            report.contests?.participants || 0
        );

        Object.entries(
            report.contests?.statusCounts || {}
        ).forEach(([status, count]) => {

            addRow(
                "Contest Status",
                status,
                count
            );
        });

        addRow(
            "Assessments",
            "Total",
            report.assessments?.total || 0
        );

        addRow(
            "Assessments",
            "Invitations",
            report.assessments?.invitations || 0
        );

        addRow(
            "Assessments",
            "Sessions",
            report.assessments?.sessions || 0
        );

        addRow(
            "Assessments",
            "Submitted Sessions",
            report.assessments?.submittedSessions || 0
        );

        addRow(
            "Assessments",
            "Expired Sessions",
            report.assessments?.expiredSessions || 0
        );

        addRow(
            "Assessments",
            "In Progress Sessions",
            report.assessments?.inProgressSessions || 0
        );

        addRow(
            "Certifications",
            "Total",
            report.certifications?.total || 0
        );

        addRow(
            "Certifications",
            "Attempts",
            report.certifications?.attempts || 0
        );

        addRow(
            "Certifications",
            "Passed Attempts",
            report.certifications?.passedAttempts || 0
        );

        addRow(
            "Certifications",
            "Failed Attempts",
            report.certifications?.failedAttempts || 0
        );

        addRow(
            "Certifications",
            "Time Expired Attempts",
            report.certifications?.timeExpiredAttempts || 0
        );

        addRow(
            "Certifications",
            "In Progress Attempts",
            report.certifications?.inProgressAttempts || 0
        );

        addRow(
            "Certifications",
            "Certificates Issued",
            report.certifications?.certificatesIssued || 0
        );

        rows.push([]);
        rows.push([
            "Problem Analytics",
            "Problem",
            "Difficulty",
            "Category",
            "Attempts",
            "Accepted",
            "Acceptance Rate"
        ]);

        (report.problemAnalytics || []).forEach(item => {

            rows.push([
                "",
                item.title || "",
                item.difficulty || "",
                item.category || "",
                item.attempts || 0,
                item.accepted || 0,
                formatPercent(item.acceptanceRate)
            ]);
        });

        const csv =
            rows
                .map(row =>
                    row
                        .map(value => {

                            const text =
                                String(
                                    value ?? ""
                                );

                            return `"${text.replaceAll(
                                '"',
                                '""'
                            )}"`;
                        })
                        .join(",")
                )
                .join("\n");

        const blob =
            new Blob(
                [csv],
                {
                    type: "text/csv;charset=utf-8;"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            `codesprint-admin-report-${new Date()
                .toISOString()
                .slice(0, 10)}.csv`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);
    };

    if (loading) {

        return (
            <div className="admin-reports-page">

                <div className="admin-reports-loading">

                    <div className="admin-reports-spinner"></div>

                    <h2>
                        Loading Reports & Analytics
                    </h2>

                    <p>
                        Gathering platform statistics...
                    </p>

                </div>

            </div>
        );
    }

    if (error) {

        return (
            <div className="admin-reports-page">

                <div className="admin-reports-header">

                    <div>

                        <span className="admin-reports-eyebrow">
                            ADMIN / REPORTS
                        </span>

                        <h1>
                            Reports & Analytics
                        </h1>

                        <p>
                            Review platform activity and performance data.
                        </p>

                    </div>

                </div>

                <div className="admin-reports-error">

                    <strong>
                        Unable to load reports
                    </strong>

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={loadReport}
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }

    const users = report?.users || {};
    const problems = report?.problems || {};
    const submissions = report?.submissions || {};
    const contests = report?.contests || {};
    const assessments = report?.assessments || {};
    const certifications = report?.certifications || {};

    const contestStatusEntries =
        Object.entries(
            contests.statusCounts || {}
        );

    const assessmentStatusEntries =
        Object.entries(
            assessments.statusCounts || {}
        );

    const certificationStatusEntries =
        Object.entries(
            certifications.statusCounts || {}
        );

    const certificationAttemptStatusEntries =
        Object.entries(
            certifications.attemptStatusCounts || {}
        );

    return (
        <div className="admin-reports-page">

            <div className="admin-reports-header">

                <div>

                    <span className="admin-reports-eyebrow">
                        ADMIN / REPORTS & ANALYTICS
                    </span>

                    <h1>
                        Reports & Analytics
                    </h1>

                    <p>
                        Monitor CodeSprint activity across users, coding,
                        contests, assessments, and certifications.
                    </p>

                </div>

                <div className="admin-reports-actions">

                    <button
                        type="button"
                        className="reports-secondary-button"
                        onClick={loadReport}
                    >
                        ↻ Refresh
                    </button>

                    <button
                        type="button"
                        className="reports-primary-button"
                        onClick={exportCsv}
                    >
                        ↓ Export CSV
                    </button>

                </div>

            </div>

            <div className="admin-reports-generated">

                <span>
                    Live database summary
                </span>

                <span>
                    Generated {report?.generatedAt
                        ? new Date(
                            report.generatedAt
                        ).toLocaleString(
                            "en-IN",
                            {
                                dateStyle: "medium",
                                timeStyle: "short"
                            }
                        )
                        : "—"}
                </span>

            </div>

            <section className="reports-kpi-grid">

                <div className="reports-kpi-card">
                    <div className="reports-kpi-icon users">👥</div>
                    <span>Total Users</span>
                    <strong>{formatNumber(users.total)}</strong>
                    <small>
                        {formatNumber(users.active)} active
                    </small>
                </div>

                <div className="reports-kpi-card">
                    <div className="reports-kpi-icon problems">💻</div>
                    <span>Total Problems</span>
                    <strong>{formatNumber(problems.total)}</strong>
                    <small>
                        {formatNumber(problems.easy)} easy ·{" "}
                        {formatNumber(problems.medium)} medium ·{" "}
                        {formatNumber(problems.hard)} hard
                    </small>
                </div>

                <div className="reports-kpi-card">
                    <div className="reports-kpi-icon submissions">📤</div>
                    <span>Total Submissions</span>
                    <strong>{formatNumber(submissions.total)}</strong>
                    <small>
                        {formatNumber(submissions.accepted)} accepted
                    </small>
                </div>

                <div className="reports-kpi-card">
                    <div className="reports-kpi-icon rate">✓</div>
                    <span>Acceptance Rate</span>
                    <strong>
                        {formatPercent(
                            submissions.acceptanceRate
                        )}
                    </strong>
                    <small>
                        Across all submissions
                    </small>
                </div>

                <div className="reports-kpi-card">
                    <div className="reports-kpi-icon contests">🏆</div>
                    <span>Total Contests</span>
                    <strong>{formatNumber(contests.total)}</strong>
                    <small>
                        {formatNumber(contests.participants)} participant records
                    </small>
                </div>

                <div className="reports-kpi-card">
                    <div className="reports-kpi-icon assessments">🧪</div>
                    <span>Total Assessments</span>
                    <strong>{formatNumber(assessments.total)}</strong>
                    <small>
                        {formatNumber(assessments.invitations)} invitations
                    </small>
                </div>

                <div className="reports-kpi-card">
                    <div className="reports-kpi-icon certifications">🎓</div>
                    <span>Certifications</span>
                    <strong>{formatNumber(certifications.total)}</strong>
                    <small>
                        {formatNumber(
                            certifications.certificatesIssued
                        )} certificates issued
                    </small>
                </div>

                <div className="reports-kpi-card">
                    <div className="reports-kpi-icon sessions">⏱</div>
                    <span>Assessment Sessions</span>
                    <strong>{formatNumber(assessments.sessions)}</strong>
                    <small>
                        {formatNumber(
                            assessments.submittedSessions
                        )} submitted
                    </small>
                </div>

            </section>

            <section className="reports-two-column">

                <div className="reports-panel reports-panel-wide">

                    <div className="reports-panel-header">

                        <div>
                            <span className="reports-panel-kicker">
                                ACTIVITY
                            </span>
                            <h2>
                                Submission Trend
                            </h2>
                            <p>
                                Number of coding submissions over the last 7 days.
                            </p>
                        </div>

                        <div className="reports-panel-badge">
                            Last 7 days
                        </div>

                    </div>

                    <div className="submission-trend-chart">

                        {(submissions.last7Days || []).map(
                            item => {

                                const value =
                                    Number(
                                        item.count || 0
                                    );

                                const height =
                                    value === 0
                                        ? 6
                                        : Math.max(
                                            12,
                                            value /
                                            maxTrend *
                                            100
                                        );

                                return (
                                    <div
                                        className="trend-column"
                                        key={item.date}
                                    >

                                        <span className="trend-value">
                                            {formatNumber(value)}
                                        </span>

                                        <div className="trend-track">

                                            <div
                                                className="trend-bar"
                                                style={{
                                                    height:
                                                        `${height}%`
                                                }}
                                            />

                                        </div>

                                        <span className="trend-label">
                                            {item.label}
                                        </span>

                                    </div>
                                );
                            }
                        )}

                    </div>

                </div>

                <div className="reports-panel">

                    <div className="reports-panel-header">

                        <div>
                            <span className="reports-panel-kicker">
                                USERS
                            </span>
                            <h2>
                                User Overview
                            </h2>
                        </div>

                    </div>

                    <div className="user-overview">

                        <div
                            className="user-ring"
                            style={{
                                "--active-degree":
                                    `${
                                        users.total > 0
                                            ? users.active /
                                              users.total *
                                              360
                                            : 0
                                    }deg`
                            }}
                        >

                            <div className="user-ring-inner">

                                <strong>
                                    {formatPercent(
                                        users.total > 0
                                            ? users.active /
                                              users.total *
                                              100
                                            : 0
                                    )}
                                </strong>

                                <span>
                                    active
                                </span>

                            </div>

                        </div>

                        <div className="user-stat-list">

                            <div className="user-stat-row">

                                <span>
                                    <i className="status-dot active"></i>
                                    Active users
                                </span>

                                <strong>
                                    {formatNumber(users.active)}
                                </strong>

                            </div>

                            <div className="user-stat-row">

                                <span>
                                    <i className="status-dot inactive"></i>
                                    Inactive users
                                </span>

                                <strong>
                                    {formatNumber(users.inactive)}
                                </strong>

                            </div>

                            <div className="user-stat-row total">

                                <span>
                                    Total users
                                </span>

                                <strong>
                                    {formatNumber(users.total)}
                                </strong>

                            </div>

                        </div>

                    </div>

                </div>

            </section>

            <section className="reports-two-column">

                <div className="reports-panel">

                    <div className="reports-panel-header">

                        <div>
                            <span className="reports-panel-kicker">
                                SUBMISSIONS
                            </span>
                            <h2>
                                Result Breakdown
                            </h2>
                            <p>
                                Submission outcomes across the platform.
                            </p>
                        </div>

                    </div>

                    <div className="reports-status-list">

                        {statusItems.length === 0 && (
                            <div className="reports-empty">
                                No submission status data available.
                            </div>
                        )}

                        {statusItems.map(
                            ([status, count]) => {

                                const numericCount =
                                    Number(count || 0);

                                const width =
                                    Math.max(
                                        numericCount === 0
                                            ? 2
                                            : 8,
                                        numericCount /
                                        maxStatus *
                                        100
                                    );

                                return (
                                    <div
                                        className="status-metric"
                                        key={status}
                                    >

                                        <div className="status-metric-top">

                                            <span>
                                                {status}
                                            </span>

                                            <strong>
                                                {formatNumber(
                                                    numericCount
                                                )}
                                            </strong>

                                        </div>

                                        <div className="metric-track">

                                            <div
                                                className="metric-fill"
                                                style={{
                                                    width:
                                                        `${width}%`
                                                }}
                                            />

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                </div>

                <div className="reports-panel">

                    <div className="reports-panel-header">

                        <div>
                            <span className="reports-panel-kicker">
                                LANGUAGES
                            </span>
                            <h2>
                                Language Usage
                            </h2>
                            <p>
                                Languages used in submitted solutions.
                            </p>
                        </div>

                    </div>

                    <div className="language-content">

                        <div
                            className="language-donut"
                            style={languageDonutStyle}
                        >

                            <div className="language-donut-hole">

                                <strong>
                                    {formatNumber(
                                        languageTotal
                                    )}
                                </strong>

                                <span>
                                    submissions
                                </span>

                            </div>

                        </div>

                        <div className="language-list">

                            {languageItems.length === 0 && (
                                <div className="reports-empty">
                                    No language data available.
                                </div>
                            )}

                            {languageItems.map(
                                ([language, count], index) => {

                                    const numericCount =
                                        Number(count || 0);

                                    const percentage =
                                        languageTotal > 0
                                            ? numericCount /
                                              languageTotal *
                                              100
                                            : 0;

                                    return (
                                        <div
                                            className="language-row"
                                            key={language}
                                        >

                                            <div className="language-row-label">

                                                <span>
                                                    <i
                                                        className="language-dot"
                                                        style={{
                                                            background:
                                                                [
                                                                    "#2563eb",
                                                                    "#10b981",
                                                                    "#8b5cf6",
                                                                    "#f59e0b",
                                                                    "#ef4444",
                                                                    "#06b6d4"
                                                                ][index % 6]
                                                        }}
                                                    ></i>

                                                    {language}
                                                </span>

                                                <strong>
                                                    {formatPercent(
                                                        percentage
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="metric-track">

                                                <div
                                                    className="metric-fill language-fill"
                                                    style={{
                                                        width:
                                                            `${numericCount /
                                                              maxLanguage *
                                                              100}%`
                                                    }}
                                                />

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    </div>

                </div>

            </section>

            <section className="reports-panel">

                <div className="reports-panel-header">

                    <div>
                        <span className="reports-panel-kicker">
                            PROBLEM ANALYTICS
                        </span>
                        <h2>
                            Problem Activity
                        </h2>
                        <p>
                            Attempts and accepted submissions grouped by coding problem.
                        </p>
                    </div>

                    <span className="reports-panel-badge">
                        {formatNumber(
                            report?.problemAnalytics?.length || 0
                        )} problems
                    </span>

                </div>

                <div className="problem-table-wrapper">

                    <table className="problem-analytics-table">

                        <thead>

                            <tr>
                                <th>Problem</th>
                                <th>Difficulty</th>
                                <th>Category</th>
                                <th>Attempts</th>
                                <th>Accepted</th>
                                <th>Acceptance</th>
                            </tr>

                        </thead>

                        <tbody>

                            {(report.problemAnalytics || [])
                                .slice(0, 15)
                                .map(item => (

                                    <tr key={item.id}>

                                        <td>
                                            <div className="problem-title-cell">

                                                <strong>
                                                    {item.title || "Untitled Problem"}
                                                </strong>

                                                <span>
                                                    #{item.id}
                                                </span>

                                            </div>
                                        </td>

                                        <td>
                                            <span
                                                className={
                                                    `difficulty-badge ${String(
                                                        item.difficulty || ""
                                                    )
                                                        .toLowerCase()}`
                                                }
                                            >
                                                {item.difficulty || "Unknown"}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="category-text">
                                                {item.category || "Unknown"}
                                            </span>
                                        </td>

                                        <td>
                                            <strong>
                                                {formatNumber(
                                                    item.attempts
                                                )}
                                            </strong>
                                        </td>

                                        <td>
                                            {formatNumber(
                                                item.accepted
                                            )}
                                        </td>

                                        <td>
                                            <span className="acceptance-cell">
                                                {formatPercent(
                                                    item.acceptanceRate
                                                )}
                                            </span>
                                        </td>

                                    </tr>
                                ))}

                        </tbody>

                    </table>

                    {(!report.problemAnalytics ||
                        report.problemAnalytics.length === 0) && (
                        <div className="reports-empty large">
                            No problem activity data available.
                        </div>
                    )}

                </div>

            </section>

            <section className="reports-three-column">

                <div className="reports-panel compact">

                    <div className="reports-panel-header">

                        <div>
                            <span className="reports-panel-kicker">
                                CONTESTS
                            </span>
                            <h2>
                                Contest Analytics
                            </h2>
                        </div>

                    </div>

                    <div className="compact-stat-main">
                        <strong>
                            {formatNumber(contests.total)}
                        </strong>
                        <span>
                            contests
                        </span>
                    </div>

                    <div className="mini-stat-grid">

                        <div>
                            <span>Participants</span>
                            <strong>
                                {formatNumber(
                                    contests.participants
                                )}
                            </strong>
                        </div>

                        {contestStatusEntries.map(
                            ([status, count]) => (
                                <div key={status}>
                                    <span>{status}</span>
                                    <strong>
                                        {formatNumber(count)}
                                    </strong>
                                </div>
                            )
                        )}

                    </div>

                </div>

                <div className="reports-panel compact">

                    <div className="reports-panel-header">

                        <div>
                            <span className="reports-panel-kicker">
                                ASSESSMENTS
                            </span>
                            <h2>
                                Assessment Analytics
                            </h2>
                        </div>

                    </div>

                    <div className="compact-stat-main">
                        <strong>
                            {formatNumber(
                                assessments.total
                            )}
                        </strong>
                        <span>
                            assessments
                        </span>
                    </div>

                    <div className="mini-stat-grid">

                        <div>
                            <span>Invitations</span>
                            <strong>
                                {formatNumber(
                                    assessments.invitations
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Submitted</span>
                            <strong>
                                {formatNumber(
                                    assessments.submittedSessions
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Expired</span>
                            <strong>
                                {formatNumber(
                                    assessments.expiredSessions
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>In Progress</span>
                            <strong>
                                {formatNumber(
                                    assessments.inProgressSessions
                                )}
                            </strong>
                        </div>

                        {assessmentStatusEntries.map(
                            ([status, count]) => (
                                <div key={status}>
                                    <span>{status}</span>
                                    <strong>
                                        {formatNumber(count)}
                                    </strong>
                                </div>
                            )
                        )}

                    </div>

                </div>

                <div className="reports-panel compact">

                    <div className="reports-panel-header">

                        <div>
                            <span className="reports-panel-kicker">
                                CERTIFICATIONS
                            </span>
                            <h2>
                                Certification Analytics
                            </h2>
                        </div>

                    </div>

                    <div className="compact-stat-main">
                        <strong>
                            {formatNumber(
                                certifications.total
                            )}
                        </strong>
                        <span>
                            certifications
                        </span>
                    </div>

                    <div className="mini-stat-grid">

                        <div>
                            <span>Attempts</span>
                            <strong>
                                {formatNumber(
                                    certifications.attempts
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Passed</span>
                            <strong>
                                {formatNumber(
                                    certifications.passedAttempts
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Failed</span>
                            <strong>
                                {formatNumber(
                                    certifications.failedAttempts
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Expired</span>
                            <strong>
                                {formatNumber(
                                    certifications.timeExpiredAttempts
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Certificates</span>
                            <strong>
                                {formatNumber(
                                    certifications.certificatesIssued
                                )}
                            </strong>
                        </div>

                        {certificationStatusEntries.map(
                            ([status, count]) => (
                                <div key={status}>
                                    <span>{status}</span>
                                    <strong>
                                        {formatNumber(count)}
                                    </strong>
                                </div>
                            )
                        )}

                    </div>

                </div>

            </section>

            <section className="reports-two-column">

                <div className="reports-panel">

                    <div className="reports-panel-header">

                        <div>
                            <span className="reports-panel-kicker">
                                CERTIFICATION ATTEMPTS
                            </span>
                            <h2>
                                Attempt Status
                            </h2>
                        </div>

                    </div>

                    <div className="reports-inline-statuses">

                        {certificationAttemptStatusEntries.length === 0 && (
                            <div className="reports-empty">
                                No certification attempts recorded.
                            </div>
                        )}

                        {certificationAttemptStatusEntries.map(
                            ([status, count]) => (

                                <div
                                    className="inline-status-card"
                                    key={status}
                                >

                                    <span>
                                        {status}
                                    </span>

                                    <strong>
                                        {formatNumber(count)}
                                    </strong>

                                </div>
                            )
                        )}

                    </div>

                </div>

                <div className="reports-panel">

                    <div className="reports-panel-header">

                        <div>
                            <span className="reports-panel-kicker">
                                QUICK SUMMARY
                            </span>
                            <h2>
                                Platform Coverage
                            </h2>
                        </div>

                    </div>

                    <div className="coverage-list">

                        <div>
                            <span>
                                Problems by difficulty
                            </span>
                            <strong>
                                {formatNumber(
                                    problems.easy
                                )} / {formatNumber(
                                    problems.medium
                                )} / {formatNumber(
                                    problems.hard
                                )}
                            </strong>
                            <small>
                                Easy / Medium / Hard
                            </small>
                        </div>

                        <div>
                            <span>
                                Certification attempts
                            </span>
                            <strong>
                                {formatNumber(
                                    certifications.attempts
                                )}
                            </strong>
                            <small>
                                All recorded attempts
                            </small>
                        </div>

                        <div>
                            <span>
                                Assessment activity
                            </span>
                            <strong>
                                {formatNumber(
                                    assessments.sessions
                                )}
                            </strong>
                            <small>
                                Candidate sessions
                            </small>
                        </div>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default AdminReportsAnalytics;
