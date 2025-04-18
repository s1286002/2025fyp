import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Convert Firebase auth error codes to readable messages
 * @param {string} errorCode - Firebase auth error code
 * @returns {string} - Human readable error message
 */
export const getAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    // Registration errors
    case "auth/email-already-in-use":
      return "This email is already registered. Please use a different email or try logging in.";
    case "auth/invalid-email":
      return "The email address is not valid. Please enter a valid email.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters.";
    case "auth/operation-not-allowed":
      return "Account creation is disabled. Please contact support.";

    // Login errors
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/user-not-found":
      return "No account found with this email. Please check your email or register.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again or reset your password.";
    case "auth/too-many-requests":
      return "Too many unsuccessful login attempts. Please try again later or reset your password.";
    case "auth/invalid-credential":
      return "Invalid login credentials. Please check your email and password.";

    // Password reset errors
    case "auth/expired-action-code":
      return "The password reset link has expired. Please request a new one.";
    case "auth/invalid-action-code":
      return "The password reset link is invalid. Please request a new one.";

    // Default error
    default:
      return "An error occurred. Please try again later.";
  }
};

/**
 * Password validation rules
 * @param {string} password - Password to validate
 * @returns {Object} - Validation results with error message if any
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters" };
  }

  // Add more complex validation if needed (e.g., special characters, numbers, etc.)

  return { valid: true, error: null };
};

/**
 * Email validation
 * @param {string} email - Email to validate
 * @returns {Object} - Validation results with error message if any
 */
export const validateEmail = (email) => {
  if (!email) {
    return { valid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Please enter a valid email address" };
  }

  return { valid: true, error: null };
};

/**
 * Register a new user with Firebase Authentication and Firestore
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} userName - User display name
 * @param {string} role - User role (default: "teacher")
 * @returns {Promise<Object>} - Firebase user object
 */
export const registerUser = async (
  email,
  password,
  userName,
  role = "teacher"
) => {
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
};

/**
 * Login a user with Firebase Authentication
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Firebase user object
 */
export const loginUser = async (email, password) => {
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
};

/**
 * Logout the current user
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  return signOut(auth);
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export const resetUserPassword = async (email) => {
  return sendPasswordResetEmail(auth, email);
};
