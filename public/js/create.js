// create.js
// To be used with the create an account form on create.html
// Handles creating an account, adds users to the default "user" collection.

import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("pass").value.trim();
    const confirmPassword = document.getElementById("confirm-pass").value.trim();

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    try {
        // firebase auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log('User registered successfully:', user.email);

        // store user info under "users collection"
        await setDoc(doc(db, "users", user.uid), {
            email: user.email, 
            id: user.uid, 
            role: "user" // def role
        });

        alert('Registration successful! Redirecting...');
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Error registering user:', error);

        // errors
        if (error.code === 'auth/email-already-in-use') {
            alert('Email address is already in use. Please use a different email or log in.');
        } else {
            alert(`Registration failed: ${error.message}`);
        }
    }
}
