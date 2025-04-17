// sellerPageForm.js
// Handles form submission and saves seller profile data to FDRB.
// To be used with seller-account.html

import { getDatabase, ref, set, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

import { marked } from 'https://cdn.jsdelivr.net/npm/marked@latest/lib/marked.esm.js';
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3.2.5/+esm';

// firebase stuff
const db = getDatabase();
const auth = getAuth();
const storage = getStorage();

onAuthStateChanged(auth, (user) => {
    if (user) {
        const sellerRef = ref(db, `sellers/${user.uid}`);
        get(sellerRef).then((snapshot) => {
            if (snapshot.exists()) {
                const sellerData = snapshot.val();
                // pre-fill the form with the current data
                document.getElementById('business-name').value = sellerData.businessName || '';
                document.getElementById('business-email').value = sellerData.businessEmail || '';
                document.getElementById('business-description').value = sellerData.businessDescription || '';
                document.getElementById('instagramHandle').value = sellerData.instagram || '';
                document.getElementById('facebookHandle').value = sellerData.facebook || '';
                // photo url 
                document.getElementById('business-photo').src = sellerData.imgURL || 'images/placeholder.png';
            }
        }).catch((error) => {
            console.error("Error fetching seller data:", error);
        });

        // event listener for submitting the form
        document.getElementById('seller-page-form').addEventListener('submit', (e) => submitForm(e, user.uid));
    } else {
        console.error("No user is logged in.");
    }
});

// hide instagram/facebook
document.getElementById('business-social').addEventListener('change', function() {
    const instagramDiv = document.getElementById('ifInstagram');
    const facebookDiv = document.getElementById('ifFacebook');

    instagramDiv.style.display = 'none';
    facebookDiv.style.display = 'none';

    // opens if it is selected...
    if (this.value === 'instagram') {
        instagramDiv.style.display = 'block';
    } else if (this.value === 'facebook') {
        facebookDiv.style.display = 'block';
    }
});

async function submitForm(e, userId) {
    e.preventDefault();

    // fetch existing stuff
    const sellerRef = ref(db, `sellers/${userId}`);
    const snapshot = await get(sellerRef);
    let existingData = snapshot.exists() ? snapshot.val() : {};

    // get form values, or use existing data if fields are left blank
    const businessName = sanitizeInput(getInputVal('business-name') || existingData.businessName);
    const businessEmail = sanitizeInput(getInputVal('business-email') || existingData.businessEmail);
    const businessDescription = sanitizeInput(getInputVal('business-description') || existingData.businessDescription);
    const instagram = sanitizeInput(getInputVal('instagramHandle') || existingData.instagram);
    const facebook = sanitizeInput(getInputVal('facebookHandle') || existingData.facebook);
    const timestamp = new Date().toISOString();

    // photo stuff
    let imgURL = existingData.imgURL || ""; // use existing image if not updated
    const fileInput = document.getElementById('business-photo');
    const photoFile = fileInput ? fileInput.files[0] : null;

    if (photoFile) {
        const maxSz = 100; // 100 KB
        const maxBytes = maxSz * 1024; // bytes

        // keep it small bc im broke
        if (photoFile.size > maxBytes) {
            alert('Image size exceeds 100 KB. Please choose a smaller image.');
            return;
        }

        try {
            // ref to FB storage
            const storageRefPath = `sellerPhotos/${userId}/${photoFile.name}`;
            const fileRef = storageRef(storage, storageRefPath);

            // upload it
            await uploadBytes(fileRef, photoFile);
            imgURL = await getDownloadURL(fileRef);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image. Please try again.');
            return;
        }
    }

    // save to FB
    saveSellerInfo(userId, businessName, businessEmail, businessDescription, instagram, facebook, timestamp, imgURL);

    // reset the form
    document.getElementById('seller-page-form').reset();
}


function getInputVal(id) {
    return document.getElementById(id)?.value.trim() || "";
}

function saveSellerInfo(userId, businessName, businessEmail, businessDescription, instagram, facebook, timestamp, imgURL) {
    const sellerRef = ref(db, `sellers/${userId}`);
    const sellerData = {
        businessName,
        businessEmail,
        businessDescription,
        instagram,
        facebook,
        timestamp
    };

    // update imgURL
    if (imgURL) {
        sellerData.imgURL = imgURL;
    }

    set(sellerRef, sellerData).then(() => {
        alert('Profile updated successfully!');
    }).catch((error) => {
        console.error('Error updating profile:', error);
    });
}

// sanitize input using DOMPurify
function sanitizeInput(input) {
    return DOMPurify.sanitize(input);
}