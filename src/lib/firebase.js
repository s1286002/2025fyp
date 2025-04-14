// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAbXO6yLPlgmiCb3j0GNedX6G1hqRn5WsU",
  authDomain: "fyp2024-8e0f7.firebaseapp.com",
  databaseURL: "https://fyp2024-8e0f7-default-rtdb.firebaseio.com",
  projectId: "fyp2024-8e0f7",
  storageBucket: "fyp2024-8e0f7.firebasestorage.app",
  messagingSenderId: "104021993621",
  appId: "1:104021993621:web:18702579cf4274ea65539c",
  measurementId: "G-60WTWR32GR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics only in browser environment
let analytics = null;
if (typeof window !== "undefined") {
  // Dynamic import for analytics to avoid SSR issues
  import("firebase/analytics")
    .then(({ getAnalytics }) => {
      try {
        analytics = getAnalytics(app);
      } catch (error) {
        console.error("Analytics initialization error:", error);
      }
    })
    .catch((error) => {
      console.error("Error importing analytics:", error);
    });
}

export { app, analytics, auth, db };
