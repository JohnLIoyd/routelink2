import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const routeLinkAuth = {
    /**
     * Subscribe to Firebase auth state changes.
     * @param {(user: import("firebase/auth").User | null) => void} callback
     * @returns {() => void} unsubscribe function
     */
    subscribe(callback) {
        return onAuthStateChanged(auth, callback);
    },
    /**
     * Sign out the current Firebase session.
     */
    async signOut() {
        try {
            await signOut(auth);
        } catch (error) {
            console.warn("Failed to sign out from Firebase", error);
        }
    }
};

window.routeLinkAuth = routeLinkAuth;


