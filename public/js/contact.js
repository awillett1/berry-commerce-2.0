// contact.js
// To be used with the contact form on contact.html
// Takes the submitted user's input and puts it in the Firebase Realtime Database

import { getDatabase, ref, push, set } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

import { marked } from 'https://cdn.jsdelivr.net/npm/marked@latest/lib/marked.esm.js';
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3.2.5/+esm';

// firebase stuff
const db = getDatabase();
const messagesRef = ref(db, 'messages');

document.getElementById('contact-form').addEventListener('submit', submitForm); // listen for form submit

// get values and submit form
function submitForm(e) {
    e.preventDefault();

    var firstName = getInputVal('fn');
    var lastName = getInputVal('ln');
    var email = getInputVal('email-contact');
    var message = getInputVal('help');

    // sanitize input
    firstName - sanitizeInput(firstName);
    lastName = sanitizeInput(lastName);
    email = sanitizeInput(email);
    message = sanitizeMsg(message);

    // save message
    saveMsg(firstName, lastName, email, message);

    // reset form after submission
    document.getElementById('contact-form').reset();
}

// get form values
function getInputVal(id) {
    return document.getElementById(id).value.trim(); 
}

// sanitize input using DOMPurify
function sanitizeInput(input) {
    return DOMPurify.sanitize(input);
}

// sanitize and convert markdown to HTML
function sanitizeMsg(message) {
    const htmlMsg = marked(message); // markdown to html
    return DOMPurify.sanitize(htmlMsg, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'], 
        ALLOWED_ATTR: ['href'] 
    });
}

// save message to firebase
function saveMsg(firstName, lastName, email, message) {
    const newMessageRef = push(messagesRef);
    set(newMessageRef, {
        firstName: firstName,
        lastName: lastName,
        email: email,
        message: message,
        timestamp: new Date().toISOString() // store timestamp
    })
    .then(() => {
        alert('Message sent successfully!');
    })
    .catch((error) => {
        console.error("Error saving message: ", error);
        alert('Error sending message. Please try again.');
    });
}
