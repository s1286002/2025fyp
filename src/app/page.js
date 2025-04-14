"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Track Student Progress in Educational Games
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          A comprehensive platform for teachers to monitor student performance
          and admins to manage educational gamification data.
        </p>

        {!isAuthenticated && !loading ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" className="px-8">
                Login
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" variant="outline" className="px-8">
                Register
              </Button>
            </Link>
          </div>
        ) : loading ? (
          <div className="text-gray-600">Loading...</div>
        ) : null}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">For Teachers</h2>
            <p className="text-gray-600 mb-4">
              Monitor student progress, track performance metrics, and generate
              insightful reports.
            </p>
            <ul className="text-gray-600 list-disc list-inside mb-4">
              <li>Student performance dashboards</li>
              <li>Quick game record entry</li>
              <li>Progress visualization</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">For Administrators</h2>
            <p className="text-gray-600 mb-4">
              Manage users, configure system settings, and oversee the entire
              platform.
            </p>
            <ul className="text-gray-600 list-disc list-inside mb-4">
              <li>User management</li>
              <li>System configuration</li>
              <li>Data oversight</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Mobile Friendly</h2>
            <p className="text-gray-600 mb-4">
              Access the platform from any device with a fully responsive
              design.
            </p>
            <ul className="text-gray-600 list-disc list-inside mb-4">
              <li>Responsive interface</li>
              <li>Touch-friendly controls</li>
              <li>On-the-go access</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-100 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join today to start tracking student gamification progress and gain
            valuable insights into educational performance.
          </p>

          {!isAuthenticated && !loading && (
            <Link href="/auth/register">
              <Button size="lg" className="px-8">
                Sign Up Now
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
