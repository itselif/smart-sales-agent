// src/App.tsx
import { useEffect } from "react";
import { useAppStore } from "@/lib/stores";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import NotFound from "./pages/NotFound";
import ProductsPage from "./pages/stock/ProductsPage";
import MovementsPage from "./pages/stock/MovementsPage";
import AlertsPage from "./pages/stock/AlertsPage";

const queryClient = new QueryClient();

const App = () => {
  const loadStores = useAppStore(s => s.loadStores);

  useEffect(() => {
    loadStores().catch(console.error);
  }, [loadStores]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/stock/products" element={<ProductsPage />} />
            <Route path="/stock/movements" element={<MovementsPage />} />
            <Route path="/stock/alerts" element={<AlertsPage />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
