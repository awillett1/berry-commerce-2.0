// productForm.js
// To be used with seller-account.html.
// Takes product information from the form and uploads it to FRDB.

import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const db = getDatabase();
const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('seller-page-product-form').addEventListener('submit', (e) => submitForm(e, user.uid));
    } else {
        console.error("No user is logged in.");
    }
});

function submitForm(e, userId) {
    e.preventDefault();

    const productName = getInputVal('product-name-seller');
    const productDesc = getInputVal('product-description');
    let price = getInputVal('product-price');

    if (!productName || !price) {
        alert('Product Name and Price are required.');
        return;
    }

    // convert price to a number (float) and validate -> positive number
    price = parseFloat(price);  
    
    if (isNaN(price) || price <= 0) {
        alert('Please enter a valid price for the product.');
        return;
    }

    price = parseFloat(price.toFixed(2));  // eg. 10.00

    const timestamp = new Date().toISOString();

    saveProduct(userId, productName, productDesc, price, timestamp);

    document.getElementById('seller-page-product-form').reset();
}

function getInputVal(id) {
    return document.getElementById(id)?.value.trim() || "";
}

function saveProduct(userId, productName, productDesc, price, timestamp) {
    // save to products database under their UID
    const productRef = push(ref(db, `products/${userId}`));

    set(productRef, {
        userId,
        productName,
        productDesc,
        price,  
        timestamp
    }).then(() => {
        alert('Product uploaded successfully!');
    }).catch((error) => {
        console.error('Error uploading product:', error);
    });
}
