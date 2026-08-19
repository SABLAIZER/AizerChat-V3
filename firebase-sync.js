// =========================================================
// AIZERCHAT V3 — FIREBASE SYNC V2 FINAL
// =========================================================
console.log("🔥 FIXED Firebase Sync Loading...");

const firebaseConfig = {
    apiKey: "AIzaSyCXm-aatIqO3N0VYJVuMOMhjgzt0W0_EAY",
    authDomain: "aizerchat.firebaseapp.com",
    projectId: "aizerchat",
    storageBucket: "aizerchat.firebasestorage.app",
    messagingSenderId: "465734449291",
    appId: "1:465734449291:web:f45ab4c90ce60e3ac27c8e"
};

let currentUser = null;
let currentChatId = null;
let fb = null;
let unsubscribe = null;

async function loadFirebase() {
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js");
        const { getAuth, signInAnonymously } = await import("https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js");
        const { getFirestore, collection, doc, addDoc, setDoc, getDoc, getDocs, query, where, orderBy, onSnapshot, updateDoc, deleteDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js");
        const app = initializeApp(firebaseConfig);
        fb = { app, auth: getAuth(app), db: getFirestore(app), signInAnonymously, collection, doc, addDoc, setDoc, getDoc, getDocs, query, where, orderBy, onSnapshot, updateDoc, deleteDoc, serverTimestamp };
        console.log("✅ Firebase SDKs loaded!");
        return true;
    } catch (error) {
        console.error("❌ Failed to load Firebase:", error);
        return false;
    }
}

function waitForChat() {
    return new Promise((resolve) => {
        let attempts = 0;
        const check = setInterval(() => {
            attempts++;
            if (typeof loadMessages !== 'undefined' && typeof chatHistory !== 'undefined' && typeof sendMessage !== 'undefined' && typeof contactName !== 'undefined') {
                clearInterval(check);
                console.log("✅ Chat.js loaded!");
                resolve(true);
            } else if (attempts > 40) {
                clearInterval(check);
                resolve(false);
            }
        }, 250);
    });
}

function showStatus(message, isError = false) {
    const statusEl = document.getElementById('contactStatus');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.style.color = isError ? '#ff4444' : '#25D366';
    }
}

async function getOrCreateChat(contactName) {
    currentChatId = contactName; // KEY FIX
    const chatRef = fb.doc(fb.db, "chats", currentChatId);
    const chatSnap = await fb.getDoc(chatRef);
    if (!chatSnap.exists()) {
        await fb.setDoc(chatRef, { participants: [currentUser.uid, contactName], createdAt: fb.serverTimestamp() });
    }
    return currentChatId;
}

async function syncMessageToFirebase(message) {
    if (!fb || !currentUser || !currentChatId) return false;
    try {
        const messagesRef = fb.collection(fb.db, "chats", currentChatId, "messages");
        await fb.addDoc(messagesRef, {
            ...message, // send everything
            senderId: currentUser.uid,
            createdAt: fb.serverTimestamp()
        });
        console.log("✅ SYNCED:", message.type);
        return true;
    } catch (error) {
        console.error("❌ Sync failed:", error);
        return false;
    }
}

function listenForMessages() {
    if (!fb || !currentUser || !currentChatId) return;
    if (unsubscribe) unsubscribe();
    const messagesRef = fb.collection(fb.db, "chats", currentChatId, "messages");
    const q = fb.query(messagesRef, fb.orderBy("createdAt", "asc"));
    
    unsubscribe = fb.onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const data = change.doc.data();
                if (data.senderId === currentUser.uid) return;
                const exists = chatHistory.some(msg => msg.id === data.localId);
                if (!exists) {
                    chatHistory.push({ ...data, type: "received" });
                    saveChat();
                    loadMessages();
                }
            }
        });
    });
}

function overrideAll() {
    const originalSend = window.sendMessage;
    window.sendMessage = async function() {
        originalSend.apply(this, arguments);
        await new Promise(r => setTimeout(r, 200));
        const lastMsg = chatHistory[chatHistory.length - 1];
        if (lastMsg && lastMsg.type === "sent") await syncMessageToFirebase(lastMsg);
    };

    const originalImage = window.showImageSendOptions;
    window.showImageSendOptions = async function(imageData, fileName) {
        originalImage(imageData, fileName);
        await new Promise(r => setTimeout(r, 200));
        const lastMsg = chatHistory[chatHistory.length - 1];
        if (lastMsg && (lastMsg.type === "image" || lastMsg.type === "viewOnce")) await syncMessageToFirebase(lastMsg);
    };

    const originalFile = window.handleFile;
    window.handleFile = async function(e) {
        originalFile(e);
        await new Promise(r => setTimeout(r, 200));
        const lastMsg = chatHistory[chatHistory.length - 1];
        if (lastMsg && lastMsg.type === "file") await syncMessageToFirebase(lastMsg);
    };
}

async function init() {
    showStatus("Connecting...");
    if (!await waitForChat()) return showStatus("Local Only", true);
    if (!await loadFirebase()) return showStatus("Firebase Unavailable", true);
    
    const userCredential = await fb.signInAnonymously(fb.auth);
    currentUser = userCredential.user;
    
    await getOrCreateChat(contactName);
    listenForMessages();
    overrideAll();
    showStatus("Online");
    console.log("🚀 READY! Chat ID:", currentChatId, "User:", currentUser.uid);
}

if (document.readyState === 'complete') setTimeout(init, 1000);
else window.addEventListener('load', () => setTimeout(init, 1000));