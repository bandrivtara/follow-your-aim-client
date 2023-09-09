// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAQT-N1MJQTTjk1aqoXK9ijOkZ1vSqkiyI",
  authDomain: "followyouraim-6d36f.firebaseapp.com",
  projectId: "followyouraim-6d36f",
  storageBucket: "followyouraim-6d36f.appspot.com",
  messagingSenderId: "814413425994",
  appId: "1:814413425994:web:00d57fced0f0ad8afee5b3",
  measurementId: "G-YH0SG39DQR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
