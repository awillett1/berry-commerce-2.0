// create.js
// To be used with the create an account form on create.html
// Handles creating an account, adds users to the default "user" collection.

import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, collection } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

import { marked } from 'https://cdn.jsdelivr.net/npm/marked@latest/lib/marked.esm.js';
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3.2.5/+esm';

// firebase stuff
const auth = getAuth();
const db = getFirestore();

// add event listeners to the submit button
document.addEventListener('DOMContentLoaded', function () {
    const signupForm = document.getElementById("signup-form");
    
    if (signupForm) { 
        signupForm.addEventListener('submit', handleCreate);
    }
});

async function handleCreate(event) {
    event.preventDefault();  

    // sanitize everything
    const email = sanitizeInput(document.getElementById("email").value.trim());
    const password = sanitizeInput(document.getElementById("pass").value.trim());
    const confirmPassword = sanitizeInput(document.getElementById("confirm-pass").value.trim());

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    try {
        // firebase auth to create a new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log('User registered successfully:', user.email);

        // store user info under "users" collection (firestore)
        await setDoc(doc(db, "users", user.uid), {
            email: user.email, 
            id: user.uid, 
            role: "user" // default role
        });

        // send a welcome email using the mail collection
        const mailRef = collection(db, "mail");
        await setDoc(doc(mailRef), {
            to: [user.email],
            message: {
                subject: "Welcome to BerryCommerce!",
                html: `<p>Hi ${user.email},</p><p>Thanks for signing up with us!</p>
                    <p>If you have any questions, feel free to contact us at <a href="mailto:berrycommerce@berry.edu">berrycommerce@berry.edu</a>.</p>
                    <p>Thank you for using Berry Commerce!</p>
                    <p>- Berry Commerce Team</p>`
            }
        });

        alert('Registration successful! Redirecting...');
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Error registering user:', error);

        // error handling
        if (error.code === 'auth/email-already-in-use') {
            alert('Email address is already in use. Please use a different email or log in.');
        } else {
            alert(`Registration failed: ${error.message}`);
        }
    }
}

// sanitize input using DOMPurify
function sanitizeInput(input) {
    return DOMPurify.sanitize(input);
}
  