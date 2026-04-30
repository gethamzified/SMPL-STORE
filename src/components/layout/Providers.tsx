"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useState } from "react";
import { UserAuthProvider } from "@/context/UserAuthContext";
import { StoreConfigProvider } from "@/context/StoreConfigContext";
import { StoreConfig } from "@/services/config";

export function Providers({
  children,
  initialConfig
}: {
  children: React.ReactNode;
  initialConfig: StoreConfig;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <StoreConfigProvider initialConfig={initialConfig}>
        <UserAuthProvider>
          <TooltipProvider>
            {children}
            <Sonner position="top-center" />
          </TooltipProvider>
        </UserAuthProvider>
      </StoreConfigProvider>
    </QueryClientProvider>
  );
}
