// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration (carapp-dev)
const firebaseConfig = {
  apiKey: "AIzaSyAIUAFGtC0nEvABxDw0-h5HM7XZSh-7emo",
  authDomain: "carapp-dev-417b1.firebaseapp.com",
  projectId: "carapp-dev-417b1",
  storageBucket: "carapp-dev-417b1.firebasestorage.app",
  messagingSenderId: "945810369508",
  appId: "1:945810369508:web:c3786399676619c59df5f1"
};

// Initialize Firebase - check if already initialized
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export { app };
