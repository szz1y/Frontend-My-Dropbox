import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA2eqpZU-lfysqUr9nyMOvCKMwYZrw5JAE",
  authDomain: "dropbox-ziyodabonu.firebaseapp.com",
  projectId: "dropbox-ziyodabonu",
  storageBucket: "dropbox-ziyodabonu.appspot.com",
  messagingSenderId: "168975500013",
  appId: "1:168975500013:web:b2a084369efc9d1148c2e4",
  measurementId: "G-W4XG35THN7",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const usersCollection = collection(db, "users");
const usernamesCollection = collection(db, "usernames");

export { auth, db, usersCollection, usernamesCollection, storage };



