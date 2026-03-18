// Firebase конфигурация для вашего проекта
const firebaseConfig = {
    apiKey: "AIzaSyB4pL_IptvZRrsX6jWwDikSFHewLp3D8kA",
    authDomain: "atoc-ielts.firebaseapp.com",
    projectId: "atoc-ielts",
    storageBucket: "atoc-ielts.firebasestorage.app",
    messagingSenderId: "676284963929",
    appId: "1:676284963929:web:fdae14d32fc09e9701d486",
    measurementId: "G-6Z4PNKJ8ET"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();