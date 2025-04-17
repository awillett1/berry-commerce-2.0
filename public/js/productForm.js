// productForm.js
// To be used with seller-account.html.
// Takes product information from the form and uploads it to FRDB.
// Handles product creation, deletion, and editing.

import { getDatabase, ref, push, set, update, remove, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage, deleteObject, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

import { marked } from 'https://cdn.jsdelivr.net/npm/marked@latest/lib/marked.esm.js';
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3.2.5/+esm';

// firebase stuff
const db = getDatabase();
const auth = getAuth();
const storage = getStorage();

let editMode = false;
let currentProductId = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('seller-page-product-form').addEventListener('submit', (e) => submitForm(e, user.uid));
        window.editProduct = (uid, productId) => loadProductForEdit(uid, productId); // if the user is editing
        window.deleteProduct = (uid, productId) => handleDelete(uid, productId); // if the user is deleting
    } else {
        console.error("No user is logged in.");
    }
});

// upload it to FRDB. assumes creation of a new product
async function submitForm(e, userId) {
    e.preventDefault();
    const submitButton = document.getElementById("seller-submit-btn");
    submitButton.disabled = true;

    const productName = sanitizeInput(getInputVal('product-name-seller'));
    const productDesc = sanitizeInput(getInputVal('product-description'));
    let price = getInputVal('product-price');
    const productTag = getInputVal('product-tag');
    const productImage = document.getElementById('product-image').files[0];

    if (!productName || !price) {
        alert('Product Name and Price are required.');
        return submitButton.disabled = false;
    }

    price = parseInt(price);
    if (isNaN(price) || price <= 0) {
        alert('Please enter a valid price.');
        return submitButton.disabled = false;
    }

    price = parseInt(price.toFixed(2));
    const timestamp = new Date().toISOString();

    try {
        let productId = currentProductId || push(ref(db, `products/${userId}`)).key;
        let productData = {
            userId,
            productName,
            productDesc,
            price,
            productTag,
            timestamp,
            status: "pending"
        };

        if (productImage) {
            const maxSizeKB = 100;
            if (productImage.size > maxSizeKB * 1024) {
                alert('Image exceeds 100 KB.');
                return submitButton.disabled = false;
            }
            const storagePath = `productPhotos/${userId}/${productId}/${productImage.name}`;
            const fileRef = storageRef(storage, storagePath);
            await uploadBytes(fileRef, productImage);
            productData.imgURL = await getDownloadURL(fileRef);
        }

        const productRef = ref(db, `products/${userId}/${productId}`);

        // if editing an existing product
        if (editMode) {
            await update(productRef, productData);
            alert('Product updated successfully.');
        } else {
            await set(productRef, productData);
            alert('Product submitted successfully and is pending review.');
        }

        document.getElementById('seller-page-product-form').reset();
        editMode = false;
        currentProductId = null;

        if (typeof fetchProducts === 'function') fetchProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Something went wrong. Try again.');
    }

    submitButton.disabled = false;
}

// load the form with existing product data for editing
async function loadProductForEdit(userId, productId) {
    const productRef = ref(db, `products/${userId}/${productId}`);
    const snapshot = await get(productRef);

    if (snapshot.exists()) {
        const data = snapshot.val();
        document.getElementById('product-name-seller').value = data.productName || '';
        document.getElementById('product-description').value = data.productDesc || '';
        document.getElementById('product-price').value = data.price || '';
        document.getElementById('product-tag').value = data.productTag || '';
        
        // if there's an existing image, display it in the img tag
        if (data.imgURL) {
            // change src
            document.getElementById('existing-product-image').src = data.imgURL;
            document.getElementById('existing-product-image').style.display = 'block';  // show
        } else { // no image avail
            document.getElementById('existing-product-image').src = "images/placeholder.png"; // placeholder image
            document.getElementById('existing-product-image').style.display = 'none'; // hide
        }

        editMode = true;
        currentProductId = productId;
        alert("Now editing product. Submit to save changes.");
    } else {
        alert("Product not found.");
    }
}


// delete a product
async function handleDelete(userId, productId) {
    const confirmed = confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    const productRef = ref(db, `products/${userId}/${productId}`);

    try {
        // gett the product data to access the imgURL
        const snapshot = await get(productRef);
        const productData = snapshot.exists() ? snapshot.val() : null;

        // deletee product data from RDB
        await remove(productRef);
        alert("Product deleted successfully.");

        // delete image from storage if it exists
        if (productData && productData.imgURL) {
            try {
                const imagePath = getImagePathFromURL(productData.imgURL);
                if (imagePath) {
                    const imageRef = storageRef(storage, imagePath);
                    await deleteObject(imageRef);
                    console.log("Image deleted from storage.");
                }
            } catch (err) {
                console.warn("Product deleted but failed to delete image:", err.message);
            }
        }

        if (typeof fetchProducts === 'function') fetchProducts();
    } catch (error) {
        console.error("Error deleting product:", error);
        alert("Error deleting product. Try again.");
    }
}

// get storage path from the img URL
// chat helped me with this one
function getImagePathFromURL(url) {
    try {
        const baseUrl = "https://firebasestorage.googleapis.com/v0/b/";
        const startIndex = url.indexOf(baseUrl);
        if (startIndex === -1) return null;

        const pathStart = url.indexOf("/o/") + 3;
        const pathEnd = url.indexOf("?alt=");
        const encodedPath = url.substring(pathStart, pathEnd);

        const currentUserUid = auth.currentUser.uid;
        console.log("Current User UID:", currentUserUid);
        console.log("Encoded path:", encodedPath);

        const decodedPath = decodeURIComponent(encodedPath);
        console.log("Decoded path:", decodedPath);

        return decodedPath;
    } catch (e) {
        console.error("Error extracting path from URL:", e);
        return null;
    }
}

// get the ids
function getInputVal(id) {
    return document.getElementById(id)?.value.trim() || "";
}

// sanitize input using DOMPurify
function sanitizeInput(input) {
    return DOMPurify.sanitize(input);
}