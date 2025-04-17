// productPost.js
// Get every product from the database and post it to the "Shop All" page.
// To be used in products.html.

import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getStorage, ref as storageRef, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

import { marked } from 'https://cdn.jsdelivr.net/npm/marked@latest/lib/marked.esm.js';
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3.2.5/+esm';

// firebase stuff
const db = getDatabase();
const storage = getStorage();
const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (!user) {
        const notsigned = document.getElementById('not-signed-in');
        notsigned.style.display = 'block';
        notsigned.classList.add('animate__animated', 'animate__fadeIn');
    }
    else { 
        // get every single product from the database
        const productsRef = ref(db, 'products');
        get(productsRef).then((snapshot) => {
            snapshot.forEach((userSnapshot) => {
                const userId = userSnapshot.key;  // Seller's userId
                const products = userSnapshot.val();  // all products for that seller

                // get seller data based on UID
                const sellerRef = ref(db, `sellers/${userId}`);
                get(sellerRef).then((sellerSnapshot) => {
                    if (sellerSnapshot.exists()) {
                        const sellerData = sellerSnapshot.val();
                        const sellerName = sellerData.businessName || 'Unknown Seller';

                        // loop through each product for the seller
                        Object.keys(products).forEach((productId) => {
                            const productData = products[productId];

                            // only add product if its status is "accepted"
                            if (productData.status !== "approved") {
                                return;  // skip it
                            }

                            // make a product url slug for the listing page. combination of the user's id and product id to make sure it does not get mixed up with other products
                            const productUrl = `listing.html?userId=${userId}&productId=${productId}`;

                            // create a product card for each accepted product
                            const productCard = document.createElement('div');
                            productCard.classList.add('product-card');

                            // check if imgURL exists in the product data
                            const productImagePath = productData.imgURL; 
                            const productTag = productData.productTag;

                            const productDescription = productData.productDesc || 'No description available.';
                            const shortDescription = productDescription.length > 40 ? productDescription.slice(0, 40) + '...' : productDescription; // make the description short

                            if (productImagePath) {
                                // get the correct image URL from FB storage
                                const fileRef = storageRef(storage, productImagePath);
                                getDownloadURL(fileRef).then((url) => {
                                    productCard.innerHTML = `
                                        <a href="${productUrl}" class="product-link">
                                            <div class="product-image">
                                                <img src="${url}" alt="${productData.productName}">
                                            </div>
                                            <h3 class="seller-title-products">${sellerName}</h3> 
                                            <h3 class="product-name">${productData.productName}</h3>
                                            <p class="product-price">$${productData.price?.toFixed(2) || 'N/A'}</p>
                                            <p class="product-description">${sanitizeInput(marked.parseInline(shortDescription))}</p>
                                            <div class="product-tag" id="${productTag}" style="display: none;"></d
                                        </a>
                                    `;

                                    // check that product container exists before adding
                                    const productContainer = document.querySelector('#product-container');
                                    if (productContainer) {
                                        productContainer.appendChild(productCard);
                                    } else {
                                        console.error('Product container not found.');
                                    }
                                }).catch((error) => {
                                    console.error("Error fetching image URL:", error);
                                });
                            } else {
                                // if no image URL exists, use the default
                                productCard.innerHTML = `
                                    <a href="${productUrl}" class="product-link">
                                        <div class="product-image">
                                            <img src="images/placeholder.png" alt="${productData.productName}">
                                        </div>
                                        <h3 class="seller-title-products">${sellerName}</h3> 
                                        <h3 class="product-name">${productData.productName}</h3>
                                        <p class="product-price">$${productData.price?.toFixed(2) || 'N/A'}</p>
                                        <p class="product-description">${sanitizeInput(marked.parseInline(shortDescription))}</p>
                                    </a>
                                `;
                                
                                const productContainer = document.querySelector('#product-container');
                                if (productContainer) {
                                    productContainer.appendChild(productCard);
                                } else {
                                    console.error('Product container not found.');
                                }
                            }
                        });
                    } else {
                        console.error('Seller not found for userId:', userId);
                    }
                }).catch((error) => {
                    console.error("Error fetching seller data:", error);
                });
            });
        }).catch((error) => {
            console.error('Error fetching products:', error);
        });
    }
});

// sanitize input using DOMPurify
function sanitizeInput(input) {
    return DOMPurify.sanitize(input);
}