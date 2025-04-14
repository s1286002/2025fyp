"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, loading, isAdmin, userRole, authStateReady } =
    useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Don't do anything until auth state is ready
    if (!authStateReady) return;

    // Now we can proceed with auth checks
    setIsCheckingAuth(false);

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      // Store the intended route for redirecting back after login
      sessionStorage.setItem("redirectAfterLogin", pathname);
      router.replace("/auth/login");
      return;
    }

    // If admin-only route and user is not admin, redirect to dashboard
    if (adminOnly && !isAdmin) {
      router.replace("/dashboard");
      return;
    }

    // Clear redirect after successful access
    sessionStorage.removeItem("redirectAfterLogin");
  }, [isAuthenticated, authStateReady, adminOnly, isAdmin, router, pathname]);

  // Show loading while checking auth
  if (!authStateReady || isCheckingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  // If not authenticated or doesn't have required role, don't render children
  if (!isAuthenticated || (adminOnly && !isAdmin)) {
    return null;
  }

  // Authenticated and has correct role, render the page
  return children;
}
