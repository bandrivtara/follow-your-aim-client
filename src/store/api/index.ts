import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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
export const fbApp = initializeApp(firebaseConfig);
export const db = getFirestore(fbApp);

export const api = createApi({
  tagTypes: [
    "Habit",
    "Spheres",
    "Aims",
    "History",
    "Todo",
    "TaskGroup",
    "HabitsCategories",
    "AimsCategories",
    "English",
  ],
  reducerPath: "splitApi",
  baseQuery: fakeBaseQuery(),
  endpoints: () => ({}),
});
