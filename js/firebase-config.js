// 9achech Firebase Cloud Firestore Real-Time Configuration

const firebaseConfig = {
  apiKey: "AIzaSyDzDtyPa8gvDq9v3VH5FVTtXCknKti6D5A",
  authDomain: "achech-ea884.firebaseapp.com",
  projectId: "achech-ea884",
  storageBucket: "achech-ea884.firebasestorage.app",
  messagingSenderId: "987870221190",
  appId: "1:987870221190:web:a09f9cef6d51ee196d9207",
  measurementId: "G-5XMLZ9Q791"
};

let db = null;
let isFirebaseActive = false;

try {
  if (typeof firebase !== 'undefined' && firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    isFirebaseActive = true;
    window.db = db;
    window.isFirebaseActive = true;
    console.log("🔥 Firebase Firestore connected successfully.");
  } else {
    window.isFirebaseActive = false;
    console.warn("⚠️ Firebase credentials issue. Falling back to LocalStorage.");
  }
} catch (error) {
  window.isFirebaseActive = false;
  console.error("❌ Firebase initialization error:", error);
}
