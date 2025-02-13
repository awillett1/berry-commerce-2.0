import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

document.addEventListener('DOMContentLoaded', async function () {
    const signupForm = document.getElementById("signup-form");
    signupForm.addEventListener('submit', handleCreate);
});

async function handleCreate(event) {
    event.preventDefault();  

    const auth = getAuth(); 

    const email = document.getElementById("email").value;
    const password = document.getElementById("pass").value;
    const confirmPassword = document.getElementById("confirm-pass").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User registered successfully:', user.email);

        window.location.href = 'index.html';
        alert('Registration successful!');
    } catch (error) {
        console.error('Error registering user:', error);

        // Handle registration errors
        if (error.code === 'auth/email-already-in-use') {
            alert('Email address is already in use. Please use a different email or log in.');
        } else {
            alert('Registration failed. Please try again.');
        }
    }
}
