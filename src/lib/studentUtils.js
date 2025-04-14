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
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * Create a new student
 * @param {Object} studentData - Student data containing email and displayName
 * @returns {Promise<string>} - ID of the created student
 */
export const createStudent = async (studentData) => {
  try {
    // For students, we'll just create a record in the users collection with role="student"
    // This simulates registration without password since teachers add students
    // In a real app, you might want to generate a temporary password or invite flow

    // Create a new document in users collection
    const userRef = await addDoc(collection(db, "users"), {
      email: studentData.email,
      userName: studentData.displayName || studentData.email,
      role: "student",
      xp: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return userRef.id;
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
 * @returns {Promise<void>}
 */
export const deleteStudent = async (studentId) => {
  try {
    await deleteDoc(doc(db, "users", studentId));
  } catch (error) {
    console.error("Error deleting student:", error);
    throw error;
  }
};
