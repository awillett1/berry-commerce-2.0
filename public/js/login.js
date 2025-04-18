// login.js
// To be used with the login form on login.html
// Handles forgetting password and logging into an account

import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

import { marked } from 'https://cdn.jsdelivr.net/npm/marked@latest/lib/marked.esm.js';
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3.2.5/+esm';

// add listeners
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const resetPasswordLink = document.getElementById('reset-password');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.error("Login form not found!");
    }

    if (resetPasswordLink) {
        resetPasswordLink.addEventListener('click', handlePasswordReset);
    } else {
        console.error("Reset password link not found!");
    }
});

// login form
async function handleLogin(event) {
    event.preventDefault(); 

    const auth = getAuth();
    const email = sanitizeInput(document.getElementById('email').value.trim());
    const password = sanitizeInput(document.getElementById('pass').value.trim());;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        alert(`You have successfully logged in as ${userCredential.user.email}`);

        window.location.href = 'index.html';  
    } catch (error) {
        console.error('Error logging in user:', error);
        alert('Login failed. Please check your credentials and try again.');
    }
}

// reset password email
async function handlePasswordReset(event) {
    event.preventDefault();  
    
    const email = prompt('Please enter your email address to receive a password reset link:');
    
    if (email) {
        const auth = getAuth();
        
        try {
            await sendPasswordResetEmail(auth, email);
            alert('Password reset email sent! Please check your inbox.');
        } catch (error) {
            console.error('Error sending password reset email:', error);
            alert('Error sending password reset email. Please check the email address and try again.');
        }
    } else {
        alert('Please enter a valid email address.');
    }
}

// sanitize input using DOMPurify
function sanitizeInput(input) {
    return DOMPurify.sanitize(input);
}