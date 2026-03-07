import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MainLayout } from "@/components/MainLayout";
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";
import Users from "./pages/Users";
import Predictions from "./pages/Predictions";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: true,
      staleTime: 10000, // 10 seconds - reduced for more frequent fetches
      gcTime: 300000,
      networkMode: 'online', // Changed from 'offlineFirst' to force API calls
      refetchOnMount: true, // Always refetch on component mount
      refetchOnReconnect: true, // Refetch when network reconnects
    },
    mutations: {
      networkMode: 'online',
    },
  },
  logger: {
    log: (...args) => console.log('🔄 React Query:', ...args),
    warn: (...args) => console.warn('⚠️ React Query:', ...args),
    error: (...args) => console.error('🔥 React Query:', ...args),
  },
});

// Log query cache changes
queryClient.getQueryCache().subscribe((event) => {
  if (event) {
    console.log('📦 Query Cache Event:', {
      type: event.type,
      query: event.query.queryKey,
    });
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="geosentinel-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes with MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/users" element={<Users />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
    {/* React Query Devtools for debugging */}
    <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
  </QueryClientProvider>
);

export default App;
