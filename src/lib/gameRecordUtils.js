import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Get game record stats for a specific student and game
 * @param {string} userId - Student's user ID
 * @param {string} gameId - Game ID (e.g., "Game1" or "Game2")
 * @returns {Promise<Object>} - Processed game stats
 */
export const getStudentGameStats = async (userId, gameId) => {
  try {
    // Create references for the query
    const userRef = doc(db, "users", userId);
    const gameRef = doc(db, "games", gameId);

    // Query userGameData collection
    const q = query(
      collection(db, "userGameData"),
      where("UserId", "==", userRef),
      where("GameId", "==", gameRef)
    );

    const querySnapshot = await getDocs(q);
    const records = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (gameId === "Game1") {
      return processGame1Stats(records);
    } else if (gameId === "Game2") {
      return processGame2Stats(records);
    } else if (gameId === "Game3") {
      return processGame3Stats(records);
    }

    throw new Error("Invalid game ID");
  } catch (error) {
    console.error("Error fetching game stats:", error);
    throw error;
  }
};

/**
 * Process Game1 records into stats
 * @param {Array} records - Array of game records
 * @returns {Object} - Processed Game1 stats
 */
const processGame1Stats = (records) => {
  const stats = {
    totalPlayCount: records.length,
    levelHighScores: {},
    totalScore: 0,
    completedLevels: new Set(),
  };

  // Process each record
  records.forEach((record) => {
    // Update level high scores
    if (
      !stats.levelHighScores[record.Level] ||
      record.Score > stats.levelHighScores[record.Level]
    ) {
      stats.levelHighScores[record.Level] = record.Score;
    }

    // Track completed levels
    if (record.IsCompleted) {
      stats.completedLevels.add(record.Level);
    }
  });

  // Calculate total score
  stats.totalScore = Object.values(stats.levelHighScores).reduce(
    (sum, score) => sum + score,
    0
  );

  return stats;
};

/**
 * Process Game2 records into stats
 * @param {Array} records - Array of game records
 * @returns {Object} - Processed Game2 stats
 */
const processGame2Stats = (records) => {
  const stats = {
    playCount: 0,
    maxLevel: 0,
    highestScore: 0,
  };

  records.forEach((record) => {
    // Count plays (level 0 records)
    if (record.Level === 0) {
      stats.playCount++;
    }

    // Update max level and highest score
    if (
      record.Level > stats.maxLevel ||
      (record.Level === stats.maxLevel && record.Score > stats.highestScore)
    ) {
      stats.maxLevel = record.Level;
      stats.highestScore = record.Score;
    }
  });

  return stats;
};

/**
 * Process Game3 records into stats
 * @param {Array} records - Array of game records
 * @returns {Object} - Processed Game3 stats
 */
const processGame3Stats = (records) => {
  const stats = {
    playCount: 0,
    highestScore: 0,
  };

  records.forEach((record) => {
    stats.playCount++;
    if (record.Score > stats.highestScore) {
      stats.highestScore = record.Score;
    }
  });

  return stats;
};

/**
 * Get all students' game records for a specific game
 * @param {string} gameId - Game ID
 * @returns {Promise<Array>} - Array of student game records
 */
export const getAllStudentsGameRecords = async (gameId) => {
  try {
    // Get all students
    const studentsQuery = query(
      collection(db, "users"),
      where("role", "==", "student")
    );
    const studentsSnapshot = await getDocs(studentsQuery);
    const students = studentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get game records for each student
    const records = await Promise.all(
      students.map(async (student) => {
        try {
          const stats = await getStudentGameStats(student.id, gameId);
          return {
            studentId: student.id,
            studentName: student.userName || student.email,
            ...stats,
          };
        } catch (error) {
          console.error(
            `Error fetching stats for student ${student.id}:`,
            error
          );
          return null;
        }
      })
    );

    // Filter out any failed fetches
    return records.filter((record) => record !== null);
  } catch (error) {
    console.error("Error fetching all students' game records:", error);
    throw error;
  }
};

/**
 * Get raw game records for admin view
 * @param {string} gameId - Game ID (e.g., "Game1" or "Game2")
 * @returns {Promise<Array>} - Array of raw game records with user info
 */
export const getRawGameRecords = async (gameId) => {
  try {
    // Create game reference
    const gameRef = doc(db, "games", gameId);

    // Query userGameData collection
    const q = query(
      collection(db, "userGameData"),
      where("GameId", "==", gameRef),
      orderBy("Datetime", "desc")
    );

    const querySnapshot = await getDocs(q);
    const recordsData = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        // Fetch user data to get the username
        const userDoc = await getDoc(data.UserId);
        const userData = userDoc.exists() ? userDoc.data() : null;

        return {
          id: doc.id,
          ...data,
          userName: userData?.userName || "Unknown User",
          datetime: data.Datetime?.toDate(),
        };
      })
    );

    return recordsData;
  } catch (error) {
    console.error("Error fetching raw game records:", error);
    throw error;
  }
};

/**
 * Update a game record
 * @param {string} recordId - Record ID
 * @param {Object} updateData - Data to update (Level, Score, IsCompleted)
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const updateGameRecord = async (recordId, updateData) => {
  try {
    const recordRef = doc(db, "userGameData", recordId);
    const recordDoc = await getDoc(recordRef);

    if (!recordDoc.exists()) {
      return { success: false, message: "Record not found" };
    }

    // Prepare data - only update allowed fields
    const dataToUpdate = {};
    if (updateData.Level !== undefined) {
      dataToUpdate.Level = Number(updateData.Level);
    }
    if (updateData.Score !== undefined) {
      dataToUpdate.Score = Number(updateData.Score);
    }
    if (updateData.IsCompleted !== undefined) {
      dataToUpdate.IsCompleted = updateData.IsCompleted;
    }

    // Add last modified timestamp
    dataToUpdate.LastModified = serverTimestamp();

    await updateDoc(recordRef, dataToUpdate);

    return {
      success: true,
      message: "Game record updated successfully",
    };
  } catch (error) {
    console.error("Error updating game record:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Delete a game record
 * @param {string} recordId - Record ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteGameRecord = async (recordId) => {
  try {
    const recordRef = doc(db, "userGameData", recordId);
    const recordDoc = await getDoc(recordRef);

    if (!recordDoc.exists()) {
      return { success: false, message: "Record not found" };
    }

    await deleteDoc(recordRef);

    return {
      success: true,
      message: "Game record deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting game record:", error);
    return { success: false, message: error.message };
  }
};
