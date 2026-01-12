// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCGp4g-uMSDwdCoXD-b9z6Q9hU7Yi9iM34",
    authDomain: "planto-4cf44.firebaseapp.com",
    projectId: "planto-4cf44",
    storageBucket: "planto-4cf44.appspot.com",
    messagingSenderId: "105906920756",
    appId: "1:105906920756:web:b1c2149232f1760e531961",
    measurementId: "G-Q0JMN3HHGG"
};

// Initialize Firebase - check if already initialized
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export { app };
