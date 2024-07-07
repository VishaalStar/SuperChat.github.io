// firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "superchat-26671.firebaseapp.com",
  projectId: "superchat-26671",
  storageBucket: "superchat-26671.appspot.com",
  messagingSenderId: "992133687811",
  appId: "1:992133687811:web:c260fa6544de43c2133c36"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
