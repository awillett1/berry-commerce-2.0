// sellerLink.js
// Updates the profile link on page load by finding the seller based on UID
// To be used with seller-account.html and listing.html

import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// firebase stuff
const db = getDatabase();
const auth = getAuth();

// automatically update the profile link when the page loads or when user information is updated.
function updateProfileLink() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User authenticated:", user.uid);
            const sellersRef = ref(db, 'sellers');

            get(sellersRef).then((snapshot) => {
                if (snapshot.exists()) {
                    let businessName = null; // initialize businessName

                    snapshot.forEach((childSnapshot) => {
                        const sellerData = childSnapshot.val();
                        if (childSnapshot.key === user.uid) {  // match user UID with seller UID
                            businessName = sellerData.businessName;
                            console.log("Seller found:", businessName);
                        }
                    });

                    if (businessName) {
                        // remove spaces and make lowercase so it works
                        businessName = businessName.replace(/\s+/g, '').toLowerCase();
                        businessName = businessName.replace(/[^a-z0-9]/g, ''); // remove special characters
                        console.log("Formatted business name:", businessName);

                        const profileLinkElement = document.getElementById('profile-link');
                        if (profileLinkElement) {
                            profileLinkElement.href = `${businessName}.html`; // set profile link
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
        } else {
            console.log("User is not authenticated. Profile link update skipped.");
        }
    });
}

// call on page load
window.addEventListener('load', updateProfileLink);

// call after form is updated
document.getElementById('seller-page-form')?.addEventListener('submit', updateProfileLink);
