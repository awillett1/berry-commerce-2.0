import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const auth = getAuth();
    const logoutBtn = document.getElementById("logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", (event) => {
            event.preventDefault();
            
            signOut(auth).then(() => {
                console.log("User signed out.");
                alert("You have been logged out.");
                
                setTimeout(() => {
                    window.location.href = "login.html"; 
                }, 300);  
            }).catch((error) => {
                console.error("Error signing out:", error);
                alert("Failed to log out. Please try again.");
            });
        });
    }
});  
