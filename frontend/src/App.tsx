import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GeneralLibrary from "./pages/GeneralLibrary";
import MyLibrary from "./pages/MyLibrary";
import SearchPage from "./pages/SearchPage";
import UserChat from "./pages/UserChat";
import UserManagement from "./pages/UserManagement";
import DocumentApproval from "./pages/DocumentApproval";
import AppLayout from "@/components/layout/AppLayout";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/routing/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            <Route
              element={<ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']} element={<UserChat />} />}
              path="/chat"
            />

            <Route element={<ProtectedRoute element={<AppLayout />} />}>
              <Route path="/dashboard" element={<Dashboard />} />

              <Route element={<ProtectedRoute allowedRoles={['admin', 'superadmin']} />}>
                <Route path="/general-library" element={<GeneralLibrary />} />
              </Route>

              <Route path="/my-library" element={<MyLibrary />} />
              <Route path="/search" element={<SearchPage />} />

              <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
                <Route path="/approvals" element={<DocumentApproval />} />
                <Route path="/users" element={<UserManagement />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
