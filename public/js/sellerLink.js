// sellerLink.js
// Updates the profile link on page load by finding the seller based on UID

import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const db = getDatabase();
const auth = getAuth();

window.addEventListener('load', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User authenticated:", user.uid);
            updateProfileLink(user.uid);
        } else {
            console.log("User is not authenticated. Profile link update skipped.");
        }
    });
});

function updateProfileLink(userUid) {
    const sellersRef = ref(db, 'sellers');

    get(sellersRef).then((snapshot) => {
        if (snapshot.exists()) {
            let businessName = null;

            snapshot.forEach((childSnapshot) => {
                const sellerData = childSnapshot.val();
                if (childSnapshot.key === userUid) {  // match user UID with seller UID
                    businessName = sellerData.businessName;
                }
            });

            if (businessName) {
                const profileLinkElement = document.getElementById('profile-link');
                if (profileLinkElement) {
                    profileLinkElement.href = `${businessName}.html`; // get to the right seller page here. customized for each business.
                    console.log("Profile link updated:", profileLinkElement.href);
                } else {
                    console.log("Profile link element not found.");
                }
            } else {
                console.log("No seller found for this user UID.");
            }
        } else {
            console.log("No sellers found in the database.");
        }
    }).catch((error) => {
        console.error("Error fetching seller data:", error);
    });
}
