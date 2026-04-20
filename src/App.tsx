import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { ProProvider, usePro } from "@/contexts/ProContext";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import WhatsAppChat from "./pages/WhatsAppChat";
import MealRegistration from "./pages/MealRegistration";
import DietGoals from "./pages/DietGoals";
import MealHistory from "./pages/MealHistory";
import Integrations from "./pages/Integrations";
import Profile from "./pages/Profile";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import NotFound from "./pages/NotFound";
import ProLogin from "./pages/pro/ProLogin";
import ProLanding from "./pages/ProLanding";
import ProSignup from "./pages/pro/ProSignup";
import ProDashboard from "./pages/pro/ProDashboard";
import ProPatients from "./pages/pro/ProPatients";
import ProPatientNew from "./pages/pro/ProPatientNew";
import ProPatientProfile from "./pages/pro/ProPatientProfile";
import ProAlerts from "./pages/pro/ProAlerts";
import ProWhatsApp from "./pages/pro/ProWhatsApp";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, authLoading } = useApp();
  if (authLoading) return <FullScreenLoader />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const LoginRedirect = () => {
  const { isLoggedIn, authLoading } = useApp();
  if (authLoading) return <FullScreenLoader />;
  if (isLoggedIn) return <Navigate to="/dashboard" replace />;
  return <Login />;
};

const FullScreenLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="animate-spin text-muted-foreground" size={24} />
  </div>
);

const ProProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = usePro();
  if (!isLoggedIn) return <Navigate to="/pro/login" replace />;
  return <>{children}</>;
};

const ProLoginRedirect = () => {
  const { isLoggedIn } = usePro();
  if (isLoggedIn) return <Navigate to="/pro/dashboard" replace />;
  return <ProLogin />;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <ProProvider>
            <Routes>
              {/* Paciente (B2C) */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<LoginRedirect />} />
              <Route path="/esqueci-senha" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/whatsapp" element={<ProtectedRoute><WhatsAppChat /></ProtectedRoute>} />
              <Route path="/meal" element={<ProtectedRoute><MealRegistration /></ProtectedRoute>} />
              <Route path="/diet" element={<ProtectedRoute><DietGoals /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><MealHistory /></ProtectedRoute>} />
              <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/admin/assinaturas" element={<ProtectedRoute><AdminSubscriptions /></ProtectedRoute>} />

              {/* Profissional (B2B SaaS) */}
              <Route path="/pro" element={<ProLandingRedirect />} />
              <Route path="/pro/login" element={<ProLoginRedirect />} />
              <Route path="/pro/cadastro" element={<ProSignup />} />
              <Route path="/pro/dashboard" element={<ProProtectedRoute><ProDashboard /></ProProtectedRoute>} />
              <Route path="/pro/pacientes" element={<ProProtectedRoute><ProPatients /></ProProtectedRoute>} />
              <Route path="/pro/pacientes/novo" element={<ProProtectedRoute><ProPatientNew /></ProProtectedRoute>} />
              <Route path="/pro/pacientes/:id" element={<ProProtectedRoute><ProPatientProfile /></ProProtectedRoute>} />
              <Route path="/pro/alertas" element={<ProProtectedRoute><ProAlerts /></ProProtectedRoute>} />
              <Route path="/pro/whatsapp" element={<ProProtectedRoute><ProWhatsApp /></ProProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </ProProvider>
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
