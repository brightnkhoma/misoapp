// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDGrA3lZhidUwBRar9zWiS4vXzgja0XTXQ",
  authDomain: "kwathu-b7b68.firebaseapp.com",
  projectId: "kwathu-b7b68",
  storageBucket: "kwathu-b7b68.appspot.com",
  messagingSenderId: "284956368045",
  appId: "1:284956368045:web:da970effd3cb6db08a3a24",
  measurementId: "G-9QEWDV7B17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
export {db}
export default app