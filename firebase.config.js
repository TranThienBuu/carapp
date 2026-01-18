// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration (carapp-dev)
const firebaseConfig = {
  apiKey: "AIzaSyBv75OD8GOFvHnG-1YU1y3OqcQxLr5S_-Y",
  authDomain: "carapp-eb690.firebaseapp.com",
  databaseURL: "https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "carapp-eb690",
  storageBucket: "carapp-eb690.firebasestorage.app",
  messagingSenderId: "465301224798",
  appId: "1:465301224798:web:9e051408992089168923cf",
  measurementId: "G-H8WWWYVX1X"
};

// Initialize Firebase - check if already initialized
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export { app };
