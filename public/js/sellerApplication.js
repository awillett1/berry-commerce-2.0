// sellerApplication.js
// To be used with the "Become a Seller" form on user-account.html
// Takes the submitted user's input and puts it in the Firebase Realtime Database

import { getDatabase, ref, push, set } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

import { marked } from 'https://cdn.jsdelivr.net/npm/marked@latest/lib/marked.esm.js';
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3.2.5/+esm';;

// firebase stuff
const db = getDatabase();
const sellerApplicationsRef = ref(db, 'sellerApplications');

// handle form submission
document.querySelector('.seller-application-form').addEventListener('submit', submitApplication);

// get values and submit form
function submitApplication(e) {
    e.preventDefault();

    // get all input values from the form
    const businessName = sanitizeInput(getInputVal('business-name'));
    const businessEmail = sanitizeInput(getInputVal('business-email'));
    const businessDescription = sanitizeInput(getInputVal('business-description'));
    const whyJoin = sanitizeInput(getInputVal('why-join'));
    const productsSell = sanitizeInput(getInputVal('products-sell'));
    const role = sanitizeInput(getInputVal('role'));
    const termsAccepted = document.getElementById('terms-conditions').checked;
    const timestamp = new Date().toISOString();

    // save to RDB
    const newApplicationRef = push(sellerApplicationsRef);
    const applicationData = {
        businessName,
        businessEmail,
        businessDescription,
        whyJoin,
        productsSell,
        role,
        termsAccepted,
        timestamp,
        status: 'pending' // default
    };

    set(newApplicationRef, applicationData)
        .then(() => {
            alert('Application submitted successfully!');
            console.log("Application data:", applicationData);
            document.querySelector('.seller-application-form').reset();
        })
        .catch((error) => {
            console.error('Error submitting application:', error);
        });
}

// get input value as id
function getInputVal(id) {
    return document.getElementById(id).value.trim();
}


// sanitize input using DOMPurify
function sanitizeInput(input) {
    return DOMPurify.sanitize(input);
}