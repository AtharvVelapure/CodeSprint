import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useLocation
} from "react-router-dom";

import LandingPage from "./pages/auth/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import UserLayout from "./pages/user/UserLayout";

import UserDashboard from "./pages/user/UserDashboard";
import Problems from "./pages/user/Problems";
import Profile from "./pages/user/Profile";
import ProfilePersonalDetails from "./pages/user/ProfilePersonalDetails";
import ProfileContestActivity from "./pages/user/ProfileContestActivity";
import ProfileCertificates from "./pages/user/ProfileCertificates";
import MySubmissions from "./pages/user/MySubmissions";
import UserLeaderboard from "./pages/user/UserLeaderboard";
import ProgressDashboard from "./pages/user/ProgressDashboard";
import UserSupport from "./pages/user/UserSupport";
import ContestList from "./pages/user/ContestList";
import ContestArena from "./pages/user/ContestArena";
import MyContestResults from "./pages/user/MyContestResults";
import CertificationList from "./pages/user/CertificationList";
import CertificationDetails from "./pages/user/CertificationDetails";
import CertificationExam from "./pages/user/CertificationExam";
import CertificationResult from "./pages/user/CertificationResult";
import CertificateList from "./pages/user/CertificateList";
import CertificateView from "./pages/user/CertificateView";
import ContestRegistration from "./pages/user/ContestRegistration";
import ContestLeaderboard from "./pages/user/ContestLeaderboard";


import AdminLayout from "./components/Admin/AdminLayout";
import AdminDashboard from "./components/Admin/AdminDashboard";
import UserManagement from "./components/Admin/UserManagement";
import ProblemManagement from "./components/Admin/ProblemManagement";
import TestCaseManagement from "./components/Admin/TestCaseManagement";
import AdminSubmissions from "./components/Admin/AdminSubmissions";
import LeaderboardManagement from "./components/Admin/LeaderboardManagement";
import HintsEditorialManagement from "./components/Admin/HintsEditorialManagement";
import ContestManagement from "./components/Admin/ContestManagement";
import ContestProblemManagement from "./components/Admin/ContestProblemManagement";
import AdminCertification from "./components/Admin/AdminCertification";
import AdminCertificationQuestions from "./components/Admin/AdminCertificationQuestions";
import AssessmentHostVerification from "./components/Admin/AssessmentHostVerification";
import AdminSupport from "./components/Admin/AdminSupport";
import AdminCertificationResults from "./components/Admin/AdminCertificationResults";
import AdminReportsAnalytics from "./components/Admin/AdminReportsAnalytics";

import AssessmentCandidateEntry from "./pages/assessment/AssessmentCandidateEntry";
import AssessmentInstructions from "./pages/assessment/AssessmentInstructions";
import AssessmentTest from "./pages/assessment/AssessmentTest";
import AssessmentInvitations from "./pages/assessment/AssessmentInvitations";
import AssessmentResults from "./pages/assessment/AssessmentResults";
import Assessments from "./pages/assessment/Assessments";
import AssessmentProblemSelection from "./pages/assessment/AssessmentProblemSelection";
import AssessmentManage from "./pages/assessment/AssessmentManage";
import AssessmentFeedback from "./pages/assessment/AssessmentFeedback";

import CodeSpiritAI from "./components/CodeSpiritAI/CodeSpiritAI";
import ProblemDetails from "./pages/ProblemDetails";


/* =========================================================
   APP CONTENT
========================================================= */

function AppContent() {

    const location = useLocation();


    /*
     * Hide CodeSpirit AI only from candidate assessment pages.
     *
     * Examples:
     *
     * /assessment/invite/{token}
     * /assessment/invite/{token}/instructions
     * /assessment/invite/{token}/test
     */

    const isCandidateAssessmentRoute =
        location.pathname.startsWith(
            "/assessment/invite/"
        );


    return (

        <>

            {/* ============================================= */}
            {/* CODESPIRIT AI */}
            {/* Hidden during candidate assessment flow */}
            {/* ============================================= */}

            {!isCandidateAssessmentRoute && (

                <CodeSpiritAI />

            )}


            <Routes>


                {/* ============================= */}
                {/* PUBLIC ROUTES */}
                {/* ============================= */}

                <Route
                    path="/"
                    element={<LandingPage />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* ============================= */}
                {/* USER ROUTES */}
                {/* ============================= */}

                <Route
                    path="/dashboard"
                    element={
                        <UserLayout>
                            <UserDashboard />
                        </UserLayout>
                    }
                />

                <Route
                    path="/user/dashboard"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

                <Route
                    path="/user/problems"
                    element={
                        <UserLayout>
                            <Problems />
                        </UserLayout>
                    }
                />

                <Route
                    path="/user/problems/:id"
                    element={
                        <UserLayout>
                            <ProblemDetails />
                        </UserLayout>
                    }
                />

                <Route
                    path="/user/profile"
                    element={
                        <UserLayout>
                            <Profile />
                        </UserLayout>
                    }
                />

                <Route
                    path="/user/profile/personal-details"
                    element={
                        <UserLayout>
                            <ProfilePersonalDetails />
                        </UserLayout>
                    }
                />

                <Route
                    path="/user/profile/contest-activity"
                    element={
                        <UserLayout>
                            <ProfileContestActivity />
                        </UserLayout>
                    }
                />

                <Route
                    path="/user/profile/certificates"
                    element={
                        <UserLayout>
                            <ProfileCertificates />
                        </UserLayout>
                    }
                />

                <Route
                    path="/user/submissions"
                    element={
                        <UserLayout>
                            <MySubmissions />
                        </UserLayout>
                    }
                />

                <Route
                    path="/user/progress"
                    element={
                        <UserLayout>
                            <ProgressDashboard />
                        </UserLayout>
                    }
                />

                <Route
                    path="/user/leaderboard"
                    element={
                        <UserLayout>
                            <UserLeaderboard />
                        </UserLayout>
                    }
                />


                {/* ============================= */}
                {/* SUPPORT ROUTE */}
                {/* ============================= */}

                <Route
                    path="/user/support"
                    element={
                        <UserLayout>
                            <UserSupport />
                        </UserLayout>
                    }
                />


                {/* ============================= */}
                {/* CONTEST ROUTES */}
                {/* ============================= */}

                <Route
                    path="/user/contests"
                    element={
                        <UserLayout>
                            <ContestList />
                        </UserLayout>
                    }
                />

                <Route
                    path="/user/contests/results"
                    element={
                        <UserLayout>
                            <MyContestResults />
                        </UserLayout>
                    }
                />

                <Route
                    path="/user/contests/:id"
                    element={
                        <UserLayout>
                            <ContestArena />
                        </UserLayout>
                    }
                />


                {/* ============================= */}
                {/* CERTIFICATION ROUTES */}
                {/* ============================= */}

                <Route
                    path="/user/certifications"
                    element={
                        <UserLayout>
                            <CertificationList />
                        </UserLayout>
                    }
                />

                <Route
                    path="/user/certifications/:id"
                    element={
                        <UserLayout>
                            <CertificationDetails />
                        </UserLayout>
                    }
                />

                <Route
                    path="/user/certifications/:id/exam/:attemptId"
                    element={
                        <UserLayout>
                            <CertificationExam />
                        </UserLayout>
                    }
                />

                <Route
                    path="/user/certifications/:id/result/:attemptId"
                    element={
                        <UserLayout>
                            <CertificationResult />
                        </UserLayout>
                    }
                />

                <Route
                    path="/user/certificates"
                    element={
                        <UserLayout>
                            <CertificateList />
                        </UserLayout>
                    }
                />

                <Route
                    path="/user/certificates/:certificateId"
                    element={
                        <UserLayout>
                            <CertificateView />
                        </UserLayout>
                    }
                />


                {/* ============================= */}
                {/* ADMIN ROUTES */}
                {/* ============================= */}

                <Route
                    path="/admin/dashboard"
                    element={
                        <AdminLayout>
                            <AdminDashboard />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/admin/profile"
                    element={
                        <AdminLayout>
                            <ProfilePersonalDetails />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/admin/users"
                    element={
                        <AdminLayout>
                            <UserManagement />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/admin/problems"
                    element={
                        <AdminLayout>
                            <ProblemManagement />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/admin/test-cases"
                    element={
                        <AdminLayout>
                            <TestCaseManagement />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/admin/submissions"
                    element={
                        <AdminLayout>
                            <AdminSubmissions />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/admin/submissions/accepted"
                    element={
                        <AdminLayout>
                            <AdminSubmissions
                                status="accepted"
                            />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/admin/submissions/wrong-answers"
                    element={
                        <AdminLayout>
                            <AdminSubmissions
                                status="wrong-answer"
                            />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/admin/submissions/runtime-errors"
                    element={
                        <AdminLayout>
                            <AdminSubmissions
                                status="runtime-error"
                            />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/admin/hints-editorials"
                    element={
                        <AdminLayout>
                            <HintsEditorialManagement />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/admin/leaderboards"
                    element={
                        <AdminLayout>
                            <LeaderboardManagement />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/admin/contests"
                    element={
                        <AdminLayout>
                            <ContestManagement />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/admin/contests/:contestId/problems"
                    element={
                        <AdminLayout>
                            <ContestProblemManagement />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/admin/certifications"
                    element={
                        <AdminLayout>
                            <AdminCertification />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/admin/certifications/:certificationId/questions"
                    element={
                        <AdminLayout>
                            <AdminCertificationQuestions />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/admin/certifications/:certificationId/results"
                    element={
                        <AdminLayout>
                            <AdminCertificationResults />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/admin/assessment-host-verification"
                    element={
                        <AdminLayout>
                            <AssessmentHostVerification />
                        </AdminLayout>
                    }
                />


                {/* ============================= */}
                {/* ASSESSMENT HOST ROUTES */}
                {/* ============================= */}

                <Route
                    path="/user/assessments"
                    element={
                        <UserLayout>
                            <Assessments />
                        </UserLayout>
                    }
                />

                <Route
                    path="/user/assessments/:assessmentId/problems"
                    element={
                        <UserLayout>
                            <AssessmentProblemSelection />
                        </UserLayout>
                    }
                />

                <Route
                    path="/user/assessments/:assessmentId/invitations"
                    element={
                        <UserLayout>
                            <AssessmentInvitations />
                        </UserLayout>
                    }
                />

                <Route
                    path="/user/assessments/:assessmentId/results"
                    element={
                        <UserLayout>
                            <AssessmentResults />
                        </UserLayout>
                    }
                />

                <Route
                    path="/user/assessments/:assessmentId/feedback"
                    element={
                        <UserLayout>
                            <AssessmentFeedback />
                        </UserLayout>
                    }
                />

                <Route
                    path="/user/assessments/:assessmentId/manage"
                    element={
                        <UserLayout>
                            <AssessmentManage />
                        </UserLayout>
                    }
                />


                {/* ============================= */}
                {/* CANDIDATE ASSESSMENT ROUTES */}
                {/* ============================= */}

                <Route
                    path="/assessment/invite/:invitationToken"
                    element={
                        <AssessmentCandidateEntry />
                    }
                />

                <Route
                    path="/assessment/invite/:invitationToken/instructions"
                    element={
                        <AssessmentInstructions />
                    }
                />

                <Route
                    path="/assessment/invite/:invitationToken/test"
                    element={
                        <AssessmentTest />
                    }
                />


                <Route
                    path="/admin/support"
                    element={
                        <AdminLayout>
                            <AdminSupport />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/contests/:contestId/register"
                    element={<ContestRegistration />}
                />


                <Route
                    path="/user/contests/:contestId/leaderboard"
                    element={
                        <UserLayout>
                            <ContestLeaderboard />
                        </UserLayout>
                    }
                />

                <Route
                    path="/admin/reports"
                    element={
                        <AdminLayout>
                            <AdminReportsAnalytics />
                        </AdminLayout>
                    }
                />


                {/* ============================= */}
                {/* FALLBACK - ALWAYS LAST */}
                {/* ============================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

            </Routes>

        </>
    );
}


/* =========================================================
   APP
========================================================= */

function App() {

    return (

        <BrowserRouter>

            <AppContent />

        </BrowserRouter>
    );
}

export default App;
