// sellerApplication.js
// To be used with the "Become a Seller" form on user-account.html
// Takes the submitted user's input and puts it in the Firebase Realtime Database

import { getDatabase, ref, push, set } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// firebase stuff
const db = getDatabase();
const sellerApplicationsRef = ref(db, 'sellerApplications');

document.querySelector('.seller-application-form').addEventListener('submit', submitApplication);

// get values and submit form
function submitApplication(e) {
    e.preventDefault();

    const businessName = getInputVal('business-name');
    const businessEmail = getInputVal('business-email');
    const businessDescription = getInputVal('business-description');
    const whyJoin = getInputVal('why-join');
    const productsSell = getInputVal('products-sell');
    const role = getInputVal('role');
    const termsAccepted = document.getElementById('terms-conditions').checked; 

    const timestamp = new Date().toISOString(); 

    // save message
    saveApplication(businessName, businessEmail, businessDescription, whyJoin, productsSell, role, termsAccepted, timestamp);

    // reset form after submission
    document.querySelector('.seller-application-form').reset();
}

// get form values
function getInputVal(id) {
    return document.getElementById(id).value.trim();
}

// save message to firebase
function saveApplication(businessName, businessEmail, businessDescription, whyJoin, productsSell, role, termsAccepted, timestamp) {
    const newApplicationRef = push(sellerApplicationsRef);
    set(newApplicationRef, {
        businessName,
        businessEmail,
        businessDescription,
        whyJoin,
        productsSell,
        role,
        termsAccepted,
        timestamp // store timestamp
    }).then(() => {
        alert('Application submitted successfully!');
    }).catch((error) => {
        console.error('Error submitting application:', error);
    });
}
