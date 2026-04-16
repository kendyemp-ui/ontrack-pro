import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { ProProvider, usePro } from "@/contexts/ProContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import WhatsAppChat from "./pages/WhatsAppChat";
import MealRegistration from "./pages/MealRegistration";
import DietGoals from "./pages/DietGoals";
import MealHistory from "./pages/MealHistory";
import Integrations from "./pages/Integrations";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ProLogin from "./pages/pro/ProLogin";
import ProDashboard from "./pages/pro/ProDashboard";
import ProPatients from "./pages/pro/ProPatients";
import ProPatientNew from "./pages/pro/ProPatientNew";
import ProPatientProfile from "./pages/pro/ProPatientProfile";
import ProAlerts from "./pages/pro/ProAlerts";
import ProWhatsApp from "./pages/pro/ProWhatsApp";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useApp();
  if (!isLoggedIn) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const LoginRedirect = () => {
  const { isLoggedIn } = useApp();
  if (isLoggedIn) return <Navigate to="/dashboard" replace />;
  return <Login />;
};

const ProProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = usePro();
  if (!isLoggedIn) return <Navigate to="/pro" replace />;
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
              <Route path="/" element={<LoginRedirect />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/whatsapp" element={<ProtectedRoute><WhatsAppChat /></ProtectedRoute>} />
              <Route path="/meal" element={<ProtectedRoute><MealRegistration /></ProtectedRoute>} />
              <Route path="/diet" element={<ProtectedRoute><DietGoals /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><MealHistory /></ProtectedRoute>} />
              <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* Profissional (B2B SaaS) */}
              <Route path="/pro" element={<ProLoginRedirect />} />
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
