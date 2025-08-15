import { lazy, Suspense } from "react";

import { AuthCenteredLayout } from "src/layouts/auth-centered";

import { SplashScreen } from "src/components/loading-screen";

import { GuestGuard } from "src/auth/guard/index.js";

import { dashboardRoutes } from "./dashboard";

const LoginPage = lazy(() => import("src/pages/auth/login"));

export const routesSection = [
  {
    path: "/",
    element: (
      <Suspense fallback={<SplashScreen />}>
        <GuestGuard>
          <AuthCenteredLayout>
            <LoginPage />
          </AuthCenteredLayout>
        </GuestGuard>
      </Suspense>
    ),
  },
  ...dashboardRoutes,
];
