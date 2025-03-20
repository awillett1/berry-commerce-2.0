// sellerPageForm.js
// To be used with the "Update Your Seller Profile" form on seller-account.html
// Handles form submission, uploads logo to Firebase Storage, and saves profile data to Firebase Realtime Database.

import { getDatabase, ref, set } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const db = getDatabase();
const auth = getAuth();
const storage = getStorage();

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('seller-page-form').addEventListener('submit', (e) => submitForm(e, user.uid));
    } else {
        console.error("No user is logged in.");
    }
});

async function submitForm(e, userId) {
    e.preventDefault();

    // get form values
    const businessName = getInputVal('business-name');
    const businessEmail = getInputVal('business-email');
    const businessDescription = getInputVal('business-description');
    const instagram = getInputVal('instagramHandle');
    const facebook = getInputVal('facebookHandle');
    const logoFile = document.getElementById('business-logo').files[0]; // Get file input

    const timestamp = new Date().toISOString();

    let logoURL = "";
    if (logoFile) {
        try {
            logoURL = await uploadLogo(userId, logoFile);
        } catch (error) {
            console.error('Error uploading logo:', error);
            alert('Error uploading logo. Please try again.');
            return;
        }
    }

    // save
    saveSellerPage(userId, businessName, businessEmail, businessDescription, instagram, facebook, logoURL, timestamp);

    // reset form
    document.getElementById('seller-page-form').reset();
}

function getInputVal(id) {
    return document.getElementById(id)?.value.trim() || "";
}

async function uploadLogo(userId, file) {
    const fileRef = storageRef(storage, `sellerLogos/${userId}/${file.name}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
}

function saveSellerPage(userId, businessName, businessEmail, businessDescription, instagram, facebook, logoURL, timestamp) {
    const sellerPageRef = ref(db, `sellers/${userId}`);

    set(sellerPageRef, {
        businessName,
        businessEmail,
        businessDescription,
        instagram,
        facebook,
        logo: logoURL, // save download URL of logo
        timestamp
    }).then(() => {
        alert('Profile updated successfully!');
    }).catch((error) => {
        console.error('Error updating profile:', error);
    });
}
