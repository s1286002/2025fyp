import { app, db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
  addDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  deleteUser as deleteAuthUser,
  updateCurrentUser,
} from "firebase/auth";

/**
 * Fetch user data by user ID
 * @param {string} userId - Firebase Auth user ID
 * @returns {Promise<Object|null>} - User data or null if not found
 */
export const getUserById = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

/**
 * Check if email is already registered
 * @param {string} email - Email address to check
 * @returns {Promise<boolean>} - True if email exists, false otherwise
 */
export const checkEmailExists = async (email) => {
  try {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking email existence:", error);
    throw error;
  }
};

/**
 * Update user profile data
 * @param {string} userId - Firebase Auth user ID
 * @param {Object} data - User data to update
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId, data) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Get all users (for admin purposes)
 * @param {string} role - Optional role filter
 * @returns {Promise<Array>} - Array of user objects
 */
export const getAllUsers = async (role = null) => {
  try {
    let q;
    if (role) {
      q = query(collection(db, "users"), where("role", "==", role));
    } else {
      q = query(collection(db, "users"));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * Update user role (admin only)
 * @param {string} userId - Firebase Auth user ID
 * @param {string} newRole - New role ('admin' or 'teacher')
 * @returns {Promise<void>}
 */
export const updateUserRole = async (userId, newRole) => {
  try {
    if (!["admin", "teacher"].includes(newRole)) {
      throw new Error("Invalid role");
    }

    await updateDoc(doc(db, "users", userId), {
      role: newRole,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

/**
 * Get display name for a user, preferring userName over displayName
 * @param {Object} user - User object
 * @returns {string} - User's display name
 */
export const getDisplayName = (user) => {
  if (!user) return "Unknown User";

  // First try userName, then displayName, then email, then fallback
  return user.userName || user.displayName || user.email || "Unknown User";
};

/**
 * Create a new user
 * @param {Object} userData - User data containing email, userName, password and role
 * @returns {Promise<string>} - ID of the created user
 */
export const createUser = async (userData) => {
  try {
    // Check if email already exists
    const emailExists = await checkEmailExists(userData.email);
    if (emailExists) {
      throw new Error("Email already exists");
    }

    // Store the current auth state
    let currentUser = auth.currentUser;
    console.log("currentUser", currentUser);
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    const userId = userCredential.user.uid;

    // Create user document in Firestore
    await setDoc(doc(db, "users", userId), {
      uid: userId,
      email: userData.email,
      userName: userData.userName,
      role: userData.role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Sign out the new user if there was a previous user
    auth.updateCurrentUser(currentUser);

    return userId;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

/**
 * Delete a user from both Firestore and Firebase Auth (if possible)
 * @param {string} userId - User ID to delete
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteUser = async (userId) => {
  try {
    // First check if this is an auth user or just a Firestore record
    const userDoc = await getDoc(doc(db, "users", userId));

    if (!userDoc.exists()) {
      return { success: false, message: "User not found" };
    }

    let authDeleted = false;
    // If the document has a uid field matching its id, it's also an auth user
    if (userDoc.data().uid === userId) {
      try {
        await deleteAuthUser(auth, userId);
        authDeleted = true;
      } catch (authError) {
        console.error("Error deleting auth user:", authError);
      }
    }

    // Delete the Firestore document
    await deleteDoc(doc(db, "users", userId));

    return {
      success: true,
      message: authDeleted
        ? "User deleted from both Auth and Firestore"
        : "User deleted from Firestore only",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, message: error.message };
  }
};
