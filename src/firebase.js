import firebase from "firebase/app";
import "firebase/firestore";

const config = {
    apiKey: "AIzaSyDShSboJOEDlFsGGtOHIEmQzxKNSkvUBHw",
    authDomain: "vue-calendar-a4df0.firebaseapp.com",
    projectId: "vue-calendar-a4df0",
    storageBucket: "vue-calendar-a4df0.appspot.com",
    messagingSenderId: "166112869724",
    appId: "1:166112869724:web:9769d096f03fb85063d599"
  };
  
  // Initialize Firebase
firebase.initializeApp(config);
const db = firebase.firestore();

export { firebase, db };