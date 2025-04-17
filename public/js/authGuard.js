// authGuard.js
// To be used on any/all pages.
// Prevents:
//  - not logged in users from accessing user-account.html, seller-account.html, admin-account.html
//  - users from accessing seller-account.html, admin-account.html
//  - sellers from accessing user-account.html, admin-account.html

import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';


const auth = getAuth();
const db = getFirestore();

// TODO will need to find a better way to blacklist this in the future.. looking into doing it server-side. for now this works.
// TODO maybe put on blank screen? remove loading to hide sensitive information
// redirects manually.
document.addEventListener("DOMContentLoaded", () => {
    const accountLink = document.getElementById("account-link");
    const path = window.location.pathname;
    
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            if (path.includes("user-account.html") || path.includes("seller-account.html") || path.includes("admin-account.html")) {
                window.location.href = "login.html";
            }
            return;
        }
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) return;

        const userRole = userDoc.data().role;
        const roleToPage = { // links to redirect to based on role
            "admin": "admin-account.html",
            "seller": "seller-account.html",
            "user": "user-account.html"
        };

        // redirect with account icon (accountLink)
        if (accountLink) {
            accountLink.addEventListener("click", (event) => {
                event.preventDefault();
                window.location.href = roleToPage[userRole] || "login.html"; // TODO need to edit this. does not work sometimes
            });
        }

        // access based off role
        const restrictedPages = {
            "user-account.html": ["user", "admin"],
            "seller-account.html": ["seller", "admin"],
            "admin-account.html": ["admin"]
        };

        for (const page in restrictedPages) {
            if (path.includes(page) && !restrictedPages[page].includes(userRole)) {
                alert("You do not have access to this page."); // TODO update this to fully block out?
                //TODO need to make sure tables do not load in the background
                window.location.href = "login.html";
                break;
            }
        }
    });
});
