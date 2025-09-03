import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { AdminLayout } from "@/components/layout/admin-layout";

// Pages
import Login from "@/pages/login";
import Dashboard from "@/pages/admin/dashboard";
import Assessments from "@/pages/admin/assessments";
import CreateAssessment from "@/pages/admin/create-assessment";
import QuestionBank from "@/pages/admin/question-bank";
import Results from "@/pages/admin/results";
import CandidateAssessment from "@/pages/candidate/assessment";
import AssessmentCompletion from "@/pages/candidate/completion";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login">
        {user ? <Redirect to="/admin/dashboard" /> : <Login />}
      </Route>
      
      {/* Candidate assessment routes */}
      <Route path="/take/:token" component={CandidateAssessment} />
      <Route path="/take/:token/complete" component={AssessmentCompletion} />
      
      {/* Protected admin routes */}
      <Route path="/admin/dashboard">
        <ProtectedRoute>
          <AdminLayout>
            <Dashboard />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/assessments" nest>
        <ProtectedRoute>
          <AdminLayout>
            <Route path="/" component={Assessments} />
            <Route path="/create" component={CreateAssessment} />
            <Route path="/edit/:id">
              {/* TODO: Implement edit assessment */}
              <div className="text-white">Edit Assessment - Coming Soon</div>
            </Route>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/questions">
        <ProtectedRoute>
          <AdminLayout>
            <QuestionBank />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/results">
        <ProtectedRoute>
          <AdminLayout>
            <Results />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/settings">
        <ProtectedRoute>
          <AdminLayout>
            <div className="text-white">Settings - Coming Soon</div>
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      {/* Default redirect */}
      <Route path="/">
        {user ? <Redirect to="/admin/dashboard" /> : <Redirect to="/login" />}
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="dark">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
