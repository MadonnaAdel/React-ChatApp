import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCmfuv9q_z2mI3m4mRkBdypBInQa_z4u0A",
  authDomain: "chat-app-d6a7d.firebaseapp.com",
  projectId: "chat-app-d6a7d",
  storageBucket: "chat-app-d6a7d.appspot.com",
  messagingSenderId: "683973572139",
  appId: "1:683973572139:web:bc3a6184e5416cce39dc6e",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
