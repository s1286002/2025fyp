import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUser } from "@/lib/userUtils";

/**
 * Create a new student with Firebase Auth and Firestore record
 * @param {Object} studentData - Student data containing email, userName, and password
 * @returns {Promise<string>} - ID of the created student
 */
export const createStudent = async (studentData) => {
  try {
    // Use createUser from userUtils to create both Auth and Firestore records
    const userId = await createUser({
      email: studentData.email,
      password: studentData.password,
      userName: studentData.userName,
      role: "student",
    });

    return userId;
  } catch (error) {
    console.error("Error creating student:", error);
    throw error;
  }
};

/**
 * Get a student by ID
 * @param {string} studentId - Student ID
 * @returns {Promise<Object|null>} - Student data or null if not found
 */
export const getStudentById = async (studentId) => {
  try {
    const studentDoc = await getDoc(doc(db, "users", studentId));
    if (studentDoc.exists() && studentDoc.data().role === "student") {
      return {
        id: studentDoc.id,
        ...studentDoc.data(),
        displayName: studentDoc.data().userName, // Map userName to displayName for consistency
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching student:", error);
    throw error;
  }
};

/**
 * Get all students
 * @returns {Promise<Array>} - Array of student objects
 */
export const getAllStudents = async () => {
  try {
    const q = query(collection(db, "users"), where("role", "==", "student"));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      displayName: doc.data().userName, // Map userName to displayName for consistency
    }));
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

/**
 * Update student details
 * @param {string} studentId - Student ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export const updateStudent = async (studentId, updateData) => {
  try {
    // If displayName is being updated, map it to userName
    const dataToUpdate = { ...updateData };
    if (dataToUpdate.displayName) {
      dataToUpdate.userName = dataToUpdate.displayName;
      delete dataToUpdate.displayName;
    }

    await updateDoc(doc(db, "users", studentId), {
      ...dataToUpdate,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating student:", error);
    throw error;
  }
};

/**
 * Delete a student
 * @param {string} studentId - Student ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteStudent = async (studentId) => {
  try {
    // First check if this is an auth user or just a Firestore record
    const userDoc = await getDoc(doc(db, "users", studentId));

    if (!userDoc.exists()) {
      return { success: false, message: "Student not found" };
    }

    let authDeleted = false;
    // If the document has a uid field, it's also an auth user
    if (userDoc.data().uid) {
      const uid = userDoc.data().uid;
      try {
        // Get the current user from auth
        const currentUser = auth.currentUser;

        // Only delete the auth user if it's the same as the current user
        if (currentUser && currentUser.uid === uid) {
          await deleteUser(currentUser);
          authDeleted = true;
        } else {
          console.warn(
            "Cannot delete Firebase Auth account - requires user to be logged in or Admin SDK"
          );
        }
      } catch (authError) {
        console.error("Error deleting auth user:", authError);
        // Continue with Firestore deletion even if auth deletion fails
      }
    }

    // Delete the Firestore document
    await deleteDoc(doc(db, "users", studentId));

    return {
      success: true,
      message: authDeleted
        ? "Student deleted from both Auth and Firestore"
        : "Student deleted from Firestore only",
    };
  } catch (error) {
    console.error("Error deleting student:", error);
    return { success: false, message: error.message };
  }
};
