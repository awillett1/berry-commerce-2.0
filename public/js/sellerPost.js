// sellerPost.js
// Fetches business information from FDRB and displays seller products SPECIFICALLY for that seller.
// To be used with the seller's business page, eg. SellerName.html

import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const db = getDatabase();

function updateSellerPage(businessName) {
    const sellersRef = ref(db, 'sellers');

    get(sellersRef).then((snapshot) => {
        if (!snapshot.exists()) {
            console.log("No data available in sellers section.");
            return;
        }

        let sellerUid = null;

        // Find the seller by businessName
        snapshot.forEach((childSnapshot) => {
            const sellerData = childSnapshot.val();
            // console.log('Seller Data:', sellerData); // debugging
            if (sellerData.businessName === businessName) {
                sellerUid = childSnapshot.key;  // UID
            }
        });

        if (!sellerUid) {
            console.log("No seller found with the specified businessName.");
            return;
        }

        // console.log('Found Seller UID:', sellerUid); // debugging 

        // get seller details using UID
        const sellerRef = ref(db, `sellers/${sellerUid}`);
        get(sellerRef).then((sellerSnapshot) => {
            if (!sellerSnapshot.exists()) {
                console.log("No data available for this seller.");
                return;
            }

            const sellerData = sellerSnapshot.val();
            const { businessEmail, businessDescription, instagram, facebook } = sellerData;

            // Update seller info on page
            const sellerNameElement = document.getElementById('sellerP-name');
            const sellerEmailElement = document.getElementById('sellerP-email');
            const sellerDescriptionElement = document.getElementById('sellerP-description');
            const sellerInstaLink = document.getElementById('sellerP-insta');
            const sellerFbLink = document.getElementById('sellerP-fb');

            if (sellerNameElement) sellerNameElement.textContent = businessName;
            if (sellerEmailElement && businessEmail) {
                sellerEmailElement.innerHTML = `<a href="mailto:${businessEmail}" class="email-link">${businessEmail}</a>`; // automatically adds "mailto:" fn
            }
            if (sellerDescriptionElement) sellerDescriptionElement.textContent = businessDescription || 'No description available';

            // instagram and facebook links. if they were not added in the form, hide them.
            if (sellerInstaLink) {
                if (instagram) {
                    sellerInstaLink.href = `https://www.instagram.com/${instagram}`;
                    sellerInstaLink.style.display = 'inline';
                } else {
                    sellerInstaLink.style.display = 'none';
                }
            }

            if (sellerFbLink) {
                if (facebook) {
                    sellerFbLink.href = `https://www.facebook.com/${facebook}`;
                    sellerFbLink.style.display = 'inline';
                } else {
                    sellerFbLink.style.display = 'none';
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

function updateSellerProducts(sellerUid) {
    
    const productsRef = ref(db, `products/${sellerUid}`); // get all the products associated with that seller's uid.

    get(productsRef).then((snapshot) => {
        if (!snapshot.exists()) {
            console.log("No products available for this seller.");
            return;
        }

        const productGallery = document.querySelector('.product-gallery');
        productGallery.innerHTML = ''; // clear it
        
        snapshot.forEach((productSnapshot) => {
            const productData = productSnapshot.val();
            // console.log('Product Data:', productData); // debugging
        
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
                        <img src="${productData.imageUrl || 'images/placeholder.png'}" alt="${productData.productName}">
                    </div>
                    <h3 class="product-name">${productData.productName}</h3>
                    <p class="product-price">$${productData.price?.toFixed(2) || 'N/A'}</p>
                    <p class="product-description">${productData.productDesc || 'No description available.'}</p>
                </a>
            `;
        
            productGallery.appendChild(productCard); // add card to the gallery
        });
        
    }).catch((error) => {
        console.error("Error fetching products: ", error);
    });
}

// get business name from URL ("businessName.html")
const businessNameFromURL = window.location.pathname.split('/').pop().split('.').shift();
updateSellerPage(businessNameFromURL);
