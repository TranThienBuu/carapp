import * as firebase from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

//cái này dùng để connect với firebase
const firebaseConfig = {
    apiKey: "AIzaSyCGp4g-uMSDwdCoXD-b9z6Q9hU7Yi9iM34",
    authDomain: "planto-4cf44.firebaseapp.com",
    projectId: "planto-4cf44",
    storageBucket: "planto-4cf44.appspot.com",
    messagingSenderId: "105906920756",
    appId: "1:105906920756:web:b1c2149232f1760e531961",
    measurementId: "G-Q0JMN3HHGG"
};
const app =  firebase.initializeApp(firebaseConfig);

const firestore = getFirestore(app);
const storage = getStorage(app);

export { firestore, storage };

//firebase đây nhé
//chổ này dùng để connect tới thằng firebase
//này là t đang dùng ỉebase của t
//mở firebase đi