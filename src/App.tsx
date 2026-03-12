import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StoreProvider } from "@/context/StoreContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import MountainList from "@/pages/MountainList";
import MountainDetail from "@/pages/MountainDetail";
import MapView from "@/pages/MapView";
import Records from "@/pages/Records";
import GearPage from "@/pages/GearPage";
import SocialPage from "@/pages/SocialPage";
import AchievementsPage from "@/pages/AchievementsPage";
import ProfilePage from "@/pages/ProfilePage";
import AuthPage from "@/pages/AuthPage";
import PlansPage from "@/pages/PlansPage";
import CreatePlanPage from "@/pages/CreatePlanPage";
import PlanDetailPage from "@/pages/PlanDetailPage";
import FeedPage from "@/pages/FeedPage";
import FriendProfilePage from "@/pages/FriendProfilePage";
import ChallengePage from "@/pages/ChallengePage";
import SharedCompletionPage from "@/pages/SharedCompletionPage";
import GroupsPage from "@/pages/GroupsPage";
import KakaoCallback from "@/pages/KakaoCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 0,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

const AppRoutes = () => {
  const { user, loading } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={user && !loading ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="/mountains" element={<MountainList />} />
      <Route path="/mountains/:id" element={<MountainDetail />} />
      <Route path="/map" element={<MapView />} />
      <Route path="/records" element={<Records />} />
      <Route path="/gear" element={<GearPage />} />
      <Route path="/social" element={<SocialPage />} />
      <Route path="/plans" element={<ProtectedRoute><PlansPage /></ProtectedRoute>} />
      <Route path="/plans/create" element={<ProtectedRoute><CreatePlanPage /></ProtectedRoute>} />
      <Route path="/plans/:id" element={<ProtectedRoute><PlanDetailPage /></ProtectedRoute>} />
      <Route path="/challenges" element={<ProtectedRoute><ChallengePage /></ProtectedRoute>} />
      <Route path="/achievements" element={<AchievementsPage />} />
      <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
      <Route path="/shared-completions" element={<ProtectedRoute><SharedCompletionPage /></ProtectedRoute>} />
      <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
      <Route path="/profile/:userId" element={<ProtectedRoute><FriendProfilePage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ErrorBoundary fallbackMessage="데이터를 불러오는 중 오류가 발생했습니다.">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <StoreProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Layout>
                <ErrorBoundary fallbackMessage="데이터를 불러오는 중 오류가 발생했습니다.">
                  <AppRoutes />
                </ErrorBoundary>
              </Layout>
            </BrowserRouter>
          </StoreProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
