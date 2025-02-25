// passwordReset.js
// Strictly handles forgetting password on account side: user-account.html and seller-account.html (password reset)
// Will trigger email to send to user for them to change password

import { getAuth, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const auth = getAuth();

document.getElementById('reset-password-button').addEventListener('click', () => {
    const userEmail = auth.currentUser?.email;

    if (!userEmail) {
        alert('No user is signed in. Please log in first.'); // double check for security, though they should be logged in atp.
        return;
    }
    
    console.log(userEmail);

    sendPasswordResetEmail(auth, userEmail)
        .then(() => {
            alert('Password reset email sent! Check your inbox.');
        })
        .catch((error) => {
            console.error('Error sending password reset email:', error);
            alert(error.message);
        });
});
