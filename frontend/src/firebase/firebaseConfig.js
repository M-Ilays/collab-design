import { initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider, GoogleAuthProvider} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBVZKS3i7VDrXD8LydGuJsGOx0O4X3rKwo",
    authDomain: "collab-design.firebaseapp.com",
    projectId: "collab-design",
    storageBucket: "collab-design.firebasestorage.app",
    messagingSenderId: "589506260146",
    appId: "1:589506260146:web:2f735730197c8abfaaadab",
    measurementId: "G-SK7C6ZW922"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const db = getFirestore(app);

export {
    auth,
    googleProvider,
    githubProvider,
    db
};