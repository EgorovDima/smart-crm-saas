
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import TaskManagement from "./pages/TaskManagement";
import Clients from "./pages/Clients";
import Carriers from "./pages/Carriers";
import GmailIntegration from "./pages/GmailIntegration";
import InvoiceCreation from "./pages/InvoiceCreation";
import TransportationExpenses from "./pages/TransportationExpenses";
import Database from "./pages/Database";
import AIChat from "./pages/AIChat";
import Register from "./pages/Register";

const queryClient = new QueryClient();

// Check URL for auth redirect
const AuthCallbackHandler = () => {
  useEffect(() => {
    const handleHashParams = async () => {
      const hash = window.location.hash;
      
      if (hash && hash.includes('access_token')) {
        // Set Supabase session from URL
        const { error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        
        // Remove hash from URL
        window.location.hash = '';
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      }
    };
    
    handleHashParams();
  }, []);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AuthCallbackHandler />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Register />} />
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<TaskManagement />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/carriers" element={<Carriers />} />
              <Route path="/gmail" element={<GmailIntegration />} />
              <Route path="/invoices" element={<InvoiceCreation />} />
              <Route path="/expenses" element={<TransportationExpenses />} />
              <Route path="/database" element={<Database />} />
              <Route path="/ai-chat" element={<AIChat />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
