// sellerPost.js
// Fetches business information from FDRB and displays seller products SPECIFICALLY for that seller.
// To be used with the seller's business page, eg. SellerName.html

import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getStorage, ref as storageRef, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

import { marked } from 'https://cdn.jsdelivr.net/npm/marked@latest/lib/marked.esm.js';
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3.2.5/+esm';

// firebase stuff

const db = getDatabase();
const storage = getStorage();

function updateSellerPage(businessName) {
    const sellersRef = ref(db, 'sellers'); // check the sellers database

    get(sellersRef).then((snapshot) => {
        if (!snapshot.exists()) {
            console.log("No data available in sellers section.");
            return;
        }

        let sellerUid = null; // initialize sellerUid
        let actualBusinessName = ""; // business name of seller without spaces/caps

        // find the seller by businessName 
        snapshot.forEach((childSnapshot) => {
            const sellerData = childSnapshot.val();

            // remove spaces/make lowercase for comparison
            const normalBus = businessName.replace(/\s+/g, '').toLowerCase();
            const normalDb = sellerData.businessName.replace(/\s+/g, '').toLowerCase();

            console.log("Normalized URL Business Name:", normalBus); // debugging
            console.log("Normalized Database Business Name:", normalDb); // debugging

            if (normalDb === normalBus) {
                sellerUid = childSnapshot.key;  // UID
                actualBusinessName = sellerData.businessName; // what will be displayed
            }
        });

        if (!sellerUid) { 
            console.log("No seller found with the specified businessName.");
            return;
        }

        // get seller details using UID
        const sellerRef = ref(db, `sellers/${sellerUid}`);
        get(sellerRef).then((sellerSnapshot) => {
            if (!sellerSnapshot.exists()) {
                console.log("No data available for this seller.");
                return;
            }

            const sellerData = sellerSnapshot.val();
            const { businessEmail, businessDescription, instagram, facebook, imgURL } = sellerData;

            // update seller info on page
            // get the ids for each element
            const sellerNameElement = document.getElementById('sellerP-name');
            const sellerEmailElement = document.getElementById('sellerP-email');
            const sellerDescriptionElement = document.getElementById('sellerP-description');
            const sellerInstaLink = document.getElementById('sellerP-insta');
            const sellerFbLink = document.getElementById('sellerP-fb');
            const sellerImgElement = document.getElementById('sellerP-logo');

            if (sellerNameElement) sellerNameElement.textContent = sanitizeInput(actualBusinessName);
            if (sellerEmailElement && businessEmail) { // add the mailto link
                sellerEmailElement.innerHTML = `<a href="mailto:${sanitizeInput(businessEmail)}" class="email-link">${sanitizeInput(businessEmail)}</a>`;
            }
            if (sellerDescriptionElement) {
                const safeHTML = sanitizeInput(marked.parse(businessDescription || 'No description available'));
                sellerDescriptionElement.innerHTML = safeHTML;
            }
            
            // default if not avail

            // if there is a link for instagram
            if (sellerInstaLink) {
                if (instagram) {
                    sellerInstaLink.href = `https://www.instagram.com/${sanitizeInput(instagram)}`; // add the instagram link
                    sellerInstaLink.style.display = 'inline';
                } else {
                    sellerInstaLink.style.display = 'none'; // if not available, hide the link/logo
                }
            }

            // if there is a link for facebook
            if (sellerFbLink) {
                if (facebook) {
                    sellerFbLink.href = `https://www.facebook.com/${sanitizeInput(facebook)}`; // add the facebook link
                    sellerFbLink.style.display = 'inline';
                } else {
                    sellerFbLink.style.display = 'none'; // if not available, hide the link/logo
                }
            }

            // get and display seller logo image from FB storage
            if (imgURL) {
                const imgRef = storageRef(storage, imgURL);
                getDownloadURL(imgRef).then((url) => {
                    if (sellerImgElement) {
                        sellerImgElement.src = url;
                    }
                }).catch((error) => {
                    console.error("Error fetching seller image from Firebase Storage: ", error);
                    if (sellerImgElement) {
                        sellerImgElement.src = 'images/placeholder.png'; // default image if none exists
                    }
                });
            } else {
                if (sellerImgElement) {
                    sellerImgElement.src = 'images/placeholder.png'; // default image if none exists
                }
            }

            // get and display products for this seller
            updateSellerProducts(sellerUid);

             // this was giving me trouble with the timing, so for now listingPost.js only runs when sellerPost.js is done. (hopefully?)
            const listingPostScript = document.getElementById('listingPostScript');
            if (listingPostScript) {
                listingPostScript.removeAttribute('disabled');
                console.log('listingPost.js is now enabled.');
            }

        }).catch((error) => {
            console.error("Error fetching seller details: ", error);
        });
    }).catch((error) => {
        console.error("Error fetching sellers: ", error);
    });
}

// update the products for the seller
function updateSellerProducts(sellerUid) {
    const productsRef = ref(db, `products/${sellerUid}`);

    get(productsRef).then((snapshot) => {
        if (!snapshot.exists()) {
            console.log("No products available for this seller.");
            return;
        }

        const productGallery = document.querySelector('.product-gallery');
        productGallery.innerHTML = ''; // clear it

        snapshot.forEach((productSnapshot) => {
            const productData = productSnapshot.val();

            // only add the product if its status is "accepted"
            if (productData.status !== "approved") {
                return;  // skip it if its not there
            }

            // create product card
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            // make a product url slug for the listing page. combination of the user's id and product id to make sure it does not get mixed up with other products
            // this is so listing.html / listingPost.js can find the right product
            const productUrl = `listing.html?userId=${sellerUid}&productId=${productSnapshot.key}`;

            const productDescription = productData.productDesc || 'No description available.';
            const shortDescription = productDescription.length > 40 ? productDescription.slice(0, 40) + '...' : productDescription;

            // create product card content
            productCard.innerHTML = `
                <a href="${productUrl}" class="product-link">
                    <div class="product-image">
                        <img src="${productData.imgURL || 'images/placeholder.png'}" alt="${sanitizeInput(productData.productName)}">
                    </div>
                    <h3 class="product-name">${sanitizeInput(productData.productName)}</h3>
                    <p class="product-price">$${productData.price?.toFixed(2) || 'N/A'}</p>
                    <p class="product-description">${sanitizeInput(shortDescription)}</p>
                </a>
            `;
            // defaults and alt text if not avail

            productGallery.appendChild(productCard); // add the card to the gallery
        });

    }).catch((error) => {
        console.error("Error fetching products: ", error);
    });
}


// sanitize input using DOMPurify
function sanitizeInput(input) {
    return DOMPurify.sanitize(input);
}

// get business name from URL ("businessName.html")
const businessNameFromURL = window.location.pathname.split('/').pop().split('.').shift().toLowerCase().replace(/\s+/g, '')
console.log("Business name from URL:", businessNameFromURL);
updateSellerPage(businessNameFromURL);
