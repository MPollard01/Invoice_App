import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzHVABMJhFE73JjGCcbtY1Kxurt0LPcsw",
  authDomain: "invoice-app-d6fc5.firebaseapp.com",
  projectId: "invoice-app-d6fc5",
  storageBucket: "invoice-app-d6fc5.appspot.com",
  messagingSenderId: "428728444940",
  appId: "1:428728444940:web:030d4b61baf2dccee7a629",
};

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);

export default firebaseApp.firestore();
