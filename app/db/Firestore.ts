import * as firebase from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

//cái này dùng để connect với firebase (carapp-dev)
const firebaseConfig = {
    apiKey: "AIzaSyAIUAFGtC0nEvABxDw0-h5HM7XZSh-7emo",
    authDomain: "carapp-dev-417b1.firebaseapp.com",
    projectId: "carapp-dev-417b1",
    storageBucket: "carapp-dev-417b1.firebasestorage.app",
    messagingSenderId: "945810369508",
    appId: "1:945810369508:web:c3786399676619c59df5f1"
};
const app =  firebase.initializeApp(firebaseConfig);

const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, firestore, storage };

//firebase đây nhé
//chổ này dùng để connect tới thằng firebase
//này là t đang dùng ỉebase của t
//mở firebase đi