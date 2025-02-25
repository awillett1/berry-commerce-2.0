// contact.js
// To be used with the contact form on contact.html
// Takes the submitted user's input and puts it in the Firebase Realtime Database

import { getDatabase, ref, push, set } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

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

    // save message
    saveMsg(firstName, lastName, email, message);

    // reset form after submission
    document.getElementById('contact-form').reset();
}

// get form values
function getInputVal(id) {
    return document.getElementById(id).value.trim(); 
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
