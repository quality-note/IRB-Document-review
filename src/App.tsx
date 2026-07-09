import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ReviewDataProvider } from "./context/ReviewDataContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import ResearcherPortal from "./pages/ResearcherPortal";
import Dashboard from "./pages/Dashboard";
import DocumentReview from "./pages/DocumentReview";
import ReviewResults from "./pages/ReviewResults";
import OpinionDraft from "./pages/OpinionDraft";
import KnowledgeBaseSearch from "./pages/KnowledgeBaseSearch";
import KnowledgeBaseManage from "./pages/KnowledgeBaseManage";
import Settings from "./pages/Settings";

function StaffApp() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/document-review" element={<DocumentReview />} />
          <Route path="/review-results" element={<ReviewResults />} />
          <Route path="/opinion-draft" element={<OpinionDraft />} />
          <Route path="/knowledge-search" element={<KnowledgeBaseSearch />} />
          <Route path="/knowledge-manage" element={<KnowledgeBaseManage />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

function AuthenticatedApp() {
  const { user } = useAuth();

  if (!user) return <Login />;

  return (
    <ReviewDataProvider>
      {user.role === "연구담당자" ? <ResearcherPortal /> : <StaffApp />}
    </ReviewDataProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
