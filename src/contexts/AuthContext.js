"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

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

  // Register new user
  async function register(email, password, userName, role = "teacher") {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        userName,
        role,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });

      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  // Login user
  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update last login time
      await setDoc(
        doc(db, "users", userCredential.user.uid),
        { lastLogin: serverTimestamp() },
        { merge: true }
      );

      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  async function logout() {
    return signOut(auth);
  }

  // Password reset
  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
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
