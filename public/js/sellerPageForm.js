// sellerPageForm.js
// Handles form submission and saves seller profile data to FDRB.
// To be used with seller-account.html

import { getDatabase, ref, set } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const db = getDatabase();
const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('seller-page-form').addEventListener('submit', (e) => submitForm(e, user.uid));
    } else {
        console.error("No user is logged in.");
    }
});

// hide instagram/facebook
document.getElementById('business-social').addEventListener('change', function() {
    const instagramDiv = document.getElementById('ifInstagram');
    const facebookDiv = document.getElementById('ifFacebook');

    instagramDiv.style.display = 'none';
    facebookDiv.style.display = 'none';

    // opens if it is selected...
    if (this.value === 'instagram') {
        instagramDiv.style.display = 'block';
    } else if (this.value === 'facebook') {
        facebookDiv.style.display = 'block';
    }
});

function submitForm(e, userId) {
    e.preventDefault();

    // get form values
    const businessName = getInputVal('business-name');
    const businessEmail = getInputVal('business-email');
    const businessDescription = getInputVal('business-description');
    const instagram = getInputVal('instagramHandle');
    const facebook = getInputVal('facebookHandle');

    const timestamp = new Date().toISOString();

    // save data to Firebase
    saveSellerInfo(userId, businessName, businessEmail, businessDescription, instagram, facebook, timestamp);

    updateProfileLink(businessName);

    // reset form
    document.getElementById('seller-page-form').reset();
}

function getInputVal(id) {
    return document.getElementById(id)?.value.trim() || "";
}

function saveSellerInfo(userId, businessName, businessEmail, businessDescription, instagram, facebook, timestamp) {
    const sellerRef = ref(db, `sellers/${userId}`);
    set(sellerRef, {
        businessName,
        businessEmail,
        businessDescription,
        instagram,
        facebook,
        timestamp
    }).then(() => {
        alert('Profile updated successfully!');
    }).catch((error) => {
        console.error('Error updating profile:', error);
    });
}
