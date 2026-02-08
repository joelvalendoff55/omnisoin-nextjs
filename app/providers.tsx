"use client";

import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import { AutoRecordingProvider } from "@/hooks/useAutoRecording";
import { PatientConsultationProvider } from "@/hooks/usePatientConsultationContext";
import { PatientAuthProvider } from "@/hooks/usePatientAuth";
import { AdminPatientProvider } from "@/hooks/useAdminPatientContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { FloatingRecordingIndicator } from "@/components/recording/FloatingRecordingIndicator";
import CookieConsent from "@/components/gdpr/CookieConsent";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ErrorBoundary inline errorMessage="Une erreur inattendue s'est produite. Veuillez rafraichir la page.">
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PatientAuthProvider>
              <AdminPatientProvider>
                <AutoRecordingProvider>
                  <PatientConsultationProvider>
                    <TooltipProvider>
                      <Toaster />
                      <Sonner />
                      {children}
                      <CookieConsent />
                      <FloatingRecordingIndicator />
                    </TooltipProvider>
                  </PatientConsultationProvider>
                </AutoRecordingProvider>
              </AdminPatientProvider>
            </PatientAuthProvider>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
