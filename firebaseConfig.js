// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyClkjqMCWRgCEi8mPGanZZkD7XPi8Wf7Dk",
  authDomain: "exodus-c5202.firebaseapp.com",
  projectId: "exodus-c5202",
  storageBucket: "exodus-c5202.appspot.com",
  messagingSenderId: "183924171339",
  appId: "1:183924171339:web:f43715a20de002184de3ce",
  measurementId: "G-65DZD1X1NT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };