// logout.js
// To be used with the logout button on user-account.html, seller-account.html, and admin-account.html.
// Handles forgetting password and logging into an account

import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-button");

    if (!logoutBtn) {
        console.error("Logout button not found!");
        return;
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User is logged in:", user.email);
        } else {
            console.log("No user is logged in.");
        }
    });

    logoutBtn.addEventListener("click", async (event) => {
        event.preventDefault();

        try {
            console.log("Attempting to sign out...");
            await signOut(auth);
            console.log("User signed out successfully.");
            alert("You have been logged out.");

            setTimeout(() => {
                window.location.href = "login.html"; 
            }, 300);
        } catch (error) {
            console.error("Error signing out:", error);
            alert("Failed to log out. Please try again.");
        }
    });
});
