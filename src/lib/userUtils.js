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
} from "firebase/firestore";
import { db } from "@/lib/firebase";

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
 * Migrate displayName to userName for admin and teacher users
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const migrateDisplayNameToUserName = async () => {
  try {
    // Query for admin and teacher users
    const q = query(
      collection(db, "users"),
      where("role", "in", ["admin", "teacher"])
    );
    const querySnapshot = await getDocs(q);

    const updatePromises = [];
    let updateCount = 0;

    querySnapshot.forEach((docSnapshot) => {
      const userData = docSnapshot.data();
      // Only update if displayName exists and userName doesn't
      if (userData.displayName && !userData.userName) {
        updateCount++;
        const userRef = doc(db, "users", docSnapshot.id);
        const updatePromise = updateDoc(userRef, {
          userName: userData.displayName,
          updatedAt: new Date(),
        });
        updatePromises.push(updatePromise);
      }
    });

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
      return {
        success: true,
        message: `Successfully migrated ${updateCount} users from displayName to userName`,
      };
    }

    return {
      success: true,
      message: "No users needed migration",
    };
  } catch (error) {
    console.error("Error migrating displayName to userName:", error);
    return {
      success: false,
      message: "Failed to migrate users: " + error.message,
    };
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
 * @param {Object} userData - User data containing email, userName, and role
 * @returns {Promise<string>} - ID of the created user
 */
export const createUser = async (userData) => {
  try {
    // Check if email already exists
    const emailExists = await checkEmailExists(userData.email);
    if (emailExists) {
      throw new Error("Email already exists");
    }

    // Create a new document in users collection
    const userRef = await addDoc(collection(db, "users"), {
      email: userData.email,
      userName: userData.userName,
      role: userData.role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return userRef.id;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
