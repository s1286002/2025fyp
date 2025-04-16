"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, userRole, isAdmin } = useAuth();
  const router = useRouter();

  // Redirect based on role
  useEffect(() => {
    if (isAdmin) {
      // Could redirect to admin-specific dashboard in the future
      // router.push("/admin/dashboard");
    }
  }, [isAdmin, router]);

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.email}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Student Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p>View and manage your students' profiles and information.</p>
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  variant="primary"
                  onClick={() => router.push("/dashboard/students")}
                  className="w-full"
                >
                  View Students
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Game Records</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Monitor your students' progress and performance in games.</p>
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  variant="primary"
                  onClick={() => router.push("/dashboard/game-records")}
                  className="w-full"
                >
                  View Records
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Generate performance reports for students and games</p>
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  variant="primary"
                  onClick={() => router.push("/dashboard/reports")}
                  className="w-full"
                >
                  View Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
