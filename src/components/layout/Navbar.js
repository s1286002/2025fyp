"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/auth/LogoutButton";

export default function Navbar() {
  const { isAuthenticated, isAdmin, userRole, user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Check if the current path matches a specific route
  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and site name */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-lg font-semibold text-blue-600">
                Student Gamification
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Home
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/dashboard")
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Dashboard
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        isActive("/admin")
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Authentication buttons or user info */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {user?.email}
                    {userRole && (
                      <span className="ml-1 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                        {userRole}
                      </span>
                    )}
                  </span>
                  <LogoutButton size="sm" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm">Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  href="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive("/dashboard")
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive("/admin")
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="px-2 space-y-3">
                <div className="px-3 text-sm text-gray-600">
                  {user?.email}
                  {userRole && (
                    <span className="ml-1 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                      {userRole}
                    </span>
                  )}
                </div>
                <div className="px-3">
                  <LogoutButton size="sm" className="w-full justify-center" />
                </div>
              </div>
            ) : (
              <div className="px-2 space-y-2">
                <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                  <Button size="sm" className="w-full justify-center">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
