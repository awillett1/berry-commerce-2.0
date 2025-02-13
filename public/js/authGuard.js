import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const auth = getAuth();

document.addEventListener("DOMContentLoaded", () => {
    const accountLink = document.getElementById("account-link");

    if (accountLink) {
        accountLink.addEventListener("click", (event) => {
            event.preventDefault();

            const user = auth.currentUser;

            if (user) {
                window.location.href = "user-account.html";
            } else {
                window.location.href = "login.html";
            }
        });
    } else {
        console.error("Account link not found!");
    }
});
