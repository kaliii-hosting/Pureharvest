// Firebase configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBAdK404XbOwdS0onOsbNtW5TsuPWZIbdU",
  authDomain: "bimerica-7e949.firebaseapp.com",
  projectId: "bimerica-7e949",
  storageBucket: "bimerica-7e949.firebasestorage.app",
  messagingSenderId: "123761106639",
  appId: "1:123761106639:web:ced9b54de161ac210521ba"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
