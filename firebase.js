// =========================================
// AIZERCHAT V3 — FIREBASE
// =========================================

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import { getAuth } from
    "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import { getFirestore } from
    "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import { getStorage } from
    "https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js";


// =========================================
// FIREBASE CONFIG
// =========================================

const firebaseConfig = {
    apiKey: "AIzaSyCXm-aatIqO3N0VYJVuMOMhjgzt0W0_EAY",
    authDomain: "aizerchat.firebaseapp.com",
    projectId: "aizerchat",
    storageBucket: "aizerchat.firebasestorage.app",
    messagingSenderId: "465734449291",
    appId: "1:465734449291:web:f45ab4c90ce60e3ac27c8e"
};

// =========================================
// INITIALIZE FIREBASE
// =========================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// =========================================
// EXPORT
// =========================================

export { app, auth, db, storage };