"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  registerUser,
  loginUser,
  logoutUser,
  resetUserPassword,
} from "@/lib/authUtils";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authStateReady, setAuthStateReady] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      // Only run auth state observer in browser
      try {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
          try {
            if (authUser) {
              setUser(authUser);

              // Fetch user role from Firestore
              try {
                const userDoc = await getDoc(doc(db, "users", authUser.uid));
                if (userDoc.exists()) {
                  setUserRole(userDoc.data().role);
                }
              } catch (error) {
                console.error("Error fetching user role:", error);
              }
            } else {
              setUser(null);
              setUserRole(null);
            }
          } catch (error) {
            console.error("Error processing auth state change:", error);
          } finally {
            setLoading(false);
            setAuthStateReady(true);
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up auth observer:", error);
        setLoading(false);
        setAuthStateReady(true);
        return () => {};
      }
    } else {
      // Not in browser environment
      setLoading(false);
      setAuthStateReady(true);
      return () => {};
    }
  }, []);

  // Register new user - using function from authUtils
  async function register(email, password, userName, role = "teacher") {
    return registerUser(email, password, userName, role);
  }

  // Login user - using function from authUtils
  async function login(email, password) {
    return loginUser(email, password);
  }

  // Logout user - using function from authUtils
  async function logout() {
    return logoutUser();
  }

  // Password reset - using function from authUtils
  async function resetPassword(email) {
    return resetUserPassword(email);
  }

  const value = {
    user,
    userRole,
    loading,
    authStateReady,
    register,
    login,
    logout,
    resetPassword,
    isAdmin: userRole === "admin",
    isTeacher: userRole === "teacher",
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {authStateReady ? children : <div>Initializing...</div>}
    </AuthContext.Provider>
  );
}
