// productForm.js
// To be used with seller-account.html.
// Takes product information from the form and uploads it to FRDB.

import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// firebase stuff
const db = getDatabase();
const auth = getAuth();
const storage = getStorage();

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('seller-page-product-form').addEventListener('submit', (e) => submitForm(e, user.uid));
    } else {
        console.error("No user is logged in.");
    }
});

// function to handle form submission
async function submitForm(e, userId) {
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

    price = parseFloat(price.toFixed(2));  // e.g., 10.00

    const timestamp = new Date().toISOString();

    // photo stuff (product image)
    const productImage = document.getElementById('product-image').files[0]; // get the file input from the form
    
    let imgURL = "";
    let productId = "";

    try {
        // save the product data to the database and get product ID
        const productRef = push(ref(db, `products/${userId}`));

        // set product data in the database
        await set(productRef, {
            userId,
            productName,
            productDesc,
            price,  
            timestamp,
            status: "pending"  // default
        });

        // get the auto-generated productId from the reference
        productId = productRef.key;

        if (productImage) {
            const maxSizeKB = 100; // 100 KB
            const maxSizeBytes = maxSizeKB * 1024; // bytes

            // keep it small (im broke)
            if (productImage.size > maxSizeBytes) {
                alert('Image size exceeds 100 KB. Please choose a smaller image.');
                return;
            }

            // create storage reference for the image
            const storagePath = `productPhotos/${userId}/${productId}/${productImage.name}`;
            const fileRef = storageRef(storage, storagePath);

            // upload the image to FB storage
            await uploadBytes(fileRef, productImage);

            // get  the image URL after uploading
            imgURL = await getDownloadURL(fileRef);
        }

        // save the product with the image URL
        if (imgURL) {
            await set(ref(db, `products/${userId}/${productId}`), {
                userId,
                productName,
                productDesc,
                price,
                timestamp,
                status: "pending",  // default
                imgURL
            });
        }

        // reset the form
        document.getElementById('seller-page-product-form').reset();
        alert('Your product application has been submitted correctly and is pending review.');
    } catch (error) {
        console.error('Error uploading product or image:', error);
        alert('Error uploading product or image. Please try again.');
    }
}

function getInputVal(id) {
    return document.getElementById(id)?.value.trim() || "";
}
