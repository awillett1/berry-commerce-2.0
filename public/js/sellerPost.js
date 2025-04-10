// sellerPost.js
// Fetches business information from FDRB and displays seller products SPECIFICALLY for that seller.
// To be used with the seller's business page, eg. SellerName.html

import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getStorage, ref as storageRef, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

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

        // find the seller by businessName
        snapshot.forEach((childSnapshot) => {
            const sellerData = childSnapshot.val();
            if (sellerData.businessName === businessName) {
                sellerUid = childSnapshot.key;  // UID
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

            if (sellerNameElement) sellerNameElement.textContent = businessName;
            if (sellerEmailElement && businessEmail) { // add the mailto link
                sellerEmailElement.innerHTML = `<a href="mailto:${businessEmail}" class="email-link">${businessEmail}</a>`;
            }
            if (sellerDescriptionElement) sellerDescriptionElement.textContent = businessDescription || 'No description available';
            // default if not avail

            // if there is a link for instagram
            if (sellerInstaLink) {
                if (instagram) {
                    sellerInstaLink.href = `https://www.instagram.com/${instagram}`; // add the instagram link
                    sellerInstaLink.style.display = 'inline';
                } else {
                    sellerInstaLink.style.display = 'none'; // if not available, hide the link/logo
                }
            }

            // if there is a link for facebook
            if (sellerFbLink) {
                if (facebook) {
                    sellerFbLink.href = `https://www.facebook.com/${facebook}`; // add the facebook link
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

            // create product card content
            productCard.innerHTML = `
                <a href="${productUrl}" class="product-link">
                    <div class="product-image">
                        <img src="${productData.imgURL || 'images/placeholder.png'}" alt="${productData.productName}">
                    </div>
                    <h3 class="product-name">${productData.productName}</h3>
                    <p class="product-price">$${productData.price?.toFixed(2) || 'N/A'}</p>
                    <p class="product-description">${productData.productDesc || 'No description available.'}</p>
                </a>
            `;
            // defaults and alt text if not avail

            productGallery.appendChild(productCard); // add the card to the gallery
        });

    }).catch((error) => {
        console.error("Error fetching products: ", error);
    });
}

// get business name from URL ("businessName.html")
const businessNameFromURL = window.location.pathname.split('/').pop().split('.').shift();
updateSellerPage(businessNameFromURL);
