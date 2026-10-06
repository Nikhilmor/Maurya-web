import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// MAURYA Firebase Web App configuration
const firebaseConfig = {
    apiKey: "AIzaSyAvS8QAY4g014ZVf_eBJ1OaEbjAKRF04lY",
    authDomain: "maurya-bbb92.firebaseapp.com",
    projectId: "maurya-bbb92",
    storageBucket: "maurya-bbb92.firebasestorage.app",
    messagingSenderId: "310685435853",
    appId: "1:310685435853:web:102d97fdb2d9231edd6684",
    measurementId: "G-80QPWXDYVE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function message(id, text, isError = true) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.style.color = isError ? "#ff9b9b" : "#7dff9b";
}

function setBusy(buttonId, busy, normalText) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    btn.disabled = busy;
    btn.textContent = busy ? "Please wait..." : normalText;
}

function friendlyAuthError(error) {
    switch (error.code) {
        case "auth/email-already-in-use":
            return "This email is already registered. Please login.";
        case "auth/invalid-email":
            return "Please enter a valid email address.";
        case "auth/weak-password":
            return "Password must be at least 6 characters.";
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
            return "Email or password is incorrect.";
        case "auth/too-many-requests":
            return "Too many attempts. Please wait and try again.";
        case "auth/network-request-failed":
            return "Network error. Check your internet connection.";
        default:
            return error.message || "Something went wrong. Please try again.";
    }
}

window.registerUser = async function () {
    const name = document.getElementById("register-name").value.trim();
    const phone = document.getElementById("register-phone").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;

    if (!name) {
        message("register-message", "Please enter your name.");
        return;
    }
    if (!phone) {
        message("register-message", "Please enter your phone number.");
        return;
    }
    if (!email) {
        message("register-message", "Please enter your email.");
        return;
    }
    if (password.length < 6) {
        message("register-message", "Password must be at least 6 characters.");
        return;
    }

    setBusy("register-btn", true, "Create Account");
    message("register-message", "Creating your MAURYA account...", false);

    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: name });

        // Permanently save the user's profile in Cloud Firestore.
        await setDoc(doc(db, "users", credential.user.uid), {
            uid: credential.user.uid,
            name: name,
            phone: phone,
            email: email,
            photoURL: credential.user.photoURL || "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        localStorage.setItem("maurya_user_phone", phone);

        message("register-message", "Account created successfully! Opening MAURYA...", false);
        setTimeout(() => showPage("homepage"), 500);
    } catch (error) {
        console.error(error);
        message("register-message", friendlyAuthError(error));
    } finally {
        setBusy("register-btn", false, "Create Account");
    }
};

window.loginUser = async function () {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
        message("login-message", "Please enter your email and password.");
        return;
    }

    setBusy("login-btn", true, "Login");
    message("login-message", "Logging you in...", false);

    try {
        await signInWithEmailAndPassword(auth, email, password);
        message("login-message", "Login successful!", false);
        setTimeout(() => showPage("homepage"), 300);
    } catch (error) {
        console.error(error);
        message("login-message", friendlyAuthError(error));
    } finally {
        setBusy("login-btn", false, "Login");
    }
};

async function loadUserProfile(user) {
    try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!snap.exists()) return;
        const data = snap.data();
        localStorage.setItem("maurya_user_phone", data.phone || "");

        const nameEl = document.querySelector("#profile .profile-info h1");
        const descEl = document.querySelector("#profile .profile-info p");
        const phoneEl = document.querySelector("#profile .profile-info p:nth-of-type(2)");
        const emailEl = document.querySelector("#profile .profile-info p:nth-of-type(3)");
        if (nameEl) nameEl.textContent = data.name || "MAURYA USER";
        if (descEl) descEl.textContent = "Welcome to my MAURYA profile.";
        if (phoneEl) phoneEl.textContent = "📞 " + (data.phone || "");
        if (emailEl) emailEl.textContent = "✉️ " + (data.email || user.email || "");
    } catch (error) {
        console.error("Could not load profile:", error);
    }
}

window.logoutUser = async function () {
    try {
        await signOut(auth);
        document.getElementById("login-email").value = "";
        document.getElementById("login-password").value = "";
        message("login-message", "");
        showPage("home");
    } catch (error) {
        console.error(error);
    }
};

// Protect the social area: users must be signed in to see it.
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadUserProfile(user);
        // The current page remains unchanged after login/refresh.
        // If the user is already signed in and lands on the login screen, open the app.
        const homepage = document.getElementById("homepage");
        const login = document.getElementById("login");
        if (homepage && login && login.style.display === "block") {
            showPage("homepage");
        }
    } else {
        const homepage = document.getElementById("homepage");
        if (homepage && homepage.style.display === "block") {
            showPage("home");
        }
    }
});
